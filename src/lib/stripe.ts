import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Returns a Stripe client when STRIPE_SECRET_KEY is set. Use in API routes
 * after checking env so the key is never required at build time.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeInstance) {
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}
