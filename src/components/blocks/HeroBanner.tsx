import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  primaryCta?: { link?: { label?: string; external?: string }; style?: string };
  backgroundImage?: { asset?: { _ref?: string } };
  tone?: "blue" | "blue-deep";
};

export function HeroBanner({
  eyebrow,
  heading,
  subheading,
  primaryCta,
  backgroundImage,
  tone = "blue-deep",
}: Props) {
  const bg = tone === "blue" ? "var(--color-brand-blue)" : "var(--color-brand-blue-ink)";
  const image = backgroundImage
    ? urlFor(backgroundImage).width(2000).height(1200).url()
    : null;
  const ctaLabel = primaryCta?.link?.label;
  const ctaHref = primaryCta?.link?.external;

  return (
    <section
      className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32"
      style={{ background: bg, color: "white" }}
    >
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            unoptimized
            className="absolute inset-0 -z-10 object-cover opacity-30"
            priority
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(to right, var(--color-brand-blue-ink) 15%, rgba(6,30,44,0.7) 55%, rgba(6,30,44,0.4))",
            }}
          />
        </>
      )}
      <Container className="relative">
        {eyebrow && (
          <p
            className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em]"
            style={{ color: "var(--color-brand-gold)" }}
          >
            <span
              className="inline-block h-px w-10"
              style={{ background: "var(--color-brand-gold)" }}
            />
            {eyebrow}
          </p>
        )}
        {heading && (
          <h1
            className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.02] md:text-7xl lg:text-[88px]"
            style={{ color: "white" }}
          >
            {heading}
          </h1>
        )}
        {subheading && (
          <p
            className="mt-8 max-w-2xl text-base leading-8 md:text-lg"
            style={{ color: "rgb(255 255 255 / 0.8)" }}
          >
            {subheading}
          </p>
        )}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="mt-10 inline-flex h-14 items-center gap-3 rounded-full px-8 text-base font-semibold"
            style={{
              background: "var(--color-brand-gold)",
              color: "var(--color-brand-blue-ink)",
            }}
          >
            {ctaLabel}
            <ArrowRight size={18} />
          </Link>
        )}
      </Container>
    </section>
  );
}
