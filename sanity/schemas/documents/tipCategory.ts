import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons";

/**
 * Category bucket for tips — Health, Family, Finance, Spiritual Life,
 * etc. Editable in Studio so the office can add new buckets without a
 * code change. Mirrors the messageCategory schema deliberately so the
 * pattern is consistent across the resources area.
 */
export default defineType({
  name: "tipCategory",
  title: "Tip Category",
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
