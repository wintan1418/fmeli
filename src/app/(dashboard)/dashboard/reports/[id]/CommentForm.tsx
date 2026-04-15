"use client";

import { useActionState, useEffect, useRef } from "react";
import { MessageSquarePlus } from "lucide-react";
import { FormBanner, SubmitButton, Textarea, labelClass } from "@/components/forms";
import { addReportComment, type CommentActionState } from "./actions";

const initial: CommentActionState = { status: "idle" };

export function CommentForm({ reportId }: { reportId: string }) {
  const [state, action] = useActionState(addReportComment, initial);
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
      className="rounded-[var(--radius-card)] border border-[color:rgb(11_20_27/0.08)] bg-white p-6"
    >
      <input type="hidden" name="reportId" value={reportId} />
      <label htmlFor="body" className={labelClass}>
        Leave a comment
      </label>
      <Textarea
        id="body"
        name="body"
        rows={4}
        required
        maxLength={2000}
        placeholder="Encouragement, follow-up question, action item…"
      />

      {state.status === "error" && state.message && (
        <FormBanner tone="error" message={state.message} className="mt-3" />
      )}

      <div className="mt-4 flex justify-end">
        <SubmitButton tone="secondary" pendingLabel="Posting…">
          <MessageSquarePlus size={14} />
          Post comment
        </SubmitButton>
      </div>
    </form>
  );
}
