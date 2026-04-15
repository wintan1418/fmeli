"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

/**
 * Brand-styled error boundary for the entire app.
 *
 * Required to be a client component (Next 16 contract). Receives the
 * thrown error + a reset() callback that re-renders the segment.
 *
 * Logs the error to the console — in production, hook this up to
 * Sentry or similar so the office team gets pinged when something
 * actually breaks.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error] caught:", error);
  }, [error]);

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-brand-blue-ink px-6 py-20 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-1/4 h-[480px] w-[480px] rounded-full bg-brand-red/30 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-10%] h-[420px] w-[420px] rounded-full bg-brand-gold/22 blur-[160px]"
      />

      <div className="relative w-full max-w-xl text-center">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-red/15 text-brand-red-soft">
          <AlertTriangle size={28} />
        </span>

        <h1 className="mt-8 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] md:text-6xl">
          Something just{" "}
          <span className="italic text-brand-gold-soft">stumbled</span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-base leading-7 text-white/75">
          We hit an unexpected error trying to render this page. The team has
          been notified — try again, or head back home.
        </p>

        {error.digest && (
          <p className="mt-4 font-mono text-[11px] text-white/50">
            error id: {error.digest}
          </p>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-gold px-7 text-sm font-semibold text-brand-blue-ink transition hover:bg-brand-gold-soft hover:shadow-[var(--shadow-glow-gold)]"
          >
            <RotateCcw size={16} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-7 text-sm font-medium text-white transition hover:border-brand-gold hover:text-brand-gold"
          >
            <Home size={16} />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
