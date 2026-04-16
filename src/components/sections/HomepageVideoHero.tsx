import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { VideoHero } from "@/components/ui/VideoHero";
import { FadeIn } from "@/components/ui/Motion";
import { sanityFetch } from "@/lib/sanity/client";
import { HOMEPAGE_VIDEO_QUERY } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { HomepageVideo } from "@/types/sanity";

/**
 * Cinema-style video section on the homepage. Sits below the
 * HeroSlider and gives the office a single large spotlight they
 * can swap every week — a Sunday recap, pastor prayer, new-series
 * trailer.
 *
 * Hidden entirely when `siteSettings.homepageVideo.url` is empty so
 * the homepage still flows cleanly without configuration.
 *
 * Layout: copy on the left (eyebrow + headline + body + CTA), the
 * framed video on the right on wide screens; stacked top-to-bottom
 * on mobile.
 */
export async function HomepageVideoHero() {
  const video = await sanityFetch<HomepageVideo | null>({
    query: HOMEPAGE_VIDEO_QUERY,
    tags: ["sanity:settings", "sanity:homepage:video"],
    revalidate: 300,
  });

  if (!video?.url) return null;

  const posterUrl = video.poster
    ? urlFor(video.poster).width(1600).height(900).url()
    : null;

  // CTA is a Sanity cta object — { link: { label, href }, style }.
  // The link shape is the project's `link` object, normalised by
  // the schema; both href and label sit on `link`.
  const ctaLabel = video.cta?.link?.label;
  const ctaHref = video.cta?.link?.href;

  return (
    <section className="relative overflow-hidden bg-brand-blue-ink py-20 text-white md:py-28">
      {/* Ambient gold glow behind the frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[-10%] h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-brand-gold/20 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[480px] w-[480px] rounded-full bg-brand-red/25 blur-[160px]"
      />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <FadeIn>
            <div>
              {video.eyebrow && (
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-brand-gold">
                  <span className="inline-block h-px w-10 bg-brand-gold" />
                  {video.eyebrow}
                </p>
              )}
              {video.heading && (
                <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.1] text-white break-words sm:text-4xl md:text-5xl lg:text-[56px]">
                  {video.heading}
                </h2>
              )}
              {video.body && (
                <p className="mt-6 max-w-xl text-base leading-8 text-white/75 md:text-lg">
                  {video.body}
                </p>
              )}
              {ctaLabel && ctaHref && (
                <Link
                  href={ctaHref}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-blue-ink transition hover:shadow-[var(--shadow-glow-gold)]"
                >
                  {ctaLabel}
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <VideoHero
              url={video.url}
              posterUrl={posterUrl}
              /* Don't show the video's own caption — the copy column
                 already does that job. */
              caption={null}
            />
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
