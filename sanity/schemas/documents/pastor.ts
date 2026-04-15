import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

export default defineType({
  name: "pastor",
  title: "Person",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "role",
      title: "Role / Title",
      type: "string",
      description: "e.g. 'Senior Pastor', 'Office Administrator', 'Media Lead'",
    }),
    defineField({
      name: "department",
      title: "Department",
      description: "Which part of the ministry does this person belong to?",
      type: "string",
      options: {
        list: [
          { title: "Pastoral & Leadership", value: "pastoral" },
          { title: "Church Office", value: "office" },
          { title: "Worship & Music", value: "worship" },
          { title: "Media & Tech", value: "media" },
          { title: "Youth", value: "youth" },
          { title: "Women's Ministry", value: "women" },
          { title: "Men's Ministry", value: "men" },
          { title: "Outreach", value: "outreach" },
          { title: "Other", value: "other" },
        ],
      },
      initialValue: "pastoral",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "assembly",
      title: "Home assembly",
      type: "reference",
      to: [{ type: "assembly" }],
      description: "Leave empty for ministry-wide leaders.",
    }),
    defineField({
      name: "email",
      title: "Login email",
      description:
        "Used for the pastor dashboard sign-in. Must be unique across all people.",
      type: "string",
      validation: (R) =>
        R.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
          name: "email",
          invert: false,
        }).warning("Use a real email address."),
    }),
    defineField({
      name: "dashboardRole",
      title: "Dashboard role",
      description:
        "Controls what this person can see in the /dashboard area. Leave blank to disable login entirely.",
      type: "string",
      options: {
        list: [
          { title: "Assembly Lead — sees only their assembly", value: "assembly_lead" },
          { title: "Office Admin — sees all assemblies", value: "office_admin" },
          { title: "Super Admin — full access", value: "super_admin" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "socials",
      type: "object",
      fields: [
        defineField({ name: "instagram", type: "url" }),
        defineField({ name: "twitter", type: "url" }),
        defineField({ name: "email", type: "string" }),
        defineField({ name: "phone", type: "string" }),
      ],
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Lower = appears first in lists.",
      initialValue: 100,
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      department: "department",
      media: "image",
    },
    prepare: ({ title, subtitle, department, media }) => ({
      title,
      subtitle: subtitle
        ? `${subtitle}${department ? ` · ${department}` : ""}`
        : department || undefined,
      media,
    }),
  },
});
