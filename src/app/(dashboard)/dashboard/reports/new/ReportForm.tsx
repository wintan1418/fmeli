"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import {
  submitWeeklyReport,
  type ReportActionState,
} from "./actions";

const initial: ReportActionState = { status: "idle" };

const inputBase =
  "w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2";
const inputStyle = {
  borderColor: "rgb(11 20 27 / 0.12)",
  color: "var(--color-ink)",
};
const labelBase =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em]";
const labelStyle = { color: "var(--color-ink-soft)" };

const todayIso = () => new Date().toISOString().slice(0, 10);

type AssemblyOption = { _id: string; city: string; state?: string };

type Props = {
  assemblies: AssemblyOption[];
  /** When the session is an assembly_lead, this is the only assembly they
   * can post under. The form locks the picker. */
  pinnedAssemblyId: string | null;
};

export function ReportForm({ assemblies, pinnedAssemblyId }: Props) {
  const [state, action, pending] = useActionState(
    submitWeeklyReport,
    initial,
  );

  return (
    <form action={action} className="space-y-10">
      {/* Section: meta */}
      <Section title="Reporting period">
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Week of (or report date)" htmlFor="weekOf">
            <input
              id="weekOf"
              name="weekOf"
              type="date"
              defaultValue={todayIso()}
              required
              className={inputBase}
              style={inputStyle}
            />
          </Field>
          <Field label="Period" htmlFor="period">
            <select
              id="period"
              name="period"
              defaultValue="weekly"
              className={inputBase}
              style={inputStyle}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="special">Special meeting</option>
            </select>
          </Field>
          <Field label="Assembly" htmlFor="assemblyId">
            {pinnedAssemblyId ? (
              <>
                <input
                  type="hidden"
                  name="assemblyId"
                  value={pinnedAssemblyId}
                />
                <input
                  className={inputBase}
                  style={{ ...inputStyle, opacity: 0.7 }}
                  value={
                    assemblies.find((a) => a._id === pinnedAssemblyId)?.city ??
                    "Your assembly"
                  }
                  readOnly
                />
              </>
            ) : (
              <select
                id="assemblyId"
                name="assemblyId"
                required
                className={inputBase}
                style={inputStyle}
                defaultValue=""
              >
                <option value="" disabled>
                  Select an assembly
                </option>
                {assemblies.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.city}
                    {a.state ? ` · ${a.state}` : ""}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </Section>

      {/* Section: attendance */}
      <Section
        title="Attendance"
        subtitle="Best estimates are fine — leave blank what you didn't track."
      >
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
          <NumField name="att_total" label="Total" />
          <NumField name="att_men" label="Men" />
          <NumField name="att_women" label="Women" />
          <NumField name="att_youth" label="Youth" />
          <NumField name="att_children" label="Children" />
          <NumField name="att_firstTimers" label="First-time visitors" />
          <NumField name="att_decisions" label="Salvation decisions" />
        </div>
      </Section>

      {/* Section: finances */}
      <Section title="Finances (NGN)">
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          <NumField name="fin_tithe" label="Tithe" />
          <NumField name="fin_offering" label="Offering" />
          <NumField name="fin_projects" label="Projects" />
          <NumField name="fin_missions" label="Missions" />
          <NumField name="fin_other" label="Other" />
        </div>
        <div className="mt-5">
          <Field label="Notes for the office" htmlFor="fin_notes">
            <textarea
              id="fin_notes"
              name="fin_notes"
              rows={2}
              className={inputBase}
              style={inputStyle}
              placeholder="Anything the office should know about this week's giving."
            />
          </Field>
        </div>
      </Section>

      {/* Section: narrative */}
      <Section
        title="Narrative"
        subtitle="One thought per paragraph. The dashboard converts paragraphs into list items in Studio."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Highlights of the week" htmlFor="highlights">
            <textarea
              id="highlights"
              name="highlights"
              rows={5}
              className={inputBase}
              style={inputStyle}
              placeholder="What stood out? Salvations, baptisms, breakthroughs…"
            />
          </Field>
          <Field label="Prayer points" htmlFor="prayerPoints">
            <textarea
              id="prayerPoints"
              name="prayerPoints"
              rows={5}
              className={inputBase}
              style={inputStyle}
              placeholder="What does the assembly need agreement on this week?"
            />
          </Field>
          <Field label="Testimonies" htmlFor="testimonies">
            <textarea
              id="testimonies"
              name="testimonies"
              rows={5}
              className={inputBase}
              style={inputStyle}
              placeholder="Stories of God's faithfulness — name first names only."
            />
          </Field>
          <Field label="Challenges / needs" htmlFor="challenges">
            <textarea
              id="challenges"
              name="challenges"
              rows={5}
              className={inputBase}
              style={inputStyle}
              placeholder="What's hard right now? Where do you need help?"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Focus for next week" htmlFor="nextWeekFocus">
              <textarea
                id="nextWeekFocus"
                name="nextWeekFocus"
                rows={3}
                className={inputBase}
                style={inputStyle}
                placeholder="What is the assembly aiming at next week?"
              />
            </Field>
          </div>
        </div>
      </Section>

      {state.status === "error" && state.message && (
        <div
          className="flex items-start gap-3 rounded-lg border p-4 text-sm"
          style={{
            background: "color-mix(in srgb, var(--color-brand-red) 6%, white)",
            borderColor:
              "color-mix(in srgb, var(--color-brand-red) 30%, white)",
            color: "var(--color-brand-red)",
          }}
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--color-ink-soft)" }}
        >
          <ArrowLeft size={12} />
          Back to reports
        </Link>
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
              Submitting…
            </>
          ) : (
            "Submit report"
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

function NumField({ name, label }: { name: string; label: string }) {
  return (
    <Field label={label} htmlFor={name}>
      <input
        id={name}
        name={name}
        type="number"
        min={0}
        className={inputBase}
        style={inputStyle}
        placeholder="0"
      />
    </Field>
  );
}
