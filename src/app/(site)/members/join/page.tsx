import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { MemberSignupForm } from "@/components/members/MemberSignupForm";
import { sanityFetch } from "@/lib/sanity/client";
import { ASSEMBLIES_QUERY } from "@/lib/sanity/queries";
import type { AssemblyOption } from "@/types/sanity";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Join FMELi",
  description:
    "Become a member of First Mountain Evangelical Lighthouse. Tell us a little about yourself and we’ll connect you to your home assembly.",
};

export default async function JoinPage() {
  const assemblies = await sanityFetch<AssemblyOption[]>({
    query: ASSEMBLIES_QUERY,
    tags: ["sanity:assembly:list"],
    revalidate: 3600,
  });

  return (
    <>
      <section className="relative bg-brand-blue-ink pt-32 pb-16 md:pt-44">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_20%_20%,color-mix(in_srgb,var(--color-brand-gold)_18%,transparent)_0%,transparent_70%)]"
        />
        <Container className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-gold">
            Join the family
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] text-white md:text-6xl">
            Welcome home to FMELi.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
            Whether this is your first Sunday or you’ve been with us for years,
            tell us a little about yourself. Your assembly’s pastoral team will
            reach out to welcome you and walk with you.
          </p>
        </Container>
      </section>

      <section className="bg-off-white py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl">
            <MemberSignupForm assemblies={assemblies ?? []} />
            <p className="mt-6 text-center text-xs text-muted">
              Your details are private and only visible to your assembly’s
              pastoral team and the church office.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
