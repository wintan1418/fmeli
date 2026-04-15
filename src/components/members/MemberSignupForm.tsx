"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  FormField,
  Select,
  TextInput,
  Textarea,
} from "@/components/forms";
import type { AssemblyOption } from "@/types/sanity";

type Props = {
  assemblies: AssemblyOption[];
};

type Status = "idle" | "submitting" | "success" | "error";

export function MemberSignupForm({ assemblies }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      firstName: form.get("firstName")?.toString() ?? "",
      lastName: form.get("lastName")?.toString() ?? "",
      email: form.get("email")?.toString() ?? "",
      phone: form.get("phone")?.toString() ?? "",
      gender: form.get("gender")?.toString() ?? undefined,
      birthMonth: form.get("birthMonth")?.toString() ?? "",
      maritalStatus: form.get("maritalStatus")?.toString() ?? undefined,
      occupation: form.get("occupation")?.toString() ?? "",
      address: form.get("address")?.toString() ?? "",
      assemblyId: form.get("assemblyId")?.toString() ?? "",
      lifeStage: form.get("lifeStage")?.toString() ?? "visitor",
      ministryInterests: form.get("ministryInterests")?.toString() ?? "",
    };

    try {
      const res = await fetch("/api/members/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data?.message ?? "Something went wrong. Please try again.",
        );
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-[color:rgb(11_20_27/0.08)] bg-white p-10 text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--color-brand-red)_12%,white)] text-[color:var(--color-brand-red)]">
          <CheckCircle2 size={28} />
        </div>
        <h2 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold text-[color:var(--color-ink)]">
          Welcome home.
        </h2>
        <p className="mt-3 text-base text-[color:var(--color-ink-soft)]">
          Your details are with the church office. A pastor from your assembly
          will reach out shortly to welcome you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-red)] px-6 py-3 text-sm font-semibold text-white"
          >
            Back to home
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/resources/messages"
            className="inline-flex items-center gap-2 rounded-full border border-[color:rgb(11_20_27/0.12)] px-6 py-3 text-sm font-semibold text-[color:var(--color-ink)]"
          >
            Listen to a message
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-card)] border border-[color:rgb(11_20_27/0.08)] bg-white p-8 md:p-10"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="First name *" htmlFor="firstName">
          <TextInput id="firstName" name="firstName" required placeholder="Adaeze" />
        </FormField>
        <FormField label="Last name *" htmlFor="lastName">
          <TextInput id="lastName" name="lastName" required placeholder="Okoro" />
        </FormField>

        <FormField label="Email" htmlFor="email">
          <TextInput id="email" name="email" type="email" placeholder="you@example.com" />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <TextInput id="phone" name="phone" type="tel" placeholder="+234…" />
        </FormField>

        <FormField label="Gender" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue="">
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </Select>
        </FormField>
        <FormField label="Birthday (day + month)" htmlFor="birthMonth">
          <TextInput id="birthMonth" name="birthMonth" placeholder="e.g. 14 March" />
        </FormField>

        <FormField label="Marital status" htmlFor="maritalStatus">
          <Select id="maritalStatus" name="maritalStatus" defaultValue="">
            <option value="">—</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="engaged">Engaged</option>
            <option value="widowed">Widowed</option>
            <option value="other">Other</option>
          </Select>
        </FormField>
        <FormField label="Occupation" htmlFor="occupation">
          <TextInput
            id="occupation"
            name="occupation"
            placeholder="Teacher, Engineer, Student…"
          />
        </FormField>

        <div className="md:col-span-2">
          <FormField label="Address" htmlFor="address">
            <Textarea
              id="address"
              name="address"
              rows={2}
              placeholder="Street, area, city"
            />
          </FormField>
        </div>

        <FormField label="Home assembly *" htmlFor="assemblyId">
          <Select id="assemblyId" name="assemblyId" required defaultValue="">
            <option value="" disabled>
              Select your assembly
            </option>
            {assemblies.map((a) => (
              <option key={a._id} value={a._id}>
                {a.city}
                {a.state ? ` · ${a.state}` : ""}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Where are you on your journey?"
          htmlFor="lifeStage"
        >
          <Select id="lifeStage" name="lifeStage" defaultValue="visitor">
            <option value="visitor">Just visiting</option>
            <option value="decision">I just gave my life to Christ</option>
            <option value="new">New convert</option>
            <option value="established">Established member</option>
            <option value="worker">I serve / volunteer</option>
            <option value="leader">Leadership</option>
          </Select>
        </FormField>

        <div className="md:col-span-2">
          <FormField
            label="Ministry interests (comma separated)"
            htmlFor="ministryInterests"
          >
            <TextInput
              id="ministryInterests"
              name="ministryInterests"
              placeholder="Worship, Ushering, Children, Media…"
            />
          </FormField>
        </div>
      </div>

      {status === "error" && errorMessage && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-[color:color-mix(in_srgb,var(--color-brand-red)_30%,white)] bg-[color:color-mix(in_srgb,var(--color-brand-red)_6%,white)] p-4 text-sm text-[color:var(--color-brand-red)]">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-brand-red)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Join the family
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
