import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Music2, Download, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { sanityFetch } from "@/lib/sanity/client";
import { TRACKS_LIST_QUERY } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Track } from "@/types/sanity";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Lively music",
  description:
    "Songs of the house — original music and arrangements from the FMELi music team.",
};

function formatDuration(seconds?: number) {
  if (typeof seconds !== "number" || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function MusicPage() {
  const tracks = await sanityFetch<Track[]>({
    query: TRACKS_LIST_QUERY,
    tags: ["sanity:track:list"],
    revalidate: 300,
  });

  return (
    <>
      <PageHero
        eyebrow="Songs of the house"
        title={
          <>
            Lively{" "}
            <span className="italic text-brand-gold-soft">music</span>
          </>
        }
        subtitle="Original songs and arrangements from the FMELi music team — for personal worship and private listening."
      />

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          {tracks && tracks.length > 0 ? (
            <ul className="overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white">
              {tracks.map((t, i) => {
                const cover = t.cover
                  ? urlFor(t.cover).width(160).height(160).url()
                  : null;
                const audioHref = t.audioFileUrl ?? t.audioUrl ?? null;
                const duration = formatDuration(t.durationSeconds);
                return (
                  <li
                    key={t._id}
                    className={`group relative flex items-center gap-4 px-5 py-4 transition hover:bg-ink/2 ${i > 0 ? "border-t border-ink/6" : ""}`}
                  >
                    {/* Cover */}
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-brand-blue-ink">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={t.title}
                          width={120}
                          height={120}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Music2
                          size={20}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-gold"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-brand-blue-ink/60 opacity-0 transition group-hover:opacity-100">
                        <Play
                          size={18}
                          className="fill-brand-gold text-brand-gold"
                        />
                      </div>
                    </div>

                    {/* Title + artist */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/resources/music/${t.slug}`}
                        className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink before:absolute before:inset-0 before:content-['']"
                      >
                        {t.title}
                      </Link>
                      <p className="text-xs text-ink-soft">
                        {t.artist ?? "FMELi music team"}
                      </p>
                    </div>

                    {duration && (
                      <span className="text-xs tabular-nums text-muted">
                        {duration}
                      </span>
                    )}

                    {audioHref && (
                      <a
                        href={audioHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        aria-label={`Download ${t.title}`}
                        className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/12 text-ink-soft transition hover:border-brand-red hover:text-brand-red"
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-dashed border-ink/15 p-12 text-center text-ink-soft">
              <Music2 size={32} className="mx-auto text-brand-gold" />
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl">
                Lively music coming soon.
              </p>
              <p className="mt-3 text-sm">
                The FMELi music team is mixing the first batch. Check back
                shortly, or{" "}
                <Link
                  href="/resources/worship"
                  className="text-brand-red underline"
                >
                  browse worship sessions
                </Link>{" "}
                in the meantime.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
