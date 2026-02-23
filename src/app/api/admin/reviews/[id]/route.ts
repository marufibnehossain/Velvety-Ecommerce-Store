import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const ALLOWED = ["APPROVED", "PENDING", "HIDDEN"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const status = typeof body?.status === "string" ? body.status : "";
    if (!ALLOWED.includes(status)) {
      return NextResponse.json({ error: "Invalid status. Use APPROVED, PENDING, or HIDDEN" }, { status: 400 });
    }
    await prisma.$executeRawUnsafe(
      "UPDATE Review SET status = ? WHERE id = ?",
      status,
      id
    );
    const rows = await prisma.$queryRawUnsafe<Array<{ id: string; status: string }>>(
      "SELECT id, status FROM Review WHERE id = ?",
      id
    );
    if (rows.length === 0) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error("[Admin] Review update error:", e);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
