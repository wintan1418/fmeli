"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type AssemblyOption = {
  _id: string;
  city: string;
  state?: string;
};

type Props = {
  assemblies: AssemblyOption[];
};

type Status = "idle" | "submitting" | "success" | "error";

const inputBase =
  "w-full rounded-lg border border-[color:rgb(11_20_27/0.12)] bg-white px-5 py-3 text-sm text-[color:var(--color-ink)] transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand-red)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand-red-soft)]";

const labelBase =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]";

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
      <div
        className="rounded-[var(--radius-card)] border p-10 text-center"
        style={{
          background: "white",
          borderColor: "rgb(11 20 27 / 0.08)",
        }}
      >
        <div
          className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: "color-mix(in srgb, var(--color-brand-red) 12%, white)",
            color: "var(--color-brand-red)",
          }}
        >
          <CheckCircle2 size={28} />
        </div>
        <h2
          className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold"
          style={{ color: "var(--color-ink)" }}
        >
          Welcome home.
        </h2>
        <p className="mt-3 text-base" style={{ color: "var(--color-ink-soft)" }}>
          Your details are with the church office. A pastor from your assembly
          will reach out shortly to welcome you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            style={{
              background: "var(--color-brand-red)",
              color: "white",
            }}
          >
            Back to home
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/sermons"
            className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold"
            style={{
              borderColor: "rgb(11 20 27 / 0.12)",
              color: "var(--color-ink)",
            }}
          >
            Listen to a sermon
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-card)] border p-8 md:p-10"
      style={{
        background: "white",
        borderColor: "rgb(11 20 27 / 0.08)",
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelBase} htmlFor="firstName">
            First name *
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            className={inputBase}
            placeholder="Adaeze"
          />
        </div>
        <div>
          <label className={labelBase} htmlFor="lastName">
            Last name *
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            className={inputBase}
            placeholder="Okoro"
          />
        </div>

        <div>
          <label className={labelBase} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={inputBase}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className={labelBase} htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={inputBase}
            placeholder="+234…"
          />
        </div>

        <div>
          <label className={labelBase} htmlFor="gender">
            Gender
          </label>
          <select id="gender" name="gender" className={inputBase} defaultValue="">
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
        <div>
          <label className={labelBase} htmlFor="birthMonth">
            Birthday (day + month)
          </label>
          <input
            id="birthMonth"
            name="birthMonth"
            className={inputBase}
            placeholder="e.g. 14 March"
          />
        </div>

        <div>
          <label className={labelBase} htmlFor="maritalStatus">
            Marital status
          </label>
          <select
            id="maritalStatus"
            name="maritalStatus"
            className={inputBase}
            defaultValue=""
          >
            <option value="">—</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="engaged">Engaged</option>
            <option value="widowed">Widowed</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelBase} htmlFor="occupation">
            Occupation
          </label>
          <input
            id="occupation"
            name="occupation"
            className={inputBase}
            placeholder="Teacher, Engineer, Student…"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelBase} htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={2}
            className={inputBase}
            placeholder="Street, area, city"
          />
        </div>

        <div>
          <label className={labelBase} htmlFor="assemblyId">
            Home assembly *
          </label>
          <select
            id="assemblyId"
            name="assemblyId"
            required
            className={inputBase}
            defaultValue=""
          >
            <option value="" disabled>
              Select your assembly
            </option>
            {assemblies.map((a) => (
              <option key={a._id} value={a._id}>
                {a.city}
                {a.state ? ` · ${a.state}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelBase} htmlFor="lifeStage">
            Where are you on your journey?
          </label>
          <select
            id="lifeStage"
            name="lifeStage"
            className={inputBase}
            defaultValue="visitor"
          >
            <option value="visitor">Just visiting</option>
            <option value="decision">I just gave my life to Christ</option>
            <option value="new">New convert</option>
            <option value="established">Established member</option>
            <option value="worker">I serve / volunteer</option>
            <option value="leader">Leadership</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={labelBase} htmlFor="ministryInterests">
            Ministry interests (comma separated)
          </label>
          <input
            id="ministryInterests"
            name="ministryInterests"
            className={inputBase}
            placeholder="Worship, Ushering, Children, Media…"
          />
        </div>
      </div>

      {status === "error" && errorMessage && (
        <div
          className="mt-6 flex items-start gap-3 rounded-lg border p-4 text-sm"
          style={{
            background: "color-mix(in srgb, var(--color-brand-red) 6%, white)",
            borderColor: "color-mix(in srgb, var(--color-brand-red) 30%, white)",
            color: "var(--color-brand-red)",
          }}
        >
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
        style={{
          background: "var(--color-brand-red)",
          color: "white",
        }}
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
