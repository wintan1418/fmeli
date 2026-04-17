import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText } from "next-sanity";
import { ArrowLeft, MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PastorAvatar } from "@/components/ui/PastorAvatar";
import { VideoHero } from "@/components/ui/VideoHero";
import { AssemblyAnnouncementCard } from "@/components/ui/AssemblyAnnouncementCard";
import { sanityFetch } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import {
  ASSEMBLY_BY_SLUG_QUERY,
  ALL_ASSEMBLY_SLUGS_QUERY,
} from "@/lib/sanity/queries";
import type { Assembly } from "@/types/sanity";

export const revalidate = 600;

export async function generateStaticParams() {
  const rows = await sanityFetch<{ slug: string }[]>({
    query: ALL_ASSEMBLY_SLUGS_QUERY,
    tags: ["sanity:assembly:list"],
  });
  return (rows ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const a = await sanityFetch<Assembly | null>({
    query: ASSEMBLY_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:assembly:${slug}`],
  });
  return {
    title: a ? `${a.city} Assembly` : "Assembly",
    description: a?.tagline,
  };
}

export default async function AssemblyPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const a = await sanityFetch<Assembly | null>({
    query: ASSEMBLY_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:assembly:${slug}`],
    revalidate: 600,
  });
  if (!a) notFound();

  // Background image: assembly's own heroImage if uploaded, otherwise a
  // generic FMELi cathedral fallback so the hero never looks naked.
  const heroBgUrl = a.heroImage?.asset?._ref
    ? urlFor(a.heroImage).width(2400).height(1400).url()
    : "/images/church-cross.jpg";

  const hasWelcomeVideo = Boolean(a.welcomeVideo?.url);
  const welcomePoster = a.welcomeVideo?.poster
    ? urlFor(a.welcomeVideo.poster).width(1600).height(900).url()
    : null;

  return (
    <>
      {/* Hero — split layout when there's a welcome video. Copy on the
          left (city + tagline + pastor attribution + service-time peek),
          the framed video on the right. No welcome video? Revert to a
          wide single-column treatment so the page still carries weight. */}
      <section className="relative isolate overflow-hidden bg-brand-blue-ink pt-32 pb-20 md:pt-44 md:pb-28 lg:pt-52">
        <Image
          src={heroBgUrl}
          alt=""
          fill
          sizes="100vw"
          unoptimized={heroBgUrl.startsWith("https://")}
          priority
          className="absolute inset-0 -z-10 object-cover object-center opacity-30"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,var(--color-brand-blue-ink)_5%,rgba(6,30,44,0.9)_45%,rgba(6,30,44,0.7)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-1/4 -z-10 h-[520px] w-[520px] rounded-full bg-brand-gold/22 blur-[160px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-[-10%] -z-10 h-[420px] w-[420px] rounded-full bg-brand-red/35 blur-[160px]"
        />
        <Container className="relative">
          <Link
            href="/assemblies"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            All assemblies
          </Link>

          <div
            className={
              hasWelcomeVideo
                ? "mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-[1fr_1.15fr] lg:gap-14"
                : "mt-10 lg:mt-14"
            }
          >
            {/* Copy column */}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-gold">
                FMELi {a.state ?? "Nigeria"}
              </p>
              <h1
                className={
                  // When the hero carries a video, the city name has to
                  // share space with the player — cap it at 8xl on wide
                  // screens so the two columns feel balanced. No video?
                  // Go big (120px) for that cathedral cover-page look.
                  hasWelcomeVideo
                    ? "mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.98] text-white break-words sm:text-6xl md:text-7xl lg:text-8xl"
                    : "mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.98] text-white break-words sm:text-6xl md:text-8xl lg:text-[120px]"
                }
              >
                {a.city}
              </h1>
              {a.tagline && (
                <p className="mt-5 max-w-xl text-base italic text-white/75 sm:text-lg md:mt-6">
                  {a.tagline}
                </p>
              )}

              {a.leadPastor?.name && (
                <div className="mt-8 flex items-center gap-4">
                  <PastorAvatar
                    name={a.leadPastor.name}
                    image={a.leadPastor.image}
                    size={56}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold-soft">
                      Lead pastor
                    </p>
                    <p className="truncate font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                      {a.leadPastor.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video column — cinema frame with a floating caption and
                a gentle gold glow behind the screen. */}
            {hasWelcomeVideo && (
              <div className="relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] bg-brand-gold/20 blur-[80px]"
                />
                {/* The caption sits above the frame as a small gold
                    eyebrow so the video reads as "a word from <pastor>". */}
                {(a.welcomeVideo?.caption || a.leadPastor?.name) && (
                  <p className="mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-gold sm:text-xs sm:tracking-[0.28em]">
                    <span className="inline-block h-px w-8 bg-brand-gold" />
                    {a.welcomeVideo?.caption ??
                      (a.leadPastor?.name
                        ? `A welcome from ${a.leadPastor.name}`
                        : "A welcome")}
                  </p>
                )}
                <VideoHero
                  url={a.welcomeVideo!.url}
                  posterUrl={welcomePoster}
                  caption={null}
                  variant="cinema"
                />
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Active announcements — first thing below the hero so
          visitors see what's happening now. */}
      {a.announcements && a.announcements.length > 0 && (
        <section className="bg-off-white pt-14 md:pt-20">
          <Container>
            <div className="grid gap-6">
              {a.announcements.map((ann) => (
                <AssemblyAnnouncementCard key={ann._id} announcement={ann} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Lead pastor feature + service times */}
      <section className="bg-off-white py-16 md:py-28">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            {/* Lead pastor */}
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-brand-red">
                <span className="inline-block h-px w-10 bg-brand-red" />
                Lead pastor
              </p>

              <div className="mt-8 flex items-center gap-6">
                <div className="rounded-full ring-4 ring-brand-gold/20">
                  <PastorAvatar
                    name={a.leadPastor?.name}
                    image={a.leadPastor?.image}
                    size={112}
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-ink break-words md:text-4xl">
                    {a.leadPastor?.name ?? "To be announced"}
                  </h2>
                  {a.leadPastor?.role && (
                    <p className="mt-2 inline-flex items-center rounded-full bg-brand-red/8 px-3 py-1 text-xs font-medium text-brand-red">
                      {a.leadPastor.role}
                    </p>
                  )}
                </div>
              </div>

              {a.leadPastor?.bio && a.leadPastor.bio.length > 0 && (
                <div className="prose prose-lg mt-10 max-w-none text-ink-soft">
                  <PortableText value={a.leadPastor.bio} />
                </div>
              )}

              {/* About this assembly */}
              {a.about && a.about.length > 0 && (
                <div className="mt-12 border-t border-ink/8 pt-12">
                  <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-brand-red">
                    <span className="inline-block h-px w-10 bg-brand-red" />
                    About this assembly
                  </p>
                  <div className="mt-6 border-l-2 border-brand-gold/40 pl-6">
                    <div className="prose prose-lg max-w-none text-ink-soft">
                      <PortableText value={a.about} />
                    </div>
                  </div>
                </div>
              )}

              {/* Other leaders */}
              {a.leaders && a.leaders.length > 0 && (
                <div className="mt-12 border-t border-ink/8 pt-12">
                  <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-brand-red">
                    <span className="inline-block h-px w-10 bg-brand-red" />
                    Ministry team
                  </p>
                  <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                    {a.leaders.map((l) => (
                      <li
                        key={l._id}
                        className="flex items-center gap-4 rounded-xl border border-ink/6 bg-white p-4 transition hover:shadow-sm"
                      >
                        <PastorAvatar
                          name={l.name}
                          image={l.image}
                          size={52}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-[family-name:var(--font-display)] text-sm font-semibold leading-tight text-ink">
                            {l.name}
                          </p>
                          {l.role && (
                            <p className="mt-0.5 truncate text-xs text-muted">
                              {l.role}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar: contact + service times */}
            <aside className="space-y-6 lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
                <div className="border-b border-ink/6 bg-off-white px-7 py-4">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-red">
                    <MapPin size={12} />
                    Visit us
                  </p>
                </div>
                <dl className="space-y-4 p-7">
                  {a.address && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10">
                        <MapPin size={14} className="text-brand-gold" />
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                          Address
                        </dt>
                        <dd className="mt-0.5 text-sm text-ink">{a.address}</dd>
                      </div>
                    </div>
                  )}
                  {a.phone && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10">
                        <Phone size={14} className="text-brand-gold" />
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                          Phone
                        </dt>
                        <dd className="mt-0.5 text-sm text-ink">{a.phone}</dd>
                      </div>
                    </div>
                  )}
                  {a.email && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10">
                        <Mail size={14} className="text-brand-gold" />
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                          Email
                        </dt>
                        <dd className="mt-0.5 text-sm text-ink">{a.email}</dd>
                      </div>
                    </div>
                  )}
                  {a.mapUrl && (
                    <a
                      href={a.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-red/8 px-4 py-2 text-xs font-semibold text-brand-red transition hover:bg-brand-red/15"
                    >
                      Open in Maps
                      <ExternalLink size={12} />
                    </a>
                  )}
                </dl>
              </div>

              <div className="overflow-hidden rounded-2xl bg-brand-blue-ink text-white shadow-lg">
                <div className="border-b border-white/10 px-7 py-4">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">
                    <Clock size={12} />
                    Service times
                  </p>
                </div>
                {a.serviceTimes && a.serviceTimes.length > 0 ? (
                  <ul className="divide-y divide-white/8 px-7">
                    {a.serviceTimes.map((st, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-4 py-5"
                      >
                        <div>
                          <p className="font-[family-name:var(--font-display)] text-base font-semibold">
                            {st.label}
                          </p>
                          <p className="mt-0.5 text-xs text-white/55">{st.day}</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-4 py-1.5 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-gold">
                          {st.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-7 text-sm text-white/70">
                    Service times will appear once added in Studio.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
