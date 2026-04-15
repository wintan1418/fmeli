import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { FormBanner } from "@/components/forms";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in · Pastor Dashboard",
};

const ERROR_MESSAGES: Record<string, string> = {
  expired: "That sign-in link has expired or is invalid. Request a fresh one.",
  missing: "No sign-in token was found in the link. Try again.",
};

export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted"
        >
          <ArrowLeft size={12} />
          Back to fmeli.org
        </Link>

        <div className="mt-6 rounded-[var(--radius-card)] border border-ink/8 bg-white p-10 shadow-[0_30px_80px_-30px_rgba(6,30,44,0.25)]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-ink/8 text-brand-blue-ink">
            <ShieldCheck size={20} />
          </div>

          <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-ink">
            Pastor Dashboard
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Enter the email address registered for your assembly. We&rsquo;ll
            send a one-time sign-in link.
          </p>

          {errorMessage && (
            <FormBanner tone="error" message={errorMessage} className="mt-6" />
          )}

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Trouble signing in? Reach the church office at office@fmeli.org.
        </p>
      </div>
    </main>
  );
}
