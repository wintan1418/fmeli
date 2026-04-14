import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

/**
 * A registration record for an event. Created by the public-facing form
 * (src/app/api/register/route.ts). Read-only to editors — they should
 * only review, export, or delete these.
 */
export default defineType({
  name: "registration",
  title: "Registration",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "event",
      type: "reference",
      to: [{ type: "event" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "submittedAt",
      type: "datetime",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "name",
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
      name: "assembly",
      title: "Home assembly",
      type: "reference",
      to: [{ type: "assembly" }],
    }),
    defineField({
      name: "extra",
      title: "Additional form fields",
      description: "Whatever else the event's registration form collected.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "key", type: "string" }),
            defineField({ name: "value", type: "string" }),
          ],
          preview: {
            select: { title: "key", subtitle: "value" },
          },
        },
      ],
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Confirmed", value: "confirmed" },
          { title: "Awaiting payment", value: "awaiting_payment" },
          { title: "Transfer pending verification", value: "transfer_pending" },
          { title: "Payment failed", value: "payment_failed" },
          { title: "Waitlist", value: "waitlist" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "confirmed",
    }),
    defineField({
      name: "paymentMethod",
      type: "string",
      options: {
        list: [
          { title: "Free (no payment required)", value: "free" },
          { title: "Paystack", value: "paystack" },
          { title: "Bank transfer", value: "transfer" },
        ],
      },
      initialValue: "free",
    }),
    defineField({
      name: "paymentReference",
      type: "string",
      description:
        "Paystack reference or transfer reference supplied by the registrant.",
    }),
    defineField({
      name: "amount",
      title: "Amount paid (NGN)",
      type: "number",
    }),
    defineField({
      name: "paidAt",
      type: "datetime",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "event.title", status: "status" },
    prepare: ({ title, subtitle, status }) => ({
      title,
      subtitle: subtitle ? `${subtitle} · ${status}` : status,
    }),
  },
});
