import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/80 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors"
        >
          My Bedtime Storyteller
        </Link>
        <nav className="flex items-center gap-4" aria-label="Main navigation">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
          >
            Search
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/account"
            className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
          >
            Account
          </Link>
        </nav>
      </div>
    </header>
  );
}
