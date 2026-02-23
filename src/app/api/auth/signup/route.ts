import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    const emailNormalized = email.toLowerCase().trim();
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });
    if (existing) {
      if (existing.emailVerified) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      await prisma.verificationToken.deleteMany({ where: { userId: existing.id } });
      await prisma.user.delete({ where: { id: existing.id } });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: emailNormalized,
        passwordHash,
        name: name && typeof name === "string" ? name.trim() || null : null,
      },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.verificationToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
    const sendResult = await sendVerificationEmail(user.email, verificationUrl);

    if (!sendResult.ok) {
      await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
      console.error("[Auth] Signup – email send failed:", sendResult.error);
      return NextResponse.json(
        { error: sendResult.error ?? "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Check your email to verify your account",
      email: emailNormalized,
    });
  } catch (e) {
    console.error("[Auth] Signup error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
