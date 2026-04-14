import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

type LinkValue = { label?: string; external?: string };
type CTA = { link?: LinkValue; style?: string };

type Props = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  primaryCta?: CTA;
  secondaryCta?: CTA;
  tone?: "blue" | "blue-deep" | "white";
};

export function CallToAction({
  eyebrow,
  heading,
  body,
  primaryCta,
  secondaryCta,
  tone = "blue",
}: Props) {
  const onDark = tone !== "white";
  const bg =
    tone === "white"
      ? "white"
      : tone === "blue-deep"
        ? "var(--color-brand-blue-ink)"
        : "var(--color-brand-blue)";
  const headingColor = onDark ? "white" : "var(--color-ink)";
  const bodyColor = onDark ? "rgb(255 255 255 / 0.8)" : "var(--color-ink-soft)";

  return (
    <section
      className="py-20 md:py-28"
      style={{ background: bg, color: headingColor }}
    >
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            {eyebrow && (
              <p
                className="text-xs font-semibold uppercase tracking-[0.32em]"
                style={{
                  color: onDark
                    ? "var(--color-brand-gold)"
                    : "var(--color-brand-red)",
                }}
              >
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2
                className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] md:text-5xl"
                style={{ color: headingColor }}
              >
                {heading}
              </h2>
            )}
            {body && (
              <p
                className="mt-6 max-w-xl text-base leading-7"
                style={{ color: bodyColor }}
              >
                {body}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            {primaryCta?.link?.label && primaryCta.link.external && (
              <Link
                href={primaryCta.link.external}
                className="inline-flex h-14 items-center gap-3 rounded-full px-8 text-base font-semibold"
                style={{
                  background: "var(--color-brand-gold)",
                  color: "var(--color-brand-blue-ink)",
                }}
              >
                {primaryCta.link.label}
                <ArrowRight size={18} />
              </Link>
            )}
            {secondaryCta?.link?.label && secondaryCta.link.external && (
              <Link
                href={secondaryCta.link.external}
                className="inline-flex h-14 items-center gap-3 rounded-full border px-8 text-base font-medium"
                style={{
                  borderColor: onDark
                    ? "rgb(255 255 255 / 0.3)"
                    : "rgb(11 20 27 / 0.15)",
                  color: headingColor,
                }}
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
