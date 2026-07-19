import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";
import type { Profile } from "@/lib/types";

const ALLOWED = new Set([
  "display_name",
  "bio",
  "avatar_url",
  "is_private",
  "notify_email",
  "notify_new_follower",
  "notify_new_review",
]);

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));

  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED.has(key)) continue;
    if (key === "display_name" && (!value || String(value).trim().length < 2)) {
      return NextResponse.json({ error: "Display name must be at least 2 characters" }, { status: 400 });
    }
    params.push(key === "bio" ? String(value).trim() || null : value);
    sets.push(`${key} = $${params.length}`);
  }
  if (!sets.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  params.push(auth.userId);
  await query(`update users set ${sets.join(", ")} where id = $${params.length}`, params);

  const updated = await queryOne<Profile>(
    `select id, username, display_name, bio, avatar_url, role, is_private,
            notify_email, notify_new_follower, notify_new_review, created_at
     from users where id = $1`,
    [auth.userId]
  );
  return NextResponse.json({ ok: true, profile: updated });
}
