import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";
import { hashPassword } from "@/lib/auth";
import { emailSchema, passwordSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));

  if (body.email !== undefined) {
    const parsed = emailSchema.safeParse(body.email);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const exists = await queryOne(
      "select 1 from users where lower(email) = lower($1) and id <> $2",
      [parsed.data, auth.userId]
    );
    if (exists)
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    await query("update users set email = $1 where id = $2", [
      parsed.data.toLowerCase(),
      auth.userId,
    ]);
    return NextResponse.json({ ok: true });
  }

  if (body.password !== undefined) {
    const parsed = passwordSchema.safeParse(body.password);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const hash = await hashPassword(parsed.data);
    await query("update users set password_hash = $1 where id = $2", [hash, auth.userId]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}
