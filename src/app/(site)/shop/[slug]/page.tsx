import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText } from "next-sanity";
import { ArrowLeft, ExternalLink, BookOpen, Globe } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import {
  BOOK_BY_SLUG_QUERY,
  ALL_BOOK_SLUGS_QUERY,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Book } from "@/types/sanity";

export const revalidate = 600;

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export async function generateStaticParams() {
  const rows = await sanityFetch<{ slug: string }[]>({
    query: ALL_BOOK_SLUGS_QUERY,
    tags: ["sanity:book:list"],
  });
  return (rows ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await sanityFetch<Book | null>({
    query: BOOK_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:book:${slug}`],
  });
  return {
    title: book?.title ?? "Book",
    description: book?.summary,
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await sanityFetch<Book | null>({
    query: BOOK_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:book:${slug}`],
    revalidate: 600,
  });
  if (!book) notFound();

  const cover = book.cover
    ? urlFor(book.cover).width(900).height(1200).url()
    : null;
  const hasDiscount =
    typeof book.compareAtPrice === "number" &&
    typeof book.price === "number" &&
    book.compareAtPrice > book.price;

  return (
    <>
      <section className="relative bg-brand-blue-ink pt-32 pb-20 md:pt-44 md:pb-28">
        <Container className="relative">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
          >
            <ArrowLeft size={14} />
            All books
          </Link>

          <div className="mt-10 grid gap-12 md:grid-cols-[320px_1fr] md:items-start">
            {/* Cover */}
            <div className="relative aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-brand-blue-deep shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
              {cover ? (
                <Image
                  src={cover}
                  alt={book.title}
                  width={640}
                  height={853}
                  unoptimized
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen size={48} className="text-brand-gold" />
                </div>
              )}
            </div>

            {/* Title block */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                FMELi shop
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-white md:text-6xl">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="mt-3 text-lg italic text-white/75">
                  {book.subtitle}
                </p>
              )}
              {book.author && (
                <p className="mt-2 text-base text-white/65">
                  By {book.author}
                </p>
              )}

              {/* Price + buy CTA */}
              <div className="mt-10 flex flex-wrap items-baseline gap-4">
                <span className="font-[family-name:var(--font-display)] text-4xl font-semibold text-brand-gold">
                  {typeof book.price === "number"
                    ? book.price === 0
                      ? "Free"
                      : currency.format(book.price)
                    : "—"}
                </span>
                {hasDiscount && (
                  <span className="text-base text-white/55 line-through">
                    {currency.format(book.compareAtPrice!)}
                  </span>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {book.outOfStock ? (
                  <span className="inline-flex h-14 items-center gap-3 rounded-full border border-white/30 px-8 text-base font-semibold text-white/70">
                    Out of stock
                  </span>
                ) : book.buyUrl ? (
                  <a
                    href={book.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-14 items-center gap-3 rounded-full bg-brand-gold px-8 text-base font-semibold text-brand-blue-ink transition-all duration-300 hover:bg-brand-gold-soft hover:shadow-[var(--shadow-glow-gold)]"
                  >
                    Buy now
                    <ExternalLink
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>
                ) : (
                  <span className="inline-flex h-14 items-center gap-3 rounded-full border border-white/30 px-8 text-base font-semibold text-white/70">
                    Buy link coming soon
                  </span>
                )}
              </div>

              {/* Meta */}
              <dl className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-white/15 pt-8 text-xs">
                {book.pages && (
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.18em] text-brand-gold">
                      Pages
                    </dt>
                    <dd className="mt-1 text-base text-white">{book.pages}</dd>
                  </div>
                )}
                {book.language && (
                  <div>
                    <dt className="flex items-center gap-1.5 font-semibold uppercase tracking-[0.18em] text-brand-gold">
                      <Globe size={11} /> Language
                    </dt>
                    <dd className="mt-1 text-base text-white">{book.language}</dd>
                  </div>
                )}
                {book.publishedAt && (
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.18em] text-brand-gold">
                      Published
                    </dt>
                    <dd className="mt-1 text-base text-white">
                      {new Date(book.publishedAt).toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {(book.summary || (book.description && book.description.length > 0)) && (
        <section className="bg-off-white py-20 md:py-28">
          <Container>
            <div className="prose prose-lg mx-auto max-w-3xl text-ink-soft">
              {book.summary && (
                <p className="font-[family-name:var(--font-display)] text-2xl italic text-ink">
                  {book.summary}
                </p>
              )}
              {book.description && <PortableText value={book.description} />}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
