import type { Metadata } from "next";
import { Radio, Headphones } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { sanityFetch } from "@/lib/sanity/client";
import { groq } from "next-sanity";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Watch Live",
  description: "Join the FMELi live stream — Sundays at 8:00 AM and beyond.",
};

const LIVE_QUERY = groq`*[_id == "siteSettings"][0]{
  liveStreamUrl,
  mixlrEmbedUrl
}`;

/**
 * Normalise whatever YouTube URL the office pasted into a clean
 * youtube-nocookie embed URL. Accepts:
 *   - https://www.youtube.com/watch?v=ID
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/live/ID
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID
 */
function youtubeEmbedFor(input?: string | null): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    const isYouTube =
      url.hostname.endsWith("youtube.com") ||
      url.hostname.endsWith("youtu.be") ||
      url.hostname.endsWith("youtube-nocookie.com");
    if (!isYouTube) return null;

    if (url.hostname.endsWith("youtu.be")) {
      return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    }
    const v = url.searchParams.get("v");
    if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
    if (url.pathname.startsWith("/live/")) {
      return `https://www.youtube-nocookie.com/embed/${url.pathname.replace("/live/", "")}`;
    }
    if (url.pathname.startsWith("/embed/")) {
      // Already an embed URL — preserve any channel=… query string.
      return input.replace("youtube.com", "youtube-nocookie.com");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Mixlr accepts a few URL shapes — strip everything to a canonical
 * /embed URL the iframe can render.
 *   - https://mixlr.com/users/<name>            -> /users/<name>/embed
 *   - https://mixlr.com/users/<name>/embed       -> as-is
 *   - https://<name>.mixlr.com                   -> /users/<name>/embed
 */
function mixlrEmbedFor(input?: string | null): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    if (!url.hostname.endsWith("mixlr.com")) return null;

    // Subdomain shape: <name>.mixlr.com
    if (url.hostname !== "mixlr.com" && url.hostname !== "www.mixlr.com") {
      const sub = url.hostname.replace(".mixlr.com", "");
      return `https://mixlr.com/users/${sub}/embed`;
    }

    // /users/<name>(/embed)?
    if (url.pathname.startsWith("/users/")) {
      const name = url.pathname.split("/")[2];
      if (!name) return null;
      return `https://mixlr.com/users/${name}/embed`;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function LivePage() {
  const settings = await sanityFetch<{
    liveStreamUrl?: string;
    mixlrEmbedUrl?: string;
  }>({
    query: LIVE_QUERY,
    tags: ["sanity:settings"],
    revalidate: 300,
  });
  const youtube = youtubeEmbedFor(settings?.liveStreamUrl);
  const mixlr = mixlrEmbedFor(settings?.mixlrEmbedUrl);
  const hasAnything = Boolean(youtube || mixlr);

  return (
    <>
      <PageHero
        eyebrow="Live from FMELi"
        title={
          <>
            Watch <span className="italic text-brand-gold-soft">live</span>
          </>
        }
        subtitle="Join us every Sunday at 8:00 AM WAT and for special meetings throughout the year. Tune in via YouTube for the full video experience or Mixlr for audio-only."
      />

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          {!hasAnything ? (
            <div className="aspect-video overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-brand-blue-ink shadow-[var(--shadow-card-hover)]">
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center text-white/75">
                <Radio size={36} className="text-brand-gold" />
                <p className="font-[family-name:var(--font-display)] text-2xl">
                  Live stream not configured yet.
                </p>
                <p className="max-w-md text-sm">
                  Add a YouTube URL or a Mixlr embed URL under Studio → Site
                  Settings. They&rsquo;ll appear here automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* YouTube — main 16:9 player */}
              {youtube && (
                <div className="aspect-video overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-brand-blue-ink shadow-[var(--shadow-card-hover)]">
                  <iframe
                    src={youtube}
                    title="FMELi YouTube live stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              )}

              {/* Mixlr — audio bar */}
              {mixlr && (
                <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-3 border-b border-ink/8 bg-brand-blue-ink/5 px-5 py-3">
                    <Headphones size={16} className="text-brand-gold" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-blue-ink">
                      Audio · Mixlr
                    </p>
                  </div>
                  <iframe
                    src={mixlr}
                    title="FMELi Mixlr live audio"
                    scrolling="no"
                    frameBorder="0"
                    className="h-[180px] w-full"
                  />
                </div>
              )}

              <p className="text-center text-xs text-muted">
                Stream not live yet? The player will switch to the latest
                recording as soon as service ends.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
