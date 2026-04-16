"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { deleteAnnouncement, type AnnouncementActionState } from "../actions";

const initial: AnnouncementActionState = { status: "idle" };

/**
 * Small confirm-before-delete button. Uses a useActionState for the
 * server round-trip so the button can't be double-clicked. Confirm
 * dialog lives in a wrapping form handler so the submit is gated
 * client-side before the server action runs.
 */
export function DeleteAnnouncementButton({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [state, submit] = useActionState(deleteAnnouncement, initial);

  // Bounce back to the list after a successful delete — the current
  // edit page no longer exists.
  useEffect(() => {
    if (state.status === "success") {
      router.replace("/dashboard/assembly/announcements");
    }
  }, [state, router]);

  return (
    <form
      action={submit}
      onSubmit={(e) => {
        if (!confirm("Delete this announcement? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-brand-red)]/30 bg-[color:var(--color-brand-red)]/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-red)] transition hover:scale-[1.02]"
      >
        {children}
      </button>
    </form>
  );
}
