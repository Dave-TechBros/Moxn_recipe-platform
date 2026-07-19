import { query, queryOne } from "@/lib/db";
import type { Recipe, Category, Profile } from "@/lib/types";

const RECIPE_SELECT = `
  select
    r.*,
    row_to_json(u) as author,
    row_to_json(c) as category,
    coalesce(rt.avg_rating, 0) as avg_rating,
    coalesce(rt.rating_count, 0) as rating_count
  from recipes r
  join users u on u.id = r.author_id
  left join categories c on c.id = r.category_id
  left join lateral (
    select avg(rating)::numeric(3,2) as avg_rating, count(*) as rating_count
    from reviews where recipe_id = r.id
  ) rt on true
`;

function shape(row: Record<string, unknown>): Recipe {
  return {
    ...(row as unknown as Recipe),
    avg_rating: Number(row.avg_rating ?? 0),
    rating_count: Number(row.rating_count ?? 0),
    author: row.author as Profile,
    category: (row.category as Category) ?? undefined,
  };
}

export async function getFeaturedRecipes(limit = 6): Promise<Recipe[]> {
  try {
    const rows = await query<Record<string, unknown>>(
      `${RECIPE_SELECT} where r.is_published = true and r.featured = true
       order by r.created_at desc limit $1`,
      [limit]
    );
    return rows.map(shape);
  } catch {
    return [];
  }
}

export async function getRecipes({
  q,
  category,
  limit = 24,
}: { q?: string; category?: string; limit?: number } = {}): Promise<Recipe[]> {
  try {
    const conditions = ["r.is_published = true"];
    const params: unknown[] = [];
    if (q) {
      params.push(`%${q}%`);
      conditions.push(`r.title ilike $${params.length}`);
    }
    if (category) {
      params.push(category);
      conditions.push(`c.slug = $${params.length}`);
    }
    params.push(limit);
    const rows = await query<Record<string, unknown>>(
      `${RECIPE_SELECT} where ${conditions.join(" and ")}
       order by r.created_at desc limit $${params.length}`,
      params
    );
    return rows.map(shape);
  } catch {
    return [];
  }
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  try {
    const row = await queryOne<Record<string, unknown>>(
      `${RECIPE_SELECT} where r.slug = $1 limit 1`,
      [slug]
    );
    return row ? shape(row) : null;
  } catch {
    return null;
  }
}

export async function getRecipesByAuthor(authorId: string): Promise<Recipe[]> {
  try {
    const rows = await query<Record<string, unknown>>(
      `${RECIPE_SELECT} where r.author_id = $1 and r.is_published = true
       order by r.created_at desc`,
      [authorId]
    );
    return rows.map(shape);
  } catch {
    return [];
  }
}

export async function getSavedRecipes(userId: string): Promise<Recipe[]> {
  try {
    const rows = await query<Record<string, unknown>>(
      `${RECIPE_SELECT}
       join saved_recipes s on s.recipe_id = r.id and s.user_id = $1
       where r.is_published = true
       order by s.created_at desc`,
      [userId]
    );
    return rows.map(shape);
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await query<Category>("select * from categories order by name");
  } catch {
    return [];
  }
}

export async function getFeaturedCreators(limit = 8): Promise<Profile[]> {
  try {
    return await query<Profile>(
      `select id, username, display_name, bio, avatar_url, role, is_private,
              notify_email, notify_new_follower, notify_new_review, created_at
       from users where role in ('creator','admin') order by created_at limit $1`,
      [limit]
    );
  } catch {
    return [];
  }
}

export async function getCreatorByUsername(username: string): Promise<Profile | null> {
  try {
    return await queryOne<Profile>(
      `select id, username, display_name, bio, avatar_url, role, is_private,
              notify_email, notify_new_follower, notify_new_review, created_at
       from users where username = $1`,
      [username]
    );
  } catch {
    return null;
  }
}

export async function getFollowerCount(userId: string): Promise<number> {
  try {
    const row = await queryOne<{ count: string }>(
      "select count(*)::int as count from follows where following_id = $1",
      [userId]
    );
    return Number(row?.count ?? 0);
  } catch {
    return 0;
  }
}

export async function getSavedCount(userId: string): Promise<number> {
  try {
    const row = await queryOne<{ count: string }>(
      "select count(*)::int as count from saved_recipes where user_id = $1",
      [userId]
    );
    return Number(row?.count ?? 0);
  } catch {
    return 0;
  }
}

