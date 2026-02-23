# Deploy without running `db push` on your PC

Your network can't reach Supabase. Use **Render** to create the tables and seed data when it deploys.

---

## 1. Push your code to GitHub

```bash
git add .
git commit -m "Ready for Render deploy"
git push origin main
```

Do **not** run `npx prisma db push` or `npx prisma db seed` locally.

---

## 2. On Render – Environment variables

In your Web Service → **Environment**, add (or update):

| Key | Value |
|-----|--------|
| `DATABASE_URL` | `postgresql://postgres:G0EwRV%211KFrdynhsHz7g@db.szrvwrrqzudnzilpqjxi.supabase.co:5432/postgres?sslmode=require` |
| `NEXTAUTH_URL` | `https://YOUR-SERVICE-NAME.onrender.com` (replace with your real Render URL after first deploy) |
| `NEXTAUTH_SECRET` | Any long random string (e.g. run `openssl rand -base64 32` and paste) |
| `RESEND_API_KEY` | Your Resend key |
| `RESEND_FROM_EMAIL` | e.g. `Velvety <onboarding@resend.dev>` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://szrvwrrqzudnzilpqjxi.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/publishable key |

---

## 3. On Render – Release Command

In **Settings** → **Build & Deploy** → **Release Command**, set:

```bash
npx prisma db push && npx prisma db seed
```

- **First deploy:** This creates all tables in Supabase and seeds categories, products, and coupons (Render’s network can reach Supabase).
- **Later deploys:** `db push` is safe to run again; seed will upsert so it won’t duplicate data.

Save the setting.

---

## 4. Deploy

- If the service already exists: **Manual Deploy** → **Deploy latest commit**.
- If you’re creating it: finish the setup and click **Create Web Service**.

Wait for the build and release to finish. Tables and seed data will be in Supabase.

---

## 5. Set NEXTAUTH_URL after first deploy

Once you see the live URL (e.g. `https://ecommerce-xxxx.onrender.com`):

1. In Render → **Environment**, set `NEXTAUTH_URL` to that URL.
2. Redeploy (or it may redeploy automatically when you change env vars).

---

**Summary:** Don’t run `prisma db push` or `prisma db seed` on your PC. Push code, set env vars and Release Command on Render, then deploy. Render will apply the schema and seed Supabase for you.
