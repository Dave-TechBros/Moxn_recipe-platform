"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import type { Collection } from "@/lib/types";

export function CollectionsClient({ initial }: { initial: Collection[] }) {
  const { toast } = useToast();
  const [collections, setCollections] = useState(initial);
  const [name, setName] = useState("");

  async function create() {
    if (!name.trim()) return;
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.collection) {
      toast("Could not create", "error");
      return;
    }
    setCollections([data.collection as Collection, ...collections]);
    setName("");
    toast("Collection created", "success");
  }

  async function remove(id: string) {
    const res = await fetch("/api/collections", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) toast("Could not delete", "error");
    else {
      setCollections(collections.filter((c) => c.id !== id));
      toast("Collection deleted", "info");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Your collections</h1>
      <p className="mt-1 text-slate-500">Organise recipes into your own cookbooks.</p>

      <div className="mt-6 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New collection name" className="input max-w-sm" />
        <button onClick={create} className="btn-primary">Create</button>
      </div>

      {collections.length ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{c.name}</h3>
                <button onClick={() => remove(c.id)} className="text-sm text-red-600 hover:underline">Delete</button>
              </div>
              {c.description && <p className="mt-1 text-sm text-slate-500">{c.description}</p>}
              <p className="mt-3 text-xs text-slate-400">{c.is_private ? "Private" : "Public"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-slate-500">No collections yet. Create your first one above!</p>
      )}
    </div>
  );
}
