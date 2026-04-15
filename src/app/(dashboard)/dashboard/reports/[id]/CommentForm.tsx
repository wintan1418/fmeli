"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, MessageSquarePlus, AlertCircle } from "lucide-react";
import { addReportComment, type CommentActionState } from "./actions";

const initial: CommentActionState = { status: "idle" };

export function CommentForm({ reportId }: { reportId: string }) {
  const [state, action, pending] = useActionState(addReportComment, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-[var(--radius-card)] border bg-white p-6"
      style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
    >
      <input type="hidden" name="reportId" value={reportId} />
      <label
        htmlFor="body"
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--color-ink-soft)" }}
      >
        Leave a comment
      </label>
      <textarea
        id="body"
        name="body"
        rows={4}
        required
        maxLength={2000}
        placeholder="Encouragement, follow-up question, action item…"
        className="w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2"
        style={{
          borderColor: "rgb(11 20 27 / 0.12)",
          color: "var(--color-ink)",
        }}
      />

      {state.status === "error" && state.message && (
        <div
          className="mt-3 flex items-start gap-2 rounded-lg border p-3 text-xs"
          style={{
            background:
              "color-mix(in srgb, var(--color-brand-red) 6%, white)",
            borderColor:
              "color-mix(in srgb, var(--color-brand-red) 30%, white)",
            color: "var(--color-brand-red)",
          }}
        >
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: "var(--color-brand-blue-ink)",
            color: "white",
          }}
        >
          {pending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Posting…
            </>
          ) : (
            <>
              <MessageSquarePlus size={14} />
              Post comment
            </>
          )}
        </button>
      </div>
    </form>
  );
}
