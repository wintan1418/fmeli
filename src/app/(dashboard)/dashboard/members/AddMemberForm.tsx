"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  Loader2,
  UserPlus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { addMember, type MemberActionState } from "./actions";

const initial: MemberActionState = { status: "idle" };

const inputBase =
  "w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2";
const inputStyle = {
  borderColor: "rgb(11 20 27 / 0.12)",
  color: "var(--color-ink)",
};
const labelBase =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em]";
const labelStyle = { color: "var(--color-ink-soft)" };

type AssemblyOption = { _id: string; city: string; state?: string };

export function AddMemberForm({
  assemblies,
  pinnedAssemblyId,
}: {
  assemblies: AssemblyOption[];
  pinnedAssemblyId: string | null;
}) {
  const [state, action, pending] = useActionState(addMember, initial);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset the form on success so the next member can be added quickly.
  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-[var(--radius-card)] border bg-white p-7"
      style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background:
              "color-mix(in srgb, var(--color-brand-red) 10%, white)",
            color: "var(--color-brand-red)",
          }}
        >
          <UserPlus size={16} />
        </span>
        <div>
          <h2
            className="font-[family-name:var(--font-display)] text-lg font-semibold"
            style={{ color: "var(--color-ink)" }}
          >
            Add a member
          </h2>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            Capture the basics. The office can fill in the rest in Studio.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First name *" htmlFor="firstName">
          <input
            id="firstName"
            name="firstName"
            required
            className={inputBase}
            style={inputStyle}
            placeholder="Adaeze"
          />
        </Field>
        <Field label="Last name *" htmlFor="lastName">
          <input
            id="lastName"
            name="lastName"
            required
            className={inputBase}
            style={inputStyle}
            placeholder="Okoro"
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            className={inputBase}
            style={inputStyle}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            className={inputBase}
            style={inputStyle}
            placeholder="+234…"
          />
        </Field>
        <Field label="Life stage" htmlFor="lifeStage">
          <select
            id="lifeStage"
            name="lifeStage"
            defaultValue="visitor"
            className={inputBase}
            style={inputStyle}
          >
            <option value="visitor">Visitor</option>
            <option value="decision">First-time decision</option>
            <option value="new">New convert</option>
            <option value="established">Established member</option>
            <option value="worker">Worker / volunteer</option>
            <option value="leader">Leadership</option>
          </select>
        </Field>
        {pinnedAssemblyId ? (
          <input type="hidden" name="assemblyId" value={pinnedAssemblyId} />
        ) : (
          <Field label="Assembly" htmlFor="assemblyId">
            <select
              id="assemblyId"
              name="assemblyId"
              required
              className={inputBase}
              style={inputStyle}
              defaultValue=""
            >
              <option value="" disabled>
                Select assembly
              </option>
              {assemblies.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.city}
                  {a.state ? ` · ${a.state}` : ""}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="md:col-span-2">
          <Field
            label="Ministry interests (comma separated)"
            htmlFor="ministryInterests"
          >
            <input
              id="ministryInterests"
              name="ministryInterests"
              className={inputBase}
              style={inputStyle}
              placeholder="Worship, Ushering, Children, Media…"
            />
          </Field>
        </div>
      </div>

      {state.status === "error" && state.message && (
        <div
          className="mt-5 flex items-start gap-3 rounded-lg border p-3 text-xs"
          style={{
            background: "color-mix(in srgb, var(--color-brand-red) 6%, white)",
            borderColor:
              "color-mix(in srgb, var(--color-brand-red) 30%, white)",
            color: "var(--color-brand-red)",
          }}
        >
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <p>{state.message}</p>
        </div>
      )}
      {state.status === "success" && state.message && (
        <div
          className="mt-5 flex items-start gap-3 rounded-lg border p-3 text-xs"
          style={{
            background:
              "color-mix(in srgb, var(--color-brand-gold) 12%, white)",
            borderColor:
              "color-mix(in srgb, var(--color-brand-gold) 35%, white)",
            color: "var(--color-ink)",
          }}
        >
          <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "var(--color-brand-red)",
          color: "white",
        }}
      >
        {pending ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Saving…
          </>
        ) : (
          "Add member"
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelBase} style={labelStyle} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
