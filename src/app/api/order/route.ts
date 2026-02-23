import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

type ItemInput = {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  variationId?: string;
  variationLabel?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      address,
      city,
      zip,
      country,
      items,
      subtotal,
      discount = 0,
      shipping,
      total,
      coupon,
    } = body;

    if (
      !email ||
      typeof email !== "string" ||
      !address ||
      typeof address !== "string" ||
      !city ||
      !zip ||
      !country ||
      !Array.isArray(items) ||
      items.length === 0 ||
      typeof subtotal !== "number" ||
      typeof shipping !== "number" ||
      typeof total !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields: email, address, city, zip, country, items, subtotal, shipping, total" },
        { status: 400 }
      );
    }

    const subtotalCents = Math.round(subtotal * 100);
    const discountCents = Math.round((discount || 0) * 100);
    const shippingCents = Math.round(shipping * 100);
    const totalCents = Math.round(total * 100);
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const couponCode = typeof coupon === "string" ? coupon.trim() || null : null;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Order" (id, email, name, address, city, zip, country, subtotalCents, discountCents, shippingCents, totalCents, couponCode, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', datetime('now'), datetime('now'))`,
      orderId,
      email.trim().toLowerCase(),
      typeof name === "string" ? name.trim() || null : null,
      String(address).trim(),
      String(city).trim(),
      String(zip).trim(),
      String(country).trim(),
      subtotalCents,
      discountCents,
      shippingCents,
      totalCents,
      couponCode
    );
    if (couponCode) {
      await prisma.$executeRawUnsafe(
        "UPDATE Coupon SET usedCount = COALESCE(usedCount, 0) + 1 WHERE code = ?",
        couponCode.toUpperCase()
      );
    }

    for (const i of items as ItemInput[]) {
      const itemId = `oi-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const productId = i.productId ?? "unknown";
      const itemName = String(i.name);
      const priceCents = Math.round(Number(i.price) * 100);
      const quantity = Math.max(1, Math.floor(Number(i.quantity) || 1));
      const variationId = i.variationId ?? null;
      const variationLabel = i.variationLabel ?? null;
      await prisma.$executeRawUnsafe(
        `INSERT INTO OrderItem (id, orderId, productId, name, priceCents, quantity, variationId, variationLabel)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        itemId,
        orderId,
        productId,
        itemName,
        priceCents,
        quantity,
        variationId,
        variationLabel
      );
    }

    try {
      await sendOrderConfirmationEmail(email, {
        name: typeof name === "string" ? name.trim() || undefined : undefined,
        items: items.map((i: ItemInput) => ({
          name: i.name,
          quantity: Number(i.quantity) || 1,
          price: Number(i.price) || 0,
        })),
        subtotal,
        discount: discount || 0,
        coupon: typeof coupon === "string" ? coupon.trim() || undefined : undefined,
        shipping,
        total,
      });
    } catch (_) {
      // Order already created; email failure is non-fatal
    }

    return NextResponse.json({ ok: true, orderId });
  } catch (e) {
    console.error("[Order] Create error:", e);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
