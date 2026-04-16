"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cinema-style video embed.
 *
 * Renders a 16:9 letterboxed frame with a poster image. Clicking the
 * play button swaps the poster for an `<iframe>` (YouTube / Vimeo)
 * or a `<video>` tag (direct .mp4) with autoplay. Behind the frame
 * sits a soft brand-gold glow so the whole thing feels like a screen
 * in a dark room.
 *
 * Supports:
 *   - YouTube (youtu.be/<id>, youtube.com/watch?v=<id>, /embed/<id>)
 *   - Vimeo   (vimeo.com/<id>)
 *   - Direct .mp4 / .webm
 *
 * Invalid or unknown URLs render a disabled placeholder instead of
 * crashing — the office can paste whatever link they have and the
 * page degrades gracefully.
 */

type Props = {
  url?: string | null;
  posterUrl?: string | null;
  caption?: string | null;
  /** Render tight (no outer padding, fills parent) instead of cinema-framed. */
  variant?: "cinema" | "flush";
  className?: string;
};

type Parsed =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "file"; url: string }
  | { kind: "unknown" };

function parseVideoUrl(url: string): Parsed {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // YouTube — three common shapes.
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? { kind: "youtube", id } : { kind: "unknown" };
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v) return { kind: "youtube", id: v };
      const embedMatch = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (embedMatch) return { kind: "youtube", id: embedMatch[1] };
      const shortsMatch = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shortsMatch) return { kind: "youtube", id: shortsMatch[1] };
    }

    // Vimeo — vimeo.com/<id>
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return { kind: "vimeo", id };
    }

    // Direct file — mp4 / webm / mov
    if (/\.(mp4|webm|mov)(\?|$)/i.test(u.pathname)) {
      return { kind: "file", url };
    }

    return { kind: "unknown" };
  } catch {
    return { kind: "unknown" };
  }
}

function youtubeThumb(id: string): string {
  // maxresdefault falls back to hqdefault for older videos. The
  // <Image> below uses unoptimized so next/image won't choke.
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

export function VideoHero({
  url,
  posterUrl,
  caption,
  variant = "cinema",
  className,
}: Props) {
  const [playing, setPlaying] = useState(false);

  if (!url) return null;
  const parsed = parseVideoUrl(url);
  if (parsed.kind === "unknown") return null;

  const resolvedPoster =
    posterUrl ??
    (parsed.kind === "youtube" ? youtubeThumb(parsed.id) : null);

  const frame = (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-brand-blue-ink",
        variant === "cinema"
          ? "rounded-2xl shadow-[0_40px_120px_-20px_rgba(6,30,44,0.6)] ring-1 ring-white/10"
          : "",
      )}
    >
      {!playing && (
        <>
          {resolvedPoster ? (
            <Image
              src={resolvedPoster}
              alt={caption ?? "Video poster"}
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              unoptimized
              className="object-cover"
              priority={variant === "cinema"}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-ink via-brand-blue-deep to-brand-red/60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-ink/70 via-transparent to-transparent" />
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="Play video"
            className="absolute inset-0 flex items-center justify-center focus:outline-none"
          >
            <span className="group inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-gold text-brand-blue-ink shadow-[var(--shadow-glow-gold)] transition-transform duration-500 hover:scale-110 sm:h-24 sm:w-24">
              <Play size={28} className="fill-current" />
            </span>
          </button>
        </>
      )}
      {playing && parsed.kind === "youtube" && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${parsed.id}?autoplay=1&rel=0&modestbranding=1`}
          title={caption ?? "Video"}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}
      {playing && parsed.kind === "vimeo" && (
        <iframe
          src={`https://player.vimeo.com/video/${parsed.id}?autoplay=1&title=0&byline=0`}
          title={caption ?? "Video"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}
      {playing && parsed.kind === "file" && (
        <video
          src={parsed.url}
          controls
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full bg-black"
        />
      )}
    </div>
  );

  if (variant === "flush") {
    return <div className={className}>{frame}</div>;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Soft gold glow behind the screen */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[32px] bg-brand-gold/20 blur-[80px]"
      />
      {caption && (
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.24em] text-brand-gold sm:text-sm">
          {caption}
        </p>
      )}
      {frame}
    </div>
  );
}
