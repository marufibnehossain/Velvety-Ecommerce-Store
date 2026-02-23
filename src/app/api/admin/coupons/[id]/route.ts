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
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json(coupon);
  } catch (e) {
    console.error("[Admin] Coupon get error:", e);
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 });
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
    const { code, type, value, minOrderCents, maxUses, expiresAt } = body;
    const update: { code?: string; type?: string; value?: number; minOrderCents?: number | null; maxUses?: number | null; expiresAt?: Date | null } = {};
    if (typeof code === "string" && code.trim()) update.code = code.trim().toUpperCase();
    if (["PERCENT", "FIXED"].includes(type)) update.type = type;
    if (typeof value === "number" && value >= 0) update.value = value;
    if (minOrderCents === null || minOrderCents === undefined) update.minOrderCents = null;
    else if (typeof minOrderCents === "number" && minOrderCents >= 0) update.minOrderCents = minOrderCents;
    if (maxUses === null || maxUses === undefined) update.maxUses = null;
    else if (typeof maxUses === "number" && maxUses > 0) update.maxUses = maxUses;
    if (expiresAt === null || expiresAt === undefined) update.expiresAt = null;
    else if (expiresAt) {
      const d = new Date(expiresAt);
      if (!Number.isNaN(d.getTime())) update.expiresAt = d;
    }
    const coupon = await prisma.coupon.update({
      where: { id },
      data: update,
    });
    return NextResponse.json(coupon);
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 400 });
    }
    console.error("[Admin] Coupon update error:", e);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
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
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Coupon delete error:", e);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
