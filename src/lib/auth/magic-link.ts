import { SignJWT, jwtVerify } from "jose";

/**
 * Stateless magic-link tokens for the pastor dashboard.
 *
 * We don't run a verification-token table — instead each "magic link" is a
 * short-lived signed JWT carrying just the email. The /dashboard/auth/verify
 * page validates the JWT, looks the pastor up in Sanity, and hands the email
 * to Auth.js's Credentials provider as proof of ownership.
 *
 * Lifetime is intentionally short (10 minutes) so a leaked link is mostly
 * useless. The signing key is AUTH_SECRET, which is also what Auth.js uses
 * for session JWTs.
 */

const TOKEN_TTL_SECONDS = 60 * 10;
const ISSUER = "fmeli-dashboard";
const AUDIENCE = "fmeli-dashboard-magic-link";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Add it to .env.local before issuing magic links.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signMagicLinkToken(email: string): Promise<string> {
  return await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyMagicLinkToken(
  token: string,
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload.email !== "string") return null;
    return { email: payload.email.toLowerCase() };
  } catch {
    return null;
  }
}
