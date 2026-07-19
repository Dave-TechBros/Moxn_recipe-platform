import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/getSession";
import { query } from "@/lib/db";
import { CollectionsClient } from "./CollectionsClient";
import type { Collection } from "@/lib/types";

export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const { userId } = await getSessionProfile();
  if (!userId) redirect("/login?redirect=/collections");

  let collections: Collection[] = [];
  try {
    collections = await query<Collection>(
      "select * from collections where owner_id = $1 order by created_at desc",
      [userId]
    );
  } catch {
    /* db not ready */
  }

  return <CollectionsClient initial={collections} />;
}
