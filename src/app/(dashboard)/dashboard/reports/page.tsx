import Link from "next/link";
import { Plus, FileText, Users, Banknote } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  requireDashboardSession,
  canSeeAllAssemblies,
} from "@/lib/dashboard/session";
import { client as readClient } from "@/lib/sanity/client";

export const metadata = {
  title: "Weekly reports · Dashboard",
};

export const dynamic = "force-dynamic";

type ReportRow = {
  _id: string;
  weekOf?: string;
  period?: string;
  status?: string;
  attendanceTotal?: number | null;
  totalGiving?: number | null;
  assemblyCity?: string | null;
  submittedByName?: string | null;
};

const PERIOD_LABEL: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  special: "Special meeting",
};

const STATUS_TONE: Record<string, string> = {
  draft: "var(--color-muted)",
  submitted: "var(--color-brand-blue-ink)",
  reviewed: "var(--color-brand-gold)",
  filed: "var(--color-brand-red)",
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
  const reports = await readClient.fetch<ReportRow[]>(
    `*[_type == "assemblyReport"
        && ($seeAll == true || assembly._ref == $assemblyId)
      ] | order(weekOf desc)[0...100]{
        _id,
        weekOf,
        period,
        status,
        "attendanceTotal": attendance.total,
        "totalGiving": coalesce(finances.tithe, 0)
                     + coalesce(finances.offering, 0)
                     + coalesce(finances.projects, 0)
                     + coalesce(finances.missions, 0)
                     + coalesce(finances.other, 0),
        "assemblyCity": assembly->city,
        "submittedByName": submittedBy->name
      }`,
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
        <Link
          href="/dashboard/reports/new"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition hover:scale-[1.02]"
          style={{
            background: "var(--color-brand-red)",
            color: "white",
          }}
        >
          <Plus size={14} />
          New report
        </Link>
      }
    >
      {reports.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border bg-white" style={{ borderColor: "rgb(11 20 27 / 0.08)" }}>
          <table className="min-w-full divide-y" style={{ borderColor: "rgb(11 20 27 / 0.06)" }}>
            <thead style={{ background: "rgb(11 20 27 / 0.02)" }}>
              <tr>
                <Th>Week of</Th>
                <Th>Period</Th>
                {seeAll && <Th>Assembly</Th>}
                <Th>Attendance</Th>
                <Th>Total giving</Th>
                <Th>Status</Th>
                <Th>Submitted by</Th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "rgb(11 20 27 / 0.06)" }}>
              {reports.map((r) => (
                <tr key={r._id} className="hover:bg-[color:rgb(11_20_27/0.02)]">
                  <Td bold>{r.weekOf ?? "—"}</Td>
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
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{
                        background: `color-mix(in srgb, ${STATUS_TONE[r.status ?? "draft"]} 12%, white)`,
                        color: STATUS_TONE[r.status ?? "draft"],
                      }}
                    >
                      {r.status ?? "draft"}
                    </span>
                  </Td>
                  <Td>{r.submittedByName ?? "—"}</Td>
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
    <th
      className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em]"
      style={{ color: "var(--color-muted)" }}
    >
      {children}
    </th>
  );
}

function Td({ children, bold = false }: { children: React.ReactNode; bold?: boolean }) {
  return (
    <td
      className="px-5 py-4 text-sm"
      style={{
        color: bold ? "var(--color-ink)" : "var(--color-ink-soft)",
        fontWeight: bold ? 600 : 400,
      }}
    >
      {children}
    </td>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-[var(--radius-card)] border border-dashed p-12 text-center"
      style={{
        borderColor: "rgb(11 20 27 / 0.15)",
        color: "var(--color-ink-soft)",
      }}
    >
      <FileText
        size={28}
        className="mx-auto"
        style={{ color: "var(--color-brand-gold)" }}
      />
      <p
        className="mt-4 font-[family-name:var(--font-display)] text-2xl"
        style={{ color: "var(--color-ink)" }}
      >
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
