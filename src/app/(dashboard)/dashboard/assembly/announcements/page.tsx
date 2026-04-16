import Link from "next/link";
import { Plus, Pin, Archive, ExternalLink } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  requireDashboardSession,
  resolveAssemblyScope,
  canSeeAllAssemblies,
} from "@/lib/dashboard/session";
import { client as readClient } from "@/lib/sanity/client";
import { DASH_ASSEMBLIES_LIST_QUERY } from "@/lib/sanity/dashboard-queries";
import { ALL_ANNOUNCEMENTS_FOR_ASSEMBLY } from "@/lib/sanity/queries";
import type { AssemblyOption, AssemblyAnnouncement } from "@/types/sanity";

export const metadata = { title: "Announcements · Dashboard" };

const KIND_LABELS: Record<string, string> = {
  special: "Special meeting",
  event: "Event",
  stream: "Live stream",
  general: "Notice",
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function activeStatus(a: AssemblyAnnouncement): string {
  if (a.isArchived) return "Archived";
  const now = new Date();
  if (a.endsAt && new Date(a.endsAt) < now) return "Ended";
  if (a.startsAt && new Date(a.startsAt) > now) return "Scheduled";
  return "Live";
}

export default async function AnnouncementsListPage({
  searchParams,
}: {
  searchParams: Promise<{ assembly?: string }>;
}) {
  const session = await requireDashboardSession();
  const seeAll = canSeeAllAssemblies(session);
  const { assembly: requestedFromQuery } = await searchParams;

  const assemblies = await readClient.fetch<AssemblyOption[]>(
    DASH_ASSEMBLIES_LIST_QUERY,
  );
  const requestedId =
    requestedFromQuery ??
    (seeAll ? assemblies[0]?._id ?? null : session.assemblyId);
  const assemblyId = resolveAssemblyScope(session, requestedId);

  if (!assemblyId) {
    return (
      <DashboardShell
        session={session}
        title="Announcements"
        description="No assembly is associated with your account."
      >
        <p className="text-sm text-ink-soft">
          Ask the church office to attach you to an assembly so you can post
          announcements for it.
        </p>
      </DashboardShell>
    );
  }

  const rows = await readClient.fetch<AssemblyAnnouncement[]>(
    ALL_ANNOUNCEMENTS_FOR_ASSEMBLY,
    { assemblyId },
  );

  const activeCity = assemblies.find((a) => a._id === assemblyId)?.city;

  return (
    <DashboardShell
      session={session}
      title="Announcements"
      description={`Post a promo for a special meeting, a live stream, or a general notice. These appear at the top of the public ${activeCity ?? "assembly"} page.`}
      actions={
        <Link
          href="/dashboard/assembly/announcements/new"
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-red)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:scale-[1.02]"
        >
          <Plus size={12} />
          New announcement
        </Link>
      }
    >
      {seeAll && assemblies.length > 1 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold uppercase tracking-[0.22em] text-muted">
            Campus
          </span>
          {assemblies.map((a) => (
            <Link
              key={a._id}
              href={`/dashboard/assembly/announcements?assembly=${a._id}`}
              className={
                a._id === assemblyId
                  ? "rounded-full bg-brand-blue-ink px-3 py-1 font-semibold text-white"
                  : "rounded-full border border-ink/12 bg-white px-3 py-1 font-medium text-ink transition hover:border-ink/30"
              }
            >
              {a.city}
            </Link>
          ))}
        </div>
      )}

      {rows && rows.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-ink/8 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink/2 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Kind</th>
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {rows.map((r) => {
                const status = activeStatus(r);
                return (
                  <tr key={r._id} className="hover:bg-ink/2">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {r.isPinned && (
                          <Pin size={12} className="text-brand-gold" />
                        )}
                        {r.isArchived && (
                          <Archive size={12} className="text-muted" />
                        )}
                        <Link
                          href={`/dashboard/assembly/announcements/${r._id}`}
                          className="font-medium text-ink underline-offset-4 hover:text-brand-red hover:underline"
                        >
                          {r.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-soft">
                      {KIND_LABELS[r.kind ?? "general"] ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-ink-soft">
                      {formatDate(r.startsAt)}
                      {r.endsAt && ` → ${formatDate(r.endsAt)}`}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          status === "Live"
                            ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                            : status === "Scheduled"
                              ? "inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"
                              : "inline-flex rounded-full bg-ink/5 px-2.5 py-0.5 text-[11px] font-semibold text-ink-soft"
                        }
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {r.streamUrl && (
                        <a
                          href={r.streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue-ink hover:text-brand-red"
                        >
                          Open <ExternalLink size={11} />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-ink/15 bg-white p-12 text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl text-ink">
            No announcements yet.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Create one to promote a special meeting or surface a live stream
            on the campus page.
          </p>
          <Link
            href="/dashboard/assembly/announcements/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white"
          >
            <Plus size={12} />
            Create announcement
          </Link>
        </div>
      )}
    </DashboardShell>
  );
}
