import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in · Pastor Dashboard",
};

const ERROR_MESSAGES: Record<string, string> = {
  expired: "That sign-in link has expired or is invalid. Request a fresh one.",
  missing: "No sign-in token was found in the link. Try again.",
};

export default async function DashboardLoginPage(
  { searchParams }: { searchParams: Promise<{ error?: string }> },
) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

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

          {errorMessage && (
            <div
              className="mt-6 flex items-start gap-3 rounded-lg border p-4 text-sm"
              style={{
                background:
                  "color-mix(in srgb, var(--color-brand-red) 6%, white)",
                borderColor:
                  "color-mix(in srgb, var(--color-brand-red) 30%, white)",
                color: "var(--color-brand-red)",
              }}
            >
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

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
