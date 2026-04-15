import { ptBlock, ptH3, imageRef } from "./lib.mjs";

/**
 * Build the four CMS pages: About, What We Believe, Contact, Life Campaign.
 *
 * Each page is a `page` document with a `sections[]` Page Builder array.
 * Section _type values must be registered in three places per CLAUDE.md:
 *   1. sanity/schemas/sections/<name>.ts
 *   2. sanity/schemas/documents/page.ts
 *   3. src/components/PageBuilder.tsx
 */
export function buildPageDocs(assetByName) {
  return [aboutPage(assetByName), beliefsPage(), contactPage(), lifeCampaignPage()];
}

function aboutPage(assetByName) {
  return {
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
          ptBlock("We don't preach a religion or a personality. We preach Him."),
        ],
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
          ptBlock("We are made for this. We were created to give Him glory."),
        ],
      },
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
      {
        _key: "about-cta",
        _type: "callToAction",
        eyebrow: "Come and see",
        heading: "You are welcome at the table",
        body: "Whether you are seeking, curious, or long-established in the faith, there is a place for you at any of our assemblies. Come as you are — leave carrying light.",
        tone: "blue",
      },
    ],
  };
}

function beliefsPage() {
  return {
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
  };
}

function contactPage() {
  return {
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
          link: { label: "Browse assemblies", external: "/assemblies" },
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
          ptBlock("To watch a sermon — visit /sermons or /live."),
        ],
        alignment: "left",
        tone: "white",
      },
    ],
  };
}

function lifeCampaignPage() {
  return {
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
          ptBlock("A typical campaign runs over seven days and includes:"),
          ptBlock(
            "• Nightly open-air services with preaching, healing, and deliverance.",
          ),
          ptBlock("• Daytime door-to-door outreaches across the host city."),
          ptBlock("• Morning teaching sessions for believers being equipped."),
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
  };
}
