import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type LinkValue = { label?: string; external?: string };
type CTA = { link?: LinkValue; style?: string };

type Tone = "blue" | "blue-deep" | "white";

type Props = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  primaryCta?: CTA;
  secondaryCta?: CTA;
  tone?: Tone;
};

const TONE_CLASSES: Record<
  Tone,
  {
    section: string;
    eyebrow: string;
    heading: string;
    body: string;
    secondaryBorder: string;
    secondaryText: string;
  }
> = {
  blue: {
    section: "bg-brand-blue text-white",
    eyebrow: "text-brand-gold",
    heading: "text-white",
    body: "text-white/80",
    secondaryBorder: "border-white/30",
    secondaryText: "text-white",
  },
  "blue-deep": {
    section: "bg-brand-blue-ink text-white",
    eyebrow: "text-brand-gold",
    heading: "text-white",
    body: "text-white/80",
    secondaryBorder: "border-white/30",
    secondaryText: "text-white",
  },
  white: {
    section: "bg-white text-ink",
    eyebrow: "text-brand-red",
    heading: "text-ink",
    body: "text-ink-soft",
    secondaryBorder: "border-ink/15",
    secondaryText: "text-ink",
  },
};

export function CallToAction({
  eyebrow,
  heading,
  body,
  primaryCta,
  secondaryCta,
  tone = "blue",
}: Props) {
  const t = TONE_CLASSES[tone];

  return (
    <section className={cn("py-20 md:py-28", t.section)}>
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            {eyebrow && (
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-[0.32em]",
                  t.eyebrow,
                )}
              >
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2
                className={cn(
                  "mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] md:text-5xl",
                  t.heading,
                )}
              >
                {heading}
              </h2>
            )}
            {body && (
              <p className={cn("mt-6 max-w-xl text-base leading-7", t.body)}>
                {body}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            {primaryCta?.link?.label && primaryCta.link.external && (
              <Link
                href={primaryCta.link.external}
                className="inline-flex h-14 items-center gap-3 rounded-full bg-brand-gold px-8 text-base font-semibold text-brand-blue-ink"
              >
                {primaryCta.link.label}
                <ArrowRight size={18} />
              </Link>
            )}
            {secondaryCta?.link?.label && secondaryCta.link.external && (
              <Link
                href={secondaryCta.link.external}
                className={cn(
                  "inline-flex h-14 items-center gap-3 rounded-full border px-8 text-base font-medium",
                  t.secondaryBorder,
                  t.secondaryText,
                )}
              >
                {secondaryCta.link.label}
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
