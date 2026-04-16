# Website — feature status

Reader-facing version of "what's done and what's left." Pair this
with `TECHNICAL.md` for the how.

Legend: ✅ live · 🚧 in progress · 🟡 partial / known gap · ⏭ planned

---

## Public site

### Homepage
- ✅ Hero slider — 3 slides, scroll-snap, brand gradients
- ✅ Featured messages grid (3 latest, office can pin via `featured`)
- ✅ Upcoming events rail
- ✅ Meetings grid (Sunday, STS, Vigil, …)
- ✅ Pillars section (brand values)
- ✅ Live stats band
- ✅ Scripture pull-quote
- ✅ Assemblies band (9 assemblies)
- ✅ Newsletter CTA (form wired; **SMTP not wired yet**)
- ✅ Homepage video hero — cinema-framed video slot under the
  welcome note. Office edits URL + copy in siteSettings; YouTube,
  Vimeo, and direct `.mp4` all supported.

### Resources
- ✅ `/resources/messages` — paginated archive (24 per page),
  two-level category chips, year filter, per-category thumbnail
  fallback. ~2,700 messages imported from pCloud.
- ✅ `/resources/messages/[slug]` — detail page, audio player,
  excerpt/notes, transcript
- ✅ `/resources/worship` + slug
- ✅ `/resources/music` + slug
- ✅ `/resources/tips` + slug
- ✅ `/blog` + slug

### Assemblies
- ✅ `/assemblies` — 9 assemblies with lead-pastor overlay cards
- ✅ `/assemblies/[slug]` — details, service times, leaders
- ✅ Per-assembly welcome video (field on `assembly`, rendered
  as a cinema-framed player above the lead-pastor section)
- ✅ Per-assembly announcements — new `assemblyAnnouncement`
  doc type, pinnable, time-windowed, with optional inline live
  stream embedding. Authored from the dashboard, not Studio.

### Events
- ✅ `/events` — upcoming list + all-events tab
- ✅ `/events/[slug]` — hero, description, live counter
  (`registeredCount`)
- ✅ `/events/[slug]/register` — internal registration form with
  dynamic `registrationFields[]`
- ✅ Paystack checkout + server-side verify
- ✅ External registration mode for events run on another platform
- 🟡 Confirmation email — sent only on paid events (Paystack
  callback). Free-event confirmation email is pending SMTP.

### Meetings
- ✅ `/meetings` — list
- ✅ `/meetings/[slug]` — detail with cadence, day, time, image

### Shop
- ✅ `/shop` — book grid, "out of stock" badge
- ✅ `/shop/[slug]` — detail with price / compareAt / Paystack or
  external buy URL

### Give
- ✅ `/give` — bank transfer details (from `siteSettings`)
- ⏭ Online giving (Paystack recurring / one-time widget)

### Live
- ✅ `/live` — YouTube/Mixlr embed from `siteSettings.liveStreamUrl`

### Members
- ✅ `/members/join` — public join form
- ✅ `POST /api/members/register` — Sanity `member` doc

### Dynamic CMS pages
- ✅ `/[slug]` — PageBuilder pages (About, Contact, anything
  staff spins up)
- ✅ 11 section types registered (heroBanner, textBlock,
  imageWithText, cta, quoteBlock, teamGrid, sermonGrid,
  eventsList, mediaEmbed, faq, stats)

### Global
- ✅ Navbar with search (⌘K) + mobile drawer
- ✅ Footer with socials, nav, bank details
- ✅ SEO metadata per page (OpenGraph + Twitter cards)
- ✅ Mobile responsive pass (no horizontal overflow anywhere)
- 🟡 **Accessibility audit** — baseline is WCAG-AA on colour
  contrast; a full keyboard + screen-reader pass is pending
- ⏭ **Site-wide analytics events** — page view only today, no
  custom CTA tracking

---

## Pastor / office dashboard

Lives under `/dashboard`. Auth by Auth.js (credentials +
magic-link). Role-gated via `dashboardRole` on the pastor doc.

- ✅ `/dashboard/login` — password + magic-link
- ✅ `/dashboard/auth/verify` — consume magic-link token
- ✅ `/dashboard` — landing with per-role summary
- ✅ `/dashboard/assembly` — edit assembly basics (hero image,
  service times, about)
- ✅ `/dashboard/members` — list members of your assembly
- ✅ `/dashboard/reports` — list weekly/monthly reports
- ✅ `/dashboard/reports/new` — submit a new report (attendance,
  finances, highlights, prayer points, etc.)
- ✅ `/dashboard/reports/[id]` — view / comment thread
- ✅ `/dashboard/assembly/announcements` — pastor list / create /
  edit / archive / delete announcements for their own assembly
