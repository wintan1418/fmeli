import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText } from "next-sanity";
import {
  ArrowLeft,
  ExternalLink,
  Headphones,
  Download,
  FileText,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { sanityFetch } from "@/lib/sanity/client";
import {
  MESSAGE_BY_SLUG_QUERY,
  ALL_MESSAGE_SLUGS_QUERY,
} from "@/lib/sanity/queries";
import type { Message } from "@/types/sanity";

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await sanityFetch<{ slug: string }[]>({
    query: ALL_MESSAGE_SLUGS_QUERY,
    tags: ["sanity:message:list"],
  });
  return (rows ?? []).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const message = await sanityFetch<Message | null>({
    query: MESSAGE_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:message:${slug}`],
  });
  return {
    title: message?.title ?? "Message",
    description: message?.excerpt,
  };
}

export default async function MessagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const message = await sanityFetch<Message | null>({
    query: MESSAGE_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:message:${slug}`],
    revalidate: 3600,
  });
  if (!message) notFound();

  const audioSrc = message.audioFileUrl ?? null;
  const audioExternal = !audioSrc && message.audioUrl ? message.audioUrl : null;
  const audioDownloadHref = message.audioFileUrl ?? message.audioUrl ?? null;
  const excerptDownloadHref =
    message.excerptFileUrl ?? message.excerptUrl ?? null;
  const hasVideo = Boolean(message.youtubeId || message.videoFileUrl);

  return (
    <>
      <section className="relative bg-brand-blue-ink pt-32 pb-16 md:pt-44">
        <Container className="relative">
          <Link
            href="/resources/messages"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
          >
            <ArrowLeft size={14} />
            All messages
          </Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
            {message.category?.title && `${message.category.title} · `}
            {message.date} {message.scripture && `· ${message.scripture}`}
            {message.durationMinutes ? ` · ${message.durationMinutes} min` : ""}
          </p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-white md:text-6xl">
            {message.title}
          </h1>
          {message.preacher?.name && (
            <p className="mt-4 text-base text-white/75">
              {message.preacher.name}
              {message.preacher.role && ` · ${message.preacher.role}`}
              {message.assembly?.city && ` · ${message.assembly.city}`}
            </p>
          )}

          {(audioDownloadHref || excerptDownloadHref) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {audioDownloadHref && (
                <a
                  href={audioDownloadHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue-ink transition hover:scale-[1.02]"
                >
                  <Download size={14} />
                  Download audio
                </a>
              )}
              {excerptDownloadHref && (
                <a
                  href={excerptDownloadHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:scale-[1.02]"
                >
                  <FileText size={14} />
                  Download excerpt
                </a>
              )}
            </div>
          )}

          {hasVideo && (
            <div className="mt-12 aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-black">
              {message.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${message.youtubeId}`}
                  title={message.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <video
                  src={message.videoFileUrl ?? undefined}
                  controls
                  preload="metadata"
                  className="h-full w-full"
                />
              )}
            </div>
          )}

          {(audioSrc || audioExternal) && (
            <div className="mt-10 flex flex-col gap-4 rounded-[var(--radius-card)] border border-white/10 bg-white/4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 text-white">
                <Headphones size={18} className="text-brand-gold" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Listen to this message
                </p>
              </div>
              {audioSrc ? (
                <audio
                  src={audioSrc}
                  controls
                  preload="none"
                  className="w-full md:max-w-md"
                />
              ) : (
                <a
                  href={audioExternal ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-blue-ink"
                >
                  Open audio
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}
        </Container>
      </section>

      {(message.excerpt ||
        message.notes?.length ||
        message.transcript?.length) && (
        <section className="bg-off-white py-20 md:py-28">
          <Container>
            {message.excerpt && (
              <p className="mx-auto max-w-3xl text-center font-[family-name:var(--font-display)] text-2xl italic leading-snug text-ink md:text-3xl">
                “{message.excerpt}”
              </p>
            )}

            {message.notes && message.notes.length > 0 && (
              <article className="prose prose-lg mx-auto mt-16 max-w-3xl text-ink-soft">
                <h2 className="text-ink">Message notes</h2>
                <PortableText value={message.notes} />
              </article>
            )}

            {message.transcript && message.transcript.length > 0 && (
              <article className="prose prose-lg mx-auto mt-16 max-w-3xl border-t border-ink/8 pt-16 text-ink-soft">
                <h2 className="text-ink">Transcript</h2>
                <PortableText value={message.transcript} />
              </article>
            )}
          </Container>
        </section>
      )}
    </>
  );
}
