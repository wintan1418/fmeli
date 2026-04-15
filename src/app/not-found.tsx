import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

/**
 * Brand-styled 404 — replaces Next.js's default unbranded one.
 * Lives at src/app/not-found.tsx so it covers BOTH the (site)
 * and (dashboard) route groups.
 */
export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-brand-blue-ink px-6 py-20 text-white">
      {/* Ambient brand glows — same recipe as the page hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-1/4 h-[480px] w-[480px] rounded-full bg-brand-gold/22 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-10%] h-[420px] w-[420px] rounded-full bg-brand-red/30 blur-[160px]"
      />

      <div className="relative w-full max-w-xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-brand-gold">
          <span className="inline-block h-px w-10 bg-brand-gold" />
          404
          <span className="inline-block h-px w-10 bg-brand-gold" />
        </p>

        <h1 className="mt-8 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] md:text-7xl">
          This page took{" "}
          <span className="italic text-brand-gold-soft">a wrong turn</span>
        </h1>

        <p className="mx-auto mt-8 max-w-md text-base leading-7 text-white/75">
          We can&rsquo;t find what you&rsquo;re looking for. The link may have
          moved with the new site, or the page may not exist yet.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-gold px-7 text-sm font-semibold text-brand-blue-ink transition hover:bg-brand-gold-soft hover:shadow-[var(--shadow-glow-gold)]"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <Link
            href="/resources"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-7 text-sm font-medium text-white transition hover:border-brand-gold hover:text-brand-gold"
          >
            <Compass size={16} />
            Browse resources
          </Link>
        </div>
      </div>
    </main>
  );
}
