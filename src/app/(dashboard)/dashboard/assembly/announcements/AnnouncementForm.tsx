"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FormBanner,
  FormField,
  FormSection,
  Select,
  SubmitButton,
  TextInput,
  Textarea,
} from "@/components/forms";
import {
  createAnnouncement,
  updateAnnouncement,
  type AnnouncementActionState,
} from "./actions";

const initial: AnnouncementActionState = { status: "idle" };

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  assemblyId: string;
  defaults?: {
    id?: string;
    title?: string;
    kind?: string;
    body?: string;
    startsAt?: string;
    endsAt?: string;
    streamUrl?: string;
    ctaLabel?: string;
    isPinned?: boolean;
    isArchived?: boolean;
  };
};

export function AnnouncementForm({ mode, assemblyId, defaults = {} }: Props) {
  const router = useRouter();
  const action = mode === "create" ? createAnnouncement : updateAnnouncement;
  const [state, submit] = useActionState(action, initial);

  // After a successful create, bounce into the edit page so the pastor
  // can keep tweaking the same doc rather than re-creating it.
  useEffect(() => {
    if (mode === "create" && state.status === "success" && state.id) {
      router.replace(`/dashboard/assembly/announcements/${state.id}`);
    }
  }, [state, mode, router]);

  return (
    <form action={submit} className="space-y-8">
      <input type="hidden" name="assemblyId" value={assemblyId} />
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <FormSection
        title="Announcement"
        subtitle="What you want people visiting your campus page to see."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField label="Title" htmlFor="title">
              <TextInput
                id="title"
                name="title"
                required
                defaultValue={defaults.title ?? ""}
                placeholder="Singles Rendezvous — Saturday 27 April"
              />
            </FormField>
          </div>
          <FormField label="Kind" htmlFor="kind">
            <Select
              id="kind"
              name="kind"
              defaultValue={defaults.kind ?? "special"}
            >
              <option value="special">Special meeting</option>
              <option value="event">Event</option>
              <option value="stream">Live stream</option>
              <option value="general">General notice</option>
            </Select>
          </FormField>
          <FormField
            label="CTA label"
            htmlFor="ctaLabel"
            hint="Button text. Leave blank to default to 'Register' or 'Watch live'."
          >
            <TextInput
              id="ctaLabel"
              name="ctaLabel"
              defaultValue={defaults.ctaLabel ?? ""}
              placeholder="Register"
            />
          </FormField>
          <div className="md:col-span-2">
            <FormField
              label="Body"
              htmlFor="body"
              hint="Plain text. Blank lines become new paragraphs."
            >
              <Textarea
                id="body"
                name="body"
                rows={5}
                defaultValue={defaults.body ?? ""}
                placeholder="Join us as we gather to encourage, equip, and empower…"
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Timing"
        subtitle="Leave empty to show immediately / indefinitely."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Starts at" htmlFor="startsAt">
            <TextInput
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={defaults.startsAt ?? ""}
            />
          </FormField>
          <FormField label="Ends at" htmlFor="endsAt">
            <TextInput
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              defaultValue={defaults.endsAt ?? ""}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Link / stream"
        subtitle="Where the CTA button goes. Paste a YouTube / Vimeo / Mixlr / registration link. YouTube and Vimeo links embed directly on the campus page."
      >
        <FormField label="URL" htmlFor="streamUrl">
          <TextInput
            id="streamUrl"
            name="streamUrl"
            type="url"
            defaultValue={defaults.streamUrl ?? ""}
            placeholder="https://youtu.be/… or https://forms.gle/…"
          />
        </FormField>
      </FormSection>

      <FormSection title="Flags">
        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="isPinned"
              defaultChecked={defaults.isPinned ?? false}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="font-medium text-[color:var(--color-ink)]">
                Pin to top
              </span>
              <span className="block text-xs text-[color:var(--color-muted)]">
                Force this above other active announcements on the campus page.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="isArchived"
              defaultChecked={defaults.isArchived ?? false}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="font-medium text-[color:var(--color-ink)]">
                Archived
              </span>
              <span className="block text-xs text-[color:var(--color-muted)]">
                Hide from the public page without deleting.
              </span>
            </span>
          </label>
        </div>
      </FormSection>

      {state.status === "error" && state.message && (
        <FormBanner tone="error" message={state.message} />
      )}
      {state.status === "success" && state.message && (
        <FormBanner tone="success" message={state.message} />
      )}

      <div className="flex justify-end">
        <SubmitButton>
          {mode === "create" ? "Create announcement" : "Save changes"}
        </SubmitButton>
      </div>
    </form>
  );
}
