"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PlayerState = {
  currentBookId: number | null;
  currentTitle: string;
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
};

type PlayerContextValue = PlayerState & {
  loadAndPlay: (bookId: number, title: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaying: (playing: boolean) => void;
  clearBook: () => void;
};

const initialState: PlayerState = {
  currentBookId: null,
  currentTitle: "",
  audioUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>(initialState);

  const loadAndPlay = useCallback(async (bookId: number, title: string) => {
    setState((prev) => {
      if (prev.audioUrl) URL.revokeObjectURL(prev.audioUrl);
      return { ...prev, currentBookId: bookId, currentTitle: title, audioUrl: null, isPlaying: false, currentTime: 0, duration: 0 };
    });
    try {
      const res = await fetch(`/api/read/${bookId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Could not load audio");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setState((prev) => {
        if (prev.audioUrl) URL.revokeObjectURL(prev.audioUrl);
        return {
          ...prev,
          currentBookId: bookId,
          currentTitle: title,
          audioUrl: url,
          isPlaying: true,
          currentTime: 0,
          duration: 0,
        };
      });
    } catch (err) {
      setState((prev) => ({ ...prev, currentBookId: null, currentTitle: "", audioUrl: null }));
      throw err;
    }
  }, []);

  const play = useCallback(() => setState((prev) => ({ ...prev, isPlaying: true })), []);
  const pause = useCallback(() => setState((prev) => ({ ...prev, isPlaying: false })), []);
  const seek = useCallback((time: number) => setState((prev) => ({ ...prev, currentTime: time })), []);
  const setPlaybackRate = useCallback((rate: number) => setState((prev) => ({ ...prev, playbackRate: rate })), []);
  const setCurrentTime = useCallback((time: number) => setState((prev) => ({ ...prev, currentTime: time })), []);
  const setDuration = useCallback((duration: number) => setState((prev) => ({ ...prev, duration })), []);
  const setPlaying = useCallback((isPlaying: boolean) => setState((prev) => ({ ...prev, isPlaying })), []);

  const clearBook = useCallback(() => {
    setState((prev) => {
      if (prev.audioUrl) URL.revokeObjectURL(prev.audioUrl);
      return initialState;
    });
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      ...state,
      loadAndPlay,
      play,
      pause,
      seek,
      setPlaybackRate,
      setCurrentTime,
      setDuration,
      setPlaying,
      clearBook,
    }),
    [
      state,
      loadAndPlay,
      play,
      pause,
      seek,
      setPlaybackRate,
      setCurrentTime,
      setDuration,
      setPlaying,
      clearBook,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
