#!/usr/bin/env node
/**
 * Seed the FMELi Sanity dataset with baseline content so the site has
 * something to render while the content team fills in the rest.
 *
 * Run:
 *   node --env-file=.env.local scripts/seed.mjs
 *
 * Idempotent — uses deterministic document IDs and createOrReplace, so
 * running it again will refresh the baseline content without creating
 * duplicates. Will not touch documents outside of the ones it creates.
 */

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in env.",
  );
  console.error("Run: node --env-file=.env.local scripts/seed.mjs");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// ────────────────────────────────────────────────────────────────
// Assemblies
// ────────────────────────────────────────────────────────────────
const assemblies = [
  { slug: "lagos",    city: "Lagos",    state: "Lagos", tagline: "The city assembly", order: 1 },
  { slug: "abeokuta", city: "Abeokuta", state: "Ogun",  tagline: "The rock",          order: 2 },
  { slug: "ibadan",   city: "Ibadan",   state: "Oyo",   tagline: "Coming soon",       order: 3 },
  { slug: "akure",    city: "Akure",    state: "Ondo",  tagline: "The ancient city",  order: 4 },
  { slug: "osogbo",   city: "Osogbo",   state: "Osun",  tagline: "The grove",         order: 5 },
  { slug: "ife",      city: "Ife",      state: "Osun",  tagline: "The source",        order: 6 },
  { slug: "ondo",     city: "Ondo",     state: "Ondo",  tagline: "The kingdom",       order: 7 },
  { slug: "benin",    city: "Benin",    state: "Edo",   tagline: "The heritage",      order: 8 },
  { slug: "ado",      city: "Ado",      state: "Ekiti", tagline: "The hills",         order: 9 },
];

const assemblyDocs = assemblies.map((a) => ({
  _id: `assembly.${a.slug}`,
  _type: "assembly",
  city: a.city,
  state: a.state,
  slug: { _type: "slug", current: a.slug },
  tagline: a.tagline,
  order: a.order,
  serviceTimes: [
    { _type: "object", _key: `t-${a.slug}-sun`, label: "Sunday Service", day: "Every Sunday", time: "8:00 AM" },
    { _type: "object", _key: `t-${a.slug}-wed`, label: "Wednesday Teaching", day: "Every Wednesday", time: "6:30 PM" },
  ],
}));

// ────────────────────────────────────────────────────────────────
// Meetings
// ────────────────────────────────────────────────────────────────
const meetings = [
  {
    id: "meeting.sunday-service",
    slug: "sunday-service",
    title: "Sunday Service",
    kind: "weekly",
    cadenceLabel: "Every Sunday",
    defaultDay: "Every Sunday",
    defaultTime: "8:00 AM",
    summary: "The Lord's table, the unveiled Word, worship and the body in communion.",
    featured: true,
    order: 1,
  },
  {
    id: "meeting.wednesday-teaching",
    slug: "wednesday-teaching",
    title: "Wednesday Teaching Series",
    kind: "weekly",
    cadenceLabel: "Every Wednesday",
    defaultDay: "Every Wednesday",
    defaultTime: "6:30 PM",
    summary: "Verse by verse, line upon line — teaching that unveils the mysteries.",
    featured: true,
    order: 2,
  },
  {
    id: "meeting.monthly-vigil",
    slug: "monthly-vigil",
    title: "Monthly Vigil",
    kind: "vigil",
    cadenceLabel: "First Friday of the month",
    defaultDay: "First Friday",
    defaultTime: "10:00 PM",
    summary: "A night of prayer, praise and the Word across all assemblies.",
    featured: false,
    order: 3,
  },
  {
    id: "meeting.life-campaign",
    slug: "life-campaign",
    title: "Life Campaign",
    kind: "special",
    cadenceLabel: "Periodic",
    defaultDay: "See calendar",
    defaultTime: "See calendar",
    summary: "Outreach, healing and salvation — taking the message beyond the walls.",
    featured: false,
    order: 4,
  },
  {
    id: "meeting.kiss-the-son",
    slug: "kiss-the-son",
    title: "Kiss the Son",
    kind: "yearly",
    cadenceLabel: "Annually",
    defaultDay: "Annually",
    defaultTime: "See calendar",
    summary: "Our annual convocation — three days of the unveiled Word.",
    featured: true,
    order: 5,
  },
  {
    id: "meeting.believers-convention",
    slug: "believers-convention",
    title: "Believers' Convention",
    kind: "yearly",
    cadenceLabel: "Annually",
    defaultDay: "Annually",
    defaultTime: "See calendar",
    summary: "An annual gathering of the household of faith.",
    featured: false,
    order: 6,
  },
];

