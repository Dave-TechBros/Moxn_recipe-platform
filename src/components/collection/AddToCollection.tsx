"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import type { Collection } from "@/lib/types";

export function AddToCollection({ recipeId }: { recipeId: string }) {
  const { requireAuth } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");

  const openModal = () =>
    requireAuth(async () => {
      setOpen(true);
      setLoading(true);
      try {
        const res = await fetch("/api/collections", { cache: "no-store" });
        const data = await res.json();
        setCollections(data.collections ?? []);
      } finally {
        setLoading(false);
      }
    }, "Sign in to add recipes to collections.");

  const addTo = async (collectionId: string) => {
    const res = await fetch("/api/collections/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionId, recipeId }),
    });
    if (!res.ok) toast("Could not add", "error");
    else {
      toast("Added to collection", "success");
      setOpen(false);
    }
  };

  const createAndAdd = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.collection) {
      toast("Could not create collection", "error");
      return;
    }
    await addTo(data.collection.id);
    setNewName("");
  };

  return (
    <>
      <button onClick={openModal} className="btn-secondary h-8" aria-label="Add to collection">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Collection
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-bold">Add to collection</h2>
        {loading ? (
          <div className="mt-4 flex justify-center"><Spinner /></div>
        ) : (
          <>
            <div className="mt-4 max-h-56 space-y-2 overflow-auto">
              {collections.length ? (
                collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => addTo(c.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium hover:border-brand-400 dark:border-slate-700"
                  >
                    {c.name}
                    <span className="text-brand-600">Add</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">No collections yet — create one below.</p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New collection name"
                className="input"
              />
              <button onClick={createAndAdd} className="btn-primary shrink-0">Create</button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
