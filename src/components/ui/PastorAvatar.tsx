import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { cn } from "@/lib/utils";

type Props = {
  name?: string;
  image?: { asset?: { _ref?: string } } | null;
  size?: number;
  className?: string;
};

/**
 * Circular avatar for a pastor. Shows the uploaded image if available,
 * otherwise falls back to initials on a branded gradient so the assembly
 * cards never look broken.
 *
 * The width/height/fontSize live in `style` because they vary per-call;
 * everything else (gradient fallback, gold ring, drop shadow) is in
 * className so we get one source of truth for the look.
 */
export function PastorAvatar({ name, image, size = 72, className }: Props) {
  const src = image?.asset?._ref
    ? urlFor(image).width(size * 2).height(size * 2).url()
    : null;
  const initials = (name ?? "FM")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Shared with both branches: gold ring + soft outer shadow.
  const ringClasses =
    "shadow-[0_0_0_2px_var(--color-brand-gold),0_8px_24px_-8px_rgb(11_20_27/0.25)]";

  if (src) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-full",
          ringClasses,
          className,
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={name ?? ""}
          width={size * 2}
          height={size * 2}
          unoptimized
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-red font-[family-name:var(--font-display)] font-semibold tracking-wide text-white",
        ringClasses,
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
      }}
    >
      {initials}
    </div>
  );
}
