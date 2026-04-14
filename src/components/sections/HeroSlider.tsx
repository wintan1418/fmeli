"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  eyebrow: string;
  heading: string;
  headingAccent?: string;
  body: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  image: string;
  alt: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Welcome to FMELi",
    heading: "Full Manifestation",
    headingAccent: "of Eternal Life",
    body: "The entrance of Your word gives light. Join us as we unveil the mysteries that guide our path to salvation — across nine assemblies in Nigeria and everywhere online.",
    primary: { label: "Watch live", href: "/live" },
    secondary: { label: "Plan a visit", href: "/visit" },
    image: "/images/jesus-light.jpg",
    alt: "Congregation worshipping under stage lights",
  },
  {
    eyebrow: "Weekly Meeting",
    heading: "Wednesday",
    headingAccent: "Teaching Series",
    body: "Every Wednesday we gather around the Word — verse by verse, line upon line. Come hungry; leave transformed.",
    primary: { label: "Join Wednesday", href: "/meetings/wednesday" },
    secondary: { label: "Latest message", href: "/sermons" },
    image: "/images/church-cross.jpg",
    alt: "Cathedral interior with gothic arches",
  },
  {
    eyebrow: "This Sunday",
    heading: "Kiss",
    headingAccent: "the Son",
    body: "Sunday worship from 8:00 AM across all assemblies. Bring a friend — there is room at His table.",
    primary: { label: "Find an assembly", href: "/assemblies" },
    secondary: { label: "See all meetings", href: "/meetings" },
    image: "/images/worship-hands.jpg",
    alt: "Hand raised in worship",
  },
];

const AUTO_MS = 6500;

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (next: number) => {
      setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
    },
    [],
  );

  const next = useCallback(() => go(index + 1), [index, go]);
  const prev = useCallback(() => go(index - 1), [index, go]);

  useEffect(() => {
    const t = setTimeout(() => go(index + 1), AUTO_MS);
    return () => clearTimeout(t);
  }, [index, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = SLIDES[index];

  return (
    <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-(--color-brand-blue-ink) text-(--color-brand-white)">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-(--color-brand-blue-ink)/95 via-(--color-brand-blue-ink)/75 to-(--color-brand-blue-ink)/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-(--color-brand-blue-ink) via-transparent to-(--color-brand-blue-ink)/40" />
        </motion.div>
      </AnimatePresence>

      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-[-8%] -z-10 h-[520px] w-[520px] rounded-full bg-(--color-brand-gold)/20 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-8%] -z-10 h-[480px] w-[480px] rounded-full bg-(--color-brand-red)/30 blur-[160px]"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col justify-center px-4 py-24 md:px-6 md:py-32 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.heading + (slide.headingAccent ?? "")}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-(--color-brand-gold)">
              <span className="inline-block h-px w-10 bg-(--color-brand-gold)" />
              {slide.eyebrow}
            </div>
            <h1 className="mt-6 max-w-5xl font-[family-name:var(--font-display)] text-[44px] font-semibold leading-[1.02] tracking-tight text-(--color-brand-white) md:text-7xl lg:text-[86px]">
              {slide.heading}
              {slide.headingAccent && (
                <>
                  <br />
                  <span className="italic text-(--color-brand-gold-soft)">
                    {slide.headingAccent}
                  </span>
                </>
              )}
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-(--color-brand-white)/85 md:text-lg">
              {slide.body}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={slide.primary.href}
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-(--color-brand-gold) px-8 text-base font-semibold text-(--color-brand-blue-ink) transition-all duration-300 hover:bg-(--color-brand-gold-soft) hover:shadow-[var(--shadow-glow-gold)]"
              >
                <Play
                  size={18}
                  className="fill-current transition-transform group-hover:translate-x-0.5"
                />
                {slide.primary.label}
              </Link>
              {slide.secondary && (
                <Link
                  href={slide.secondary.href}
                  className="group inline-flex h-14 items-center gap-3 rounded-full border border-(--color-brand-white)/30 px-8 text-base font-medium text-(--color-brand-white) backdrop-blur transition-all duration-300 hover:border-(--color-brand-white) hover:bg-(--color-brand-white)/10"
                >
                  {slide.secondary.label}
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-(--color-brand-white)/15 pt-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-(--color-brand-white)/30 text-(--color-brand-white) transition hover:border-(--color-brand-gold) hover:text-(--color-brand-gold)"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-(--color-brand-white)/30 text-(--color-brand-white) transition hover:border-(--color-brand-gold) hover:text-(--color-brand-gold)"
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-(--color-brand-white)/60">
            <span className="font-[family-name:var(--font-display)] text-2xl text-(--color-brand-white)">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-(--color-brand-white)/40">/</span>
            <span>{String(SLIDES.length).padStart(2, "0")}</span>
          </div>

          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                className={cn(
                  "h-[3px] transition-all duration-300",
                  i === index
                    ? "w-12 bg-(--color-brand-gold)"
                    : "w-6 bg-(--color-brand-white)/30 hover:bg-(--color-brand-white)/60",
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
