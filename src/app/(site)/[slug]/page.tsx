import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/lib/sanity/client";
import { PAGE_BY_SLUG_QUERY, ALL_PAGE_SLUGS_QUERY } from "@/lib/sanity/queries";

export const revalidate = 300;

type PageDoc = {
  title: string;
  slug: string;
  seo?: { title?: string; description?: string };
  sections?: Array<{ _key: string; _type: string; [k: string]: unknown }>;
};

// Reserved slugs that live as their own routes — never resolved by the catchall.
const RESERVED = new Set([
  "events",
  "sermons",
  "meetings",
  "assemblies",
  "blog",
  "give",
  "live",
  "studio",
  "api",
]);

export async function generateStaticParams() {
  const rows = await sanityFetch<{ slug: string }[]>({
    query: ALL_PAGE_SLUGS_QUERY,
    tags: ["sanity:page:list"],
  });
  return (rows ?? [])
    .filter((r) => !RESERVED.has(r.slug))
    .map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};
  const page = await sanityFetch<PageDoc | null>({
    query: PAGE_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:page:${slug}`],
  });
  return {
    title: page?.seo?.title ?? page?.title,
    description: page?.seo?.description,
  };
}

export default async function DynamicPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const page = await sanityFetch<PageDoc | null>({
    query: PAGE_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:page:${slug}`],
    revalidate: 300,
  });

  if (!page) notFound();
  return <PageBuilder sections={page.sections} />;
}
