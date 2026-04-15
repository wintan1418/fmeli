import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText } from "next-sanity";
import { ArrowLeft, Download, Music2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import {
  TRACK_BY_SLUG_QUERY,
  ALL_TRACK_SLUGS_QUERY,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Track } from "@/types/sanity";

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await sanityFetch<{ slug: string }[]>({
    query: ALL_TRACK_SLUGS_QUERY,
    tags: ["sanity:track:list"],
  });
  return (rows ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const track = await sanityFetch<Track | null>({
    query: TRACK_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:track:${slug}`],
  });
  return {
    title: track?.title ?? "Track",
    description: track?.artist
      ? `${track.title} by ${track.artist} — FMELi lively music`
      : track?.title,
  };
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const track = await sanityFetch<Track | null>({
    query: TRACK_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:track:${slug}`],
    revalidate: 3600,
  });
  if (!track) notFound();

  const cover = track.cover
    ? urlFor(track.cover).width(900).height(900).url()
    : null;
  const audioSrc = track.audioFileUrl ?? null;
  const audioDownloadHref = track.audioFileUrl ?? track.audioUrl ?? null;

  return (
    <>
      <section className="relative bg-brand-blue-ink pt-32 pb-20 md:pt-44 md:pb-28">
        <Container className="relative">
          <Link
            href="/resources/music"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
          >
            <ArrowLeft size={14} />
            All tracks
          </Link>

          <div className="mt-10 grid gap-10 md:grid-cols-[280px_1fr] md:items-end">
            {/* Cover */}
            <div className="aspect-square w-full max-w-[280px] overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-brand-blue-deep shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
              {cover ? (
                <Image
                  src={cover}
                  alt={track.title}
                  width={560}
                  height={560}
                  unoptimized
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Music2 size={48} className="text-brand-gold" />
                </div>
              )}
            </div>

            {/* Title block */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                Lively music
                {track.releasedAt ? ` · ${track.releasedAt}` : ""}
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-white md:text-6xl">
                {track.title}
              </h1>
              {track.artist && (
                <p className="mt-3 text-base text-white/75">
                  {track.artist}
                </p>
              )}
              {track.writers && track.writers.length > 0 && (
                <p className="mt-1 text-xs text-white/55">
                  Written by {track.writers.join(", ")}
                </p>
              )}

              {audioSrc && (
                <div className="mt-8">
                  <audio
                    src={audioSrc}
                    controls
                    preload="none"
                    className="w-full md:max-w-md"
                  />
                </div>
              )}

              {audioDownloadHref && (
                <div className="mt-6">
                  <a
                    href={audioDownloadHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue-ink transition hover:scale-[1.02]"
                  >
                    <Download size={14} />
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {track.lyrics && track.lyrics.length > 0 && (
        <section className="bg-off-white py-20 md:py-28">
          <Container>
            <article className="prose prose-lg mx-auto max-w-2xl text-ink-soft">
              <h2 className="text-ink">Lyrics</h2>
              <PortableText value={track.lyrics} />
            </article>
          </Container>
        </section>
      )}
    </>
  );
}
