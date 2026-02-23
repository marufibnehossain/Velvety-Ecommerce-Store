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
    const attributes = await prisma.$queryRawUnsafe<Array<{
      id: string;
      productId: string;
      name: string;
      values: string;
    }>>(
      'SELECT id, productId, name, "values" FROM ProductAttribute WHERE productId = ? ORDER BY name ASC',
      id
    );
    return NextResponse.json(attributes.map(a => ({
      ...a,
      values: JSON.parse(a.values),
    })));
  } catch (e) {
    console.error("[Admin] Attributes get error:", e);
    return NextResponse.json({ error: "Failed to fetch attributes" }, { status: 500 });
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
    const { name, values } = body;
    if (!name || !Array.isArray(values) || values.length === 0) {
      return NextResponse.json({ error: "Name and values array are required" }, { status: 400 });
    }
    const attrId = `attr-${Date.now()}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO ProductAttribute (id, productId, name, "values", createdAt, updatedAt) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      attrId,
      id,
      name.trim(),
      JSON.stringify(values.map((v: string) => String(v).trim()))
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
    console.error("[Admin] Attribute create error:", e);
    return NextResponse.json({ error: "Failed to create attribute" }, { status: 500 });
  }
}
