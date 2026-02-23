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
    const categories = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; slug: string }>>(
      "SELECT id, name, slug FROM Category WHERE id = ?",
      id
    );
    if (categories.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(categories[0]);
  } catch (e) {
    console.error("[Admin] Category get error:", e);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
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
    const { name, slug } = body;
    const updates: string[] = [];
    const values: any[] = [];
    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name.trim());
    }
    if (slug !== undefined) {
      updates.push("slug = ?");
      values.push(slug.trim().toLowerCase().replace(/\s+/g, "-"));
    }
    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    updates.push("updatedAt = datetime('now')");
    values.push(id);
    await prisma.$executeRawUnsafe(
      `UPDATE Category SET ${updates.join(", ")} WHERE id = ?`,
      ...values
    );
    const category = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; slug: string }>>(
      "SELECT id, name, slug FROM Category WHERE id = ?",
      id
    );
    return NextResponse.json(category[0]);
  } catch (e: any) {
    if (e?.code === "SQLITE_CONSTRAINT_UNIQUE" || e?.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 400 });
    }
    console.error("[Admin] Category update error:", e);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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
    // Check if any products use this category
    const products = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
      "SELECT COUNT(*) as count FROM Product WHERE categoryId = ?",
      id
    );
    if (products[0]?.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${products[0].count} product(s) are using it` },
        { status: 400 }
      );
    }
    await prisma.$executeRawUnsafe("DELETE FROM Category WHERE id = ?", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Category delete error:", e);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
