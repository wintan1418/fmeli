import { Container } from "./Container";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
};

/**
 * Shared hero used at the top of every archive & feature page.
 * Keeps visual rhythm consistent across /resources/messages, /meetings, etc.
 */
export function PageHero({ eyebrow, title, subtitle, children }: Props) {
  return (
    <section className="relative overflow-hidden bg-brand-blue-ink pt-28 pb-16 md:pt-44 md:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-1/4 h-[480px] w-[480px] rounded-full bg-brand-gold/22 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-10%] h-[420px] w-[420px] rounded-full bg-brand-red/30 blur-[160px]"
      />
      <Container className="relative">
        {eyebrow && (
          <p className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-gold sm:text-xs sm:tracking-[0.32em]">
            <span className="inline-block h-px w-8 bg-brand-gold sm:w-10" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-white break-words sm:text-5xl md:mt-6 md:text-7xl md:leading-[1.05]">
          {title}
        </h1>
        {subtitle && (
          <div className="mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8 md:mt-6 md:text-lg">
            {subtitle}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
