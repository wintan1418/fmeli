import { defineField, defineType } from "sanity";
import { PlayIcon } from "@sanity/icons";

/**
 * A worship session — full live worship recording from a Sunday
 * gathering, convention or special meeting. Different from a "message"
 * (which is preaching) and different from "lively music" (which are
 * studio tracks). Worship sessions are the long-form live experience.
 */
export default defineType({
  name: "worshipSession",
  title: "Worship Session",
  type: "document",
  icon: PlayIcon,
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
      name: "date",
      type: "date",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "leader",
      title: "Worship leader",
      description: "Name of the lead worshipper or worship team for this session.",
      type: "string",
    }),
    defineField({
      name: "thumbnail",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "youtubeId",
      title: "YouTube video ID",
      type: "string",
    }),
    defineField({
      name: "audioUrl",
      title: "Audio download link (pCloud / external)",
      type: "url",
    }),
    defineField({
      name: "audioFile",
      title: "Audio file (uploaded to Sanity)",
      type: "file",
      options: { accept: "audio/*" },
    }),
    defineField({
      name: "summary",
      title: "Short summary",
      type: "text",
      rows: 3,
      validation: (R) => R.max(280),
    }),
    defineField({
      name: "songList",
      title: "Set list",
      description: "One song per row — appears under the player on the detail page.",
      type: "array",
      of: [
        {
          type: "object",
          name: "song",
          fields: [
            defineField({ name: "title", type: "string", validation: (R) => R.required() }),
            defineField({ name: "writer", type: "string" }),
          ],
          preview: {
            select: { title: "title", subtitle: "writer" },
          },
        },
      ],
    }),
    defineField({
      name: "durationMinutes",
      title: "Duration (minutes)",
      type: "number",
    }),
    defineField({
      name: "assembly",
      title: "Recorded at",
      type: "reference",
      to: [{ type: "assembly" }],
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Date, newest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "date", media: "thumbnail" },
  },
});
