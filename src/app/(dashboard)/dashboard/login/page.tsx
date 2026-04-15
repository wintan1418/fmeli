import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in · Pastor Dashboard",
};

export default function DashboardLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--color-muted)" }}
        >
          <ArrowLeft size={12} />
          Back to fmeli.org
        </Link>

        <div
          className="mt-6 rounded-[var(--radius-card)] border bg-white p-10 shadow-[0_30px_80px_-30px_rgba(6,30,44,0.25)]"
          style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
        >
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background:
                "color-mix(in srgb, var(--color-brand-blue-ink) 8%, white)",
              color: "var(--color-brand-blue-ink)",
            }}
          >
            <ShieldCheck size={20} />
          </div>

          <h1
            className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight"
            style={{ color: "var(--color-ink)" }}
          >
            Pastor Dashboard
          </h1>
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Enter the email address registered for your assembly. We&rsquo;ll
            send a one-time sign-in link.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "var(--color-muted)" }}
        >
          Trouble signing in? Reach the church office at office@fmeli.org.
        </p>
      </div>
    </main>
  );
}
