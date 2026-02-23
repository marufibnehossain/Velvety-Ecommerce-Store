import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    const emailNormalized = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a reset link.",
      });
    }
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/account/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);
    return NextResponse.json({
      message: "If an account exists with this email, you will receive a reset link.",
    });
  } catch (e) {
    console.error("[Auth] Forgot password error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
