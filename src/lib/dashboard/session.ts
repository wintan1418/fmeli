import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type DashboardRole = "assembly_lead" | "office_admin" | "super_admin";

export type DashboardSession = {
  pastorId: string;
  name: string;
  email: string;
  role: DashboardRole;
  assemblyId: string | null;
  assemblyCity: string | null;
};

/**
 * Server-side gate for every dashboard page and server action.
 *
 * Throws a redirect to /dashboard/login when the visitor isn't signed in
 * or doesn't carry a dashboardRole. Returns a strongly-typed session
 * object so call sites don't have to repeat the null checks.
 */
export async function requireDashboardSession(): Promise<DashboardSession> {
  const session = await auth();
  if (!session?.user || !session.user.role || !session.user.pastorId) {
    redirect("/dashboard/login");
  }

  return {
    pastorId: session.user.pastorId,
    name: session.user.name ?? "Pastor",
    email: session.user.email ?? "",
    role: session.user.role,
    assemblyId: session.user.assemblyId ?? null,
    assemblyCity: session.user.assemblyCity ?? null,
  };
}

/**
 * True when this session can see/edit data across every assembly.
 * Office admins and super admins are global; assembly leads are scoped.
 */
export function canSeeAllAssemblies(session: DashboardSession): boolean {
  return session.role === "office_admin" || session.role === "super_admin";
}

/**
 * Resolve the assembly id this session is allowed to act on for a given
 * request. Assembly leads are pinned to their own assembly; admins may
 * pass `requestedAssemblyId` to scope to a specific one. Returns null
 * when the session has global access AND no specific assembly was asked
 * for (meaning: query everything).
 *
 * Throws a redirect when an assembly lead tries to touch another
 * assembly's data — defence in depth on top of the GROQ filter.
 */
export function resolveAssemblyScope(
  session: DashboardSession,
  requestedAssemblyId?: string | null,
): string | null {
  if (canSeeAllAssemblies(session)) {
    return requestedAssemblyId ?? null;
  }
  if (!session.assemblyId) {
    // Lead with no home assembly is a config error — bounce them out.
    redirect("/dashboard/login?error=expired");
  }
  if (
    requestedAssemblyId &&
    requestedAssemblyId !== session.assemblyId
  ) {
    redirect("/dashboard");
  }
  return session.assemblyId;
}
