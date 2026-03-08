"use client";

import { useState } from "react";
import Image from "next/image";

type BookResult = {
  id: number;
  title: string;
  authors: { name: string }[];
  coverUrl: string | null;
  textPlainUrl: string | null;
  languages: string[];
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(
        `/api/books?q=${encodeURIComponent(query.trim())}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Search failed");
      }
      const data = await res.json();
      setResults(data.results ?? []);
      if ((data.results ?? []).length === 0) setError("No books found. Try another search.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRead(bookId: number) {
    if (playingId === bookId) return;
    setPlayingId(bookId);
    setError(null);
    try {
      const res = await fetch(`/api/read/${bookId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not start reading");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setPlayingId(null);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setPlayingId(null);
        setError("Playback failed");
      };
      await audio.play();
    } catch (err) {
      setPlayingId(null);
      setError(err instanceof Error ? err.message : "Could not play audio");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Bedtime Storyteller
          </h1>
          <p className="mt-2 text-slate-400">
            Search for a book. The voice agent will read it to you.
          </p>
        </header>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or author (e.g. Dickens, Pride and Prejudice)"
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              aria-label="Search books"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-amber-500 px-5 py-3 font-medium text-slate-900 transition-colors hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <div
            className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-amber-200"
            role="alert"
          >
            {error}
          </div>
        )}

        <p className="mb-4 text-sm text-slate-500">
          Books are from Project Gutenberg (free to read). Results are in English.
        </p>

        <section aria-label="Search results">
          {results.length > 0 && (
            <ul className="space-y-4">
              {results.map((book) => (
                <li
                  key={book.id}
                  className="flex gap-4 rounded-xl border border-slate-700/80 bg-slate-800/50 p-4 transition hover:border-slate-600"
                >
                  <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md bg-slate-700">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt=""
                        width={64}
                        height={96}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-500 text-xs">
                        No cover
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-white line-clamp-2">
                      {book.title}
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {book.authors.map((a) => a.name).join(", ") || "Unknown author"}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRead(book.id)}
                      disabled={playingId !== null && playingId !== book.id}
                      className="mt-2 inline-flex items-center gap-2 rounded-md bg-amber-500/90 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-amber-400 disabled:opacity-50"
                    >
                      {playingId === book.id ? (
                        <>Reading…</>
                      ) : (
                        <>Read to me</>
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
