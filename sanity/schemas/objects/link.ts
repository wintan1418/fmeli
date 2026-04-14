import { defineField, defineType } from "sanity";

export default defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "kind",
      title: "Link target",
      type: "string",
      options: {
        list: [
          { title: "Internal page", value: "internal" },
          { title: "Sermon", value: "sermon" },
          { title: "Event", value: "event" },
          { title: "External URL", value: "external" },
        ],
        layout: "radio",
      },
      initialValue: "internal",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "internal",
      type: "reference",
      to: [{ type: "page" }],
      hidden: ({ parent }) => parent?.kind !== "internal",
    }),
    defineField({
      name: "sermon",
      type: "reference",
      to: [{ type: "sermon" }],
      hidden: ({ parent }) => parent?.kind !== "sermon",
    }),
    defineField({
      name: "event",
      type: "reference",
      to: [{ type: "event" }],
      hidden: ({ parent }) => parent?.kind !== "event",
    }),
    defineField({
      name: "external",
      title: "External URL",
      type: "url",
      hidden: ({ parent }) => parent?.kind !== "external",
      validation: (R) =>
        R.uri({ scheme: ["http", "https", "mailto", "tel"] }),
    }),
  ],
});
