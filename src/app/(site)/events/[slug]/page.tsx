import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText } from "next-sanity";
import { ArrowRight, Calendar, Clock, MapPin, Users, ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import {
  EVENT_BY_SLUG_QUERY,
  ALL_EVENT_SLUGS_QUERY,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { EventDoc } from "@/types/sanity";

export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>({
    query: ALL_EVENT_SLUGS_QUERY,
    tags: ["sanity:event:list"],
  });
  return (slugs ?? []).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const event = await sanityFetch<EventDoc | null>({
    query: EVENT_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:event:${slug}`],
  });
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.tagline,
  };
}

export default async function EventPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const event = await sanityFetch<EventDoc | null>({
    query: EVENT_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:event:${slug}`],
    revalidate: 600,
  });

  if (!event) notFound();

  const start = new Date(event.startsAt);
  const dateLabel = start.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeLabel = start.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const heroUrl = event.heroImage
    ? urlFor(event.heroImage).width(1800).height(1000).url()
    : null;

  const registrationOpen =
    event.registrationEnabled !== false &&
    (!event.registrationDeadline ||
      new Date(event.registrationDeadline) > new Date());

  const spotsLeft =
    typeof event.capacity === "number"
      ? Math.max(0, event.capacity - (event.registeredCount ?? 0))
      : null;

  const registerHref =
    event.registrationMode === "external" && event.externalRegistrationUrl
      ? event.externalRegistrationUrl
      : `/events/${event.slug}/register`;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-blue-ink pt-32 pb-24 md:pt-44 md:pb-32">
        {heroUrl && (
          <div className="absolute inset-0 -z-10 opacity-30">
            <Image
              src={heroUrl}
              alt=""
              fill
              sizes="100vw"
              unoptimized
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue-ink from-10% via-brand-blue-ink/70 to-brand-blue-ink/40" />
          </div>
        )}
        <Container className="relative">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition"
          >
            <ArrowLeft size={14} />
            All events
          </Link>

          {event.isSpecial && (
            <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-gold px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-blue-ink">
              ★ Special meeting
            </p>
          )}

          <h1 className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.02] text-white md:text-7xl lg:text-[88px]">
            {event.title}
          </h1>

          {event.tagline && (
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
              {event.tagline}
            </p>
          )}

          {/* Meta */}
          <dl className="mt-12 grid max-w-3xl grid-cols-1 gap-6 border-t border-white/15 pt-8 sm:grid-cols-3">
            <div>
              <dt className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">
                <Calendar size={12} />
                Date
              </dt>
              <dd className="mt-2 font-[family-name:var(--font-display)] text-lg text-white">
                {dateLabel}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">
                <Clock size={12} />
                Time
              </dt>
              <dd className="mt-2 font-[family-name:var(--font-display)] text-lg text-white">
                {timeLabel}
              </dd>
            </div>
            {(event.location || event.assembly?.city) && (
              <div>
                <dt className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">
                  <MapPin size={12} />
                  Location
                </dt>
                <dd className="mt-2 font-[family-name:var(--font-display)] text-lg text-white">
                  {event.location ?? event.assembly?.city}
                </dd>
              </div>
            )}
          </dl>

          {registrationOpen && (
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link
                href={registerHref}
                target={
                  event.registrationMode === "external" ? "_blank" : undefined
                }
                rel={
                  event.registrationMode === "external"
                    ? "noopener noreferrer"
                    : undefined
                }
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-brand-gold px-8 text-base font-semibold text-brand-blue-ink transition-all duration-300"
              >
                Register now
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              {spotsLeft !== null && (
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  <Users size={12} />
                  {spotsLeft > 0
                    ? `${spotsLeft} spots remaining`
                    : "Fully booked"}
                </span>
              )}
            </div>
          )}
        </Container>
      </section>

      {/* Body */}
      {event.description && event.description.length > 0 && (
        <section className="bg-off-white py-20 md:py-28">
          <Container>
            <article className="prose prose-lg mx-auto max-w-3xl text-ink-soft">
              <PortableText value={event.description} />
            </article>
          </Container>
        </section>
      )}
    </>
  );
}
