import Link from "next/link";
import { getCategories } from "@/lib/data";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Categories</h1>
      <p className="mt-1 text-slate-500">Explore recipes by what you&apos;re in the mood for.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="card flex flex-col items-center gap-2 p-8 text-center transition-transform hover:-translate-y-1 hover:shadow-md"
          >
            <span className="text-4xl">{c.emoji ?? "🍴"}</span>
            <span className="font-semibold">{c.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
