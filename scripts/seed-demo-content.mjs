#!/usr/bin/env node
/**
 * Seeds demo content so a fresh or sparse dataset looks alive:
 *
 *   1. siteSettings.homepageVideo — the cinema slot on the homepage
 *   2. assembly.welcomeVideo      — one per campus
 *   3. one sample assemblyAnnouncement per campus
 *
 * Run:
 *   node --env-file=.env.local scripts/seed-demo-content.mjs
 *
 * Idempotent — announcements use deterministic ids (one per campus
 * slug) so re-runs replace the sample rather than piling them up.
 * Site settings + welcome videos use `.setIfMissing` so any real
 * content uploaded in Studio is never overwritten.
 *
 * Every URL here is a PLACEHOLDER. Office replaces each one with
 * their own footage via Studio or /dashboard/assembly.
 */

import { createClient } from "@sanity/client";

// Real, widely-embedded Nigerian gospel / worship videos — any
// office member can replace them later from Studio or the pastor
// dashboard. These are all stable, public YouTube uploads with
// tens of millions of views and no known geo-restrictions, so
// every assembly page has something to show out of the box.
//
// Homepage hero: "Way Maker" by Sinach — one of the most-played
// Nigerian gospel songs ever, fits the "One body, one gospel" copy.
const PLACEHOLDER_VIDEO_URL = "https://www.youtube.com/watch?v=29IxnsqOkmQ";

// One video per assembly, varied so the 9 pages feel distinct.
// Captions reference each city so visitors know the page is alive.
// Keys must match assembly slugs from ASSEMBLY_ROWS in lib.mjs.
const ASSEMBLY_PLACEHOLDERS = {
  lagos:    { url: "https://www.youtube.com/watch?v=29IxnsqOkmQ", caption: "A welcome to the Lagos assembly" },
  abeokuta: { url: "https://www.youtube.com/watch?v=nfWlot6h_JM", caption: "Come worship with us in Abeokuta" },
  ibadan:   { url: "https://www.youtube.com/watch?v=bwsFaTm40Rg", caption: "Ibadan — come and see" },
  akure:    { url: "https://www.youtube.com/watch?v=2tc1Dn_CiGU", caption: "Greetings from Akure" },
  osogbo:   { url: "https://www.youtube.com/watch?v=J8RATYFUyNQ", caption: "Welcome to Osogbo" },
  ife:      { url: "https://www.youtube.com/watch?v=G3nKOQ-_GdY", caption: "A welcome from Ife" },
  ondo:     { url: "https://www.youtube.com/watch?v=xaORgQKbRTk", caption: "Welcome to Ondo" },
  benin:    { url: "https://www.youtube.com/watch?v=bl3vBjbkVKs", caption: "Benin — come as you are" },
  ado:      { url: "https://www.youtube.com/watch?v=0JzNIvK2hT8", caption: "Join us in Ado Ekiti" },
};

// One sample announcement per assembly. Starts now, ends 21 days
// out, so these display as Live immediately on /assemblies/[slug].
const SAMPLE_ANNOUNCEMENTS = [
  { assemblySlug: "lagos",    title: "Singles Rendezvous — Saturday 2 May", kind: "special", body: "Join us for a day of fellowship, the Word, and prayer for our singles. Register below to reserve your seat — every saint is welcome.", ctaLabel: "Register",   streamUrl: "https://forms.gle/singles-rendezvous" },
  { assemblySlug: "abeokuta", title: "Life Campaign — 5 Day Revival",        kind: "special", body: "Five evenings of revival. Bring the hungry — the unveiled Word will establish them in the faith.", ctaLabel: "Register",      streamUrl: "https://forms.gle/abeokuta-lc" },
  { assemblySlug: "ibadan",   title: "Sunday Service — Watch Live",          kind: "stream",  body: "We're streaming this Sunday's service live. Grab a seat on the couch and join in.", ctaLabel: "Watch live",                                          streamUrl: "https://www.youtube.com/watch?v=bwsFaTm40Rg" },
  { assemblySlug: "akure",    title: "Couple's Garden — Marriage Enrichment", kind: "event",   body: "Two sessions for married saints, with Rev. Busuyi and the pastoral team. Light refreshments after.", ctaLabel: "Register",                      streamUrl: "https://forms.gle/couples-garden" },
  { assemblySlug: "osogbo",   title: "Prayer Vigil — First Friday",           kind: "special", body: "All-night prayer, 10 PM till dawn. We gather to contend for families, for the nations, and for the church.", ctaLabel: "See details",          streamUrl: null },
  { assemblySlug: "ife",      title: "Q&A Communion Service",                 kind: "special", body: "A dedicated Sunday for your questions on faith, life, and the Word. Submit yours below.", ctaLabel: "Submit a question",                          streamUrl: "https://forms.gle/ife-qa" },
  { assemblySlug: "ondo",     title: "Zoe Conference — Theme: Incorruption",  kind: "event",   body: "Three days of teaching on the incorruptible life in Christ. Save the date — registration opens soon.", ctaLabel: "See details",                   streamUrl: null },
  { assemblySlug: "benin",    title: "Midweek Teaching — Live on YouTube",    kind: "stream",  body: "Wednesday STS is streaming live on YouTube. Tune in, take notes, and bring a friend.", ctaLabel: "Watch live",                                   streamUrl: "https://www.youtube.com/watch?v=bl3vBjbkVKs" },
  { assemblySlug: "ado",      title: "New Members' Class — Sunday",           kind: "general", body: "Stepping into the FMELi family? Join us after Sunday Service for a short, prayerful walk-through of our story and beliefs.", ctaLabel: "See details", streamUrl: null },
];

