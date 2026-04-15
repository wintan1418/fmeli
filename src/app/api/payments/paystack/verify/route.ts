import { NextResponse, type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { getWriteClient } from "@/lib/sanity/write-client";

/**
 * Paystack verify callback.
 *
 * Paystack redirects here with ?reference=...&registrationId=... after the
 * customer completes payment. We call Paystack's /transaction/verify to
 * confirm the status, then patch the registration doc in Sanity and
 * redirect the user to a friendly confirmation page on the event.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  const url = new URL(req.url);
  const reference = url.searchParams.get("reference");
  const registrationId = url.searchParams.get("registrationId");

  if (!secret) {
    return NextResponse.json(
      { message: "Payment verification not configured" },
      { status: 503 },
    );
  }

  if (!reference || !registrationId) {
    return NextResponse.json(
      { message: "Missing reference or registrationId" },
      { status: 400 },
    );
  }

  try {
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        cache: "no-store",
      },
    );
    const data = await verifyRes.json();

    const status = data?.data?.status;
    const amount = typeof data?.data?.amount === "number" ? data.data.amount / 100 : undefined;

    const writeClient = getWriteClient();

    const updated = await writeClient
      .patch(registrationId)
      .set({
        status: status === "success" ? "confirmed" : "payment_failed",
        paymentReference: reference,
        paymentMethod: "paystack",
        paidAt: status === "success" ? new Date().toISOString() : undefined,
        amount,
      })
      .commit();

    // Look up the event slug to redirect nicely
    const eventRef = (updated as { event?: { _ref?: string } }).event?._ref;
    let slug: string | null = null;
    if (eventRef) {
      const ev = await writeClient.fetch<{ slug?: { current?: string } }>(
        `*[_id == $id][0]{ slug }`,
        { id: eventRef },
      );
      slug = ev?.slug?.current ?? null;
    }

    const target =
      status === "success"
        ? `/events/${slug ?? ""}?paid=1`
        : `/events/${slug ?? ""}?paid=0`;
    redirect(target);
  } catch (err) {
    console.error("[paystack/verify] failed", err);
    return NextResponse.json(
      { message: "Verification failed" },
      { status: 502 },
    );
  }
}
