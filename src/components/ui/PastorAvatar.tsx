import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";

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

  if (src) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "9999px",
          overflow: "hidden",
          boxShadow: "0 0 0 2px var(--color-brand-gold), 0 8px 24px -8px rgb(11 20 27 / 0.25)",
        }}
      >
        <Image
          src={src}
          alt={name ?? ""}
          width={size * 2}
          height={size * 2}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        background:
          "linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-red) 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: Math.round(size * 0.38),
        letterSpacing: "0.02em",
        boxShadow:
          "0 0 0 2px var(--color-brand-gold), 0 8px 24px -8px rgb(11 20 27 / 0.25)",
      }}
    >
      {initials}
    </div>
  );
}
