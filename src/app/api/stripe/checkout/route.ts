import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  const stripe = getStripe();
  if (!stripe || !priceId) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  const session = await auth();
  const email = session?.user?.email ?? undefined;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (request.nextUrl.origin || request.headers.get("origin") || "");

  if (!baseUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL or request origin required for redirects" },
      { status: 500 }
    );
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      subscription_data: {
        trial_period_days: 7,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/account?success=1`,
      cancel_url: `${baseUrl}/pricing?cancel=1`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
