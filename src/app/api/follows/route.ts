import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const creatorId = new URL(request.url).searchParams.get("creatorId");
  if (!creatorId) return NextResponse.json({ following: false });
  const row = await queryOne(
    "select 1 from follows where follower_id = $1 and following_id = $2",
    [auth.userId, creatorId]
  );
  return NextResponse.json({ following: !!row });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { creatorId } = await request.json().catch(() => ({}));
  if (!creatorId || creatorId === auth.userId)
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await query(
    `insert into follows (follower_id, following_id) values ($1, $2)
     on conflict do nothing`,
    [auth.userId, creatorId]
  );
  return NextResponse.json({ following: true });
}

export async function DELETE(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { creatorId } = await request.json().catch(() => ({}));
  if (!creatorId) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await query("delete from follows where follower_id = $1 and following_id = $2", [
    auth.userId,
    creatorId,
  ]);
  return NextResponse.json({ following: false });
}
