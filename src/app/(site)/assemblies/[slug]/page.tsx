import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import {
  ASSEMBLY_BY_SLUG_QUERY,
  ALL_ASSEMBLY_SLUGS_QUERY,
} from "@/lib/sanity/queries";

export const revalidate = 600;

type AssemblyDoc = {
  _id: string;
  slug: string;
  city: string;
  state?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  mapUrl?: string;
  mapEmbed?: string;
  serviceTimes?: { label: string; day?: string; time?: string }[];
  leaders?: { _id: string; name: string; role?: string }[];
};

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
  const a = await sanityFetch<AssemblyDoc | null>({
    query: ASSEMBLY_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:assembly:${slug}`],
  });
  return { title: a ? `${a.city} Assembly` : "Assembly" };
}

export default async function AssemblyPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const a = await sanityFetch<AssemblyDoc | null>({
    query: ASSEMBLY_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:assembly:${slug}`],
    revalidate: 600,
  });
  if (!a) notFound();

  return (
    <>
      <section
        className="relative pt-32 pb-20 md:pt-44 md:pb-28"
        style={{ background: "var(--color-brand-blue-ink)" }}
      >
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
            className="mt-8 text-xs font-semibold uppercase tracking-[0.32em]"
            style={{ color: "var(--color-brand-gold)" }}
          >
            FMELi {a.state ?? "Nigeria"}
          </p>
          <h1
            className="mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.02] md:text-7xl"
            style={{ color: "white" }}
          >
            {a.city}
          </h1>
          {a.tagline && (
            <p
              className="mt-6 max-w-2xl text-lg"
              style={{ color: "rgb(255 255 255 / 0.8)" }}
            >
              {a.tagline}
            </p>
          )}
        </Container>
      </section>

      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-off-white)" }}
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2
                className="font-[family-name:var(--font-display)] text-3xl font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Visit us
              </h2>
              <dl className="mt-8 space-y-5">
                {a.address && (
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "var(--color-brand-red)" }}
                    />
                    <div>
                      <dt
                        className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                        style={{ color: "var(--color-muted)" }}
                      >
                        Address
                      </dt>
                      <dd style={{ color: "var(--color-ink)" }}>{a.address}</dd>
                    </div>
                  </div>
                )}
                {a.phone && (
                  <div className="flex items-start gap-3">
                    <Phone
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "var(--color-brand-red)" }}
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
                      style={{ color: "var(--color-brand-red)" }}
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
              </dl>
            </div>

            <div>
              <h2
                className="font-[family-name:var(--font-display)] text-3xl font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Service times
              </h2>
              {a.serviceTimes && a.serviceTimes.length > 0 ? (
                <ul className="mt-8 space-y-3">
                  {a.serviceTimes.map((st, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-[var(--radius-card)] border bg-white p-5"
                      style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
                    >
                      <div className="flex items-center gap-3">
                        <Clock
                          size={16}
                          style={{ color: "var(--color-brand-gold)" }}
                        />
                        <div>
                          <p
                            className="font-[family-name:var(--font-display)] font-semibold"
                            style={{ color: "var(--color-ink)" }}
                          >
                            {st.label}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--color-muted)" }}
                          >
                            {st.day}
                          </p>
                        </div>
                      </div>
                      <span
                        className="font-[family-name:var(--font-display)] text-xl font-semibold"
                        style={{ color: "var(--color-brand-red)" }}
                      >
                        {st.time}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p
                  className="mt-8 text-sm"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  Service times will appear here once the assembly is fully set
                  up in Sanity.
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
