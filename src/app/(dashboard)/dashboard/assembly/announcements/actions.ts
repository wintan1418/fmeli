"use server";

import { revalidatePath } from "next/cache";
import {
  requireDashboardSession,
  resolveAssemblyScope,
} from "@/lib/dashboard/session";
import { sanityWrite } from "@/lib/sanity/write-client";
import { DASH_ASSEMBLY_SLUG_QUERY } from "@/lib/sanity/dashboard-queries";
import { ANNOUNCEMENT_BY_ID } from "@/lib/sanity/queries";

export type AnnouncementActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  /**
   * When a create succeeds, the new doc's id so the client form can
   * redirect into its edit page.
   */
  id?: string;
};

function txt(form: FormData, key: string): string | undefined {
  const raw = form.get(key);
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}

function bool(form: FormData, key: string): boolean {
  return form.get(key) === "on" || form.get(key) === "true";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

/**
 * Body is a single free-text textarea. We convert it into a minimal
 * Portable Text array so the rich-text renderer on the public page
 * renders paragraphs as expected without needing a full editor in
 * the dashboard.
 */
function bodyToPortableText(
  raw: string | undefined,
): Array<{ _type: "block"; _key: string; style: "normal"; markDefs: []; children: Array<{ _type: "span"; _key: string; text: string; marks: [] }> }> | undefined {
  if (!raw) return undefined;
  const paragraphs = raw
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return paragraphs.map((text, i) => ({
    _type: "block" as const,
    _key: `pb-${Date.now()}-${i}`,
    style: "normal" as const,
    markDefs: [],
    children: [
      {
        _type: "span" as const,
        _key: `ps-${Date.now()}-${i}`,
        text,
        marks: [],
      },
    ],
  }));
}

/**
 * Validate the session can act on this assembly, resolve its slug
 * for cache invalidation, and invalidate the public pages that
 * would render this announcement.
 */
async function invalidateAssembly(assemblyId: string) {
  let slug: string | null = null;
  try {
    const fresh = await sanityWrite("fetch assembly slug", (c) =>
      c.fetch<{ slug?: string }>(DASH_ASSEMBLY_SLUG_QUERY, {
        id: assemblyId,
      }),
    );
    slug = fresh?.slug ?? null;
  } catch {
    // non-fatal
  }
  revalidatePath("/dashboard/assembly/announcements");
  revalidatePath("/assemblies");
  if (slug) revalidatePath(`/assemblies/${slug}`);
}

/**
 * Build the Sanity payload from the form. Used by both create and
 * update so the two server actions stay in sync.
 */
function buildAnnouncementPatch(form: FormData) {
  return {
    title: txt(form, "title"),
    slug: txt(form, "title")
      ? { _type: "slug" as const, current: slugify(txt(form, "title")!) }
      : undefined,
    kind: txt(form, "kind") ?? "special",
    body: bodyToPortableText(txt(form, "body")),
    startsAt: txt(form, "startsAt"),
    endsAt: txt(form, "endsAt"),
    streamUrl: txt(form, "streamUrl"),
    ctaLabel: txt(form, "ctaLabel"),
    isPinned: bool(form, "isPinned"),
    isArchived: bool(form, "isArchived"),
  };
}

export async function createAnnouncement(
  _prev: AnnouncementActionState,
  form: FormData,
): Promise<AnnouncementActionState> {
  const session = await requireDashboardSession();
  const requestedAssemblyId = txt(form, "assemblyId");
  const assemblyId = resolveAssemblyScope(session, requestedAssemblyId);
  if (!assemblyId) {
    return { status: "error", message: "No assembly in scope." };
  }

  const title = txt(form, "title");
  if (!title) {
    return { status: "error", message: "Title is required." };
  }

  const data = buildAnnouncementPatch(form);

  // Strip undefined so createIfNotExists doesn't include null keys.
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  );

  try {
    const created = await sanityWrite("create announcement", (c) =>
      c.create({
        _type: "assemblyAnnouncement",
        ...clean,
        assembly: { _type: "reference", _ref: assemblyId },
        createdBy: { _type: "reference", _ref: session.pastorId },
      } as Record<string, unknown>),
    );
    await invalidateAssembly(assemblyId);
    return {
      status: "success",
      message: "Announcement created.",
      id: created._id,
    };
  } catch (err) {
    console.error("[dashboard/announcements] create failed", err);
    return {
      status: "error",
      message: "Could not save. Please try again.",
    };
  }
}

export async function updateAnnouncement(
  _prev: AnnouncementActionState,
  form: FormData,
): Promise<AnnouncementActionState> {
  const session = await requireDashboardSession();
  const id = txt(form, "id");
  if (!id) return { status: "error", message: "Missing announcement id." };

  // Defence in depth — look up the doc and confirm this session can
  // touch its assembly.
  const existing = await sanityWrite("load announcement", (c) =>
    c.fetch<{ assembly?: { _id?: string } }>(ANNOUNCEMENT_BY_ID, { id }),
  );
  const assemblyId = resolveAssemblyScope(
    session,
    existing?.assembly?._id ?? null,
  );
  if (!assemblyId) {
    return { status: "error", message: "No assembly in scope." };
  }

  const data = buildAnnouncementPatch(form);
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  );

  try {
    await sanityWrite("patch announcement", (c) =>
      c.patch(id).set(clean).commit(),
    );
    await invalidateAssembly(assemblyId);
    return { status: "success", message: "Saved." };
  } catch (err) {
    console.error("[dashboard/announcements] update failed", err);
    return {
      status: "error",
      message: "Could not save. Please try again.",
    };
  }
}

export async function archiveAnnouncement(
  _prev: AnnouncementActionState,
  form: FormData,
): Promise<AnnouncementActionState> {
  const session = await requireDashboardSession();
  const id = txt(form, "id");
  if (!id) return { status: "error", message: "Missing announcement id." };

  const existing = await sanityWrite("load announcement", (c) =>
    c.fetch<{ assembly?: { _id?: string } }>(ANNOUNCEMENT_BY_ID, { id }),
  );
  const assemblyId = resolveAssemblyScope(
    session,
    existing?.assembly?._id ?? null,
  );
  if (!assemblyId) return { status: "error", message: "No scope." };

  const archiving = bool(form, "archive");
  try {
    await sanityWrite("toggle archive", (c) =>
      c.patch(id).set({ isArchived: archiving }).commit(),
    );
    await invalidateAssembly(assemblyId);
    return {
      status: "success",
      message: archiving ? "Announcement archived." : "Announcement restored.",
    };
  } catch {
    return { status: "error", message: "Could not update." };
  }
}

export async function deleteAnnouncement(
  _prev: AnnouncementActionState,
  form: FormData,
): Promise<AnnouncementActionState> {
  const session = await requireDashboardSession();
  const id = txt(form, "id");
  if (!id) return { status: "error", message: "Missing announcement id." };

  const existing = await sanityWrite("load announcement", (c) =>
    c.fetch<{ assembly?: { _id?: string } }>(ANNOUNCEMENT_BY_ID, { id }),
  );
  const assemblyId = resolveAssemblyScope(
    session,
    existing?.assembly?._id ?? null,
  );
  if (!assemblyId) return { status: "error", message: "No scope." };

  try {
    await sanityWrite("delete announcement", (c) => c.delete(id));
    await invalidateAssembly(assemblyId);
    return { status: "success", message: "Deleted." };
  } catch {
    return { status: "error", message: "Could not delete." };
  }
}
