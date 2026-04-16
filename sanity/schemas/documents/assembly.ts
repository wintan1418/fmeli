import { defineField, defineType } from "sanity";
import { PinIcon } from "@sanity/icons";

export default defineType({
  name: "assembly",
  title: "Assembly (Campus)",
  type: "document",
  icon: PinIcon,
  fields: [
    defineField({
      name: "city",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "state",
      type: "string",
      description: "Nigerian state (e.g. Lagos, Ogun, Ondo)",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "city", maxLength: 64 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "tagline",
      type: "string",
      description: "Short phrase — e.g. 'The rock', 'The ancient city'",
    }),
    defineField({
      name: "address",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "phone",
      type: "string",
    }),
    defineField({
      name: "email",
      type: "string",
    }),
    defineField({
      name: "mapUrl",
      title: "Google Maps URL",
      type: "url",
    }),
    defineField({
      name: "mapEmbed",
      title: "Google Maps embed URL (iframe src)",
      type: "url",
    }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "welcomeVideo",
      title: "Welcome video",
      description:
        "Short intro video from the lead pastor — shown prominently at the top of the campus page. Paste a YouTube, Vimeo, or direct MP4 URL.",
      type: "object",
      fields: [
        defineField({
          name: "url",
          title: "Video URL",
          type: "url",
          description: "YouTube / Vimeo / direct .mp4 link.",
          validation: (R) =>
            R.uri({ allowRelative: false, scheme: ["http", "https"] }),
        }),
        defineField({
          name: "poster",
          title: "Poster image",
          description:
            "Shown as the video thumbnail before play. Leave empty to auto-derive from YouTube.",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          description:
            "Short line shown above the video — e.g. 'A word from Rev. Busuyi'.",
        }),
      ],
    }),
    defineField({
      name: "serviceTimes",
      title: "Service times",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", type: "string", validation: (R) => R.required() }),
            defineField({ name: "day", type: "string" }),
            defineField({ name: "time", type: "string" }),
          ],
          preview: {
            select: { title: "label", subtitle: "day" },
          },
        },
      ],
    }),
    defineField({
      name: "leadPastor",
      title: "Lead Pastor",
      type: "reference",
      to: [{ type: "pastor" }],
      description: "The primary pastor for this assembly — shown prominently on the assembly card and detail page.",
    }),
    defineField({
      name: "leaders",
      title: "Additional leaders",
      type: "array",
      of: [{ type: "reference", to: [{ type: "pastor" }] }],
      description: "Other pastors / ministry leaders serving at this assembly.",
    }),
    defineField({
      name: "about",
      title: "About this assembly",
      description: "Short description shown on the detail page under the hero.",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first in lists",
      initialValue: 100,
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }, { field: "city", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "city", subtitle: "state", media: "heroImage" },
  },
});
