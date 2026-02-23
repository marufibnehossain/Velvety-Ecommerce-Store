# Deploy to Vercel

## Prerequisites

- **Git** – your project in a Git repo (GitHub, GitLab, or Bitbucket).
- **Hosted database** – SQLite file (`dev.db`) does **not** work on Vercel. Use one of the options below for production.

---

## Step 1: Push your code to GitHub

If the project is not in a repo yet:

```bash
cd "d:\My Projects\Cursor\Ecommerce"
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on [GitHub](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set up a production database

Choose **one** of these:

### Option A: Turso (SQLite-compatible, minimal change)

1. Sign up at [turso.tech](https://turso.tech).
2. Install Turso CLI and create a DB:
   ```bash
   npm i -g turso-cli
   turso auth login
   turso db create ecommerce-prod --region <e.g. ord>
   turso db show ecommerce-prod
   ```
3. Get the DB URL and auth token:
   ```bash
   turso db show ecommerce-prod --url
   turso db tokens create ecommerce-prod
   ```
4. For Prisma + Turso you’ll use `@prisma/adapter-libsql` and set:
   - `DATABASE_URL` = the Turso URL (starts with `libsql://`).
   - Or use Turso’s env vars as required by the adapter (see Turso + Prisma docs).

### Option B: Vercel Postgres (Neon) or Neon directly

1. In the Vercel dashboard: Project → **Storage** → **Create Database** → **Postgres** (or sign up at [neon.tech](https://neon.tech)).
2. Copy the connection string (e.g. `postgresql://...`).
3. In `prisma/schema.prisma` change:
   - `provider = "sqlite"` → `provider = "postgresql"`
   - `url = env("DATABASE_URL")` stays.
4. Run a new migration for PostgreSQL and fix any SQLite-only syntax.
5. Set `DATABASE_URL` in Vercel to that Postgres URL.

---

## Step 3: Create the project on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. Click **Add New…** → **Project**.
3. **Import** your Git repository (e.g. `YOUR_USERNAME/YOUR_REPO_NAME`).
4. Leave **Framework Preset** as **Next.js** and **Root Directory** as `.` unless you use a monorepo.

---

## Step 4: Configure build and environment variables

### Build & Output

- **Build Command:** `prisma generate && next build` (or leave default if your `package.json` `"build"` already runs this).
- **Output Directory:** leave default (Vercel detects Next.js).
- **Install Command:** `npm install` (default).

### Environment variables

In the Vercel project: **Settings** → **Environment Variables**. Add:

| Name | Value | Notes |
|------|--------|--------|
| `DATABASE_URL` | Your production DB URL | Turso `libsql://...` or Postgres `postgresql://...` |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Replace with your real Vercel URL after first deploy |
| `NEXTAUTH_SECRET` | Random string | e.g. `openssl rand -base64 32` |
| `RESEND_API_KEY` | Your Resend API key | For emails |
| `RESEND_FROM_EMAIL` | Your verified sender | e.g. `Velvety <onboarding@resend.dev>` |

Optional:

- `NEXT_PUBLIC_SITE_URL` – same as `NEXTAUTH_URL` if you use it in the app.

Apply to **Production** (and Preview if you want).

---

## Step 5: Deploy

1. Click **Deploy** (or push to `main` if you connected a repo).
2. Wait for the build. If it fails, check the build logs (often missing env vars or DB schema mismatch).
3. After success, open **Visit** or your project URL (e.g. `https://your-project.vercel.app`).

---

## Step 6: Point NEXTAUTH_URL to your live URL

1. After the first deploy, copy your live URL (e.g. `https://ecommerce-xxx.vercel.app`).
2. In Vercel: **Settings** → **Environment Variables** → edit `NEXTAUTH_URL` and set it to that URL.
3. Redeploy (e.g. **Deployments** → **⋯** → **Redeploy**) so the new value is used.

---

## Step 7: Run migrations in production

Migrations are **not** run automatically on Vercel. Use one of these:

- **Turso / hosted SQLite:**  
  Run your migration against the production `DATABASE_URL` from your machine (with `.env` pointing at prod DB) or from a one-off script/CI step.
- **Postgres (Vercel/Neon):**  
  ```bash
  DATABASE_URL="postgresql://..." npx prisma migrate deploy
  ```
  Run this locally with prod `DATABASE_URL` or in a deploy hook / CI job.

---

## Troubleshooting

- **Build fails on Prisma:**  
  Ensure `postinstall` runs `prisma generate` (you have it). If you use Turso/Postgres, ensure the correct `provider` is in `schema.prisma` and `DATABASE_URL` is set in Vercel.
- **“Database not found” / connection errors:**  
  Check `DATABASE_URL` and that the DB is created and reachable from the internet. For Turso, use the URL and token they give you.
- **NextAuth redirect / session issues:**  
  Set `NEXTAUTH_URL` to the exact Vercel URL (with `https://`) and redeploy.
- **Images 404:**  
  If you store uploads on disk, use Vercel Blob or S3; local files are not persisted on serverless.

---

## Summary checklist

- [ ] Code in GitHub (or other connected Git provider).
- [ ] Production database created (Turso or Postgres).
- [ ] `DATABASE_URL` and other env vars set in Vercel.
- [ ] `NEXTAUTH_URL` set to your Vercel app URL.
- [ ] Migrations run against production DB.
- [ ] Deploy and test login, checkout, and email.
