import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/Motion";

type UpcomingEvent = {
  title: string;
  tagline: string;
  startsAt: string;
  location: string;
  heroImage: string;
  href: string;
  registrationHref?: string;
  registrationOpen?: boolean;
  isSpecial?: boolean;
  spotsLeft?: number;
};

const EVENTS: UpcomingEvent[] = [
  {
    title: "Singles Rendezvous",
    tagline: "An evening of worship, fellowship and the unveiled Word for believers stepping into purpose.",
    startsAt: "2026-05-17T17:00:00+01:00",
    location: "FMELi Lagos Assembly",
    heroImage: "/images/fmeli/joy-laughter.jpg",
    href: "/events/singles-rendezvous",
    registrationHref: "/events/singles-rendezvous/register",
    registrationOpen: true,
    isSpecial: true,
    spotsLeft: 43,
  },
  {
    title: "Kiss the Son · Convocation",
    tagline: "Three days of the unveiled Word at our annual convocation.",
    startsAt: "2026-07-24T09:00:00+01:00",
    location: "All assemblies · Main: Akure",
    heroImage: "/images/fmeli/worship-hands-up.jpg",
    href: "/events/kiss-the-son-2026",
    registrationHref: "/events/kiss-the-son-2026/register",
    registrationOpen: true,
    isSpecial: true,
  },
  {
    title: "Believers' Convention",
    tagline: "The annual gathering of the household of faith.",
    startsAt: "2026-08-15T09:00:00+01:00",
    location: "Lagos Assembly",
    heroImage: "/images/fmeli/overcomer-youth.jpg",
    href: "/events/convention-2026",
    registrationOpen: false,
  },
];

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

export function UpcomingEvents() {
  return (
    <section className="relative bg-(--color-off-white) py-24 md:py-32">
      <Container>
        <FadeIn>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-(--color-brand-red)">
                <span className="inline-block h-px w-10 bg-(--color-brand-red)" />
                What&rsquo;s coming up
              </p>
              <h2 className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] tracking-tight text-(--color-ink) md:text-5xl lg:text-[56px]">
                Upcoming{" "}
                <span className="italic text-(--color-brand-red)">events</span>{" "}
                <span className="text-(--color-muted)">&amp;</span>{" "}
                <span className="italic text-(--color-brand-red)">
                  special meetings
                </span>
              </h2>
            </div>
            <Link
              href="/events"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-(--color-brand-blue-ink) transition hover:text-(--color-brand-red)"
            >
              Full calendar
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </FadeIn>

        <StaggerChildren className="mt-14 grid gap-6 md:grid-cols-3">
          {EVENTS.map((e) => {
            const date = formatDate(e.startsAt);
            return (
              <StaggerItem key={e.title}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-(--color-brand-white) shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)]">
                  <div className="relative aspect-[5/3] overflow-hidden bg-(--color-brand-blue-ink)">
                    <Image
                      src={e.heroImage}
                      alt={e.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-(--color-brand-blue-ink)/85 via-(--color-brand-blue-ink)/30 to-transparent" />
                    {e.isSpecial && (
                      <span className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-full bg-(--color-brand-gold) px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--color-brand-blue-ink)">
                        ★ Special meeting
                      </span>
                    )}
                    {/* Date block */}
                    <div className="absolute bottom-5 left-5 rounded-[var(--radius-card)] bg-(--color-brand-white) px-4 py-3 text-center shadow-[var(--shadow-card-hover)]">
                      <p className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-none text-(--color-brand-red)">
                        {date.day}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--color-ink)">
                        {date.month} {date.year}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-7">
                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-(--color-ink) transition-colors group-hover:text-(--color-brand-red)">
                      {e.title}
                    </h3>
                    <p className="text-sm leading-6 text-(--color-ink-soft)">
                      {e.tagline}
                    </p>
                    <dl className="mt-2 flex flex-col gap-2 text-xs text-(--color-muted)">
                      <div className="inline-flex items-center gap-2">
                        <Calendar size={12} />
                        <span>
                          {date.month} {date.day} · {date.time}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <MapPin size={12} />
                        <span>{e.location}</span>
                      </div>
                      {typeof e.spotsLeft === "number" && (
                        <div className="inline-flex items-center gap-2 text-(--color-brand-red)">
                          <Users size={12} />
                          <span>{e.spotsLeft} spots left</span>
                        </div>
                      )}
                    </dl>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-(--color-brand-blue-soft) pt-5">
                      <Link
                        href={e.href}
                        className="text-sm font-semibold text-(--color-brand-blue-ink) transition hover:text-(--color-brand-red)"
                      >
                        Details
                      </Link>
                      {e.registrationOpen ? (
                        <Link
                          href={e.registrationHref || e.href}
                          className="group/btn inline-flex h-11 items-center gap-2 rounded-full bg-(--color-brand-red) px-5 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-brand-white) transition-all hover:bg-(--color-brand-red-deep)"
                        >
                          Register
                          <ArrowRight
                            size={14}
                            className="transition-transform group-hover/btn:translate-x-1"
                          />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
                          Registration opens soon
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </Container>
    </section>
  );
}
