import { UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  requireDashboardSession,
  canSeeAllAssemblies,
} from "@/lib/dashboard/session";
import { client as readClient } from "@/lib/sanity/client";
import { AddMemberForm } from "./AddMemberForm";

export const metadata = {
  title: "Members · Dashboard",
};

export const dynamic = "force-dynamic";

type MemberRow = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  lifeStage?: string;
  status?: string;
  joinedAt?: string;
  assemblyCity?: string | null;
};

type Assembly = { _id: string; city: string; state?: string };

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
    readClient.fetch<MemberRow[]>(
      `*[_type == "member"
          && status != "removed"
          && ($seeAll == true || assembly._ref == $assemblyId)
        ] | order(submittedAt desc, lastName asc)[0...250]{
          _id,
          firstName,
          lastName,
          email,
          phone,
          lifeStage,
          status,
          joinedAt,
          "assemblyCity": assembly->city
        }`,
      {
        seeAll,
        assemblyId: session.assemblyId ?? "",
      },
    ),
    readClient.fetch<Assembly[]>(
      `*[_type == "assembly"] | order(order asc, city asc){
          _id, city, state
        }`,
    ),
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
          <div
            className="overflow-hidden rounded-[var(--radius-card)] border bg-white"
            style={{ borderColor: "rgb(11 20 27 / 0.08)" }}
          >
            {members.length === 0 ? (
              <div className="p-12 text-center">
                <UsersRound
                  size={28}
                  className="mx-auto"
                  style={{ color: "var(--color-brand-gold)" }}
                />
                <p
                  className="mt-4 font-[family-name:var(--font-display)] text-2xl"
                  style={{ color: "var(--color-ink)" }}
                >
                  No members yet
                </p>
                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  Add the first member with the form on the right — they&rsquo;ll
                  show up here straight away.
                </p>
              </div>
            ) : (
              <table
                className="min-w-full divide-y"
                style={{ borderColor: "rgb(11 20 27 / 0.06)" }}
              >
                <thead style={{ background: "rgb(11 20 27 / 0.02)" }}>
                  <tr>
                    <Th>Name</Th>
                    <Th>Contact</Th>
                    <Th>Stage</Th>
                    {seeAll && <Th>Assembly</Th>}
                    <Th>Joined</Th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ borderColor: "rgb(11 20 27 / 0.06)" }}
                >
                  {members.map((m) => (
                    <tr
                      key={m._id}
                      className="hover:bg-[color:rgb(11_20_27/0.02)]"
                    >
                      <Td bold>
                        {[m.firstName, m.lastName].filter(Boolean).join(" ")}
                      </Td>
                      <Td>
                        <span className="block">{m.email ?? "—"}</span>
                        <span
                          className="block text-xs"
                          style={{ color: "var(--color-muted)" }}
                        >
                          {m.phone ?? ""}
                        </span>
                      </Td>
                      <Td>
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                          style={{
                            background:
                              "color-mix(in srgb, var(--color-brand-blue-ink) 8%, white)",
                            color: "var(--color-brand-blue-ink)",
                          }}
                        >
                          {STAGE_LABEL[m.lifeStage ?? "visitor"] ?? m.lifeStage}
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
          <p
            className="mt-4 text-xs"
            style={{ color: "var(--color-muted)" }}
          >
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
    <th
      className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em]"
      style={{ color: "var(--color-muted)" }}
    >
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
      className="px-5 py-4 text-sm"
      style={{
        color: bold ? "var(--color-ink)" : "var(--color-ink-soft)",
        fontWeight: bold ? 600 : 400,
      }}
    >
      {children}
    </td>
  );
}
