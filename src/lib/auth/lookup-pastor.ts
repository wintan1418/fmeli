import { client } from "@/lib/sanity/client";

/**
 * Look up a pastor by login email for the dashboard auth flow.
 *
 * Returns null when:
 *  - no pastor doc has that email, OR
 *  - the matched pastor has no `dashboardRole` set (login is opt-in).
 *
 * We use the server-token Sanity client because the email field is private —
 * we never want it leaking into a public, CDN-cached query.
 */

export type PastorIdentity = {
  id: string;
  name: string;
  email: string;
  role: "assembly_lead" | "office_admin" | "super_admin";
  assemblyId: string | null;
  assemblyCity: string | null;
};

export async function lookupPastorByEmail(
  email: string,
): Promise<PastorIdentity | null> {
  const normalised = email.trim().toLowerCase();
  if (!normalised) return null;

  const row = await client.fetch<{
    _id: string;
    name?: string;
    email?: string;
    dashboardRole?: PastorIdentity["role"] | null;
    assemblyId?: string | null;
    assemblyCity?: string | null;
  } | null>(
    `*[_type == "pastor" && lower(email) == $email][0]{
       _id,
       name,
       email,
       dashboardRole,
       "assemblyId": assembly._ref,
       "assemblyCity": assembly->city
     }`,
    { email: normalised },
  );

  if (!row || !row.dashboardRole) return null;

  return {
    id: row._id,
    name: row.name ?? "Pastor",
    email: row.email ?? normalised,
    role: row.dashboardRole,
    assemblyId: row.assemblyId ?? null,
    assemblyCity: row.assemblyCity ?? null,
  };
}
