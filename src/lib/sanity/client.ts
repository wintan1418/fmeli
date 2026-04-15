import { createClient, type QueryParams } from "next-sanity";
import { withSanityRetry } from "./retry";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";

const serverToken =
  process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN;

/**
 * Read-only Sanity client used by Server Components.
 *
 * Server-only — never imported into a "use client" file because the
 * token would leak to the browser. For mutations from server actions
 * or route handlers, use `getWriteClient()` from ./write-client.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: serverToken,
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
 * Server-only wrapper around `client.fetch` that:
 *   1. Sets Next.js cache tags + revalidate window per query
 *      (see docs/ARCHITECTURE.md §4.2).
 *   2. Retries on transient network errors via withSanityRetry.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  revalidate = 300,
}: FetchOptions): Promise<T> {
  return withSanityRetry("fetch", () =>
    client.fetch<T>(query, params, {
      next: { revalidate, tags },
    }),
  );
}
