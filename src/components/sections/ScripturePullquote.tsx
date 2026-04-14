import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/Motion";

export function ScripturePullquote() {
  return (
    <section className="relative overflow-hidden bg-(--color-brand-red-deep) py-24 text-(--color-brand-white) md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-(--color-brand-gold)/15 blur-[140px]"
      />
      <Container className="relative">
        <FadeIn>
          <figure className="mx-auto max-w-4xl text-center">
            <div
              aria-hidden
              className="mx-auto mb-8 font-[family-name:var(--font-display)] text-[120px] leading-[0.8] text-(--color-brand-gold)"
            >
              &ldquo;
            </div>
            <blockquote className="font-[family-name:var(--font-display)] text-3xl italic leading-[1.3] text-(--color-brand-white) md:text-5xl lg:text-6xl">
              The entrance of Your word gives light; it gives understanding to
              the simple.
            </blockquote>
            <figcaption className="mt-12 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.32em] text-(--color-brand-gold)">
              <span className="inline-block h-px w-12 bg-(--color-brand-gold)" />
              Psalm 119 · 130
              <span className="inline-block h-px w-12 bg-(--color-brand-gold)" />
            </figcaption>
          </figure>
        </FadeIn>
      </Container>
    </section>
  );
}
