import type { Metadata } from "next";
import { Heart, Building2, CreditCard, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { sanityFetch } from "@/lib/sanity/client";
import { groq } from "next-sanity";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Give",
  description: "Partner with FMELi through online giving or bank transfer.",
};

type BankDetails = {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  instructions?: string;
} | null;

const BANK_QUERY = groq`*[_id == "siteSettings"][0].bankTransferDetails`;

export default async function GivePage() {
  const bank = await sanityFetch<BankDetails>({
    query: BANK_QUERY,
    tags: ["sanity:settings"],
    revalidate: 3600,
  });

  return (
    <>
      <PageHero
        eyebrow="Partner with us"
        title={
          <>
            Give to{" "}
            <span
              className="italic"
              style={{ color: "var(--color-brand-gold-soft)" }}
            >
              the work
            </span>
          </>
        }
        subtitle="Your giving fuels the spread of the unveiled Word across our assemblies, our outreach, and everything the ministry is called to do. Thank you for partnering with us."
      />

      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-off-white)" }}
      >
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Paystack card */}
            <div
              className="relative overflow-hidden rounded-[var(--radius-card)] border bg-white p-10 shadow-[var(--shadow-card)]"
              style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
            >
              <div
                className="inline-flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background: "var(--color-brand-red-soft)",
                  color: "var(--color-brand-red)",
                }}
              >
                <CreditCard size={20} />
              </div>
              <h2
                className="mt-8 font-[family-name:var(--font-display)] text-3xl font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Online
              </h2>
              <p
                className="mt-4 text-sm leading-6"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Give instantly with your card, bank account, or USSD via
                Paystack. Secure, instant confirmation.
              </p>
              <a
                href="https://paystack.com/pay/fmeli"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold transition"
                style={{
                  background: "var(--color-brand-red)",
                  color: "white",
                }}
              >
                Give online
                <ArrowRight size={16} />
              </a>
              <p
                className="mt-4 text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                (Placeholder link — replace with your real Paystack page URL.)
              </p>
            </div>

            {/* Bank transfer card */}
            <div
              className="relative overflow-hidden rounded-[var(--radius-card)] p-10 shadow-[var(--shadow-card)]"
              style={{
                background: "var(--color-brand-blue-ink)",
                color: "white",
              }}
            >
              <div
                className="inline-flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background: "rgb(255 255 255 / 0.1)",
                  color: "var(--color-brand-gold)",
                }}
              >
                <Building2 size={20} />
              </div>
              <h2 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-semibold">
                Bank transfer
              </h2>
              {bank ? (
                <dl className="mt-8 space-y-4">
                  {bank.bankName && (
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                        Bank
                      </dt>
                      <dd className="font-[family-name:var(--font-display)] text-base font-semibold">
                        {bank.bankName}
                      </dd>
                    </div>
                  )}
                  {bank.accountName && (
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                        Account name
                      </dt>
                      <dd className="text-right font-[family-name:var(--font-display)] text-base font-semibold">
                        {bank.accountName}
                      </dd>
                    </div>
                  )}
                  {bank.accountNumber && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                        Account number
                      </dt>
                      <dd className="font-[family-name:var(--font-display)] text-xl font-semibold tabular-nums">
                        {bank.accountNumber}
                      </dd>
                    </div>
                  )}
                  {bank.instructions && (
                    <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-white/70">
                      {bank.instructions}
                    </p>
                  )}
                </dl>
              ) : (
                <p className="mt-8 text-sm text-white/70">
                  Bank details will appear here once added in Studio → Site
                  Settings → Bank transfer details.
                </p>
              )}
            </div>
          </div>

          {/* Thank you */}
          <div className="mt-16 text-center">
            <Heart
              size={28}
              className="mx-auto"
              style={{ color: "var(--color-brand-red)" }}
            />
            <p
              className="mt-4 font-[family-name:var(--font-display)] text-2xl italic"
              style={{ color: "var(--color-ink)" }}
            >
              &ldquo;God loves a cheerful giver.&rdquo;
            </p>
            <p
              className="mt-2 text-xs uppercase tracking-[0.24em]"
              style={{ color: "var(--color-muted)" }}
            >
              2 Corinthians 9:7
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
