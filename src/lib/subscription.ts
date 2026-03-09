import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

function isActiveOrTrialing(status: Stripe.Subscription["status"]): boolean {
  return status === "active" || status === "trialing";
}

export type SubscriptionInfo = {
  hasActiveSubscription: boolean;
  customerId: string | null;
};

export async function getSubscriptionByEmail(
  email: string
): Promise<SubscriptionInfo> {
  const stripe = getStripe();
  if (!stripe) {
    return { hasActiveSubscription: false, customerId: null };
  }

  try {
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });
    const customer = customers.data[0];
    if (!customer) {
      return { hasActiveSubscription: false, customerId: null };
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
    });
    const active = subscriptions.data.some((s) => isActiveOrTrialing(s.status));
    return {
      hasActiveSubscription: active,
      customerId: customer.id,
    };
  } catch {
    return { hasActiveSubscription: false, customerId: null };
  }
}
