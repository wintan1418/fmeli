# fmeli

Full Manifestation of Eternal Life (FMELi) — Eternal Life Embassy.
The official website rebuild for FMELi across its nine assemblies in Nigeria.

**Stack**

- Next.js 16 (App Router) · React 19 · TypeScript strict
- Tailwind CSS v4 (theme in `src/app/globals.css`)
- Sanity CMS — embedded Studio at `/studio`
- Hosted on Vercel with on-demand revalidation via Sanity webhooks

## Getting started

```bash
npm install
npm run dev           # http://localhost:3000 (or pass -p 8000)
```

## Environment variables (`.env.local`)

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01
SANITY_API_READ_TOKEN=         # server-only, draft preview
SANITY_API_WRITE_TOKEN=        # server-only, event registration writes
SANITY_REVALIDATE_SECRET=      # Sanity webhook shared secret
```

## Docs

- [`CLAUDE.md`](./CLAUDE.md) — working conventions and stack reality
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — scale and rendering plan

To God be the glory.
