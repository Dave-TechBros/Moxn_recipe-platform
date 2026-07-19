import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getRecipeBySlug } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { SaveButton } from "@/components/recipe/SaveButton";
import { ProtectedSteps } from "@/components/recipe/ProtectedSteps";
import { Reviews } from "@/components/recipe/Reviews";
import { AddToCollection } from "@/components/collection/AddToCollection";
import { formatMinutes } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const recipe = await getRecipeBySlug(params.slug);
  return { title: recipe?.title ?? "Recipe" };
}

export default async function RecipePage({
  params,
}: {
  params: { slug: string };
}) {
  const recipe = await getRecipeBySlug(params.slug);
  if (!recipe) notFound();

  const total = (recipe.prep_minutes ?? 0) + (recipe.cook_minutes ?? 0);

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/recipes" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        Back to recipes
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          {recipe.category?.name && (
            <Link
              href={`/categories/${recipe.category.slug}`}
              className="chip bg-orange-50 text-brand-700 hover:bg-orange-100 dark:bg-brand-950/40 dark:text-brand-300"
            >
              {recipe.category.emoji} {recipe.category.name}
            </Link>
          )}
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{recipe.title}</h1>
          {recipe.summary && <p className="mt-3 max-w-2xl text-lg text-slate-500 dark:text-slate-400">{recipe.summary}</p>}
        </div>
        <div className="flex gap-2">
          <SaveButton recipeId={recipe.id} showLabel />
          <AddToCollection recipeId={recipe.id} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link href={`/creators/${recipe.author?.username}`} className="flex items-center gap-2 rounded-full bg-slate-50 py-1 pl-1 pr-4 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
          <Avatar src={recipe.author?.avatar_url} seed={recipe.author?.username} size={36} />
          <div>
            <p className="text-sm font-semibold">{recipe.author?.display_name ?? "MOXN Pantry cook"}</p>
            <p className="text-xs text-slate-400">@{recipe.author?.username}</p>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.3 6.2 21l1.6-6.9L2.5 9.3l7-.6L12 2l2.5 6.7 7 .6-5.3 4.8L17.8 21z" /></svg>
          <strong>{(recipe.avg_rating ?? 0).toFixed(1)}</strong>
          <span className="font-normal text-slate-400">({recipe.rating_count ?? 0})</span>
        </div>
      </div>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100 shadow-lg shadow-orange-900/5 dark:bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={recipe.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=70"}
          alt={recipe.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Prep" value={formatMinutes(recipe.prep_minutes)} />
        <Stat label="Cook" value={formatMinutes(recipe.cook_minutes)} />
        <Stat label="Total" value={formatMinutes(total)} />
        <Stat label="Servings" value={recipe.servings ? String(recipe.servings) : "—"} />
      </div>

      {recipe.description && (
        <p className="mt-6 leading-relaxed text-slate-700 dark:text-slate-300">{recipe.description}</p>
      )}

      <div className="mt-8">
        <ProtectedSteps steps={recipe.steps ?? []} ingredients={recipe.ingredients ?? []} />
      </div>

      <Reviews recipeId={recipe.id} />
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-brand-600 dark:text-brand-400">{value}</p>
    </div>
  );
}
