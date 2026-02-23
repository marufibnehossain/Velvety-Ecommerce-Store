import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    let query = "SELECT r.id, r.productId, r.authorName, r.rating, r.body, r.status, r.createdAt, p.name as productName, p.slug as productSlug FROM Review r INNER JOIN Product p ON r.productId = p.id ORDER BY r.createdAt DESC";
    const params: string[] = [];
    if (productId) {
      query = "SELECT r.id, r.productId, r.authorName, r.rating, r.body, r.status, r.createdAt, p.name as productName, p.slug as productSlug FROM Review r INNER JOIN Product p ON r.productId = p.id WHERE r.productId = ? ORDER BY r.createdAt DESC";
      params.push(productId);
    }
    const rows = await prisma.$queryRawUnsafe<Array<{
      id: string;
      productId: string;
      authorName: string;
      rating: number;
      body: string | null;
      status: string;
      createdAt: unknown;
      productName: string;
      productSlug: string;
    }>>(query, ...params);
    return NextResponse.json(rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      productSlug: r.productSlug,
      authorName: r.authorName,
      rating: r.rating,
      body: r.body,
      status: r.status,
      createdAt: typeof r.createdAt === "string" ? r.createdAt : (r.createdAt as Date)?.toISOString?.() ?? "",
    })));
  } catch (e) {
    console.error("[Admin] Reviews list error:", e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
