import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function redirect(path: string) {
  return NextResponse.redirect(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return redirect("/account/verify-email?error=missing");
  }

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!record) {
      return redirect("/account/verify-email?error=invalid");
    }
    if (new Date() > record.expiresAt) {
      await prisma.verificationToken.delete({ where: { id: record.id } });
      return redirect("/account/verify-email?error=expired");
    }

    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    });
    await prisma.verificationToken.delete({ where: { id: record.id } });

    return redirect("/account/verify-email?success=1");
  } catch (e) {
    console.error("[Auth] Verify email error:", e);
    return redirect("/account/verify-email?error=server");
  }
}
