"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AdminFooterLink() {
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string | null })?.role;
  if (status !== "authenticated" || role !== "ADMIN") return null;
  return (
    <Link
      href="/admin"
      className="font-sans text-sm text-sage-dark hover:text-text transition-colors"
    >
      Admin
    </Link>
  );
}
