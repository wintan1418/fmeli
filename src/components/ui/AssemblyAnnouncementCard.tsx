import Image from "next/image";
import { PortableText } from "next-sanity";
import { Calendar, ExternalLink, Radio } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import type { AssemblyAnnouncement } from "@/types/sanity";
import { VideoHero } from "./VideoHero";

/**
 * One per-assembly announcement, rendered as a hero-style card with
 * optional inline live stream. Used on the public campus page and
 * in the pastor dashboard preview.
 *
 * Layout is adaptive to content:
 *   - with streamUrl that parses as a video → inline VideoHero player
 *   - with streamUrl that's a registration link → CTA button
 *   - with hero image → big splash; without → solid-colour splash
 */

const KIND_STYLES: Record<
  NonNullable<AssemblyAnnouncement["kind"]>,
  { label: string; bg: string; text: string }
> = {
  special: {
    label: "Special meeting",
    bg: "bg-brand-red/15 border-brand-red/30",
    text: "text-brand-red",
  },
  event: {
    label: "Event",
    bg: "bg-brand-gold/20 border-brand-gold/40",
    text: "text-brand-blue-ink",
  },
  stream: {
    label: "Live stream",
    bg: "bg-brand-blue-ink/10 border-brand-blue-ink/25",
    text: "text-brand-blue-ink",
  },
  general: {
    label: "Notice",
    bg: "bg-ink/8 border-ink/20",
    text: "text-ink",
  },
};

// URLs that a VideoHero can actually embed. Anything else (Zoom link,
// form registration, bank details) we just render as a CTA button.
function isEmbeddableVideo(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return true;
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com"))
      return true;
    if (host === "vimeo.com") return true;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(u.pathname)) return true;
    return false;
  } catch {
    return false;
  }
}

function formatWhen(startsAt?: string, endsAt?: string): string | null {
  if (!startsAt && !endsAt) return null;
  const d = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  if (startsAt && endsAt) return `${d(startsAt)} — ${d(endsAt)}`;
  return d(startsAt ?? endsAt!);
}

export function AssemblyAnnouncementCard({
  announcement,
}: {
  announcement: AssemblyAnnouncement;
}) {
  const kind = announcement.kind ?? "general";
  const style = KIND_STYLES[kind];
  const when = formatWhen(announcement.startsAt, announcement.endsAt);
  const streamEmbeds =
    announcement.streamUrl != null && isEmbeddableVideo(announcement.streamUrl);
  const heroUrl = announcement.heroImage
    ? urlFor(announcement.heroImage).width(1600).height(900).url()
    : null;

  return (
    <article className="relative overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] ring-1 ring-ink/5">
      {/* Media — streams use the video player, otherwise hero image */}
      {streamEmbeds && announcement.streamUrl ? (
        <div className="relative bg-brand-blue-ink">
          <VideoHero url={announcement.streamUrl} variant="flush" />
        </div>
      ) : heroUrl ? (
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-brand-blue-ink">
          <Image
            src={heroUrl}
            alt={announcement.title}
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-ink/60 via-transparent to-transparent" />
        </div>
      ) : null}

      <div className="flex flex-col gap-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${style.bg} ${style.text}`}
          >
            {kind === "stream" && <Radio size={12} />}
            {style.label}
          </span>
          {announcement.isPinned && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">
              ★ Pinned
            </span>
          )}
          {when && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
              <Calendar size={12} />
              {when}
            </span>
          )}
        </div>

        <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-ink break-words sm:text-3xl">
          {announcement.title}
        </h3>

        {announcement.body && announcement.body.length > 0 && (
          <div className="prose prose-sm max-w-none text-ink-soft sm:prose-base">
            <PortableText value={announcement.body} />
          </div>
        )}

        {announcement.streamUrl && !streamEmbeds && (
          <div>
            <a
              href={announcement.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-red-deep"
            >
              {announcement.ctaLabel ??
                (kind === "stream" ? "Open stream" : "Register")}
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
