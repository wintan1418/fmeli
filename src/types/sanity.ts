/**
 * Hand-written TypeScript shapes for Sanity documents + projections.
 *
 * One day we'll switch to `npx sanity typegen generate` and let the
 * schema generate these. Until then this file is the single source of
 * truth — every page that fetches Sanity data should import from here
 * instead of declaring its own ad-hoc `type FooDoc = {...}`.
 *
 * The types here intentionally mirror the GROQ projections in
 * src/lib/sanity/queries.ts and src/lib/sanity/dashboard-queries.ts.
 * If you change a projection, update the matching type next to it.
 */

import type { PortableTextBlock } from "next-sanity";

// ────────────────────────────────────────────────────────────
// Shared building blocks
// ────────────────────────────────────────────────────────────

export type SanityImage = {
  asset?: { _ref?: string; _id?: string; url?: string };
  alt?: string;
};

export type Slug = { current?: string };

// ────────────────────────────────────────────────────────────
// Documents
// ────────────────────────────────────────────────────────────

export type DashboardRole =
  | "assembly_lead"
  | "office_admin"
  | "super_admin";

export type Pastor = {
  _id: string;
  name?: string;
  role?: string;
  department?: string;
  email?: string;
  dashboardRole?: DashboardRole;
  image?: SanityImage;
  bio?: PortableTextBlock[];
};

export type ServiceTime = {
  _key?: string;
  label?: string;
  day?: string;
  time?: string;
};

export type Assembly = {
  _id: string;
  slug?: string;
  city: string;
  state?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  mapUrl?: string;
  mapEmbed?: string;
  about?: PortableTextBlock[];
  heroImage?: SanityImage;
  serviceTimes?: ServiceTime[];
  leadPastor?: Pastor | null;
  leaders?: Pastor[];
};

/** Trimmed assembly used for picker dropdowns. */
export type AssemblyOption = {
  _id: string;
  city: string;
  state?: string;
};

export type MessageCategory = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  parent?: { title?: string; slug?: string } | null;
};

export type Message = {
  _id: string;
  title: string;
  slug?: string;
  date?: string;
  scripture?: string;
  excerpt?: string;
  excerptUrl?: string;
  excerptFileUrl?: string;
  durationMinutes?: number;
  featured?: boolean;
  youtubeId?: string;
  audioUrl?: string;
  audioFileUrl?: string;
  videoFileUrl?: string;
  thumbnail?: SanityImage;
  notes?: PortableTextBlock[];
  transcript?: PortableTextBlock[];
  category?: {
    title?: string;
    slug?: string;
    parent?: { title?: string; slug?: string } | null;
  };
  preacher?: { name?: string; role?: string; image?: SanityImage };
  series?: { title?: string; slug?: string; artwork?: SanityImage };
  assembly?: { slug?: string; city?: string };
};

export type WorshipSong = {
  _key?: string;
  title?: string;
  writer?: string;
};

export type WorshipSession = {
  _id: string;
  title: string;
  slug?: string;
  date?: string;
  leader?: string;
  summary?: string;
  durationMinutes?: number;
  youtubeId?: string;
  audioUrl?: string;
  audioFileUrl?: string;
  thumbnail?: SanityImage;
  songList?: WorshipSong[];
  assembly?: { slug?: string; city?: string };
};

export type Track = {
  _id: string;
  title: string;
  slug?: string;
  artist?: string;
  releasedAt?: string;
  durationSeconds?: number;
  youtubeId?: string;
  audioUrl?: string;
  audioFileUrl?: string;
  cover?: SanityImage;
  lyrics?: PortableTextBlock[];
  writers?: string[];
};

export type TipCategory = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
};

export type Tip = {
  _id: string;
  title: string;
  slug?: string;
  summary?: string;
  publishedAt?: string;
  coverImage?: SanityImage;
  body?: PortableTextBlock[];
  category?: { title?: string; slug?: string };
  author?: {
    name?: string;
    role?: string;
    image?: SanityImage;
    bio?: PortableTextBlock[];
  };
};

