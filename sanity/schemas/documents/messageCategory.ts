import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons";

/**
 * Category bucket for messages — e.g. "Sunday Messages", "Wednesday Teaching",
 * "Special Meetings". Two-level hierarchy via the optional `parent` field:
 * a category with no parent is a top-level bucket; one with a parent is a
 * sub-category that rolls up to its parent in the filter chip bar.
 *
 * Example shape FMELi uses:
 *   Sunday              (top-level)
 *     ├ School of Life
 *     ├ Morning Teaching
 *     └ Sunday Message
 *   Wednesday           (top-level)
 *     └ Wednesday Teaching (STS)
 *   Special Meetings    (top-level — open list)
 *     ├ Life Campaign
 *     ├ Singles Rendezvous
 *     ├ Real Men Conference
 *     └ ... (anything new the church adds)
 *
 * The office can add a new special meeting in Studio just by creating a
 * new messageCategory and picking "Special Meetings" as the parent.
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
      name: "parent",
      title: "Parent category",
      description:
        "Leave empty for a top-level bucket (Sunday / Wednesday / Special Meetings). Pick a parent to make this a sub-category that rolls up to it.",
      type: "reference",
      to: [{ type: "messageCategory" }],
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "defaultThumbnail",
      title: "Default thumbnail",
      description:
        "Used as the card image for any message in this category that has no thumbnail of its own. A child category falls back to its parent's default if its own is empty.",
      type: "image",
      options: { hotspot: true },
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
    select: {
      title: "title",
      parentTitle: "parent.title",
    },
    prepare: ({ title, parentTitle }) => ({
      title,
      subtitle: parentTitle ? `under ${parentTitle}` : "(top-level)",
    }),
  },
});
