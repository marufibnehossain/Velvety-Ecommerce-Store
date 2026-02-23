# Launch checklist – Supabase + Render

Your `.env` is set to use **Supabase Postgres**. Follow these steps on your machine, then push to Git for a smooth Render deploy.

---

## 1. Connect and create tables

In the project folder, run:

```bash
npx prisma db push
```

- If you see **"Can't reach database server"** (even when the project is active): your network may be blocking Supabase. See **SUPABASE_CONNECTION_FIX.md** for:
  - Using the **Session pooler** URI from the dashboard (different host, often works when the default host is blocked).
  - Letting **Render** run `npx prisma db push` in the Release Command so the schema is applied from Render’s network.
- On success, all tables are created in Supabase.

---

## 2. Seed data (categories, products, coupons)

```bash
npx prisma db seed
```

This seeds categories, 6 products, and coupons (WELCOME10, SAVE5).

---

## 3. Build locally

```bash
npm run build
```

Fix any build errors before pushing.

---

## 4. Don’t commit `.env`

Your `.env` contains the Supabase URL and password. It’s in `.gitignore`, so it won’t be committed. **On Render**, set the same variables in the Web Service **Environment** (see RENDER_DEPLOYMENT.md).

---

## 5. Push to Git and deploy

```bash
git add .
git commit -m "Use Supabase Postgres, seed data, ready for Render"
git push origin main
```

Render will build and deploy. Ensure **Build Command** is:

`npm install && npx prisma generate && npm run build`

**Release Command** (optional): `npx prisma db push`  
(Only needed if you want Render to apply schema changes on each deploy; you already ran it locally.)

---

## 6. Environment variables on Render

In Render → your Web Service → **Environment**, set:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | `postgresql://postgres:G0EwRV%211KFrdynhsHz7g@db.szrvwrrqzudnzilpqjxi.supabase.co:5432/postgres?sslmode=require` |
| `NEXTAUTH_URL` | `https://YOUR-APP.onrender.com` |
| `NEXTAUTH_SECRET` | (e.g. from `openssl rand -base64 32`) |
| `RESEND_API_KEY` | your key |
| `RESEND_FROM_EMAIL` | your sender |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://szrvwrrqzudnzilpqjxi.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |

---

## Summary

1. **Local:** `npx prisma db push` → `npx prisma db seed` → `npm run build`
2. **Git:** commit and push (no `.env`)
3. **Render:** env vars set, deploy from `main`

If the app crashes on Render with **database or raw SQL errors**, the codebase may still be using SQLite-style SQL; those will need to be updated to PostgreSQL syntax.
