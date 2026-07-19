import Link from "next/link";
import { getFeaturedCreators } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";

export const metadata = { title: "Creators" };

export default async function CreatorsPage() {
  const creators = await getFeaturedCreators(24);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Creators</h1>
      <p className="mt-1 text-slate-500">Follow talented cooks and never miss a recipe.</p>
      {creators.length ? (
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {creators.map((c) => (
            <Link
              key={c.id}
              href={`/creators/${c.username}`}
              className="card flex flex-col items-center gap-3 p-6 text-center transition-transform hover:-translate-y-1"
            >
              <Avatar src={c.avatar_url} seed={c.username} size={72} />
              <div>
                <p className="truncate font-semibold">{c.display_name}</p>
                <p className="truncate text-xs text-slate-500">@{c.username}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-slate-500">No creators yet.</p>
      )}
    </div>
  );
}
