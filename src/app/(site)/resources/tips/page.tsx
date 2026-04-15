import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { sanityFetch } from "@/lib/sanity/client";
import { TIPS_LIST_QUERY, TIP_CATEGORIES_QUERY } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Tip, TipCategory } from "@/types/sanity";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tips",
  description:
    "Short pastoral tips on health, family, finances and walking with God — bite-size wisdom from the FMELi family.",
};

export default async function TipsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: activeCategory } = await searchParams;

  const [tips, categories] = await Promise.all([
    sanityFetch<Tip[]>({
      query: TIPS_LIST_QUERY,
      params: { category: activeCategory ?? null },
      tags: [
        "sanity:tip:list",
        activeCategory
          ? `sanity:tip:category:${activeCategory}`
          : "sanity:tip:category:all",
      ],
      revalidate: 300,
    }),
    sanityFetch<TipCategory[]>({
      query: TIP_CATEGORIES_QUERY,
      tags: ["sanity:tipCategory:list"],
      revalidate: 3600,
    }),
  ]);

  const activeCategoryDoc = activeCategory
    ? categories?.find((c) => c.slug === activeCategory) ?? null
    : null;

  return (
    <>
      <PageHero
        eyebrow={activeCategoryDoc ? activeCategoryDoc.title : "For everyday life"}
        title={
          <>
            {activeCategoryDoc ? activeCategoryDoc.title : "Tips"}{" "}
            <span className="italic text-brand-gold-soft">
              from the family
            </span>
          </>
        }
        subtitle={
          activeCategoryDoc?.description ??
          "Short reads on health, family, finances and walking with God — pastoral wisdom in bite-size form."
        }
      />

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          {categories && categories.length > 0 && (
            <div className="mb-12 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Categories
              </span>
              <CategoryChip
                href="/resources/tips"
                label="All"
                active={!activeCategory}
              />
              {categories.map((c) => (
                <CategoryChip
                  key={c._id}
                  href={`/resources/tips?category=${c.slug}`}
                  label={c.title}
                  active={activeCategory === c.slug}
                />
              ))}
            </div>
          )}

          {tips && tips.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tips.map((t) => {
                const cover = t.coverImage
                  ? urlFor(t.coverImage).width(900).height(600).url()
                  : null;
                return (
                  <article
                    key={t._id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    {cover && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-brand-blue-soft">
                        <Image
                          src={cover}
                          alt={t.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          unoptimized
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                        />
                        {t.category?.title && (
                          <span className="absolute left-5 top-5 inline-flex items-center rounded-full bg-brand-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-blue-ink">
                            {t.category.title}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-3 p-7">
                      {!cover && t.category?.title && (
                        <span className="inline-flex w-fit items-center rounded-full bg-brand-blue-ink/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-blue-ink">
                          {t.category.title}
                        </span>
                      )}
                      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">
                        {t.publishedAt &&
                          new Date(t.publishedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                      </div>
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-ink">
                        <Link
                          href={`/resources/tips/${t.slug}`}
                          className="before:absolute before:inset-0 before:content-['']"
                        >
                          {t.title}
                        </Link>
                      </h3>
                      {t.summary && (
                        <p className="line-clamp-3 text-sm leading-6 text-ink-soft">
                          {t.summary}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        {t.author?.name && (
                          <p className="text-xs text-muted">{t.author.name}</p>
                        )}
                        <ArrowUpRight
                          size={16}
                          className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-dashed border-ink/15 p-12 text-center text-ink-soft">
              <Sparkles size={32} className="mx-auto text-brand-gold" />
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl">
                {activeCategoryDoc
                  ? `No tips in ${activeCategoryDoc.title} yet.`
                  : "Tips coming soon."}
              </p>
              <p className="mt-3 text-sm">
                {activeCategoryDoc ? (
                  <>
                    Try{" "}
                    <Link
                      href="/resources/tips"
                      className="text-brand-red underline"
                    >
                      browsing every category
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    The pastoral team is preparing the first batch. Check back
                    shortly.
                  </>
                )}
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full border border-brand-blue-ink bg-brand-blue-ink px-3.5 py-1.5 text-xs font-semibold text-white"
          : "rounded-full border border-ink/12 bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-ink/30 hover:bg-ink/2"
      }
    >
      {label}
    </Link>
  );
}
