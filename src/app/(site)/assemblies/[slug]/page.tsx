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

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-brand-blue-ink pt-36 pb-24 md:pt-52 md:pb-32">
        <Image
          src={heroBgUrl}
          alt=""
          fill
          sizes="100vw"
          unoptimized={heroBgUrl.startsWith("https://")}
          priority
          className="absolute inset-0 -z-10 object-cover object-center opacity-40"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,var(--color-brand-blue-ink)_5%,rgba(6,30,44,0.85)_45%,rgba(6,30,44,0.55)_100%)]"
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
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
          >
            <ArrowLeft size={14} />
            All assemblies
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.32em] text-brand-gold">
            FMELi {a.state ?? "Nigeria"}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-6xl font-semibold leading-[0.98] text-white md:text-8xl lg:text-[120px]">
            {a.city}
          </h1>
          {a.tagline && (
            <p className="mt-6 max-w-2xl text-lg italic text-white/75">
              {a.tagline}
            </p>
          )}
        </Container>
      </section>

      {/* Active announcements — pinned above everything so the first
          thing a visitor sees is what's happening now. */}
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

      {/* Welcome video — lead pastor's invitation / prayer */}
      {a.welcomeVideo?.url && (
        <section className="bg-off-white pt-14 md:pt-20">
          <Container>
            <div className="mx-auto max-w-5xl">
              <VideoHero
                url={a.welcomeVideo.url}
                posterUrl={
                  a.welcomeVideo.poster
                    ? urlFor(a.welcomeVideo.poster).width(1600).height(900).url()
                    : null
                }
                caption={
                  a.welcomeVideo.caption ??
                  (a.leadPastor?.name
                    ? `A welcome from ${a.leadPastor.name}`
                    : "A welcome")
                }
              />
            </div>
          </Container>
        </section>
      )}

      {/* Lead pastor feature + service times */}
      <section className="bg-off-white py-20 md:py-28">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            {/* Lead pastor */}
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-brand-red">
                <span className="inline-block h-px w-10 bg-brand-red" />
                Lead pastor
              </p>

              <div className="mt-8 flex items-center gap-6">
                <PastorAvatar
                  name={a.leadPastor?.name}
                  image={a.leadPastor?.image}
                  size={112}
                />
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-ink md:text-4xl">
                    {a.leadPastor?.name ?? "To be announced"}
                  </h2>
                  {a.leadPastor?.role && (
                    <p className="mt-2 text-sm text-ink-soft">
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
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-red">
                    About this assembly
                  </p>
                  <div className="prose prose-lg mt-6 max-w-none text-ink-soft">
                    <PortableText value={a.about} />
                  </div>
                </div>
              )}

              {/* Other leaders */}
              {a.leaders && a.leaders.length > 0 && (
                <div className="mt-12 border-t border-ink/8 pt-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-red">
                    Ministry team
                  </p>
                  <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                    {a.leaders.map((l) => (
                      <li key={l._id} className="flex items-center gap-4">
                        <PastorAvatar
                          name={l.name}
                          image={l.image}
                          size={56}
                        />
                        <div>
                          <p className="font-[family-name:var(--font-display)] text-base font-semibold leading-tight text-ink">
                            {l.name}
                          </p>
                          {l.role && (
                            <p className="text-xs text-muted">{l.role}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar: contact + service times */}
            <aside className="space-y-8 lg:sticky lg:top-28">
              <div className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-red">
                  Visit us
                </p>
                <dl className="mt-6 space-y-5">
                  {a.address && (
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={16}
                        className="mt-0.5 flex-shrink-0 text-brand-gold"
                      />
                      <div>
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                          Address
                        </dt>
                        <dd className="text-ink">{a.address}</dd>
                      </div>
                    </div>
                  )}
                  {a.phone && (
                    <div className="flex items-start gap-3">
                      <Phone
                        size={16}
                        className="mt-0.5 flex-shrink-0 text-brand-gold"
                      />
                      <div>
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                          Phone
                        </dt>
                        <dd className="text-ink">{a.phone}</dd>
                      </div>
                    </div>
                  )}
                  {a.email && (
                    <div className="flex items-start gap-3">
                      <Mail
                        size={16}
                        className="mt-0.5 flex-shrink-0 text-brand-gold"
                      />
                      <div>
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                          Email
                        </dt>
                        <dd className="text-ink">{a.email}</dd>
                      </div>
                    </div>
                  )}
                  {a.mapUrl && (
                    <a
                      href={a.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red"
                    >
                      Open in Maps
                      <ExternalLink size={14} />
                    </a>
                  )}
                </dl>
              </div>

              <div className="rounded-[var(--radius-card)] bg-brand-blue-ink p-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                  Service times
                </p>
                {a.serviceTimes && a.serviceTimes.length > 0 ? (
                  <ul className="mt-6 space-y-5">
                    {a.serviceTimes.map((st, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-4 border-b border-white/10 pb-5 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-brand-gold" />
                          <div>
                            <p className="font-[family-name:var(--font-display)] font-semibold">
                              {st.label}
                            </p>
                            <p className="text-xs text-white/55">{st.day}</p>
                          </div>
                        </div>
                        <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-brand-gold-soft">
                          {st.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 text-sm text-white/70">
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
