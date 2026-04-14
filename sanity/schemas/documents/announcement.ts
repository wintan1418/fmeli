import { defineField, defineType } from "sanity";
import { BellIcon } from "@sanity/icons";

export default defineType({
  name: "announcement",
  title: "Announcement",
  type: "document",
  icon: BellIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "Short — shows in the homepage ticker and site banner.",
      validation: (R) => R.required().max(90),
    }),
    defineField({
      name: "link",
      type: "link",
      description: "Optional — where clicking the announcement takes you.",
    }),
    defineField({
      name: "startsOn",
      type: "date",
      description: "Show from this date.",
    }),
    defineField({
      name: "endsOn",
      type: "date",
      description: "Stop showing after this date.",
    }),
    defineField({
      name: "placement",
      type: "string",
      options: {
        list: [
          { title: "Homepage ticker (marquee)", value: "ticker" },
          { title: "Top-of-page banner", value: "banner" },
          { title: "Both", value: "both" },
        ],
        layout: "radio",
      },
      initialValue: "ticker",
    }),
    defineField({
      name: "priority",
      type: "number",
      description: "Higher = shown first.",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Priority then date",
      name: "priorityDesc",
      by: [
        { field: "priority", direction: "desc" },
        { field: "startsOn", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "placement" },
  },
});