export type Book = {
  _id: string;
  title: string;
  slug?: string;
  subtitle?: string;
  author?: string;
  cover?: SanityImage;
  price?: number;
  compareAtPrice?: number;
  buyUrl?: string;
  summary?: string;
  description?: PortableTextBlock[];
  pages?: number;
  language?: string;
  publishedAt?: string;
  outOfStock?: boolean;
  featured?: boolean;
};

export type Member = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: "female" | "male" | "unspecified";
  birthMonth?: string;
  maritalStatus?: "single" | "married" | "engaged" | "widowed" | "other";
  occupation?: string;
  address?: string;
  lifeStage?:
    | "visitor"
    | "decision"
    | "new"
    | "established"
    | "worker"
    | "leader";
  joinedAt?: string;
  ministryInterests?: string[];
  status?: "active" | "inactive" | "removed";
  submittedAt?: string;
  assembly?: { _id?: string; city?: string };
};

export type ReportComment = {
  _key: string;
  authorName?: string;
  authorRole?: DashboardRole;
  body?: string;
  createdAt?: string;
};

export type AssemblyReport = {
  _id: string;
  weekOf?: string;
  period?: "weekly" | "monthly" | "quarterly" | "special";
  status?: "draft" | "submitted" | "reviewed" | "filed";
  submittedAt?: string;
  attendance?: {
    total?: number;
    men?: number;
    women?: number;
    youth?: number;
    children?: number;
    firstTimers?: number;
    decisions?: number;
  };
  finances?: {
    tithe?: number;
    offering?: number;
    projects?: number;
    missions?: number;
    other?: number;
    notes?: string;
  };
  highlights?: PortableTextBlock[];
  prayerPoints?: PortableTextBlock[];
  testimonies?: PortableTextBlock[];
  challenges?: PortableTextBlock[];
  nextWeekFocus?: string;
  comments?: ReportComment[];
};

// ────────────────────────────────────────────────────────────
// Dashboard list-page row projections
// ────────────────────────────────────────────────────────────

/** Row in the /dashboard/reports table — flattened for tabular display. */
export type ReportListRow = {
  _id: string;
  weekOf?: string;
  period?: AssemblyReport["period"];
  status?: AssemblyReport["status"];
  attendanceTotal?: number | null;
  totalGiving?: number | null;
  assemblyCity?: string | null;
  submittedByName?: string | null;
  commentCount?: number;
};

/** Row in the /dashboard/members table. */
export type MemberListRow = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  lifeStage?: Member["lifeStage"];
  status?: Member["status"];
  joinedAt?: string;
  assemblyCity?: string | null;
};

/** Detail of an assemblyReport with author lookup joined in. */
export type ReportDetail = AssemblyReport & {
  assemblyId?: string;
  assemblyCity?: string | null;
  submittedByName?: string | null;
};

// ────────────────────────────────────────────────────────────
// Public site projections
// ────────────────────────────────────────────────────────────

export type EventPayment = {
  enabled?: boolean;
  amount?: number;
  currency?: string;
  allowPaystack?: boolean;
  allowTransfer?: boolean;
};

export type EventDoc = {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  capacity?: number;
  isSpecial?: boolean;
  registrationEnabled?: boolean;
  registrationDeadline?: string;
  registrationMode?: "internal" | "external";
  externalRegistrationUrl?: string;
  payment?: EventPayment | null;
  registrationFields?: Array<{
    label: string;
    name: string;
    kind:
      | "text"
      | "textarea"
      | "email"
      | "tel"
      | "number"
      | "date"
      | "select"
      | "checkbox";
    required?: boolean;
    options?: string[];
    placeholder?: string;
  }>;
  heroImage?: SanityImage;
  description?: PortableTextBlock[];
  assembly?: { _id?: string; slug?: string; city?: string; state?: string; address?: string };
  parentMeeting?: { slug?: string; title?: string };
  registeredCount?: number;
};
