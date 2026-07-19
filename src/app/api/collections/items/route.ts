import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { collectionId, recipeId } = await request.json().catch(() => ({}));
  if (!collectionId || !recipeId)
    return NextResponse.json({ error: "collectionId and recipeId required" }, { status: 400 });

  const owns = await queryOne(
    "select 1 from collections where id = $1 and owner_id = $2",
    [collectionId, auth.userId]
  );
  if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await query(
    `insert into collection_recipes (collection_id, recipe_id) values ($1, $2)
     on conflict do nothing`,
    [collectionId, recipeId]
  );
  return NextResponse.json({ ok: true });
}
