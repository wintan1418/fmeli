import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Play, Clock, Download, FileText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { sanityFetch } from "@/lib/sanity/client";
import {
  MESSAGES_LIST_QUERY,
  MESSAGE_CATEGORIES_QUERY,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Message, MessageCategory } from "@/types/sanity";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Messages",
  description:
    "Messages, teachings and convention recordings from FMELi — filter by category and download for offline.",
};

export default async function MessagesPage() {
  const [messages, categories] = await Promise.all([
    sanityFetch<Message[]>({
      query: MESSAGES_LIST_QUERY,
      tags: ["sanity:message:list"],
      revalidate: 300,
    }),
    sanityFetch<MessageCategory[]>({
      query: MESSAGE_CATEGORIES_QUERY,
      tags: ["sanity:messageCategory:list"],
      revalidate: 3600,
    }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="The archive"
        title={
          <>
            Messages from{" "}
            <span className="italic text-brand-gold-soft">the pulpit</span>
          </>
        }
        subtitle="Sunday messages, midweek teaching, convention sessions and more — notes, audio and video where available."
      />

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          {/* Category chips — purely informational for now; clicking is a
              follow-up commit (we'll add ?category=<slug> filtering then). */}
          {categories && categories.length > 0 && (
            <div className="mb-12 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Categories
              </span>
              {categories.map((c) => (
                <span
                  key={c._id}
                  className="rounded-full border border-ink/12 bg-white px-3.5 py-1.5 text-xs font-medium text-ink"
                >
                  {c.title}
                </span>
              ))}
            </div>
          )}

          {messages && messages.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {messages.map((m) => {
                const thumb = m.thumbnail
                  ? urlFor(m.thumbnail).width(900).height(600).url()
                  : null;
                const audioHref = m.audioFileUrl ?? m.audioUrl ?? null;
                const excerptHref = m.excerptFileUrl ?? m.excerptUrl ?? null;
                return (
                  <article
                    key={m._id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-brand-blue-ink">
                      {thumb && (
                        <Image
                          src={thumb}
                          alt={m.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          unoptimized
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-ink/80 to-transparent" />
                      {m.category?.title && (
                        <span className="absolute left-5 top-5 inline-flex items-center rounded-full bg-brand-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-blue-ink">
                          {m.category.title}
                        </span>
                      )}
                      <div className="absolute bottom-5 right-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold text-brand-blue-ink">
                        <Play size={20} className="fill-current" />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted">
                        {m.date} {m.scripture && `· ${m.scripture}`}
                      </div>
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-ink">
                        <Link
                          href={`/resources/messages/${m.slug}`}
                          className="before:absolute before:inset-0 before:content-['']"
                        >
                          {m.title}
                        </Link>
                      </h3>
                      {m.excerpt && (
                        <p className="line-clamp-3 text-sm leading-relaxed text-ink-soft">
                          {m.excerpt}
                        </p>
                      )}
                      <div className="mt-auto space-y-3 pt-2">
                        <p className="text-sm font-medium text-ink-soft">
                          {m.preacher?.name}
                        </p>
                        {(audioHref || excerptHref) && (
                          <div className="flex flex-wrap items-center gap-2">
                            {audioHref && (
                              <a
                                href={audioHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                aria-label={`Download audio · ${m.title}`}
                                className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-brand-red/25 bg-brand-red/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-red transition hover:scale-105"
                              >
                                <Download size={12} />
                                Audio
                              </a>
                            )}
                            {excerptHref && (
                              <a
                                href={excerptHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                aria-label={`Download excerpt · ${m.title}`}
                                className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-brand-blue-ink/22 bg-brand-blue-ink/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-blue-ink transition hover:scale-105"
                              >
                                <FileText size={12} />
                                Excerpt
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-dashed border-ink/15 p-12 text-center text-ink-soft">
              <Clock size={32} className="mx-auto text-brand-gold" />
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl">
                Message archive coming soon.
              </p>
              <p className="mt-3 text-sm">
                The content team is preparing the first batch of messages.
                Subscribe to the newsletter to be notified when they land.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
