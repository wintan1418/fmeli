import { createClient, type SanityClient } from "next-sanity";
import { withSanityRetry } from "./retry";

/**
 * Server-only Sanity client for mutations.
 *
 * Always built fresh per request — never cache or memoise — because a
 * stale client across deploys is hard to reason about and the cost of
 * a new instance is negligible. Throws if SANITY_API_WRITE_TOKEN is
 * missing so the dashboard fails loud instead of silently dropping
 * the user's edits.
 */
export function getWriteClient(): SanityClient {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "SANITY_API_WRITE_TOKEN is not set — dashboard mutations are disabled.",
    );
  }
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01",
    token,
    useCdn: false,
  });
}

/**
 * Convenience wrapper that routes a mutation through withSanityRetry,
 * so dashboard writes survive the same WSL DNS hiccups that the read
 * client already absorbs.
 *
 * Usage:
 *   await sanityWrite("create member", (c) => c.create(doc));
 */
export async function sanityWrite<T>(
  label: string,
  fn: (client: SanityClient) => Promise<T>,
): Promise<T> {
  const client = getWriteClient();
  return withSanityRetry(label, () => fn(client));
}
