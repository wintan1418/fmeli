import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, ArrowUpRight, Clock, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { PastorAvatar } from "@/components/ui/PastorAvatar";
import { sanityFetch } from "@/lib/sanity/client";
import { ASSEMBLIES_FULL_QUERY } from "@/lib/sanity/queries";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Assemblies",
  description:
    "FMELi assemblies across Nigeria — find a home in your city.",
};

type Assembly = {
  _id: string;
  slug: string;
  city: string;
  state?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  serviceTimes?: { label: string; day?: string; time?: string }[];
  leadPastor?: {
    _id: string;
    name?: string;
    role?: string;
    image?: { asset?: { _ref?: string } };
  } | null;
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
            <span
              className="italic"
              style={{ color: "var(--color-brand-gold-soft)" }}
            >
              your city
            </span>
          </>
        }
        subtitle="Nine assemblies across Nigeria — one body, one Word. Each campus is led by pastors who carry the vision of the house. Click through to meet them and see service times."
      />

      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-off-white)" }}
      >
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(assemblies ?? []).map((a) => (
              <Link
                key={a._id}
                href={`/assemblies/${a.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
              >
                {/* Top band — dark with city name */}
                <div
                  className="relative px-8 pt-7 pb-20"
                  style={{ background: "var(--color-brand-blue-ink)" }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 80% 60% at 20% 0%, color-mix(in srgb, var(--color-brand-gold) 20%, transparent) 0%, transparent 60%)",
                    }}
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p
                        className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
                        style={{ color: "var(--color-brand-gold)" }}
                      >
                        <MapPin size={12} />
                        FMELi {a.state ?? "Nigeria"}
                      </p>
                      <h3
                        className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[0.98]"
                        style={{ color: "white" }}
                      >
                        {a.city}
                      </h3>
                      {a.tagline && (
                        <p
                          className="mt-2 text-xs italic"
                          style={{ color: "rgb(255 255 255 / 0.65)" }}
                        >
                          {a.tagline}
                        </p>
                      )}
                    </div>
                    <ArrowUpRight
                      size={20}
                      style={{ color: "rgb(255 255 255 / 0.5)" }}
                      className="transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </div>
                </div>

                {/* Pastor overlap card */}
                <div
                  className="relative flex flex-1 flex-col gap-4 px-8 pt-12 pb-7"
                  style={{ background: "white" }}
                >
                  <div className="absolute left-8 -top-8">
                    <PastorAvatar
                      name={a.leadPastor?.name}
                      image={a.leadPastor?.image}
                      size={72}
                    />
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                      style={{ color: "var(--color-brand-red)" }}
                    >
                      Lead Pastor
                    </p>
                    <p
                      className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold leading-tight"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {a.leadPastor?.name ?? "To be announced"}
                    </p>
                    {a.leadPastor?.role && (
                      <p
                        className="mt-0.5 text-xs"
                        style={{ color: "var(--color-ink-soft)" }}
                      >
                        {a.leadPastor.role}
                      </p>
                    )}
                  </div>

                  <ul
                    className="mt-2 space-y-2 border-t pt-4 text-xs"
                    style={{
                      borderColor: "rgb(11 20 27 / 0.08)",
                      color: "var(--color-ink-soft)",
                    }}
                  >
                    {a.serviceTimes && a.serviceTimes.length > 0 && (
                      <li className="flex items-start gap-2">
                        <Clock
                          size={12}
                          className="mt-0.5 flex-shrink-0"
                          style={{ color: "var(--color-brand-gold)" }}
                        />
                        <span>
                          <strong style={{ color: "var(--color-ink)" }}>
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
                          className="mt-0.5 flex-shrink-0"
                          style={{ color: "var(--color-brand-gold)" }}
                        />
                        <span>{a.phone}</span>
                      </li>
                    )}
                    {a.address && (
                      <li className="flex items-start gap-2">
                        <MapPin
                          size={12}
                          className="mt-0.5 flex-shrink-0"
                          style={{ color: "var(--color-brand-gold)" }}
                        />
                        <span className="line-clamp-2">{a.address}</span>
                      </li>
                    )}
                  </ul>

                  <span
                    className="mt-auto inline-flex items-center gap-2 pt-2 text-xs font-semibold"
                    style={{ color: "var(--color-brand-red)" }}
                  >
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
