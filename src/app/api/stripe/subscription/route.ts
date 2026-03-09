import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

function isActiveOrTrialing(status: Stripe.Subscription["status"]): boolean {
  return status === "active" || status === "trialing";
}

export async function GET(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const customerId = searchParams.get("customerId")?.trim();
  const email = searchParams.get("email")?.trim();

  if (!customerId && !email) {
    return NextResponse.json(
      { error: "Provide customerId or email query parameter" },
      { status: 400 }
    );
  }

  if (customerId && email) {
    return NextResponse.json(
      { error: "Provide only one of customerId or email" },
      { status: 400 }
    );
  }

  try {
    let resolvedCustomerId: string | null = customerId ?? null;

    if (email) {
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });
      const customer = customers.data[0];
      if (!customer) {
        return NextResponse.json({
          hasActiveSubscription: false,
          customerId: null,
          subscriptions: [],
        });
      }
      resolvedCustomerId = customer.id;
    }

    if (!resolvedCustomerId) {
      return NextResponse.json({
        hasActiveSubscription: false,
        customerId: null,
        subscriptions: [],
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: resolvedCustomerId,
      status: "all",
    });

    const activeOrTrialing = subscriptions.data.filter((sub) =>
      isActiveOrTrialing(sub.status)
    );
    const hasActiveSubscription = activeOrTrialing.length > 0;

    return NextResponse.json({
      hasActiveSubscription,
      customerId: resolvedCustomerId,
      subscriptions: activeOrTrialing.map((s) => ({
        id: s.id,
        status: s.status,
      })),
    });
  } catch (err) {
    console.error("Stripe subscription lookup error:", err);
    return NextResponse.json(
      { error: "Failed to look up subscription" },
      { status: 500 }
    );
  }
}
