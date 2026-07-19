import { notFound } from "next/navigation";
import { getCreatorByUsername, getRecipesByAuthor, getFollowerCount } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/creator/FollowButton";
import { RecipeCard } from "@/components/recipe/RecipeCard";

export default async function CreatorPage({
  params,
}: {
  params: { username: string };
}) {
  const creator = await getCreatorByUsername(params.username);
  if (!creator) notFound();

  const [recipes, followerCount] = await Promise.all([
    getRecipesByAuthor(creator.id),
    getFollowerCount(creator.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="card flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
        <Avatar src={creator.avatar_url} seed={creator.username} size={96} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{creator.display_name}</h1>
          <p className="text-slate-500">@{creator.username}</p>
          {creator.bio && <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">{creator.bio}</p>}
          <div className="mt-3 flex justify-center gap-6 text-sm sm:justify-start">
            <span><strong>{recipes.length}</strong> recipes</span>
            <span><strong>{followerCount}</strong> followers</span>
          </div>
        </div>
        <FollowButton creatorId={creator.id} />
      </div>

      <h2 className="mt-10 text-xl font-bold">Recipes by {creator.display_name}</h2>
      {recipes.length ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-slate-500">No published recipes yet.</p>
      )}
    </div>
  );
}
