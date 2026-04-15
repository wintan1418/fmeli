import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  requireDashboardSession,
  canSeeAllAssemblies,
} from "@/lib/dashboard/session";
import { client as readClient } from "@/lib/sanity/client";
import { ReportForm } from "./ReportForm";

export const metadata = {
  title: "New report · Dashboard",
};

export const dynamic = "force-dynamic";

type Assembly = { _id: string; city: string; state?: string };

export default async function NewReportPage() {
  const session = await requireDashboardSession();
  const seeAll = canSeeAllAssemblies(session);

  // Admins get a picker over every assembly. Leads get only theirs (to
  // populate the read-only display string), so we still fetch them.
  const assemblies = await readClient.fetch<Assembly[]>(
    `*[_type == "assembly"] | order(order asc, city asc){
        _id, city, state
      }`,
  );

  const pinnedAssemblyId = seeAll ? null : session.assemblyId;

  return (
    <DashboardShell
      session={session}
      title="New weekly report"
      description="Capture this week's attendance, finances, and what God did. Submitted reports go straight to the church office."
    >
      <ReportForm
        assemblies={assemblies}
        pinnedAssemblyId={pinnedAssemblyId}
      />
    </DashboardShell>
  );
}
