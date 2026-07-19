import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const recipeId = new URL(request.url).searchParams.get("recipeId");
  if (!recipeId) return NextResponse.json({ saved: false });
  const row = await queryOne(
    "select 1 from saved_recipes where user_id = $1 and recipe_id = $2",
    [auth.userId, recipeId]
  );
  return NextResponse.json({ saved: !!row });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { recipeId } = await request.json().catch(() => ({}));
  if (!recipeId) return NextResponse.json({ error: "recipeId required" }, { status: 400 });
  await query(
    `insert into saved_recipes (user_id, recipe_id) values ($1, $2)
     on conflict do nothing`,
    [auth.userId, recipeId]
  );
  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { recipeId } = await request.json().catch(() => ({}));
  if (!recipeId) return NextResponse.json({ error: "recipeId required" }, { status: 400 });
  await query("delete from saved_recipes where user_id = $1 and recipe_id = $2", [
    auth.userId,
    recipeId,
  ]);
  return NextResponse.json({ saved: false });
}
