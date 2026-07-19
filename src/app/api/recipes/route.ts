import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { requireUser } from "@/lib/apiAuth";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const b = await request.json().catch(() => ({}));

  if (!b.title || b.title.trim().length < 3)
    return NextResponse.json({ error: "Title must be at least 3 characters" }, { status: 400 });

  const slug = `${slugify(b.title)}-${Math.random().toString(36).slice(2, 7)}`;
  const ingredients: string[] = Array.isArray(b.ingredients) ? b.ingredients : [];
  const steps: string[] = Array.isArray(b.steps) ? b.steps : [];

  const row = await queryOne<{ slug: string }>(
    `insert into recipes
      (author_id, title, slug, summary, description, image_url, category_id,
       prep_minutes, cook_minutes, servings, difficulty, ingredients, steps, is_published)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true)
     returning slug`,
    [
      auth.userId,
      b.title.trim(),
      slug,
      b.summary?.trim() || null,
      b.description?.trim() || null,
      b.imageUrl || null,
      b.categoryId || null,
      b.prepMinutes ? Number(b.prepMinutes) : null,
      b.cookMinutes ? Number(b.cookMinutes) : null,
      b.servings ? Number(b.servings) : null,
      b.difficulty || null,
      ingredients,
      steps,
    ]
  );
  return NextResponse.json({ slug: row!.slug });
}
