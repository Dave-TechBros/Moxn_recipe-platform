"use client";

import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { SaveButton } from "@/components/recipe/SaveButton";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = (recipe.prep_minutes ?? 0) + (recipe.cook_minutes ?? 0);
  return (
    <div className="group card overflow-hidden card-hover hover:border-brand-200 dark:hover:border-brand-800">
      <Link href={`/recipes/${recipe.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              recipe.image_url ||
              `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60`
            }
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {recipe.category?.name && (
            <span className="chip absolute left-3 top-3 bg-white/95 text-slate-700 shadow-sm backdrop-blur dark:bg-slate-900/90 dark:text-slate-200">
              {recipe.category.emoji} {recipe.category.name}
            </span>
          )}
          <span className="chip absolute right-3 top-3 bg-brand-500/95 text-white shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.3 6.2 21l1.6-6.9L2.5 9.3l7-.6L12 2l2.5 6.7 7 .6-5.3 4.8L17.8 21z" /></svg>
            {(recipe.avg_rating ?? 0).toFixed(1)}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/recipes/${recipe.slug}`} className="min-w-0">
            <h3 className="truncate font-bold text-slate-900 group-hover:text-brand-600 dark:text-white">
              {recipe.title}
            </h3>
          </Link>
          <SaveButton recipeId={recipe.id} />
        </div>
        {recipe.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {recipe.summary}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Avatar src={recipe.author?.avatar_url} seed={recipe.author?.username} size={22} />
            <span className="truncate font-medium text-slate-600 dark:text-slate-300">{recipe.author?.display_name ?? "MOXN Pantry cook"}</span>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            {formatMinutes(totalTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
