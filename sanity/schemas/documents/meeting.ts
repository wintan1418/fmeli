import { defineField, defineType } from "sanity";
import { CalendarIcon } from "@sanity/icons";

/**
 * Meeting = a recurring gathering pattern (Sunday Service, Wednesday Teaching,
 * Monthly Vigil, Life Campaign, Kiss the Son convocation, etc.).
 *
 * Distinct from `event`: an event is a single-date happening (Singles
 * Rendezvous on 2026-05-15). A meeting describes the pattern; events can
 * reference a parent meeting if they belong to a series.
 */
export default defineType({
  name: "meeting",
  title: "Meeting",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Weekly service", value: "weekly" },
          { title: "Monthly", value: "monthly" },
          { title: "Quarterly", value: "quarterly" },
          { title: "Bi-annual", value: "biannual" },
          { title: "Yearly / annual", value: "yearly" },
          { title: "Special meeting", value: "special" },
          { title: "Vigil", value: "vigil" },
          { title: "Outreach", value: "outreach" },
        ],
        layout: "radio",
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "cadenceLabel",
      title: "Cadence label (shown on cards)",
      type: "string",
      description: "Override the kind's default label — e.g. 'Every Sunday', 'First Friday', 'Annually in December'",
    }),
    defineField({
      name: "defaultDay",
      title: "Typical day",
      type: "string",
      description: "e.g. 'Every Sunday', 'First Friday of the month'",
    }),
    defineField({
      name: "defaultTime",
      title: "Typical time",
      type: "string",
      description: "e.g. '8:00 AM', '6:30 PM'",
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      description: "One sentence shown on the meetings grid card.",
    }),
    defineField({
      name: "description",
      type: "array",
      of: [{ type: "block" }],
      description: "Long-form description shown on the meeting detail page.",
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "assemblies",
      title: "Happens at which assemblies?",
      type: "array",
      of: [{ type: "reference", to: [{ type: "assembly" }] }],
      description: "Leave empty if it happens at all assemblies.",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      description: "Show on the homepage meetings grid?",
      initialValue: false,
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
    select: { title: "title", subtitle: "kind", media: "image" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? `Meeting · ${subtitle}` : "Meeting",
      media,
    }),
  },
});
