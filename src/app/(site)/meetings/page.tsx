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
            <span
              className="italic"
              style={{ color: "var(--color-brand-gold-soft)" }}
            >
              yearly meetings
            </span>
          </>
        }
        subtitle="Every meeting is an opportunity to receive fresh light. Times and descriptions are managed by the church office through Sanity Studio."
      />

      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-off-white)" }}
      >
        <Container>
          {meetings && meetings.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {meetings.map((m) => (
                <Link
                  key={m._id}
                  href={`/meetings/${m.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border bg-white p-8 shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                  style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
                >
                  <div
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: "var(--color-brand-red)" }}
                  >
                    <Calendar size={12} />
                    {m.cadenceLabel ?? m.defaultDay ?? m.kind}
                  </div>
                  <h3
                    className="mt-6 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {m.title}
                  </h3>
                  {m.summary && (
                    <p
                      className="mt-4 text-sm leading-6"
                      style={{ color: "var(--color-ink-soft)" }}
                    >
                      {m.summary}
                    </p>
                  )}
                  <div
                    className="mt-8 flex items-center justify-between border-t pt-5"
                    style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
                  >
                    <span
                      className="font-[family-name:var(--font-display)] text-lg"
                      style={{ color: "var(--color-brand-gold)" }}
                    >
                      {m.defaultTime}
                    </span>
                    <ArrowUpRight
                      size={18}
                      style={{ color: "var(--color-muted)" }}
                      className="transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
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
    <div
      className="rounded-[var(--radius-card)] border border-dashed p-12 text-center"
      style={{
        borderColor: "rgb(11 20 27 / 0.15)",
        color: "var(--color-ink-soft)",
      }}
    >
      <p className="font-[family-name:var(--font-display)] text-2xl">{title}</p>
      <p className="mt-3 text-sm">{body}</p>
    </div>
  );
}
