import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { query, queryOne } from "@/lib/db";
import { forgotSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const user = await queryOne<{ id: string }>(
    "select id from users where lower(email) = lower($1)",
    [parsed.data.email]
  );

  // Always respond success (avoid email enumeration).
  if (user) {
    const token = randomBytes(24).toString("hex");
    await query(
      `insert into password_resets (token, user_id, expires_at)
       values ($1, $2, now() + interval '1 hour')`,
      [token, user.id]
    );
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;
    // No email provider configured; log the link and return it in dev so it's usable.
    console.log(`[MOXN] Password reset link for ${parsed.data.email}: ${resetUrl}`);
    return NextResponse.json({
      ok: true,
      devResetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
    });
  }

  return NextResponse.json({ ok: true });
}
