import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  requireDashboardSession,
  resolveAssemblyScope,
  canSeeAllAssemblies,
} from "@/lib/dashboard/session";
import { client as readClient } from "@/lib/sanity/client";
import {
  DASH_ASSEMBLIES_LIST_QUERY,
  DASH_ASSEMBLY_BY_ID_QUERY,
} from "@/lib/sanity/dashboard-queries";
import type { Assembly, AssemblyOption } from "@/types/sanity";
import { AssemblyForm } from "./AssemblyForm";

export const metadata = {
  title: "Assembly profile · Dashboard",
};

export default async function AssemblyProfilePage({
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

  // Admins can pick via ?assembly=... For the first load they get the
  // first assembly in the list as the default, so the form has data.
  const requestedId =
    requestedFromQuery ??
    (seeAll ? assemblies[0]?._id ?? null : session.assemblyId);
  const assemblyId = resolveAssemblyScope(session, requestedId);

  if (!assemblyId) {
    return (
      <DashboardShell
        session={session}
        title="Assembly profile"
        description="No assembly is associated with your account."
      >
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Ask the church office to attach you to an assembly so you can edit
          its profile.
        </p>
      </DashboardShell>
    );
  }

  const doc = await readClient.fetch<Assembly | null>(
    DASH_ASSEMBLY_BY_ID_QUERY,
    { id: assemblyId },
  );

  if (!doc) {
    return (
      <DashboardShell session={session} title="Assembly profile">
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          That assembly couldn&rsquo;t be loaded.
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      session={session}
      title={`${doc.city} assembly`}
      description="Update what visitors see on the public assembly page. Changes appear within a minute."
      actions={
        <Link
          href={`/assemblies/${doc.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition hover:scale-[1.02]"
          style={{
            borderColor: "rgb(11 20 27 / 0.12)",
            color: "var(--color-ink)",
          }}
        >
          View public page
          <ExternalLink size={12} />
        </Link>
      }
    >
      <AssemblyForm
        assemblyId={doc._id}
        pinnedAssemblyId={seeAll ? null : session.assemblyId}
        assemblies={assemblies}
        defaults={{
          tagline: doc.tagline,
          address: doc.address,
          phone: doc.phone,
          email: doc.email,
          mapUrl: doc.mapUrl,
          serviceTimes: doc.serviceTimes,
        }}
      />
    </DashboardShell>
  );
}
