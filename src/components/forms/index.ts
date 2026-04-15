/**
 * Form primitives shared across the site + dashboard.
 *
 * Goals:
 *  - One source of truth for input shape, label style, focus ring,
 *    error/success banner. Brand changes happen in this file once.
 *  - Forms compose primitives; they don't redeclare them.
 *  - Each primitive is unstyled-ish — the parent <FormSection> gives
 *    the visual frame and rhythm.
 *
 * Server-component-safe: no `"use client"` here. The primitives that
 * carry useFormStatus pending state ("SubmitButton") opt in themselves.
 */

export { FormSection } from "./FormSection";
export { FormField } from "./FormField";
export { TextInput } from "./TextInput";
export { NumberInput } from "./NumberInput";
export { Select } from "./Select";
export { Textarea } from "./Textarea";
export { FormBanner } from "./FormBanner";
export { SubmitButton } from "./SubmitButton";

// Tailwind class strings shared across primitives, exposed so callers
// that need a custom <input> can still match the rest of the form.
export const inputClass =
  "w-full rounded-lg border border-[color:rgb(11_20_27/0.12)] bg-white px-4 py-2.5 text-sm text-[color:var(--color-ink)] transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand-red)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand-red-soft)]";

export const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]";
