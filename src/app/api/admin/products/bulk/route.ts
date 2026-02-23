import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { ids, action, value } = body;
    if (!Array.isArray(ids) || ids.length === 0 || typeof action !== "string") {
      return NextResponse.json({ error: "ids array and action required" }, { status: 400 });
    }
    const placeholders = ids.map(() => "?").join(",");
    if (action === "delete") {
      for (const id of ids) {
        await prisma.$executeRawUnsafe("DELETE FROM ProductAttribute WHERE productId = ?", id);
        await prisma.$executeRawUnsafe("DELETE FROM ProductVariation WHERE productId = ?", id);
        await prisma.$executeRawUnsafe("DELETE FROM Product WHERE id = ?", id);
      }
      return NextResponse.json({ ok: true, updated: ids.length });
    }
    if (action === "stock" && typeof value === "number") {
      const stock = Math.max(0, Math.floor(value));
      for (const id of ids) {
        await prisma.$executeRawUnsafe("UPDATE Product SET stock = ?, updatedAt = datetime('now') WHERE id = ?", stock, id);
      }
      return NextResponse.json({ ok: true, updated: ids.length });
    }
    if (action === "category" && typeof value === "string" && value.trim()) {
      for (const id of ids) {
        await prisma.$executeRawUnsafe("UPDATE Product SET categoryId = ?, updatedAt = datetime('now') WHERE id = ?", value.trim(), id);
      }
      return NextResponse.json({ ok: true, updated: ids.length });
    }
    return NextResponse.json({ error: "Invalid action or value" }, { status: 400 });
  } catch (e) {
    console.error("[Admin] Bulk update error:", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
