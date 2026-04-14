# Architecture Plan

Companion to `CLAUDE.md` and `church-website-spec.docx`. This document
explains **how the site stays fast and correct at Sunday-morning scale**,
and what the phased rollout looks like.

---

## 1. Goals

- **Beautiful.** Replace the WordPress site at fmeli.org with an editorial,
  modern design that honours the church brand (blue / white / red, premium
  typography, generous whitespace).
- **Self-serve for content.** Non-technical staff publish pages, sermons,
  events, and announcements entirely through Sanity Studio.
- **Fast at scale.** Sub-1s TTFB globally. Lighthouse ≥ 90 on Performance,
  Accessibility, Best Practices, and SEO. Absorb Sunday-morning traffic
  spikes without paging anyone.
- **Safe to evolve.** Section-based Page Builder so new layouts ship without
  engineering involvement.
- **Low operational burden.** Fully managed infrastructure. No servers to
  SSH into, no databases to back up by hand.

## 2. Non-goals (v1)

- User accounts or member logins. Out of scope — delegate to existing tools.
- Real-time chat, comments, or reactions. The livestream is a YouTube embed.
- E-commerce. Giving hands off to a dedicated platform.
- Multi-language. Single locale at launch.

## 3. Load model

| Period                | Concurrent readers | Notes                                           |
| --------------------- | ------------------ | ----------------------------------------------- |
| Weekday baseline      | ~50                | Browsing sermons, reading About pages           |
| Sunday 09:00–13:00    | **1–3k**           | Service attendance + remote watchers            |
| Viral clip / announce | 10× baseline, 2 h  | Social share spike                              |

Read / write ratio ≈ **99.9% read**. Writes are editorial and low-volume.

**Implication:** cache aggressively, generate aggressively, minimise dynamic
work per request. The website should behave like a CDN-served asset for
almost every hit.

## 4. Rendering & caching strategy

### 4.1 Render matrix

| Route                  | Strategy                                            | Revalidate | Why                                       |
| ---------------------- | --------------------------------------------------- | ---------- | ----------------------------------------- |
| `/` (homepage)         | SSG + ISR                                           | `60s`      | Announcements / featured sermon freshness |
| `/sermons`             | SSG + ISR                                           | `300s`     | List view, refresh 12×/hour               |
| `/sermons/[slug]`      | SSG (last 200) + ISR fallback                       | `3600s`    | Notes rarely edited post-publish          |
| `/events`              | SSG + ISR                                           | `300s`     |                                           |
| `/events/[slug]`       | SSG + ISR                                           | `600s`     |                                           |
| `/give`                | Static                                              | manual     | Rarely changes                            |
| `/[slug]` (CMS pages)  | SSG + ISR (`generateStaticParams`)                  | `300s`     | Editors preview via draft mode            |
| `/studio/*`            | Runtime (client bundle)                             | —          | Embedded Sanity Studio                    |
| `/api/revalidate`      | Runtime (edge)                                      | —          | Sanity webhook entry point                |
| `/api/draft-mode`      | Runtime                                             | —          | Editor preview toggle                     |

### 4.2 On-demand revalidation

Editorial workflow must feel instant without giving up ISR's safety net.

```
Sanity publish ──► webhook ──► POST /api/revalidate (signed)
                                  └──► revalidateTag('sanity:page:about')
```

Every GROQ fetch emits tags:

- `sanity:page:{slug}`
- `sanity:sermon:{slug}` / `sanity:sermon:list`
- `sanity:event:{slug}`  / `sanity:event:list`
- `sanity:settings` (navbar, footer, site-wide)

The webhook verifies a shared secret (`SANITY_REVALIDATE_SECRET`) and
dispatches the correct tag(s) based on the document `_type` + `slug` in the
payload.

### 4.3 CDN layers

1. **Vercel Edge** — static HTML and assets served from 30+ POPs.
2. **Sanity CDN (`useCdn: true` for read-only queries)** — document + image
   delivery.
3. **`next/image` optimiser** — transformed images cached at Vercel's edge.

Net effect: almost every request is a cached hit somewhere. Origin work only
happens on revalidate or cache miss. A sermon drop at 10am on Sunday will
warm caches within seconds globally.

## 5. Content model

### 5.1 Documents

