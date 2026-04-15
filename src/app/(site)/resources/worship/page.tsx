import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Play, Headphones, Download, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { sanityFetch } from "@/lib/sanity/client";
import { WORSHIP_SESSIONS_LIST_QUERY } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { WorshipSession } from "@/types/sanity";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Worship sessions",
  description:
    "Live worship recordings from FMELi gatherings — Sunday services, conventions and special meetings.",
};

export default async function WorshipSessionsPage() {
  const sessions = await sanityFetch<WorshipSession[]>({
    query: WORSHIP_SESSIONS_LIST_QUERY,
    tags: ["sanity:worshipSession:list"],
    revalidate: 300,
  });

  return (
    <>
      <PageHero
        eyebrow="Live worship"
        title={
          <>
            Worship sessions{" "}
            <span className="italic text-brand-gold-soft">from the house</span>
          </>
        }
        subtitle="Full live recordings from Sunday gatherings, conventions and special meetings — for personal worship and quiet reflection."
      />

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          {sessions && sessions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((s) => {
                const thumb = s.thumbnail
                  ? urlFor(s.thumbnail).width(900).height(600).url()
                  : null;
                const audioHref = s.audioFileUrl ?? s.audioUrl ?? null;
                return (
                  <article
                    key={s._id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-brand-blue-ink">
                      {thumb && (
                        <Image
                          src={thumb}
                          alt={s.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          unoptimized
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-ink/80 to-transparent" />
                      <div className="absolute bottom-5 right-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold text-brand-blue-ink">
                        <Play size={20} className="fill-current" />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted">
                        {s.date}
                        {s.durationMinutes ? ` · ${s.durationMinutes} min` : ""}
                      </div>
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-ink">
                        <Link
                          href={`/resources/worship/${s.slug}`}
                          className="before:absolute before:inset-0 before:content-['']"
                        >
                          {s.title}
                        </Link>
                      </h3>
                      {s.summary && (
                        <p className="line-clamp-3 text-sm leading-relaxed text-ink-soft">
                          {s.summary}
                        </p>
                      )}
                      <div className="mt-auto space-y-3 pt-2">
                        {s.leader && (
                          <p className="text-sm font-medium text-ink-soft">
                            Led by {s.leader}
                          </p>
                        )}
                        {audioHref && (
                          <a
                            href={audioHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            aria-label={`Download ${s.title}`}
                            className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-brand-red/25 bg-brand-red/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-red transition hover:scale-105"
                          >
                            <Download size={12} />
                            Audio
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-dashed border-ink/15 p-12 text-center text-ink-soft">
              <Headphones size={32} className="mx-auto text-brand-gold" />
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl">
                Worship sessions coming soon.
              </p>
              <p className="mt-3 text-sm">
                The media team is preparing the first batch of live recordings.
                In the meantime,{" "}
                <Link
                  href="/resources/messages"
                  className="text-brand-red underline"
                >
                  browse the messages archive
                </Link>
                .
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted">
                <Clock size={12} />
                Expected mid-2026
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
