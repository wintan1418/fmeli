import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  requireDashboardSession,
  resolveAssemblyScope,
} from "@/lib/dashboard/session";
import { client as readClient } from "@/lib/sanity/client";
import { ANNOUNCEMENT_BY_ID } from "@/lib/sanity/queries";
import type { AssemblyAnnouncement } from "@/types/sanity";
import { AnnouncementForm } from "../AnnouncementForm";
import { DeleteAnnouncementButton } from "./DeleteAnnouncementButton";

export const metadata = { title: "Edit announcement · Dashboard" };

/**
 * Flatten Portable Text body into newline-separated paragraphs so the
 * textarea in the edit form can show what the pastor typed originally.
 * This is a lossy round-trip — any marks / links are dropped — but
 * it's the same contract as the create flow (paragraphs only).
 */
function bodyToText(body?: AssemblyAnnouncement["body"]): string {
  if (!body) return "";
  return body
    .map((block) => {
      if (block._type !== "block") return "";
      const children = (block as unknown as { children?: Array<{ text?: string }> }).children ?? [];
      return children.map((c) => c.text ?? "").join("");
    })
    .filter((t) => t.length > 0)
    .join("\n\n");
}

/**
 * datetime-local inputs need a "YYYY-MM-DDTHH:mm" string. Sanity
 * returns full ISO strings like "2026-04-27T18:00:00Z". Trim the
 * seconds and timezone so the control can read the value back.
 */
function toInputDateTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireDashboardSession();
  const { id } = await params;

  const doc = await readClient.fetch<AssemblyAnnouncement | null>(
    ANNOUNCEMENT_BY_ID,
    { id },
  );
  if (!doc) notFound();

  // Enforce scope — assembly leads can only edit their own
  // assembly's announcements, office/super admins can touch anything.
  const assemblyId = resolveAssemblyScope(session, doc.assembly?._id ?? null);

  return (
    <DashboardShell
      session={session}
      title={doc.title}
      description={`Editing announcement for ${doc.assembly?.city ?? "the assembly"}.`}
      actions={
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/assembly/announcements"
            className="inline-flex items-center gap-2 rounded-full border border-ink/12 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink"
          >
            <ArrowLeft size={12} />
            Back
          </Link>
          <DeleteAnnouncementButton id={doc._id}>
            <Trash2 size={12} />
            Delete
          </DeleteAnnouncementButton>
        </div>
      }
    >
      <AnnouncementForm
        mode="edit"
        assemblyId={assemblyId ?? doc.assembly?._id ?? ""}
        defaults={{
          id: doc._id,
          title: doc.title,
          kind: doc.kind,
          body: bodyToText(doc.body),
          startsAt: toInputDateTime(doc.startsAt),
          endsAt: toInputDateTime(doc.endsAt),
          streamUrl: doc.streamUrl,
          ctaLabel: doc.ctaLabel,
          isPinned: doc.isPinned,
          isArchived: doc.isArchived,
        }}
      />
    </DashboardShell>
  );
}
