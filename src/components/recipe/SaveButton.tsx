"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export function SaveButton({
  recipeId,
  showLabel = false,
  className,
}: {
  recipeId: string;
  showLabel?: boolean;
  className?: string;
}) {
  const { userId, requireAuth } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) {
      setSaved(false);
      return;
    }
    let active = true;
    fetch(`/api/saved?recipeId=${recipeId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => active && setSaved(!!d.saved))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [userId, recipeId]);

  const toggle = () =>
    requireAuth(async () => {
      if (busy) return;
      setBusy(true);
      try {
        const res = await fetch("/api/saved", {
          method: saved ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        });
        if (!res.ok) throw new Error();
        const d = await res.json();
        setSaved(!!d.saved);
        toast(d.saved ? "Saved!" : "Removed from saved", d.saved ? "success" : "info");
      } catch {
        toast("Something went wrong", "error");
      } finally {
        setBusy(false);
      }
    }, "Sign in to save recipes to your account.");

  return (
    <button
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? "Unsave recipe" : "Save recipe"}
      className={cn("btn-ghost h-8 px-2", saved && "text-brand-600", className)}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {showLabel && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
