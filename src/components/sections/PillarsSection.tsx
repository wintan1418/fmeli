import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/Motion";

type Pillar = {
  number: string;
  title: string;
  quote: string;
  scripture: string;
  image: string;
  alt: string;
};

const PILLARS: Pillar[] = [
  {
    number: "01",
    title: "For the Word",
    quote: "Verse by verse, line upon line, we unveil the mysteries of the kingdom.",
    scripture: "2 Timothy 2:15",
    image: "/images/fmeli/word-preaching.jpg",
    alt: "A minister preaching the Word at the FMELi Life Campaign",
  },
  {
    number: "02",
    title: "The Testimony of Jesus",
    quote: "The Spirit of prophecy is the testimony of Jesus — alive among us.",
    scripture: "Revelation 19:10",
    image: "/images/fmeli/fellowship-women.jpg",
    alt: "Two believers in fellowship during a Life Campaign session",
  },
  {
    number: "03",
    title: "We Pray",
    quote: "Our first language is prayer — we gather at the altar without ceasing.",
    scripture: "1 Thessalonians 5:17",
    image: "/images/fmeli/pray-woman.jpg",
    alt: "A sister in prayer at a FMELi gathering",
  },
  {
    number: "04",
    title: "We Worship",
    quote: "We are given to Him — in spirit, in truth, in every song we raise.",
    scripture: "John 4:23",
    image: "/images/fmeli/worship-hands-up.jpg",
    alt: "A worshipper lifting her hands to God",
  },
];

export function PillarsSection() {
  return (
    <section className="relative overflow-hidden bg-off-white py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[1px] w-[240px] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,var(--color-brand-gold),transparent)]"
      />
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-brand-red">
              <span className="inline-block h-px w-10 bg-brand-red" />
              How we live it
              <span className="inline-block h-px w-10 bg-brand-red" />
            </p>
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-5xl lg:text-[64px]">
              For the Word.{" "}
              <span className="italic text-brand-red">
                The testimony of Jesus.
              </span>
              <br />
              We pray. We worship.{" "}
              <span className="italic text-brand-red">We are given.</span>
            </h2>
            <p className="mt-8 text-lg leading-8 text-ink-soft">
              These are not slogans — they are the rhythm of our life together.
              Four pillars that shape every gathering, every assembly, every
              song, every message.
            </p>
          </div>
        </FadeIn>

        <StaggerChildren
          className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.12}
        >
          {PILLARS.map((p) => (
            <StaggerItem key={p.number}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-brand-blue-ink shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.07]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-ink via-brand-blue-ink/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-red-deep/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <span className="absolute left-6 top-6 font-[family-name:var(--font-display)] text-5xl font-semibold text-brand-gold/90">
                    {p.number}
                  </span>
                </div>

                <div className="relative flex flex-1 flex-col gap-4 p-7 text-brand-white">
                  <div
                    aria-hidden
                    className="absolute left-7 top-0 h-px w-12 -translate-y-[1px] bg-brand-gold transition-all duration-500 group-hover:w-20"
                  />
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-brand-white md:text-[26px]">
                    {p.title}
                  </h3>
                  <p className="text-sm italic leading-6 text-white/75">
                    &ldquo;{p.quote}&rdquo;
                  </p>
                  <p className="mt-auto text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-gold">
                    {p.scripture}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}
