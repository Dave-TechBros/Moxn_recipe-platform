# MOXN Pantry — Recipe Platform

A premium recipe platform built as a **single Next.js 14 (App Router) + TypeScript** app.
The **frontend (React pages) and the backend (API route handlers under `src/app/api/...`)
are compiled together by `next build` and deployed as one unit** — there is no
separate backend service to run or connect. Vercel hosts the whole thing; the app
talks to its own API at the same origin (`/api/...`), so there is no CORS or
cross-origin API URL to configure.

Data lives in **PostgreSQL** (self-hosted, or Vercel Postgres / Supabase / Neon —
anything with a connection string). Auth is custom: `bcryptjs` passwords +
`jose` JWT session cookies. No Supabase required.

## Features

- **Public landing page** — browse featured recipes, categories, search, and
  featured creators without logging in.
- **Auth-gated actions** — saving, collections, ratings, reviews, following,
  uploading, dashboards, and profiles prompt a sign-in modal, never a raw error.
- **Protected recipe content** — previews are public; full ingredients & steps
  unlock after sign-in (blurred teaser + CTA).
- **Complete auth** — login, sign-up, forgot/reset password, Zod validation,
  redirect-back to the originally requested page.
- **Default avatars** (DiceBear) auto-assigned on signup, with device upload
  (preview, progress, validation) that instantly replaces the default.
- **Settings** — profile, avatar, display name, email, password, notification
  preferences, appearance, privacy, logout.
- **Core platform** — recipe browse/search/categories, creation, collections,
  reviews & ratings, creator + admin dashboards.

## Local development

```bash
npm install
cp .env.example .env.local      # then edit DATABASE_URL / AUTH_SECRET
docker run --name moxn-postgres -e POSTGRES_PASSWORD=moxn_dev_pw \
  -e POSTGRES_USER=moxn -e POSTGRES_DB=moxn -p 5432:5432 -d postgres:16
npm run db:setup               # creates tables + seeds 20 recipes (idempotent)
npm run dev                    # http://localhost:3000
```

Demo accounts after seeding: `demo@moxn.app` / `Password123` (admin),
`olive@moxn.app` / `Password123` (creator).

### Scripts

| Command            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `npm run dev`      | Start dev server                                     |
| `npm run build`    | Production build                                     |
| `npm run start`    | Serve production build                                |
| `npm run lint`     | ESLint                                               |
| `npm run typecheck`| TypeScript type check                                |
| `npm run db:setup`| Apply `db/schema.sql` + seed only if DB is empty     |
| `npm run db:seed`  | Force re-seed starter data (idempotent)             |
| `npm run vercel-build` | `next build` + `db:setup` (used by Vercel)    |

## Environment variables

| Var                        | Required | Notes                                                        |
| -------------------------- | -------- | ------------------------------------------------------------- |
| `DATABASE_URL`            | **Yes**  | Postgres connection string. On Vercel, set it to the value of `POSTGRES_URL` from Storage. Must NOT include surrounding quotes. Add `?sslmode=require` for serverless. |
| `AUTH_SECRET`            | **Yes**  | Long random string used to sign session JWTs.                  |
| `NEXT_PUBLIC_SITE_URL`   | No       | Public site URL (used in reset-password emails). Defaults to localhost. |
| `BLOB_READ_WRITE_TOKEN`   | No*      | Vercel Blob token — enables avatar/recipe image uploads in production. Without it, uploads fall back to local disk (dev only; ephemeral on Vercel). |

\* Required only if you want image uploads to persist in production.

## Deploying to Vercel (one-click after setup)

This is a single Next.js app — frontend and backend deploy together.

1. **Create a database.** In the Vercel dashboard → **Storage → Create → Postgres**,
   link it to the project. (Or bring your own Postgres / Supabase / Neon.)
2. **Add environment variables** (Settings → Environment Variables):
   - `DATABASE_URL` = the `POSTGRES_URL` value shown on the Storage page
     (**paste it WITHOUT the surrounding quote marks**).
   - `AUTH_SECRET` = any long random string.
   - `BLOB_READ_WRITE_TOKEN` = the token from **Storage → Blob** (for uploads).
3. **Redeploy.** Vercel runs `vercel-build` → `next build` then `db:setup`,
   which **automatically creates the tables and seeds 20 recipes** on first
   deploy. No manual seeding step is needed.
4. **Verify.** Open `<your-app>.vercel.app/api/health` — you should see
   `dbReachable: true` and `publishedRecipes: 20`.

### Troubleshooting the deployment

- **Landing page empty / login fails** → almost always the database. Open
  `/api/health`:
  - `hasDatabaseUrl: false` → `DATABASE_URL` is not set in Vercel.
  - `connectionResolved` contains `localhost` → `DATABASE_URL` is missing; the
    app fell back to the local string (unreachable from Vercel).
  - `error` mentions `ENOTFOUND` / `getaddrinfo` → the connection string has
    stray quote marks or a bad hostname. Re-paste `POSTGRES_URL` **without quotes**.
  - `dbReachable: true` but `publishedRecipes: 0` → DB is empty; redeploy
    (vercel-build re-seeds only when empty) or run `npm run db:setup` locally
    with `DATABASE_URL` pointed at production.
- **Uploads don't appear in production** → set `BLOB_READ_WRITE_TOKEN`
  (local-disk uploads don't persist on Vercel's filesystem).

## Architecture notes

- `src/lib/db.ts` resolves the connection string from `DATABASE_URL`,
  then `POSTGRES_URL_NON_POOLING` / `POSTGRES_PRISMA_URL` / `POSTGRES_URL`,
  strips accidental quote marks, and forces SSL in production.
- Auth context (`src/components/auth/AuthProvider.tsx`) is the single source of
  truth for the logged-in user; `updateProfile()` patches and immediately
  updates global state so edits reflect everywhere without a refresh.
- Route protection: `src/middleware.ts` (server) guards `/dashboard`,
  `/settings`, `/create`, `/collections`, `/admin`, `/saved`; client components
  use `requireAuth()` to prompt sign-in.
