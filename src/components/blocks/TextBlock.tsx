import { PortableText, type PortableTextBlock } from "next-sanity";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type Tone = "default" | "white" | "blue";

type Props = {
  eyebrow?: string;
  heading?: string;
  body?: PortableTextBlock[];
  alignment?: "left" | "center";
  tone?: Tone;
};

const TONE_CLASSES: Record<
  Tone,
  { section: string; heading: string; eyebrow: string }
> = {
  default: {
    section: "bg-off-white text-ink-soft",
    heading: "text-ink",
    eyebrow: "text-brand-red",
  },
  white: {
    section: "bg-white text-ink-soft",
    heading: "text-ink",
    eyebrow: "text-brand-red",
  },
  blue: {
    section: "bg-brand-blue-ink text-white",
    heading: "text-white",
    eyebrow: "text-brand-gold",
  },
};

export function TextBlock({
  eyebrow,
  heading,
  body,
  alignment = "left",
  tone = "default",
}: Props) {
  const t = TONE_CLASSES[tone];
  const center = alignment === "center";
  // Eyebrow rule (the small horizontal bar) — same color as the eyebrow text.
  const ruleClass = tone === "blue" ? "bg-brand-gold" : "bg-brand-red";

  return (
    <section className={cn("py-20 md:py-28", t.section)}>
      <Container>
        <div
          className={cn(center ? "mx-auto max-w-3xl text-center" : "max-w-3xl")}
        >
          {eyebrow && (
            <p
              className={cn(
                "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em]",
                t.eyebrow,
                center && "justify-center",
              )}
            >
              {center && (
                <span className={cn("inline-block h-px w-10", ruleClass)} />
              )}
              {eyebrow}
              {center && (
                <span className={cn("inline-block h-px w-10", ruleClass)} />
              )}
            </p>
          )}
          {heading && (
            <h2
              className={cn(
                "mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] md:text-5xl",
                t.heading,
              )}
            >
              {heading}
            </h2>
          )}
          {body && body.length > 0 && (
            <div className="prose prose-lg mt-8">
              <PortableText value={body} />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
