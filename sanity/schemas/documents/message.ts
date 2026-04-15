import { defineField, defineType } from "sanity";
import { PlayIcon } from "@sanity/icons";

/**
 * A FMELi message — sermons, teaching sessions, convention messages,
 * special meeting recordings. Was previously named "sermon" before we
 * reorganised the resources area; "message" is the term the office uses
 * day-to-day so the schema follows.
 *
 * Categories live in the messageCategory document so the office can add
 * new buckets (Sunday, Wednesday teaching, convention, etc.) without a
 * code change.
 */
export default defineType({
  name: "message",
  title: "Message",
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
      name: "category",
      type: "reference",
      to: [{ type: "messageCategory" }],
      description:
        "Which group does this message belong to? Pick one or create a new category in Studio.",
    }),
    defineField({
      name: "preacher",
      type: "reference",
      to: [{ type: "pastor" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "series",
      type: "reference",
      to: [{ type: "messageSeries" }],
    }),
    defineField({
      name: "date",
      type: "date",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "scripture",
      type: "string",
      description: "e.g. Romans 8:28–30",
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
      description: "Just the ID, e.g. dQw4w9WgXcQ",
    }),
    defineField({
      name: "audioUrl",
      title: "Audio download link (pCloud / external)",
      description:
        "Paste the public share link to the message file. FMELi hosts messages on pCloud — paste the pCloud public link here and the site will surface a Download pill on the message card.",
      type: "url",
    }),
    defineField({
      name: "audioFile",
      title: "Audio file (uploaded to Sanity)",
      description: "Drag-and-drop the MP3 here for direct hosting.",
      type: "file",
      options: {
        accept: "audio/*",
      },
    }),
    defineField({
      name: "videoFile",
      title: "Video file (uploaded to Sanity)",
      description:
        "Drag-and-drop a message video file. Prefer YouTube ID for long videos.",
      type: "file",
      options: {
        accept: "video/*",
      },
    }),
    defineField({
      name: "excerpt",
      title: "Short excerpt (for cards / previews)",
      type: "text",
      rows: 3,
      validation: (R) => R.max(280),
    }),
    defineField({
      name: "excerptFile",
      title: "Excerpt document (uploaded — PDF / DOCX)",
      description:
        "Drag-and-drop the written excerpt of the message here. Visitors can download it directly from the message card.",
      type: "file",
      options: {
        accept:
          ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    }),
    defineField({
      name: "excerptUrl",
      title: "Excerpt download link (pCloud / external)",
      description:
        "If the excerpt PDF lives on pCloud (or any external host), paste the public share link here instead of uploading. The site shows a Download Excerpt pill that opens this link.",
      type: "url",
    }),
    defineField({
      name: "notes",
      title: "Message notes",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "transcript",
      title: "Full transcript",
      description: "Optional — the complete spoken transcript of the message.",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "durationMinutes",
      title: "Duration (minutes)",
      type: "number",
    }),
    defineField({
      name: "assembly",
      title: "Preached at",
      type: "reference",
      to: [{ type: "assembly" }],
      description: "Optional — which assembly was this recorded at?",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      description: "Show on the homepage featured grid?",
      initialValue: false,
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
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
    select: {
      title: "title",
      subtitle: "date",
      categoryTitle: "category.title",
      media: "thumbnail",
    },
    prepare: ({ title, subtitle, categoryTitle, media }) => ({
      title,
      subtitle: categoryTitle
        ? `${categoryTitle} · ${subtitle ?? ""}`
        : subtitle,
      media,
    }),
  },
});
