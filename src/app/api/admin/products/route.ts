import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Use raw SQL since Prisma client might not be regenerated
    const products = await prisma.$queryRawUnsafe<Array<{
      id: string;
      slug: string;
      productCode: string | null;
      name: string;
      priceCents: number;
      compareAtCents: number | null;
      rating: number;
      reviewCount: number;
      images: string;
      categoryId: string;
      tags: string;
      shortDesc: string;
      longDesc: string | null;
      ingredients: string | null;
      howToUse: string | null;
      stock: number;
      trackInventory?: number;
      createdAt: Date;
      updatedAt: Date;
    }>>(
      `SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id ORDER BY p.createdAt DESC`
    );
    const categories = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; slug: string }>>(
      `SELECT id, name, slug FROM Category`
    );
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    return NextResponse.json(products.map((p) => ({
      id: p.id,
      slug: p.slug,
      productCode: p.productCode,
      name: p.name,
      price: p.priceCents / 100,
      compareAt: p.compareAtCents ? p.compareAtCents / 100 : null,
      rating: p.rating,
      reviewCount: p.reviewCount,
      images: JSON.parse(p.images),
      category: categoryMap.get(p.categoryId) || { id: p.categoryId, name: "Unknown", slug: "" },
      tags: JSON.parse(p.tags),
      shortDesc: p.shortDesc,
      longDesc: p.longDesc,
      ingredients: p.ingredients,
      howToUse: p.howToUse,
      stock: p.stock,
      trackInventory: p.trackInventory === undefined ? true : Boolean(p.trackInventory),
      badge: (p as { badge?: string | null }).badge ?? null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })));
  } catch (e) {
    console.error("[Admin] Products list error:", e);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      slug,
      productCode,
      name,
      price,
      compareAt,
      rating,
      reviewCount,
      images,
      categoryId,
      tags,
      shortDesc,
      longDesc,
      ingredients,
      howToUse,
      stock,
      trackInventory,
      badge,
    } = body;

    if (!slug || !name || typeof price !== "number" || !categoryId || !shortDesc) {
      return NextResponse.json(
        { error: "Missing required fields: slug, name, price, categoryId, shortDesc" },
        { status: 400 }
      );
    }
    const trackInv = trackInventory === false ? 0 : 1;
    const stockVal = typeof stock === "number" ? Math.max(0, Math.floor(stock)) : 0;

    const productId = `prod-${Date.now()}`;
    const badgeVal = badge === "NEW" || badge === "BESTSELLER" ? badge : null;
    await prisma.$executeRawUnsafe(
      `INSERT INTO Product (id, slug, productCode, name, priceCents, compareAtCents, rating, reviewCount, images, categoryId, tags, shortDesc, longDesc, ingredients, "howToUse", stock, trackInventory, badge, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      productId,
      slug.trim(),
      productCode?.trim() || null,
      name.trim(),
      Math.round(price * 100),
      compareAt ? Math.round(compareAt * 100) : null,
      rating ?? 0,
      reviewCount ?? 0,
      JSON.stringify(Array.isArray(images) ? images : [images || "/images/placeholder.svg"]),
      categoryId,
      JSON.stringify(Array.isArray(tags) ? tags : []),
      shortDesc.trim(),
      longDesc?.trim() || null,
      ingredients?.trim() || null,
      howToUse?.trim() || null,
      stockVal,
      trackInv,
      badgeVal
    );
    const created = await prisma.$queryRawUnsafe<Array<{
      id: string;
      slug: string;
      productCode: string | null;
      name: string;
      priceCents: number;
      compareAtCents: number | null;
      rating: number;
      reviewCount: number;
      images: string;
      categoryId: string;
      tags: string;
      shortDesc: string;
      longDesc: string | null;
      ingredients: string | null;
      howToUse: string | null;
      stock: number;
      trackInventory?: number;
    }>>(
      `SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.id = ?`,
      productId
    );
    const p = created[0];
    const categories = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; slug: string }>>(
      `SELECT id, name, slug FROM Category WHERE id = ?`,
      categoryId
    );
    return NextResponse.json({
      id: p.id,
      slug: p.slug,
      productCode: p.productCode,
      name: p.name,
      price: p.priceCents / 100,
      compareAt: p.compareAtCents ? p.compareAtCents / 100 : null,
      rating: p.rating,
      reviewCount: p.reviewCount,
      images: JSON.parse(p.images),
      category: categories[0] || { id: categoryId, name: "Unknown", slug: "" },
      tags: JSON.parse(p.tags),
      shortDesc: p.shortDesc,
      longDesc: p.longDesc,
      ingredients: p.ingredients,
      howToUse: p.howToUse,
      stock: p.stock,
      trackInventory: p.trackInventory === undefined ? true : Boolean(p.trackInventory),
      badge: p.badge ?? null,
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
    }
    console.error("[Admin] Product create error:", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
