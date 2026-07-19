"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/recipes?q=${encodeURIComponent(q.trim())}`);
      }}
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for pasta, tacos, smoothies…"
          className="input h-14 rounded-xl pl-12 text-base shadow-sm"
          aria-label="Search recipes"
        />
      </div>
      <button type="submit" className="btn-primary h-14 rounded-xl px-6 text-base">
        Search
      </button>
    </form>
  );
}
