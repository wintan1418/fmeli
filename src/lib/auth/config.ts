import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config.
 *
 * Loaded by `middleware.ts` (which runs on the edge runtime) and re-used
 * inside the full `auth.ts` config. Anything that needs Node-only modules
 * (Sanity client, jose JWT verification, etc.) lives in `auth.ts`, not here.
 */
export const authConfig = {
  pages: {
    signIn: "/dashboard/login",
  },
  providers: [], // real providers wired in auth.ts
  callbacks: {
    authorized({ auth, request }) {
      const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      const isAuthRoute =
        request.nextUrl.pathname.startsWith("/dashboard/login") ||
        request.nextUrl.pathname.startsWith("/dashboard/auth");
      const isLoggedIn = !!auth?.user;

      if (isAuthRoute) return true; // login + verify pages are always reachable
      if (isOnDashboard) return isLoggedIn;
      return true;
    },
  },
} satisfies NextAuthConfig;
