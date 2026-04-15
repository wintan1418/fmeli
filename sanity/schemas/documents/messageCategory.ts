import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons";

/**
 * Category bucket for messages — e.g. "Sunday Messages", "Wednesday Teaching",
 * "Convention", "Special Meeting". Editable in Studio so the office can add
 * new categories without a code change.
 */
export default defineType({
  name: "messageCategory",
  title: "Message Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 64 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Lower = appears first in filters.",
      initialValue: 100,
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
});
