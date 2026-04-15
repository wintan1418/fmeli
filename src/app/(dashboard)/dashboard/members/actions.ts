"use server";

import { revalidatePath } from "next/cache";
import { requireDashboardSession } from "@/lib/dashboard/session";
import { sanityWrite } from "@/lib/sanity/write-client";

export type MemberActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const VALID_LIFE_STAGES = new Set([
  "visitor",
  "decision",
  "new",
  "established",
  "worker",
  "leader",
]);

function txt(form: FormData, key: string): string | undefined {
  const raw = form.get(key);
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}

export async function addMember(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const session = await requireDashboardSession();

  // Assembly leads always add to their own. Admins may pick.
  const requestedAssemblyId = txt(formData, "assemblyId");
  const assemblyId =
    session.role === "assembly_lead"
      ? session.assemblyId
      : requestedAssemblyId ?? session.assemblyId;

  if (!assemblyId) {
    return {
      status: "error",
      message: "No assembly to assign this member to.",
    };
  }

  const firstName = txt(formData, "firstName");
  const lastName = txt(formData, "lastName");
  if (!firstName || !lastName) {
    return {
      status: "error",
      message: "First and last name are required.",
    };
  }

  const lifeStage = txt(formData, "lifeStage") ?? "visitor";
  if (!VALID_LIFE_STAGES.has(lifeStage)) {
    return { status: "error", message: "Invalid life stage." };
  }

  const interestsRaw = txt(formData, "ministryInterests");
  const interests = interestsRaw
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    await sanityWrite("create member", (c) =>
      c.create({
        _type: "member",
        firstName,
        lastName,
        email: txt(formData, "email"),
        phone: txt(formData, "phone"),
        assembly: { _type: "reference", _ref: assemblyId },
        lifeStage,
        ministryInterests:
          interests && interests.length > 0 ? interests : undefined,
        status: "active",
        joinedAt: new Date().toISOString().slice(0, 10),
        submittedAt: new Date().toISOString(),
      }),
    );
  } catch (err) {
    console.error("[dashboard/members/add] Sanity write failed", err);
    return {
      status: "error",
      message: "Could not save the member. Please try again.",
    };
  }

  revalidatePath("/dashboard/members");
  return { status: "success", message: `${firstName} added.` };
}
