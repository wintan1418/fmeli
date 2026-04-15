import { ptBlock } from "./lib.mjs";

/** Build the recurring + special meeting docs. */
export function buildMeetingDocs() {
  return [
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
}
