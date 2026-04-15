import { groq } from "next-sanity";

/**
 * GROQ queries used inside /dashboard.
 *
 * Kept separate from src/lib/sanity/queries.ts (which holds the public
 * site queries) so it's obvious at a glance which queries hit the read
 * client with the server token vs. the cached public client. They also
 * have different revalidation strategies — dashboard pages are
 * `force-dynamic` (per-request), public pages have 5 min - 1 hour TTLs.
 *
 * Variables every dashboard query expects:
 *   $seeAll       boolean — true when the session is office/super admin
 *   $assemblyId   string  — the lead's home assembly (ignored when
 *                            $seeAll is true). Pass "" for admins.
 */

// ────────────────────────────────────────────────────────────
// Reports
// ────────────────────────────────────────────────────────────

/**
 * Reports list — newest first, scoped to one assembly for leads or
 * everything for admins. Computes total giving in GROQ so the table
 * doesn't have to do a second pass.
 */
export const DASH_REPORTS_LIST_QUERY = groq`
  *[_type == "assemblyReport"
      && ($seeAll == true || assembly._ref == $assemblyId)
    ] | order(weekOf desc)[0...100]{
      _id,
      weekOf,
      period,
      status,
      "attendanceTotal": attendance.total,
      "totalGiving": coalesce(finances.tithe, 0)
                   + coalesce(finances.offering, 0)
                   + coalesce(finances.projects, 0)
                   + coalesce(finances.missions, 0)
                   + coalesce(finances.other, 0),
      "assemblyCity": assembly->city,
      "submittedByName": submittedBy->name,
      "commentCount": count(comments)
    }
`;

/** Single report by id, with comments expanded. */
export const DASH_REPORT_BY_ID_QUERY = groq`
  *[_type == "assemblyReport" && _id == $id][0]{
    _id,
    weekOf,
    period,
    status,
    submittedAt,
    attendance,
    finances,
    highlights,
    prayerPoints,
    testimonies,
    challenges,
    nextWeekFocus,
    "assemblyId": assembly._ref,
    "assemblyCity": assembly->city,
    "submittedByName": submittedBy->name,
    comments[]{
      _key,
      authorName,
      authorRole,
      body,
      createdAt
    }
  }
`;

/** Just the assembly id of a report — used by the comment action's
 * scope check before it lets a lead post on it. */
export const DASH_REPORT_ASSEMBLY_ID_QUERY = groq`
  *[_type == "assemblyReport" && _id == $id][0]{
    "assemblyId": assembly._ref
  }
`;

// ────────────────────────────────────────────────────────────
// Members
// ────────────────────────────────────────────────────────────

export const DASH_MEMBERS_LIST_QUERY = groq`
  *[_type == "member"
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
    }
`;

// ────────────────────────────────────────────────────────────
// Assemblies — picker + edit form data
// ────────────────────────────────────────────────────────────

/** Trimmed list for picker dropdowns. */
export const DASH_ASSEMBLIES_LIST_QUERY = groq`
  *[_type == "assembly"] | order(order asc, city asc){
    _id, city, state
  }
`;

/** Full doc for the assembly editor form. */
export const DASH_ASSEMBLY_BY_ID_QUERY = groq`
  *[_type == "assembly" && _id == $id][0]{
    _id,
    city,
    "slug": slug.current,
    tagline,
    address,
    phone,
    email,
    mapUrl,
    serviceTimes
  }
`;

/** Just the slug for cache invalidation after a save. */
export const DASH_ASSEMBLY_SLUG_QUERY = groq`
  *[_id == $id][0]{ "slug": slug.current }
`;
