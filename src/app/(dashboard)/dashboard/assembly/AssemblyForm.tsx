"use client";

import { useActionState, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  saveAssemblyProfile,
  type AssemblyActionState,
} from "./actions";

const initial: AssemblyActionState = { status: "idle" };

const inputBase =
  "w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2";
const inputStyle = {
  borderColor: "rgb(11 20 27 / 0.12)",
  color: "var(--color-ink)",
};
const labelBase =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em]";
const labelStyle = { color: "var(--color-ink-soft)" };

type ServiceTime = { label?: string; day?: string; time?: string };

type AssemblyOption = { _id: string; city: string; state?: string };

type Props = {
  assemblyId: string;
  pinnedAssemblyId: string | null;
  assemblies: AssemblyOption[];
  defaults: {
    tagline?: string;
    address?: string;
    phone?: string;
    email?: string;
    mapUrl?: string;
    serviceTimes?: ServiceTime[];
  };
};

export function AssemblyForm({
  assemblyId,
  pinnedAssemblyId,
  assemblies,
  defaults,
}: Props) {
  const [state, action, pending] = useActionState(
    saveAssemblyProfile,
    initial,
  );

  // Service times need to be add/remove-able on the client, so we hold
  // them in local state and emit a hidden input per row so the server
  // action sees them.
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>(
    defaults.serviceTimes && defaults.serviceTimes.length > 0
      ? defaults.serviceTimes
      : [{ label: "", day: "", time: "" }],
  );

  function updateRow(i: number, patch: Partial<ServiceTime>) {
    setServiceTimes((rows) =>
      rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  }

  function addRow() {
    setServiceTimes((rows) => [...rows, { label: "", day: "", time: "" }]);
  }

  function removeRow(i: number) {
    setServiceTimes((rows) =>
      rows.length === 1 ? [{ label: "", day: "", time: "" }] : rows.filter((_, idx) => idx !== i),
    );
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="assemblyId" value={assemblyId} />

      {/* Admin-only assembly picker */}
      {!pinnedAssemblyId && assemblies.length > 0 && (
        <Section title="Assembly">
          <div className="md:max-w-sm">
            <label className={labelBase} style={labelStyle} htmlFor="assemblyPicker">
              Editing
            </label>
            <select
              id="assemblyPicker"
              name="__pickerOnly"
              defaultValue={assemblyId}
              onChange={(e) => {
                // Server-side route resolves the assembly via ?assembly=...
                const url = new URL(window.location.href);
                url.searchParams.set("assembly", e.currentTarget.value);
                window.location.href = url.toString();
              }}
              className={inputBase}
              style={inputStyle}
            >
              {assemblies.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.city}
                  {a.state ? ` · ${a.state}` : ""}
                </option>
              ))}
            </select>
          </div>
        </Section>
      )}

      <Section title="Visit us" subtitle="What people see on the assembly page sidebar.">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Tagline" htmlFor="tagline">
              <input
                id="tagline"
                name="tagline"
                defaultValue={defaults.tagline ?? ""}
                className={inputBase}
                style={inputStyle}
                placeholder="The city assembly"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Address" htmlFor="address">
              <textarea
                id="address"
                name="address"
                rows={2}
                defaultValue={defaults.address ?? ""}
                className={inputBase}
                style={inputStyle}
                placeholder="Street, area, city"
              />
            </Field>
          </div>
          <Field label="Phone" htmlFor="phone">
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={defaults.phone ?? ""}
              className={inputBase}
              style={inputStyle}
              placeholder="+234…"
            />
          </Field>
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={defaults.email ?? ""}
              className={inputBase}
              style={inputStyle}
              placeholder="lagos@fmeli.org"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Google Maps URL" htmlFor="mapUrl">
              <input
                id="mapUrl"
                name="mapUrl"
                type="url"
                defaultValue={defaults.mapUrl ?? ""}
                className={inputBase}
                style={inputStyle}
                placeholder="https://maps.app.goo.gl/…"
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section
        title="Service times"
        subtitle="Add a row per gathering. Empty rows are dropped on save."
      >
        <div className="space-y-4">
          {serviceTimes.map((row, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1.4fr_1fr_1fr_auto]"
              style={{
                borderColor: "rgb(11 20 27 / 0.08)",
                background: "rgb(11 20 27 / 0.015)",
              }}
            >
              <div>
                <label className={labelBase} style={labelStyle}>
                  Label
                </label>
                <input
                  name={`serviceTimes.${i}.label`}
                  value={row.label ?? ""}
                  onChange={(e) => updateRow(i, { label: e.target.value })}
                  className={inputBase}
                  style={inputStyle}
                  placeholder="Sunday Service"
                />
              </div>
              <div>
                <label className={labelBase} style={labelStyle}>
                  Day
                </label>
                <input
                  name={`serviceTimes.${i}.day`}
                  value={row.day ?? ""}
                  onChange={(e) => updateRow(i, { day: e.target.value })}
                  className={inputBase}
                  style={inputStyle}
                  placeholder="Every Sunday"
                />
              </div>
              <div>
                <label className={labelBase} style={labelStyle}>
                  Time
                </label>
                <input
                  name={`serviceTimes.${i}.time`}
                  value={row.time ?? ""}
                  onChange={(e) => updateRow(i, { time: e.target.value })}
                  className={inputBase}
                  style={inputStyle}
                  placeholder="8:00 AM"
                />
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border"
                  style={{
                    borderColor: "rgb(11 20 27 / 0.12)",
                    color: "var(--color-brand-red)",
                  }}
                  aria-label="Remove this service time"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{
              borderColor: "rgb(11 20 27 / 0.12)",
              color: "var(--color-ink)",
            }}
          >
            <Plus size={12} />
            Add a service time
          </button>
        </div>
      </Section>

      {state.status === "error" && state.message && (
        <Banner
          tone="error"
          icon={<AlertCircle size={16} />}
          message={state.message}
        />
      )}
      {state.status === "success" && state.message && (
        <Banner
          tone="success"
          icon={<CheckCircle2 size={16} />}
          message={state.message}
        />
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60"
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
            "Save changes"
          )}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-[var(--radius-card)] border bg-white p-7"
      style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
    >
      <div className="mb-5">
        <h2
          className="font-[family-name:var(--font-display)] text-xl font-semibold"
          style={{ color: "var(--color-ink)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--color-muted)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
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

function Banner({
  tone,
  icon,
  message,
}: {
  tone: "error" | "success";
  icon: React.ReactNode;
  message: string;
}) {
  const isError = tone === "error";
  return (
    <div
      className="flex items-start gap-3 rounded-lg border p-4 text-sm"
      style={{
        background: isError
          ? "color-mix(in srgb, var(--color-brand-red) 6%, white)"
          : "color-mix(in srgb, var(--color-brand-gold) 12%, white)",
        borderColor: isError
          ? "color-mix(in srgb, var(--color-brand-red) 30%, white)"
          : "color-mix(in srgb, var(--color-brand-gold) 35%, white)",
        color: isError ? "var(--color-brand-red)" : "var(--color-ink)",
      }}
    >
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <p>{message}</p>
    </div>
  );
}
