"use client";

import { useState } from "react";

export function StartTrialButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Checkout failed");
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert(err instanceof Error ? err.message : "Could not start checkout");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg bg-amber-500 px-5 py-3 font-medium text-slate-900 transition-colors hover:bg-amber-400 disabled:opacity-50"
    >
      {loading ? "Starting…" : "Start 7-day free trial"}
    </button>
  );
}
