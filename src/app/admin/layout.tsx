"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, type ReactNode } from "react";

const SIDEBAR_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/reviews", label: "Reviews" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (status === "loading") return;
    if (isLoginPage) return;
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    const role = (session.user as { role?: string | null })?.role;
    if (role !== "ADMIN") {
      router.replace("/account");
    }
  }, [session, status, pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-sans text-muted">Loading…</p>
      </div>
    );
  }

  const role = (session.user as { role?: string | null })?.role;
  if (role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/admin" className="font-sans text-lg font-semibold text-sage-dark uppercase tracking-wide">
            Velvety Admin
          </Link>
        </div>
        <nav className="p-2 flex-1" aria-label="Admin navigation">
          {SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-lg font-sans text-sm transition-colors ${
                pathname === link.href ? "bg-sage-1 text-sage-dark" : "text-text hover:bg-sage-1/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <Link
            href="/"
            className="block px-3 py-2 font-sans text-sm text-muted hover:text-text"
          >
            View store
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full text-left px-3 py-2 font-sans text-sm text-muted hover:text-text"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
