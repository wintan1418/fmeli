"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary";

type Props = {
  /** Default label when idle. */
  children: React.ReactNode;
  /** Optional override for the busy-state label. */
  pendingLabel?: string;
  tone?: Tone;
  className?: string;
};

/**
 * Submit button that auto-disables and shows a spinner while the form's
 * server action is pending. Read pending state via React's
 * useFormStatus so the parent form doesn't have to thread it manually.
 *
 * Tones:
 *   primary   — filled brand-red, used for the main "save" CTA
 *   secondary — outlined dark, used for "post comment" / softer CTAs
 */
export function SubmitButton({
  children,
  pendingLabel,
  tone = "primary",
  className,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60",
        tone === "primary"
          ? "bg-[color:var(--color-brand-red)] text-white"
          : "bg-[color:var(--color-brand-blue-ink)] text-white",
        className,
      )}
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          {pendingLabel ?? "Saving…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
