import { getCurrentProfile, getCurrentUserId } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export async function getSessionProfile(): Promise<{
  userId: string | null;
  profile: Profile | null;
}> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { userId: null, profile: null };
    const profile = await getCurrentProfile();
    return { userId, profile };
  } catch {
    return { userId: null, profile: null };
  }
}
