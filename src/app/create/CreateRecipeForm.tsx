"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { Field } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import type { Category } from "@/lib/types";

export function CreateRecipeForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [prep, setPrep] = useState("");
  const [cook, setCook] = useState("");
  const [servings, setServings] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast("Image must be under 5 MB", "error");
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }
    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const form = new FormData();
        form.append("file", imageFile);
        form.append("folder", "recipes");
        const up = await fetch("/api/upload", { method: "POST", body: form });
        if (up.ok) imageUrl = (await up.json()).url;
      }

      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          description,
          imageUrl,
          categoryId: categoryId || null,
          prepMinutes: prep,
          cookMinutes: cook,
          servings,
          difficulty,
          ingredients: ingredients.split("\n").map((s) => s.trim()).filter(Boolean),
          steps: steps.split("\n").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      toast("Recipe published!", "success");
      router.push(`/recipes/${data.slug}`);
      router.refresh();
    } catch (err) {
      setError((err as Error)?.message || "Could not save recipe. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>
      )}

      <div>
        <label className="label">Cover image</label>
        <div className="flex items-center gap-4">
          <div className="h-24 w-32 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
            {imagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
            )}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary">
            Choose image
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
        </div>
      </div>

      <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Creamy garlic pasta" />
      <Field label="Short summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A quick, comforting weeknight dinner" />

      <div>
        <label className="label">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="label">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")} className="input">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <Field label="Servings" type="number" value={servings} onChange={(e) => setServings(e.target.value)} min={1} />
        <div />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Prep (min)" type="number" value={prep} onChange={(e) => setPrep(e.target.value)} min={0} />
        <Field label="Cook (min)" type="number" value={cook} onChange={(e) => setCook(e.target.value)} min={0} />
      </div>

      <div>
        <label className="label">Ingredients (one per line)</label>
        <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={5} className="input resize-none" placeholder={"200g pasta\n2 cloves garlic\n…"} />
      </div>

      <div>
        <label className="label">Steps (one per line)</label>
        <textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={6} className="input resize-none" placeholder={"Boil the pasta.\nSauté the garlic.\n…"} />
      </div>

      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? <Spinner /> : "Publish recipe"}
      </button>
    </form>
  );
}
