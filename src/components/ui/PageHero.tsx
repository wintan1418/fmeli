import { Container } from "./Container";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
};

/**
 * Shared hero used at the top of every archive & feature page.
 * Keeps visual rhythm consistent across /sermons, /meetings, etc.
 */
export function PageHero({ eyebrow, title, subtitle, children }: Props) {
  return (
    <section
      className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28"
      style={{ background: "var(--color-brand-blue-ink)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-1/4 h-[480px] w-[480px] rounded-full blur-[160px]"
        style={{
          background: "color-mix(in srgb, var(--color-brand-gold) 22%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-10%] h-[420px] w-[420px] rounded-full blur-[160px]"
        style={{
          background: "color-mix(in srgb, var(--color-brand-red) 30%, transparent)",
        }}
      />
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
        <h1
          className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] md:text-7xl"
          style={{ color: "white" }}
        >
          {title}
        </h1>
        {subtitle && (
          <div
            className="mt-6 max-w-2xl text-base leading-8 md:text-lg"
            style={{ color: "rgb(255 255 255 / 0.8)" }}
          >
            {subtitle}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
