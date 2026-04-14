import { defineField, defineType } from "sanity";
import { CalendarIcon } from "@sanity/icons";

/**
 * Event = a single-date happening with an absolute start and end.
 * For recurring patterns (Sunday service, Monthly vigil) use `meeting` instead.
 * An event can optionally link to a parent meeting if it belongs to a series.
 */
export default defineType({
  name: "event",
  title: "Event",
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
      name: "isSpecial",
      title: "Special meeting?",
      type: "boolean",
      description: "Tick this for conferences, conventions, rendezvous, campaigns etc. — they get a distinct visual treatment.",
      initialValue: false,
    }),
    defineField({
      name: "parentMeeting",
      title: "Belongs to meeting series",
      type: "reference",
      to: [{ type: "meeting" }],
      description: "Optional — e.g. the yearly 'Kiss the Son' event ties to the 'Kiss the Son' meeting.",
    }),
    defineField({
      name: "startsAt",
      title: "Starts at",
      type: "datetime",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "endsAt",
      title: "Ends at",
      type: "datetime",
    }),
    defineField({
      name: "assembly",
      title: "At which assembly?",
      type: "reference",
      to: [{ type: "assembly" }],
      description: "Leave empty if the event happens at all assemblies or online only.",
    }),
    defineField({
      name: "location",
      title: "Location (if not tied to an assembly)",
      type: "string",
    }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "tagline",
      type: "string",
      description: "Short one-liner shown on event cards.",
    }),
    defineField({
      name: "description",
      type: "array",
      of: [{ type: "block" }],
    }),

    // Registration
    defineField({
      name: "registrationEnabled",
      title: "Enable registration?",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "registrationDeadline",
      type: "datetime",
      hidden: ({ parent }) => !parent?.registrationEnabled,
    }),
    defineField({
      name: "capacity",
      title: "Capacity (leave blank for unlimited)",
      type: "number",
      hidden: ({ parent }) => !parent?.registrationEnabled,
    }),
    defineField({
      name: "registrationMode",
      title: "Registration mode",
      type: "string",
      options: {
        list: [
          { title: "On-site form (collect in Sanity)", value: "internal" },
          { title: "External form (Google Form, Tally, Typeform)", value: "external" },
        ],
        layout: "radio",
      },
      initialValue: "internal",
      hidden: ({ parent }) => !parent?.registrationEnabled,
    }),
    defineField({
      name: "externalRegistrationUrl",
      title: "External registration URL",
      type: "url",
      hidden: ({ parent }) =>
        !parent?.registrationEnabled || parent?.registrationMode !== "external",
    }),
    defineField({
      name: "registrationFields",
      title: "On-site form fields",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              type: "string",
              validation: (R) => R.required(),
            }),
            defineField({
              name: "name",
              type: "string",
              description: "Machine-readable key (lowercase, no spaces).",
              validation: (R) =>
                R.required().regex(/^[a-z][a-z0-9_]*$/, {
                  name: "snake_case",
                  invert: false,
                }),
            }),
            defineField({
              name: "kind",
              type: "string",
              options: {
                list: [
                  { title: "Short text", value: "text" },
                  { title: "Long text", value: "textarea" },
                  { title: "Email", value: "email" },
                  { title: "Phone", value: "tel" },
                  { title: "Number", value: "number" },
                  { title: "Date", value: "date" },
                  { title: "Select", value: "select" },
                  { title: "Checkbox", value: "checkbox" },
                ],
              },
              initialValue: "text",
            }),
            defineField({
              name: "required",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "options",
              description: "For select fields only — one option per line.",
              type: "array",
              of: [{ type: "string" }],
              hidden: ({ parent }) => parent?.kind !== "select",
            }),
            defineField({
              name: "placeholder",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "kind" },
          },
        },
      ],
      hidden: ({ parent }) =>
        !parent?.registrationEnabled || parent?.registrationMode !== "internal",
    }),

    defineField({
      name: "seo",
      type: "seo",
    }),
  ],
  orderings: [
    {
      title: "Soonest first",
      name: "startsAtAsc",
      by: [{ field: "startsAt", direction: "asc" }],
    },
    {
      title: "Most recently added",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "startsAt",
      media: "heroImage",
      isSpecial: "isSpecial",
    },
    prepare: ({ title, subtitle, media, isSpecial }) => ({
      title: isSpecial ? `★ ${title}` : title,
      subtitle: subtitle
        ? new Date(subtitle).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "No date set",
      media,
    }),
  },
});
