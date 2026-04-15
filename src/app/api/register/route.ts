import { NextResponse, type NextRequest } from "next/server";
import { getWriteClient } from "@/lib/sanity/write-client";

/**
 * Event registration endpoint.
 *
 * Expects JSON:
 *   {
 *     eventId: string,
 *     name: string,
 *     email?: string,
 *     phone?: string,
 *     assemblyId?: string,
 *     extra?: Record<string, string>
 *   }
 *
 * Creates a `registration` document referencing the event. Requires a Sanity
 * token with write access — set SANITY_API_WRITE_TOKEN in .env.local. If the
 * token is missing the route returns 503 so the homepage still renders.
 */

type Payload = {
  eventId?: string;
  name?: string;
  email?: string;
  phone?: string;
  assemblyId?: string;
  extra?: Record<string, string>;
};

export async function POST(req: NextRequest) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  if (!body.eventId || !body.name) {
    return NextResponse.json(
      { message: "eventId and name are required" },
      { status: 400 },
    );
  }

  let writeClient;
  try {
    writeClient = getWriteClient();
  } catch {
    return NextResponse.json(
      {
        message:
          "Registration is not configured yet. Set SANITY_API_WRITE_TOKEN in the project environment to accept submissions.",
      },
      { status: 503 },
    );
  }

  try {
    const doc = await writeClient.create({
      _type: "registration",
      submittedAt: new Date().toISOString(),
      event: { _type: "reference", _ref: body.eventId },
      name: body.name.trim(),
      email: body.email?.trim(),
      phone: body.phone?.trim(),
      assembly: body.assemblyId
        ? { _type: "reference", _ref: body.assemblyId }
        : undefined,
      extra: body.extra
        ? Object.entries(body.extra).map(([key, value]) => ({
            _type: "object",
            key,
            value: String(value),
          }))
        : undefined,
      status: "confirmed",
    });

    return NextResponse.json({ ok: true, id: doc._id });
  } catch (err) {
    console.error("[register] Sanity mutation failed", err);
    return NextResponse.json(
      { message: "Failed to save registration" },
      { status: 500 },
    );
  }
}
