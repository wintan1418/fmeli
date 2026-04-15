import { NextResponse, type NextRequest } from "next/server";
import { signIn } from "@/auth";
import { verifyMagicLinkToken } from "@/lib/auth/magic-link";

/**
 * Magic-link landing handler.
 *
 * This is a Route Handler (route.ts) and not a Page (page.tsx) on purpose:
 * `signIn()` writes the session cookie, and Next 16 only allows cookie
 * mutation inside Route Handlers and Server Actions — never in a page
 * render. Pages can read cookies but not set them.
 *
 * On a valid token signIn() throws a NEXT_REDIRECT to /dashboard, which
 * Next propagates as the response (with the Set-Cookie header attached).
 * On any failure we redirect back to /dashboard/login with an error code
 * the login form picks up.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(
      new URL("/dashboard/login?error=missing", req.url),
    );
  }

  const verified = await verifyMagicLinkToken(token);
  if (!verified) {
    return NextResponse.redirect(
      new URL("/dashboard/login?error=expired", req.url),
    );
  }

  // signIn re-validates the token AND re-checks the pastor's role in
  // Sanity (see auth.ts → Credentials.authorize). On success it throws
  // a redirect to /dashboard with the session cookie set; we let it
  // propagate. NEXT_REDIRECT is not a failure — never wrap this in try.
  await signIn("credentials", { token, redirectTo: "/dashboard" });

  // Defensive fallback. If signIn ever returns instead of throwing we
  // still want to land somewhere sensible.
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
