"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";

export function FollowButton({ creatorId }: { creatorId: string }) {
  const { userId, requireAuth } = useAuth();
  const { toast } = useToast();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/follows?creatorId=${creatorId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setFollowing(!!d.following))
      .catch(() => {});
  }, [userId, creatorId]);

  if (userId === creatorId) return null;

  const toggle = () =>
    requireAuth(async () => {
      if (busy) return;
      setBusy(true);
      try {
        const res = await fetch("/api/follows", {
          method: following ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creatorId }),
        });
        if (!res.ok) throw new Error();
        const d = await res.json();
        setFollowing(!!d.following);
        if (d.following) toast("Following!", "success");
      } catch {
        toast("Something went wrong", "error");
      } finally {
        setBusy(false);
      }
    }, "Sign in to follow creators.");

  return (
    <button onClick={toggle} className={following ? "btn-secondary" : "btn-primary"} disabled={busy}>
      {busy ? <Spinner /> : following ? "Following" : "Follow"}
    </button>
  );
}
