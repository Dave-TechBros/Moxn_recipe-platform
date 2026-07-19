import { notFound } from "next/navigation";
import { getRecipes, getCategories } from "@/lib/data";
import { RecipeCard } from "@/components/recipe/RecipeCard";

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === params.slug);
  if (!category && categories.length) notFound();

  const recipes = await getRecipes({ category: params.slug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">
        {category?.emoji} {category?.name ?? params.slug}
      </h1>
      <p className="mt-1 text-slate-500">{recipes.length} recipes</p>
      {recipes.length ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-slate-500">No recipes in this category yet.</p>
      )}
    </div>
  );
}
