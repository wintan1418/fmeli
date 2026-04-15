import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  Home,
  LogOut,
  ScrollText,
  UsersRound,
} from "lucide-react";
import { auth, signOut } from "@/auth";

export const metadata = {
  title: "Dashboard · FMELi",
};

const ROLE_LABEL: Record<string, string> = {
  assembly_lead: "Assembly Lead",
  office_admin: "Office Admin",
  super_admin: "Super Admin",
};

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user) {
    // Belt-and-braces: middleware already gates this, but if anything
    // upstream lets us through with no session, bounce to login.
    redirect("/dashboard/login");
  }

  const role = session.user.role ?? "assembly_lead";
  const scopeLabel =
    role === "assembly_lead"
      ? session.user.assemblyCity ?? "your assembly"
      : "every assembly";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.28em]"
            style={{ color: "var(--color-brand-red)" }}
          >
            FMELi · Pastor Dashboard
          </p>
          <h1
            className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight md:text-5xl"
            style={{ color: "var(--color-ink)" }}
          >
            Welcome, {session.user.name?.split(" ")[0] ?? "Pastor"}.
          </h1>
          <p
            className="mt-3 text-base"
            style={{ color: "var(--color-ink-soft)" }}
          >
            You&rsquo;re signed in as{" "}
            <strong>{ROLE_LABEL[role] ?? "Pastor"}</strong> with access to{" "}
            <strong>{scopeLabel}</strong>.
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/dashboard/login" });
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition hover:scale-[1.02]"
            style={{
              borderColor: "rgb(11 20 27 / 0.12)",
              color: "var(--color-ink)",
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </form>
      </header>

      {/* Card grid */}
      <section className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          icon={<ScrollText size={20} />}
          title="Weekly report"
          body="Submit this week's attendance, finances, highlights, and prayer points. Coming next."
          href="#"
          disabled
        />
        <DashboardCard
          icon={<UsersRound size={20} />}
          title="Members"
          body="Browse and manage members for your assembly. Coming next."
          href="#"
          disabled
        />
        <DashboardCard
          icon={<Building2 size={20} />}
          title="Assembly profile"
          body="Update service times, contact info, and the lead pastor card. Coming next."
          href="#"
          disabled
        />
      </section>

      <Link
        href="/"
        className="mt-12 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--color-muted)" }}
      >
        <Home size={12} />
        Back to fmeli.org
      </Link>
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  body,
  href,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] border bg-white p-7 transition hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
      style={{
        borderColor: "rgb(11 20 27 / 0.08)",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-full"
        style={{
          background:
            "color-mix(in srgb, var(--color-brand-blue-ink) 8%, white)",
          color: "var(--color-brand-blue-ink)",
        }}
      >
        {icon}
      </span>
      <h3
        className="font-[family-name:var(--font-display)] text-xl font-semibold"
        style={{ color: "var(--color-ink)" }}
      >
        {title}
      </h3>
      <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
        {body}
      </p>
    </div>
  );

  if (disabled) return inner;
  return <Link href={href}>{inner}</Link>;
}
