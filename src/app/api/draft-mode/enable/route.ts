import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

/**
 * Editor preview toggle. Sanity Studio's "Open preview" button hits this
 * route with ?sanity-preview-secret=… and &sanity-preview-pathname=/some/path.
 * We verify the secret, enable draft mode for this browser session, and
 * redirect to the requested pathname.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.SANITY_API_READ_TOKEN;
  const { searchParams } = new URL(req.url);
  const providedSecret = searchParams.get("sanity-preview-secret");
  const pathname = searchParams.get("sanity-preview-pathname") ?? "/";

  if (!secret || providedSecret !== secret) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(pathname);
}
