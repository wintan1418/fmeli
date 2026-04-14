import { defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
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
      name: "seo",
      type: "seo",
    }),
    defineField({
      name: "sections",
      title: "Page sections",
      type: "array",
      of: [
        { type: "heroBanner" },
        { type: "textBlock" },
        { type: "imageWithText" },
        { type: "callToAction" },
        { type: "quoteBlock" },
      ],
      options: {
        insertMenu: {
          views: [{ name: "list" }, { name: "grid" }],
        },
      },
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare: ({ title, slug }) => ({
      title,
      subtitle: slug ? `/${slug}` : "(no slug)",
    }),
  },
});
