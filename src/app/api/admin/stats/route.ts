import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 19).replace("T", " ");
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().slice(0, 19).replace("T", " ");

    const [totalRows, pendingRows, todayRows, weekRows, revenueTodayRows, revenueWeekRows, lowStockRows, revenueByDayRows] = await Promise.all([
      prisma.$queryRawUnsafe<Array<{ n: number }>>('SELECT COUNT(*) as n FROM "Order"'),
      prisma.$queryRawUnsafe<Array<{ n: number }>>('SELECT COUNT(*) as n FROM "Order" WHERE status = ?', "PENDING"),
      prisma.$queryRawUnsafe<Array<{ n: number }>>('SELECT COUNT(*) as n FROM "Order" WHERE createdAt >= ?', startOfToday),
      prisma.$queryRawUnsafe<Array<{ n: number }>>('SELECT COUNT(*) as n FROM "Order" WHERE createdAt >= ?', startOfWeekStr),
      prisma.$queryRawUnsafe<Array<{ sum: number | null }>>(
        'SELECT COALESCE(SUM(totalCents), 0) as sum FROM "Order" WHERE createdAt >= ? AND status != ?',
        startOfToday,
        "CANCELLED"
      ),
      prisma.$queryRawUnsafe<Array<{ sum: number | null }>>(
        'SELECT COALESCE(SUM(totalCents), 0) as sum FROM "Order" WHERE createdAt >= ? AND status != ?',
        startOfWeekStr,
        "CANCELLED"
      ),
      prisma.$queryRawUnsafe<Array<{ id: string; name: string; stock: number }>>(
        "SELECT id, name, stock FROM Product WHERE trackInventory = 1 AND stock > 0 AND stock <= 5 ORDER BY stock ASC LIMIT 10"
      ),
      prisma.$queryRawUnsafe<Array<{ date: string; orders: number; revenue: number }>>(
        `SELECT date(createdAt) as date, COUNT(*) as orders, COALESCE(SUM(CASE WHEN status != 'CANCELLED' THEN totalCents ELSE 0 END), 0) as revenue
         FROM "Order" WHERE createdAt >= datetime('now', '-7 days') GROUP BY date(createdAt) ORDER BY date ASC`
      ),
    ]);

    const totalOrders = Number((totalRows[0] as { n: number })?.n ?? 0);
    const pendingOrders = Number((pendingRows[0] as { n: number })?.n ?? 0);
    const ordersToday = Number((todayRows[0] as { n: number })?.n ?? 0);
    const ordersThisWeek = Number((weekRows[0] as { n: number })?.n ?? 0);
    const revenueTodayCents = Number((revenueTodayRows[0] as { sum: number | null })?.sum ?? 0);
    const revenueThisWeekCents = Number((revenueWeekRows[0] as { sum: number | null })?.sum ?? 0);
    const lowStockProducts = (lowStockRows as Array<{ id: string; name: string; stock: number }>).map((r) => ({
      id: r.id,
      name: r.name,
      stock: r.stock,
    }));
    const revenueByDay = (revenueByDayRows as Array<{ date: string; orders: number; revenue: number }>).map((r) => ({
      date: r.date,
      orders: Number(r.orders),
      revenue: Number(r.revenue),
    }));

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      ordersToday,
      ordersThisWeek,
      revenueTodayCents,
      revenueThisWeekCents,
      lowStockProducts,
      revenueByDay,
    });
  } catch (e) {
    console.error("[Admin] Stats error:", e);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
