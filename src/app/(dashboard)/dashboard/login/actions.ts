"use server";

import { lookupPastorByEmail } from "@/lib/auth/lookup-pastor";
import { signMagicLinkToken } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/auth/email";

export type LoginActionState = {
  status: "idle" | "sent" | "error";
  message?: string;
  /**
   * Dev-only convenience. When NODE_ENV=development we hand the magic
   * link straight back to the page so the pastor can click it without
   * inspecting server logs (or when the Resend sandbox blocks the
   * recipient). In production this is always null.
   */
  devLink?: string | null;
};

/**
 * Behaviour matrix:
 *
 *   RESEND_API_KEY set, send succeeds   → no devLink, generic msg
 *   RESEND_API_KEY set, send fails      → devLink in dev, generic in prod
 *   RESEND_API_KEY missing              → devLink in dev, generic in prod
 *
 * The "generic" response is identical regardless of whether the email
 * matches a pastor doc — we don't want this endpoint to double as an
 * account-existence oracle.
 */
export async function requestLoginLink(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  if (!email) {
    return { status: "error", message: "Email is required." };
  }

  const isDev = process.env.NODE_ENV === "development";
  const genericSent = {
    status: "sent" as const,
    message:
      "If that email belongs to an FMELi pastor, a sign-in link is on its way.",
    devLink: null,
  };

  const pastor = await lookupPastorByEmail(email);
  if (!pastor) {
    console.warn(
      `[dashboard/login] No dashboard-eligible pastor found for ${email}`,
    );
    return genericSent;
  }

  const token = await signMagicLinkToken(pastor.email);
  const baseUrl =
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const link = `${baseUrl.replace(/\/$/, "")}/dashboard/auth/verify?token=${encodeURIComponent(token)}`;

  // Try Resend first.
  const sendResult = await sendMagicLinkEmail(pastor.email, link);

  if (sendResult.ok) {
    console.log(`[dashboard/login] Resend sent magic link to ${pastor.email}`);
    return genericSent;
  }

  // Fell through — either no API key, or Resend rejected the send
  // (sandbox can only deliver to the Resend account owner; production
  // domain not yet verified; etc.). Always log the link to the server
  // console so the office team has a fallback. In dev, also surface
  // the link in the response so the developer can click through.
  console.log(
    `\n🔑 [dashboard] Magic link for ${pastor.email}:\n${link}\n` +
      `   (Resend failure: ${sendResult.error})\n`,
  );

  return {
    status: "sent",
    message: isDev
      ? "Email send failed (likely Resend sandbox limits) — dev fallback link below."
      : genericSent.message,
    devLink: isDev ? link : null,
  };
}
