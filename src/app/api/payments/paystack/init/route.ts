import { NextResponse, type NextRequest } from "next/server";

/**
 * Initialize a Paystack transaction.
 *
 * Requires PAYSTACK_SECRET_KEY in env. Until set, returns 503 so the
 * registration form degrades gracefully (the user can choose bank transfer
 * instead).
 *
 * Flow:
 *   1. POST { registrationId, eventId, email, amount } from RegistrationForm
 *   2. Call Paystack /transaction/initialize with amount in kobo
 *   3. Return { authorizationUrl, reference } — the form redirects the
 *      browser to authorizationUrl, Paystack processes the payment, then
 *      redirects the user to the verify callback where we confirm and
 *      update the registration doc.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      {
        message:
          "Online payment isn't wired yet. Set PAYSTACK_SECRET_KEY in the project environment.",
      },
      { status: 503 },
    );
  }

  let body: {
    registrationId?: string;
    eventId?: string;
    email?: string;
    amount?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { registrationId, eventId, email, amount } = body;
  if (!registrationId || !email || !amount || amount <= 0) {
    return NextResponse.json(
      { message: "Missing registrationId, email, or amount" },
      { status: 400 },
    );
  }

  const origin = new URL(req.url).origin;

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // kobo
        currency: "NGN",
        callback_url: `${origin}/api/payments/paystack/verify?registrationId=${encodeURIComponent(registrationId)}`,
        metadata: {
          registrationId,
          eventId,
          source: "fmeli-website",
        },
      }),
    });
    const data = await res.json();
    if (!res.ok || !data?.data?.authorization_url) {
      return NextResponse.json(
        { message: data?.message ?? "Paystack init failed" },
        { status: 502 },
      );
    }
    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err) {
    console.error("[paystack/init] failed", err);
    return NextResponse.json(
      { message: "Could not reach the payment provider" },
      { status: 502 },
    );
  }
}
