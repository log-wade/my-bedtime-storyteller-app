"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePlayer } from "@/contexts/PlayerContext";

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];
const SEEK_STEP = 15;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MediaPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentBookId,
    currentTitle,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    play,
    pause,
    seek,
    setPlaybackRate,
    setCurrentTime,
    setDuration,
    setPlaying,
  } = usePlayer();

  // Sync context -> audio element
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (audioUrl) {
      el.src = audioUrl;
      el.load();
    } else {
      el.removeAttribute("src");
    }
  }, [audioUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    if (isPlaying) {
      el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, [isPlaying, audioUrl, setPlaying]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (Math.abs(el.currentTime - currentTime) > 0.5) {
      el.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = useCallback(() => {
    const el = audioRef.current;
    if (el) setCurrentTime(el.currentTime);
  }, [setCurrentTime]);

  const handleLoadedMetadata = useCallback(() => {
    const el = audioRef.current;
    if (el) setDuration(el.duration);
  }, [setDuration]);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [setPlaying, setCurrentTime]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      seek(val);
      if (audioRef.current) audioRef.current.currentTime = val;
    },
    [seek]
  );

  const handleRewind = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    const next = Math.max(0, el.currentTime - SEEK_STEP);
    el.currentTime = next;
    seek(next);
  }, [seek]);

  const handleFastForward = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    const next = Math.min(el.duration || 0, el.currentTime + SEEK_STEP);
    el.currentTime = next;
    seek(next);
  }, [seek]);

  const hasContent = currentBookId !== null || audioUrl !== null;
  if (!hasContent) return null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/80 bg-slate-900/95 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] backdrop-blur-sm"
        role="region"
        aria-label="Audio player"
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-3">
          <p className="truncate text-center text-sm font-medium text-amber-400/90">
            Now playing: {currentTitle || "…"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleRewind}
              disabled={!audioUrl}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-700/80 hover:text-white disabled:opacity-40"
              aria-label="Rewind 15 seconds"
            >
              <RewindIcon />
            </button>
            <button
              type="button"
              onClick={isPlaying ? pause : play}
              disabled={!audioUrl}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-slate-900 transition hover:bg-amber-400 disabled:opacity-40"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              type="button"
              onClick={handleFastForward}
              disabled={!audioUrl}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-700/80 hover:text-white disabled:opacity-40"
              aria-label="Fast forward 15 seconds"
            >
              <FastForwardIcon />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-10 shrink-0 text-right text-xs text-slate-500 tabular-nums">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              disabled={!audioUrl}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition hover:[&::-webkit-slider-thumb]:bg-amber-400"
              aria-label="Seek"
            />
            <span className="w-10 shrink-0 text-xs text-slate-500 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="mr-1 text-xs text-slate-500">Speed</span>
            {SPEED_OPTIONS.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setPlaybackRate(rate)}
                className={`min-w-[2.25rem] rounded px-2 py-1 text-xs font-medium transition ${
                  playbackRate === rate
                    ? "bg-amber-500 text-slate-900"
                    : "text-slate-400 hover:bg-slate-700/80 hover:text-slate-200"
                }`}
                aria-label={`Playback speed ${rate}`}
                aria-pressed={playbackRate === rate}
              >
                {rate}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function PlayIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

function RewindIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
    </svg>
  );
}

function FastForwardIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
    </svg>
  );
}
