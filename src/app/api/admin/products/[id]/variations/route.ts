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
    const variations = await prisma.$queryRawUnsafe<Array<{
      id: string;
      productId: string;
      attributes: string;
      priceCents: number | null;
      stock: number;
      sku: string | null;
      images: string | null;
    }>>(
      "SELECT id, productId, attributes, priceCents, stock, sku, images FROM ProductVariation WHERE productId = ? ORDER BY createdAt ASC",
      id
    );
    return NextResponse.json(variations.map(v => ({
      ...v,
      attributes: JSON.parse(v.attributes),
      price: v.priceCents ? v.priceCents / 100 : null,
      images: v.images ? JSON.parse(v.images) : null,
    })));
  } catch (e) {
    console.error("[Admin] Variations get error:", e);
    return NextResponse.json({ error: "Failed to fetch variations" }, { status: 500 });
  }
}

export async function POST(
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
    const { attributes, price, stock, sku, images } = body;
    if (!attributes || typeof attributes !== "object") {
      return NextResponse.json({ error: "Attributes object is required" }, { status: 400 });
    }
    const varId = `var-${Date.now()}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO ProductVariation (id, productId, attributes, priceCents, stock, sku, images, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      varId,
      id,
      JSON.stringify(attributes),
      price != null ? Math.round(price * 100) : null,
      Math.max(0, Math.floor(stock ?? 0)),
      sku?.trim() || null,
      images && Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : null
    );
    const vars = await prisma.$queryRawUnsafe<Array<{
      id: string;
      productId: string;
      attributes: string;
      priceCents: number | null;
      stock: number;
      sku: string | null;
      images: string | null;
    }>>(
      "SELECT id, productId, attributes, priceCents, stock, sku, images FROM ProductVariation WHERE id = ?",
      varId
    );
    const v = vars[0];
    return NextResponse.json({
      ...v,
      attributes: JSON.parse(v.attributes),
      price: v.priceCents ? v.priceCents / 100 : null,
      images: v.images ? JSON.parse(v.images) : null,
    });
  } catch (e) {
    console.error("[Admin] Variation create error:", e);
    return NextResponse.json({ error: "Failed to create variation" }, { status: 500 });
  }
}
