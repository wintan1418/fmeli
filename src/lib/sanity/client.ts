import { createClient, type QueryParams } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";

// Server-side token for Server Components. Safe because client.ts is only
// imported from server code (page.tsx / route.tsx) — never from a client
// component. Using the read token lets us query private datasets and
// authenticated/drafts endpoints without exposing anything to the browser.
const serverToken =
  process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN;

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: serverToken,
  // CDN adds stale reads under ~60s. Next.js already caches on top via the
  // `next: { revalidate, tags }` options below, so skipping the CDN gives us
  // fresh-on-first-fetch behaviour. Revalidation via webhook still works.
  useCdn: false,
  perspective: "published",
  stega: false,
});

type FetchOptions = {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
};

/**
 * Server-only wrapper around Sanity fetches that sets cache tags + revalidate
 * windows. Always use this from Server Components — never import `client`
 * directly in a page.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  revalidate = 300,
}: FetchOptions): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {
      revalidate,
      tags,
    },
  });
}
