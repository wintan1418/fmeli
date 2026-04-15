import { defineField, defineType } from "sanity";
import { TransferIcon } from "@sanity/icons";

/**
 * A "lively music" track — a single song from the FMELi music team.
 * Studio recordings, original songs, arrangements. Distinct from
 * worshipSession (live, long-form) and from message (preaching).
 *
 * Named "track" so the field set reads naturally; the public area
 * still calls them "lively music" in headings and copy.
 */
export default defineType({
  name: "track",
  title: "Lively music · Track",
  type: "document",
  icon: TransferIcon,
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
      name: "artist",
      type: "string",
      description: "Lead artist or worship team name.",
    }),
    defineField({
      name: "releasedAt",
      title: "Released",
      type: "date",
    }),
    defineField({
      name: "cover",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "audioFile",
      title: "Audio file (uploaded to Sanity)",
      type: "file",
      options: { accept: "audio/*" },
    }),
    defineField({
      name: "audioUrl",
      title: "Audio download link (pCloud / external)",
      type: "url",
    }),
    defineField({
      name: "youtubeId",
      title: "YouTube video ID",
      description:
        "Optional — if there's an official video, paste just the YouTube ID.",
      type: "string",
    }),
    defineField({
      name: "lyrics",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "writers",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "durationSeconds",
      title: "Duration (seconds)",
      type: "number",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Most recent first",
      name: "releasedDesc",
      by: [{ field: "releasedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "artist", media: "cover" },
  },
});
