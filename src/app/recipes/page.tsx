import Link from "next/link";
import { getRecipes, getCategories } from "@/lib/data";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { HeroSearch } from "@/components/landing/HeroSearch";

export const metadata = { title: "Recipes" };

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const q = searchParams.q;
  const category = searchParams.category;
  const [recipes, categories] = await Promise.all([
    getRecipes({ q, category }),
    getCategories(),
  ]);

  return (
    <div className="container-page py-10">
      <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {q ? `Results for “${q}”` : "All recipes"}
          </h1>
          <p className="mt-1 text-slate-500">Browse freely — sign in to save your favourites.</p>
        </div>
        <div className="mt-4 w-full max-w-md sm:mt-0 sm:w-80">
          <HeroSearch />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/recipes"
          className={`chip border ${!category ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40" : "border-slate-200 dark:border-slate-700"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/recipes?category=${c.slug}`}
            className={`chip border ${category === c.slug ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40" : "border-slate-200 dark:border-slate-700"}`}
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      {recipes.length ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center text-slate-500">
          <p className="text-3xl">🔍</p>
          <p className="mt-2">No recipes found. Try a different search or category.</p>
        </div>
      )}
    </div>
  );
}
