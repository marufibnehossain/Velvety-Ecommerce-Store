import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, items, subtotal, discount, shipping, total, coupon } = body;
    if (!email || typeof email !== "string" || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Email and items are required" },
        { status: 400 }
      );
    }
    const result = await sendOrderConfirmationEmail(email, {
      name: name && typeof name === "string" ? name : undefined,
      items: items.map((i: { name: string; quantity: number; price: number }) => ({
        name: i.name,
        quantity: Number(i.quantity) || 1,
        price: Number(i.price) || 0,
      })),
      subtotal: Number(subtotal) || 0,
      discount: typeof discount === "number" ? discount : 0,
      coupon: typeof coupon === "string" ? coupon : undefined,
      shipping: Number(shipping) || 0,
      total: Number(total) || 0,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Failed to send confirmation email" },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Order] Confirm email error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
