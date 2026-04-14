import { defineField, defineType } from "sanity";

export default defineType({
  name: "imageWithText",
  title: "Image with Text",
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
      name: "image",
      type: "image",
      options: { hotspot: true },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "imagePosition",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "left",
    }),
    defineField({
      name: "cta",
      type: "cta",
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow", media: "image" },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Image with Text",
      subtitle: subtitle ? `Image + Text · ${subtitle}` : "Image + Text",
      media,
    }),
  },
});
