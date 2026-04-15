import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { MemberSignupForm } from "@/components/members/MemberSignupForm";
import { sanityFetch } from "@/lib/sanity/client";
import { ASSEMBLIES_QUERY } from "@/lib/sanity/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Join FMELi",
  description:
    "Become a member of First Mountain Evangelical Lighthouse. Tell us a little about yourself and we’ll connect you to your home assembly.",
};

type Assembly = { _id: string; city: string; state?: string };

export default async function JoinPage() {
  const assemblies = await sanityFetch<Assembly[]>({
    query: ASSEMBLIES_QUERY,
    tags: ["sanity:assembly:list"],
    revalidate: 3600,
  });

  return (
    <>
      <section
        className="relative pt-32 pb-16 md:pt-44"
        style={{ background: "var(--color-brand-blue-ink)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 20%, color-mix(in srgb, var(--color-brand-gold) 18%, transparent) 0%, transparent 70%)",
          }}
        />
        <Container className="relative">
          <p
            className="text-xs font-semibold uppercase tracking-[0.32em]"
            style={{ color: "var(--color-brand-gold)" }}
          >
            Join the family
          </p>
          <h1
            className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] md:text-6xl"
            style={{ color: "white" }}
          >
            Welcome home to FMELi.
          </h1>
          <p
            className="mt-6 max-w-2xl text-lg leading-relaxed"
            style={{ color: "rgb(255 255 255 / 0.75)" }}
          >
            Whether this is your first Sunday or you’ve been with us for years,
            tell us a little about yourself. Your assembly’s pastoral team will
            reach out to welcome you and walk with you.
          </p>
        </Container>
      </section>

      <section
        className="py-20 md:py-28"
        style={{ background: "var(--color-off-white)" }}
      >
        <Container>
          <div className="mx-auto max-w-3xl">
            <MemberSignupForm assemblies={assemblies ?? []} />
            <p
              className="mt-6 text-center text-xs"
              style={{ color: "var(--color-muted)" }}
            >
              Your details are private and only visible to your assembly’s
              pastoral team and the church office.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
