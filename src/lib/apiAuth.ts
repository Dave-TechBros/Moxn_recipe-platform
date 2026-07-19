import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";

export async function requireUser(): Promise<
  { userId: string } | { response: NextResponse }
> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId };
}
