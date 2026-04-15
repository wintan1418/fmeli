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

  // Upload every FMELi photo as a Sanity asset so we can reference them
  // from page sections by filename. Sanity dedupes uploads by content hash.
  const FMELI_PHOTOS = [
    "set-man.jpg",
    "word-preaching.jpg",
    "worship-hands-up.jpg",
    "pray-woman.jpg",
    "prayers-overlay.jpg",
    "fellowship-women.jpg",
    "brothers-embrace.jpg",
    "joy-laughter.jpg",
    "overcomer-youth.jpg",
  ];
  const assetByName = {};
  for (const file of FMELI_PHOTOS) {
    const id = await uploadImageAsset(`public/images/fmeli/${file}`, file);
    if (id) assetByName[file] = id;
  }
  console.log(`  ✓ uploaded ${Object.keys(assetByName).length} fmeli photos`);
  const pastorAssetId = assetByName["set-man.jpg"];

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

  // ── Sermon series ────────────────────────────────────────────
  const sermonSeriesDocs = [
    {
      _id: "sermonSeries.unveiled-mysteries",
      _type: "sermonSeries",
      title: "Unveiled Mysteries",
      slug: { _type: "slug", current: "unveiled-mysteries" },
      artwork: imageRef(assetByName["word-preaching.jpg"]),
      description:
        "A long-form teaching series on the hidden things of the kingdom — the parables, the patterns, and the eternal counsel of God revealed in Christ.",
    },
    {
      _id: "sermonSeries.life-in-the-spirit",
      _type: "sermonSeries",
      title: "Life in the Spirit",
      slug: { _type: "slug", current: "life-in-the-spirit" },
      artwork: imageRef(assetByName["worship-hands-up.jpg"]),
      description:
        "Walking out the new-creation life — the Spirit's witness, the Spirit's gifts, and the Spirit's leading in the everyday believer.",
    },
  ];

  // ── Sermons ──────────────────────────────────────────────────
  const sermonRows = [
    {
      slug: "the-entrance-of-the-word",
      title: "The Entrance of the Word",
      date: "2026-04-12",
      scripture: "Psalm 119:130",
      series: "sermonSeries.unveiled-mysteries",
      preacher: "pastor.set-man",
      excerpt:
        "Light does not come from striving; it comes from the Word finding a doorway into a willing heart.",
      thumb: "word-preaching.jpg",
      duration: 56,
    },
    {
      slug: "kept-by-the-power-of-god",
      title: "Kept by the Power of God",
      date: "2026-04-05",
      scripture: "1 Peter 1:5",
      series: "sermonSeries.life-in-the-spirit",
      preacher: "pastor.set-man",
      excerpt:
        "The same power that raised Christ is the power that holds you on the worst day you will ever have.",
      thumb: "set-man.jpg",
      duration: 48,
    },
    {
      slug: "the-mystery-of-the-bride",
      title: "The Mystery of the Bride",
      date: "2026-03-29",
      scripture: "Ephesians 5:32",
      series: "sermonSeries.unveiled-mysteries",
      preacher: "pastor.set-man",
      excerpt:
        "Marriage is a shadow. The substance is Christ and His Church — and that mystery is great.",
      thumb: "fellowship-women.jpg",
      duration: 62,
    },
    {
      slug: "led-by-the-spirit",
      title: "Led by the Spirit",
      date: "2026-03-22",
      scripture: "Romans 8:14",
      series: "sermonSeries.life-in-the-spirit",
      preacher: "pastor.lagos-lead",
      excerpt:
        "Sons are not driven; they are led. The Spirit's leading is the believer's birthright, not a special-case privilege.",
      thumb: "prayers-overlay.jpg",
      duration: 44,
    },
    {
      slug: "the-overcomers",
      title: "The Overcomers",
      date: "2026-03-15",
      scripture: "Revelation 12:11",
      preacher: "pastor.set-man",
      excerpt:
        "They overcame him by the blood of the Lamb and by the word of their testimony — and they loved not their lives unto death.",
      thumb: "overcomer-youth.jpg",
      duration: 71,
      featured: true,
    },
    {
      slug: "abide-in-the-vine",
      title: "Abide in the Vine",
      date: "2026-03-08",
      scripture: "John 15:4",
      series: "sermonSeries.life-in-the-spirit",
      preacher: "pastor.abeokuta-lead",
      excerpt:
        "Fruit is a function of union. Stop trying to produce; start learning to remain.",
      thumb: "joy-laughter.jpg",
      duration: 52,
    },
    {
      slug: "the-fellowship-of-his-suffering",
      title: "The Fellowship of His Suffering",
      date: "2026-03-01",
      scripture: "Philippians 3:10",
      series: "sermonSeries.unveiled-mysteries",
      preacher: "pastor.set-man",
      excerpt:
        "There is a knowing of Christ that is only available on the road His own feet walked.",
      thumb: "brothers-embrace.jpg",
      duration: 58,
    },
    {
      slug: "a-house-of-prayer",
      title: "A House of Prayer",
      date: "2026-02-22",
      scripture: "Isaiah 56:7",
      preacher: "pastor.akure-lead",
      excerpt:
        "He did not call it a house of preaching, of singing, or of programmes. He called it a house of prayer for all nations.",
      thumb: "pray-woman.jpg",
      duration: 49,
      featured: true,
    },
  ];

  const sermonDocs = sermonRows.map((s) => ({
    _id: `sermon.${s.slug}`,
    _type: "sermon",
    title: s.title,
    slug: { _type: "slug", current: s.slug },
    date: s.date,
    scripture: s.scripture,
    excerpt: s.excerpt,
    durationMinutes: s.duration,
    featured: s.featured ?? false,
    thumbnail: imageRef(assetByName[s.thumb]),
    // Placeholder pCloud share link — replace per-sermon in Studio with the
    // real public link from the FMELi pCloud account.
    audioUrl: `https://u.pcloud.link/publink/show?code=placeholder-${s.slug}`,
    preacher: { _type: "reference", _ref: s.preacher },
    ...(s.series ? { series: { _type: "reference", _ref: s.series } } : {}),
    notes: [
      ptH3("Opening text"),
      ptBlock(
        `${s.scripture} — read it slowly, twice. Let the words land before the sermon explains them.`,
      ),
      ptH3("Main thought"),
      ptBlock(s.excerpt),
      ptBlock(
        "These notes are placeholder content for the seeded archive. Edit the sermon in Studio to replace them with the real outline.",
      ),
    ],
  }));

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
        // Image right — origin story
        {
          _key: "about-origin",
          _type: "imageWithText",
          eyebrow: "Who we are",
          heading: "We are a people of the Word",
          imagePosition: "right",
          image: imageRef(assetByName["word-preaching.jpg"]),
          body: [
            ptBlock(
              "Full Manifestation of Eternal Life — also known as Eternal Life Embassy — is a fellowship of believers united around the teaching of the mysteries of the kingdom of God.",
            ),
            ptBlock(
              "From a single gathering years ago, the ministry has grown into a family that meets across nine assemblies in Nigeria and reaches tens of thousands online every week.",
            ),
            ptBlock(
              "Our conviction has never changed: where the Word is given full place, darkness flees and light breaks in.",
            ),
          ],
        },
        // Image left — for the Word pillar
        {
          _key: "about-pillar-word",
          _type: "imageWithText",
          eyebrow: "Pillar 01",
          heading: "For the Word",
          imagePosition: "left",
          image: imageRef(assetByName["set-man.jpg"]),
          body: [
            ptBlock(
              "The Bible is the foundation of everything we teach, sing, and do. Verse by verse, line upon line — we believe the entrance of His word gives light.",
            ),
            ptBlock(
              "Every Sunday and every Wednesday, the centre of the gathering is the unveiled Word. Not slogans. Not programmes. The Word.",
            ),
          ],
        },
        // Image right — testimony of Jesus
        {
          _key: "about-pillar-testimony",
          _type: "imageWithText",
          eyebrow: "Pillar 02",
          heading: "The testimony of Jesus",
          imagePosition: "right",
          image: imageRef(assetByName["fellowship-women.jpg"]),
          body: [
            ptBlock(
              "The Spirit of prophecy is the testimony of Jesus. Christ is at the centre of every gathering — His person, His finished work, His soon appearing.",
            ),
            ptBlock(
              "We don't preach a religion or a personality. We preach Him.",
            ),
          ],
        },
        // Pullquote breaking the rhythm
        {
          _key: "about-scripture",
          _type: "quoteBlock",
          quote:
            "The entrance of Your word gives light; it gives understanding to the simple.",
          attribution: "Psalm 119:130",
          tone: "blue",
        },
        // Image left — we pray
        {
          _key: "about-pillar-pray",
          _type: "imageWithText",
          eyebrow: "Pillar 03",
          heading: "We pray",
          imagePosition: "left",
          image: imageRef(assetByName["pray-woman.jpg"]),
          body: [
            ptBlock(
              "Prayer is our first language. Weekly prayer meetings, the Monthly Vigil that runs from 10pm through the night, and a culture of intercession across every assembly.",
            ),
            ptBlock(
              "Many testimonies in this house began on a knee, in a chair, in the small hours of the morning.",
            ),
          ],
        },
        // Image right — we worship
        {
          _key: "about-pillar-worship",
          _type: "imageWithText",
          eyebrow: "Pillar 04",
          heading: "We worship",
          imagePosition: "right",
          image: imageRef(assetByName["worship-hands-up.jpg"]),
          body: [
            ptBlock(
              "We are given to Him — in spirit, in truth, in every song we raise. Worship at FMELi is not a warm-up act before the message; it is the main event.",
            ),
            ptBlock(
              "We are made for this. We were created to give Him glory.",
            ),
          ],
        },
        // Image left — assemblies
        {
          _key: "about-assemblies",
          _type: "imageWithText",
          eyebrow: "Across Nigeria",
          heading: "Nine assemblies. One family.",
          imagePosition: "left",
          image: imageRef(assetByName["brothers-embrace.jpg"]),
          body: [
            ptBlock(
              "From Lagos to Ado, Abeokuta to Benin, our assemblies share the same Word, the same rhythm, and the same mission. Each campus is led by pastors who carry the vision of the house.",
            ),
            ptBlock(
              "Wherever you find an FMELi assembly, you'll find open doors, open Bibles, and a family that wants to welcome you.",
            ),
          ],
          cta: {
            link: { label: "Find your nearest assembly", external: "/assemblies" },
          },
        },
        // CTA finale
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
  for (const doc of sermonSeriesDocs) tx = tx.createOrReplace(doc);
  for (const doc of sermonDocs) tx = tx.createOrReplace(doc);
  for (const doc of announcementDocs) tx = tx.createOrReplace(doc);
  for (const doc of pageDocs) tx = tx.createOrReplace(doc);
  tx = tx.createIfNotExists(siteSettingsDoc);

  const result = await tx.commit();
  console.log(`✓ Committed ${result.results.length} operations`);
  console.log(
    `  pastors: ${1 + assemblyLeadDocs.length} · assemblies: ${assemblyDocs.length} · meetings: ${meetingDocs.length} · series: ${sermonSeriesDocs.length} · sermons: ${sermonDocs.length} · announcements: ${announcementDocs.length} · pages: ${pageDocs.length}`,
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
