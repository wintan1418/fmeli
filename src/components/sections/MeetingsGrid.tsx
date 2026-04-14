import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/Motion";

type Meeting = {
  title: string;
  summary: string;
  schedule: string;
  time: string;
  href: string;
  featured?: boolean;
};

/**
 * In Phase 2 this will be replaced by a Sanity-driven query that returns
 * `meeting` documents ordered by `order`. Every string below is already
 * editable in the admin panel — this file is only the last resort fallback.
 */
const MEETINGS: Meeting[] = [
  {
    title: "Sunday Service",
    summary: "The Lord's table, the unveiled Word, worship and the body in communion.",
    schedule: "Every Sunday",
    time: "8:00 AM",
    href: "/meetings/sunday",
    featured: true,
  },
  {
    title: "Wednesday Teaching Series",
    summary: "Verse by verse, line upon line — teaching that unveils the mysteries.",
    schedule: "Every Wednesday",
    time: "6:30 PM",
    href: "/meetings/wednesday",
  },
  {
    title: "Monthly Vigil",
    summary: "A night of prayer, praise, and the Word across all assemblies.",
    schedule: "First Friday of the month",
    time: "10:00 PM",
    href: "/meetings/vigil",
  },
  {
    title: "Life Campaign",
    summary: "Outreach, healing, and salvation — taking the message beyond the walls.",
    schedule: "Periodic",
    time: "See calendar",
    href: "/meetings/life-campaign",
  },
  {
    title: "Kiss the Son",
    summary: "Our annual convocation — three days of the unveiled Word.",
    schedule: "Annually",
    time: "See calendar",
    href: "/meetings/kiss-the-son",
    featured: true,
  },
  {
    title: "Believers' Convention",
    summary: "An annual gathering of the household of faith.",
    schedule: "Annually",
    time: "See calendar",
    href: "/meetings/convention",
  },
];

export function MeetingsGrid() {
  return (
    <section className="relative overflow-hidden bg-(--color-brand-blue-ink) py-24 text-(--color-brand-white) md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_srgb,var(--color-brand-blue)_40%,transparent)_0%,transparent_70%)]"
      />
      <Container className="relative">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-(--color-brand-gold)">
              <span className="inline-block h-px w-10 bg-(--color-brand-gold)" />
              Gather with us
              <span className="inline-block h-px w-10 bg-(--color-brand-gold)" />
            </p>
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] tracking-tight text-(--color-brand-white) md:text-5xl lg:text-[56px]">
              The rhythm of{" "}
              <span className="italic text-(--color-brand-gold-soft)">
                our meetings
              </span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-(--color-brand-white)/70">
              Every meeting is an opportunity to receive fresh light. Times and
              descriptions are managed from the admin panel — ask the content
              team to update any detail you see here.
            </p>
          </div>
        </FadeIn>

        <StaggerChildren className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {MEETINGS.map((m) => (
            <StaggerItem key={m.title}>
              <Link
                href={m.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-(--color-brand-white)/10 bg-gradient-to-br from-(--color-brand-white)/[0.04] to-(--color-brand-white)/[0.01] p-8 transition-all duration-500 hover:border-(--color-brand-gold)/40 hover:from-(--color-brand-white)/[0.08]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-(--color-brand-gold)/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                />

                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-(--color-brand-gold)">
                    <Calendar size={12} />
                    {m.schedule}
                  </div>
                  {m.featured && (
                    <span className="inline-flex items-center rounded-full bg-(--color-brand-red) px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--color-brand-white)">
                      Signature
                    </span>
                  )}
                </div>

                <h3 className="mt-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-(--color-brand-white) md:text-[28px]">
                  {m.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-(--color-brand-white)/65">
                  {m.summary}
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-(--color-brand-white)/10 pt-5">
                  <span className="font-[family-name:var(--font-display)] text-xl text-(--color-brand-gold)">
                    {m.time}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-(--color-brand-white)/40 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-(--color-brand-gold)"
                  />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}
