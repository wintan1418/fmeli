import { defineField, defineType } from "sanity";

export default defineType({
  name: "cta",
  title: "Call to Action",
  type: "object",
  fields: [
    defineField({
      name: "link",
      type: "link",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "style",
      type: "string",
      options: {
        list: [
          { title: "Primary (red)", value: "primary" },
          { title: "Secondary (white)", value: "secondary" },
          { title: "Ghost (outline)", value: "ghost" },
        ],
        layout: "radio",
      },
      initialValue: "primary",
    }),
  ],
});
