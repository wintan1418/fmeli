/**
 * Sanity request retry helper.
 *
 * WSL2 dev environments hit transient DNS failures every now and then
 * when contacting api.sanity.io — `EAI_AGAIN`, `ENOTFOUND`, etc. Without
 * a retry these turn into 500s on the dashboard or notFound() on a page
 * that just needed one more attempt. Production (Vercel) almost never
 * needs this, but a small retry budget is cheap insurance.
 *
 * Up to 3 attempts with linear backoff (150ms, 300ms). Only retries the
 * known transient codes — query errors, auth errors, and 4xx responses
 * still fail fast on the first attempt.
 *
 * On the final failure we throw a sanitised Error so the original
 * request body / Authorization header never end up in server logs.
 */

const MAX_ATTEMPTS = 3;

export async function withSanityRetry<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      const isRetryable = isTransientNetworkError(err);
      if (attempt >= MAX_ATTEMPTS || !isRetryable) {
        const safe = new Error(
          `Sanity ${label} failed after ${attempt} attempt(s): ${
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
