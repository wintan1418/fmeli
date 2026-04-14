"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Radio, Clock, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

function nextSundayAt(hour: number, minute = 0) {
  const now = new Date();
  const out = new Date(now);
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const daysUntil = (7 - dayOfWeek) % 7;
  out.setDate(now.getDate() + daysUntil);
  out.setHours(hour, minute, 0, 0);
  if (out.getTime() < now.getTime()) {
    out.setDate(out.getDate() + 7);
  }
  return out;
}

function useCountdown(target: Date | null) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!target || !now) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ready: false };
  }
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, ready: true };
}

export function NextServiceBanner() {
  const [target, setTarget] = useState<Date | null>(null);
  useEffect(() => {
    setTarget(nextSundayAt(8));
  }, []);
  const { days, hours, minutes, seconds, ready } = useCountdown(target);

  return (
    <section className="relative overflow-hidden border-y border-(--color-brand-gold)/20 bg-gradient-to-r from-(--color-brand-blue-ink) via-(--color-brand-blue-deep) to-(--color-brand-red-deep) py-12 text-(--color-brand-white)">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-1/4 h-[260px] w-[260px] rounded-full bg-(--color-brand-gold)/15 blur-[120px]"
      />
      <Container>
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-12">
          <div className="flex items-start gap-5">
            <span className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-(--color-brand-gold)/15 text-(--color-brand-gold)">
              <Radio size={22} />
            </span>
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-(--color-brand-gold)">
                <Clock size={12} />
                Next Sunday Service
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-(--color-brand-white) md:text-3xl" suppressHydrationWarning>
                {target
                  ? target.toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : "Sunday"}{" "}
                ·{" "}
                <span className="italic text-(--color-brand-gold-soft)">
                  8:00 AM
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {[
              { label: "Days", value: days },
              { label: "Hrs", value: hours },
              { label: "Min", value: minutes },
              { label: "Sec", value: seconds },
            ].map((c) => (
              <div
                key={c.label}
                className="flex flex-col items-center rounded-xl border border-(--color-brand-white)/15 bg-(--color-brand-white)/5 px-4 py-3 backdrop-blur md:px-5 md:py-4"
              >
                <span
                  className="font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums text-(--color-brand-white) md:text-4xl"
                  suppressHydrationWarning
                >
                  {ready ? String(c.value).padStart(2, "0") : "--"}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--color-brand-white)/55">
                  {c.label}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/live"
            className="group inline-flex h-14 items-center gap-2 rounded-full bg-(--color-brand-gold) px-7 text-sm font-semibold text-(--color-brand-blue-ink) transition-all hover:bg-(--color-brand-gold-soft) hover:shadow-[var(--shadow-glow-gold)]"
          >
            Watch Live
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}
