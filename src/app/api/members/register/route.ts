import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "next-sanity";

/**
 * Public member sign-up endpoint.
 *
 * Creates a `member` document in Sanity from the on-site sign-up form.
 * Requires SANITY_API_WRITE_TOKEN. If the token is missing the route
 * returns 503 so the rest of the site keeps rendering.
 */

type Payload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: "female" | "male" | "unspecified";
  birthMonth?: string;
  maritalStatus?: "single" | "married" | "engaged" | "widowed" | "other";
  occupation?: string;
  address?: string;
  assemblyId?: string;
  lifeStage?:
    | "visitor"
    | "decision"
    | "new"
    | "established"
    | "worker"
    | "leader";
  ministryInterests?: string;
};

const VALID_GENDERS = new Set(["female", "male", "unspecified"]);
const VALID_LIFE_STAGES = new Set([
  "visitor",
  "decision",
  "new",
  "established",
  "worker",
  "leader",
]);
const VALID_MARITAL = new Set([
  "single",
  "married",
  "engaged",
  "widowed",
  "other",
]);

function clean(s?: string) {
  const t = s?.trim();
  return t && t.length > 0 ? t : undefined;
}

export async function POST(req: NextRequest) {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        message:
          "Member sign-up is not configured yet. Set SANITY_API_WRITE_TOKEN in the project environment.",
      },
      { status: 503 },
    );
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const assemblyId = clean(body.assemblyId);

  if (!firstName || !lastName || !assemblyId) {
    return NextResponse.json(
      { message: "First name, last name, and home assembly are required." },
      { status: 400 },
    );
  }

  const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01",
    token,
    useCdn: false,
  });

  const interests = clean(body.ministryInterests)
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const doc = await writeClient.create({
      _type: "member",
      firstName,
      lastName,
      email: clean(body.email),
      phone: clean(body.phone),
      gender:
        body.gender && VALID_GENDERS.has(body.gender) ? body.gender : undefined,
      birthMonth: clean(body.birthMonth),
      maritalStatus:
        body.maritalStatus && VALID_MARITAL.has(body.maritalStatus)
          ? body.maritalStatus
          : undefined,
      occupation: clean(body.occupation),
      address: clean(body.address),
      assembly: { _type: "reference", _ref: assemblyId },
      lifeStage:
        body.lifeStage && VALID_LIFE_STAGES.has(body.lifeStage)
          ? body.lifeStage
          : "visitor",
      joinedAt: new Date().toISOString().slice(0, 10),
      ministryInterests: interests && interests.length > 0 ? interests : undefined,
      status: "active",
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, id: doc._id });
  } catch (err) {
    console.error("[members/register] Sanity mutation failed", err);
    return NextResponse.json(
      { message: "Could not save your sign-up. Please try again." },
      { status: 500 },
    );
  }
}
