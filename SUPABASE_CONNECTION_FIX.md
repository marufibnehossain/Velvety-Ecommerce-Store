# Supabase "Can't reach database server" – fix

Your project is **active** but your **network** (ISP, firewall, or VPN) is likely blocking outbound connections to Supabase on ports 5432 and 6543.

---

## Option 1: Try Session pooler (different host)

Session mode uses a different host (`aws-0-REGION.pooler.supabase.com`) that sometimes works when `db.xxx.supabase.co` is blocked.

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** → your project.
2. Click **Connect** (or **Project Settings** → **Database**).
3. Under **Connection string**, choose **Session mode** (or **Connection pooling** → Session).
4. Copy the **URI**. It looks like:
   ```text
   postgres://postgres.szrvwrrqzudnzilpqjxi:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your database password. If the password contains `!`, use `%21` instead.
6. Put it in `.env` as `DATABASE_URL`, and add `?sslmode=require` at the end if it’s not already there:
   ```env
   DATABASE_URL="postgres://postgres.szrvwrrqzudnzilpqjxi:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require"
   ```
7. Run again: `npx prisma db push`

---

## Option 2: Let Render run `db push` (no local connection)

If your machine can’t reach Supabase at all, you can push the schema **from Render** when you deploy.

1. **Don’t run `prisma db push` locally.** Commit and push your code to GitHub as-is.
2. On **Render**: in your Web Service → **Environment**, set `DATABASE_URL` to your Supabase connection string (same as in `.env`; use the **Transaction** or **Session** URI from the dashboard).
3. In **Settings** → **Build & Deploy** → **Release Command**, set:
   ```bash
   npx prisma db push
   ```
4. **Deploy.** Render will run the release command from its network (which can usually reach Supabase) and create the tables.
5. Then run the seed **once** from your side when you have a working connection (e.g. from another network), or add a one-off seed step in Render (e.g. release command: `npx prisma db push && npx prisma db seed` for the first deploy only).

---

## Check if your network can reach Supabase

In **PowerShell**:

```powershell
Test-NetConnection -ComputerName db.szrvwrrqzudnzilpqjxi.supabase.co -Port 6543
```

- If **TcpTestSucceeded : False**, your network is blocking the connection. Use **Option 1** (Session pooler) or **Option 2** (Render runs `db push`).
- Try from **mobile hotspot** or another network to confirm.
