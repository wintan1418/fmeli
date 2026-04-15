import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity webhook entry point.
 *
 * Sanity Studio is configured to POST here on any publish/unpublish, with a
 * shared secret. We verify the signature, then revalidate cache tags based
 * on the document that changed.
 *
 * Tags emitted elsewhere (see src/lib/sanity/client.ts):
 *   sanity:page:{slug}, sanity:message:{slug}, sanity:message:list,
 *   sanity:messageCategory:list, sanity:event:{slug}, sanity:event:list,
 *   sanity:settings
 */

type WebhookPayload = {
  _type: string;
  slug?: { current?: string } | string;
};

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "Missing SANITY_REVALIDATE_SECRET env var" },
      { status: 500 },
    );
  }

  const { isValidSignature, body } = await parseBody<WebhookPayload>(
    req,
    secret,
  );

  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  if (!body?._type) {
    return NextResponse.json(
      { message: "Missing _type on webhook payload" },
      { status: 400 },
    );
  }

  const slug =
    typeof body.slug === "string" ? body.slug : body.slug?.current;
  const tags: string[] = ["sanity:settings"];

  switch (body._type) {
    case "page":
      if (slug) tags.push(`sanity:page:${slug}`);
      break;
    case "message":
      tags.push("sanity:message:list");
      if (slug) tags.push(`sanity:message:${slug}`);
      break;
    case "messageCategory":
      tags.push("sanity:messageCategory:list");
      tags.push("sanity:message:list");
      break;
    case "event":
      tags.push("sanity:event:list");
      if (slug) tags.push(`sanity:event:${slug}`);
      break;
    case "siteSettings":
      tags.push("sanity:settings");
      break;
    default:
      // Unknown type — still flush settings so the publish has an effect.
      break;
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: true, tags });
}
