import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText, type PortableTextBlock } from "next-sanity";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import { SERMON_BY_SLUG } from "@/lib/sanity/queries";

export const revalidate = 3600;

type SermonDoc = {
  _id: string;
  title: string;
  slug?: { current?: string };
  date?: string;
  scripture?: string;
  youtubeId?: string;
  notes?: PortableTextBlock[];
  transcript?: PortableTextBlock[];
  preacher?: { name?: string; role?: string };
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await sanityFetch<SermonDoc | null>({
    query: SERMON_BY_SLUG,
    params: { slug },
    tags: [`sanity:sermon:${slug}`],
  });
  return { title: sermon?.title ?? "Sermon" };
}

export default async function SermonPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const sermon = await sanityFetch<SermonDoc | null>({
    query: SERMON_BY_SLUG,
    params: { slug },
    tags: [`sanity:sermon:${slug}`],
    revalidate: 3600,
  });
  if (!sermon) notFound();

  return (
    <>
      <section
        className="relative pt-32 pb-16 md:pt-44"
        style={{ background: "var(--color-brand-blue-ink)" }}
      >
        <Container className="relative">
          <Link
            href="/sermons"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "rgb(255 255 255 / 0.6)" }}
          >
            <ArrowLeft size={14} />
            All sermons
          </Link>
          <p
            className="mt-8 text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--color-brand-gold)" }}
          >
            {sermon.date} {sermon.scripture && `· ${sermon.scripture}`}
          </p>
          <h1
            className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] md:text-6xl"
            style={{ color: "white" }}
          >
            {sermon.title}
          </h1>
          {sermon.preacher?.name && (
            <p
              className="mt-4 text-base"
              style={{ color: "rgb(255 255 255 / 0.75)" }}
            >
              {sermon.preacher.name}
              {sermon.preacher.role && ` · ${sermon.preacher.role}`}
            </p>
          )}
          {sermon.youtubeId && (
            <div className="mt-12 aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-white/10">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${sermon.youtubeId}`}
                title={sermon.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}
        </Container>
      </section>

      {(sermon.notes || sermon.transcript) && (
        <section
          className="py-20 md:py-28"
          style={{ background: "var(--color-off-white)" }}
        >
          <Container>
            {sermon.notes && sermon.notes.length > 0 && (
              <article
                className="prose prose-lg mx-auto max-w-3xl"
                style={{ color: "var(--color-ink-soft)" }}
              >
                <h2 style={{ color: "var(--color-ink)" }}>Sermon notes</h2>
                <PortableText value={sermon.notes} />
              </article>
            )}
            {sermon.transcript && sermon.transcript.length > 0 && (
              <article
                className="prose prose-lg mx-auto mt-16 max-w-3xl border-t pt-16"
                style={{
                  color: "var(--color-ink-soft)",
                  borderColor: "rgb(11 20 27 / 0.08)",
                }}
              >
                <h2 style={{ color: "var(--color-ink)" }}>Transcript</h2>
                <PortableText value={sermon.transcript} />
              </article>
            )}
          </Container>
        </section>
      )}
    </>
  );
}
