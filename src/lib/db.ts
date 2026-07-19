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

// Vercel's serverless functions can only reach Postgres over SSL, and a
// manually-set DATABASE_URL often omits ?sslmode=require. Force TLS in
// production so connections don't silently fail (which surfaces as 500s on
// every query — e.g. "could not log in" and an empty landing page).
function resolvePoolConfig(): ConstructorParameters<typeof Pool>[0] {
  const connectionString = resolveConnectionString();
  const config: ConstructorParameters<typeof Pool>[0] = {
    connectionString,
    max: 10,
  };
  if (process.env.NODE_ENV === "production" && !/sslmode=/i.test(connectionString)) {
    config.ssl = { rejectUnauthorized: false };
  }
  return config;
}

const pool =
  global._moxnPool ??
  new Pool(resolvePoolConfig());

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
