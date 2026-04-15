import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

/**
 * Edge middleware for the pastor dashboard gate.
 *
 * Uses the slim `authConfig` (no Sanity client, no jose imports) so the
 * middleware bundle stays edge-safe. The `authorized` callback inside
 * authConfig decides what's allowed; here we just bind it to the matcher
 * that controls which paths run middleware at all.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*"],
};
