import Image from "next/image";
import Link from "next/link";
import { Play, ArrowRight, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/Motion";

type Sermon = {
  title: string;
  preacher: string;
  date: string;
  duration: string;
  scripture: string;
  thumbnail: string;
  href: string;
  tag?: string;
};

const SERMONS: Sermon[] = [
  {
    title: "The Overcomers · Day 6 Morning",
    preacher: "Pastor Kayode",
    date: "Life Campaign 2026",
    duration: "52 min",
    scripture: "Revelation 12:11",
    thumbnail: "/images/fmeli/word-preaching.jpg",
    href: "/resources/messages/overcomers-day-6",
    tag: "Featured",
  },
  {
    title: "Q&A Communion Service",
    preacher: "Pastor Kayode",
    date: "April 6, 2026",
    duration: "48 min",
    scripture: "1 Corinthians 11:26",
    thumbnail: "/images/fmeli/worship-hands-up.jpg",
    href: "/resources/messages/qa-communion",
  },
  {
    title: "Brothers in the Vineyard",
    preacher: "Pastor Kayode",
    date: "March 30, 2026",
    duration: "55 min",
    scripture: "Hebrews 10:24–25",
    thumbnail: "/images/fmeli/brothers-embrace.jpg",
    href: "/resources/messages/brothers-vineyard",
  },
];

export function FeaturedSermons() {
  return (
    <section className="relative bg-(--color-off-white) py-24 md:py-32">
      <Container>
        <FadeIn>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-(--color-brand-red)">
                <span className="inline-block h-px w-10 bg-(--color-brand-red)" />
                Latest messages
              </p>
              <h2 className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] tracking-tight text-(--color-ink) md:text-5xl lg:text-[56px]">
                Fresh light from{" "}
                <span className="italic text-(--color-brand-red)">
                  the Word
                </span>
              </h2>
            </div>
            <Link
              href="/resources/messages"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-(--color-brand-blue-ink) transition hover:text-(--color-brand-red)"
            >
              All messages
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </FadeIn>

        <StaggerChildren className="mt-14 grid gap-6 md:grid-cols-3">
          {SERMONS.map((s) => (
            <StaggerItem key={s.title}>
              <Link
                href={s.href}
                className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-(--color-brand-white) shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-(--color-brand-blue-ink)">
                  <Image
                    src={s.thumbnail}
                    alt={s.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-(--color-brand-blue-ink)/80 via-transparent to-transparent" />
                  {s.tag && (
                    <span className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-full bg-(--color-brand-gold) px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--color-brand-blue-ink)">
                      {s.tag}
                    </span>
                  )}
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-(--color-brand-white)">
                      <Clock size={12} />
                      {s.duration}
                    </div>
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-(--color-brand-gold) text-(--color-brand-blue-ink) shadow-[var(--shadow-glow-gold)] transition-transform duration-500 group-hover:scale-110">
                      <Play size={20} className="fill-current" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-7">
                  <div className="text-xs uppercase tracking-[0.2em] text-(--color-muted)">
                    {s.date} · {s.scripture}
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-(--color-ink) transition-colors group-hover:text-(--color-brand-red)">
                    {s.title}
                  </h3>
                  <p className="mt-auto text-sm text-(--color-ink-soft)">
                    {s.preacher}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}
