import { defineField, defineType } from "sanity";
import { BulbOutlineIcon } from "@sanity/icons";

/**
 * Per-assembly announcement — a promo card shown at the top of the
 * assembly page while active. Use cases the pastors asked for:
 *   - "We're hosting Singles Rendezvous next Saturday, register here"
 *   - "Prayer vigil tonight, live stream link inside"
 *   - "New members class starting Sunday, 11am"
 *
 * Distinct from the global `announcement` doc (that one is the
 * site-wide ticker/banner). These are scoped to one assembly and
 * render as a hero-style callout on that assembly page, optionally
 * with a live-stream embed.
 *
 * Authorable from the pastor dashboard — see
 * `/dashboard/assembly/announcements`.
 */
export default defineType({
  name: "assemblyAnnouncement",
  title: "Assembly announcement",
  type: "document",
  icon: BulbOutlineIcon,
  fields: [
    defineField({
      name: "assembly",
      title: "Assembly",
      type: "reference",
      to: [{ type: "assembly" }],
      description: "Which assembly is this for?",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (R) => R.required().max(120),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      description:
        "Shapes the badge colour + label on the page.",
      options: {
        list: [
          { title: "Special meeting", value: "special" },
          { title: "Event", value: "event" },
          { title: "Stream / live", value: "stream" },
          { title: "General notice", value: "general" },
        ],
        layout: "radio",
      },
      initialValue: "special",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
      description: "Rich text shown in the announcement card.",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      description: "Optional. Falls back to the assembly's own hero image.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "startsAt",
      title: "Starts at",
      type: "datetime",
      description:
        "Show the announcement from this moment. Leave empty to show immediately.",
    }),
    defineField({
      name: "endsAt",
      title: "Ends at",
      type: "datetime",
      description:
        "Auto-retire after this moment. Leave empty to show indefinitely (until manually archived).",
    }),
    defineField({
      name: "streamUrl",
      title: "Stream / link URL",
      type: "url",
      description:
        "Where the CTA button goes. For a live stream, paste a YouTube / Mixlr / Facebook Live URL — the page will embed it inline.",
      validation: (R) =>
        R.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA label",
      type: "string",
      description: "Button text (defaults to 'Register' / 'Watch live').",
    }),
    defineField({
      name: "isPinned",
      title: "Pin to top",
      type: "boolean",
      description:
        "Force this to appear above other active announcements.",
      initialValue: false,
    }),
    defineField({
      name: "isArchived",
      title: "Archived",
      type: "boolean",
      description:
        "Hide from the assembly page without deleting. Useful for reusing old announcements.",
      initialValue: false,
    }),
    defineField({
      name: "createdBy",
      title: "Created by",
      description:
        "The pastor who created this announcement (set automatically).",
      type: "reference",
      to: [{ type: "pastor" }],
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: "Pinned, then newest",
      name: "pinnedThenDate",
      by: [
        { field: "isPinned", direction: "desc" },
        { field: "startsAt", direction: "desc" },
        { field: "_createdAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      assemblyCity: "assembly.city",
      media: "heroImage",
      isArchived: "isArchived",
    },
    prepare: ({ title, assemblyCity, media, isArchived }) => ({
      title,
      subtitle:
        (assemblyCity ?? "(no assembly)") + (isArchived ? " · archived" : ""),
      media,
    }),
  },
});
