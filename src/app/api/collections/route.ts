import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";
import type { Collection } from "@/lib/types";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const collections = await query<Collection>(
    "select * from collections where owner_id = $1 order by created_at desc",
    [auth.userId]
  );
  return NextResponse.json({ collections });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { name, description } = await request.json().catch(() => ({}));
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const collection = await queryOne<Collection>(
    "insert into collections (owner_id, name, description) values ($1, $2, $3) returning *",
    [auth.userId, name.trim(), description?.trim() || null]
  );
  return NextResponse.json({ collection });
}

export async function DELETE(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await query("delete from collections where id = $1 and owner_id = $2", [id, auth.userId]);
  return NextResponse.json({ ok: true });
}
