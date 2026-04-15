import { defineField, defineType } from "sanity";
import { StackIcon } from "@sanity/icons";

/**
 * A series of messages — e.g. "Unveiled Mysteries", "Life in the Spirit".
 * Renamed from sermonSeries when we moved the resources area to use
 * "message" as the canonical term.
 */
export default defineType({
  name: "messageSeries",
  title: "Message Series",
  type: "document",
  icon: StackIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "artwork",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 4,
    }),
  ],
  preview: {
    select: { title: "title", media: "artwork" },
  },
});
