import { Resend } from "resend";

/**
 * Send the dashboard magic-link email via Resend.
 *
 * Returns `{ ok: true }` on success or `{ ok: false, error }` on
 * failure (no key, API error, sandbox restriction, etc.). The
 * caller decides what to do — the login server action falls back
 * to the dev-mode console link when this returns ok: false in
 * development.
 *
 * Configure with:
 *   RESEND_API_KEY=re_xxxxxxxxxxxx                   (required)
 *   RESEND_FROM=FMELi <noreply@fmeli.org>            (optional)
 *
 * Default sender is "FMELi <onboarding@resend.dev>" — Resend's
 * built-in sandbox sender. The sandbox only delivers to the
 * email address tied to your Resend account; for production,
 * verify fmeli.org in the Resend dashboard and set RESEND_FROM
 * to a real address on that domain.
 */

const DEFAULT_FROM = "FMELi <onboarding@resend.dev>";

export type EmailResult =
  | { ok: true }
  | { ok: false; error: string };

export async function sendMagicLinkEmail(
  toEmail: string,
  link: string,
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };

  const from = process.env.RESEND_FROM ?? DEFAULT_FROM;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: toEmail,
      subject: "Your FMELi dashboard sign-in link",
      html: renderHtml(link),
      text: renderText(link),
    });
    if (error) {
      console.error("[auth/email] Resend rejected the send:", error);
      return { ok: false, error: error.message ?? "Resend error" };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[auth/email] Resend threw:", err);
    return { ok: false, error: message };
  }
}

// ────────────────────────────────────────────────────────────
// Email body — kept inline because there's only one template
// and it's short enough to read top-down.
// ────────────────────────────────────────────────────────────

function renderHtml(link: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sign in to FMELi Dashboard</title>
  </head>
  <body style="margin:0;padding:0;background-color:#faf7f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0b141b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#faf7f1;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="540" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border:1px solid rgba(11,20,27,0.08);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:#061e2c;padding:32px 40px;text-align:left;">
                <p style="margin:0;color:#e8a02a;font-size:11px;font-weight:600;letter-spacing:0.28em;text-transform:uppercase;">FMELi · Pastor Dashboard</p>
                <p style="margin:8px 0 0;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:600;">Your sign-in link</p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px 12px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3a4a55;">
                  Tap the button below to sign in to the FMELi pastor dashboard. The link is valid for 10 minutes and can only be used once.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 24px;">
                <a href="${link}" style="display:inline-block;background-color:#6b1b20;color:#ffffff;padding:14px 28px;border-radius:9999px;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;">
                  Sign in to dashboard
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 32px;">
                <p style="margin:0 0 8px;font-size:12px;color:#7b8a94;">Or copy this link into your browser:</p>
                <p style="margin:0;font-size:12px;color:#3a4a55;word-break:break-all;">
                  <a href="${link}" style="color:#3a4a55;text-decoration:underline;">${link}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#faf7f1;padding:24px 40px;border-top:1px solid rgba(11,20,27,0.06);">
                <p style="margin:0;font-size:11px;line-height:1.6;color:#7b8a94;">
                  Didn't request this? You can safely ignore the email — no one will get into the dashboard without clicking the link.
                </p>
                <p style="margin:8px 0 0;font-size:11px;color:#7b8a94;font-style:italic;">
                  Full Manifestation of Eternal Life · Eternal Life Embassy
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText(link: string): string {
  return `FMELi Pastor Dashboard — your sign-in link

Tap the link below to sign in. It's valid for 10 minutes and can only be used once.

${link}

Didn't request this? You can safely ignore the email.

— Full Manifestation of Eternal Life · Eternal Life Embassy
`;
}
