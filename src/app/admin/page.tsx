import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionProfile } from "@/lib/getSession";
import {
  getAdminStats,
  getRecipesPerCategory,
  getGrowthSeries,
  getTopRecipes,
  getRecentActivity,
} from "@/lib/data";

export const metadata = { title: "Admin" };

const ICONS = {
  users: "👥",
  recipes: "🍽️",
  reviews: "⭐",
  creators: "👩‍🍳",
  saved: "🔖",
  follows: "💞",
  published: "✅",
  rating: "📈",
};

export default async function AdminPage() {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?redirect=/admin");
  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Admins only</h1>
        <p className="mt-2 text-slate-500">You don&apos;t have permission to view this page.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">Back home</Link>
      </div>
    );
  }

  const [stats, cats, growth, top, activity] = await Promise.all([
    getAdminStats(),
    getRecipesPerCategory(),
    getGrowthSeries(14),
    getTopRecipes(5),
    getRecentActivity(8),
  ]);

  const maxCat = Math.max(1, ...cats.map((c) => c.count));
  const maxSeries = Math.max(1, ...growth.map((g) => g.recipes));

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
          <p className="mt-1 text-slate-500">Live overview of the MOXN Pantry platform.</p>
        </div>
        <Link href="/recipes" className="btn-secondary">View site →</Link>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat icon={ICONS.users} label="Total users" value={stats.users} tone="brand" />
        <Stat icon={ICONS.creators} label="Creators" value={stats.creators} tone="leaf" />
        <Stat icon={ICONS.recipes} label="Recipes" value={stats.recipes} tone="brand" />
        <Stat icon={ICONS.published} label="Published" value={stats.published} tone="leaf" />
        <Stat icon={ICONS.reviews} label="Reviews" value={stats.reviews} tone="brand" />
        <Stat icon={ICONS.saved} label="Saves" value={stats.saved} tone="harvest" />
        <Stat icon={ICONS.follows} label="Follows" value={stats.follows} tone="harvest" />
        <Stat icon={ICONS.rating} label="Avg rating" value={stats.avgRating.toFixed(1)} tone="leaf" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Growth chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold">Growth — last 14 days</h2>
          <p className="text-sm text-slate-500">Cumulative recipes &amp; users over time.</p>
          <div className="mt-6 flex h-48 items-end gap-1.5">
            {growth.map((g) => (
              <div key={g.day} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-500 to-brand-300"
                  style={{ height: `${(g.recipes / maxSeries) * 100}%`, minHeight: 4 }}
                  title={`${g.recipes} recipes`}
                />
                <span className="text-[10px] text-slate-400">{g.day.slice(3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card p-6">
          <h2 className="font-bold">Recipes by category</h2>
          <div className="mt-4 space-y-3">
            {cats.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{c.emoji} {c.name}</span>
                  <span className="text-slate-400">{c.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-leaf-500"
                    style={{ width: `${(c.count / maxCat) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top recipes */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold">Top recipes</h2>
          <p className="text-sm text-slate-500">Ranked by saves and ratings.</p>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {top.length ? (
              top.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 dark:bg-brand-950/40">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/recipes/${r.slug}`} className="block truncate font-medium hover:text-brand-600">
                      {r.title}
                    </Link>
                    <p className="truncate text-xs text-slate-400">by {r.author}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm text-slate-500">
                    <span title="rating">⭐ {Number(r.rating).toFixed(1)}</span>
                    <span title="saves">🔖 {r.saves}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-slate-500">No recipes yet.</p>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card p-6">
          <h2 className="font-bold">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {activity.length ? (
              activity.map((a) => (
                <div key={`${a.type}-${a.id}`} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5">
                    {a.type === "recipe" ? "🍽️" : a.type === "review" ? "⭐" : a.type === "user" ? "👤" : "💞"}
                  </span>
                  <p className="min-w-0 flex-1 text-slate-600 dark:text-slate-300">{a.text}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">Nothing yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  brand: "from-brand-50 to-orange-50 text-brand-600 dark:from-brand-950/40 dark:to-transparent",
  leaf: "from-leaf-50 to-emerald-50 text-leaf-600 dark:from-leaf-950/40 dark:to-transparent",
  harvest: "from-harvest-50 to-amber-50 text-harvest-600 dark:from-harvest-950/40 dark:to-transparent",
};

function Stat({ icon, label, value, tone }: { icon: string; label: string; value: string | number; tone: keyof typeof TONES }) {
  return (
    <div className={`card bg-gradient-to-br ${TONES[tone]} p-5`}>
      <div className="text-2xl">{icon}</div>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
