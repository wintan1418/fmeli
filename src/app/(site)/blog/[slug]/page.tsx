import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText, type PortableTextBlock } from "next-sanity";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import {
  POST_BY_SLUG_QUERY,
  ALL_POST_SLUGS_QUERY,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export const revalidate = 600;

type PostDoc = {
  _id: string;
  title: string;
  publishedAt: string;
  excerpt?: string;
  coverImage?: { asset?: { _ref?: string } };
  body?: PortableTextBlock[];
  author?: { name?: string; role?: string };
};

export async function generateStaticParams() {
  const rows = await sanityFetch<{ slug: string }[]>({
    query: ALL_POST_SLUGS_QUERY,
    tags: ["sanity:post:list"],
  });
  return (rows ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityFetch<PostDoc | null>({
    query: POST_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:post:${slug}`],
  });
  return {
    title: post?.title ?? "Post",
    description: post?.excerpt,
  };
}

export default async function PostPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await sanityFetch<PostDoc | null>({
    query: POST_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:post:${slug}`],
    revalidate: 600,
  });
  if (!post) notFound();

  const cover = post.coverImage
    ? urlFor(post.coverImage).width(1600).height(900).url()
    : null;

  return (
    <article>
      <section
        className="relative pt-32 pb-16 md:pt-44"
        style={{ background: "var(--color-brand-blue-ink)" }}
      >
        <Container className="relative">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "rgb(255 255 255 / 0.6)" }}
          >
            <ArrowLeft size={14} />
            Back to blog
          </Link>
          <p
            className="mt-8 text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--color-brand-gold)" }}
          >
            {new Date(post.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1
            className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] md:text-6xl"
            style={{ color: "white" }}
          >
            {post.title}
          </h1>
          {post.author?.name && (
            <p
              className="mt-4 text-base"
              style={{ color: "rgb(255 255 255 / 0.75)" }}
            >
              {post.author.name}
              {post.author.role && ` · ${post.author.role}`}
            </p>
          )}
        </Container>
      </section>

      {cover && (
        <div
          className="mx-auto -mt-10 max-w-5xl px-4 md:px-6"
          style={{ position: "relative", zIndex: 1 }}
        >
          <div className="overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card-hover)]">
            <Image
              src={cover}
              alt={post.title}
              width={1600}
              height={900}
              unoptimized
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      )}

      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-off-white)" }}
      >
        <Container>
          <div
            className="prose prose-lg mx-auto max-w-3xl"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {post.body && <PortableText value={post.body} />}
          </div>
        </Container>
      </section>
    </article>
  );
}