| Name            | Kind      | Fields                                                                                   |
| --------------- | --------- | ---------------------------------------------------------------------------------------- |
| `siteSettings`  | singleton | navbar items, footer columns, socials, contact block, default SEO, live-stream embed URL |
| `page`          | document  | `title`, `slug`, `seo`, `sections[]`                                                     |
| `sermon`        | document  | `title`, `slug`, `preacher→`, `series→`, `date`, `youtubeId`, `audioUrl`, `notes`, `scripture`, `tags` |
| `event`         | document  | `title`, `slug`, `startsAt`, `endsAt`, `location`, `heroImage`, `description`, `rsvpUrl` |
| `pastor`        | document  | `name`, `role`, `bio`, `image`, `socials`                                                |
| `sermonSeries`  | document  | `title`, `slug`, `artwork`, `description`                                                |
| `announcement`  | document  | `title`, `body`, `startsOn`, `endsOn`, `visibility` (homepage / banner)                  |

### 5.2 Section objects (Page Builder blocks)

`heroBanner` · `textBlock` · `imageWithText` · `callToAction` · `quoteBlock` ·
`teamGrid` · `sermonGrid` (auto-fetches latest N) · `eventsList` · `faq` ·
`mediaEmbed` (YouTube) · `stats` · `ministryGrid`.

### 5.3 Shared objects

`seo` (title / description / ogImage) · `link` (internal page ref | external
URL | sermon ref | event ref) · `cta` (label + link + style).

### 5.4 Reference integrity

- Page slugs are `unique()` (Sanity validation).
- Deleting a Pastor referenced by sermons is blocked.
- Every section schema has a `preview` so the Studio editor is readable.

### 5.5 Preview / drafts

- Data fetching uses `next-sanity`'s `defineLive` + `sanityFetch`.
- Draft mode toggled from Studio via `/api/draft-mode?secret=…`.
- Draft pages opt out of ISR and stream fresh unpublished content to
  authenticated editors only.

## 6. Component architecture

```
RootLayout (app/layout.tsx)          ← fonts, <html lang>, analytics
└── SiteLayout (app/(site)/layout.tsx)  ← loads siteSettings once
    ├── <Navbar />                      ← client island (mobile menu)
    ├── <main>
    │   └── <PageBuilder sections={…}>   ← Server Component
    │       ├── <HeroBanner />           ← Server (image + text)
    │       ├── <TextBlock />            ← Server (Portable Text)
    │       ├── <SermonGrid />           ← Server (fetches latest)
    │       │   └── <SermonCard />       ← client island (video modal)
    │       └── …
    └── <Footer />                      ← Server
```

Rules:

- **Default to Server Components.** Pages fetch data server-side and pass it
  down. Use `'use client'` only for interactivity (menus, carousels, modals).
- **Shared primitives** (`Button`, `Container`, `SectionWrapper`) enforce
  consistent spacing and let us retheme globally without touching sections.
- **`SectionWrapper`** owns the vertical rhythm (`py-20 md:py-28`) and the
  max-width (`max-w-7xl mx-auto px-4 md:px-6`). Sections never set outer
  padding themselves.
- **No prop drilling** for `siteSettings` — load it once in the site layout
  and pass to Navbar / Footer directly.

## 7. Performance budget

| Metric                     | Budget              |
| -------------------------- | ------------------- |
| HTML (gzipped)             | < 40 KB             |
| JS shipped to browser      | < 120 KB per route  |
| LCP (4G, median device)    | < 2.0 s             |
| CLS                        | < 0.05              |
| TBT                        | < 150 ms            |
| TTFB (cached)              | < 150 ms            |
| Lighthouse (Perf/A11y/BP/SEO) | ≥ 90 each        |

Tactics

- Fonts: `next/font/google`, `display: swap`, `latin` subset only, preload
  only the display weight used in the hero.
- Images: every Sanity image delivered via `urlFor().width(<actual>).auto('format').url()` with explicit `sizes`.
- Third-party scripts: **zero at launch.** Analytics via Vercel Analytics
  (first-party). If GA is later mandated, load via `next/third-parties`.
- Video: YouTube embeds via a lazy façade (click-to-load thumbnail → iframe).
  No YouTube script on initial page load.
- Framer Motion: only in islands that actually animate. Don't lift the
  library into shared layout bundles.

## 8. Security

- All Sanity writes behind Studio auth (Google SSO per team member).
- `SANITY_API_READ_TOKEN` is server-only. Never exposed to the browser.
  Gated behind the `NEXT_PUBLIC_` prefix convention.
- `/api/revalidate` verifies the Sanity webhook signature against
  `SANITY_REVALIDATE_SECRET`; any other call returns 401.
