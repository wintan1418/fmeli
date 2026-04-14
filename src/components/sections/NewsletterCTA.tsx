import Image from "next/image";
import { ArrowRight, Mail, Radio, BookOpen } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/Motion";

export function NewsletterCTA() {
  return (
    <section className="relative bg-(--color-off-white) py-24 md:py-32">
      <Container>
        <FadeIn>
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-(--color-brand-blue-ink) via-(--color-brand-blue-deep) to-(--color-brand-red-deep) p-10 text-(--color-brand-white) shadow-[var(--shadow-card-hover)] md:p-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full bg-(--color-brand-gold)/20 blur-[120px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-16 h-[300px] w-[300px] rounded-full bg-(--color-brand-red)/30 blur-[120px]"
            />

            <div className="relative grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-center">
              <div>
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-(--color-brand-gold)">
                  <span className="inline-block h-px w-10 bg-(--color-brand-gold)" />
                  Stay in the light
                </p>
                <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] text-(--color-brand-white) md:text-5xl lg:text-[56px]">
                  Fresh messages,{" "}
                  <span className="italic text-(--color-brand-gold-soft)">
                    straight to you
                  </span>
                </h2>
                <p className="mt-6 max-w-lg text-lg leading-8 text-(--color-brand-white)/80">
                  Join thousands receiving new sermons, meeting reminders, and
                  the latest writings from the FMELi ministry.
                </p>

                <form
                  className="mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
                  action="#"
                >
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative flex-1">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-(--color-brand-white)/50"
                    />
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="h-14 w-full rounded-full border border-(--color-brand-white)/20 bg-(--color-brand-white)/10 pl-12 pr-5 text-sm text-(--color-brand-white) placeholder:text-(--color-brand-white)/50 backdrop-blur transition focus:border-(--color-brand-gold) focus:bg-(--color-brand-white)/15 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-(--color-brand-gold) px-7 text-sm font-semibold text-(--color-brand-blue-ink) transition-all duration-300 hover:bg-(--color-brand-gold-soft) hover:shadow-[var(--shadow-glow-gold)]"
                  >
                    Subscribe
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </form>

                <div className="mt-10 grid gap-6 border-t border-(--color-brand-white)/10 pt-8 sm:grid-cols-3">
                  {[
                    { icon: Radio, label: "Watch live", sub: "Sundays 8am" },
                    { icon: BookOpen, label: "Sermon notes", sub: "PDF downloads" },
                    { icon: Mail, label: "Weekly email", sub: "No spam, ever" },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-(--color-brand-white)/10 text-(--color-brand-gold)">
                        <Icon size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-(--color-brand-white)">
                          {label}
                        </p>
                        <p className="text-xs text-(--color-brand-white)/60">
                          {sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative hidden md:block">
                <div className="animate-floaty">
                  <Image
                    src="/images/logo.png"
                    alt="FMELi logo"
                    width={420}
                    height={420}
                    className="mx-auto h-auto w-full max-w-[360px] drop-shadow-[0_30px_80px_rgba(232,160,42,0.35)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
