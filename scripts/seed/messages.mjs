import { ptBlock, ptH3, imageRef } from "./lib.mjs";

// ────────────────────────────────────────────────────────────
// Message categories — two-level hierarchy.
//
// Roots (no parent) appear as the top-row chips on /resources/messages.
// Children (parent set) appear as a second row when their root is active.
//
// The shape mirrors how FMELi actually organises:
//   Sunday          (top-level)
//     ├ School of Life
//     ├ Morning Teaching
//     └ Sunday Message
//   Wednesday       (top-level)
//     └ Wednesday Teaching (STS)
//   Special Meetings (top-level — open list, the office adds more in Studio)
//     ├ Life Campaign
//     ├ Singles Rendezvous
//     ├ Real Men Conference
//     ├ Feminine Meeting
//     ├ ZOE Conference
//     ├ Christmas Service
//     ├ Youth Convergence
//     └ Couple's Garden
//
// The pCloud import script reuses these slugs to map source folders →
// category refs, so any change here needs to stay in sync with the
// PCLOUD_FOLDER_TO_CATEGORY map in scripts/import-pcloud.mjs.
// ────────────────────────────────────────────────────────────
const categoryRows = [
  // Roots
  { slug: "sunday", title: "Sunday", order: 1, description: "The weekly Sunday gathering — School of Life, Morning Teaching, and the Sunday message." },
  { slug: "wednesday", title: "Wednesday", order: 2, description: "Midweek teaching series for the household of faith." },
  { slug: "special-meetings", title: "Special Meetings", order: 3, description: "Conferences, conventions, vigils, campaigns and one-off gatherings." },

  // Sunday children
  { slug: "school-of-life", title: "School of Life", parent: "sunday", order: 11, description: "Foundational teaching for new and growing believers." },
  { slug: "morning-teaching", title: "Morning Teaching", parent: "sunday", order: 12, description: "The opening Sunday teaching session." },
  { slug: "sunday-message", title: "Sunday Message", parent: "sunday", order: 13, description: "The main Sunday preaching." },

  // Wednesday children
  { slug: "wednesday-teaching", title: "Wednesday Teaching (STS)", parent: "wednesday", order: 21, description: "Sound Teaching Sessions — verse by verse, line upon line." },

  // Special Meetings children — every recurring FMELi event the church runs
  { slug: "life-campaign", title: "Life Campaign", parent: "special-meetings", order: 31 },
  { slug: "singles-rendezvous", title: "Singles Rendezvous", parent: "special-meetings", order: 32 },
  { slug: "real-men-conference", title: "Real Men Conference", parent: "special-meetings", order: 33 },
  { slug: "feminine-meeting", title: "Feminine Meeting", parent: "special-meetings", order: 34 },
  { slug: "zoe-conference", title: "ZOE Conference", parent: "special-meetings", order: 35 },
  { slug: "christmas-service", title: "Christmas Service", parent: "special-meetings", order: 36 },
  { slug: "youth-convergence", title: "Youth Convergence", parent: "special-meetings", order: 37 },
  { slug: "couples-garden", title: "Couple's Garden", parent: "special-meetings", order: 38 },
  { slug: "cross-over-service", title: "Cross Over Service", parent: "special-meetings", order: 39 },
  { slug: "vigil", title: "Vigil", parent: "special-meetings", order: 40 },
  { slug: "corn-feast", title: "Corn Feast", parent: "special-meetings", order: 41 },
];

const messageRows = [
  {
    slug: "the-entrance-of-the-word",
    title: "The Entrance of the Word",
    date: "2026-04-12",
    scripture: "Psalm 119:130",
    series: "messageSeries.unveiled-mysteries",
    category: "sunday-message",
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
    series: "messageSeries.life-in-the-spirit",
    category: "sunday-message",
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
    series: "messageSeries.unveiled-mysteries",
    category: "sunday-message",
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
    series: "messageSeries.life-in-the-spirit",
    category: "wednesday-teaching",
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
    category: "zoe-conference",
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
    series: "messageSeries.life-in-the-spirit",
    category: "wednesday-teaching",
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
    series: "messageSeries.unveiled-mysteries",
    category: "zoe-conference",
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
    category: "vigil",
    preacher: "pastor.akure-lead",
    excerpt:
      "He did not call it a house of preaching, of singing, or of programmes. He called it a house of prayer for all nations.",
    thumb: "pray-woman.jpg",
    duration: 49,
    featured: true,
  },
];

/** Build the seeded message categories. */
export function buildMessageCategoryDocs() {
  return categoryRows.map((c) => ({
    _id: `messageCategory.${c.slug}`,
    _type: "messageCategory",
    title: c.title,
    slug: { _type: "slug", current: c.slug },
    description: c.description,
    order: c.order,
    ...(c.parent
      ? {
          parent: {
            _type: "reference",
            _ref: `messageCategory.${c.parent}`,
          },
        }
      : {}),
  }));
}

/** Build the two seeded message series. */
export function buildMessageSeriesDocs(assetByName) {
  return [
    {
      _id: "messageSeries.unveiled-mysteries",
      _type: "messageSeries",
      title: "Unveiled Mysteries",
      slug: { _type: "slug", current: "unveiled-mysteries" },
      artwork: imageRef(assetByName["word-preaching.jpg"]),
      description:
        "A long-form teaching series on the hidden things of the kingdom — the parables, the patterns, and the eternal counsel of God revealed in Christ.",
    },
    {
      _id: "messageSeries.life-in-the-spirit",
      _type: "messageSeries",
      title: "Life in the Spirit",
      slug: { _type: "slug", current: "life-in-the-spirit" },
      artwork: imageRef(assetByName["worship-hands-up.jpg"]),
      description:
        "Walking out the new-creation life — the Spirit's witness, the Spirit's gifts, and the Spirit's leading in the everyday believer.",
    },
  ];
}

/**
 * Build the seeded messages. Each ships with placeholder pCloud URLs
 * for both audio and excerpt — replace per-message in Studio with the
 * real public links from the FMELi pCloud account.
 */
export function buildMessageDocs(assetByName) {
  return messageRows.map((m) => ({
    _id: `message.${m.slug}`,
    _type: "message",
    title: m.title,
    slug: { _type: "slug", current: m.slug },
    date: m.date,
    scripture: m.scripture,
    excerpt: m.excerpt,
    durationMinutes: m.duration,
    featured: m.featured ?? false,
    thumbnail: imageRef(assetByName[m.thumb]),
    audioUrl: `https://u.pcloud.link/publink/show?code=placeholder-audio-${m.slug}`,
    excerptUrl: `https://u.pcloud.link/publink/show?code=placeholder-excerpt-${m.slug}`,
    category: { _type: "reference", _ref: `messageCategory.${m.category}` },
    preacher: { _type: "reference", _ref: m.preacher },
    ...(m.series ? { series: { _type: "reference", _ref: m.series } } : {}),
    notes: [
      ptH3("Opening text"),
      ptBlock(
        `${m.scripture} — read it slowly, twice. Let the words land before the message explains them.`,
      ),
      ptH3("Main thought"),
      ptBlock(m.excerpt),
      ptBlock(
        "These notes are placeholder content for the seeded archive. Edit the message in Studio to replace them with the real outline.",
      ),
    ],
  }));
}
