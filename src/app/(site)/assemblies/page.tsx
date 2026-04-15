import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, ArrowUpRight, Clock, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { PastorAvatar } from "@/components/ui/PastorAvatar";
import { sanityFetch } from "@/lib/sanity/client";
import { ASSEMBLIES_FULL_QUERY } from "@/lib/sanity/queries";
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
        subtitle="Nine assemblies across Nigeria — one body, one Word. Each campus is led by pastors who carry the vision of the house. Click through to meet them and see service times."
      />

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(assemblies ?? []).map((a) => (
              <Link
                key={a._id}
                href={`/assemblies/${a.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
              >
                {/* Top band — dark with city name */}
                <div className="relative bg-brand-blue-ink px-8 pt-7 pb-20">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,color-mix(in_srgb,var(--color-brand-gold)_20%,transparent)_0%,transparent_60%)]"
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">
                        <MapPin size={12} />
                        FMELi {a.state ?? "Nigeria"}
                      </p>
                      <h3 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[0.98] text-white">
                        {a.city}
                      </h3>
                      {a.tagline && (
                        <p className="mt-2 text-xs italic text-white/65">
                          {a.tagline}
                        </p>
                      )}
                    </div>
                    <ArrowUpRight
                      size={20}
                      className="text-white/50 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </div>
                </div>

                {/* Pastor overlap card */}
                <div className="relative flex flex-1 flex-col gap-4 bg-white px-8 pt-12 pb-7">
                  <div className="absolute left-8 -top-8">
                    <PastorAvatar
                      name={a.leadPastor?.name}
                      image={a.leadPastor?.image}
                      size={72}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">
                      Lead Pastor
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-ink">
                      {a.leadPastor?.name ?? "To be announced"}
                    </p>
                    {a.leadPastor?.role && (
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {a.leadPastor.role}
                      </p>
                    )}
                  </div>

                  <ul className="mt-2 space-y-2 border-t border-ink/8 pt-4 text-xs text-ink-soft">
                    {a.serviceTimes && a.serviceTimes.length > 0 && (
                      <li className="flex items-start gap-2">
                        <Clock
                          size={12}
                          className="mt-0.5 flex-shrink-0 text-brand-gold"
                        />
                        <span>
                          <strong className="text-ink">
                            {a.serviceTimes[0].label}
                          </strong>
                          {" · "}
                          {a.serviceTimes[0].day} {a.serviceTimes[0].time}
                        </span>
                      </li>
                    )}
                    {a.phone && (
                      <li className="flex items-start gap-2">
                        <Phone
                          size={12}
                          className="mt-0.5 flex-shrink-0 text-brand-gold"
                        />
                        <span>{a.phone}</span>
                      </li>
                    )}
                    {a.address && (
                      <li className="flex items-start gap-2">
                        <MapPin
                          size={12}
                          className="mt-0.5 flex-shrink-0 text-brand-gold"
                        />
                        <span className="line-clamp-2">{a.address}</span>
                      </li>
                    )}
                  </ul>

                  <span className="mt-auto inline-flex items-center gap-2 pt-2 text-xs font-semibold text-brand-red">
                    Visit this assembly
                    <ArrowUpRight
                      size={14}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
