import fs from "fs";
import pkg from "pg";
const { Pool } = pkg;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  console.error(
    "No database connection string found. Set DATABASE_URL (or POSTGRES_URL) and retry."
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString.trim().replace(/^["']|["']$/g, ""),
  ssl:
    process.env.NODE_ENV === "production" &&
    !/sslmode=/i.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
});

async function main() {
  const schema = fs.readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
  console.log("Applying schema…");
  await pool.query(schema);

  const { rows } = await pool.query("select count(*)::int as n from recipes");
  if (rows[0].n > 0) {
    console.log(`Database already has ${rows[0].n} recipes — skipping seed.`);
    await pool.end();
    return;
  }

  console.log("Seeding starter data…");
  // Re-run the seed script logic by importing it.
  await import("./seed.mjs");
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
