import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/getSession";
import { SettingsClient } from "./SettingsClient";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { userId, profile } = await getSessionProfile();
  if (!userId) redirect("/login?redirect=/settings");
  return <SettingsClient initialProfile={profile} />;
}
