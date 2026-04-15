import Link from "next/link";
import { ArrowRight, Building2, ScrollText, UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  requireDashboardSession,
  canSeeAllAssemblies,
} from "@/lib/dashboard/session";

export const metadata = {
  title: "Dashboard · FMELi",
};

export default async function DashboardHomePage() {
  const session = await requireDashboardSession();
  const scopeLine = canSeeAllAssemblies(session)
    ? "You're an admin — every assembly is in scope."
    : `You're leading ${session.assemblyCity ?? "your assembly"}.`;

  return (
    <DashboardShell
      session={session}
      title={`Welcome, ${session.name.split(" ")[0]}.`}
      description={scopeLine}
    >
      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          icon={<ScrollText size={20} />}
          title="Weekly reports"
          body="Submit this week's attendance, finances, highlights and prayer points."
          href="/dashboard/reports"
        />
        <DashboardCard
          icon={<UsersRound size={20} />}
          title="Members"
          body="Browse, search and add members for your assembly."
          href="/dashboard/members"
        />
        <DashboardCard
          icon={<Building2 size={20} />}
          title="Assembly profile"
          body="Update service times, contact info and the visit-us card."
          href="/dashboard/assembly"
        />
      </section>
    </DashboardShell>
  );
}

function DashboardCard({
  icon,
  title,
  body,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-ink/8 bg-white p-7 transition hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-ink/8 text-brand-blue-ink">
        {icon}
      </span>
      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
        {title}
      </h3>
      <p className="text-sm text-ink-soft">{body}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-red">
        Open
        <ArrowRight
          size={12}
          className="transition group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
