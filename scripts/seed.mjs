#!/usr/bin/env node
/**
 * Seed the FMELi Sanity dataset with baseline content.
 *
 * Run:
 *   node --env-file=.env.local scripts/seed.mjs
 *
 * Idempotent — deterministic document IDs + createOrReplace + asset
 * hash-dedup. Safe to re-run after edits without nuking admin changes
 * to siteSettings (which uses createIfNotExists).
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in env.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const randKey = () => Math.random().toString(36).slice(2, 10);
const ptBlock = (text) => ({
  _type: "block",
  _key: randKey(),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: randKey(), text, marks: [] }],
});
const ptH3 = (text) => ({ ...ptBlock(text), style: "h3" });

function imageRef(assetId) {
  return assetId
    ? {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      }
    : undefined;
}

// ────────────────────────────────────────────────────────────────
// Upload a default pastor image so seeded pastors have a face.
// Sanity dedupes by content hash, so re-running is free.
// ────────────────────────────────────────────────────────────────
async function uploadImageAsset(relativePath, filename) {
  try {
    const buffer = readFileSync(join(projectRoot, relativePath));
    const asset = await client.assets.upload("image", buffer, { filename });
    return asset._id;
  } catch (err) {
    console.warn(`! Could not upload ${relativePath}: ${err.message}`);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────
// Data
// ────────────────────────────────────────────────────────────────

const assemblyRows = [
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

async function main() {
  console.log(`Seeding dataset '${dataset}' on project ${projectId}…`);

  // Upload pastor placeholder image (the FMELi set-man photo).
  const pastorAssetId = await uploadImageAsset(
    "public/images/fmeli/set-man.jpg",
    "fmeli-pastor-placeholder.jpg",
  );
  console.log(
    pastorAssetId
      ? `  ✓ pastor image: ${pastorAssetId}`
      : "  ! pastor image upload skipped",
  );

  // ── Pastors ──────────────────────────────────────────────────
  const setManDoc = {
    _id: "pastor.set-man",
    _type: "pastor",
    name: "Set Man of the Ministry",
    role: "Senior Pastor · Full Manifestation of Eternal Life",
    department: "pastoral",
    image: imageRef(pastorAssetId),
    bio: [
      ptBlock(
        "The set man of Full Manifestation of Eternal Life has carried the burden of unveiling the mysteries of the kingdom for decades. Rename this document in Studio to use the real name.",
      ),
      ptBlock(
        "Through the weekly Teaching Series, the Life Campaign, and annual convocations, his ministry has shaped the rhythm of the FMELi family across nine assemblies.",
      ),
    ],
    order: 1,
  };

  const assemblyLeadDocs = assemblyRows.map((a, i) => ({
    _id: `pastor.${a.slug}-lead`,
    _type: "pastor",
    name: `${a.city} Lead Pastor`,
    role: `Lead Pastor · FMELi ${a.city}`,
    department: "pastoral",
    image: imageRef(pastorAssetId),
    bio: [
      ptBlock(
        `Leading the FMELi ${a.city} assembly in the full expression of the unveiled Word — teaching, pastoring, and serving the household of faith.`,
      ),
      ptBlock(
        "Rename this document in Studio and upload the real photo to replace the placeholder.",
      ),
    ],
    order: 10 + i,
  }));

  // ── Assemblies ───────────────────────────────────────────────
  const assemblyDocs = assemblyRows.map((a) => ({
    _id: `assembly.${a.slug}`,
    _type: "assembly",
    city: a.city,
    state: a.state,
    slug: { _type: "slug", current: a.slug },
    tagline: a.tagline,
    order: a.order,
    address: `To be filled in Studio — Assembly office, ${a.city}.`,
    phone: "+234 000 000 0000",
    email: `${a.slug}@fmeli.org`,
    leadPastor: {
      _type: "reference",
      _ref: `pastor.${a.slug}-lead`,
    },
    about: [
      ptBlock(
        `The FMELi ${a.city} assembly gathers weekly for the Lord's table, the unveiled Word, and the fellowship of the saints. Our doors are open — come as you are.`,
      ),
    ],
    serviceTimes: [
      {
        _type: "object",
        _key: `t-${a.slug}-sun`,
        label: "Sunday Service",
        day: "Every Sunday",
        time: "8:00 AM",
      },
      {
        _type: "object",
        _key: `t-${a.slug}-wed`,
        label: "Wednesday Teaching",
        day: "Every Wednesday",
        time: "6:30 PM",
      },
      {
        _type: "object",
        _key: `t-${a.slug}-vigil`,
        label: "Monthly Vigil",
        day: "First Friday",
        time: "10:00 PM",
      },
    ],
  }));

  // ── Meetings ─────────────────────────────────────────────────
  const meetingDocs = [
    {
      _id: "meeting.sunday-service",
      _type: "meeting",
      title: "Sunday Service",
      slug: { _type: "slug", current: "sunday-service" },
      kind: "weekly",
      cadenceLabel: "Every Sunday",
      defaultDay: "Every Sunday",
      defaultTime: "8:00 AM",
      summary:
        "The Lord's table, the unveiled Word, worship and the body in communion.",
      description: [
        ptBlock(
          "Our Sunday gathering is the rhythm of the FMELi family. We break bread together at the Lord's table, open the scriptures verse by verse, and lift our voices in worship. Every assembly across Nigeria gathers at 8:00 AM so the body is one.",
        ),
        ptBlock(
          "If you're new, expect a warm welcome — come as you are, bring your questions, and stay for as long as you like afterwards.",
        ),
      ],
      featured: true,
      order: 1,
    },
    {
      _id: "meeting.wednesday-teaching",
      _type: "meeting",
      title: "Wednesday Teaching Series",
      slug: { _type: "slug", current: "wednesday-teaching" },
      kind: "weekly",
      cadenceLabel: "Every Wednesday",
      defaultDay: "Every Wednesday",
      defaultTime: "6:30 PM",
      summary:
        "Verse by verse, line upon line — teaching that unveils the mysteries.",
      description: [
        ptBlock(
          "Our midweek Teaching Series is where the Word is taken apart and put back together. Expect long-form exposition, strong Bible engagement, and room for Q&A at the end.",
        ),
      ],
      featured: true,
      order: 2,
    },
    {
      _id: "meeting.monthly-vigil",
      _type: "meeting",
      title: "Monthly Vigil",
      slug: { _type: "slug", current: "monthly-vigil" },
      kind: "vigil",
      cadenceLabel: "First Friday of the month",
      defaultDay: "First Friday",
      defaultTime: "10:00 PM",
      summary:
        "A night of prayer, praise and the Word across all assemblies.",
      description: [
        ptBlock(
          "The first Friday of every month we gather from 10pm through the night for intercession, worship, and the Word. Many testimonies have come out of these nights.",
        ),
      ],
      order: 3,
    },
    {
      _id: "meeting.life-campaign",
      _type: "meeting",
      title: "Life Campaign",
      slug: { _type: "slug", current: "life-campaign" },
      kind: "special",
      cadenceLabel: "Periodic",
      defaultDay: "See calendar",
      defaultTime: "See calendar",
      summary:
        "Outreach, healing and salvation — taking the message beyond the walls.",
      description: [
        ptBlock(
          "The Life Campaign is our flagship outreach — a season of concentrated evangelism, healing, and teaching that takes the gospel out of our auditoriums and into our communities. Thousands have met Christ through it.",
        ),
      ],
      order: 4,
    },
    {
      _id: "meeting.kiss-the-son",
      _type: "meeting",
      title: "Kiss the Son",
      slug: { _type: "slug", current: "kiss-the-son" },
      kind: "yearly",
      cadenceLabel: "Annually",
      defaultDay: "Annually",
      defaultTime: "See calendar",
      summary: "Our annual convocation — three days of the unveiled Word.",
      description: [
        ptBlock(
          "Kiss the Son is our annual convocation — three days set apart for intense teaching, worship, and encounter with the living Word. Believers gather from every assembly and beyond.",
        ),
      ],
      featured: true,
      order: 5,
    },
    {
      _id: "meeting.believers-convention",
      _type: "meeting",
      title: "Believers' Convention",
      slug: { _type: "slug", current: "believers-convention" },
      kind: "yearly",
      cadenceLabel: "Annually",
      defaultDay: "Annually",
      defaultTime: "See calendar",
      summary: "An annual gathering of the household of faith.",
      description: [
        ptBlock(
          "The Believers' Convention is our yearly family gathering — a time to be refreshed, recalibrated, and refilled for the year ahead.",
        ),
      ],
      order: 6,
    },
  ];

  // ── Announcements ────────────────────────────────────────────
  const announcementDocs = [
    { _id: "announcement.sunday", _type: "announcement", title: "Sunday Service · 8:00 AM across all assemblies", placement: "ticker", priority: 10 },
    { _id: "announcement.wednesday", _type: "announcement", title: "Wednesday Teaching Series · 6:30 PM", placement: "ticker", priority: 9 },
    { _id: "announcement.life-campaign", _type: "announcement", title: "Life Campaign · The Overcomers · 9-15 March 2026", placement: "ticker", priority: 8 },
    { _id: "announcement.live", _type: "announcement", title: "Watch FMELi live · Sundays 8am WAT", placement: "ticker", priority: 7 },
    { _id: "announcement.vigil", _type: "announcement", title: "Monthly Vigil · First Friday, 10:00 PM", placement: "ticker", priority: 6 },
  ];

  // ── Site settings singleton ──────────────────────────────────
  const siteSettingsDoc = {
    _id: "siteSettings",
    _type: "siteSettings",
    title: "Full Manifestation of Eternal Life",
    tagline: "The entrance of Your word gives light",
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

  // ── CMS pages ───────────────────────────────────────────────
  const pageDocs = [
    // ABOUT ─────────────────────────────────────────────────────
    {
      _id: "page.about",
      _type: "page",
      title: "About Us",
      slug: { _type: "slug", current: "about" },
      sections: [
        {
          _key: "about-hero",
          _type: "heroBanner",
          eyebrow: "Our story",
          heading: "A house for the unveiled Word",
          subheading:
            "Full Manifestation of Eternal Life is a family of believers carrying one burden — that the entrance of His word would give light to every soul that enters our doors.",
          tone: "blue-deep",
        },
        {
          _key: "about-origin",
          _type: "textBlock",
          eyebrow: "Who we are",
          heading: "We are a people of the Word",
          body: [
            ptBlock(
              "Full Manifestation of Eternal Life — also known as Eternal Life Embassy — is a fellowship of believers united around the teaching of the mysteries of the kingdom of God. From a single gathering years ago, the ministry has grown into a family that now meets across nine assemblies in Nigeria and reaches tens of thousands online every week.",
            ),
            ptBlock(
              "Our conviction has never changed: where the Word is given full place, darkness flees and light breaks in. Every sermon, every song, every service is in pursuit of that single thing.",
            ),
          ],
          alignment: "left",
          tone: "default",
        },
        {
          _key: "about-pillars",
          _type: "textBlock",
          eyebrow: "How we live it",
          heading: "For the Word. The testimony of Jesus. We pray. We worship.",
          body: [
            ptBlock(
              "Four pillars shape the rhythm of our life together:",
            ),
            ptH3("1. For the Word"),
            ptBlock(
              "The Bible is the foundation of everything we teach, sing, and do. Verse by verse, line upon line — we believe the entrance of His word gives light (Psalm 119:130).",
            ),
            ptH3("2. The Testimony of Jesus"),
            ptBlock(
              "The Spirit of prophecy is the testimony of Jesus (Revelation 19:10). Christ is at the centre of every gathering — His person, His work, His appearing.",
            ),
            ptH3("3. We Pray"),
            ptBlock(
              "Prayer is our first language. Weekly prayer meetings, monthly vigils, and a culture of intercession across every assembly.",
            ),
            ptH3("4. We Worship"),
            ptBlock(
              "We are given to Him — in spirit, in truth, in every song we raise. Worship at FMELi is not a warm-up act; it is the main event.",
            ),
          ],
          alignment: "left",
          tone: "default",
        },
        {
          _key: "about-scripture",
          _type: "quoteBlock",
          quote:
            "The entrance of Your word gives light; it gives understanding to the simple.",
          attribution: "Psalm 119:130",
          tone: "blue",
        },
        {
          _key: "about-assemblies",
          _type: "textBlock",
          eyebrow: "Across Nigeria",
          heading: "Nine assemblies. One family.",
          body: [
            ptBlock(
              "From Lagos to Ado, Abeokuta to Benin, our assemblies share the same Word, the same rhythm, and the same mission. Each campus is led by pastors who carry the vision of the house and serve their local community.",
            ),
            ptBlock(
              "Wherever you find an FMELi assembly, you'll find open doors, open Bibles, and a family that wants to welcome you.",
            ),
          ],
          alignment: "left",
          tone: "default",
        },
        {
          _key: "about-cta",
          _type: "callToAction",
          eyebrow: "Come and see",
          heading: "You are welcome at the table",
          body: "Whether you are seeking, curious, or long-established in the faith, there is a place for you at any of our assemblies. Come as you are — leave carrying light.",
          tone: "blue",
        },
      ],
    },

    // BELIEFS ───────────────────────────────────────────────────
    {
      _id: "page.beliefs",
      _type: "page",
      title: "What We Believe",
      slug: { _type: "slug", current: "beliefs" },
      sections: [
        {
          _key: "beliefs-hero",
          _type: "heroBanner",
          eyebrow: "The foundation",
          heading: "What we believe",
          subheading:
            "The unchanging convictions that shape every sermon, every prayer, and every life touched by this ministry.",
          tone: "blue-deep",
        },
        {
          _key: "beliefs-scripture",
          _type: "textBlock",
          eyebrow: "1 · The Scriptures",
          heading: "The Bible is the Word of God",
          body: [
            ptBlock(
              "We believe in the plenary, verbal inspiration of the Holy Scriptures. The sixty-six books of the Old and New Testaments are the complete, inerrant, and authoritative Word of God — sufficient for faith, practice, and the total transformation of a human life.",
            ),
            ptBlock(
              "Every doctrine we hold must be weighed against Scripture. Every sermon we preach must be anchored in Scripture. Every song we sing must align with Scripture.",
            ),
          ],
          alignment: "left",
          tone: "default",
        },
        {
          _key: "beliefs-god",
          _type: "textBlock",
          eyebrow: "2 · God",
          heading: "One God, eternally existing in three persons",
          body: [
            ptBlock(
              "We believe in one God — eternal, self-existing, and sovereign — revealed in Scripture as Father, Son, and Holy Spirit. Three persons, one essence, equally worthy of worship and adoration.",
            ),
          ],
          alignment: "left",
          tone: "white",
        },
        {
          _key: "beliefs-jesus",
          _type: "textBlock",
          eyebrow: "3 · Jesus Christ",
          heading: "Fully God, fully man, the only Saviour",
          body: [
            ptBlock(
              "We believe in the deity of the Lord Jesus Christ, His virgin birth, sinless life, miracles, substitutionary atoning death, bodily resurrection, ascension to the right hand of the Father, and His personal return in power and glory.",
            ),
            ptBlock(
              "There is no other name under heaven given among men by which we must be saved.",
            ),
          ],
          alignment: "left",
          tone: "default",
        },
        {
          _key: "beliefs-spirit",
          _type: "textBlock",
          eyebrow: "4 · The Holy Spirit",
          heading: "The Helper, the Teacher, the Power of God",
          body: [
            ptBlock(
              "We believe in the present-day ministry of the Holy Spirit — His baptism, indwelling, sanctification, gifting and empowerment of the believer for godly living, bold witness, and the building up of the body of Christ.",
            ),
          ],
          alignment: "left",
          tone: "white",
        },
        {
          _key: "beliefs-salvation",
          _type: "textBlock",
          eyebrow: "5 · Salvation & the Church",
          heading: "Born again, being made whole, belonging together",
          body: [
            ptBlock(
              "We believe that every person is born in sin and needs new birth through faith in the finished work of Jesus Christ. Salvation is by grace through faith, not by works — lest any should boast.",
            ),
            ptBlock(
              "We believe the Church is the body of Christ — local expressions gathered to worship, grow, serve, and make disciples. Every believer belongs to a local assembly, contributing their gifts and being sharpened in fellowship.",
            ),
            ptBlock(
              "The full statement of faith is available on request from the church office.",
            ),
          ],
          alignment: "left",
          tone: "default",
        },
        {
          _key: "beliefs-cta",
          _type: "callToAction",
          eyebrow: "Questions?",
          heading: "Come and reason with us",
          body: "If you have questions about what we believe or why we believe it, we'd love to sit and talk. Visit any assembly after service, or reach the church office.",
          tone: "blue",
        },
      ],
    },

    // CONTACT ───────────────────────────────────────────────────
    {
      _id: "page.contact",
      _type: "page",
      title: "Contact",
      slug: { _type: "slug", current: "contact" },
      sections: [
        {
          _key: "contact-hero",
          _type: "heroBanner",
          eyebrow: "Get in touch",
          heading: "We'd love to hear from you",
          subheading:
            "Reach out for prayer, to plan a visit, to partner in the work, or simply to say hello. Every message is read by the church office and answered.",
          tone: "blue-deep",
        },
        {
          _key: "contact-general",
          _type: "textBlock",
          eyebrow: "The church office",
          heading: "General enquiries",
          body: [
            ptBlock(
              "For general enquiries, prayer requests, partnership, or anything that doesn't obviously belong to a specific assembly — write to the FMELi central office.",
            ),
            ptBlock("Email: office@fmeli.org"),
            ptBlock("Phone: +234 000 000 0000"),
            ptBlock(
              "Office hours: Monday to Friday, 9:00 AM — 5:00 PM. Outside these hours, please leave a message or use the Assembly Lookup below.",
            ),
          ],
          alignment: "left",
          tone: "default",
        },
        {
          _key: "contact-assemblies",
          _type: "callToAction",
          eyebrow: "By city",
          heading: "Find your nearest assembly",
          body: "Nine cities. One family. Lagos, Abeokuta, Ibadan, Akure, Osogbo, Ife, Ondo, Benin, Ado — every campus has its own phone and address on the assembly page.",
          primaryCta: {
            link: {
              label: "Browse assemblies",
              external: "/assemblies",
            },
          },
          tone: "blue",
        },
        {
          _key: "contact-give",
          _type: "textBlock",
          eyebrow: "Give, register, or watch",
          heading: "For specific needs",
          body: [
            ptBlock(
              "To give — visit /give. Online via Paystack or by bank transfer.",
            ),
            ptBlock(
              "To register for an event — find the event under /events and click Register.",
            ),
            ptBlock(
              "To watch a sermon — visit /sermons or /live.",
            ),
          ],
          alignment: "left",
          tone: "white",
        },
      ],
    },

    // LIFE CAMPAIGN ─────────────────────────────────────────────
    {
      _id: "page.life-campaign",
      _type: "page",
      title: "Life Campaign",
      slug: { _type: "slug", current: "life-campaign" },
      sections: [
        {
          _key: "lc-hero",
          _type: "heroBanner",
          eyebrow: "The Overcomers · 2026",
          heading: "Taking the message beyond the walls",
          subheading:
            "Our flagship outreach — seven days of concentrated evangelism, healing, and unveiled Word across our cities.",
          tone: "blue-deep",
        },
        {
          _key: "lc-what",
          _type: "textBlock",
          eyebrow: "What it is",
          heading: "More than a conference — a campaign",
          body: [
            ptBlock(
              "The Life Campaign is FMELi's most ambitious outreach season. Every year (and in some years, twice) we take the gospel out of our auditoriums and into the communities around us.",
            ),
            ptBlock(
              "A typical campaign runs over seven days and includes:",
            ),
            ptBlock(
              "• Nightly open-air services with preaching, healing, and deliverance.",
            ),
            ptBlock(
              "• Daytime door-to-door outreaches across the host city.",
            ),
            ptBlock(
              "• Morning teaching sessions for believers being equipped.",
            ),
            ptBlock(
              "• A dedicated prayer and intercession team covering every meeting.",
            ),
          ],
          alignment: "left",
          tone: "default",
        },
        {
          _key: "lc-quote",
          _type: "quoteBlock",
          quote:
            "How shall they believe in Him of whom they have not heard? And how shall they hear without a preacher?",
          attribution: "Romans 10:14",
          tone: "blue",
        },
        {
          _key: "lc-involved",
          _type: "textBlock",
          eyebrow: "Get involved",
          heading: "There are three ways to partner",
          body: [
            ptH3("1. Pray"),
            ptBlock(
              "Every campaign rises and falls on prayer. Join the intercession team in the weeks leading up to and during the campaign.",
            ),
            ptH3("2. Give"),
            ptBlock(
              "A campaign of this size is only possible because the FMELi family gives sacrificially. Every naira makes the gospel reach further.",
            ),
            ptH3("3. Go"),
            ptBlock(
              "Serve on the ground — evangelism, follow-up, logistics, ushering, media, medical. Speak to your assembly lead.",
            ),
          ],
          alignment: "left",
          tone: "white",
        },
        {
          _key: "lc-cta",
          _type: "callToAction",
          eyebrow: "Ready to join?",
          heading: "Partner with the next campaign",
          body: "Email the outreach desk at life@fmeli.org and let us know how you'd like to join — whether you can come for a day or for the whole week.",
          primaryCta: {
            link: { label: "View upcoming events", external: "/events" },
          },
          tone: "blue",
        },
      ],
    },
  ];

  // ── Commit transaction ──────────────────────────────────────
  let tx = client.transaction();
  tx = tx.createOrReplace(setManDoc);
  for (const doc of assemblyLeadDocs) tx = tx.createOrReplace(doc);
  for (const doc of assemblyDocs) tx = tx.createOrReplace(doc);
  for (const doc of meetingDocs) tx = tx.createOrReplace(doc);
  for (const doc of announcementDocs) tx = tx.createOrReplace(doc);
  for (const doc of pageDocs) tx = tx.createOrReplace(doc);
  tx = tx.createIfNotExists(siteSettingsDoc);

  const result = await tx.commit();
  console.log(`✓ Committed ${result.results.length} operations`);
  console.log(
    `  pastors: ${1 + assemblyLeadDocs.length} · assemblies: ${assemblyDocs.length} · meetings: ${meetingDocs.length} · announcements: ${announcementDocs.length} · pages: ${pageDocs.length}`,
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
