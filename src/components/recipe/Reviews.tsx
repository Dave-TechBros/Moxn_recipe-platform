"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/lib/types";

function Stars({
  value,
  onChange,
  size = 20,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill={n <= value ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className={n <= value ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}>
            <path d="M12 17.3 6.2 21l1.6-6.9L2.5 9.3l7-.6L12 2l2.5 6.7 7 .6-5.3 4.8L17.8 21z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function Reviews({ recipeId }: { recipeId: string }) {
  const { requireAuth } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`/api/reviews?recipeId=${recipeId}`, { cache: "no-store" });
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  const submit = () =>
    requireAuth(async () => {
      if (rating < 1) {
        toast("Please select a rating", "error");
        return;
      }
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, rating, body }),
      });
      setSubmitting(false);
      if (!res.ok) {
        toast("Could not submit review", "error");
        return;
      }
      toast("Review posted!", "success");
      setBody("");
      setRating(0);
      load();
    }, "Sign in to rate and review this recipe.");

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold">Reviews &amp; ratings</h2>

      <div className="mt-4 card p-5">
        <p className="text-sm font-medium">Leave a review</p>
        <div className="mt-2">
          <Stars value={rating} onChange={setRating} size={28} />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share how it turned out…"
          rows={3}
          className="input mt-3 resize-none"
        />
        <button onClick={submit} disabled={submitting} className="btn-primary mt-3">
          {submitting ? <Spinner /> : "Post review"}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-slate-500">Loading reviews…</p>
        ) : reviews.length ? (
          reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center gap-3">
                <Avatar src={r.author?.avatar_url} seed={r.author?.username} size={36} />
                <div>
                  <p className="text-sm font-semibold">{r.author?.display_name ?? "MOXN Pantry cook"}</p>
                  <p className="text-xs text-slate-400">{formatDate(r.created_at)}</p>
                </div>
                <div className="ml-auto">
                  <Stars value={r.rating} size={16} />
                </div>
              </div>
              {r.body && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{r.body}</p>}
            </div>
          ))
        ) : (
          <p className="text-slate-500">No reviews yet. Be the first!</p>
        )}
      </div>
    </section>
  );
}
