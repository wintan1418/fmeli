import { defineField, defineType } from "sanity";
import { BulbOutlineIcon } from "@sanity/icons";

/**
 * A short pastoral tip — health, family, finance, spiritual life.
 * Bite-size content, written for the family. Different from a blog
 * post (which is long-form) and from a message (which is preaching).
 */
export default defineType({
  name: "tip",
  title: "Tip",
  type: "document",
  icon: BulbOutlineIcon,
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
      name: "category",
      type: "reference",
      to: [{ type: "tipCategory" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "date",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "summary",
      title: "Short summary (for cards)",
      type: "text",
      rows: 3,
      validation: (R) => R.max(280),
    }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "pastor" }],
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Most recent first",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category.title",
      media: "coverImage",
    },
  },
});
