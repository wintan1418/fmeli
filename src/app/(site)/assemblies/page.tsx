import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, ArrowUpRight, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
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
        subtitle="Nine assemblies across Nigeria — one body, one Word. Choose the nearest campus to visit, connect and belong."
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
                className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border bg-white p-8 shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
              >
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    background: "var(--color-brand-blue-soft)",
                    color: "var(--color-brand-blue-ink)",
                  }}
                >
                  <MapPin size={18} />
                </div>
                <h3
                  className="mt-6 font-[family-name:var(--font-display)] text-2xl font-semibold"
                  style={{ color: "var(--color-ink)" }}
                >
                  {a.city}
                </h3>
                <p
                  className="mt-1 text-xs uppercase tracking-[0.18em]"
                  style={{ color: "var(--color-muted)" }}
                >
                  {a.state}
                  {a.tagline ? ` · ${a.tagline}` : ""}
                </p>
                {a.serviceTimes && a.serviceTimes.length > 0 && (
                  <ul className="mt-6 space-y-2">
                    {a.serviceTimes.slice(0, 2).map((st, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-xs"
                        style={{ color: "var(--color-ink-soft)" }}
                      >
                        <Clock size={12} />
                        <span>
                          <strong>{st.label}:</strong> {st.day} {st.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto flex items-center justify-end pt-6">
                  <ArrowUpRight
                    size={18}
                    style={{ color: "var(--color-brand-red)" }}
                    className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
