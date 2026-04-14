import { Sparkles } from "lucide-react";

const ITEMS = [
  "Sunday Service · 8:00 AM across all assemblies",
  "Wednesday Teaching Series · 6:30 PM",
  "Annual Life Campaign · Register now",
  "New sermon uploaded · Listen now",
  "Monthly Vigil · First Friday, 10:00 PM",
  "Watch FMELi Live · Sundays 8am WAT",
] as const;

export function AnnouncementTicker() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-(--color-brand-blue-ink)/10 bg-(--color-brand-blue-ink) py-3 text-(--color-brand-white)">
      <div className="flex w-max animate-marquee items-center gap-12 whitespace-nowrap">
        {loop.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 text-sm font-medium tracking-wide"
          >
            <Sparkles
              size={14}
              className="text-(--color-brand-gold)"
              aria-hidden
            />
            {item}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-(--color-brand-blue-ink) to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-(--color-brand-blue-ink) to-transparent" />
    </div>
  );
}
