import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const products = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      "SELECT id FROM Product WHERE slug = ?",
      slug
    );
    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const productId = products[0].id;
    const reviews = await prisma.$queryRawUnsafe<
      Array<{ id: string; authorName: string; rating: number; body: string | null; createdAt: unknown }>
    >(
      "SELECT id, authorName, rating, body, createdAt FROM Review WHERE productId = ? AND (status = 'APPROVED' OR status IS NULL) ORDER BY createdAt DESC",
      productId
    );
    return NextResponse.json(
      reviews.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        rating: r.rating,
        body: r.body,
        createdAt: typeof r.createdAt === "string" ? r.createdAt : (r.createdAt as Date)?.toISOString?.() ?? "",
      }))
    );
  } catch (e) {
    console.error("[Reviews] GET error:", e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;
    const body = await req.json();
    const { authorName, rating, body: reviewBody } = body;

    if (!authorName || typeof authorName !== "string" || authorName.trim().length === 0) {
      return NextResponse.json({ error: "Author name is required" }, { status: 400 });
    }
    const ratingNum = typeof rating === "number" ? rating : parseInt(String(rating), 10);
    if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
    }

    const products = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      "SELECT id FROM Product WHERE slug = ?",
      slug
    );
    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const productId = products[0].id;

    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const userId = session?.user?.email ?? null;
    await prisma.$executeRawUnsafe(
      "INSERT INTO Review (id, productId, userId, authorName, rating, body, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', datetime('now'))",
      reviewId,
      productId,
      userId,
      authorName.trim().slice(0, 200),
      ratingNum,
      typeof reviewBody === "string" ? reviewBody.trim().slice(0, 2000) || null : null
    );

    // Recompute product rating and reviewCount
    const agg = await prisma.$queryRawUnsafe<Array<{ count: number; avg: number | null }>>(
      "SELECT COUNT(*) as count, AVG(rating) as avg FROM Review WHERE productId = ?",
      productId
    );
    const count = Number(agg[0]?.count ?? 0);
    const avg = Number(agg[0]?.avg ?? 0);
    await prisma.$executeRawUnsafe(
      "UPDATE Product SET rating = ?, reviewCount = ?, updatedAt = datetime('now') WHERE id = ?",
      Math.round(avg * 10) / 10,
      count,
      productId
    );

    return NextResponse.json({ ok: true, reviewId });
  } catch (e) {
    console.error("[Reviews] POST error:", e);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
