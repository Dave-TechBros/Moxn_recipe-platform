import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _moxnPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var _dbReady: Promise<void> | undefined;
}

function resolveConnectionString(): string {
  const raw =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    "postgresql://moxn:moxn_dev_pw@localhost:5432/moxn";
  return raw.trim().replace(/^["']|["']$/g, "");
}

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

// Schema SQL — idempotent (uses IF NOT EXISTS).
const SCHEMA = `
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  username text unique not null,
  display_name text not null default 'New Cook',
  bio text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','creator','admin')),
  is_private boolean not null default false,
  notify_email boolean not null default true,
  notify_new_follower boolean not null default true,
  notify_new_review boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists password_resets (
  token text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  emoji text
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references users(id) on delete cascade,
  title text not null,
  slug text unique not null,
  summary text,
  description text,
  image_url text,
  category_id uuid references categories(id) on delete set null,
  prep_minutes int,
  cook_minutes int,
  servings int,
  difficulty text check (difficulty in ('easy','medium','hard')),
  ingredients text[],
  steps text[],
  is_published boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists saved_recipes (
  user_id uuid not null references users(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists collection_recipes (
  collection_id uuid not null references collections(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, recipe_id)
);

create table if not exists follows (
  follower_id uuid not null references users(id) on delete cascade,
  following_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  body text,
  created_at timestamptz not null default now(),
  unique (recipe_id, user_id)
);

create index if not exists idx_recipes_slug on recipes(slug);
create index if not exists idx_recipes_author on recipes(author_id);
create index if not exists idx_recipes_published on recipes(is_published, created_at);
create index if not exists idx_saved_user on saved_recipes(user_id);
create index if not exists idx_reviews_recipe on reviews(recipe_id);
create index if not exists idx_follows_follower on follows(follower_id);
create index if not exists idx_follows_following on follows(following_id);
`;

// Lazily ensure the schema exists on first query in production.
// (Does NOT seed data — seed is done once via POST /api/seed or `npm run db:seed`.)
async function ensureDb(): Promise<void> {
  if (global._dbReady) return global._dbReady;
  global._dbReady = pool.query(SCHEMA).then(() => {});
  return global._dbReady;
}

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  if (process.env.NODE_ENV === "production") await ensureDb();
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