- CSP headers in `next.config.ts`:
  - `default-src 'self'`
  - `img-src 'self' data: https://cdn.sanity.io https://i.ytimg.com`
  - `script-src 'self' 'unsafe-inline' https://www.youtube.com`
  - `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com`
- `npm audit` + Dependabot alerts in CI.
- Any form POST endpoint (contact) rate-limited via Upstash Ratelimit.
- No user-generated content in v1, so XSS surface is small — but Portable
  Text is rendered via `@portabletext/react` with no raw HTML escape hatch.

## 9. Observability

- **Vercel Analytics** — route-level web vitals and traffic.
- **Sentry** (`@sentry/nextjs`) — error capture with source maps uploaded
  at build time. Tag events with Git SHA.
- **Uptime** — Better Stack (or equivalent) ping on `/` every 60s.
- **Sanity webhook logs** — verify revalidate calls succeed; alert on a
  streak of failures.

## 10. Phased rollout

### Phase 0 — Foundations · days 1–3

- Rewrite `globals.css` with brand theme (`@theme` tokens + font variables).
- Swap Geist → Playfair Display + Inter in `src/app/layout.tsx`.
- Replace the boilerplate homepage with a minimal skeleton inside
  `app/(site)/`.
- Install: `next-sanity`, `@sanity/client`, `@sanity/image-url`,
  `@portabletext/react`, `sanity`, `@sanity/vision`, `styled-components`
  (Studio req), `clsx`, `tailwind-merge`, `framer-motion`, `lucide-react`,
  `@radix-ui/react-dialog`.
- `npx sanity init` against a new project, set env vars, embed `/studio`.
- `/api/revalidate` stub returning 200.

### Phase 1 — Content model · days 4–7

- All document / section / object schemas (§5).
- Live preview with `defineLive` + `sanityFetch`.
- Seed fixture content: 1 homepage, 3 CMS pages, 5 sermons, 3 events,
  1 pastor, 1 sermon series, site settings.
- `sanity typegen generate` hooked into `npm run build`.

### Phase 2 — Section components · week 2

- Every section component in §5.2 built against Figma designs.
- `PageBuilder` + section map.
- Primitives: `SectionWrapper`, `Container`, `Button`, `Card`, `Modal`.
- Accessibility pass on primitives (keyboard + screen reader).

### Phase 3 — Feature pages · week 3

- Sermons archive with filters (series, preacher, date range, search).
- Sermon detail with YouTube modal (Radix Dialog + lazy iframe).
- Events list + detail.
- Homepage composition using live CMS content.
- Give page (static layout, iframe or link out depending on provider).

### Phase 4 — Polish + launch · week 4

- `generateMetadata` per route wired to Sanity SEO fields (OG images,
  twitter cards).
- Lighthouse pass — hit every budget in §7.
- Responsive QA: iPhone SE 375px → desktop 1920px.
- `docs/EDITOR_GUIDE.md` handed to the content team.
- Production deploy, DNS cutover, SSL verification, 301 redirects from
  legacy fmeli.org URLs.

## 11. Risks & mitigations

| Risk                                                          | Mitigation                                                                         |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Live-stream traffic spike overwhelms origin                   | Everything pre-rendered; Vercel edge absorbs. YouTube handles the stream itself.   |
| Editors break the homepage with bad content                   | Schema validation + required fields + draft preview before publish                 |
| Sanity project ID / token committed accidentally              | `.env.local` in `.gitignore`, secret scanning on pre-commit                        |
| Designer ↔ dev drift                                          | Figma is source of truth; PageBuilder sections mirror the Figma section library 1:1 |
| Team members at mixed skill levels (Rails-first, UI-first)    | CLAUDE.md onboarding + code-review pairing + TypeScript catching rookie errors      |
| Sanity outage on a Sunday morning                             | Last good HTML is served from Vercel edge cache until `revalidate` succeeds again   |
| Spec drift as Next.js / Tailwind evolve                       | Pin major versions; deliberate upgrade PRs with release notes linked                |

## 12. Open decisions

- Giving provider (Stripe Checkout vs church-specific platform).
- Sermon audio hosting (Sanity asset vs S3 vs provider like Transistor).
- Whether the site needs a search box at launch or just filtering.
- Whether we run a staging Sanity dataset or rely on draft mode alone.

---

Keep this document in lockstep with reality. If a phase slips, update the
timeline. If a decision in §12 is made, move it into the body and delete the
bullet. A plan that doesn't match the code is worse than no plan.
