import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }
  const user = await queryOne<{ id: string; password_hash: string }>(
    "select id, password_hash from users where lower(email) = lower($1)",
    [parsed.data.email]
  );
  if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