export type AdminStats = {
  users: number;
  creators: number;
  recipes: number;
  reviews: number;
  saved: number;
  follows: number;
  published: number;
  avgRating: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [u, c, r, rv, s, f, p, rt] = await Promise.all([
      queryOne<{ count: number }>("select count(*)::int as count from users"),
      queryOne<{ count: number }>("select count(*)::int as count from users where role in ('creator','admin')"),
      queryOne<{ count: number }>("select count(*)::int as count from recipes"),
      queryOne<{ count: number }>("select count(*)::int as count from reviews"),
      queryOne<{ count: number }>("select count(*)::int as count from saved_recipes"),
      queryOne<{ count: number }>("select count(*)::int as count from follows"),
      queryOne<{ count: number }>("select count(*)::int as count from recipes where is_published = true"),
      queryOne<{ avg: number }>("select coalesce(avg(rating)::numeric(3,2),0) as avg from reviews"),
    ]);
    return {
      users: Number(u?.count ?? 0),
      creators: Number(c?.count ?? 0),
      recipes: Number(r?.count ?? 0),
      reviews: Number(rv?.count ?? 0),
      saved: Number(s?.count ?? 0),
      follows: Number(f?.count ?? 0),
      published: Number(p?.count ?? 0),
      avgRating: Number(rt?.avg ?? 0),
    };
  } catch {
    return { users: 0, creators: 0, recipes: 0, reviews: 0, saved: 0, follows: 0, published: 0, avgRating: 0 };
  }
}

export type CategoryStat = { name: string; emoji: string | null; count: number };

export async function getRecipesPerCategory(): Promise<CategoryStat[]> {
  try {
    return await query<CategoryStat>(
      `select c.name, c.emoji, count(r.id)::int as count
       from categories c
       left join recipes r on r.category_id = c.id
       group by c.id, c.name, c.emoji
       order by count desc`
    );
  } catch {
    return [];
  }
}

export type GrowthPoint = { day: string; recipes: number; users: number };

export async function getGrowthSeries(days = 14): Promise<GrowthPoint[]> {
  try {
    return await query<GrowthPoint>(
      `with d as (select generate_series(now() - ($1 || ' days')::interval, now(), '1 day') as day)
       select to_char(d.day, 'MM-DD') as day,
              (select count(*) from recipes where created_at <= d.day + interval '1 day')::int as recipes,
              (select count(*) from users where created_at <= d.day + interval '1 day')::int as users
       from d order by d.day`,
      [days]
    );
  } catch {
    return [];
  }
}

export type TopRecipe = {
  id: string;
  title: string;
  slug: string;
  author: string;
  rating: number;
  ratings: number;
  saves: number;
};

export async function getTopRecipes(limit = 5): Promise<TopRecipe[]> {
  try {
    return await query<TopRecipe>(
      `select r.id, r.title, r.slug,
              u.display_name as author,
              coalesce(avg(rv.rating)::numeric(3,2),0)::float8 as rating,
              count(distinct rv.id)::int as ratings,
              count(distinct s.user_id)::int as saves
       from recipes r
       join users u on u.id = r.author_id
       left join reviews rv on rv.recipe_id = r.id
       left join saved_recipes s on s.recipe_id = r.id
       group by r.id, r.title, r.slug, u.display_name
       order by saves desc, rating desc
       limit $1`,
      [limit]
    );
  } catch {
    return [];
  }
}

export type ActivityItem = {
  id: string;
  type: "recipe" | "review" | "user" | "follow";
  text: string;
  at: string;
};

export async function getRecentActivity(limit = 8): Promise<ActivityItem[]> {
  try {
    const recipes = await query<{ id: string; title: string; author: string; at: string }>(
      `select r.id, r.title, u.display_name as author, to_char(r.created_at, 'YYYY-MM-DD HH24:MI') as at
       from recipes r join users u on u.id = r.author_id
       order by r.created_at desc limit $1`,
      [limit]
    );
    const reviews = await query<{ id: string; title: string; author: string; at: string }>(
      `select rv.id, r.title, u.display_name as author, to_char(rv.created_at, 'YYYY-MM-DD HH24:MI') as at
       from reviews rv join recipes r on r.id = rv.recipe_id join users u on u.id = rv.user_id
       order by rv.created_at desc limit $1`,
      [limit]
    );
    const items: ActivityItem[] = [
      ...recipes.map((x) => ({ id: x.id, type: "recipe" as const, text: `${x.author} published “${x.title}”`, at: x.at })),
      ...reviews.map((x) => ({ id: x.id, type: "review" as const, text: `${x.author} reviewed “${x.title}”`, at: x.at })),
    ];
    return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
  } catch {
    return [];
  }
}
