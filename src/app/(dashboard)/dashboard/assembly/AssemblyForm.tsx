"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  FormBanner,
  FormField,
  FormSection,
  Select,
  SubmitButton,
  TextInput,
  Textarea,
  inputClass,
  labelClass,
} from "@/components/forms";
import type { AssemblyOption, ServiceTime } from "@/types/sanity";
import {
  saveAssemblyProfile,
  type AssemblyActionState,
} from "./actions";

const initial: AssemblyActionState = { status: "idle" };

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
  const [state, action] = useActionState(saveAssemblyProfile, initial);

  // Service times need add/remove on the client, so they live in local
  // state and emit a hidden input per row. Empty rows are stripped on
  // submit by the server action.
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>(
    defaults.serviceTimes && defaults.serviceTimes.length > 0
      ? defaults.serviceTimes
      : [{ label: "", day: "", time: "" }],
  );

  const updateRow = (i: number, patch: Partial<ServiceTime>) =>
    setServiceTimes((rows) =>
      rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );

  const addRow = () =>
    setServiceTimes((rows) => [...rows, { label: "", day: "", time: "" }]);

  const removeRow = (i: number) =>
    setServiceTimes((rows) =>
      rows.length === 1
        ? [{ label: "", day: "", time: "" }]
        : rows.filter((_, idx) => idx !== i),
    );

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="assemblyId" value={assemblyId} />

      {!pinnedAssemblyId && assemblies.length > 0 && (
        <FormSection title="Assembly">
          <div className="md:max-w-sm">
            <FormField label="Editing" htmlFor="assemblyPicker">
              <Select
                id="assemblyPicker"
                name="__pickerOnly"
                defaultValue={assemblyId}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("assembly", e.currentTarget.value);
                  window.location.href = url.toString();
                }}
              >
                {assemblies.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.city}
                    {a.state ? ` · ${a.state}` : ""}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </FormSection>
      )}

      <FormSection
        title="Visit us"
        subtitle="What people see on the assembly page sidebar."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField label="Tagline" htmlFor="tagline">
              <TextInput
                id="tagline"
                name="tagline"
                defaultValue={defaults.tagline ?? ""}
                placeholder="The city assembly"
              />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Address" htmlFor="address">
              <Textarea
                id="address"
                name="address"
                rows={2}
                defaultValue={defaults.address ?? ""}
                placeholder="Street, area, city"
              />
            </FormField>
          </div>
          <FormField label="Phone" htmlFor="phone">
            <TextInput
              id="phone"
              name="phone"
              type="tel"
              defaultValue={defaults.phone ?? ""}
              placeholder="+234…"
            />
          </FormField>
          <FormField label="Email" htmlFor="email">
            <TextInput
              id="email"
              name="email"
              type="email"
              defaultValue={defaults.email ?? ""}
              placeholder="lagos@fmeli.org"
            />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Google Maps URL" htmlFor="mapUrl">
              <TextInput
                id="mapUrl"
                name="mapUrl"
                type="url"
                defaultValue={defaults.mapUrl ?? ""}
                placeholder="https://maps.app.goo.gl/…"
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Service times"
        subtitle="Add a row per gathering. Empty rows are dropped on save."
      >
        <div className="space-y-4">
          {serviceTimes.map((row, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-lg border border-[color:rgb(11_20_27/0.08)] bg-[color:rgb(11_20_27/0.015)] p-4 md:grid-cols-[1.4fr_1fr_1fr_auto]"
            >
              <div>
                <label className={labelClass}>Label</label>
                <input
                  name={`serviceTimes.${i}.label`}
                  value={row.label ?? ""}
                  onChange={(e) => updateRow(i, { label: e.target.value })}
                  className={inputClass}
                  placeholder="Sunday Service"
                />
              </div>
              <div>
                <label className={labelClass}>Day</label>
                <input
                  name={`serviceTimes.${i}.day`}
                  value={row.day ?? ""}
                  onChange={(e) => updateRow(i, { day: e.target.value })}
                  className={inputClass}
                  placeholder="Every Sunday"
                />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <input
                  name={`serviceTimes.${i}.time`}
                  value={row.time ?? ""}
                  onChange={(e) => updateRow(i, { time: e.target.value })}
                  className={inputClass}
                  placeholder="8:00 AM"
                />
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  aria-label="Remove this service time"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:rgb(11_20_27/0.12)] text-[color:var(--color-brand-red)]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-full border border-[color:rgb(11_20_27/0.12)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink)]"
          >
            <Plus size={12} />
            Add a service time
          </button>
        </div>
      </FormSection>

      {state.status === "error" && state.message && (
        <FormBanner tone="error" message={state.message} />
      )}
      {state.status === "success" && state.message && (
        <FormBanner tone="success" message={state.message} />
      )}

      <div className="flex justify-end">
        <SubmitButton>Save changes</SubmitButton>
      </div>
    </form>
  );
}
