import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "title",
      title: "Site title",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "tagline",
      type: "string",
    }),
    defineField({
      name: "logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "navLinks",
      title: "Navbar links",
      type: "array",
      of: [{ type: "link" }],
      validation: (R) => R.max(8),
    }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      fields: [
        defineField({
          name: "blurb",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "columns",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "heading", type: "string" }),
                defineField({
                  name: "links",
                  type: "array",
                  of: [{ type: "link" }],
                }),
              ],
              preview: {
                select: { title: "heading" },
              },
            },
          ],
          validation: (R) => R.max(4),
        }),
      ],
    }),
    defineField({
      name: "socials",
      type: "object",
      fields: [
        defineField({ name: "instagram", type: "url" }),
        defineField({ name: "youtube", type: "url" }),
        defineField({ name: "facebook", type: "url" }),
        defineField({ name: "tiktok", type: "url" }),
      ],
    }),
    defineField({
      name: "liveStreamUrl",
      title: "YouTube live stream URL",
      description:
        "Paste the YouTube live stream URL — channel /live URL, video URL, or full embed URL all work. The /live page renders this as the main 16:9 player.",
      type: "url",
    }),
    defineField({
      name: "mixlrEmbedUrl",
      title: "Mixlr embed URL",
      description:
        "Paste the Mixlr show embed URL (looks like https://mixlr.com/users/<your-name>/embed). The /live page renders this as the audio player below the YouTube video so listeners can tune in even when video isn't streaming.",
      type: "url",
    }),
    defineField({
      name: "homepageHeroSlides",
      title: "Homepage hero slides",
      description: "Up to 5 slides shown in the auto-rotating hero on the homepage.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "eyebrow", type: "string" }),
            defineField({ name: "heading", type: "string", validation: (R) => R.required() }),
            defineField({ name: "headingAccent", type: "string", description: "Italic accent clause shown below the heading." }),
            defineField({ name: "body", type: "text", rows: 3 }),
            defineField({ name: "primaryCta", title: "Primary CTA", type: "cta" }),
            defineField({ name: "secondaryCta", title: "Secondary CTA", type: "cta" }),
            defineField({
              name: "backgroundImage",
              type: "image",
              options: { hotspot: true },
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: "heading", subtitle: "eyebrow", media: "backgroundImage" },
          },
        },
      ],
      validation: (R) => R.max(5),
    }),
    defineField({
      name: "bankTransferDetails",
      title: "Bank transfer details",
      description: "Shown to registrants who choose to pay by transfer.",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "bankName", type: "string" }),
        defineField({ name: "accountName", type: "string" }),
        defineField({ name: "accountNumber", type: "string" }),
        defineField({
          name: "instructions",
          type: "text",
          rows: 3,
          description:
            "Extra guidance for the giver — e.g. 'use your name as reference'.",
        }),
      ],
    }),
    defineField({
      name: "homepageStats",
      title: "Homepage stats (counters)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "value", type: "number", validation: (R) => R.required() }),
            defineField({ name: "suffix", type: "string", description: "e.g. '+', 'k+'" }),
            defineField({ name: "label", type: "string", validation: (R) => R.required() }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        },
      ],
      validation: (R) => R.max(4),
    }),
    defineField({
      name: "defaultSeo",
      title: "Default SEO",
      type: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
