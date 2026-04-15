import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Headphones,
  Music2,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Messages, worship sessions, lively music and pastoral tips — every free resource the FMELi family makes available.",
};

type ResourceCard = {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  available: boolean;
};

const RESOURCES: ResourceCard[] = [
  {
    href: "/resources/messages",
    eyebrow: "Sunday · Wednesday · Convention",
    title: "Messages",
    body: "Sermons, teaching sessions and convention messages — filterable by category, downloadable for offline.",
    icon: PlayCircle,
    available: true,
  },
  {
    href: "/resources/worship",
    eyebrow: "Live recordings",
    title: "Worship sessions",
    body: "Full worship recordings from Sunday gatherings, conventions and special meetings.",
    icon: Headphones,
    available: true,
  },
  {
    href: "/resources/music",
    eyebrow: "Songs of the house",
    title: "Lively music",
    body: "Original songs and arrangements from the FMELi music team — for personal worship and private listening.",
    icon: Music2,
    available: true,
  },
  {
    href: "/resources/tips",
    eyebrow: "For everyday life",
    title: "Tips",
    body: "Short reads on health, family, finances and walking with God — pastoral wisdom in bite-size form.",
    icon: Sparkles,
    available: false,
  },
];

export default function ResourcesIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title={
          <>
            Everything the family{" "}
            <span className="italic text-brand-gold-soft">freely shares</span>
          </>
        }
        subtitle="Messages, worship, music and tips — gathered in one place. Choose where to start."
      />

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {RESOURCES.map((r) => {
              const Icon = r.icon;
              const inner = (
                <div className="group relative flex h-full flex-col gap-5 rounded-[var(--radius-card)] border border-ink/8 bg-white p-8 shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] md:p-10">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-ink/8 text-brand-blue-ink">
                    <Icon size={22} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">
                      {r.eyebrow}
                    </p>
                    <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-ink">
                      {r.title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-ink-soft">
                      {r.body}
                    </p>
                  </div>
                  <div className="mt-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                    {r.available ? (
                      <span className="text-brand-red">
                        Browse
                        <ArrowRight
                          size={14}
                          className="ml-1 inline transition group-hover:translate-x-0.5"
                        />
                      </span>
                    ) : (
                      <span className="rounded-full border border-ink/12 px-3 py-1 text-[10px] text-muted">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
              );
              return r.available ? (
                <Link key={r.href} href={r.href} className="block h-full">
                  {inner}
                </Link>
              ) : (
                <div key={r.href} className="block h-full opacity-80">
                  {inner}
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
