"use server";

import { revalidatePath } from "next/cache";
import {
  requireDashboardSession,
  resolveAssemblyScope,
} from "@/lib/dashboard/session";
import { sanityWrite } from "@/lib/sanity/write-client";
import { DASH_ASSEMBLY_SLUG_QUERY } from "@/lib/sanity/dashboard-queries";

export type AssemblyActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

function txt(form: FormData, key: string): string | undefined {
  const raw = form.get(key);
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Read the dynamic service-times rows out of the form. The client renders
 * up to N rows, each with `serviceTimes[i].label`, `.day`, `.time`. We
 * skip rows that have no label (treated as empty).
 */
function readServiceTimes(form: FormData) {
  const rows: { _key: string; _type: "object"; label: string; day?: string; time?: string }[] = [];
  for (let i = 0; i < 10; i += 1) {
    const label = txt(form, `serviceTimes.${i}.label`);
    if (!label) continue;
    rows.push({
      _key: `st-${Date.now()}-${i}`,
      _type: "object",
      label,
      day: txt(form, `serviceTimes.${i}.day`),
      time: txt(form, `serviceTimes.${i}.time`),
    });
  }
  return rows;
}

export async function saveAssemblyProfile(
  _prev: AssemblyActionState,
  formData: FormData,
): Promise<AssemblyActionState> {
  const session = await requireDashboardSession();
  const requestedAssemblyId = txt(formData, "assemblyId");
  const assemblyId = resolveAssemblyScope(session, requestedAssemblyId);

  if (!assemblyId) {
    return {
      status: "error",
      message:
        "Pick an assembly to edit (admin role required to change the scope).",
    };
  }

  // Welcome video is an object field. Build the nested object only
  // if a URL is present — otherwise we want to clear the whole field
  // so the public page hides the section.
  const welcomeVideoUrl = txt(formData, "welcomeVideoUrl");
  const welcomeVideoCaption = txt(formData, "welcomeVideoCaption");

  const patch: Record<string, unknown> = {
    tagline: txt(formData, "tagline"),
    address: txt(formData, "address"),
    phone: txt(formData, "phone"),
    email: txt(formData, "email"),
    mapUrl: txt(formData, "mapUrl"),
    serviceTimes: readServiceTimes(formData),
    welcomeVideo: welcomeVideoUrl
      ? {
          url: welcomeVideoUrl,
          caption: welcomeVideoCaption,
        }
      : undefined,
  };

  // Strip undefined keys so we don't accidentally overwrite existing
  // values with null. This is a partial PATCH on a Sanity doc.
  const cleanedPatch = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  );

  // Special case: if the URL was cleared, we also need to unset the
  // whole welcomeVideo object so the public page hides the section.
  const shouldUnsetVideo =
    welcomeVideoUrl === undefined && welcomeVideoCaption === undefined;

  try {
    await sanityWrite("patch assembly", (c) => {
      const p = c.patch(assemblyId).set(cleanedPatch);
      return (shouldUnsetVideo ? p.unset(["welcomeVideo"]) : p).commit();
    });
  } catch (err) {
    console.error("[dashboard/assembly] patch failed", err);
    return {
      status: "error",
      message: "Could not save the changes. Please try again.",
    };
  }

  // Bust both the dashboard cache and the public assemblies pages so
  // edits show up on the public site immediately. We also need to
  // re-fetch the doc to know the slug for the detail page bust.
  let slug: string | null = null;
  try {
    const fresh = await sanityWrite("fetch assembly slug", (c) =>
      c.fetch<{ slug?: string }>(DASH_ASSEMBLY_SLUG_QUERY, {
        id: assemblyId,
      }),
    );
    slug = fresh?.slug ?? null;
  } catch {
    // non-fatal — public page will catch up on next 5-min revalidate
  }
  revalidatePath("/dashboard/assembly");
  revalidatePath("/assemblies");
  if (slug) revalidatePath(`/assemblies/${slug}`);
  return {
    status: "success",
    message: "Saved. The assembly page will refresh shortly.",
  };
}
