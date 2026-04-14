import { defineField, defineType } from "sanity";

export default defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "Page title for search engines and browser tabs.",
      validation: (R) => R.max(70),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      description: "Short summary shown in search results.",
      validation: (R) => R.max(160),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
