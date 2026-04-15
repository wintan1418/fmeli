import { UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  requireDashboardSession,
  canSeeAllAssemblies,
} from "@/lib/dashboard/session";
import { client as readClient } from "@/lib/sanity/client";
import {
  DASH_MEMBERS_LIST_QUERY,
  DASH_ASSEMBLIES_LIST_QUERY,
} from "@/lib/sanity/dashboard-queries";
import type { AssemblyOption, MemberListRow } from "@/types/sanity";
import { AddMemberForm } from "./AddMemberForm";

export const metadata = {
  title: "Members · Dashboard",
};

const STAGE_LABEL: Record<string, string> = {
  visitor: "Visitor",
  decision: "First decision",
  new: "New convert",
  established: "Established",
  worker: "Worker",
  leader: "Leader",
};

export default async function MembersPage() {
  const session = await requireDashboardSession();
  const seeAll = canSeeAllAssemblies(session);

  const [members, assemblies] = await Promise.all([
    readClient.fetch<MemberListRow[]>(DASH_MEMBERS_LIST_QUERY, {
      seeAll,
      assemblyId: session.assemblyId ?? "",
    }),
    readClient.fetch<AssemblyOption[]>(DASH_ASSEMBLIES_LIST_QUERY),
  ]);

  const pinnedAssemblyId = seeAll ? null : session.assemblyId;

  return (
    <DashboardShell
      session={session}
      title="Members"
      description={
        seeAll
          ? "Every member across every assembly."
          : `Members of ${session.assemblyCity ?? "your assembly"}.`
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* List */}
        <div>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white">
            {members.length === 0 ? (
              <div className="p-12 text-center">
                <UsersRound size={28} className="mx-auto text-brand-gold" />
                <p className="mt-4 font-[family-name:var(--font-display)] text-2xl text-ink">
                  No members yet
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  Add the first member with the form on the right —
                  they&rsquo;ll show up here straight away.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-ink/6">
                <thead className="bg-ink/2">
                  <tr>
                    <Th>Name</Th>
                    <Th>Contact</Th>
                    <Th>Stage</Th>
                    {seeAll && <Th>Assembly</Th>}
                    <Th>Joined</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/6">
                  {members.map((m) => (
                    <tr key={m._id} className="hover:bg-ink/2">
                      <Td bold>
                        {[m.firstName, m.lastName].filter(Boolean).join(" ")}
                      </Td>
                      <Td>
                        <span className="block">{m.email ?? "—"}</span>
                        <span className="block text-xs text-muted">
                          {m.phone ?? ""}
                        </span>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center rounded-full bg-brand-blue-ink/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-blue-ink">
                          {STAGE_LABEL[m.lifeStage ?? "visitor"] ??
                            m.lifeStage}
                        </span>
                      </Td>
                      {seeAll && <Td>{m.assemblyCity ?? "—"}</Td>}
                      <Td>{m.joinedAt ?? "—"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="mt-4 text-xs text-muted">
            Showing the most recent {Math.min(members.length, 250)} members.
            For the full registry, open Studio.
          </p>
        </div>

        {/* Add form */}
        <AddMemberForm
          assemblies={assemblies}
          pinnedAssemblyId={pinnedAssemblyId}
        />
      </div>
    </DashboardShell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
      {children}
    </th>
  );
}

function Td({
  children,
  bold = false,
}: {
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <td
      className={`px-5 py-4 text-sm ${bold ? "font-semibold text-ink" : "text-ink-soft"}`}
    >
      {children}
    </td>
  );
}
