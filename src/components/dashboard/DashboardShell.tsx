import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";
import {
  type DashboardSession,
  canSeeAllAssemblies,
} from "@/lib/dashboard/session";
import { SidebarNav } from "./SidebarNav";

const ROLE_LABEL: Record<DashboardSession["role"], string> = {
  assembly_lead: "Assembly Lead",
  office_admin: "Office Admin",
  super_admin: "Super Admin",
};

/**
 * Standard chrome for every /dashboard/* page. Wraps children in a
 * sidebar + header layout with the pastor's identity, scope, and a
 * sign-out button. Server-rendered so we can call signOut() inline.
 */
export function DashboardShell({
  session,
  title,
  description,
  children,
  actions,
}: {
  session: DashboardSession;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const scopeLabel = canSeeAllAssemblies(session)
    ? "Every assembly"
    : session.assemblyCity ?? "No assembly assigned";

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside
        className="hidden border-r p-6 md:flex md:flex-col md:gap-8"
        style={{
          background: "white",
          borderColor: "rgb(11 20 27 / 0.08)",
        }}
      >
        <Link href="/" className="block">
          <p
            className="text-xs font-semibold uppercase tracking-[0.28em]"
            style={{ color: "var(--color-brand-red)" }}
          >
            FMELi
          </p>
          <p
            className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold"
            style={{ color: "var(--color-ink)" }}
          >
            Pastor Dashboard
          </p>
        </Link>

        <SidebarNav />

        <div className="mt-auto space-y-3">
          <div
            className="rounded-lg p-4"
            style={{
              background:
                "color-mix(in srgb, var(--color-brand-blue-ink) 5%, white)",
            }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--color-muted)" }}
            >
              Signed in as
            </p>
            <p
              className="mt-1.5 truncate text-sm font-semibold"
              style={{ color: "var(--color-ink)" }}
            >
              {session.name}
            </p>
            <p
              className="mt-0.5 truncate text-xs"
              style={{ color: "var(--color-ink-soft)" }}
            >
              {ROLE_LABEL[session.role]} · {scopeLabel}
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition hover:scale-[1.01]"
              style={{
                borderColor: "rgb(11 20 27 / 0.12)",
                color: "var(--color-ink)",
              }}
            >
              <LogOut size={12} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-col">
        <header
          className="border-b px-6 py-8 md:px-10 md:py-10"
          style={{
            background: "white",
            borderColor: "rgb(11 20 27 / 0.08)",
          }}
        >
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1
                className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight md:text-4xl"
                style={{ color: "var(--color-ink)" }}
              >
                {title}
              </h1>
              {description && (
                <p
                  className="mt-2 max-w-2xl text-sm md:text-base"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        </header>

        <div className="flex-1 px-6 py-10 md:px-10 md:py-12">{children}</div>
      </main>
    </div>
  );
}
