import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  tone: "error" | "success";
  message: string;
  className?: string;
};

/**
 * Inline notice the form shows after a server action returns an error
 * or success state. Used by every dashboard form so colour + spacing
 * stay consistent.
 */
export function FormBanner({ tone, message, className }: Props) {
  const isError = tone === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm",
        isError
          ? "border-[color:color-mix(in_srgb,var(--color-brand-red)_30%,white)] bg-[color:color-mix(in_srgb,var(--color-brand-red)_6%,white)] text-[color:var(--color-brand-red)]"
          : "border-[color:color-mix(in_srgb,var(--color-brand-gold)_35%,white)] bg-[color:color-mix(in_srgb,var(--color-brand-gold)_12%,white)] text-[color:var(--color-ink)]",
        className,
      )}
    >
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
}
