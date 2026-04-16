#!/usr/bin/env node
/**
 * Issue a magic-link sign-in URL for a dashboard pastor.
 *
 * Until SMTP is wired, the dashboard's "email me a link" flow can't
 * actually deliver. This script mirrors the signing that
 * src/lib/auth/magic-link.ts does server-side, so the office team
 * can generate a link and send it via their own channel (WhatsApp,
 * SMS, whatever) to the pastor who needs to log in.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local scripts/make-login-link.mjs <email> [baseUrl]
 *
 * Examples:
 *   # Production
 *   node --env-file=.env.local scripts/make-login-link.mjs setman@fmeli.org https://fmeli-wintan1418-6959s-projects.vercel.app
 *
 *   # Local dev
 *   node --env-file=.env.local scripts/make-login-link.mjs lagos.lead@fmeli.org
 *
 * Needs:
 *   AUTH_SECRET               — must match the one Vercel uses
 *   NEXT_PUBLIC_SITE_URL      — fallback for the base URL
 *
 * The link expires in 10 minutes — same TTL as the in-app flow.
 */

import { SignJWT } from "jose";

const email = process.argv[2];
const baseUrlArg = process.argv[3];

if (!email) {
  console.error("usage: make-login-link.mjs <email> [baseUrl]");
  process.exit(1);
}

const secret = process.env.AUTH_SECRET;
if (!secret) {
  console.error("AUTH_SECRET is not set. Add it to .env.local first.");
  process.exit(1);
}

const ISSUER = "fmeli-dashboard";
const AUDIENCE = "fmeli-dashboard-magic-link";
const TTL_SECONDS = 60 * 10;

const token = await new SignJWT({ email: email.trim().toLowerCase() })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuer(ISSUER)
  .setAudience(AUDIENCE)
  .setIssuedAt()
  .setExpirationTime(`${TTL_SECONDS}s`)
  .sign(new TextEncoder().encode(secret));

const baseUrl =
  baseUrlArg ??
  process.env.AUTH_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

const link = `${baseUrl.replace(/\/$/, "")}/dashboard/auth/verify?token=${encodeURIComponent(token)}`;

console.log(`\nSign-in link for ${email}:\n`);
console.log(link);
console.log(`\n(expires in ${TTL_SECONDS / 60} minutes)\n`);
