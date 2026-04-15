import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText } from "next-sanity";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import { TIP_BY_SLUG_QUERY, ALL_TIP_SLUGS_QUERY } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Tip } from "@/types/sanity";

export const revalidate = 600;

export async function generateStaticParams() {
  const rows = await sanityFetch<{ slug: string }[]>({
    query: ALL_TIP_SLUGS_QUERY,
    tags: ["sanity:tip:list"],
  });
  return (rows ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tip = await sanityFetch<Tip | null>({
    query: TIP_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:tip:${slug}`],
  });
  return {
    title: tip?.title ?? "Tip",
    description: tip?.summary,
  };
}

export default async function TipPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tip = await sanityFetch<Tip | null>({
    query: TIP_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:tip:${slug}`],
    revalidate: 600,
  });
  if (!tip) notFound();

  const cover = tip.coverImage
    ? urlFor(tip.coverImage).width(1600).height(900).url()
    : null;

  return (
    <article>
      <section className="relative bg-brand-blue-ink pt-32 pb-16 md:pt-44">
        <Container className="relative">
          <Link
            href="/resources/tips"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
          >
            <ArrowLeft size={14} />
            All tips
          </Link>
          {tip.category?.title && (
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
              {tip.category.title}
              {tip.publishedAt &&
                ` · ${new Date(tip.publishedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`}
            </p>
          )}
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-white md:text-6xl">
            {tip.title}
          </h1>
          {tip.author?.name && (
            <p className="mt-4 text-base text-white/75">
              By {tip.author.name}
              {tip.author.role && ` · ${tip.author.role}`}
            </p>
          )}
        </Container>
      </section>

      {cover && (
        <div className="relative z-10 mx-auto -mt-10 max-w-5xl px-4 md:px-6">
          <div className="overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card-hover)]">
            <Image
              src={cover}
              alt={tip.title}
              width={1600}
              height={900}
              unoptimized
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      )}

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          <div className="prose prose-lg mx-auto max-w-3xl text-ink-soft">
            {tip.summary && (
              <p className="font-[family-name:var(--font-display)] text-2xl italic text-ink">
                {tip.summary}
              </p>
            )}
            {tip.body && <PortableText value={tip.body} />}
          </div>
        </Container>
      </section>
    </article>
  );
}
