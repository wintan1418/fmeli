import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import { EVENTS_ALL_QUERY } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events & Special Meetings",
  description:
    "All upcoming FMELi events, special meetings, conferences and convocations.",
};

type EventRow = {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  startsAt: string;
  location?: string;
  heroImage?: { asset?: { _ref?: string } };
  isSpecial?: boolean;
  registrationEnabled?: boolean;
  assembly?: { slug: string; city: string };
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleString("en-GB", { month: "short" }).toUpperCase(),
    year: d.getFullYear(),
    time: d.toLocaleString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

export default async function EventsPage() {
  const events = await sanityFetch<EventRow[]>({
    query: EVENTS_ALL_QUERY,
    tags: ["sanity:event:list"],
    revalidate: 300,
  });

  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-36 pb-16 md:pt-44 md:pb-24"
        style={{ background: "var(--color-brand-blue-ink)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-1/4 h-[480px] w-[480px] rounded-full blur-[160px]"
          style={{ background: "color-mix(in srgb, var(--color-brand-gold) 25%, transparent)" }}
        />
        <Container className="relative">
          <p
            className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em]"
            style={{ color: "var(--color-brand-gold)" }}
          >
            <span
              className="inline-block h-px w-10"
              style={{ background: "var(--color-brand-gold)" }}
            />
            The FMELi calendar
          </p>
          <h1
            className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] md:text-7xl"
            style={{ color: "white" }}
          >
            Events &{" "}
            <span
              className="italic"
              style={{ color: "var(--color-brand-gold-soft)" }}
            >
              special meetings
            </span>
          </h1>
          <p
            className="mt-6 max-w-2xl text-base leading-8 md:text-lg"
            style={{ color: "rgb(255 255 255 / 0.8)" }}
          >
            Conferences, convocations, campaigns and rendezvous —
            everything happening across our assemblies. Click any event for
            details and to register.
          </p>
        </Container>
      </section>

      {/* Grid */}
      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-off-white)" }}
      >
        <Container>
          {events && events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => {
                const date = formatDate(e.startsAt);
                const thumb = e.heroImage
                  ? urlFor(e.heroImage).width(900).height(600).url()
                  : null;
                return (
                  <Link
                    key={e._id}
                    href={`/events/${e.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div
                      className="relative aspect-[5/3] overflow-hidden"
                      style={{ background: "var(--color-brand-blue-ink)" }}
                    >
                      {thumb && (
                        <Image
                          src={thumb}
                          alt={e.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          unoptimized
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(6,30,44,0.8), rgba(6,30,44,0.15), transparent)",
                        }}
                      />
                      {e.isSpecial && (
                        <span
                          className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                          style={{
                            background: "var(--color-brand-gold)",
                            color: "var(--color-brand-blue-ink)",
                          }}
                        >
                          ★ Special meeting
                        </span>
                      )}
                      <div className="absolute bottom-5 left-5 rounded-[var(--radius-card)] bg-white px-4 py-3 text-center shadow-[var(--shadow-card-hover)]">
                        <p
                          className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-none"
                          style={{ color: "var(--color-brand-red)" }}
                        >
                          {date.day}
                        </p>
                        <p
                          className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {date.month} {date.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <h3
                        className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight transition-colors group-hover:text-[color:var(--color-brand-red)]"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {e.title}
                      </h3>
                      {e.tagline && (
                        <p
                          className="text-sm leading-6"
                          style={{ color: "var(--color-ink-soft)" }}
                        >
                          {e.tagline}
                        </p>
                      )}
                      <dl
                        className="mt-auto flex flex-col gap-1.5 pt-3 text-xs"
                        style={{ color: "var(--color-muted)" }}
                      >
                        <div className="inline-flex items-center gap-2">
                          <Calendar size={12} />
                          <span>{date.time}</span>
                        </div>
                        {(e.location || e.assembly?.city) && (
                          <div className="inline-flex items-center gap-2">
                            <MapPin size={12} />
                            <span>{e.location ?? e.assembly?.city}</span>
                          </div>
                        )}
                      </dl>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-[var(--radius-card)] border border-dashed p-12 text-center"
              style={{
                borderColor: "rgb(11 20 27 / 0.12)",
                color: "var(--color-ink-soft)",
              }}
            >
              <p className="font-[family-name:var(--font-display)] text-2xl">
                No events published yet.
              </p>
              <p className="mt-3 text-sm">
                Visit{" "}
                <Link
                  href="/studio"
                  className="underline"
                  style={{ color: "var(--color-brand-red)" }}
                >
                  /studio
                </Link>{" "}
                to create your first event.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
