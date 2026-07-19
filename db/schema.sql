-- MOXN Recipe Platform — PostgreSQL schema (self-hosted, no Supabase)

create extension if not exists "pgcrypto";

-- =========================================================
-- Users (auth + profile combined)
-- =========================================================
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

-- Password reset tokens
create table if not exists password_resets (
  token text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Categories
-- =========================================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  emoji text
);

-- =========================================================
-- Recipes
-- =========================================================
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
  ingredients text[] not null default '{}',
  steps text[] not null default '{}',
  is_published boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Reviews & ratings
-- =========================================================
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (recipe_id, user_id)
);

-- =========================================================
-- Saved recipes (bookmarks)
-- =========================================================
create table if not exists saved_recipes (
  user_id uuid not null references users(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

-- =========================================================
-- Collections
-- =========================================================
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  name text not null,
  description text,
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists collection_recipes (
  collection_id uuid not null references collections(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, recipe_id)
);

-- =========================================================
-- Follows
-- =========================================================
create table if not exists follows (
  follower_id uuid not null references users(id) on delete cascade,
  following_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

-- =========================================================
-- Indexes
-- =========================================================
create index if not exists idx_recipes_author on recipes(author_id);
create index if not exists idx_recipes_category on recipes(category_id);
create index if not exists idx_recipes_published on recipes(is_published);
create index if not exists idx_reviews_recipe on reviews(recipe_id);
create index if not exists idx_follows_following on follows(following_id);
