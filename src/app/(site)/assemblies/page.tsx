import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, ArrowUpRight, Clock, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { PastorAvatar } from "@/components/ui/PastorAvatar";
import { sanityFetch } from "@/lib/sanity/client";
import { ASSEMBLIES_FULL_QUERY } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Assembly } from "@/types/sanity";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Assemblies",
  description:
    "FMELi assemblies across Nigeria — find a home in your city.",
};

export default async function AssembliesPage() {
  const assemblies = await sanityFetch<Assembly[]>({
    query: ASSEMBLIES_FULL_QUERY,
    tags: ["sanity:assembly:list"],
    revalidate: 600,
  });

  return (
    <>
      <PageHero
        eyebrow="Our assemblies"
        title={
          <>
            Find a home in{" "}
            <span className="italic text-brand-gold-soft">your city</span>
          </>
        }
        subtitle="Nine assemblies across Nigeria — one body, one Word. Each assembly is led by pastors who carry the vision of the house. Click through to meet them and see service times."
      />

      <section className="bg-off-white py-16 md:py-28">
        <Container>
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {(assemblies ?? []).map((a) => {
              const heroUrl = a.heroImage?.asset?._ref
                ? urlFor(a.heroImage).width(800).height(500).url()
                : null;
              return (
                <Link
                  key={a._id}
                  href={`/assemblies/${a.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-ink/6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)] hover:ring-brand-gold/40"
                >
                  {/* Hero image band */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-brand-blue-ink">
                    {heroUrl ? (
                      <Image
                        src={heroUrl}
                        alt={`${a.city} assembly`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-ink via-brand-blue-deep to-brand-red/40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-ink/90 via-brand-blue-ink/40 to-transparent" />

                    {/* City name overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue-ink">
                        <MapPin size={10} />
                        {a.state ?? "Nigeria"}
                      </p>
                      <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-[0.98] text-white sm:text-4xl">
                        {a.city}
                      </h3>
                      {a.tagline && (
                        <p className="mt-1.5 text-sm italic text-white/70">
                          &ldquo;{a.tagline}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Arrow indicator */}
                    <div className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-all duration-500 group-hover:bg-brand-gold group-hover:text-brand-blue-ink">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="relative flex flex-1 flex-col gap-5 px-6 pt-14 pb-6">
                    {/* Pastor avatar — overlapping the image band */}
                    <div className="absolute -top-8 left-6">
                      <div className="rounded-full ring-4 ring-white">
                        <PastorAvatar
                          name={a.leadPastor?.name}
                          image={a.leadPastor?.image}
                          size={64}
                        />
                      </div>
                    </div>

                    {/* Pastor info */}
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-red">
                        <Users size={10} />
                        Lead Pastor
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-ink">
                        {a.leadPastor?.name ?? "To be announced"}
                      </p>
                    </div>

                    {/* Service times preview */}
                    {a.serviceTimes && a.serviceTimes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {a.serviceTimes.slice(0, 3).map((st, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-full border border-ink/8 bg-off-white px-3 py-1.5 text-[11px] font-medium text-ink"
                          >
                            <Clock size={10} className="text-brand-gold" />
                            {st.label}
                            {st.time && (
                              <span className="font-semibold text-brand-blue-ink">
                                {st.time}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Contact peek */}
                    {(a.phone || a.address) && (
                      <div className="space-y-1.5 border-t border-ink/6 pt-4 text-xs text-ink-soft">
                        {a.address && (
                          <p className="flex items-start gap-2">
                            <MapPin
                              size={11}
                              className="mt-0.5 flex-shrink-0 text-brand-gold"
                            />
                            <span className="line-clamp-1">{a.address}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-auto pt-1">
                      <span className="inline-flex items-center gap-2 rounded-full bg-brand-blue-ink/5 px-4 py-2 text-xs font-semibold text-brand-blue-ink transition-all duration-300 group-hover:bg-brand-red group-hover:text-white">
                        Visit this assembly
                        <ArrowUpRight
                          size={13}
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
