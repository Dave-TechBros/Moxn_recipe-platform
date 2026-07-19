import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const info: Record<string, unknown> = {
    vercel: process.env.VERCEL ? "true" : "false",
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasPostgresPrisma: !!process.env.POSTGRES_PRISMA_URL,
    connectionResolved:
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      "LOCAL_FALLBACK",
  };

  try {
    const r = await pool.query("select 1 as ok");
    info.dbReachable = r.rows[0]?.ok === 1;
    const c = await pool.query("select count(*)::int as n from recipes where is_published = true");
    info.publishedRecipes = c.rows[0]?.n;
    info.status = "ok";
    return NextResponse.json(info);
  } catch (e) {
    info.dbReachable = false;
    info.error = e instanceof Error ? e.message : String(e);
    info.status = "db_error";
    return NextResponse.json(info, { status: 500 });
  }
}
