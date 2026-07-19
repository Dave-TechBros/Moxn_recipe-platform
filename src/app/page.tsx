import Link from "next/link";
import { getFeaturedRecipes, getRecipes, getCategories, getFeaturedCreators } from "@/lib/data";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { Avatar } from "@/components/ui/Avatar";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { OpenAuthButton } from "@/components/auth/OpenAuthButton";

export default async function HomePage() {
  const [featured, latest, categories, creators] = await Promise.all([
    getFeaturedRecipes(3),
    getRecipes({ limit: 8 }),
    getCategories(),
    getFeaturedCreators(6),
  ]);

  const displayFeatured = featured.length ? featured : latest.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-brand-100 via-[#fffdf8] to-harvest-100 dark:from-brand-950/40 dark:via-slate-950 dark:to-harvest-950/30" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.12] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container-page py-20 text-center sm:py-28">
          <span className="chip mx-auto bg-white/80 text-brand-700 shadow-sm backdrop-blur dark:bg-slate-900/70 dark:text-brand-300">
            🌿 A fresh take on recipes
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Cook more, waste less — with{" "}
            <span className="text-gradient">recipes from the garden</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
            Bright, seasonal recipes from passionate creators. Browse freely —
            join MOXN Pantry to save, rate, and build your own collections.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <HeroSearch />
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="chip border border-slate-200 bg-white/70 text-slate-700 backdrop-blur transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
              >
                {c.emoji} {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured recipes — large display */}
      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Featured recipes</h2>
            <p className="mt-1 text-slate-500">Hand-picked favourites from our community</p>
          </div>
          <Link href="/recipes" className="btn-secondary shrink-0">Browse all</Link>
        </div>
        {displayFeatured.length ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {displayFeatured.map((r, i) => (
              <div key={r.id} className={i === 0 ? "lg:row-span-2" : ""}>
                <RecipeCard recipe={r} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* Latest recipes */}
      <section className="border-y border-slate-200/70 bg-white/60 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="container-page py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Fresh from the kitchen</h2>
              <p className="mt-1 text-slate-500">The latest recipes added to MOXN Pantry Pantry</p>
            </div>
            <Link href="/recipes" className="btn-secondary shrink-0">See all</Link>
          </div>
          {latest.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Explore by category</h2>
          <p className="mt-1 text-slate-500">Find exactly what you&apos;re craving</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="card flex flex-col items-center gap-2 p-5 text-center transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl dark:bg-brand-950/40">
                {c.emoji ?? "🍴"}
              </span>
              <span className="text-sm font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured creators */}
      <section className="container-page pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Featured creators</h2>
            <p className="mt-1 text-slate-500">Talented cooks worth following</p>
          </div>
          <Link href="/creators" className="btn-secondary shrink-0">See all</Link>
        </div>
        {creators.length ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {creators.map((c) => (
              <Link
                key={c.id}
                href={`/creators/${c.username}`}
                className="card flex flex-col items-center gap-3 p-6 text-center transition-all hover:-translate-y-1 hover:shadow-md hover:shadow-brand-500/10"
              >
                <Avatar src={c.avatar_url} seed={c.username} size={64} />
                <div>
                  <p className="truncate font-semibold">{c.display_name}</p>
                  <p className="truncate text-xs text-slate-500">@{c.username}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState label="No creators yet — be the first!" />
        )}
      </section>

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-emerald-500 to-harvest-500 px-8 py-14 text-center text-white shadow-lg shadow-brand-600/20">
          <h2 className="text-3xl font-bold">Ready to start cooking?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/90">
            Join MOXN Pantry free to save recipes, follow creators, and share your own
            culinary creations with the world.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <OpenAuthButton
              tab="signup"
              className="btn bg-white text-brand-700 hover:bg-slate-100"
            >
              Create free account
            </OpenAuthButton>
            <Link href="/recipes" className="btn border border-white/40 text-white hover:bg-white/10">
              Keep browsing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ label = "No recipes yet. Once the database is connected and seeded, they'll appear here." }: { label?: string }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-12 text-center text-slate-500">
      <span className="text-3xl">🍳</span>
      <p>{label}</p>
    </div>
  );
}
