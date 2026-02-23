import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    "SELECT id FROM User WHERE email = ?",
    session.user.email.toLowerCase()
  );
  return rows[0]?.id ?? null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const { label, address, city, zip, country, isDefault } = body;
    const updates: string[] = [];
    const vals: unknown[] = [];
    if (label !== undefined) {
      updates.push("label = ?");
      vals.push(typeof label === "string" ? label.trim() || null : null);
    }
    if (address !== undefined) {
      updates.push("address = ?");
      vals.push(String(address).trim());
    }
    if (city !== undefined) {
      updates.push("city = ?");
      vals.push(String(city).trim());
    }
    if (zip !== undefined) {
      updates.push("zip = ?");
      vals.push(String(zip).trim());
    }
    if (country !== undefined) {
      updates.push("country = ?");
      vals.push(String(country).trim());
    }
    if (isDefault === true) {
      await prisma.$executeRawUnsafe("UPDATE Address SET isDefault = 0 WHERE userId = ?", userId);
      updates.push("isDefault = 1");
    }
    if (updates.length > 0) {
      updates.push("updatedAt = datetime('now')");
      vals.push(id, userId);
      await prisma.$executeRawUnsafe(
        `UPDATE Address SET ${updates.join(", ")} WHERE id = ? AND userId = ?`,
        ...vals
      );
    }
    const rows = await prisma.$queryRawUnsafe<
      Array<{ id: string; label: string | null; address: string; city: string; zip: string; country: string; isDefault: number }>
    >("SELECT id, label, address, city, zip, country, isDefault FROM Address WHERE id = ? AND userId = ?", id, userId);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    const a = rows[0];
    return NextResponse.json({
      id: a.id,
      label: a.label,
      address: a.address,
      city: a.city,
      zip: a.zip,
      country: a.country,
      isDefault: Boolean(a.isDefault),
    });
  } catch (e) {
    console.error("[Account] Address PATCH error:", e);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const result = await prisma.$executeRawUnsafe("DELETE FROM Address WHERE id = ? AND userId = ?", id, userId);
    return NextResponse.json({ ok: true, deleted: result });
  } catch (e) {
    console.error("[Account] Address DELETE error:", e);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
