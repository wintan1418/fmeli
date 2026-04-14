import { PortableText, type PortableTextBlock } from "next-sanity";
import { Container } from "@/components/ui/Container";

type Props = {
  eyebrow?: string;
  heading?: string;
  body?: PortableTextBlock[];
  alignment?: "left" | "center";
  tone?: "default" | "white" | "blue";
};

export function TextBlock({
  eyebrow,
  heading,
  body,
  alignment = "left",
  tone = "default",
}: Props) {
  const bg =
    tone === "blue"
      ? "var(--color-brand-blue-ink)"
      : tone === "white"
        ? "white"
        : "var(--color-off-white)";
  const text = tone === "blue" ? "white" : "var(--color-ink-soft)";
  const headingColor = tone === "blue" ? "white" : "var(--color-ink)";

  return (
    <section
      className="py-20 md:py-28"
      style={{ background: bg, color: text }}
    >
      <Container>
        <div
          className={
            alignment === "center"
              ? "mx-auto max-w-3xl text-center"
              : "max-w-3xl"
          }
        >
          {eyebrow && (
            <p
              className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em]"
              style={{
                color:
                  tone === "blue"
                    ? "var(--color-brand-gold)"
                    : "var(--color-brand-red)",
                justifyContent: alignment === "center" ? "center" : undefined,
              }}
            >
              {alignment === "center" && (
                <span
                  className="inline-block h-px w-10"
                  style={{
                    background:
                      tone === "blue"
                        ? "var(--color-brand-gold)"
                        : "var(--color-brand-red)",
                  }}
                />
              )}
              {eyebrow}
              {alignment === "center" && (
                <span
                  className="inline-block h-px w-10"
                  style={{
                    background:
                      tone === "blue"
                        ? "var(--color-brand-gold)"
                        : "var(--color-brand-red)",
                  }}
                />
              )}
            </p>
          )}
          {heading && (
            <h2
              className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] md:text-5xl"
              style={{ color: headingColor }}
            >
              {heading}
            </h2>
          )}
          {body && body.length > 0 && (
            <div className="prose prose-lg mt-8" style={{ color: text }}>
              <PortableText value={body} />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
