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
- ✅ Assemblies band (9 campuses)
- ✅ Newsletter CTA (form wired; **SMTP not wired yet**)
- ⏭ Video hero — replace/augment slider with an in-screen video
  loop (pastor praying or brand film)

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
- ✅ `/assemblies` — 9 campuses with lead-pastor overlay cards
- ✅ `/assemblies/[slug]` — details, service times, leaders
- ⏭ **Video intro per assembly** — a short welcome/prayer video
  from the lead pastor, rendered at the top of the campus page
  (new field on `assembly`, new section component)
- ⏭ **Per-assembly special-meeting promo** — when an assembly
  hosts a special meeting, surface it with a hero banner and
  stream link (depends on the event/assembly relation already
  in place via `parentMeeting`)

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
- ✅ `/dashboard/assembly` — edit campus basics (hero image,
  service times, about)
- ✅ `/dashboard/members` — list members of your assembly
- ✅ `/dashboard/reports` — list weekly/monthly reports
- ✅ `/dashboard/reports/new` — submit a new report (attendance,
  finances, highlights, prayer points, etc.)
- ✅ `/dashboard/reports/[id]` — view / comment thread
- ⏭ **Pastor upload of special-meeting promos** — new form to
  create a lightweight "assembly announcement" that the campus
  page will render. Today announcements exist only as events or
  as CMS pages edited in Studio.
- ⏭ **Pastor upload of welcome/prayer video** — per-assembly
  video field + uploader
- ⏭ **Stream URL per assembly** — for locally-hosted special
  meetings; show an embedded player on the campus page when the
  field is populated.
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

## Roadmap — next build

In priority order, based on the current thread:

1. **Video intro on assembly pages.** New `welcomeVideoUrl` +
   optional `welcomeVideoPoster` field on `assembly`; a
   `<VideoHero>` component at the top of `/assemblies/[slug]`.
2. **Per-assembly announcement / special-meeting promo.** New
   `assemblyAnnouncement` doc type referenced to `assembly`,
   with title, body, image, stream URL, starts/ends. Renders as
   a pinned hero on the campus page when active. Authorable from
   the pastor dashboard (new `/dashboard/assembly/announcements`
   route).
3. **Homepage video hero.** Replace (or combine with) the slider.
   Either a muted looping background video or an in-screen
   letterboxed framed video — one hero slot, a caption, a CTA.
4. **SMTP wiring.** Unblocks magic-link emails + free-event
   confirmations + newsletter signups.
5. **Custom domain cutover.** Once content QA passes.
