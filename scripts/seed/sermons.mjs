import { ptBlock, ptH3, imageRef } from "./lib.mjs";

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

/** Build the two seeded sermon series. */
export function buildSermonSeriesDocs(assetByName) {
  return [
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
}

/** Build the seeded sermons. Each sermon ships with placeholder pCloud
 * URLs for both audio and excerpt — replace per-sermon in Studio with
 * the real public links from the FMELi pCloud account. */
export function buildSermonDocs(assetByName) {
  return sermonRows.map((s) => ({
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
    audioUrl: `https://u.pcloud.link/publink/show?code=placeholder-audio-${s.slug}`,
    excerptUrl: `https://u.pcloud.link/publink/show?code=placeholder-excerpt-${s.slug}`,
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
}
