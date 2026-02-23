import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const coupons = await prisma.$queryRawUnsafe<Array<{
      id: string;
      code: string;
      type: string;
      value: number;
      minOrderCents: number | null;
      maxUses: number | null;
      usedCount: number;
      expiresAt: Date | null;
      createdAt: Date;
    }>>(
      "SELECT id, code, type, value, minOrderCents, maxUses, usedCount, expiresAt, createdAt FROM Coupon ORDER BY createdAt DESC"
    );
    return NextResponse.json(coupons.map(c => ({
      ...c,
      expiresAt: c.expiresAt instanceof Date ? c.expiresAt.toISOString() : c.expiresAt,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    })));
  } catch (e) {
    console.error("[Admin] Coupons list error:", e);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { code, type, value, minOrderCents, maxUses, expiresAt } = body;
    const codeStr = typeof code === "string" ? code.trim().toUpperCase() : "";
    if (!codeStr) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }
    if (!["PERCENT", "FIXED"].includes(type)) {
      return NextResponse.json({ error: "Type must be PERCENT or FIXED" }, { status: 400 });
    }
    const valueNum = parseInt(String(value), 10);
    if (Number.isNaN(valueNum) || valueNum < 0) {
      return NextResponse.json({ error: "Value must be a positive number" }, { status: 400 });
    }
    if (type === "PERCENT" && valueNum > 100) {
      return NextResponse.json({ error: "Percent value cannot exceed 100" }, { status: 400 });
    }
    const minCents = minOrderCents != null ? parseInt(String(minOrderCents), 10) : null;
    const expires = expiresAt ? new Date(expiresAt) : null;
    const couponId = `coupon-${Date.now()}`;
    const maxUsesNum = maxUses != null && maxUses !== "" ? parseInt(String(maxUses), 10) : null;
    await prisma.$executeRawUnsafe(
      `INSERT INTO Coupon (id, code, type, value, minOrderCents, maxUses, usedCount, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?, datetime('now'))`,
      couponId,
      codeStr,
      type,
      valueNum,
      Number.isNaN(minCents) ? null : minCents,
      maxUsesNum != null && !Number.isNaN(maxUsesNum) && maxUsesNum > 0 ? maxUsesNum : null,
      expires && !Number.isNaN(expires.getTime()) ? expires.toISOString() : null
    );
    const created = await prisma.$queryRawUnsafe<Array<{
      id: string;
      code: string;
      type: string;
      value: number;
      minOrderCents: number | null;
      maxUses: number | null;
      usedCount: number;
      expiresAt: Date | null;
      createdAt: Date;
    }>>(
      "SELECT id, code, type, value, minOrderCents, maxUses, usedCount, expiresAt, createdAt FROM Coupon WHERE id = ?",
      couponId
    );
    const c = created[0];
    return NextResponse.json({
      ...c,
      expiresAt: c.expiresAt instanceof Date ? c.expiresAt.toISOString() : c.expiresAt,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    });
  } catch (e: any) {
    if (e?.code === "SQLITE_CONSTRAINT_UNIQUE" || e?.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 400 });
    }
    console.error("[Admin] Coupon create error:", e);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
