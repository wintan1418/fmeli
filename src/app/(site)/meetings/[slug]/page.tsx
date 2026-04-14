import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText, type PortableTextBlock } from "next-sanity";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import {
  MEETING_BY_SLUG_QUERY,
  ALL_MEETING_SLUGS_QUERY,
} from "@/lib/sanity/queries";

export const revalidate = 600;

type MeetingDoc = {
  _id: string;
  title: string;
  slug: string;
  cadenceLabel?: string;
  defaultDay?: string;
  defaultTime?: string;
  summary?: string;
  description?: PortableTextBlock[];
  assemblies?: { slug: string; city: string }[];
};

export async function generateStaticParams() {
  const rows = await sanityFetch<{ slug: string }[]>({
    query: ALL_MEETING_SLUGS_QUERY,
    tags: ["sanity:meeting:list"],
  });
  return (rows ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const m = await sanityFetch<MeetingDoc | null>({
    query: MEETING_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:meeting:${slug}`],
  });
  return { title: m?.title ?? "Meeting" };
}

export default async function MeetingPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const meeting = await sanityFetch<MeetingDoc | null>({
    query: MEETING_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:meeting:${slug}`],
    revalidate: 600,
  });
  if (!meeting) notFound();

  return (
    <>
      <section
        className="relative pt-32 pb-20 md:pt-44 md:pb-28"
        style={{ background: "var(--color-brand-blue-ink)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-1/4 h-[480px] w-[480px] rounded-full blur-[160px]"
          style={{ background: "color-mix(in srgb, var(--color-brand-gold) 22%, transparent)" }}
        />
        <Container className="relative">
          <Link
            href="/meetings"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "rgb(255 255 255 / 0.6)" }}
          >
            <ArrowLeft size={14} />
            All meetings
          </Link>
          <h1
            className="mt-8 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] md:text-7xl"
            style={{ color: "white" }}
          >
            {meeting.title}
          </h1>
          {meeting.summary && (
            <p
              className="mt-8 max-w-2xl text-lg leading-8"
              style={{ color: "rgb(255 255 255 / 0.8)" }}
            >
              {meeting.summary}
            </p>
          )}
          <dl
            className="mt-12 grid max-w-3xl grid-cols-1 gap-6 border-t pt-8 sm:grid-cols-2"
            style={{ borderColor: "rgb(255 255 255 / 0.15)" }}
          >
            <div>
              <dt
                className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "var(--color-brand-gold)" }}
              >
                <Calendar size={12} />
                Schedule
              </dt>
              <dd
                className="mt-2 font-[family-name:var(--font-display)] text-lg"
                style={{ color: "white" }}
              >
                {meeting.cadenceLabel ?? meeting.defaultDay ?? "See calendar"}
              </dd>
            </div>
            {meeting.defaultTime && (
              <div>
                <dt
                  className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: "var(--color-brand-gold)" }}
                >
                  <Clock size={12} />
                  Time
                </dt>
                <dd
                  className="mt-2 font-[family-name:var(--font-display)] text-lg"
                  style={{ color: "white" }}
                >
                  {meeting.defaultTime}
                </dd>
              </div>
            )}
          </dl>
        </Container>
      </section>

      {meeting.description && meeting.description.length > 0 && (
        <section
          className="py-20 md:py-28"
          style={{ background: "var(--color-off-white)" }}
        >
          <Container>
            <article
              className="prose prose-lg mx-auto max-w-3xl"
              style={{ color: "var(--color-ink-soft)" }}
            >
              <PortableText value={meeting.description} />
            </article>
          </Container>
        </section>
      )}
    </>
  );
}
