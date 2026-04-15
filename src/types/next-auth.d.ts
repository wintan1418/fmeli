import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      pastorId?: string;
      role?: "assembly_lead" | "office_admin" | "super_admin";
      assemblyId?: string | null;
      assemblyCity?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    pastorId?: string;
    role?: "assembly_lead" | "office_admin" | "super_admin";
    assemblyId?: string | null;
    assemblyCity?: string | null;
  }
}
