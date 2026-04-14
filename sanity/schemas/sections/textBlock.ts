import { defineField, defineType } from "sanity";

export default defineType({
  name: "textBlock",
  title: "Text Block",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "heading", type: "string" }),
    defineField({
      name: "body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "alignment",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
        ],
        layout: "radio",
      },
      initialValue: "left",
    }),
    defineField({
      name: "tone",
      type: "string",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "White", value: "white" },
          { title: "Blue", value: "blue" },
        ],
        layout: "radio",
      },
      initialValue: "default",
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Text Block",
      subtitle: subtitle ? `Text · ${subtitle}` : "Text Block",
    }),
  },
});
