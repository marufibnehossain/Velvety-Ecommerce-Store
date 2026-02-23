import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
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
      badge: string | null;
    }>>(
      `SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.id = ?`,
      id
    );
    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const p = products[0];
    const categories = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; slug: string }>>(
      `SELECT id, name, slug FROM Category WHERE id = ?`,
      p.categoryId
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
      category: categories[0] || { id: p.categoryId, name: "Unknown", slug: "" },
      tags: JSON.parse(p.tags),
      shortDesc: p.shortDesc,
      longDesc: p.longDesc,
      ingredients: p.ingredients,
      howToUse: p.howToUse,
      stock: p.stock,
      trackInventory: p.trackInventory === undefined ? true : Boolean(p.trackInventory),
      badge: p.badge ?? null,
    });
  } catch (e) {
    console.error("[Admin] Product get error:", e);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const updates: string[] = [];
    const values: any[] = [];
    if (body.slug !== undefined) {
      updates.push("slug = ?");
      values.push(String(body.slug).trim());
    }
    if (body.productCode !== undefined) {
      updates.push("productCode = ?");
      values.push(body.productCode ? String(body.productCode).trim() : null);
    }
    if (body.name !== undefined) {
      updates.push("name = ?");
      values.push(String(body.name).trim());
    }
    if (typeof body.price === "number") {
      updates.push("priceCents = ?");
      values.push(Math.round(body.price * 100));
    }
    if (body.compareAt !== undefined) {
      updates.push("compareAtCents = ?");
      values.push(body.compareAt ? Math.round(body.compareAt * 100) : null);
    }
    if (typeof body.rating === "number") {
      updates.push("rating = ?");
      values.push(body.rating);
    }
    if (typeof body.reviewCount === "number") {
      updates.push("reviewCount = ?");
      values.push(body.reviewCount);
    }
    if (body.images !== undefined) {
      updates.push("images = ?");
      values.push(JSON.stringify(Array.isArray(body.images) ? body.images : [body.images || "/images/placeholder.svg"]));
    }
    if (body.categoryId !== undefined) {
      updates.push("categoryId = ?");
      values.push(String(body.categoryId));
    }
    if (body.tags !== undefined) {
      updates.push("tags = ?");
      values.push(JSON.stringify(Array.isArray(body.tags) ? body.tags : []));
    }
    if (body.shortDesc !== undefined) {
      updates.push("shortDesc = ?");
      values.push(String(body.shortDesc).trim());
    }
    if (body.longDesc !== undefined) {
      updates.push("longDesc = ?");
      values.push(body.longDesc ? String(body.longDesc).trim() : null);
    }
    if (body.ingredients !== undefined) {
      updates.push("ingredients = ?");
      values.push(body.ingredients ? String(body.ingredients).trim() : null);
    }
    if (body.howToUse !== undefined) {
      updates.push(`"howToUse" = ?`);
      values.push(body.howToUse ? String(body.howToUse).trim() : null);
    }
    if (typeof body.stock === "number") {
      updates.push("stock = ?");
      values.push(Math.max(0, Math.floor(body.stock)));
    }
    if (body.trackInventory !== undefined) {
      updates.push("trackInventory = ?");
      values.push(body.trackInventory ? 1 : 0);
    }
    if (body.badge !== undefined) {
      updates.push("badge = ?");
      values.push(body.badge === "NEW" || body.badge === "BESTSELLER" ? body.badge : null);
    }
    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    updates.push("updatedAt = datetime('now')");
    values.push(id);
    await prisma.$executeRawUnsafe(
      `UPDATE Product SET ${updates.join(", ")} WHERE id = ?`,
      ...values
    );
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
    }>>(
      `SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.id = ?`,
      id
    );
    const p = products[0];
    const categories = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; slug: string }>>(
      `SELECT id, name, slug FROM Category WHERE id = ?`,
      p.categoryId
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
      category: categories[0] || { id: p.categoryId, name: "Unknown", slug: "" },
      tags: JSON.parse(p.tags),
      shortDesc: p.shortDesc,
      longDesc: p.longDesc,
      ingredients: p.ingredients,
      howToUse: p.howToUse,
      stock: p.stock,
      trackInventory: p.trackInventory === undefined ? true : Boolean(p.trackInventory),
    });
  } catch (e: any) {
    if (e?.code === "SQLITE_CONSTRAINT_UNIQUE" || e?.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
    }
    console.error("[Admin] Product update error:", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe("DELETE FROM Product WHERE id = ?", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Product delete error:", e);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
