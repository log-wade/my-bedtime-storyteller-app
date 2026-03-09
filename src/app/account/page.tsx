import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSubscriptionByEmail } from "@/lib/subscription";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";

export const metadata = {
  title: "Account | My Bedtime Storyteller",
  description: "Your account and subscription.",
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/account");
  }

  const email = session.user.email ?? null;
  const { hasActiveSubscription, customerId } = email
    ? await getSubscriptionByEmail(email)
    : { hasActiveSubscription: false, customerId: null };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Account
        </h1>

        <section className="mt-8 rounded-xl border border-slate-700/80 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white">Profile</h2>
          <dl className="mt-4 space-y-2 text-slate-300">
            {session.user.name != null && (
              <>
                <dt className="text-sm text-slate-500">Name</dt>
                <dd>{session.user.name}</dd>
              </>
            )}
            {session.user.email != null && (
              <>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd>{session.user.email}</dd>
              </>
            )}
          </dl>

          {hasActiveSubscription && (
            <p className="mt-4 text-sm text-amber-400">
              You have an active subscription.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            {customerId ? (
              <ManageSubscriptionButton customerId={customerId} />
            ) : (
              <Link
                href="/pricing"
                className="rounded-lg border border-amber-500/60 bg-amber-500/20 px-4 py-2 text-amber-200 transition-colors hover:bg-amber-500/30"
              >
                Subscribe to listen
              </Link>
            )}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-lg bg-amber-500/90 px-4 py-2 font-medium text-slate-900 transition-colors hover:bg-amber-400"
              >
                Sign out
              </button>
            </form>
          </div>
        </section>

        <p className="mt-8">
          <Link
            href="/"
            className="text-slate-400 transition-colors hover:text-amber-400"
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
