import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { passwordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const pwCheck = passwordSchema.safeParse(body?.password);
  if (!token || !pwCheck.success) {
    return NextResponse.json(
      { error: pwCheck.success ? "Invalid or missing token." : pwCheck.error.issues[0].message },
      { status: 400 }
    );
  }

  const row = await queryOne<{ user_id: string }>(
    "select user_id from password_resets where token = $1 and expires_at > now()",
    [token]
  );
  if (!row) {
    return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
  }

  const hash = await hashPassword(pwCheck.data);
  await query("update users set password_hash = $1 where id = $2", [hash, row.user_id]);
  await query("delete from password_resets where token = $1", [token]);
  await setSessionCookie(row.user_id);
  return NextResponse.json({ ok: true });
}
