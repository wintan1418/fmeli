import { defineField, defineType } from "sanity";
import { UsersIcon } from "@sanity/icons";

/**
 * Church member registry. Captured via the on-site member sign-up form
 * and managed by the church office team. Distinct from `pastor` (staff/
 * leadership) and `registration` (per-event signup).
 */
export default defineType({
  name: "member",
  title: "Member",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "firstName",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "lastName",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "email",
      type: "string",
    }),
    defineField({
      name: "phone",
      type: "string",
    }),
    defineField({
      name: "gender",
      type: "string",
      options: {
        list: [
          { title: "Female", value: "female" },
          { title: "Male", value: "male" },
          { title: "Prefer not to say", value: "unspecified" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "birthMonth",
      title: "Birth month",
      description: "Day + month (no year required) — used for birthday lists.",
      type: "string",
    }),
    defineField({
      name: "maritalStatus",
      type: "string",
      options: {
        list: [
          { title: "Single", value: "single" },
          { title: "Married", value: "married" },
          { title: "Engaged", value: "engaged" },
          { title: "Widowed", value: "widowed" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({
      name: "occupation",
      type: "string",
    }),
    defineField({
      name: "address",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "assembly",
      title: "Home assembly",
      type: "reference",
      to: [{ type: "assembly" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "lifeStage",
      title: "Life stage at FMELi",
      type: "string",
      options: {
        list: [
          { title: "Visitor", value: "visitor" },
          { title: "First-time decision", value: "decision" },
          { title: "New convert", value: "new" },
          { title: "Established member", value: "established" },
          { title: "Worker / volunteer", value: "worker" },
          { title: "Leadership", value: "leader" },
        ],
      },
      initialValue: "visitor",
    }),
    defineField({
      name: "joinedAt",
      type: "date",
      description: "When did they first start attending?",
    }),
    defineField({
      name: "ministryInterests",
      title: "Ministry interests",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Worship, Media, Ushering, Children, Outreach, etc.",
    }),
    defineField({
      name: "notes",
      type: "text",
      rows: 4,
      description: "Pastoral notes — visible to office and assembly leaders only.",
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Inactive", value: "inactive" },
          { title: "Removed by request", value: "removed" },
        ],
      },
      initialValue: "active",
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
      title: "Newest first",
      name: "newest",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
    {
      title: "By assembly",
      name: "assembly",
      by: [
        { field: "assembly._ref", direction: "asc" },
        { field: "lastName", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      firstName: "firstName",
      lastName: "lastName",
      lifeStage: "lifeStage",
      assembly: "assembly.city",
    },
    prepare: ({ firstName, lastName, lifeStage, assembly }) => ({
      title: `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Member",
      subtitle: [assembly, lifeStage].filter(Boolean).join(" · "),
    }),
  },
});
