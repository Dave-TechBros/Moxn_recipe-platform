import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/getSession";
import { getSavedRecipes } from "@/lib/data";
import { RecipeCard } from "@/components/recipe/RecipeCard";

export const metadata = { title: "Saved recipes" };

export default async function SavedPage() {
  const { userId } = await getSessionProfile();
  if (!userId) redirect("/login?redirect=/saved");

  const recipes = await getSavedRecipes(userId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Saved recipes</h1>
      <p className="mt-1 text-slate-500">Recipes you&apos;ve bookmarked to cook later.</p>
      {recipes.length ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-slate-500">No saved recipes yet. Start exploring!</p>
      )}
    </div>
  );
}
