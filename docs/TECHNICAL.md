# Technical guide

Companion to `ARCHITECTURE.md` (rendering/caching strategy) and
`CLAUDE.md` (project conventions). This doc walks a new engineer
through every subsystem that actually exists in the codebase today.

---

## 1. Stack

| Layer         | Reality                                                            |
| ------------- | ------------------------------------------------------------------ |
| Framework     | Next.js 16.2 (App Router, Turbopack)                               |
| UI runtime    | React 19.2 (Server Components by default)                          |
| Styling       | Tailwind CSS v4 — theme tokens in `src/app/globals.css` `@theme`   |
| CMS           | Sanity (`next-sanity`, Studio mounted at `/studio`)                |
| Auth          | Auth.js v5 credentials + magic-link (`jose`-signed JWTs)           |
| Payments      | Paystack (server-verified via `/api/payments/paystack/verify`)     |
| Storage       | Sanity asset pipeline; pCloud for bulk legacy audio                |
| Hosting       | Vercel (one Git branch → one deployment)                           |
| Obs           | Vercel Analytics (wired), Sentry (planned)                         |

`@/*` alias → `src/*`. TypeScript strict, no per-file relaxing.

## 2. Repository layout

```
src/
  app/
    (site)/               # public marketing site, one layout
    (dashboard)/          # gated pastor/office dashboard
    studio/[[...tool]]/   # embedded Sanity Studio
    api/                  # revalidate, draft-mode, auth, payments, search
  components/
    blocks/               # PageBuilder section renderers
    sections/             # homepage/marketing sections (hero, featured msgs…)
    ui/                   # Container, PageHero, PastorAvatar, Motion helpers
    layout/               # Navbar, Footer, SearchDialog
  lib/
    sanity/               # client.ts, image.ts, queries.ts, dashboard-queries.ts
    auth.ts               # Auth.js config
    magic-link.ts         # token sign/verify
  types/sanity.ts         # hand-written projections (source of truth)

sanity/
  schemas/                # document + section + object schemas
scripts/
  import-pcloud.mjs       # bulk audio importer
  import-thumbnails.mjs   # fuzzy-match images → messages
  seed/                   # dev seed (messages, assemblies, pastors, etc.)
docs/                     # this folder
```

## 3. Data fetching pattern

Server components call `sanityFetch` directly. Every query carries:

- a **GROQ query** from `src/lib/sanity/queries.ts`
- a **tags array** (`sanity:page:<slug>`, `sanity:message:list`, …)
- a **revalidate window** aligned with the render matrix in ARCHITECTURE §4

On a Sanity webhook hit (`/api/revalidate`), the route reads
`_type` and `slug.current` from the payload and calls
`revalidateTag()` for the matching tags. No full rebuild.

## 4. Page Builder (three-place registration)

Adding a new section type requires changes in **three** places or
the block will silently disappear:

1. Schema file in `sanity/schemas/sections/<type>.ts`
2. Registered in `sanity/schemas/documents/page.ts` `sections[]`
3. Added to `sectionMap` in `src/components/PageBuilder.tsx`

## 5. Authentication — pastor/office dashboard

Routes live under `src/app/(dashboard)/dashboard/*`. Auth.js config
is in `src/lib/auth.ts`.

Two login flows share one session:

- **Password** — credentials provider. Pastor docs in Sanity carry
  a bcrypt-hashed `passwordHash` (optional).
- **Magic link** — `POST /api/auth/magic-link` issues a jose-signed
  JWT emailed to the pastor. `/dashboard/auth/verify?token=…`
  consumes it and creates the session.

Access is gated by the `dashboardRole` field on the pastor
document — `assembly_lead`, `office_admin`, or `super_admin`.
Role checks live in `src/lib/auth.ts` (`requireRole` /
`requireAssemblyAccess`). All dashboard server components call one
of these at the top of the function.

## 6. Sanity schemas — cheat sheet

