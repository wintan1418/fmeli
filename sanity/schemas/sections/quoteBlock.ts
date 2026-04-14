import { defineField, defineType } from "sanity";

export default defineType({
  name: "quoteBlock",
  title: "Quote / Pullout",
  type: "object",
  fields: [
    defineField({
      name: "quote",
      type: "text",
      rows: 3,
      validation: (R) => R.required(),
    }),
    defineField({
      name: "attribution",
      type: "string",
      description: "e.g. Matthew 18:20, Tim Keller, etc.",
    }),
    defineField({
      name: "tone",
      type: "string",
      options: {
        list: [
          { title: "White", value: "white" },
          { title: "Default", value: "default" },
          { title: "Blue", value: "blue" },
        ],
        layout: "radio",
      },
      initialValue: "white",
    }),
  ],
  preview: {
    select: { title: "quote", subtitle: "attribution" },
    prepare: ({ title, subtitle }) => ({
      title: title ? `"${title.slice(0, 60)}…"` : "Quote",
      subtitle: subtitle || "Quote Block",
    }),
  },
});
