"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const HERO_IMAGES = [
  { src: "/images/fmeli/set-man.jpg", alt: "A minister at Q&A Communion Service" },
  { src: "/images/fmeli/word-preaching.jpg", alt: "Preaching the Word at Life Campaign" },
  { src: "/images/fmeli/worship-hands-up.jpg", alt: "A worshipper lifting her hands" },
  { src: "/images/fmeli/pray-woman.jpg", alt: "A sister in prayer" },
  { src: "/images/fmeli/brothers-embrace.jpg", alt: "Brothers in fellowship" },
] as const;

const SLIDE_MS = 5500;

/**
 * Hero — split layout. Left: welcome copy. Right: a stack of FMELi photos
 * that cross-fade on a timer. In Phase 2 the copy and the image set will
 * come from siteSettings.homepageHeroSlides so the admin can edit everything.
 */
export function HeroSlider() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % HERO_IMAGES.length),
      SLIDE_MS,
    );
    return () => clearInterval(t);
  }, []);
  const image = HERO_IMAGES[index];

  return (
    <section className="relative isolate overflow-hidden bg-(--color-brand-blue-ink) text-(--color-brand-white)">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-1/3 -z-10 h-[620px] w-[620px] rounded-full bg-(--color-brand-gold)/25 blur-[180px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-10%] -z-10 h-[520px] w-[520px] rounded-full bg-(--color-brand-red)/35 blur-[180px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_70%_30%,color-mix(in_srgb,var(--color-brand-blue)_55%,transparent)_0%,transparent_70%)]"
      />
      {/* Fine grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-brand-white) 1px, transparent 1px), linear-gradient(90deg, var(--color-brand-white) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto flex min-h-[100vh] w-full max-w-7xl flex-col gap-16 px-4 pt-32 pb-20 md:px-6 md:pt-36 md:pb-28 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:pt-40 lg:pb-32">
        {/* Left — message */}
        <div>
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-(--color-brand-gold)">
            <span className="inline-block h-px w-10 bg-(--color-brand-gold)" />
            Welcome to FMELi
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-(--color-brand-gold) animate-pulse" />
          </div>

          <h1 className="mt-7 font-[family-name:var(--font-display)] text-[48px] font-semibold leading-[0.98] tracking-tight text-(--color-brand-white) md:text-[72px] lg:text-[88px]">
            Full{" "}
            <span className="italic text-(--color-brand-gold-soft)">
              Manifestation
            </span>
            <br />
            of{" "}
            <span className="relative inline-block">
              Eternal Life
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 h-[3px] w-full bg-gradient-to-r from-(--color-brand-gold) via-(--color-brand-gold)/80 to-transparent"
              />
            </span>
          </h1>

          <p className="mt-9 max-w-xl text-base leading-8 text-(--color-brand-white)/80 md:text-lg">
            The entrance of Your word gives light. We are a family of believers
            unveiling the mysteries of the kingdom — across nine assemblies in
            Nigeria and everywhere online. Come as you are; leave carrying
            light.
          </p>

          <div className="mt-11 flex flex-wrap items-center gap-4">
            <Link
              href="/live"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-(--color-brand-gold) px-8 text-base font-semibold text-(--color-brand-blue-ink) transition-all duration-300 hover:bg-(--color-brand-gold-soft) hover:shadow-[var(--shadow-glow-gold)]"
            >
              <Play
                size={18}
                className="fill-current transition-transform group-hover:translate-x-0.5"
              />
              Watch live
            </Link>
            <Link
              href="/visit"
              className="group inline-flex h-14 items-center gap-3 rounded-full border border-(--color-brand-white)/30 px-8 text-base font-medium text-(--color-brand-white) backdrop-blur transition-all duration-300 hover:border-(--color-brand-gold) hover:bg-(--color-brand-white)/5 hover:text-(--color-brand-gold)"
            >
              Plan your visit
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Service info */}
          <div className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-(--color-brand-white)/15 pt-8">
            {[
              { label: "Sunday", value: "8:00 AM" },
              { label: "Wednesday", value: "6:30 PM" },
              { label: "Assemblies", value: "9 Churches" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] uppercase tracking-[0.22em] text-(--color-brand-white)/50">
                  {item.label}
                </p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-lg text-(--color-brand-white) md:text-xl">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — rotating imagery in an ancient-scroll frame.
            Parchment-style with curled/folded corners at top-left
            and bottom-right, like a scroll from Revelation partially
            unrolled and pinned open. */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          {/* Ambient glow behind the scroll */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-(--color-brand-gold)/35 via-(--color-brand-red)/20 to-transparent blur-3xl"
          />

          <div className="relative">
            {/* ─── Parchment border frame ─── */}
            <div className="rounded-2xl bg-gradient-to-br from-[#d4a85c] via-[#c8912a] to-[#a07420] p-[5px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
              <div className="relative overflow-hidden rounded-[13px] bg-brand-blue-ink">
                {/* Warm parchment edge glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-20 rounded-[13px] shadow-[inset_0_0_40px_rgba(200,145,42,0.12)]"
                />

                {/* ─── Top-left curl: folded parchment corner ─── */}
                <div aria-hidden className="absolute left-0 top-0 z-20 h-14 w-14 sm:h-16 sm:w-16">
                  {/* The fold-back triangle — the "underside" of the parchment */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-[#e8c06a] via-[#d4a85c] to-[#b8923e]"
                    style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                  />
                  {/* Shadow cast by the fold onto the image below */}
                  <div
                    className="absolute left-1 top-1 h-full w-full bg-black/30 blur-[6px]"
                    style={{ clipPath: "polygon(0 0, 85% 0, 0 85%)" }}
                  />
                  {/* Highlight line along the fold crease */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.35) 49%, rgba(255,255,255,0.1) 51%, transparent 55%)",
                    }}
                  />
                </div>

                {/* ─── Bottom-right curl: folded parchment corner ─── */}
                <div aria-hidden className="absolute bottom-0 right-0 z-20 h-14 w-14 sm:h-16 sm:w-16">
                  {/* The fold-back triangle */}
                  <div
                    className="absolute inset-0 bg-gradient-to-tl from-[#e8c06a] via-[#d4a85c] to-[#b8923e]"
                    style={{ clipPath: "polygon(100% 100%, 0 100%, 100% 0)" }}
                  />
                  {/* Shadow cast by the fold */}
                  <div
                    className="absolute -right-1 -bottom-1 h-full w-full bg-black/30 blur-[6px]"
                    style={{ clipPath: "polygon(100% 100%, 15% 100%, 100% 15%)" }}
                  />
                  {/* Highlight line along the fold crease */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.35) 49%, rgba(255,255,255,0.1) 51%, transparent 55%)",
                    }}
                  />
                </div>

                {/* Parchment-aged edge tint */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-[#c8912a]/12 via-transparent to-[#c8912a]/12"
                />

                {/* The cross-fading image stack */}
                <div className="relative aspect-[3/4]">
                  <AnimatePresence mode="sync">
                    <motion.div
                      key={image.src}
                      initial={{ opacity: 0, scale: 1.08 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 1.4, ease }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        priority={index === 0}
                        sizes="(min-width: 1024px) 420px, 90vw"
                        className="object-cover object-center"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Slide pips */}
            <div className="mt-5 flex items-center justify-center gap-2">
              {HERO_IMAGES.map((_, i) => (
                <span
                  key={i}
                  className={`h-[3px] rounded-full transition-all duration-500 ${
                    i === index
                      ? "w-7 bg-brand-gold"
                      : "w-3 bg-white/35"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-(--color-brand-white)/50 md:flex">
        <span>Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block h-7 w-px bg-gradient-to-b from-(--color-brand-gold) to-transparent"
        />
      </div>
    </section>
  );
}
