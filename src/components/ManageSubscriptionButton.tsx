"use client";

import { useState } from "react";

export function ManageSubscriptionButton({
  customerId,
}: {
  customerId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error ?? "Failed to open portal");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg border border-slate-600 bg-slate-700/80 px-4 py-2 text-slate-200 transition-colors hover:bg-slate-600 disabled:opacity-50"
    >
      {loading ? "Opening…" : "Manage subscription"}
    </button>
  );
}
