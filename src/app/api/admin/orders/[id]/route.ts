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
    const orders = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        email: string;
        name: string | null;
        address: string;
        city: string;
        zip: string;
        country: string;
        subtotalCents: number;
        discountCents: number;
        shippingCents: number;
        totalCents: number;
        couponCode: string | null;
        status: string;
        trackingNumber: string | null;
        trackingCarrier: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>
    >('SELECT * FROM "Order" WHERE id = ?', id);
    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orders[0];
    const items = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        orderId: string;
        productId: string;
        name: string;
        priceCents: number;
        quantity: number;
        variationId: string | null;
        variationLabel: string | null;
      }>
    >(
      "SELECT id, orderId, productId, name, priceCents, quantity, variationId, variationLabel FROM OrderItem WHERE orderId = ?",
      id
    );
    return NextResponse.json({
      ...order,
      createdAt: order.createdAt.toISOString?.() ?? order.createdAt,
      updatedAt: order.updatedAt.toISOString?.() ?? order.updatedAt,
      items,
    });
  } catch (e) {
    console.error("[Admin] Order get error:", e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
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
    const { status, trackingNumber, trackingCarrier } = body;
    const allowed = ["PENDING", "PAID", "SHIPPED", "CANCELLED"];
    const updates: string[] = ["updatedAt = datetime('now')"];
    const paramsList: unknown[] = [];
    if (typeof status === "string" && allowed.includes(status)) {
      updates.push("status = ?");
      paramsList.push(status);
    }
    if (trackingNumber !== undefined) {
      updates.push("trackingNumber = ?");
      paramsList.push(typeof trackingNumber === "string" ? trackingNumber : null);
    }
    if (trackingCarrier !== undefined) {
      updates.push("trackingCarrier = ?");
      paramsList.push(typeof trackingCarrier === "string" ? trackingCarrier : null);
    }
    if (paramsList.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
    paramsList.push(id);
    await prisma.$executeRawUnsafe(
      `UPDATE "Order" SET ${updates.join(", ")} WHERE id = ?`,
      ...paramsList
    );
    const orders = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        email: string;
        name: string | null;
        address: string;
        city: string;
        zip: string;
        country: string;
        subtotalCents: number;
        discountCents: number;
        shippingCents: number;
        totalCents: number;
        couponCode: string | null;
        status: string;
        trackingNumber: string | null;
        trackingCarrier: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>
    >('SELECT * FROM "Order" WHERE id = ?', id);
    const items = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        orderId: string;
        productId: string;
        name: string;
        priceCents: number;
        quantity: number;
        variationId: string | null;
        variationLabel: string | null;
      }>
    >(
      "SELECT id, orderId, productId, name, priceCents, quantity, variationId, variationLabel FROM OrderItem WHERE orderId = ?",
      id
    );
    const order = orders[0];
    return NextResponse.json({
      ...order,
      createdAt: order.createdAt.toISOString?.() ?? order.createdAt,
      updatedAt: order.updatedAt.toISOString?.() ?? order.updatedAt,
      items,
    });
  } catch (e) {
    console.error("[Admin] Order update error:", e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
