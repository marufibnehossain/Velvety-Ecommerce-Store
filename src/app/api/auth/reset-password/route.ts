import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;
    if (!token || typeof token !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }
    if (new Date() > record.expiresAt) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }
    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return NextResponse.json({ message: "Password updated. You can now sign in." });
  } catch (e) {
    console.error("[Auth] Reset password error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
