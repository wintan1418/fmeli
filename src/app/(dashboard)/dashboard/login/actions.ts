"use server";

import { lookupPastorByEmail } from "@/lib/auth/lookup-pastor";
import { signMagicLinkToken } from "@/lib/auth/magic-link";

export type LoginActionState = {
  status: "idle" | "sent" | "error";
  message?: string;
  /**
   * Dev-only convenience. When AUTH_EMAIL_PROVIDER is unset (the dev case)
   * we hand the magic link straight back to the page so the pastor can
   * click it without inspecting server logs. In production this is null.
   */
  devLink?: string | null;
};

export async function requestLoginLink(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  if (!email) {
    return { status: "error", message: "Email is required." };
  }

  // Always emit the same generic "check your email" message regardless of
  // whether the email matches a pastor doc. We don't want this endpoint to
  // double as an account-existence oracle.
  const pastor = await lookupPastorByEmail(email);

  if (!pastor) {
    // Log on the server so the office team can see who's hitting it, but
    // never tell the caller. Same UX either way.
    console.warn(
      `[dashboard/login] No dashboard-eligible pastor found for ${email}`,
    );
    return {
      status: "sent",
      message:
        "If that email belongs to an FMELi pastor, a sign-in link is on its way.",
      devLink: null,
    };
  }

  const token = await signMagicLinkToken(pastor.email);
  const baseUrl =
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const link = `${baseUrl.replace(/\/$/, "")}/dashboard/auth/verify?token=${encodeURIComponent(token)}`;

  if (!process.env.AUTH_EMAIL_PROVIDER) {
    // Dev / staging path — surface the link both to the server log and to
    // the page so we can iterate without an SMTP setup.
    console.log(
      `\n🔑 [dashboard] Magic link for ${pastor.email}:\n${link}\n`,
    );
    return {
      status: "sent",
      message:
        "Dev mode — the sign-in link is below. Click it to continue.",
      devLink: link,
    };
  }

  // TODO(prod): when AUTH_EMAIL_PROVIDER is set (resend/smtp/etc.), send
  // the link via the configured provider here. For now we still log it.
  console.log(
    `[dashboard] (no email provider wired) magic link for ${pastor.email}: ${link}`,
  );
  return {
    status: "sent",
    message:
      "If that email belongs to an FMELi pastor, a sign-in link is on its way.",
    devLink: null,
  };
}
