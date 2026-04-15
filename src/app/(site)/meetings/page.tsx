import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Calendar } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { sanityFetch } from "@/lib/sanity/client";
import { MEETINGS_QUERY } from "@/lib/sanity/queries";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Meetings",
  description:
    "Weekly, monthly, and yearly gatherings of Full Manifestation of Eternal Life.",
};

type Meeting = {
  _id: string;
  title: string;
  slug: string;
  kind?: string;
  cadenceLabel?: string;
  defaultDay?: string;
  defaultTime?: string;
  summary?: string;
  featured?: boolean;
};

export default async function MeetingsPage() {
  const meetings = await sanityFetch<Meeting[]>({
    query: MEETINGS_QUERY,
    tags: ["sanity:meeting:list"],
    revalidate: 600,
  });

  return (
    <>
      <PageHero
        eyebrow="Gather with us"
        title={
          <>
            Weekly, monthly &{" "}
            <span className="italic text-brand-gold-soft">yearly meetings</span>
          </>
        }
        subtitle="Every meeting is an opportunity to receive fresh light. Times and descriptions are managed by the church office through Sanity Studio."
      />

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          {meetings && meetings.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {meetings.map((m) => (
                <Link
                  key={m._id}
                  href={`/meetings/${m.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white p-8 shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">
                    <Calendar size={12} />
                    {m.cadenceLabel ?? m.defaultDay ?? m.kind}
                  </div>
                  <h3 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-ink">
                    {m.title}
                  </h3>
                  {m.summary && (
                    <p className="mt-4 text-sm leading-6 text-ink-soft">
                      {m.summary}
                    </p>
                  )}
                  <div className="mt-8 flex items-center justify-between border-t border-ink/8 pt-5">
                    <span className="font-[family-name:var(--font-display)] text-lg text-brand-gold">
                      {m.defaultTime}
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-muted transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No meetings published yet."
              body="Create a Meeting document in Sanity Studio to populate this page."
            />
          )}
        </Container>
      </section>
    </>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-ink/15 p-12 text-center text-ink-soft">
      <p className="font-[family-name:var(--font-display)] text-2xl">{title}</p>
      <p className="mt-3 text-sm">{body}</p>
    </div>
  );
}
