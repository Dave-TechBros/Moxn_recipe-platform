# MOXN Recipe Platform

A premium recipe platform built with **Next.js 14 (App Router)**, **TypeScript**,
**Tailwind CSS**, and **Supabase** (auth, Postgres, storage).

## Features

- **Public landing page** — anyone can browse featured recipes, categories,
  search, recipe previews, and featured creators without logging in.
- **Auth-gated actions** — saving recipes, collections, ratings, reviews,
  following creators, uploading recipes, dashboards and profiles all prompt
  visitors to sign in (modal or dedicated page), never a raw error.
- **Protected recipe content** — previews are public; the full ingredient list
  and step-by-step method are unlocked only after sign-in (blurred teaser +
  friendly CTA).
- **Complete authentication** — login, sign-up, forgot-password, reset-password,
  email confirmation callback, Zod validation, loading/error/success states, and
  redirect-back to the originally requested page.
- **Illustrated default avatars** (DiceBear) auto-assigned on signup, with
  device upload (preview, progress bar, type/size validation) that instantly
  replaces the default.
- **Working Settings page** — edit profile, change avatar, display name, email,
  password, notification preferences, appearance (Light/Dark/System), privacy,
  and logout.
- **Core platform** — recipe browsing/search/categories, recipe creation,
  collections, reviews & ratings, creator dashboard, and admin dashboard.
- **MOXN brand logo** — a minimal "M" whose leg grows into a herb leaf; adapts to
  light/dark themes. Favicon (`icon.svg`) and app icon (`apple-icon`) included.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

At <https://supabase.com>, create a project, then in **SQL Editor** run:

1. `supabase/schema.sql` — tables, RLS policies, the auto-profile trigger, the
   ratings view, and the `avatars` / `recipe-images` storage buckets.
2. `supabase/seed.sql` — seeds recipe categories.

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in from
**Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

In **Authentication → URL Configuration**, add
`http://localhost:3000/auth/callback` and `http://localhost:3000/reset-password`
to the redirect allow-list.

### 4. Run

```bash
npm run dev       # http://localhost:3000
```

### Make yourself an admin / creator

After signing up, in Supabase run:

```sql
update public.profiles set role = 'admin' where username = 'your_username';
```

## Scripts

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start dev server                |
| `npm run build`     | Production build                |
| `npm run start`     | Serve production build          |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript type checking        |

## Notes

- The app degrades gracefully if Supabase is not yet configured (pages render
  with empty states instead of crashing), so you can preview the UI immediately.
- Route protection is enforced in `src/middleware.ts` (server) and via
  `requireAuth()` login prompts in the client `AuthProvider`.
