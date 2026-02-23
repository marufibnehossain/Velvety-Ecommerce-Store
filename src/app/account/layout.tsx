"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const PUBLIC_PATHS = ["/account/login", "/account/register", "/account/verify-email", "/account/forgot-password", "/account/reset-password"];

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "?"));
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (isPublicPath(pathname)) return;
    if (!session) {
      router.replace("/account/login");
    }
  }, [session, status, pathname, router]);

  if (status === "loading" && !isPublicPath(pathname)) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-sans text-muted">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
