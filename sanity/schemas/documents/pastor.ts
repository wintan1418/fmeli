import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

export default defineType({
  name: "pastor",
  title: "Pastor / Team Member",
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
      type: "string",
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
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "image" },
  },
});
