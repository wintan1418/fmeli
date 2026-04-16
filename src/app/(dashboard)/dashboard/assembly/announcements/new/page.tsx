import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  requireDashboardSession,
  resolveAssemblyScope,
  canSeeAllAssemblies,
} from "@/lib/dashboard/session";
import { client as readClient } from "@/lib/sanity/client";
import { DASH_ASSEMBLIES_LIST_QUERY } from "@/lib/sanity/dashboard-queries";
import type { AssemblyOption } from "@/types/sanity";
import { AnnouncementForm } from "../AnnouncementForm";

export const metadata = { title: "New announcement · Dashboard" };

export default async function NewAnnouncementPage({
  searchParams,
}: {
  searchParams: Promise<{ assembly?: string }>;
}) {
  const session = await requireDashboardSession();
  const seeAll = canSeeAllAssemblies(session);
  const { assembly: requestedFromQuery } = await searchParams;

  const assemblies = await readClient.fetch<AssemblyOption[]>(
    DASH_ASSEMBLIES_LIST_QUERY,
  );
  const requestedId =
    requestedFromQuery ??
    (seeAll ? assemblies[0]?._id ?? null : session.assemblyId);
  const assemblyId = resolveAssemblyScope(session, requestedId);

  if (!assemblyId) {
    return (
      <DashboardShell
        session={session}
        title="New announcement"
        description="No assembly in scope."
      >
        <p className="text-sm text-ink-soft">
          Ask the office to attach you to an assembly.
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      session={session}
      title="New announcement"
      description="Fill in the details. You can pin or archive later from the list."
      actions={
        <Link
          href="/dashboard/assembly/announcements"
          className="inline-flex items-center gap-2 rounded-full border border-ink/12 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink"
        >
          <ArrowLeft size={12} />
          Back
        </Link>
      }
    >
      <AnnouncementForm mode="create" assemblyId={assemblyId} />
    </DashboardShell>
  );
}
