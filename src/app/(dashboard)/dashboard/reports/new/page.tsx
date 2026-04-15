import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireDashboardSession } from "@/lib/dashboard/session";
import { client as readClient } from "@/lib/sanity/client";
import { ReportForm } from "./ReportForm";

export const metadata = {
  title: "New report · Dashboard",
};

export const dynamic = "force-dynamic";

type Assembly = { _id: string; city: string; state?: string };

export default async function NewReportPage() {
  const session = await requireDashboardSession();

  // Reports are filed by assembly leads. Office/super admins read the
  // archive but don't author it — bounce them back to the list.
  if (session.role !== "assembly_lead") {
    redirect("/dashboard/reports");
  }

  // The form needs the city label even though it's pinned, so still
  // pull the assembly list (one row, but lets us reuse the form).
  const assemblies = await readClient.fetch<Assembly[]>(
    `*[_type == "assembly"] | order(order asc, city asc){
        _id, city, state
      }`,
  );

  return (
    <DashboardShell
      session={session}
      title="New weekly report"
      description="Capture this week's attendance, finances, and what God did. Submitted reports go straight to the church office."
    >
      <ReportForm
        assemblies={assemblies}
        pinnedAssemblyId={session.assemblyId}
      />
    </DashboardShell>
  );
}
