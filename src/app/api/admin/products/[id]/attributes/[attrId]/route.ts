import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; attrId: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { attrId } = await params;
    const body = await req.json();
    const { name, values } = body;
    const updates: string[] = [];
    const vals: any[] = [];
    if (name !== undefined) {
      updates.push("name = ?");
      vals.push(name.trim());
    }
    if (values !== undefined) {
      if (!Array.isArray(values) || values.length === 0) {
        return NextResponse.json({ error: "Values must be a non-empty array" }, { status: 400 });
      }
      updates.push('"values" = ?');
      vals.push(JSON.stringify(values.map((v: string) => String(v).trim())));
    }
    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    updates.push("updatedAt = datetime('now')");
    vals.push(attrId);
    await prisma.$executeRawUnsafe(
      `UPDATE ProductAttribute SET ${updates.join(", ")} WHERE id = ?`,
      ...vals
    );
    const attrs = await prisma.$queryRawUnsafe<Array<{
      id: string;
      productId: string;
      name: string;
      values: string;
    }>>(
      'SELECT id, productId, name, "values" FROM ProductAttribute WHERE id = ?',
      attrId
    );
    return NextResponse.json({
      ...attrs[0],
      values: JSON.parse(attrs[0].values),
    });
  } catch (e) {
    console.error("[Admin] Attribute update error:", e);
    return NextResponse.json({ error: "Failed to update attribute" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; attrId: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { attrId } = await params;
    await prisma.$executeRawUnsafe("DELETE FROM ProductAttribute WHERE id = ?", attrId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Attribute delete error:", e);
    return NextResponse.json({ error: "Failed to delete attribute" }, { status: 500 });
  }
}
