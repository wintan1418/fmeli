import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/ui/Motion";

type Assembly = {
  city: string;
  state: string;
  tagline: string;
  slug: string;
};

const ASSEMBLIES: Assembly[] = [
  { city: "Lagos", state: "Lagos", tagline: "The city assembly", slug: "lagos" },
  { city: "Abeokuta", state: "Ogun", tagline: "The rock", slug: "abeokuta" },
  { city: "Ibadan", state: "Oyo", tagline: "Coming soon", slug: "ibadan" },
  { city: "Akure", state: "Ondo", tagline: "The ancient city", slug: "akure" },
  { city: "Osogbo", state: "Osun", tagline: "The grove", slug: "osogbo" },
  { city: "Ife", state: "Osun", tagline: "The source", slug: "ife" },
  { city: "Ondo", state: "Ondo", tagline: "The kingdom", slug: "ondo" },
  { city: "Benin", state: "Edo", tagline: "The heritage", slug: "benin" },
  { city: "Ado", state: "Ekiti", tagline: "The hills", slug: "ado" },
];

export function AssembliesBand() {
  return (
    <section className="relative overflow-hidden bg-(--color-cream) py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-brand-blue-ink) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <Container className="relative">
        <FadeIn>
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-(--color-brand-red)">
                <span className="inline-block h-px w-10 bg-(--color-brand-red)" />
                Our assemblies
              </p>
              <h2 className="mt-6 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] tracking-tight text-(--color-ink) md:text-5xl lg:text-[56px]">
                Find a home in{" "}
                <span className="italic text-(--color-brand-red)">
                  your city
                </span>
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-(--color-ink-soft)">
              Nine assemblies across Nigeria, one body, one word. Choose the
              nearest campus to visit, connect, and belong.
            </p>
          </div>
        </FadeIn>

        <StaggerChildren className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ASSEMBLIES.map((a) => (
            <StaggerItem key={a.slug}>
              <Link
                href={`/assemblies/${a.slug}`}
                className="group relative flex items-center justify-between overflow-hidden rounded-[var(--radius-card)] border border-(--color-brand-blue-ink)/10 bg-(--color-brand-white) p-6 transition-all duration-500 hover:-translate-y-1 hover:border-(--color-brand-red)/30 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 bg-(--color-brand-red) transition-transform duration-500 group-hover:scale-y-100"
                />
                <div className="flex items-center gap-5">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-(--color-brand-blue-soft) text-(--color-brand-blue-ink) transition-colors duration-500 group-hover:bg-(--color-brand-red) group-hover:text-(--color-brand-white)">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-(--color-ink)">
                      {a.city}
                    </p>
                    <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-(--color-muted)">
                      {a.state} · {a.tagline}
                    </p>
                  </div>
                </div>
                <ArrowUpRight
                  size={18}
                  className="text-(--color-muted) transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-(--color-brand-red)"
                />
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}
