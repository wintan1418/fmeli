import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { signIn } from "@/auth";
import { verifyMagicLinkToken } from "@/lib/auth/magic-link";

export const metadata = {
  title: "Verifying… · Pastor Dashboard",
};

/**
 * Magic-link landing page.
 *
 * 1. Pulls the signed token out of the query string.
 * 2. Verifies it with jose (does NOT trust client claims).
 * 3. Hands the token to Auth.js's Credentials provider, which re-validates
 *    the token AND re-checks Sanity for the pastor's role. This double
 *    lookup is intentional: a pastor whose role was revoked between
 *    issuing and clicking the link gets denied, even with a valid token.
 * 4. signIn issues the session cookie and redirects to /dashboard.
 */
export default async function VerifyPage(
  { searchParams }: { searchParams: Promise<{ token?: string }> },
) {
  const { token } = await searchParams;

  if (!token) {
    return <VerifyError reason="No sign-in token in the URL." />;
  }

  const verified = await verifyMagicLinkToken(token);
  if (!verified) {
    return (
      <VerifyError reason="This sign-in link has expired or is invalid. Request a fresh one." />
    );
  }

  // signIn throws a redirect on success — that bubbles up through Next's
  // redirect mechanism and lands the pastor on /dashboard.
  await signIn("credentials", {
    token,
    redirectTo: "/dashboard",
  });

  // Defensive fallback: if signIn ever returns instead of throwing, force
  // the redirect ourselves.
  redirect("/dashboard");
}

function VerifyError({ reason }: { reason: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-md rounded-[var(--radius-card)] border bg-white p-10 text-center shadow-[0_30px_80px_-30px_rgba(6,30,44,0.25)]"
        style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
      >
        <div
          className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background:
              "color-mix(in srgb, var(--color-brand-red) 10%, white)",
            color: "var(--color-brand-red)",
          }}
        >
          <AlertCircle size={20} />
        </div>
        <h1
          className="mt-6 font-[family-name:var(--font-display)] text-2xl font-semibold"
          style={{ color: "var(--color-ink)" }}
        >
          Sign-in link unavailable
        </h1>
        <p
          className="mt-3 text-sm"
          style={{ color: "var(--color-ink-soft)" }}
        >
          {reason}
        </p>
        <Link
          href="/dashboard/login"
          className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{
            background: "var(--color-brand-blue-ink)",
            color: "white",
          }}
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