| Document         | Purpose                                               |
| ---------------- | ----------------------------------------------------- |
| `siteSettings`   | Singleton. Nav, footer, liveStreamUrl, bank details.  |
| `page`           | CMS page with PageBuilder `sections[]`.               |
| `assembly`       | One per campus. Lead pastor, leaders, service times.  |
| `pastor`         | Person. `dashboardRole` gates login.                  |
| `meeting`        | Recurring meeting (Sunday service, STS, …).           |
| `event`          | One-off event. Registration, payment, custom fields.  |
| `registration`   | A submitted event signup row.                         |
| `message`        | Sermon/teaching. `category` + optional `series`.      |
| `messageCategory`| Two-level tree (Sunday → Sunday Message, Spec → LC…). |
| `series`         | Sermon series with artwork.                           |
| `worshipSession` | Worship recording.                                    |
| `track`          | Lively music track.                                   |
| `tip` / `post`   | Tips and blog posts.                                  |
| `book`           | Shop item (Paystack or external buy URL).             |
| `member`         | Public-facing member registration row.                |
| `assemblyReport` | Weekly/monthly report submitted by a lead pastor.     |

Types for every projection live in `src/types/sanity.ts` — one
source of truth. If you change a GROQ projection, update the
matching type in the same commit.

## 7. pCloud importer

`scripts/import-pcloud.mjs` walks a pCloud folder
(`FMELi Library`), maps top-level folders to `messageCategory`
slugs, parses `<Series> - <Title> - <Preacher>.<ext>` filenames,
derives a date from the trail when the filename has none, and
creates idempotent `message` docs whose `_id` is a deterministic
SHA-1 of the pCloud fileid.

Modes:

- default — `createIfNotExists`
- `--replace` — `createOrReplace`
- `--patch-dates` — setIfMissing only the `date` field; safe for
  re-runs that must not nuke thumbnails

Requires `PCLOUD_ACCESS_TOKEN` (digest-auth login via
`api.pcloud.com/login`, token saved to `~/.pcloud-token`) and
`SANITY_API_WRITE_TOKEN`.

`scripts/import-thumbnails.mjs` — fuzzy-matches image files in a
different pCloud folder to message titles by normalised key
(exact) + word-set containment (fallback).

## 8. Event registration + payment

`POST /api/register` validates the body against the event's
`registrationFields[]` definition, creates a `registration` doc,
and if `payment.enabled`, kicks off Paystack.

`/api/payments/paystack/init` → Paystack hosted checkout →
redirect back → `/api/payments/paystack/verify` (server-to-server
verify, never trust the query-param) → patches the registration
to `status: "confirmed"`.

`parentMeeting` on an event pins it to a recurring meeting
(sub-event relation) — used for sub-conferences of a bigger event.

## 9. Environment variables

All are required in Vercel before the first deploy:

```
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET           # "production"
NEXT_PUBLIC_SANITY_API_VERSION       # "2024-10-01"
SANITY_API_READ_TOKEN                # draft preview
SANITY_API_WRITE_TOKEN               # importer + dashboard writes
SANITY_REVALIDATE_SECRET             # webhook HMAC

# Auth
AUTH_SECRET                          # Auth.js cookie signing
MAGIC_LINK_SECRET                    # jose JWT signing
MAGIC_LINK_ISSUER                    # e.g. "fmeli.org"

# Email (not yet wired)
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM

# Paystack
PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
PAYSTACK_CALLBACK_URL

# pCloud (dev/import only, not needed at runtime)
PCLOUD_ACCESS_TOKEN
```

Never commit `.env.local`. Never log a token.

## 10. Running locally

```bash
npm install
cp .env.local.example .env.local   # fill in
npm run dev                        # http://localhost:3000
npm run lint
```

Seed Sanity with dev content:

```bash
node --env-file=.env.local scripts/seed.mjs
```

## 11. Deployment

Vercel auto-deploys every push to `main`. Preview deployments for
every PR branch. The Sanity Studio at `/studio` is part of the
same Next build — no separate hosting.

Webhook: Sanity project → API → Webhooks → point at
`https://<domain>/api/revalidate` with `SANITY_REVALIDATE_SECRET`
as the signing secret.

## 12. Observability & error budgets

- Vercel Analytics — page views, Core Web Vitals
- Sentry — **not yet wired**; add `@sentry/nextjs` in Phase 4
- Structured logs — use `console.error` with a tag prefix in
  server code; Vercel surfaces these in the Functions log
