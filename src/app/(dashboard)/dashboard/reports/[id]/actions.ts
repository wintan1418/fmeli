"use server";

import { revalidatePath } from "next/cache";
import { requireDashboardSession } from "@/lib/dashboard/session";
import { sanityWrite } from "@/lib/sanity/write-client";
import { client as readClient } from "@/lib/sanity/client";
import { DASH_REPORT_ASSEMBLY_ID_QUERY } from "@/lib/sanity/dashboard-queries";

export type CommentActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

function txt(form: FormData, key: string): string | undefined {
  const raw = form.get(key);
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}

export async function addReportComment(
  _prev: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const session = await requireDashboardSession();

  const reportId = txt(formData, "reportId");
  const body = txt(formData, "body");
  if (!reportId || !body) {
    return { status: "error", message: "Comment body is required." };
  }

  // Re-check the lead can only comment on their OWN assembly's report.
  // Admins can comment on any. We do this check server-side because the
  // client form has no idea what scope rules apply.
  const report = await readClient.fetch<{ assemblyId?: string } | null>(
    DASH_REPORT_ASSEMBLY_ID_QUERY,
    { id: reportId },
  );

  if (!report) {
    return { status: "error", message: "Report not found." };
  }

  const isAdmin =
    session.role === "office_admin" || session.role === "super_admin";
  if (!isAdmin && report.assemblyId !== session.assemblyId) {
    return {
      status: "error",
      message: "You can only comment on reports for your own assembly.",
    };
  }

  const comment = {
    _key: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    _type: "reportComment",
    author: { _type: "reference" as const, _ref: session.pastorId },
    authorName: session.name,
    authorRole: session.role,
    body,
    createdAt: new Date().toISOString(),
  };

  try {
    await sanityWrite("append report comment", (c) =>
      c
        .patch(reportId)
        .setIfMissing({ comments: [] })
        .insert("after", "comments[-1]", [comment])
        .commit(),
    );
  } catch (err) {
    console.error("[dashboard/reports/comment] write failed", err);
    return {
      status: "error",
      message: "Could not post the comment. Please try again.",
    };
  }

  revalidatePath(`/dashboard/reports/${reportId}`);
  revalidatePath("/dashboard/reports");
  return { status: "success" };
}
