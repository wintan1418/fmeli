import { defineField, defineType } from "sanity";
import { DocumentsIcon } from "@sanity/icons";

/**
 * Weekly / monthly report submitted by an assembly's lead pastor.
 *
 * In Phase 2 we'll wire a /dashboard/reports/new page that lets pastors
 * submit these without ever opening Studio. For now it lives as a
 * Studio-managed document type so the office team can create entries
 * and review submissions in one place.
 */
export default defineType({
  name: "assemblyReport",
  title: "Assembly Report",
  type: "document",
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: "assembly",
      type: "reference",
      to: [{ type: "assembly" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "period",
      title: "Reporting period",
      type: "string",
      options: {
        list: [
          { title: "Weekly", value: "weekly" },
          { title: "Monthly", value: "monthly" },
          { title: "Quarterly", value: "quarterly" },
          { title: "Special meeting", value: "special" },
        ],
        layout: "radio",
      },
      initialValue: "weekly",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "weekOf",
      title: "Week of (or report date)",
      type: "date",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "submittedBy",
      title: "Submitted by",
      type: "reference",
      to: [{ type: "pastor" }],
    }),

    defineField({
      name: "attendance",
      title: "Attendance",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "total", type: "number" }),
        defineField({ name: "men", type: "number" }),
        defineField({ name: "women", type: "number" }),
        defineField({ name: "youth", type: "number" }),
        defineField({ name: "children", type: "number" }),
        defineField({
          name: "firstTimers",
          title: "First-time visitors",
          type: "number",
        }),
        defineField({
          name: "decisions",
          title: "Salvation decisions",
          type: "number",
        }),
      ],
    }),

    defineField({
      name: "finances",
      title: "Finances (NGN)",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "tithe", type: "number" }),
        defineField({ name: "offering", type: "number" }),
        defineField({ name: "projects", type: "number" }),
        defineField({ name: "missions", type: "number" }),
        defineField({ name: "other", type: "number" }),
        defineField({
          name: "notes",
          type: "text",
          rows: 2,
          description: "Anything the office should know about this week's giving.",
        }),
      ],
    }),

    defineField({
      name: "highlights",
      title: "Highlights of the week",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "prayerPoints",
      title: "Prayer points",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "testimonies",
      title: "Testimonies",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "challenges",
      title: "Challenges / needs",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "nextWeekFocus",
      title: "Focus for next week",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Submitted", value: "submitted" },
          { title: "Reviewed by office", value: "reviewed" },
          { title: "Filed", value: "filed" },
        ],
      },
      initialValue: "draft",
    }),
    defineField({
      name: "submittedAt",
      type: "datetime",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: "Most recent first",
      name: "weekOfDesc",
      by: [{ field: "weekOf", direction: "desc" }],
    },
    {
      title: "By assembly",
      name: "byAssembly",
      by: [
        { field: "assembly._ref", direction: "asc" },
        { field: "weekOf", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: {
      assemblyCity: "assembly.city",
      weekOf: "weekOf",
      status: "status",
      total: "attendance.total",
    },
    prepare: ({ assemblyCity, weekOf, status, total }) => ({
      title: assemblyCity ? `${assemblyCity} — ${weekOf ?? "no date"}` : (weekOf ?? "Report"),
      subtitle: [
        status,
        typeof total === "number" ? `${total} attended` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
