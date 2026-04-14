import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Play, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { sanityFetch } from "@/lib/sanity/client";
import { SERMONS_LIST_QUERY } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sermons",
  description: "Sermons, teachings and messages from FMELi.",
};

type Sermon = {
  _id: string;
  title: string;
  slug: string;
  date?: string;
  scripture?: string;
  youtubeId?: string;
  thumbnail?: { asset?: { _ref?: string } };
  preacher?: { name?: string };
};

export default async function SermonsPage() {
  const sermons = await sanityFetch<Sermon[]>({
    query: SERMONS_LIST_QUERY,
    tags: ["sanity:sermon:list"],
    revalidate: 300,
  });

  return (
    <>
      <PageHero
        eyebrow="The archive"
        title={
          <>
            Messages from{" "}
            <span
              className="italic"
              style={{ color: "var(--color-brand-gold-soft)" }}
            >
              the pulpit
            </span>
          </>
        }
        subtitle="Browse recent teachings and special meeting messages. Notes, audio and video where available."
      />

      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-off-white)" }}
      >
        <Container>
          {sermons && sermons.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sermons.map((s) => {
                const thumb = s.thumbnail
                  ? urlFor(s.thumbnail).width(900).height(600).url()
                  : null;
                return (
                  <Link
                    key={s._id}
                    href={`/sermons/${s.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div
                      className="relative aspect-[16/10] overflow-hidden"
                      style={{ background: "var(--color-brand-blue-ink)" }}
                    >
                      {thumb && (
                        <Image
                          src={thumb}
                          alt={s.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(6,30,44,0.8), transparent)",
                        }}
                      />
                      <div
                        className="absolute bottom-5 right-5 inline-flex h-14 w-14 items-center justify-center rounded-full"
                        style={{
                          background: "var(--color-brand-gold)",
                          color: "var(--color-brand-blue-ink)",
                        }}
                      >
                        <Play size={20} className="fill-current" />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <div
                        className="text-xs uppercase tracking-[0.18em]"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {s.date} {s.scripture && `· ${s.scripture}`}
                      </div>
                      <h3
                        className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {s.title}
                      </h3>
                      <p
                        className="mt-auto text-sm"
                        style={{ color: "var(--color-ink-soft)" }}
                      >
                        {s.preacher?.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-[var(--radius-card)] border border-dashed p-12 text-center"
              style={{
                borderColor: "rgb(11 20 27 / 0.15)",
                color: "var(--color-ink-soft)",
              }}
            >
              <Clock
                size={32}
                className="mx-auto"
                style={{ color: "var(--color-brand-gold)" }}
              />
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl">
                Sermon archive coming soon.
              </p>
              <p className="mt-3 text-sm">
                The content team is preparing the first batch of messages.
                Subscribe to the newsletter to be notified when they land.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
