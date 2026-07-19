import { NextResponse } from "next/server";
import { createUser, setSessionCookie } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const result = await createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    displayName: parsed.data.displayName,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  await setSessionCookie(result.id);
  return NextResponse.json({ ok: true });
}
