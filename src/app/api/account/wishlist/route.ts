import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { id: string },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const rows = await prisma.$queryRawUnsafe<Array<{ productId: string; slug: string }>>(
      "SELECT w.productId, p.slug FROM WishlistItem w INNER JOIN Product p ON w.productId = p.id WHERE w.userId = ? ORDER BY w.createdAt DESC",
      user.id
    );
    return NextResponse.json(rows);
  } catch (e) {
    console.error("[Account] Wishlist get error:", e);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { id: string },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const id = `wish-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await prisma.$executeRawUnsafe(
      "INSERT OR IGNORE INTO WishlistItem (id, userId, productId, createdAt) VALUES (?, ?, ?, datetime('now'))",
      id,
      user.id,
      productId
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Account] Wishlist add error:", e);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { id: string },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    await prisma.$executeRawUnsafe(
      "DELETE FROM WishlistItem WHERE userId = ? AND productId = ?",
      user.id,
      productId
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Account] Wishlist remove error:", e);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
