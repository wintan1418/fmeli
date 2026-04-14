import { Container } from "@/components/ui/Container";

type Props = {
  quote?: string;
  attribution?: string;
  tone?: "white" | "default" | "blue";
};

export function QuoteBlock({ quote, attribution, tone = "white" }: Props) {
  const bg =
    tone === "blue"
      ? "var(--color-brand-red-deep)"
      : tone === "default"
        ? "var(--color-off-white)"
        : "white";
  const onDark = tone === "blue";
  const textColor = onDark ? "white" : "var(--color-ink)";

  return (
    <section
      className="py-20 md:py-28"
      style={{ background: bg, color: textColor }}
    >
      <Container>
        <figure className="mx-auto max-w-4xl text-center">
          <div
            aria-hidden
            className="mx-auto mb-8 font-[family-name:var(--font-display)] text-[120px] leading-[0.8]"
            style={{ color: "var(--color-brand-gold)" }}
          >
            &ldquo;
          </div>
          <blockquote
            className="font-[family-name:var(--font-display)] text-3xl italic leading-[1.3] md:text-5xl"
            style={{ color: textColor }}
          >
            {quote}
          </blockquote>
          {attribution && (
            <figcaption
              className="mt-10 text-xs font-semibold uppercase tracking-[0.32em]"
              style={{ color: "var(--color-brand-gold)" }}
            >
              {attribution}
            </figcaption>
          )}
        </figure>
      </Container>
    </section>
  );
}
