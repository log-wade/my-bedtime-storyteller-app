import Link from "next/link";
import { auth } from "@/auth";
import { StartTrialButton } from "@/components/StartTrialButton";

export const metadata = {
  title: "Pricing | My Bedtime Storyteller",
  description: "Subscription plans and free trial for My Bedtime Storyteller.",
};

export default async function PricingPage() {
  const stripeCheckoutAvailable = !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Pricing
        </h1>
        <p className="mt-2 text-slate-400">
          One simple plan. Start with a free trial.
        </p>

        {!session && (
          <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-200">
            <p className="text-sm">
              <Link href="/api/auth/signin?callbackUrl=/pricing" className="font-medium underline hover:no-underline">
                Sign in
              </Link>
              {" "}to start your free trial and link your subscription to your account.
            </p>
          </div>
        )}

        <section className="mt-10 rounded-xl border border-slate-700/80 bg-slate-800/50 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Monthly plan</h2>
            <p className="text-2xl font-bold text-white">
              $9.99<span className="text-base font-normal text-slate-400">/month</span>
            </p>
          </div>
          <ul className="mt-4 space-y-2 text-slate-300">
            <li>• Unlimited listening with the voice agent</li>
            <li>• Access to the full Project Gutenberg catalog</li>
            <li>• 7-day free trial — cancel anytime</li>
          </ul>
          <p className="mt-4 text-slate-400">
            After your 7-day free trial, you’ll be charged $9.99/month. No long-term
            commitment.
          </p>

          <div className="mt-8">
            {stripeCheckoutAvailable ? (
              <StartTrialButton />
            ) : (
              <div className="rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-slate-400">
                <p className="font-medium text-slate-300">Coming soon</p>
                <p className="mt-1 text-sm">
                  Checkout is not configured yet. When Stripe is set up, a
                  &quot;Start 7-day free trial&quot; button will start a POST to
                  /api/stripe/checkout and redirect to the returned URL.
                </p>
              </div>
            )}
          </div>
        </section>

        <p className="mt-8">
          <Link
            href="/"
            className="text-slate-400 hover:text-amber-400 transition-colors"
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
