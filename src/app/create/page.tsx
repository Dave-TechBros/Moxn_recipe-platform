import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/getSession";
import { getCategories } from "@/lib/data";
import { CreateRecipeForm } from "./CreateRecipeForm";

export const metadata = { title: "Create recipe" };

export default async function CreatePage() {
  const { userId } = await getSessionProfile();
  if (!userId) redirect("/login?redirect=/create");
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Share a recipe</h1>
      <p className="mt-1 text-slate-500">Add your recipe to MOXN Pantry for the world to enjoy.</p>
      <CreateRecipeForm categories={categories} />
    </div>
  );
}
