import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const categories = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; slug: string; createdAt: Date; updatedAt: Date }>>(
      "SELECT id, name, slug, createdAt, updatedAt FROM Category ORDER BY name ASC"
    );
    return NextResponse.json(categories.map(c => ({
      ...c,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
      updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
    })));
  } catch (e) {
    console.error("[Admin] Categories list error:", e);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, slug } = body;
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }
    const slugClean = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const result = await prisma.$executeRawUnsafe(
      `INSERT INTO Category (id, name, slug, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
      `cat-${Date.now()}`,
      name.trim(),
      slugClean
    );
    const category = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; slug: string }>>(
      `SELECT id, name, slug FROM Category WHERE slug = ?`,
      slugClean
    );
    return NextResponse.json(category[0]);
  } catch (e: any) {
    if (e?.code === "SQLITE_CONSTRAINT_UNIQUE" || e?.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 400 });
    }
    console.error("[Admin] Category create error:", e);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
