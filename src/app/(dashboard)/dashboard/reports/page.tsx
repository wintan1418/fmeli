import Link from "next/link";
import { Plus, FileText, Users, Banknote, MessageSquare } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  requireDashboardSession,
  canSeeAllAssemblies,
} from "@/lib/dashboard/session";
import { client as readClient } from "@/lib/sanity/client";
import { DASH_REPORTS_LIST_QUERY } from "@/lib/sanity/dashboard-queries";
import type { ReportListRow } from "@/types/sanity";

export const metadata = {
  title: "Weekly reports · Dashboard",
};

const PERIOD_LABEL: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  special: "Special meeting",
};

/** Status badge classes — keyed by the report status enum. */
const STATUS_CLASSES: Record<string, string> = {
  draft: "bg-muted/12 text-muted",
  submitted: "bg-brand-blue-ink/12 text-brand-blue-ink",
  reviewed: "bg-brand-gold/15 text-brand-gold",
  filed: "bg-brand-red/12 text-brand-red",
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default async function ReportsListPage() {
  const session = await requireDashboardSession();
  const seeAll = canSeeAllAssemblies(session);

  // Assembly leads only see their own assembly's reports. We pass the id
  // either way and let the GROQ filter ignore it for admins.
  const reports = await readClient.fetch<ReportListRow[]>(
    DASH_REPORTS_LIST_QUERY,
    {
      seeAll,
      assemblyId: session.assemblyId ?? "",
    },
  );

  return (
    <DashboardShell
      session={session}
      title="Weekly reports"
      description={
        seeAll
          ? "Every assembly's submissions, newest first."
          : `Reports you've submitted for ${session.assemblyCity ?? "your assembly"}.`
      }
      actions={
        session.role === "assembly_lead" ? (
          <Link
            href="/dashboard/reports/new"
            className="inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:scale-[1.02]"
          >
            <Plus size={14} />
            New report
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/12 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Read-only review access
          </span>
        )
      }
    >
      {reports.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white">
          <table className="min-w-full divide-y divide-ink/6">
            <thead className="bg-ink/2">
              <tr>
                <Th>Week of</Th>
                <Th>Period</Th>
                {seeAll && <Th>Assembly</Th>}
                <Th>Attendance</Th>
                <Th>Total giving</Th>
                <Th>Status</Th>
                <Th>Submitted by</Th>
                <Th>Comments</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {reports.map((r) => (
                <tr key={r._id} className="transition hover:bg-ink/2">
                  <Td bold>
                    <Link
                      href={`/dashboard/reports/${r._id}`}
                      className="text-brand-blue-ink underline-offset-2 hover:underline"
                    >
                      {r.weekOf ?? "—"}
                    </Link>
                  </Td>
                  <Td>{PERIOD_LABEL[r.period ?? "weekly"] ?? r.period}</Td>
                  {seeAll && <Td>{r.assemblyCity ?? "—"}</Td>}
                  <Td>{r.attendanceTotal ?? "—"}</Td>
                  <Td>
                    {typeof r.totalGiving === "number" && r.totalGiving > 0
                      ? currency.format(r.totalGiving)
                      : "—"}
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${STATUS_CLASSES[r.status ?? "draft"]}`}
                    >
                      {r.status ?? "draft"}
                    </span>
                  </Td>
                  <Td>{r.submittedByName ?? "—"}</Td>
                  <Td>
                    {r.commentCount && r.commentCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-brand-blue-ink">
                        <MessageSquare size={12} />
                        {r.commentCount}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
      {children}
    </th>
  );
}

function Td({
  children,
  bold = false,
}: {
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <td
      className={`px-5 py-4 text-sm ${bold ? "font-semibold text-ink" : "text-ink-soft"}`}
    >
      {children}
    </td>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-ink/15 p-12 text-center text-ink-soft">
      <FileText size={28} className="mx-auto text-brand-gold" />
      <p className="mt-4 font-[family-name:var(--font-display)] text-2xl text-ink">
        No reports yet
      </p>
      <p className="mt-2 text-sm">
        Submit your first weekly report and it&rsquo;ll appear here.
      </p>
      <div className="mt-6 flex items-center justify-center gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <Users size={12} /> attendance
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Banknote size={12} /> finances
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileText size={12} /> highlights
        </span>
      </div>
    </div>
  );
}