- ✅ Welcome-video uploader on `/dashboard/assembly` (paste a
  YouTube / Vimeo / .mp4 URL + caption)
- ✅ Stream URL per announcement — YouTube / Vimeo links embed
  inline on the assembly page; anything else renders as a CTA
  button.
- 🟡 **Magic-link email delivery** — the token is generated
  correctly and the URL works, but emails are not sent yet
  because SMTP is not wired. Pastors can still log in with their
  password.

---

## Content operations

- ✅ Two-level message categories (Sunday / Wednesday / Special
  Meetings → sub-categories)
- ✅ Bulk audio import from pCloud (2,550+ files)
- ✅ Date back-fill for files with no date in the filename
- ✅ Thumbnail import (fuzzy match)
- ✅ Per-category default thumbnails for the long tail
- 🟡 **118 messages still undated** — folder trail carries no
  year info; office to fix in Studio

---

## Infrastructure

- ✅ Vercel production deploy auto-updates on push to `main`
- ✅ Sanity Studio embedded at `/studio`
- ✅ Sanity webhook → `/api/revalidate` → `revalidateTag()`
- ✅ Paystack keys + callback URL live in Vercel env
- 🟡 **SMTP not wired** — blocks: magic-link emails, event
  confirmation emails for free events, newsletter signups. Any
  transactional email provider works (Resend, Postmark, SES).
  Env vars already reserved in `.env.local`.
- ⏭ Sentry error monitoring (Phase 4 of the architecture plan)
- ⏭ Custom domain `fmeli.org` cutover (Vercel DNS → point A /
  CNAME records; zero-downtime with preview tested first)
- ⏭ Content migration from the legacy WordPress site beyond
  messages (testimonials, archived blog posts, old pages)

---

## Sign-in — what to share with the team

### Sanity Studio (content team, CMS)

- **URL:** `https://fmeli-wintan1418-6959s-projects.vercel.app/studio`
- **Login:** whichever email the team member uses on Sanity. If
  they don't have an account yet:
  1. Go to `https://www.sanity.io/manage`
  2. Sign in as the project owner (the email that created the
     FMELi project).
  3. Pick **FMELi** → **Members** tab → **Invite members** →
     enter their email → role **Editor** (content staff) or
     **Administrator** (another dev).
  4. Sanity emails them an invite; they set their password on
     first sign-in.

### Pastor dashboard (for the 9 assembly leads + office)

- **URL:** `https://fmeli-wintan1418-6959s-projects.vercel.app/dashboard/login`
- **Login:** magic link sent to the email on the pastor doc in
  Sanity. Every assembly lead already has one seeded:

  | Role            | Email                        |
  | --------------- | ---------------------------- |
  | Super admin     | `setman@fmeli.org`           |
  | Lagos lead      | `lagos.lead@fmeli.org`       |
  | Abeokuta lead   | `abeokuta.lead@fmeli.org`    |
  | Ibadan lead     | `ibadan.lead@fmeli.org`      |
  | Akure lead      | `akure.lead@fmeli.org`       |
  | Osogbo lead     | `osogbo.lead@fmeli.org`      |
  | Ife lead        | `ife.lead@fmeli.org`         |
  | Ondo lead       | `ondo.lead@fmeli.org`        |
  | Benin lead      | `benin.lead@fmeli.org`       |
  | Ado lead        | `ado.lead@fmeli.org`         |

  The office will swap these for the pastors' real emails in
  Studio before handing out login links.

- **Generating a one-off login link** (needed until SMTP is
  wired):

  ```bash
  node --env-file=.env.local scripts/make-login-link.mjs \
    <pastor-email> \
    https://fmeli-wintan1418-6959s-projects.vercel.app
  ```

  Prints a 10-minute URL that signs the pastor straight in. Send
  via WhatsApp / SMS / anything — the link itself is the password.

- **Once SMTP is wired** (see Roadmap), pastors just type their
  email at `/dashboard/login` and get the link delivered
  automatically. Until then, use the script above.

---

## Roadmap — next build

In priority order:

1. **SMTP wiring.** Unblocks magic-link emails, free-event
   confirmations, and newsletter signups.
2. **Online giving.** Paystack one-time + recurring on `/give`.
3. **Full a11y audit.** Keyboard + screen-reader pass on every
   public route.
4. **Custom domain cutover** — point `fmeli.org` DNS at Vercel.
5. **Sentry error monitoring** (Phase 4 of the architecture plan).
6. **WordPress content migration** — testimonials, archived
   blog posts, legacy pages that aren't messages or events.
