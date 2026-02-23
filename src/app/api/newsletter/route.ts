import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    await prisma.$executeRawUnsafe(
      "INSERT OR IGNORE INTO NewsletterSubscriber (id, email, createdAt) VALUES (?, ?, datetime('now'))",
      `nws-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      email
    );
    return NextResponse.json({ ok: true, message: "Thanks for subscribing!" });
  } catch (e) {
    console.error("[Newsletter] Subscribe error:", e);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
