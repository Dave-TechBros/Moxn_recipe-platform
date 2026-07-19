import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";
import type { Review } from "@/lib/types";

export async function GET(request: Request) {
  const recipeId = new URL(request.url).searchParams.get("recipeId");
  if (!recipeId) return NextResponse.json({ reviews: [] });
  const reviews = await query<Review>(
    `select rv.*, row_to_json(u) as author
     from reviews rv join users u on u.id = rv.user_id
     where rv.recipe_id = $1 order by rv.created_at desc`,
    [recipeId]
  );
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { recipeId, rating, body } = await request.json().catch(() => ({}));
  const r = Number(rating);
  if (!recipeId || !(r >= 1 && r <= 5))
    return NextResponse.json({ error: "Rating 1-5 required" }, { status: 400 });
  await query(
    `insert into reviews (recipe_id, user_id, rating, body)
     values ($1, $2, $3, $4)
     on conflict (recipe_id, user_id)
     do update set rating = excluded.rating, body = excluded.body, created_at = now()`,
    [recipeId, auth.userId, r, (body || "").trim() || null]
  );
  return NextResponse.json({ ok: true });
}
