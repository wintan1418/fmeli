"use client";

import { useActionState, useEffect, useRef } from "react";
import { UserPlus } from "lucide-react";
import {
  FormBanner,
  FormField,
  Select,
  SubmitButton,
  TextInput,
} from "@/components/forms";
import type { AssemblyOption } from "@/types/sanity";
import { addMember, type MemberActionState } from "./actions";

const initial: MemberActionState = { status: "idle" };

type Props = {
  assemblies: AssemblyOption[];
  pinnedAssemblyId: string | null;
};

export function AddMemberForm({ assemblies, pinnedAssemblyId }: Props) {
  const [state, action] = useActionState(addMember, initial);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset on success so the next walk-up can be added without a reload.
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-[var(--radius-card)] border border-[color:rgb(11_20_27/0.08)] bg-white p-7"
    >
      <header className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--color-brand-red)_10%,white)] text-[color:var(--color-brand-red)]">
          <UserPlus size={16} />
        </span>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-ink)]">
            Add a member
          </h2>
          <p className="text-xs text-[color:var(--color-muted)]">
            Capture the basics. The office can fill in the rest in Studio.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
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
        <FormField label="Life stage" htmlFor="lifeStage">
          <Select id="lifeStage" name="lifeStage" defaultValue="visitor">
            <option value="visitor">Visitor</option>
            <option value="decision">First-time decision</option>
            <option value="new">New convert</option>
            <option value="established">Established member</option>
            <option value="worker">Worker / volunteer</option>
            <option value="leader">Leadership</option>
          </Select>
        </FormField>
        {pinnedAssemblyId ? (
          <input type="hidden" name="assemblyId" value={pinnedAssemblyId} />
        ) : (
          <FormField label="Assembly" htmlFor="assemblyId">
            <Select id="assemblyId" name="assemblyId" required defaultValue="">
              <option value="" disabled>
                Select assembly
              </option>
              {assemblies.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.city}
                  {a.state ? ` · ${a.state}` : ""}
                </option>
              ))}
            </Select>
          </FormField>
        )}
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

      {state.status === "error" && state.message && (
        <FormBanner tone="error" message={state.message} className="mt-5" />
      )}
      {state.status === "success" && state.message && (
        <FormBanner tone="success" message={state.message} className="mt-5" />
      )}

      <div className="mt-6">
        <SubmitButton>Add member</SubmitButton>
      </div>
    </form>
  );
}
