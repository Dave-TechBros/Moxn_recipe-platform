import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionProfile } from "@/lib/getSession";
import { getRecipesByAuthor, getFollowerCount, getSavedCount } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { RecipeCard } from "@/components/recipe/RecipeCard";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?redirect=/dashboard");

  const [myRecipes, followers, saved] = await Promise.all([
    getRecipesByAuthor(userId),
    getFollowerCount(userId),
    getSavedCount(userId),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.avatar_url} seed={profile?.username} size={64} />
          <div>
            <h1 className="text-2xl font-bold">Welcome, {profile?.display_name}</h1>
            <p className="text-slate-500">@{profile?.username}</p>
          </div>
        </div>
        <Link href="/create" className="btn-primary">Upload recipe</Link>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <StatCard label="Recipes" value={myRecipes.length} />
        <StatCard label="Followers" value={followers} />
        <StatCard label="Saved" value={saved} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold">Your recipes</h2>
        <Link href="/collections" className="btn-secondary">Collections</Link>
      </div>
      {myRecipes.length ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {myRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <div className="mt-6 card p-12 text-center text-slate-500">
          <p className="text-3xl">🍳</p>
          <p className="mt-2">You haven&apos;t published any recipes yet.</p>
          <Link href="/create" className="btn-primary mt-4 inline-flex">Create your first recipe</Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-6 text-center">
      <p className="text-3xl font-extrabold text-brand-600">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
