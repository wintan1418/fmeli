"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type FieldKind =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "select"
  | "checkbox";

type CustomField = {
  label: string;
  name: string;
  kind: FieldKind;
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

type AssemblyOption = {
  _id: string;
  city: string;
  state?: string;
};

type Props = {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  customFields: CustomField[];
  assemblies: AssemblyOption[];
  capacity?: number | null;
  registeredCount?: number;
};

type Status = "idle" | "submitting" | "success" | "error";

const inputBase =
  "w-full rounded-lg border border-[color:rgb(11_20_27/0.12)] bg-white px-5 py-3 text-sm text-[color:var(--color-ink)] transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand-red)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand-red-soft)]";

const labelBase =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]";

export function RegistrationForm({
  eventId,
  eventTitle,
  eventSlug,
  customFields,
  assemblies,
  capacity,
  registeredCount = 0,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const spotsLeft =
    typeof capacity === "number" ? Math.max(0, capacity - registeredCount) : null;
  const full = spotsLeft !== null && spotsLeft === 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (full) return;
    setStatus("submitting");
    setErrorMessage(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim() || undefined;
    const phone = String(data.get("phone") ?? "").trim() || undefined;
    const assemblyId = String(data.get("assemblyId") ?? "").trim() || undefined;
    const honey = String(data.get("company_website") ?? "").trim();

    if (honey) {
      // Honeypot filled — pretend success.
      setStatus("success");
      return;
    }

    const extra: Record<string, string> = {};
    for (const field of customFields) {
      if (field.kind === "checkbox") {
        extra[field.name] = data.get(field.name) ? "yes" : "no";
      } else {
        const value = String(data.get(field.name) ?? "").trim();
        if (value) extra[field.name] = value;
      }
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          name,
          email,
          phone,
          assemblyId,
          extra,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(body?.message ?? `Submission failed (${res.status})`);
        return;
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-brand-gold)]/30 bg-white p-10 text-center shadow-[var(--shadow-card)]">
        <CheckCircle2
          size={52}
          className="mx-auto text-[color:var(--color-brand-gold)]"
        />
        <h3
          className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold"
          style={{ color: "var(--color-ink)" }}
        >
          You&rsquo;re in.
        </h3>
        <p
          className="mt-4 text-base leading-7"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Your registration for <strong>{eventTitle}</strong> was received.
          We&rsquo;ll send confirmation details if you gave us an email.
        </p>
        <Link
          href={`/events/${eventSlug}`}
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--color-brand-blue-ink)] px-7 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-blue-deep)]"
        >
          Back to event
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[var(--radius-card)] border border-[color:rgb(11_20_27/0.08)] bg-white p-8 shadow-[var(--shadow-card)] md:p-10"
    >
      {spotsLeft !== null && (
        <p
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-red-soft)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--color-brand-red-deep)" }}
        >
          {full ? "Fully booked" : `${spotsLeft} spots remaining`}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="reg-name" className={labelBase}>
            Your name *
          </label>
          <input
            id="reg-name"
            name="name"
            type="text"
            required
            placeholder="First and last name"
            className={inputBase}
            disabled={full || status === "submitting"}
          />
        </div>

        <div>
          <label htmlFor="reg-email" className={labelBase}>
            Email
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className={inputBase}
            disabled={full || status === "submitting"}
          />
        </div>

        <div>
          <label htmlFor="reg-phone" className={labelBase}>
            Phone
          </label>
          <input
            id="reg-phone"
            name="phone"
            type="tel"
            placeholder="+234 …"
            className={inputBase}
            disabled={full || status === "submitting"}
          />
        </div>

        {assemblies.length > 0 && (
          <div className="md:col-span-2">
            <label htmlFor="reg-assembly" className={labelBase}>
              Your home assembly
            </label>
            <select
              id="reg-assembly"
              name="assemblyId"
              className={inputBase}
              disabled={full || status === "submitting"}
              defaultValue=""
            >
              <option value="">— none / visiting —</option>
              {assemblies.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.city}
                  {a.state ? `, ${a.state}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {customFields.map((field) => (
          <div
            key={field.name}
            className={field.kind === "textarea" ? "md:col-span-2" : undefined}
          >
            <label htmlFor={`reg-${field.name}`} className={labelBase}>
              {field.label}
              {field.required && " *"}
            </label>
            {field.kind === "textarea" ? (
              <textarea
                id={`reg-${field.name}`}
                name={field.name}
                required={field.required}
                rows={4}
                placeholder={field.placeholder}
                className={inputBase}
                disabled={full || status === "submitting"}
              />
            ) : field.kind === "select" ? (
              <select
                id={`reg-${field.name}`}
                name={field.name}
                required={field.required}
                defaultValue=""
                className={inputBase}
                disabled={full || status === "submitting"}
              >
                <option value="">— choose —</option>
                {(field.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.kind === "checkbox" ? (
              <label className="inline-flex items-center gap-3">
                <input
                  id={`reg-${field.name}`}
                  name={field.name}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[color:rgb(11_20_27/0.2)] text-[color:var(--color-brand-red)]"
                  disabled={full || status === "submitting"}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  {field.placeholder || field.label}
                </span>
              </label>
            ) : (
              <input
                id={`reg-${field.name}`}
                name={field.name}
                type={field.kind}
                required={field.required}
                placeholder={field.placeholder}
                className={inputBase}
                disabled={full || status === "submitting"}
              />
            )}
          </div>
        ))}

        {/* Honeypot */}
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
        />
      </div>

      {status === "error" && (
        <div
          className="mt-6 flex items-start gap-3 rounded-lg border border-[color:var(--color-brand-red)]/30 bg-[color:var(--color-brand-red-soft)] px-5 py-4"
          style={{ color: "var(--color-brand-red-deep)" }}
        >
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            {errorMessage ?? "We couldn't submit your registration. Please try again."}
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          By registering you agree to receive event details by email or SMS.
        </p>
        <button
          type="submit"
          disabled={full || status === "submitting"}
          className="group inline-flex h-14 items-center gap-3 rounded-full bg-[color:var(--color-brand-red)] px-8 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-[color:var(--color-brand-red-deep)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting…
            </>
          ) : full ? (
            <>Fully booked</>
          ) : (
            <>
              Confirm registration
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
