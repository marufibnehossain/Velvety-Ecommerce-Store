import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 200) : "";
    const email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
    const subject = typeof body?.subject === "string" ? body.subject.trim().slice(0, 200) || null : null;
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 5000) : "";
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    const id = `cnt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await prisma.$executeRawUnsafe(
      "INSERT INTO ContactMessage (id, name, email, subject, message, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))",
      id,
      name,
      email,
      subject,
      message
    );
    return NextResponse.json({ ok: true, message: "Message sent. We'll get back to you soon." });
  } catch (e) {
    console.error("[Contact] Submit error:", e);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