function ptParagraph(text, i) {
  return {
    _type: "block",
    _key: `pb-${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `ps-${i}`, text, marks: [] }],
  };
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function getClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN are required",
    );
  }
  return createClient({ projectId, dataset, apiVersion, token, useCdn: false });
}

async function main() {
  const client = getClient();
  console.log(
    `Seeding demo content to '${client.config().dataset}' on project ${client.config().projectId}…\n`,
  );

  // Re-seed flags. Default is non-destructive (setIfMissing) so
  // manual Studio edits survive a re-run. Pass --force-video to
  // overwrite existing demo URLs when we swap placeholder videos.
  const forceVideo = process.argv.includes("--force-video");
  const patchOp = forceVideo ? "set" : "setIfMissing";

  // ─── 1. Homepage video hero ────────────────────────────────
  console.log(
    `→ siteSettings.homepageVideo  (${forceVideo ? "force overwrite" : "only if empty"})`,
  );
  await client
    .patch("siteSettings")
    [patchOp]({
      homepageVideo: {
        eyebrow: "The living Word",
        heading: "One body, one gospel, one hope",
        body: "A glimpse into FMELi — the unveiled Word, saints in fellowship, and the life of Christ being formed in us across every assembly.",
        url: PLACEHOLDER_VIDEO_URL,
        cta: {
          style: "primary",
          link: {
            label: "Explore our messages",
            href: "/resources/messages",
          },
        },
      },
    })
    .commit();
  console.log("  ✓ homepage video slot populated");

  // ─── 2. Per-assembly welcome video ─────────────────────────
  console.log(
    `\n→ assembly.welcomeVideo  (${forceVideo ? "force overwrite" : "only if empty"})`,
  );
  for (const [slug, { url, caption }] of Object.entries(ASSEMBLY_PLACEHOLDERS)) {
    const assemblyId = `assembly.${slug}`;
    await client
      .patch(assemblyId)
      [patchOp]({
        welcomeVideo: {
          url,
          caption,
        },
      })
      .commit();
    console.log(`  ✓ ${slug}`);
  }

  // ─── 3. Sample announcement per assembly ───────────────────
  console.log("\n→ assemblyAnnouncement (one sample per assembly)");
  const now = new Date();
  const in21Days = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

  for (const a of SAMPLE_ANNOUNCEMENTS) {
    const docId = `assemblyAnnouncement.sample-${a.assemblySlug}`;
    const assemblyId = `assembly.${a.assemblySlug}`;

    const doc = {
      _id: docId,
      _type: "assemblyAnnouncement",
      assembly: { _type: "reference", _ref: assemblyId },
      title: a.title,
      slug: { _type: "slug", current: slugify(a.title) },
      kind: a.kind,
      body: [ptParagraph(a.body, 0)],
      startsAt: now.toISOString(),
      endsAt: in21Days.toISOString(),
      streamUrl: a.streamUrl ?? undefined,
      ctaLabel: a.ctaLabel,
      isPinned: false,
      isArchived: false,
    };

    // createOrReplace on a deterministic id keeps the dataset clean
    // across re-runs — if the office edited the sample, it'll come
    // back; if they want to keep their edits, they should archive
    // the sample and publish a new announcement under a new id.
    await client.createOrReplace(doc);
    console.log(`  ✓ ${a.assemblySlug} — ${a.title}`);
  }

  console.log("\nDone. Hard-refresh /resources, /assemblies, and each campus page.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
