import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const orders = await prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { items: true },
    });
    return NextResponse.json(orders);
  } catch (e) {
    console.error("[Admin] Orders list error:", e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
