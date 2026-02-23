import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const email = session.user.email.toLowerCase();
  const { id } = await params;
  try {
    const orders = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        email: string;
        status: string;
        subtotalCents: number;
        discountCents: number;
        shippingCents: number;
        totalCents: number;
        address: string;
        city: string;
        zip: string;
        country: string;
        trackingNumber: string | null;
        trackingCarrier: string | null;
        createdAt: unknown;
      }>
    >('SELECT id, email, status, subtotalCents, discountCents, shippingCents, totalCents, address, city, zip, country, trackingNumber, trackingCarrier, createdAt FROM "Order" WHERE id = ? AND LOWER(email) = ?', id, email);
    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orders[0];
    const items = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        name: string;
        priceCents: number;
        quantity: number;
        variationLabel: string | null;
      }>
    >("SELECT id, name, priceCents, quantity, variationLabel FROM OrderItem WHERE orderId = ?", id);
    return NextResponse.json({
      id: order.id,
      date: typeof order.createdAt === "string" ? order.createdAt : (order.createdAt as Date)?.toISOString?.()?.slice(0, 10) ?? "",
      status: order.status,
      subtotal: order.subtotalCents / 100,
      discount: order.discountCents / 100,
      shipping: order.shippingCents / 100,
      total: order.totalCents / 100,
      address: `${order.address}, ${order.city} ${order.zip}, ${order.country}`,
      trackingNumber: order.trackingNumber ?? null,
      trackingCarrier: order.trackingCarrier ?? null,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.priceCents / 100,
        variationLabel: i.variationLabel,
      })),
    });
  } catch (e) {
    console.error("[Account] Order get error:", e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
