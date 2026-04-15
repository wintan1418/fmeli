import { createClient, type QueryParams } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";

const serverToken =
  process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN;

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
 * Server-only wrapper around Sanity fetches.
 *
 * Why this exists:
 *  - Sets Next.js cache tags + revalidate window per query (see docs/ARCHITECTURE.md §4.2).
 *  - Retries on EAI_AGAIN / network hiccups — WSL DNS flakes in dev which
 *    would otherwise turn every affected page into a 500 / notFound. We do
 *    up to 3 attempts with a short backoff; production (Vercel) almost
 *    never needs this, but it's cheap insurance.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  revalidate = 300,
}: FetchOptions): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await client.fetch<T>(query, params, {
        next: { revalidate, tags },
      });
    } catch (err) {
      attempt += 1;
      const isRetryable = isTransientNetworkError(err);
      if (attempt >= 3 || !isRetryable) {
        // Swallow the underlying stack on the final rethrow so we never echo
        // the Authorization header or request body into server logs.
        const safe = new Error(
          `Sanity fetch failed after ${attempt} attempt(s): ${
            isRetryable ? "network error" : "query error"
          }`,
        );
        (safe as Error & { cause?: unknown }).cause =
          err instanceof Error ? err.name : "unknown";
        throw safe;
      }
      await new Promise((r) => setTimeout(r, 150 * attempt));
    }
  }
}

function isTransientNetworkError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const candidates = [err, (err as { cause?: unknown }).cause];
  for (const c of candidates) {
    if (!c || typeof c !== "object") continue;
    const code = (c as { code?: string }).code;
    if (
      code === "EAI_AGAIN" ||
      code === "ENOTFOUND" ||
      code === "ETIMEDOUT" ||
      code === "ECONNRESET" ||
      code === "UND_ERR_SOCKET" ||
      code === "UND_ERR_CONNECT_TIMEOUT"
    ) {
      return true;
    }
  }
  return false;
}
