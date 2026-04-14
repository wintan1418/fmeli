import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { sanityFetch } from "@/lib/sanity/client";
import { POSTS_QUERY } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
  description: "Writings and reflections from FMELi.",
};

type Post = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  coverImage?: { asset?: { _ref?: string } };
  author?: { name?: string };
};

export default async function BlogPage() {
  const posts = await sanityFetch<Post[]>({
    query: POSTS_QUERY,
    tags: ["sanity:post:list"],
    revalidate: 300,
  });

  return (
    <>
      <PageHero
        eyebrow="Writings"
        title={
          <>
            The FMELi{" "}
            <span
              className="italic"
              style={{ color: "var(--color-brand-gold-soft)" }}
            >
              blog
            </span>
          </>
        }
        subtitle="Reflections, teachings, announcements and stories from across our assemblies."
      />

      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-off-white)" }}
      >
        <Container>
          {posts && posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => {
                const cover = p.coverImage
                  ? urlFor(p.coverImage).width(900).height(600).url()
                  : null;
                return (
                  <Link
                    key={p._id}
                    href={`/blog/${p.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    {cover && (
                      <div
                        className="relative aspect-[16/10] overflow-hidden"
                        style={{ background: "var(--color-brand-blue-soft)" }}
                      >
                        <Image
                          src={cover}
                          alt={p.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          unoptimized
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-3 p-7">
                      <div
                        className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                        style={{ color: "var(--color-brand-red)" }}
                      >
                        {new Date(p.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <h3
                        className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {p.title}
                      </h3>
                      {p.excerpt && (
                        <p
                          className="text-sm leading-6"
                          style={{ color: "var(--color-ink-soft)" }}
                        >
                          {p.excerpt}
                        </p>
                      )}
                      {p.author?.name && (
                        <p
                          className="mt-auto text-xs"
                          style={{ color: "var(--color-muted)" }}
                        >
                          {p.author.name}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-[var(--radius-card)] border border-dashed p-12 text-center"
              style={{
                borderColor: "rgb(11 20 27 / 0.15)",
                color: "var(--color-ink-soft)",
              }}
            >
              <BookOpen
                size={32}
                className="mx-auto"
                style={{ color: "var(--color-brand-gold)" }}
              />
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl">
                First posts on the way.
              </p>
              <p className="mt-3 text-sm">
                The FMELi writing team is preparing the first batch of articles.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
