import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { sanityFetch } from "@/lib/sanity/client";
import { BOOKS_LIST_QUERY } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Book } from "@/types/sanity";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Books from the FMELi family — for personal study, gifts, and the household of faith.",
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default async function ShopPage() {
  const books = await sanityFetch<Book[]>({
    query: BOOKS_LIST_QUERY,
    tags: ["sanity:book:list"],
    revalidate: 600,
  });

  return (
    <>
      <PageHero
        eyebrow="The FMELi shop"
        title={
          <>
            Books from{" "}
            <span className="italic text-brand-gold-soft">the family</span>
          </>
        }
        subtitle="Books for personal study, gifts, and the household of faith. New titles arrive as the writing team finishes them."
      />

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          {books && books.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {books.map((b) => {
                const cover = b.cover
                  ? urlFor(b.cover).width(900).height(1200).url()
                  : null;
                const hasDiscount =
                  typeof b.compareAtPrice === "number" &&
                  typeof b.price === "number" &&
                  b.compareAtPrice > b.price;
                return (
                  <article
                    key={b._id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-brand-blue-soft">
                      {cover && (
                        <Image
                          src={cover}
                          alt={b.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          unoptimized
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      )}
                      {b.featured && (
                        <span className="absolute left-5 top-5 inline-flex items-center rounded-full bg-brand-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-blue-ink">
                          ★ Featured
                        </span>
                      )}
                      {b.outOfStock && (
                        <span className="absolute right-5 top-5 inline-flex items-center rounded-full bg-ink/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                          Out of stock
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-7">
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-ink">
                        <Link
                          href={`/shop/${b.slug}`}
                          className="before:absolute before:inset-0 before:content-['']"
                        >
                          {b.title}
                        </Link>
                      </h3>
                      {b.subtitle && (
                        <p className="text-sm italic text-ink-soft">
                          {b.subtitle}
                        </p>
                      )}
                      {b.author && (
                        <p className="text-xs text-muted">By {b.author}</p>
                      )}
                      {b.summary && (
                        <p className="line-clamp-3 text-sm leading-6 text-ink-soft">
                          {b.summary}
                        </p>
                      )}
                      <div className="mt-auto flex items-baseline justify-between gap-3 pt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-brand-red">
                            {typeof b.price === "number"
                              ? b.price === 0
                                ? "Free"
                                : currency.format(b.price)
                              : "—"}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-muted line-through">
                              {currency.format(b.compareAtPrice!)}
                            </span>
                          )}
                        </div>
                        <ArrowRight
                          size={16}
                          className="text-muted transition-transform group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-dashed border-ink/15 p-12 text-center text-ink-soft">
              <BookOpen size={32} className="mx-auto text-brand-gold" />
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl">
                The shop opens soon.
              </p>
              <p className="mt-3 text-sm">
                The first FMELi titles are at the press. Check back, or{" "}
                <Link
                  href="/resources"
                  className="text-brand-red underline"
                >
                  browse the free resources
                </Link>{" "}
                in the meantime.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