const meetingDocs = meetings.map((m) => ({
  _id: m.id,
  _type: "meeting",
  title: m.title,
  slug: { _type: "slug", current: m.slug },
  kind: m.kind,
  cadenceLabel: m.cadenceLabel,
  defaultDay: m.defaultDay,
  defaultTime: m.defaultTime,
  summary: m.summary,
  featured: m.featured,
  order: m.order,
}));

// ────────────────────────────────────────────────────────────────
// Announcements (homepage ticker)
// ────────────────────────────────────────────────────────────────
const announcementDocs = [
  {
    _id: "announcement.sunday",
    _type: "announcement",
    title: "Sunday Service · 8:00 AM across all assemblies",
    placement: "ticker",
    priority: 10,
  },
  {
    _id: "announcement.wednesday",
    _type: "announcement",
    title: "Wednesday Teaching Series · 6:30 PM",
    placement: "ticker",
    priority: 9,
  },
  {
    _id: "announcement.life-campaign",
    _type: "announcement",
    title: "Life Campaign · The Overcomers · 9-15 March 2026",
    placement: "ticker",
    priority: 8,
  },
  {
    _id: "announcement.live",
    _type: "announcement",
    title: "Watch FMELi live · Sundays 8am WAT",
    placement: "ticker",
    priority: 7,
  },
  {
    _id: "announcement.vigil",
    _type: "announcement",
    title: "Monthly Vigil · First Friday, 10:00 PM",
    placement: "ticker",
    priority: 6,
  },
];

// ────────────────────────────────────────────────────────────────
// Site settings (singleton)
// ────────────────────────────────────────────────────────────────
const siteSettingsDoc = {
  _id: "siteSettings",
  _type: "siteSettings",
  title: "Full Manifestation of Eternal Life",
  tagline: "The entrance of Your word gives light",
  navLinks: [
    { _key: "n-home",    _type: "link", label: "Home",       kind: "external", external: "/" },
    { _key: "n-about",   _type: "link", label: "About",      kind: "external", external: "/about" },
    { _key: "n-meetings",_type: "link", label: "Meetings",   kind: "external", external: "/meetings" },
    { _key: "n-sermons", _type: "link", label: "Sermons",    kind: "external", external: "/sermons" },
    { _key: "n-assemblies", _type: "link", label: "Assemblies", kind: "external", external: "/assemblies" },
    { _key: "n-blog",    _type: "link", label: "Blog",       kind: "external", external: "/blog" },
  ],
  footer: {
    blurb:
      "Full Manifestation of Eternal Life — unveiling the mysteries of the Word across nine assemblies in Nigeria and everywhere online.",
  },
  homepageStats: [
    { _key: "s-assemblies", value: 9,    label: "Assemblies in Nigeria" },
    { _key: "s-messages",   value: 6000, suffix: "+", label: "Messages in the archive" },
    { _key: "s-years",      value: 52,   label: "Years of ministry" },
    { _key: "s-live",       value: 24,   suffix: "×7", label: "Live stream" },
  ],
  bankTransferDetails: {
    bankName: "GTBank",
    accountName: "Full Manifestation of Eternal Life",
    accountNumber: "0000000000",
    instructions:
      "After transfer, come back to the site and click 'I have transferred'. Your registration will be confirmed once we verify the payment.",
  },
};

// ────────────────────────────────────────────────────────────────
// Run the seed
// ────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Seeding dataset '${dataset}' on project ${projectId}…`);

  let tx = client.transaction();
  for (const doc of assemblyDocs) tx = tx.createOrReplace(doc);
  for (const doc of meetingDocs) tx = tx.createOrReplace(doc);
  for (const doc of announcementDocs) tx = tx.createOrReplace(doc);
  // siteSettings: only create if not exists so we don't nuke admin edits
  tx = tx.createIfNotExists(siteSettingsDoc);

  const result = await tx.commit();
  console.log(`✓ Committed ${result.results.length} operations.`);
  console.log(
    `  Assemblies: ${assemblyDocs.length}, Meetings: ${meetingDocs.length}, Announcements: ${announcementDocs.length}, Site Settings: createIfNotExists.`,
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
