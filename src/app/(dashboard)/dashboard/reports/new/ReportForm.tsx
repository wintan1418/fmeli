"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  FormBanner,
  FormField,
  FormSection,
  NumberInput,
  Select,
  SubmitButton,
  TextInput,
  Textarea,
} from "@/components/forms";
import type { AssemblyOption } from "@/types/sanity";
import { submitWeeklyReport, type ReportActionState } from "./actions";

const initial: ReportActionState = { status: "idle" };
const todayIso = () => new Date().toISOString().slice(0, 10);

type Props = {
  assemblies: AssemblyOption[];
  /** When set, the form pins the assembly picker to this id (used by
   * assembly leads). Admins get a real picker via null. */
  pinnedAssemblyId: string | null;
};

export function ReportForm({ assemblies, pinnedAssemblyId }: Props) {
  const [state, action] = useActionState(submitWeeklyReport, initial);

  return (
    <form action={action} className="space-y-10">
      <FormSection title="Reporting period">
        <div className="grid gap-5 md:grid-cols-3">
          <FormField label="Week of (or report date)" htmlFor="weekOf">
            <TextInput
              id="weekOf"
              name="weekOf"
              type="date"
              defaultValue={todayIso()}
              required
            />
          </FormField>
          <FormField label="Period" htmlFor="period">
            <Select id="period" name="period" defaultValue="weekly">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="special">Special meeting</option>
            </Select>
          </FormField>
          <FormField label="Assembly" htmlFor="assemblyId">
            {pinnedAssemblyId ? (
              <>
                <input
                  type="hidden"
                  name="assemblyId"
                  value={pinnedAssemblyId}
                />
                <TextInput
                  className="opacity-70"
                  value={
                    assemblies.find((a) => a._id === pinnedAssemblyId)?.city ??
                    "Your assembly"
                  }
                  readOnly
                />
              </>
            ) : (
              <Select
                id="assemblyId"
                name="assemblyId"
                required
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
              </Select>
            )}
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Attendance"
        subtitle="Best estimates are fine — leave blank what you didn't track."
      >
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
          <FormField label="Total" htmlFor="att_total">
            <NumberInput id="att_total" name="att_total" />
          </FormField>
          <FormField label="Men" htmlFor="att_men">
            <NumberInput id="att_men" name="att_men" />
          </FormField>
          <FormField label="Women" htmlFor="att_women">
            <NumberInput id="att_women" name="att_women" />
          </FormField>
          <FormField label="Youth" htmlFor="att_youth">
            <NumberInput id="att_youth" name="att_youth" />
          </FormField>
          <FormField label="Children" htmlFor="att_children">
            <NumberInput id="att_children" name="att_children" />
          </FormField>
          <FormField label="First-time visitors" htmlFor="att_firstTimers">
            <NumberInput id="att_firstTimers" name="att_firstTimers" />
          </FormField>
          <FormField label="Salvation decisions" htmlFor="att_decisions">
            <NumberInput id="att_decisions" name="att_decisions" />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Finances (NGN)">
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          <FormField label="Tithe" htmlFor="fin_tithe">
            <NumberInput id="fin_tithe" name="fin_tithe" />
          </FormField>
          <FormField label="Offering" htmlFor="fin_offering">
            <NumberInput id="fin_offering" name="fin_offering" />
          </FormField>
          <FormField label="Projects" htmlFor="fin_projects">
            <NumberInput id="fin_projects" name="fin_projects" />
          </FormField>
          <FormField label="Missions" htmlFor="fin_missions">
            <NumberInput id="fin_missions" name="fin_missions" />
          </FormField>
          <FormField label="Other" htmlFor="fin_other">
            <NumberInput id="fin_other" name="fin_other" />
          </FormField>
        </div>
        <div className="mt-5">
          <FormField label="Notes for the office" htmlFor="fin_notes">
            <Textarea
              id="fin_notes"
              name="fin_notes"
              rows={2}
              placeholder="Anything the office should know about this week's giving."
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Narrative"
        subtitle="One thought per paragraph. The dashboard converts paragraphs into list items in Studio."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Highlights of the week" htmlFor="highlights">
            <Textarea
              id="highlights"
              name="highlights"
              rows={5}
              placeholder="What stood out? Salvations, baptisms, breakthroughs…"
            />
          </FormField>
          <FormField label="Prayer points" htmlFor="prayerPoints">
            <Textarea
              id="prayerPoints"
              name="prayerPoints"
              rows={5}
              placeholder="What does the assembly need agreement on this week?"
            />
          </FormField>
          <FormField label="Testimonies" htmlFor="testimonies">
            <Textarea
              id="testimonies"
              name="testimonies"
              rows={5}
              placeholder="Stories of God's faithfulness — name first names only."
            />
          </FormField>
          <FormField label="Challenges / needs" htmlFor="challenges">
            <Textarea
              id="challenges"
              name="challenges"
              rows={5}
              placeholder="What's hard right now? Where do you need help?"
            />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Focus for next week" htmlFor="nextWeekFocus">
              <Textarea
                id="nextWeekFocus"
                name="nextWeekFocus"
                rows={3}
                placeholder="What is the assembly aiming at next week?"
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      {state.status === "error" && state.message && (
        <FormBanner tone="error" message={state.message} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-soft)]"
        >
          <ArrowLeft size={12} />
          Back to reports
        </Link>
        <SubmitButton pendingLabel="Submitting…">Submit report</SubmitButton>
      </div>
    </form>
  );
}
