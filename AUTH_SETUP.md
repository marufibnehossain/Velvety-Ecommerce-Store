# Authentication setup (email verification)

This project uses **NextAuth.js** with **Credentials** (email + password), **Prisma** (SQLite), and **Resend** for verification emails.

## 1. Install dependencies

```bash
npm install
```

## 2. Environment variables

Copy `.env.example` to `.env` (or use the existing `.env`) and set:

- **`DATABASE_URL`** – SQLite: `file:./dev.db` (path relative to `prisma/` folder).
- **`NEXTAUTH_URL`** – Your app URL, e.g. `http://localhost:3000`.
- **`NEXTAUTH_SECRET`** – Random string for signing sessions (e.g. `openssl rand -base64 32`).
- **`RESEND_API_KEY`** (optional) – From [resend.com](https://resend.com). If unset, the verification link is printed in the server console instead of emailed.
- **`RESEND_FROM_EMAIL`** (optional) – Sender for verification emails; default is Resend’s test address.

## 3. Database

Create and migrate the database:

```bash
npx prisma migrate dev
```

Or, if you prefer to only apply existing migrations (e.g. in production):

```bash
npx prisma migrate deploy
npx prisma generate
```

## 4. Run the app

```bash
npm run dev
```

## Flow

1. **Register** (`/account/register`) – User submits email, password, optional name. A row is created in `User`, a `VerificationToken` is stored, and an email is sent (or the link is logged) with a link to `/api/auth/verify-email?token=...`.
2. **Verify** – User clicks the link. The token is validated, `User.emailVerified` is set, token is deleted, and the user is redirected to `/account/verify-email?success=1`.
3. **Login** (`/account/login`) – NextAuth Credentials provider checks email + password and that `emailVerified` is set. Session is created (JWT).
4. **Protected routes** – `/account`, `/account/orders`, `/account/settings` require a session; unauthenticated users are redirected to `/account/login`.

## Resend (optional)

- Sign up at [resend.com](https://resend.com).
- Create an API key and set `RESEND_API_KEY`.
- For production, verify a domain and set `RESEND_FROM_EMAIL` to an address on that domain.
- Without `RESEND_API_KEY`, the verification URL is logged in the terminal so you can copy it and open it in the browser (useful for local development).
