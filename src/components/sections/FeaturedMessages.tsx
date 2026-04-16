import Image from "next/image";
import Link from "next/link";
import { Play, ArrowRight, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/Motion";
import { sanityFetch } from "@/lib/sanity/client";
import { FEATURED_MESSAGES_QUERY } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Message } from "@/types/sanity";

/**
 * Homepage "Latest messages" grid.
 *
 * Server component — fetches the 3 latest (or featured-pinned)
 * messages from Sanity at request time, with the same 5-minute
 * revalidate window the rest of the public site uses. The office
 * can pin a message to the top by toggling its `featured` boolean
 * in Studio.
 */
export async function FeaturedMessages() {
  const messages = await sanityFetch<Message[]>({
    query: FEATURED_MESSAGES_QUERY,
    tags: ["sanity:message:list", "sanity:message:featured"],
    revalidate: 300,
  });

  // No messages yet — render nothing instead of an empty section.
  // The dev seed ships with 8 so this only fires on a fresh dataset.
  if (!messages || messages.length === 0) return null;

  return (
    <section className="relative bg-off-white py-16 md:py-32">
      <Container>
        <FadeIn>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-red sm:text-xs sm:tracking-[0.32em]">
                <span className="inline-block h-px w-8 bg-brand-red sm:w-10" />
                Latest messages
              </p>
              <h2 className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.1] tracking-tight text-ink break-words sm:text-4xl md:text-5xl lg:text-[56px]">
                Fresh light from{" "}
                <span className="italic text-brand-red">the Word</span>
              </h2>
            </div>
            <Link
              href="/resources/messages"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-ink transition hover:text-brand-red"
            >
              All messages
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </FadeIn>

        <StaggerChildren className="mt-10 grid gap-5 md:mt-14 md:gap-6 md:grid-cols-3">
          {messages.map((m) => {
            const thumb = m.thumbnail
              ? urlFor(m.thumbnail).width(900).height(600).url()
              : null;
            const dateLabel = m.date
              ? new Date(m.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null;
            return (
              <StaggerItem key={m._id} className="min-w-0">
                <Link
                  href={`/resources/messages/${m.slug}`}
                  className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-card)] bg-brand-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-brand-blue-ink">
                    {thumb && (
                      <Image
                        src={thumb}
                        alt={m.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-ink/80 via-transparent to-transparent" />
                    {(m.category?.title || m.featured) && (
                      <span className="absolute left-4 top-4 inline-flex max-w-[calc(100%-2rem)] items-center gap-1 truncate rounded-full bg-brand-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-blue-ink sm:left-5 sm:top-5 sm:tracking-[0.18em]">
                        {m.featured ? "★ Featured" : m.category!.title}
                      </span>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between sm:bottom-5 sm:left-5 sm:right-5">
                      {m.durationMinutes && (
                        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-white">
                          <Clock size={12} />
                          {m.durationMinutes} min
                        </div>
                      )}
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-brand-blue-ink shadow-[var(--shadow-glow-gold)] transition-transform duration-500 group-hover:scale-110 sm:h-14 sm:w-14">
                        <Play size={18} className="fill-current sm:[&]:size-5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5 sm:gap-4 sm:p-7">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted sm:text-xs sm:tracking-[0.2em]">
                      {dateLabel}
                      {m.scripture && ` · ${m.scripture}`}
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-ink break-words transition-colors group-hover:text-brand-red sm:text-2xl">
                      {m.title}
                    </h3>
                    {m.excerpt && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
                        {m.excerpt}
                      </p>
                    )}
                    {m.preacher?.name && (
                      <p className="mt-auto text-sm font-medium text-ink-soft">
                        {m.preacher.name}
                      </p>
                    )}
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </Container>
    </section>
  );
}
