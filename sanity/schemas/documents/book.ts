import { defineField, defineType } from "sanity";
import { BookIcon } from "@sanity/icons";

/**
 * A book in the FMELi shop.
 *
 * MVP: the shop is a catalogue + outbound buy link, not a checkout.
 * Each book has a price (NGN) and a buyUrl that points at wherever
 * the book is actually for sale (Selar, Paystack store, Amazon, etc.).
 * Phase 2 will replace buyUrl with a real Paystack flow once the
 * pastoral team is ready.
 */
export default defineType({
  name: "book",
  title: "Book",
  type: "document",
  icon: BookIcon,
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
      name: "subtitle",
      type: "string",
    }),
    defineField({
      name: "author",
      type: "string",
      description: "If the author is a pastor in the people list, link to them too via Studio.",
    }),
    defineField({
      name: "cover",
      type: "image",
      options: { hotspot: true },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "price",
      title: "Price (NGN)",
      type: "number",
      description: "Set to 0 to mark as free.",
      validation: (R) => R.required().min(0),
    }),
    defineField({
      name: "compareAtPrice",
      title: "Compare-at price (optional, for showing a discount)",
      type: "number",
    }),
    defineField({
      name: "buyUrl",
      title: "Buy link",
      description:
        "Where the customer goes to actually pay — Selar / Paystack store / Amazon link, etc. Leave empty when out of stock.",
      type: "url",
    }),
    defineField({
      name: "summary",
      title: "Short summary (for the catalogue card)",
      type: "text",
      rows: 3,
      validation: (R) => R.max(280),
    }),
    defineField({
      name: "description",
      title: "Full description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "pages",
      type: "number",
    }),
    defineField({
      name: "language",
      type: "string",
      initialValue: "English",
    }),
    defineField({
      name: "publishedAt",
      title: "Published",
      type: "date",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "outOfStock",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Most recent first",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Price low → high",
      name: "priceAsc",
      by: [{ field: "price", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "author",
      media: "cover",
    },
  },
});
