import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RegistrationForm } from "@/components/events/RegistrationForm";
import { sanityFetch } from "@/lib/sanity/client";
import {
  EVENT_BY_SLUG_QUERY,
  ASSEMBLIES_QUERY,
} from "@/lib/sanity/queries";

export const revalidate = 60;

type EventDoc = {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  startsAt: string;
  location?: string;
  capacity?: number;
  registrationEnabled?: boolean;
  registrationDeadline?: string;
  registrationMode?: "internal" | "external";
  externalRegistrationUrl?: string;
  payment?: {
    enabled?: boolean;
    amount?: number;
    currency?: string;
    allowPaystack?: boolean;
    allowTransfer?: boolean;
  };
  registrationFields?: Array<{
    label: string;
    name: string;
    kind:
      | "text"
      | "textarea"
      | "email"
      | "tel"
      | "number"
      | "date"
      | "select"
      | "checkbox";
    required?: boolean;
    options?: string[];
    placeholder?: string;
  }>;
  assembly?: { city: string };
  registeredCount?: number;
};

type Assembly = { _id: string; city: string; state?: string };

type BankDetails = {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  instructions?: string;
} | null;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const event = await sanityFetch<EventDoc | null>({
    query: EVENT_BY_SLUG_QUERY,
    params: { slug },
    tags: [`sanity:event:${slug}`],
  });
  return {
    title: event ? `Register · ${event.title}` : "Register",
  };
}

export default async function RegisterPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const [event, assemblies, bankDetails] = await Promise.all([
    sanityFetch<EventDoc | null>({
      query: EVENT_BY_SLUG_QUERY,
      params: { slug },
      tags: [`sanity:event:${slug}`],
      revalidate: 60,
    }),
    sanityFetch<Assembly[]>({
      query: ASSEMBLIES_QUERY,
      tags: ["sanity:assembly:list"],
      revalidate: 3600,
    }),
    sanityFetch<BankDetails>({
      query: `*[_id == "siteSettings"][0].bankTransferDetails`,
      tags: ["sanity:settings"],
      revalidate: 3600,
    }),
  ]);

  if (!event) notFound();

  // If registration is disabled, bounce to the event detail.
  if (!event.registrationEnabled) {
    redirect(`/events/${slug}`);
  }

  // If admin chose external mode, send them straight to the URL.
  if (event.registrationMode === "external" && event.externalRegistrationUrl) {
    redirect(event.externalRegistrationUrl);
  }

  // If deadline has passed, redirect to event detail with a message state.
  if (
    event.registrationDeadline &&
    new Date(event.registrationDeadline) < new Date()
  ) {
    redirect(`/events/${slug}`);
  }

  const start = new Date(event.startsAt);
  const dateLabel = start.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeLabel = start.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <section
      className="relative pt-32 pb-24 md:pt-40 md:pb-32"
      style={{ background: "var(--color-off-white)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-1/3 h-[420px] w-[420px] rounded-full blur-[160px]"
        style={{
          background: "color-mix(in srgb, var(--color-brand-gold) 15%, transparent)",
        }}
      />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Left — event summary */}
          <aside>
            <Link
              href={`/events/${slug}`}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--color-brand-red)" }}
            >
              <ArrowLeft size={14} />
              Back to event
            </Link>

            <p
              className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em]"
              style={{ color: "var(--color-brand-red)" }}
            >
              <span
                className="inline-block h-px w-10"
                style={{ background: "var(--color-brand-red)" }}
              />
              Registration
            </p>
            <h1
              className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] md:text-5xl"
              style={{ color: "var(--color-ink)" }}
            >
              {event.title}
            </h1>
            {event.tagline && (
              <p
                className="mt-6 text-base leading-7"
                style={{ color: "var(--color-ink-soft)" }}
              >
                {event.tagline}
              </p>
            )}

            <dl className="mt-10 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar
                  size={16}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: "var(--color-brand-gold)" }}
                />
                <div>
                  <dt
                    className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: "var(--color-muted)" }}
                  >
                    When
                  </dt>
                  <dd
                    className="font-[family-name:var(--font-display)] text-lg"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {dateLabel}
                    <span style={{ color: "var(--color-ink-soft)" }}>
                      {" · "}
                      {timeLabel}
                    </span>
                  </dd>
                </div>
              </div>
              {(event.location || event.assembly?.city) && (
                <div className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: "var(--color-brand-gold)" }}
                  />
                  <div>
                    <dt
                      className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                      style={{ color: "var(--color-muted)" }}
                    >
                      Where
                    </dt>
                    <dd
                      className="font-[family-name:var(--font-display)] text-lg"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {event.location ?? event.assembly?.city}
                    </dd>
                  </div>
                </div>
              )}
              {event.registrationDeadline && (
                <div
                  className="rounded-lg px-4 py-3 text-xs"
                  style={{
                    background: "var(--color-brand-red-soft)",
                    color: "var(--color-brand-red-deep)",
                  }}
                >
                  Registration closes{" "}
                  <strong>
                    {new Date(event.registrationDeadline).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </strong>
                </div>
              )}
            </dl>
          </aside>

          {/* Right — form */}
          <div>
            <RegistrationForm
              eventId={event._id}
              eventTitle={event.title}
              eventSlug={event.slug}
              customFields={event.registrationFields ?? []}
              assemblies={assemblies ?? []}
              capacity={event.capacity ?? null}
              registeredCount={event.registeredCount}
              payment={event.payment ?? null}
              bankDetails={bankDetails ?? null}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
