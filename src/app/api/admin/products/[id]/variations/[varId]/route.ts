import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; varId: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { varId } = await params;
    const body = await req.json();
    const updates: string[] = [];
    const vals: any[] = [];
    if (body.attributes !== undefined) {
      if (!body.attributes || typeof body.attributes !== "object") {
        return NextResponse.json({ error: "Attributes must be an object" }, { status: 400 });
      }
      updates.push("attributes = ?");
      vals.push(JSON.stringify(body.attributes));
    }
    if (body.price !== undefined) {
      updates.push("priceCents = ?");
      vals.push(body.price != null ? Math.round(body.price * 100) : null);
    }
    if (typeof body.stock === "number") {
      updates.push("stock = ?");
      vals.push(Math.max(0, Math.floor(body.stock)));
    }
    if (body.sku !== undefined) {
      updates.push("sku = ?");
      vals.push(body.sku?.trim() || null);
    }
    if (body.images !== undefined) {
      updates.push("images = ?");
      vals.push(body.images && Array.isArray(body.images) && body.images.length > 0 ? JSON.stringify(body.images) : null);
    }
    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    updates.push("updatedAt = datetime('now')");
    vals.push(varId);
    await prisma.$executeRawUnsafe(
      `UPDATE ProductVariation SET ${updates.join(", ")} WHERE id = ?`,
      ...vals
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
    console.error("[Admin] Variation update error:", e);
    return NextResponse.json({ error: "Failed to update variation" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; varId: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { varId } = await params;
    await prisma.$executeRawUnsafe("DELETE FROM ProductVariation WHERE id = ?", varId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Variation delete error:", e);
    return NextResponse.json({ error: "Failed to delete variation" }, { status: 500 });
  }
}
