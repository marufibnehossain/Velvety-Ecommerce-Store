# context.md — Next.js eCommerce (Figma-accurate build)

## Goal
Build a modern, editorial, nature-inspired skincare eCommerce website in **Next.js (App Router) + TypeScript**.  
The **Home page design reference is provided as an image** (Home v1). Use it as the single source of truth for visual style, spacing, typography, and component patterns.  
Then **design and implement the rest of the pages + full responsiveness** while staying perfectly consistent with this design system.

---

## Reference (Home v1)
You have a full-page Home screenshot (sage green + cream palette, serif display headlines, minimal UI, soft product photography, airy spacing).  
Match its:
- Typography hierarchy
- Grid/layout rhythm
- Button styles (minimal rectangular buttons + thin arrow)
- Card styles + shadows (very subtle)
- Section spacing and “editorial” feel
- Icons/illustrations vibe (thin, delicate, minimal)

---

## Tech Stack (fixed)
- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS
- Use `next/image` for all images
- Data can be mocked for now (no backend needed), but structure code as if it can be connected later.

---

## Brand & Visual System (derive from Home v1)
### Colors (approximate tokens; keep them consistent site-wide)
Use a soft, calm palette:
- `--bg`: warm off-white / cream
- `--surface`: slightly darker cream for panels
- `--sage-1`: light sage background blocks
- `--sage-2`: deeper sage for bars/footers
- `--text`: dark grey-green (not pure black)
- `--muted`: soft grey-green for helper text
- `--border`: very light grey-green hairline borders

> Do NOT use loud colors. Keep everything muted and premium.

### Typography
Use an editorial pairing:
- **Display Serif** for headlines (high contrast, elegant)
- **Clean Sans** for UI labels, small copy, chips, nav, meta
Rules:
- Headlines are large, airy, and line-height is generous.
- Body copy is readable with subtle contrast (never pure black).
- Section eyebrow labels are small caps / spaced tracking.

### Layout / Spacing
- Desktop grid feels like 12-col with wide margins.
- Sections use large vertical padding.
- Cards are evenly spaced, aligned, and never crowded.
- Use large “hero split” layouts and multi-panel sections like the Home reference.

### UI Components Look
- Buttons: minimal, light surface, thin border, arrow indicator.
- Chips/tags (filters): pill-like, light border, subtle hover.
- Product cards: image-first, name + price + rating row.
- Ratings: star row with small count at right.
- Logos row (as-seen-in): low-contrast brand marks.

---

## Pages to Build (must match Home style)
### 1) Home (already referenced)
Implement sections similar to the reference:
- Header (logo + nav)
- Hero split (product bottle on left; leaf image + headline + CTA on right)
- Two-column “inspired by…” + benefits list
- Featured products (3-up)
- About split (headline left, paragraph right)
- “As seen in” logo row
- Process teaser banner
- All products section with filter chips + product grid
- “Skin diagnosis in 3 minutes” service CTA
- Testimonial section
- 3 feature/service cards row
- Newsletter banner
- Footer (multi-column links)

### 2) Collection / Products Listing
Route: `/products`
- Page hero (simple editorial heading)
- Filter chips + sort dropdown (UI only)
- Product grid (2–4 columns responsive)
- Pagination UI (or “Load more”)

### 3) Product Detail
Route: `/product/[slug]`
Must include:
- Product gallery (1 large + thumbnails)
- Name, price, rating, short description
- Variant selector (if any), quantity stepper
- Add to cart button (style consistent)
- Tabs/accordion: Ingredients, How to use, Shipping & returns
- Related products carousel/grid

### 4) Cart
Route: `/cart`
- Minimal cart table/list
- Quantity controls + remove
- Summary card (subtotal, shipping estimate, total)
- CTA to checkout
- Empty state consistent with brand

### 5) Checkout (UI-only)
Route: `/checkout`
- 2-column layout (form left, summary right)
- Steps: Contact → Delivery → Payment
- Form inputs: minimalist borders, clean focus states
- Success page after submit: `/checkout/success`

### 6) Account
Routes:
- `/account/login`
- `/account/register`
- `/account` (dashboard)
- `/account/orders`
- `/account/settings`
All in the same calm editorial style (no dashboard “SaaS look”).

### 7) About
Route: `/about`
- Brand story, values, process
- Use the same split layouts and big serif headings.

### 8) Contact
Route: `/contact`
- Minimal form + brand info
- Optional: FAQ accordion

### 9) Search
Route: `/search?q=...`
- Search input + results grid, empty states

---

## Component System (build reusable UI)
Create in `/components`:
- `Header`
- `Footer`
- `NewsletterBar`
- `Button` (primary/secondary/text-with-arrow)
- `ProductCard`
- `RatingStars`
- `FilterChips`
- `QuantityStepper`
- `Accordion/Tabs`
- `SectionHeading` (eyebrow + title + subtitle)
- `LogoRow`
- `TestimonialCard`

Keep styles consistent: same radii, borders, hover, spacing.

---

## Responsiveness Rules (must design + implement)
### Desktop (≥1024)
- Keep the Home layout close to reference.
- Multi-column sections remain multi-column.

### Tablet (768–1023)
- Reduce hero split spacing, keep 2 columns where possible.
- Product grids go to 2 columns.

### Mobile (≤767)
- Hero becomes stacked:
  - headline + CTA first
  - images after (or vice versa, whichever matches best)
- Convert nav to hamburger menu (minimal drawer)
- Chips wrap to multiple lines
- Product grid becomes 1 column or 2 tight columns depending on card density (prefer 1 for premium feel)
- Maintain big serif headings but scale down gracefully.

---

## Data (mock now, structured for later)
Create `/lib/data.ts` with:
- `products[]` (id, slug, name, price, compareAt?, rating, reviewCount, images[], category, tags[], shortDesc, longDesc, ingredients, howToUse)
- `categories[]`
Use placeholder images (local `/public/images/...`) and consistent naming.

Cart state:
- Use a lightweight client state (Context or Zustand). Keep logic clean.

---

## Interaction & UX
- Hover states: subtle (slight lift, border darken, soft shadow)
- Focus states: accessible but not loud (soft outline)
- Loading states: skeletons for grids/cards
- Empty states: calm message + CTA back to products

---

## Implementation Notes
- Use Server Components for pages where possible.
- Use Client Components only for interactive parts (cart, filters, accordions).
- Keep CSS purely Tailwind (avoid random inline styles).
- Ensure semantic HTML and accessibility (labels, aria, keyboard nav).

---

## Your Task (what to do now)
1) Implement the Home page to match the reference image as closely as possible.
2) Then design + build **all remaining pages** listed above.
3) Ensure full responsiveness with the exact same design language across pages.
4) Keep everything production-ready and componentized.

Deliver clean code, sensible file structure, and consistent UI patterns.