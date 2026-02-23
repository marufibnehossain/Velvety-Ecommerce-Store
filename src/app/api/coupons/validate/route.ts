import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
    const subtotal = typeof body?.subtotal === "number" ? body.subtotal : 0;
    if (!code) {
      return NextResponse.json({ valid: false, error: "Code is required" }, { status: 400 });
    }
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });
    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid or expired code" });
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, error: "This code has expired" });
    }
    const usedCount = (coupon as { usedCount?: number }).usedCount ?? 0;
    const maxUses = (coupon as { maxUses?: number | null }).maxUses;
    if (maxUses != null && usedCount >= maxUses) {
      return NextResponse.json({ valid: false, error: "This code has reached its usage limit" });
    }
    const subtotalCents = Math.round(subtotal * 100);
    if (coupon.minOrderCents != null && subtotalCents < coupon.minOrderCents) {
      const min = (coupon.minOrderCents / 100).toFixed(2);
      return NextResponse.json({
        valid: false,
        error: `Minimum order for this code is $${min}`,
      });
    }
    let discount = 0;
    if (coupon.type === "PERCENT") {
      discount = (subtotal * Math.min(100, Math.max(0, coupon.value))) / 100;
    } else if (coupon.type === "FIXED") {
      discount = Math.min(subtotal, coupon.value / 100);
    }
    discount = Math.round(discount * 100) / 100;
    return NextResponse.json({
      valid: true,
      discount,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    });
  } catch (e) {
    console.error("[Coupons] Validate error:", e);
    return NextResponse.json(
      { valid: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
