"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { Container } from "@/components/ui/Container";

type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

const STATS: Stat[] = [
  { value: 9, label: "Assemblies in Nigeria" },
  { value: 6000, suffix: "+", label: "Messages in the archive" },
  { value: 52, label: "Years of ministry" },
  { value: 24, suffix: "×7", label: "Live stream" },
];

function Counter({ to, suffix }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, to, {
      duration: 2.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, motionValue, to]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix && (
        <span className="text-(--color-brand-gold)">{suffix}</span>
      )}
    </span>
  );
}

export function LiveStats() {
  return (
    <section className="relative overflow-hidden bg-(--color-brand-blue-deep) py-20 text-(--color-brand-white) md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,color-mix(in_srgb,var(--color-brand-red)_18%,transparent)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/3 h-[360px] w-[360px] rounded-full bg-(--color-brand-gold)/15 blur-[160px]"
      />
      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-10 md:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-none text-(--color-brand-white) md:text-6xl lg:text-7xl">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-(--color-brand-white)/70">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
