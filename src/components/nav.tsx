"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function Nav() {
  const { data: session, status } = useSession();

  return (
    <nav
      className="border-b border-slate-700/80 bg-slate-900/80 backdrop-blur"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold text-white transition hover:text-amber-400"
        >
          My Bedtime Storyteller
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Pricing
          </Link>
          {status === "loading" ? (
            <span className="text-sm text-slate-500">Loading…</span>
          ) : session?.user ? (
            <>
              <Link
                href="/library"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Library
              </Link>
              <Link
                href="/account"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Account
              </Link>
              <span className="text-sm text-slate-300" aria-hidden>
                {session.user.name ?? session.user.email ?? "Signed in"}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => signIn()}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-amber-400"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
