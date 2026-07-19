import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _moxnPool: Pool | undefined;
}

// Resolve the database connection string. Vercel Postgres exposes
// POSTGRES_URL / POSTGRES_PRISMA_URL; local/dev uses DATABASE_URL.
function resolveConnectionString(): string {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    "postgresql://moxn:moxn_dev_pw@localhost:5432/moxn"
  );
}

const pool =
  global._moxnPool ??
  new Pool({
    connectionString: resolveConnectionString(),
    max: 10,
  });

if (process.env.NODE_ENV !== "production") global._moxnPool = pool;

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await pool.query(text, params as never[]);
  return res.rows as T[];
}

export async function queryOne<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export { pool };
