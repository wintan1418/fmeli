import { defineField, defineType } from "sanity";

export default defineType({
  name: "callToAction",
  title: "Call to Action",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({
      name: "heading",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({ name: "body", type: "text", rows: 3 }),
    defineField({ name: "primaryCta", title: "Primary CTA", type: "cta" }),
    defineField({ name: "secondaryCta", title: "Secondary CTA", type: "cta" }),
    defineField({
      name: "tone",
      type: "string",
      options: {
        list: [
          { title: "Blue", value: "blue" },
          { title: "Deep Blue", value: "blue-deep" },
          { title: "White", value: "white" },
        ],
        layout: "radio",
      },
      initialValue: "blue",
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Call to Action",
      subtitle: subtitle ? `CTA · ${subtitle}` : "Call to Action",
    }),
  },
});
