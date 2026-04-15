import type { Metadata } from "next";
import { Radio } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { sanityFetch } from "@/lib/sanity/client";
import { groq } from "next-sanity";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Watch Live",
  description: "Join the FMELi live stream — Sundays at 8:00 AM and beyond.",
};

const LIVE_QUERY = groq`*[_id == "siteSettings"][0]{ liveStreamUrl }`;

function embedUrlFor(input?: string | null): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    // YouTube full URL
    if (
      url.hostname.endsWith("youtube.com") ||
      url.hostname.endsWith("youtu.be")
    ) {
      if (url.hostname.endsWith("youtu.be")) {
        return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
      }
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      if (url.pathname.startsWith("/live/")) {
        return `https://www.youtube-nocookie.com/embed/${url.pathname.replace("/live/", "")}`;
      }
      if (url.pathname.startsWith("/embed/")) {
        return input;
      }
    }
    return input;
  } catch {
    return null;
  }
}

export default async function LivePage() {
  const settings = await sanityFetch<{ liveStreamUrl?: string }>({
    query: LIVE_QUERY,
    tags: ["sanity:settings"],
    revalidate: 300,
  });
  const embed = embedUrlFor(settings?.liveStreamUrl);

  return (
    <>
      <PageHero
        eyebrow="Live from FMELi"
        title={
          <>
            Watch{" "}
            <span className="italic text-brand-gold-soft">live</span>
          </>
        }
        subtitle="Join us every Sunday at 8:00 AM WAT and for special meetings throughout the year. If the stream isn't live right now, the player below will show the latest recording."
      />

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          <div className="aspect-video overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-brand-blue-ink shadow-[var(--shadow-card-hover)]">
            {embed ? (
              <iframe
                src={embed}
                title="FMELi live stream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center text-white/75">
                <Radio size={36} className="text-brand-gold" />
                <p className="font-[family-name:var(--font-display)] text-2xl">
                  Live stream not configured yet.
                </p>
                <p className="max-w-md text-sm">
                  Add your YouTube live URL under Studio → Site Settings →
                  Live stream URL. It will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
