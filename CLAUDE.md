# CLAUDE.md

Primary reference for Claude Code working in this repository. Read this first
every session. For deeper context see `church-website-spec.docx` (team spec)
and `docs/ARCHITECTURE.md` (scale + rendering plan).

---

## Project

**Church website rebuild.** Replaces the WordPress site at
[fmeli.org](https://fmeli.org/) with a modern, content-managed experience.
Non-technical staff publish pages, sermons, and events through Sanity Studio.
Design is premium and editorial — think sacred, not corporate.

**Target scale:** thousands of concurrent readers on Sunday mornings / live
stream days. Architecture is cache-first to absorb spikes without paging
anyone (see `docs/ARCHITECTURE.md` §3–4).

---

## Stack (reality, not spec)

| Layer        | Choice                          | Notes                                                                                           |
| ------------ | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| Framework    | **Next.js 16.2** (App Router)   | Spec says 14 — repo is 16. `params` and `searchParams` are **Promises** now — `await` them.     |
| UI runtime   | **React 19.2**                  | RSC by default. Add `'use client'` only when you need state, effects, or browser APIs.          |
| Styling      | **Tailwind CSS v4**             | **No `tailwind.config.ts`.** Theme lives in `src/app/globals.css` under the `@theme` directive. |
| CMS          | **Sanity** (`next-sanity`)      | Not yet initialised. Studio will be mounted at `/studio`.                                       |
| Language     | **TypeScript strict**           | `@/*` alias → `src/*`.                                                                          |
| Deployment   | **Vercel** + **Sanity CDN**     |                                                                                                 |
| Obs          | Vercel Analytics + Sentry       | Added in Phase 4.                                                                               |

If any of this changes, update the table **and** `docs/ARCHITECTURE.md`.

---

## Brand system — BLUE / WHITE / RED

> Project owner overrode the spec's navy + gold palette. The logo uses blue,
> white, and red; the site must match. Tune the placeholder hexes below once
> the final logo is committed to `public/logo.svg`.

All tokens are declared in `src/app/globals.css` under `@theme` and consumed
as Tailwind utilities (`bg-brand-blue`, `text-brand-red`, `border-brand-red-soft`).

| Token                      | Placeholder hex | Role                                         |
| -------------------------- | --------------- | -------------------------------------------- |
| `--color-brand-blue`       | `#0B3B8C`       | Primary — hero bgs, navbar, headings         |
| `--color-brand-blue-deep`  | `#061E4D`       | Footer, deep sections                        |
| `--color-brand-blue-soft`  | `#E8EEFB`       | Card accents, hover fills                    |
| `--color-brand-red`        | `#D0202E`       | Accent — CTAs, underlines, highlights        |
| `--color-brand-red-soft`   | `#F6D7DA`       | Soft badges, focus rings                     |
| `--color-brand-white`      | `#FFFFFF`       | Cards, reversed text                         |
| `--color-off-white`        | `#F7F8FB`       | Page background — slight cool tint           |
| `--color-ink`              | `#0A1128`       | Headings, strong text                        |
| `--color-ink-soft`         | `#3C465C`       | Body copy                                    |
| `--color-muted`            | `#8A92A6`       | Captions, metadata, timestamps               |

**Rules**

- Never ship a pure `#000` or `#FFF` body background — use `--color-ink` and `--color-off-white`.
- If you reach for a new colour or size, add it to `@theme` first. Do not hardcode hexes in components.
- Every interactive element must clear WCAG AA contrast against its background.

**Typography**

- Display / H1–H4: **Playfair Display** → `--font-display`
- Body / UI / labels: **Inter** → `--font-body`

Wire both via `next/font/google` in `src/app/layout.tsx`, replacing the
current Geist fonts that came with the template.

---

## Directory target

```
src/
  app/
    (site)/                   # route group — all public pages share this layout
      layout.tsx              # Navbar + Footer, loads siteSettings once
      page.tsx                # Homepage
      sermons/
        page.tsx              # archive
        [slug]/page.tsx       # detail
      events/
        page.tsx
        [slug]/page.tsx
      give/page.tsx
      [slug]/page.tsx         # dynamic CMS pages (About, Contact, …)
    studio/[[...tool]]/page.tsx  # embedded Sanity Studio
    api/
      revalidate/route.ts     # Sanity webhook → revalidateTag()
      draft-mode/route.ts     # editor preview toggle
  components/
    sections/                 # one file per PageBuilder section
    ui/                       # Button, Card, Container, SectionWrapper, Modal
    layout/                   # Navbar, Footer
    PageBuilder.tsx
  lib/
    sanity/
      client.ts               # createClient + sanityFetch
      image.ts                # urlFor()
      queries.ts              # GROQ
      live.ts                 # defineLive for draft preview
    utils.ts                  # cn(), formatters
  types/
    sanity.ts                 # generated by sanity typegen
sanity/
  schemas/
    documents/                # page, sermon, event, pastor, siteSettings, series
    sections/                 # heroBanner, textBlock, imageWithText, callToAction, quoteBlock, teamGrid, sermonGrid, eventsList, mediaEmbed, faq, stats
    objects/                  # seo, link, cta
    index.ts
  sanity.config.ts
```

---

## Page Builder — how it works

A `page` document in Sanity has a `sections[]` array of typed blocks. Each
section `_type` maps to a React component in `src/components/PageBuilder.tsx`.

**Registration rule (the #1 bug source):** every new section type MUST be
registered in **three** places:

1. Its own schema file in `sanity/schemas/sections/`
2. Added to the `sections[]` array in `sanity/schemas/documents/page.ts`
3. Added to the `sectionMap` in `src/components/PageBuilder.tsx`

Miss any one and the block silently disappears from either Studio or the page.

---

## Data fetching conventions

- **Server Components by default.** Call `sanityFetch` directly in the
  component that needs data. Do not pass Sanity data through many layers of
  client components.
- **Tag every query** for on-demand revalidation:
  - `sanity:page:{slug}`, `sanity:sermon:{slug}`, `sanity:event:{slug}`, `sanity:settings`.
- **Default revalidate windows** (override per route only with a reason):
  - marketing pages / CMS `[slug]`: `300s`
  - sermon / event lists: `300s`
  - sermon / event detail: `3600s`
  - homepage: `60s` (announcements need freshness)
- **`generateStaticParams`** for every dynamic route. Ship the last 200
  sermons at build time; older ones render on demand and fill the cache.
- **Images:** always `next/image` with explicit `width`/`height` or
  `fill` + `sizes`. Sanity images: `urlFor(img).width(<actual>).auto('format').url()`.
  Never hot-link a raw Sanity URL.

---

## Conventions

- **`params` is a Promise in Next 16.** Always:
  ```ts
  export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    // …
  }
  ```
- **Links:** `next/link` for internal nav, never plain `<a>`.
- **Spacing:** sections never set their own outer padding. Wrap them in
  `<SectionWrapper>` (owns `py-20 md:py-28` + `max-w-7xl mx-auto px-4`).
- **Transitions:** `transition-all duration-300 ease-out`. No jarring jumps.
- **No new npm dep** without a reason in the commit message. Especially:
  no CSS-in-JS libraries, no global state libs (URL + RSC is enough),
  no UI kits. Radix primitives + `lucide-react` + `framer-motion` only.

---

## Commands

```bash
npm run dev        # Next dev server — http://localhost:3000
npm run build      # production build
npm run lint       # eslint
npm start          # serve the production build locally
# after Sanity is initialised:
npx sanity typegen generate   # regenerate TS types from the schema
```

---

## Environment variables

Create `.env.local` (gitignored) with:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01
SANITY_API_READ_TOKEN=            # server-only, for draft preview
SANITY_REVALIDATE_SECRET=         # shared secret for the Sanity webhook
```

All must be set in Vercel project settings before the first deploy. Never
commit `.env.local`. Never log a token.

---

## Open TODOs / known gaps

- **Logo asset not in repo yet.** `public/` contains only Next.js boilerplate SVGs.
  Drop the final logo at `public/logo.svg` (and a horizontal lockup at
  `public/logo-horizontal.svg`). Tune the colour tokens above to exact logo values.
- Sanity project not yet created — run `npx sanity init` once a project exists
  under the team org.
- Giving platform (Stripe vs church-specific provider) not chosen.
- Content migration from fmeli.org pending schema freeze.

---

## Deviations from `church-website-spec.docx`

| Spec says                      | Reality / decision                                       |
| ------------------------------ | -------------------------------------------------------- |
| Next.js 14                     | Next.js 16.2 — async `params`, new caching defaults      |
| Tailwind v3 config file        | Tailwind v4 — config is in `globals.css` under `@theme`  |
| Navy + gold palette            | **Blue + white + red** (owner directive, matches logo)   |
| `tailwind.config.ts` snippets  | Translate to `@theme` CSS variables                      |
| `createClient({ useCdn: … })`  | Use `next-sanity` + `defineLive` / `sanityFetch` instead |

Keep this list honest — if you intentionally diverge from the spec, add the row.

---

## Team

Wale (Dev / PM · deployment, QA) · Alex (Creative · brand assets) ·
Juwon (Dev · Rails background, onboarding to React) · Emmanuel (UI/UX +
creative · Figma, design system) · Adewunmi (Dev · feature pages) ·
Bolu / Tofunmi / Adeola (UI/UX · layouts, a11y, Studio UX) · Content TBD.

When explaining code, default to framing for someone comfortable with Rails
and new to React — that's the most common reader.
don't co author in your commits please and then commit regularly and make this a learning process for me
