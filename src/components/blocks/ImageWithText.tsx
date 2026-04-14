import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PortableText, type PortableTextBlock } from "next-sanity";
import { Container } from "@/components/ui/Container";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  eyebrow?: string;
  heading?: string;
  body?: PortableTextBlock[];
  image?: { asset?: { _ref?: string } };
  imagePosition?: "left" | "right";
  cta?: { link?: { label?: string; external?: string } };
};

export function ImageWithText({
  eyebrow,
  heading,
  body,
  image,
  imagePosition = "left",
  cta,
}: Props) {
  const src = image?.asset?._ref
    ? urlFor(image).width(1600).height(1200).url()
    : null;

  return (
    <section
      className="py-20 md:py-28"
      style={{ background: "var(--color-off-white)" }}
    >
      <Container>
        <div
          className="grid gap-12 md:grid-cols-2 md:items-center"
          style={{
            gridTemplateAreas:
              imagePosition === "right" ? '"text image"' : '"image text"',
          }}
        >
          {src && (
            <div
              className="relative overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card-hover)]"
              style={{ gridArea: "image" }}
            >
              <Image
                src={src}
                alt={heading ?? ""}
                width={1600}
                height={1200}
                unoptimized
                className="h-auto w-full object-cover"
              />
            </div>
          )}
          <div style={{ gridArea: "text" }}>
            {eyebrow && (
              <p
                className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em]"
                style={{ color: "var(--color-brand-red)" }}
              >
                <span
                  className="inline-block h-px w-10"
                  style={{ background: "var(--color-brand-red)" }}
                />
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2
                className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] md:text-5xl"
                style={{ color: "var(--color-ink)" }}
              >
                {heading}
              </h2>
            )}
            {body && body.length > 0 && (
              <div
                className="prose prose-lg mt-6 max-w-none"
                style={{ color: "var(--color-ink-soft)" }}
              >
                <PortableText value={body} />
              </div>
            )}
            {cta?.link?.label && cta.link.external && (
              <Link
                href={cta.link.external}
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold"
                style={{
                  background: "var(--color-brand-red)",
                  color: "white",
                }}
              >
                {cta.link.label}
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
