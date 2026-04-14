import { defineField, defineType } from "sanity";

export default defineType({
  name: "heroBanner",
  title: "Hero Banner",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({
      name: "heading",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({ name: "subheading", type: "text", rows: 3 }),
    defineField({
      name: "primaryCta",
      title: "Primary CTA",
      type: "cta",
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary CTA",
      type: "cta",
    }),
    defineField({
      name: "backgroundImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "tone",
      type: "string",
      options: {
        list: [
          { title: "Blue", value: "blue" },
          { title: "Deep Blue", value: "blue-deep" },
        ],
        layout: "radio",
      },
      initialValue: "blue-deep",
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow", media: "backgroundImage" },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Hero Banner",
      subtitle: subtitle ? `Hero · ${subtitle}` : "Hero Banner",
      media,
    }),
  },
});
