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

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const addresses = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        userId: string;
        label: string | null;
        address: string;
        city: string;
        zip: string;
        country: string;
        isDefault: number;
      }>
    >("SELECT id, userId, label, address, city, zip, country, isDefault FROM Address WHERE userId = ? ORDER BY isDefault DESC, createdAt ASC", userId);
    return NextResponse.json(
      addresses.map((a) => ({
        id: a.id,
        label: a.label,
        address: a.address,
        city: a.city,
        zip: a.zip,
        country: a.country,
        isDefault: Boolean(a.isDefault),
      }))
    );
  } catch (e) {
    console.error("[Account] Addresses GET error:", e);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { label, address, city, zip, country, isDefault } = body;
    if (!address || !city || !zip || !country) {
      return NextResponse.json({ error: "address, city, zip, country required" }, { status: 400 });
    }
    const id = `addr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const def = Boolean(isDefault);
    if (def) {
      await prisma.$executeRawUnsafe("UPDATE Address SET isDefault = 0 WHERE userId = ?", userId);
    }
    await prisma.$executeRawUnsafe(
      `INSERT INTO Address (id, userId, label, address, city, zip, country, isDefault, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      id,
      userId,
      typeof label === "string" ? label.trim() || null : null,
      String(address).trim(),
      String(city).trim(),
      String(zip).trim(),
      String(country).trim(),
      def ? 1 : 0
    );
    const rows = await prisma.$queryRawUnsafe<
      Array<{ id: string; label: string | null; address: string; city: string; zip: string; country: string; isDefault: number }>
    >("SELECT id, label, address, city, zip, country, isDefault FROM Address WHERE id = ?", id);
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
    console.error("[Account] Addresses POST error:", e);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
