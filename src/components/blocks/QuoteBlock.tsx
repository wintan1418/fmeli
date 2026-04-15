import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type Tone = "white" | "default" | "blue";

type Props = {
  quote?: string;
  attribution?: string;
  tone?: Tone;
};

const TONE_CLASSES: Record<Tone, string> = {
  white: "bg-white text-ink",
  default: "bg-off-white text-ink",
  blue: "bg-brand-red-deep text-white",
};

export function QuoteBlock({ quote, attribution, tone = "white" }: Props) {
  return (
    <section className={cn("py-20 md:py-28", TONE_CLASSES[tone])}>
      <Container>
        <figure className="mx-auto max-w-4xl text-center">
          <div
            aria-hidden
            className="mx-auto mb-8 font-[family-name:var(--font-display)] text-[120px] leading-[0.8] text-brand-gold"
          >
            &ldquo;
          </div>
          <blockquote className="font-[family-name:var(--font-display)] text-3xl italic leading-[1.3] md:text-5xl">
            {quote}
          </blockquote>
          {attribution && (
            <figcaption className="mt-10 text-xs font-semibold uppercase tracking-[0.32em] text-brand-gold">
              {attribution}
            </figcaption>
          )}
        </figure>
      </Container>
    </section>
  );
}
