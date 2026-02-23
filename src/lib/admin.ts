import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { authorized: false as const, session: null };
  }
  if ((session.user as { role?: string | null }).role !== "ADMIN") {
    return { authorized: false as const, session };
  }
  return { authorized: true as const, session };
}
