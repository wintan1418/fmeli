import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PortableText, type PortableTextBlock } from "next-sanity";
import type { ReportDetail } from "@/types/sanity";
import {
  ArrowLeft,
  CalendarDays,
  MessageSquare,
  ScrollText,
  Banknote,
  Users,
  ShieldCheck,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  requireDashboardSession,
  canSeeAllAssemblies,
} from "@/lib/dashboard/session";
import { client as readClient } from "@/lib/sanity/client";
import { DASH_REPORT_BY_ID_QUERY } from "@/lib/sanity/dashboard-queries";
import { CommentForm } from "./CommentForm";

export const metadata = {
  title: "Report · Dashboard",
};

const PERIOD_LABEL: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  special: "Special meeting",
};

const ROLE_LABEL: Record<string, string> = {
  assembly_lead: "Assembly Lead",
  office_admin: "Office Admin",
  super_admin: "Super Admin",
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireDashboardSession();
  const { id } = await params;

  const report = await readClient.fetch<ReportDetail | null>(
    DASH_REPORT_BY_ID_QUERY,
    { id },
  );

  if (!report) notFound();

  // Scope check: assembly leads can only see their own assembly's reports.
  const seeAll = canSeeAllAssemblies(session);
  if (!seeAll && report.assemblyId !== session.assemblyId) {
    redirect("/dashboard/reports");
  }

  const totalGiving =
    (report.finances?.tithe ?? 0) +
    (report.finances?.offering ?? 0) +
    (report.finances?.projects ?? 0) +
    (report.finances?.missions ?? 0) +
    (report.finances?.other ?? 0);

  return (
    <DashboardShell
      session={session}
      title={`${report.assemblyCity ?? "Report"} · ${report.weekOf ?? ""}`}
      description={`${PERIOD_LABEL[report.period ?? "weekly"] ?? "Report"} submitted by ${report.submittedByName ?? "—"}.`}
      actions={
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-2 rounded-full border border-ink/12 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition hover:scale-[1.02]"
        >
          <ArrowLeft size={12} />
          Back to reports
        </Link>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Main column */}
        <div className="space-y-8">
          {/* Attendance */}
          <Section icon={<Users size={18} />} title="Attendance">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Stat label="Total" value={report.attendance?.total} large />
              <Stat label="Men" value={report.attendance?.men} />
              <Stat label="Women" value={report.attendance?.women} />
              <Stat label="Youth" value={report.attendance?.youth} />
              <Stat label="Children" value={report.attendance?.children} />
              <Stat
                label="First-timers"
                value={report.attendance?.firstTimers}
              />
              <Stat label="Decisions" value={report.attendance?.decisions} />
            </div>
          </Section>

          {/* Finances */}
          <Section icon={<Banknote size={18} />} title="Finances">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Money label="Tithe" value={report.finances?.tithe} />
              <Money label="Offering" value={report.finances?.offering} />
              <Money label="Projects" value={report.finances?.projects} />
              <Money label="Missions" value={report.finances?.missions} />
              <Money label="Other" value={report.finances?.other} />
            </div>
            <div className="mt-5 flex items-center justify-between rounded-lg bg-brand-blue-ink/6 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                Total giving
              </span>
              <span className="font-[family-name:var(--font-display)] text-2xl font-semibold text-brand-blue-ink">
                {totalGiving > 0 ? currency.format(totalGiving) : "—"}
              </span>
            </div>
            {report.finances?.notes && (
              <p className="mt-4 text-sm italic text-ink-soft">
                {report.finances.notes}
              </p>
            )}
          </Section>

          {/* Narrative */}
          <Section icon={<ScrollText size={18} />} title="Narrative">
            <div className="grid gap-6 md:grid-cols-2">
              <Narrative label="Highlights" value={report.highlights} />
              <Narrative label="Prayer points" value={report.prayerPoints} />
              <Narrative label="Testimonies" value={report.testimonies} />
              <Narrative label="Challenges" value={report.challenges} />
            </div>
            {report.nextWeekFocus && (
              <div className="mt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                  Focus for next week
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  {report.nextWeekFocus}
                </p>
              </div>
            )}
          </Section>
        </div>

        {/* Sidebar: meta + comments */}
        <aside className="space-y-6">
          <div className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
              Report
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
              {report.weekOf ?? "—"}
            </p>
            <dl className="mt-5 space-y-3 text-xs text-ink-soft">
              <Row icon={<CalendarDays size={12} />} label="Period">
                {PERIOD_LABEL[report.period ?? "weekly"] ?? report.period}
              </Row>
              <Row icon={<ShieldCheck size={12} />} label="Status">
                {report.status ?? "draft"}
              </Row>
              <Row icon={<Users size={12} />} label="Assembly">
                {report.assemblyCity ?? "—"}
              </Row>
              <Row icon={<MessageSquare size={12} />} label="Submitted by">
                {report.submittedByName ?? "—"}
              </Row>
            </dl>
          </div>

          {/* Comments thread */}
          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
              Conversation
              {report.comments && report.comments.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted">
                  ({report.comments.length})
                </span>
              )}
            </h3>

            {report.comments && report.comments.length > 0 ? (
              <ul className="space-y-3">
                {report.comments.map((c) => (
                  <li
                    key={c._key}
                    className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-ink">
                        {c.authorName ?? "Pastor"}
                      </p>
                      <span className="rounded-full bg-brand-blue-ink/8 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-brand-blue-ink">
                        {ROLE_LABEL[c.authorRole ?? "assembly_lead"] ??
                          c.authorRole}
                      </span>
                    </div>
                    {c.createdAt && (
                      <p className="mt-1 text-[11px] text-muted">
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    )}
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                      {c.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed border-ink/15 p-5 text-center text-xs text-muted">
                No comments yet. Start the conversation below.
              </p>
            )}

            <CommentForm reportId={report._id} />
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue-ink/8 text-brand-blue-ink">
          {icon}
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  large = false,
}: {
  label: string;
  value?: number;
  large?: boolean;
}) {
  return (
    <div className="rounded-lg bg-ink/2 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p
        className={`mt-2 font-[family-name:var(--font-display)] font-semibold text-ink ${large ? "text-3xl" : "text-2xl"}`}
      >
        {typeof value === "number" ? value : "—"}
      </p>
    </div>
  );
}

function Money({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-lg bg-ink/2 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-ink">
        {typeof value === "number" && value > 0
          ? currency.format(value)
          : "—"}
      </p>
    </div>
  );
}

function Narrative({
  label,
  value,
}: {
  label: string;
  value?: PortableTextBlock[];
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </p>
      <div className="prose prose-sm mt-2 max-w-none text-ink-soft">
        {value && value.length > 0 ? (
          <PortableText value={value} />
        ) : (
          <p className="text-muted">—</p>
        )}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex-shrink-0 text-muted">{icon}</span>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {label}
        </dt>
        <dd className="mt-0.5 capitalize text-ink">{children}</dd>
      </div>
    </div>
  );
}
