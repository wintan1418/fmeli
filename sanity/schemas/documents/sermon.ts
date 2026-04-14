import { defineField, defineType } from "sanity";
import { PlayIcon } from "@sanity/icons";

export default defineType({
  name: "sermon",
  title: "Sermon",
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
      name: "preacher",
      type: "reference",
      to: [{ type: "pastor" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "series",
      type: "reference",
      to: [{ type: "sermonSeries" }],
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
      title: "Audio URL (external — Drive, Dropbox, WeTransfer, etc.)",
      description: "Use this if the file lives outside Sanity. Paste the share link.",
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
      description: "Drag-and-drop a sermon video file. Prefer YouTube ID for long videos.",
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
      name: "notes",
      title: "Sermon notes",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "transcript",
      title: "Full transcript",
      description: "Optional — the complete spoken transcript of the sermon.",
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
    select: { title: "title", subtitle: "date", media: "thumbnail" },
  },
});
