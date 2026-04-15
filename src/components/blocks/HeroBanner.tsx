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
  const toneClass = tone === "blue" ? "bg-brand-blue" : "bg-brand-blue-ink";
  const image = backgroundImage
    ? urlFor(backgroundImage).width(2000).height(1200).url()
    : null;
  const ctaLabel = primaryCta?.link?.label;
  const ctaHref = primaryCta?.link?.external;

  return (
    <section
      className={`relative overflow-hidden pt-32 pb-24 text-white md:pt-44 md:pb-32 ${toneClass}`}
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
            className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-blue-ink from-15% via-brand-blue-ink/70 to-brand-blue-ink/40"
          />
        </>
      )}
      <Container className="relative">
        {eyebrow && (
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-brand-gold">
            <span className="inline-block h-px w-10 bg-brand-gold" />
            {eyebrow}
          </p>
        )}
        {heading && (
          <h1 className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.02] text-white md:text-7xl lg:text-[88px]">
            {heading}
          </h1>
        )}
        {subheading && (
          <p className="mt-8 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
            {subheading}
          </p>
        )}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-brand-gold px-8 text-base font-semibold text-brand-blue-ink"
          >
            {ctaLabel}
            <ArrowRight size={18} />
          </Link>
        )}
      </Container>
    </section>
  );
}
