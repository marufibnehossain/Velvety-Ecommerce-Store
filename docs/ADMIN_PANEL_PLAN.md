# Admin Panel Plan — Velvety eCommerce

## First-time setup: make a user admin

After migrations, set one user’s role to `ADMIN`:

- **Prisma Studio:** `npx prisma studio` → open `User` → edit the user → set `role` to `ADMIN`.
- **SQL:** `npx prisma db execute --stdin` and run:  
  `UPDATE User SET role = 'ADMIN' WHERE email = 'your@email.com';`

Then sign in at `/admin/login` with that email and password.

---

## 1. Scope & access

- **Who is admin:** Users with `role = "ADMIN"` (add `role` to `User` in Prisma). Alternatively: env list of admin emails (`ADMIN_EMAILS=admin@example.com`) checked in middleware/API.
- **Where:** All routes under `/admin/*`. Not linked from the main site header; admins go directly to `/admin` or `/admin/login`.
- **Auth:** Reuse NextAuth. Admin layout checks session + role; redirect to `/admin/login` if unauthenticated, or `/account` if authenticated but not admin. Optional: separate admin login page that only allows admin users.

---

## 2. Data model changes (Prisma)

| Change | Purpose |
|--------|--------|
| **User.role** | `String?` (e.g. `"CUSTOMER"` \| `"ADMIN"`). Default `"CUSTOMER"`. |
| **Order** (new) | Persist checkout: `id`, `email`, `name`, `address`, `city`, `zip`, `country`, `subtotal`, `discount`, `shipping`, `total`, `couponCode?`, `status` (e.g. PENDING / PAID / SHIPPED / CANCELLED), `createdAt`, `updatedAt`. Optional: `OrderItem[]` (productId, name, price, quantity). |
| **Product** (new, optional for v1) | Move products from `src/lib/data.ts` into DB: same fields as current `Product` interface (name, slug, price, compareAt, stock, images, category, tags, shortDesc, etc.). Categories can stay in code or become a table. |

- **Phase 1 (minimal):** Add `User.role`, add `Order` + `OrderItem`, keep products in code. Admin can manage **orders** and **coupons** only.
- **Phase 2:** Add `Product` (and optionally `Category`) to DB, migrate seed data, switch storefront to read from DB. Admin can then **CRUD products** and see stock.

---

## 3. Routes & layout

- **`/admin`** — Dashboard (stats: recent orders, revenue, low-stock if products in DB).
- **`/admin/login`** — Login (credentials); only users with `role === "ADMIN"` can proceed; others redirect to `/account`.
- **`/admin/orders`** — List orders (table: date, email, total, status). Filter by status, date range.
- **`/admin/orders/[id]`** — Order detail (shipping, items, totals, status). Update status (e.g. mark Shipped).
- **`/admin/coupons`** — List coupons; create / edit / delete (code, type, value, minOrderCents, expiresAt).
- **`/admin/products`** (Phase 2) — List products; create / edit / delete; stock and basic fields.
- **`/admin/users`** (optional) — Read-only list of users (email, name, createdAt); no password or token exposure.

**Layout:** Shared admin layout (`/admin/layout.tsx`): sidebar with links (Dashboard, Orders, Coupons, Products, Users) + main content area. Reuse design tokens (sage/cream, same fonts) for consistency; tables and forms minimal and readable.

---

## 4. Features by section

| Section | Actions |
|--------|--------|
| **Dashboard** | Summary cards (e.g. orders today/week, revenue, pending orders). List of 5–10 most recent orders with link to detail. |
| **Orders** | Table: id, date, customer email/name, total, status. Filters. Click row → detail. Detail: full address, line items, subtotal/discount/shipping/total, status dropdown → save. |
| **Coupons** | Table: code, type, value, min order, expires. Buttons: New coupon. Create/Edit form: code, type (percent/fixed), value, min order (optional), expiry (optional). Delete with confirm. |
| **Products** (Phase 2) | Table: name, slug, price, stock, category. New/Edit: all current product fields; image URLs or upload later. Delete with confirm. Stock editable in list or detail. |
| **Users** (optional) | Table: email, name, createdAt. No edit/delete in v1 unless required. |

---

## 5. Implementation order

1. **Auth & role**  
   - Add `role` to `User` (migration).  
   - In NextAuth callback, put `role` in JWT/session.  
   - Create `/admin/login` and `/admin/layout.tsx`: require session + `role === "ADMIN"`, else redirect.  
   - Seed or manually set one user to `ADMIN`.

2. **Orders in DB**  
   - Add `Order` and `OrderItem` to Prisma; run migration.  
   - On checkout “Place order”: create `Order` + `OrderItem` records, then send confirmation email.  
   - Admin: `GET /api/admin/orders` (list with filters), `GET /api/admin/orders/[id]`, `PATCH /api/admin/orders/[id]` (status only or basic fields).

3. **Admin orders UI**  
   - `/admin/orders` list page (table + filters).  
   - `/admin/orders/[id]` detail page with status update.

4. **Admin coupons UI**  
   - `GET/POST /api/admin/coupons`, `GET/PATCH/DELETE /api/admin/coupons/[id]`.  
   - `/admin/coupons` list + create/edit form (modal or separate page).  
   - Delete with confirmation.

5. **Dashboard**  
   - Aggregate orders (count, revenue) in API; dashboard page with summary + recent orders.

6. **Products in DB (Phase 2)**  
   - Add `Product` (and optionally `Category`) model; migration; seed from current `data.ts`.  
   - Storefront: replace `data.ts` reads with Prisma (getProductBySlug, list products, etc.).  
   - Admin: CRUD API + `/admin/products` list/create/edit/delete.

7. **Users list (optional)**  
   - `GET /api/admin/users` (paginated, no sensitive fields).  
   - `/admin/users` read-only table.

---

## 6. UI guidelines

- Reuse existing design: sage/cream palette, Playfair Display + Source Sans 3, minimal buttons and borders.
- Sidebar: compact nav (icons + labels optional), “Velvety Admin” or logo at top; logout to `/account` or sign out.
- Tables: light borders, alternating row background optional; sortable headers if needed.
- Forms: same input/button styles as storefront; clear validation messages.
- No public link to `/admin` from main site; admins bookmark or type URL. Optional: small “Admin” link in footer for admins only (hidden for non-admins).

---

## 7. Security

- All `/admin/*` and `/api/admin/*` must check session + `role === "ADMIN"`.
- Use a single middleware or layout + API route checks; never trust client-only checks.
- Admin APIs: return 403 if not admin; 401 if not authenticated.

---

## 8. File structure (suggested)

```
src/app/admin/
  layout.tsx          # Auth + role check, sidebar
  page.tsx            # Dashboard
  login/page.tsx
  orders/page.tsx
  orders/[id]/page.tsx
  coupons/page.tsx
  products/page.tsx   # Phase 2
  users/page.tsx      # Optional

src/app/api/admin/
  orders/route.ts
  orders/[id]/route.ts
  coupons/route.ts
  coupons/[id]/route.ts
  products/...        # Phase 2
  users/route.ts      # Optional
```

---

This plan keeps Phase 1 small (orders + coupons + dashboard) and defers product CRUD until products live in the DB. You can implement step-by-step following the order above.
