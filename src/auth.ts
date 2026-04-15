import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { verifyMagicLinkToken } from "@/lib/auth/magic-link";
import {
  lookupPastorByEmail,
  type PastorIdentity,
} from "@/lib/auth/lookup-pastor";

/**
 * Auth.js v5 — pastor dashboard.
 *
 * Stateless magic-link flow:
 *   1. Pastor enters email at /dashboard/login.
 *   2. A short-lived signed JWT is generated and console.logged in dev
 *      (see /api/dashboard/login). In prod this becomes a real email send.
 *   3. Pastor opens the link → /dashboard/auth/verify hands the token to
 *      this Credentials provider.
 *   4. We verify the JWT, look the pastor up again (so revoked roles take
 *      effect immediately), and emit a session.
 *
 * Why Credentials and not the built-in Email provider?
 *   The Email provider needs a database adapter to persist verification
 *   tokens. We don't want to manage another data store, and Sanity isn't
 *   well-suited to write-heavy ephemeral records. Stateless signed tokens
 *   give us the same UX without the persistence layer.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Magic link",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(creds) {
        const token =
          typeof creds?.token === "string" ? creds.token : null;
        if (!token) return null;

        const verified = await verifyMagicLinkToken(token);
        if (!verified) return null;

        const pastor = await lookupPastorByEmail(verified.email);
        if (!pastor) return null;

        return {
          id: pastor.id,
          name: pastor.name,
          email: pastor.email,
          role: pastor.role,
          assemblyId: pastor.assemblyId,
          assemblyCity: pastor.assemblyCity,
        } satisfies PastorIdentity & { id: string };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        // Auth.js's User type is open-ended; we stash our pastor fields on
        // first sign-in and re-use them on every subsequent request.
        token.pastorId = (user as PastorIdentity & { id: string }).id;
        token.role = (user as PastorIdentity).role;
        token.assemblyId = (user as PastorIdentity).assemblyId;
        token.assemblyCity = (user as PastorIdentity).assemblyCity;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.pastorId = token.pastorId as string | undefined;
        session.user.role = token.role as PastorIdentity["role"] | undefined;
        session.user.assemblyId = token.assemblyId as string | null | undefined;
        session.user.assemblyCity = token.assemblyCity as string | null | undefined;
      }
      return session;
    },
  },
});
