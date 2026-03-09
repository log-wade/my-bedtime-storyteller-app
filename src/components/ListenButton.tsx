"use client";

import { useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";

type Props = { bookId: number; title: string; className?: string; children?: React.ReactNode };

export function ListenButton({ bookId, title, className, children }: Props) {
  const [error, setError] = useState<string | null>(null);
  const { loadAndPlay, currentBookId, isPlaying } = usePlayer();
  const isThisBookPlaying = currentBookId === bookId && isPlaying;

  async function handleClick() {
    setError(null);
    try {
      await loadAndPlay(bookId, title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play audio");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={currentBookId !== null && currentBookId !== bookId}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-slate-900 transition-colors hover:bg-amber-400 disabled:opacity-50"
        }
      >
        {children ?? (isThisBookPlaying ? "Reading…" : "Listen / Read to me")}
      </button>
      {error && (
        <span className="text-sm text-amber-200" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
