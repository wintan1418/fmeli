import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Download,
  Headphones,
  Music2,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import {
  WORSHIP_SESSION_BY_SLUG_QUERY,
  ALL_WORSHIP_SESSION_SLUGS_QUERY,
} from "@/lib/sanity/queries";
import type { WorshipSession } from "@/types/sanity";

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await sanityFetch<{ slug: string }[]>({
    query: ALL_WORSHIP_SESSION_SLUGS_QUERY,
    tags: ["sanity:worshipSession:list"],
  });
  return (rows ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const session = await sanityFetch<WorshipSession | null>({
    query: WORSHIP_SESSION_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:worshipSession:${slug}`],
  });
  return {
    title: session?.title ?? "Worship session",
    description: session?.summary,
  };
}

export default async function WorshipSessionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await sanityFetch<WorshipSession | null>({
    query: WORSHIP_SESSION_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:worshipSession:${slug}`],
    revalidate: 3600,
  });
  if (!session) notFound();

  const audioSrc = session.audioFileUrl ?? null;
  const audioDownloadHref = session.audioFileUrl ?? session.audioUrl ?? null;

  return (
    <>
      <section className="relative bg-brand-blue-ink pt-32 pb-16 md:pt-44">
        <Container className="relative">
          <Link
            href="/resources/worship"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
          >
            <ArrowLeft size={14} />
            All worship sessions
          </Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
            {session.date}
            {session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}
            {session.assembly?.city ? ` · ${session.assembly.city}` : ""}
          </p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-white md:text-6xl">
            {session.title}
          </h1>
          {session.leader && (
            <p className="mt-4 text-base text-white/75">
              Led by {session.leader}
            </p>
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
                Download audio
              </a>
            </div>
          )}

          {session.youtubeId && (
            <div className="mt-12 aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${session.youtubeId}`}
                title={session.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}

          {audioSrc && (
            <div className="mt-10 flex flex-col gap-4 rounded-[var(--radius-card)] border border-white/10 bg-white/4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 text-white">
                <Headphones size={18} className="text-brand-gold" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Listen to this session
                </p>
              </div>
              <audio
                src={audioSrc}
                controls
                preload="none"
                className="w-full md:max-w-md"
              />
            </div>
          )}
        </Container>
      </section>

      {(session.summary || (session.songList && session.songList.length > 0)) && (
        <section className="bg-off-white py-20 md:py-28">
          <Container>
            {session.summary && (
              <p className="mx-auto max-w-3xl text-center font-[family-name:var(--font-display)] text-2xl italic leading-snug text-ink md:text-3xl">
                “{session.summary}”
              </p>
            )}

            {session.songList && session.songList.length > 0 && (
              <div className="mx-auto mt-16 max-w-2xl">
                <h2 className="flex items-center gap-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
                  <Music2 size={22} className="text-brand-gold" />
                  Set list
                </h2>
                <ol className="mt-6 divide-y divide-ink/8 rounded-[var(--radius-card)] border border-ink/8 bg-white">
                  {session.songList.map((song, i) => (
                    <li
                      key={song._key ?? i}
                      className="flex items-baseline justify-between gap-4 px-6 py-4"
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">
                          {song.title}
                        </p>
                      </div>
                      {song.writer && (
                        <span className="text-xs text-ink-soft">
                          {song.writer}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Container>
        </section>
      )}
    </>
  );
}
