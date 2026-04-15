import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText } from "next-sanity";
import { ArrowLeft, MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PastorAvatar } from "@/components/ui/PastorAvatar";
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
      <section
        className="relative isolate overflow-hidden pt-36 pb-24 md:pt-52 md:pb-32"
        style={{ background: "var(--color-brand-blue-ink)" }}
      >
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
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(115deg, var(--color-brand-blue-ink) 5%, rgba(6,30,44,0.85) 45%, rgba(6,30,44,0.55) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-1/4 -z-10 h-[520px] w-[520px] rounded-full blur-[160px]"
          style={{
            background:
              "color-mix(in srgb, var(--color-brand-gold) 22%, transparent)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-[-10%] -z-10 h-[420px] w-[420px] rounded-full blur-[160px]"
          style={{
            background:
              "color-mix(in srgb, var(--color-brand-red) 35%, transparent)",
          }}
        />
        <Container className="relative">
          <Link
            href="/assemblies"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "rgb(255 255 255 / 0.6)" }}
          >
            <ArrowLeft size={14} />
            All assemblies
          </Link>
          <p
            className="mt-10 text-xs font-semibold uppercase tracking-[0.32em]"
            style={{ color: "var(--color-brand-gold)" }}
          >
            FMELi {a.state ?? "Nigeria"}
          </p>
          <h1
            className="mt-4 font-[family-name:var(--font-display)] text-6xl font-semibold leading-[0.98] md:text-8xl lg:text-[120px]"
            style={{ color: "white" }}
          >
            {a.city}
          </h1>
          {a.tagline && (
            <p
              className="mt-6 max-w-2xl text-lg italic"
              style={{ color: "rgb(255 255 255 / 0.75)" }}
            >
              {a.tagline}
            </p>
          )}
        </Container>
      </section>

      {/* Lead pastor feature + service times */}
      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-off-white)" }}
      >
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            {/* Lead pastor */}
            <div>
              <p
                className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em]"
                style={{ color: "var(--color-brand-red)" }}
              >
                <span
                  className="inline-block h-px w-10"
                  style={{ background: "var(--color-brand-red)" }}
                />
                Lead pastor
              </p>

              <div className="mt-8 flex items-center gap-6">
                <PastorAvatar
                  name={a.leadPastor?.name}
                  image={a.leadPastor?.image}
                  size={112}
                />
                <div>
                  <h2
                    className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight md:text-4xl"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {a.leadPastor?.name ?? "To be announced"}
                  </h2>
                  {a.leadPastor?.role && (
                    <p
                      className="mt-2 text-sm"
                      style={{ color: "var(--color-ink-soft)" }}
                    >
                      {a.leadPastor.role}
                    </p>
                  )}
                </div>
              </div>

              {a.leadPastor?.bio && a.leadPastor.bio.length > 0 && (
                <div
                  className="prose prose-lg mt-10 max-w-none"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  <PortableText value={a.leadPastor.bio} />
                </div>
              )}

              {/* About this assembly */}
              {a.about && a.about.length > 0 && (
                <div className="mt-12 border-t pt-12" style={{ borderColor: "rgb(11 20 27 / 0.08)" }}>
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.32em]"
                    style={{ color: "var(--color-brand-red)" }}
                  >
                    About this assembly
                  </p>
                  <div
                    className="prose prose-lg mt-6 max-w-none"
                    style={{ color: "var(--color-ink-soft)" }}
                  >
                    <PortableText value={a.about} />
                  </div>
                </div>
              )}

              {/* Other leaders */}
              {a.leaders && a.leaders.length > 0 && (
                <div className="mt-12 border-t pt-12" style={{ borderColor: "rgb(11 20 27 / 0.08)" }}>
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.32em]"
                    style={{ color: "var(--color-brand-red)" }}
                  >
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
                          <p
                            className="font-[family-name:var(--font-display)] text-base font-semibold leading-tight"
                            style={{ color: "var(--color-ink)" }}
                          >
                            {l.name}
                          </p>
                          {l.role && (
                            <p
                              className="text-xs"
                              style={{ color: "var(--color-muted)" }}
                            >
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
            <aside className="space-y-8 lg:sticky lg:top-28">
              <div
                className="rounded-[var(--radius-card)] border p-8"
                style={{
                  background: "white",
                  borderColor: "rgb(11 20 27 / 0.08)",
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: "var(--color-brand-red)" }}
                >
                  Visit us
                </p>
                <dl className="mt-6 space-y-5">
                  {a.address && (
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: "var(--color-brand-gold)" }}
                      />
                      <div>
                        <dt
                          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                          style={{ color: "var(--color-muted)" }}
                        >
                          Address
                        </dt>
                        <dd style={{ color: "var(--color-ink)" }}>
                          {a.address}
                        </dd>
                      </div>
                    </div>
                  )}
                  {a.phone && (
                    <div className="flex items-start gap-3">
                      <Phone
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: "var(--color-brand-gold)" }}
                      />
                      <div>
                        <dt
                          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                          style={{ color: "var(--color-muted)" }}
                        >
                          Phone
                        </dt>
                        <dd style={{ color: "var(--color-ink)" }}>{a.phone}</dd>
                      </div>
                    </div>
                  )}
                  {a.email && (
                    <div className="flex items-start gap-3">
                      <Mail
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: "var(--color-brand-gold)" }}
                      />
                      <div>
                        <dt
                          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                          style={{ color: "var(--color-muted)" }}
                        >
                          Email
                        </dt>
                        <dd style={{ color: "var(--color-ink)" }}>{a.email}</dd>
                      </div>
                    </div>
                  )}
                  {a.mapUrl && (
                    <a
                      href={a.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold"
                      style={{ color: "var(--color-brand-red)" }}
                    >
                      Open in Maps
                      <ExternalLink size={14} />
                    </a>
                  )}
                </dl>
              </div>

              <div
                className="rounded-[var(--radius-card)] p-8"
                style={{
                  background: "var(--color-brand-blue-ink)",
                  color: "white",
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: "var(--color-brand-gold)" }}
                >
                  Service times
                </p>
                {a.serviceTimes && a.serviceTimes.length > 0 ? (
                  <ul className="mt-6 space-y-5">
                    {a.serviceTimes.map((st, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-4 border-b pb-5 last:border-0 last:pb-0"
                        style={{ borderColor: "rgb(255 255 255 / 0.1)" }}
                      >
                        <div className="flex items-center gap-3">
                          <Clock
                            size={16}
                            style={{ color: "var(--color-brand-gold)" }}
                          />
                          <div>
                            <p className="font-[family-name:var(--font-display)] font-semibold">
                              {st.label}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "rgb(255 255 255 / 0.55)" }}
                            >
                              {st.day}
                            </p>
                          </div>
                        </div>
                        <span
                          className="font-[family-name:var(--font-display)] text-xl font-semibold"
                          style={{ color: "var(--color-brand-gold-soft)" }}
                        >
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
