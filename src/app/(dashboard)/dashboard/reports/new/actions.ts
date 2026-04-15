"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDashboardSession } from "@/lib/dashboard/session";
import { getWriteClient } from "@/lib/sanity/write-client";

export type ReportActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const VALID_PERIODS = new Set(["weekly", "monthly", "quarterly", "special"]);

function num(form: FormData, key: string): number | undefined {
  const raw = form.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function txt(form: FormData, key: string): string | undefined {
  const raw = form.get(key);
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Wrap a multi-line textarea string in a single PortableText block per
 * paragraph. Good enough for dashboard reports — the office team uses
 * Studio for full rich-text editing.
 */
function textToBlocks(input?: string) {
  if (!input) return undefined;
  const paragraphs = input.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return undefined;
  return paragraphs.map((text, i) => ({
    _type: "block",
    _key: `b${Date.now()}${i}`,
    style: "normal",
    markDefs: [],
    children: [
      { _type: "span", _key: `s${Date.now()}${i}`, text, marks: [] },
    ],
  }));
}

export async function submitWeeklyReport(
  _prev: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  const session = await requireDashboardSession();

  // Only assembly leads can FILE reports. Office/super admins are
  // read-only viewers of the report archive across every assembly —
  // they review what the leads send up, not author it themselves.
  if (session.role !== "assembly_lead") {
    return {
      status: "error",
      message:
        "Only assembly leads can submit reports. Admins have read-only access to the archive.",
    };
  }

  const assemblyId = session.assemblyId;

  if (!assemblyId) {
    return {
      status: "error",
      message:
        "No assembly is associated with your account. Ask the church office to fix this.",
    };
  }

  const period = txt(formData, "period") ?? "weekly";
  if (!VALID_PERIODS.has(period)) {
    return { status: "error", message: "Invalid reporting period." };
  }

  const weekOf = txt(formData, "weekOf");
  if (!weekOf) {
    return {
      status: "error",
      fieldErrors: { weekOf: "Required" },
      message: "Pick the week (or report date) before submitting.",
    };
  }

  const doc = {
    _type: "assemblyReport",
    assembly: { _type: "reference" as const, _ref: assemblyId },
    submittedBy: { _type: "reference" as const, _ref: session.pastorId },
    period,
    weekOf,
    attendance: {
      _type: "object" as const,
      total: num(formData, "att_total"),
      men: num(formData, "att_men"),
      women: num(formData, "att_women"),
      youth: num(formData, "att_youth"),
      children: num(formData, "att_children"),
      firstTimers: num(formData, "att_firstTimers"),
      decisions: num(formData, "att_decisions"),
    },
    finances: {
      _type: "object" as const,
      tithe: num(formData, "fin_tithe"),
      offering: num(formData, "fin_offering"),
      projects: num(formData, "fin_projects"),
      missions: num(formData, "fin_missions"),
      other: num(formData, "fin_other"),
      notes: txt(formData, "fin_notes"),
    },
    highlights: textToBlocks(txt(formData, "highlights")),
    prayerPoints: textToBlocks(txt(formData, "prayerPoints")),
    testimonies: textToBlocks(txt(formData, "testimonies")),
    challenges: textToBlocks(txt(formData, "challenges")),
    nextWeekFocus: txt(formData, "nextWeekFocus"),
    status: "submitted",
    submittedAt: new Date().toISOString(),
  };

  try {
    await getWriteClient().create(doc);
  } catch (err) {
    console.error("[dashboard/reports/new] Sanity write failed", err);
    return {
      status: "error",
      message: "Could not save the report. Please try again.",
    };
  }

  revalidatePath("/dashboard/reports");
  redirect("/dashboard/reports");
}
