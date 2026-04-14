import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn, Parallax } from "@/components/ui/Motion";

export function WelcomeNote() {
  return (
    <section className="relative overflow-hidden bg-(--color-off-white) py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -left-20 h-[360px] w-[360px] rounded-full bg-(--color-brand-gold)/8 blur-[120px]"
      />
      <Container>
        <div className="grid items-center gap-16 md:grid-cols-[1.05fr_1fr]">
          <FadeIn>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-(--color-brand-red)">
              <span className="inline-block h-px w-10 bg-(--color-brand-red)" />
              A word of welcome
            </p>
            <h2 className="mt-6 max-w-xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] tracking-tight text-(--color-ink) md:text-5xl lg:text-[56px]">
              There is room{" "}
              <span className="italic text-(--color-brand-red)">
                at His table
              </span>{" "}
              for you.
            </h2>
            <p className="mt-8 max-w-xl text-lg leading-8 text-(--color-ink-soft)">
              Full Manifestation of Eternal Life is a family of believers
              unveiling the mysteries of the kingdom — verse by verse, meeting
              by meeting. Whether you&rsquo;re new to faith, seasoned in the
              Word, or simply seeking, you will find a place here.
            </p>
            <p className="mt-5 max-w-xl text-lg leading-8 text-(--color-ink-soft)">
              From Abeokuta to Ado, Akure to Benin, our doors are open. Come as
              you are — leave carrying light.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/about"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-(--color-brand-blue-ink) px-7 text-sm font-semibold text-(--color-brand-white) transition hover:bg-(--color-brand-blue-deep)"
              >
                Our story
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/beliefs"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-(--color-ink)/15 px-7 text-sm font-medium text-(--color-ink) transition hover:border-(--color-brand-red) hover:text-(--color-brand-red)"
              >
                What we believe
              </Link>
            </div>
          </FadeIn>

          <Parallax>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[var(--radius-card)] bg-gradient-to-br from-(--color-brand-red-soft) via-transparent to-(--color-brand-gold-soft)" />
              <div className="relative overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card-hover)]">
                <Image
                  src="/images/church-cross.jpg"
                  alt="Cathedral interior with soaring arches"
                  width={1200}
                  height={1600}
                  className="h-auto w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-(--color-brand-blue-ink)/90 to-transparent p-8">
                  <p className="font-[family-name:var(--font-display)] text-lg italic text-(--color-brand-white)">
                    &ldquo;The entrance of Your word gives light; it gives
                    understanding to the simple.&rdquo;
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-(--color-brand-gold)">
                    Psalm 119:130
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-8 hidden rounded-2xl bg-(--color-brand-white) p-5 shadow-[var(--shadow-card-hover)] md:block">
                <p className="text-xs uppercase tracking-[0.2em] text-(--color-muted)">
                  Est. Nigeria
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-(--color-brand-blue-ink)">
                  8 Assemblies
                </p>
              </div>
            </div>
          </Parallax>
        </div>
      </Container>
    </section>
  );
}
