# Host on Render

Steps to run your Next.js ecommerce app on **Render** with an **external PostgreSQL database** (e.g. Neon or Supabase — both have free tiers).

---

## 1. Create a PostgreSQL database (external)

Use **one** of these — both have free tiers and work from Render.

### Option A: Neon (recommended)

1. Go to [neon.tech](https://neon.tech) and sign up (GitHub is fine).
2. **New Project** → name it (e.g. `ecommerce`), pick a region, then **Create project**.
3. On the project dashboard you’ll see a connection string like:
   `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
4. Copy that string — this is your `DATABASE_URL`.

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and sign up.
2. **New project** → name, database password, region → **Create new project**.
3. In the sidebar: **Project Settings** → **Database**.
4. Under **Connection string** choose **URI** and copy it. It looks like:
   `postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres`
5. Replace `[password]` with your database password. This is your `DATABASE_URL`.

---

## 2. Push your code to GitHub

Your app must be in a Git repo (GitHub, GitLab, or Bitbucket) so Render can deploy from it.

```bash
cd "d:\My Projects\Cursor\Ecommerce"
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on [GitHub](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 3. Create a Web Service on Render

1. In the Render dashboard: **New +** → **Web Service**.
2. Connect your GitHub account if needed, then select the repo (e.g. `YOUR_USERNAME/YOUR_REPO_NAME`).
3. Configure:
   - **Name:** e.g. `ecommerce`
   - **Region:** same as your DB if possible
   - **Branch:** `main`
   - **Runtime:** **Node**
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command:**
     ```bash
     npm run start
     ```
   - **Instance type:** Free or paid, as you prefer

4. **Environment** (see step 4 below): add env vars before first deploy.

5. **Advanced** (optional):
   - **Release Command** (runs after build, before new version goes live):
     ```bash
     npx prisma db push
     ```
     This applies your Prisma schema to the Render Postgres DB. Use this for a fresh DB; if you prefer migrations, use `npx prisma migrate deploy` and run migrations yourself.

6. Click **Create Web Service**. Render will clone the repo, run the build, and start the app.

---

## 4. Set environment variables

In the Web Service → **Environment** tab, add:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | The connection string from Neon or Supabase (step 1; starts with `postgresql://`) |
| `NEXTAUTH_URL` | Your Render app URL, e.g. `https://ecommerce-xxxx.onrender.com` (update after first deploy if needed) |
| `NEXTAUTH_SECRET` | A long random string, e.g. from `openssl rand -base64 32` |
| `RESEND_API_KEY` | Your Resend API key (for emails) |
| `RESEND_FROM_EMAIL` | Your verified sender, e.g. `Velvety <onboarding@resend.dev>` |

- Save each variable; Render will redeploy when you add/change env vars if auto-deploy is on.

---

## 5. First deploy and schema

1. Trigger a deploy (e.g. **Manual Deploy** → **Deploy latest commit**).
2. If you set **Release Command** to `npx prisma db push`, Render will run it after the build and create/update tables in your external DB. If not, run once from your machine:
   ```bash
   set DATABASE_URL=postgresql://...   # your Neon or Supabase URL
   npx prisma db push
   ```
3. Wait for the deploy to finish and open your app URL (e.g. `https://ecommerce-xxxx.onrender.com`).
4. If you didn’t set `NEXTAUTH_URL` yet, set it to this URL and redeploy.

---

## 6. Optional: seed the database

To load categories/products (or any seed data) into your external DB, run the seed locally against the production DB **once**:

```bash
set DATABASE_URL=postgresql://...   # your Neon or Supabase URL
npx prisma db seed
```

(On macOS/Linux use `export DATABASE_URL=...`.)

---

## 7. Auto-deploys

With **Auto-Deploy** enabled (default), every push to the connected branch (e.g. `main`) triggers a new build and deploy. No extra steps needed.

---

## Troubleshooting

- **Build fails on Prisma**  
  Ensure **Build Command** includes `npx prisma generate` and `DATABASE_URL` is set (even if only for the Release Command).

- **“Database does not exist” / connection errors**  
  Check that `DATABASE_URL` is the exact connection string from Neon or Supabase (including `?sslmode=require` for Neon if present). Ensure the DB is running and the password has no special characters that need URL-encoding.

- **NextAuth redirect / session issues**  
  Set `NEXTAUTH_URL` to the **exact** Render URL (e.g. `https://ecommerce-xxxx.onrender.com`) and redeploy.

- **Raw SQL errors (e.g. `datetime`, `?` placeholders)**  
  The codebase may still contain SQLite-style raw SQL. For Render Postgres you need PostgreSQL syntax (e.g. `NOW()` instead of `datetime('now')`, `$1`/`$2` instead of `?`, `ON CONFLICT DO NOTHING` instead of `INSERT OR IGNORE`). Ask for a follow-up pass to make all raw queries Postgres-compatible if you see such errors.

- **Free tier spin-down**  
  On the free plan, the Web Service sleeps after inactivity. The first request after sleep can take 30–60 seconds; that’s expected.

---

## Summary

1. Create a **PostgreSQL** database on **Neon** or **Supabase** (free tier) and copy the connection string.
2. Create a **Web Service** on Render linked to your GitHub repo; set **Build** to `npm install && npx prisma generate && npm run build` and **Start** to `npm run start`.
3. Add **Environment variables** in Render: `DATABASE_URL` (Neon/Supabase URL), `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, Resend vars.
4. Use **Release Command** `npx prisma db push` (or run it once locally) so the schema exists in your external DB.
5. Deploy and set `NEXTAUTH_URL` to your Render app URL.

Your app uses **PostgreSQL** in `prisma/schema.prisma`, so it works with Neon or Supabase. If you see raw-SQL errors after deploy, the code may need to be updated from SQLite-style to PostgreSQL syntax.
