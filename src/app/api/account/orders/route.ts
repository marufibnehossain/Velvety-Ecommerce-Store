import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const email = session.user.email.toLowerCase();
  try {
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
        createdAt: unknown;
      }>
    >('SELECT id, email, name, address, city, zip, country, subtotalCents, discountCents, shippingCents, totalCents, couponCode, status, createdAt FROM "Order" WHERE LOWER(email) = ? ORDER BY createdAt DESC', email);
    return NextResponse.json(
      orders.map((o) => ({
        id: o.id,
        date: typeof o.createdAt === "string" ? o.createdAt : (o.createdAt as Date)?.toISOString?.()?.slice(0, 10) ?? "",
        total: o.totalCents / 100,
        status: o.status,
      }))
    );
  } catch (e) {
    console.error("[Account] Orders list error:", e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
