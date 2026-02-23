"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function CartCount() {
  const total = useCartStore((s) => s.getTotalItems());
  if (total === 0) return null;
  return (
    <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] rounded-full bg-sage-dark text-hero-text text-xs font-sans flex items-center justify-center px-1">
      {total > 99 ? "99+" : total}
    </span>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 md:h-18 items-center justify-between">
          <Link
            href="/"
            className="font-sans text-xl font-semibold text-sage-dark hover:text-text transition-colors uppercase tracking-wide"
          >
            Velvety
          </Link>

          <nav
            className={`absolute top-full left-0 right-0 border-b border-border bg-bg md:static md:border-0 md:flex md:items-center md:gap-8 ${
              menuOpen ? "block" : "hidden"
            }`}
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-4 px-4 md:py-0 md:px-0 font-sans text-sm text-text hover:text-muted border-b border-border md:border-0 last:border-0"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/search"
              className="p-1.5 text-text hover:text-muted hidden sm:inline-flex"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </Link>
            <Link
              href="/account"
              className="p-1.5 text-text hover:text-muted hidden sm:inline-flex"
              aria-label="Account"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="8" r="2.5" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
            </Link>
            <Link
              href="/wishlist"
              className="p-1.5 text-text hover:text-muted hidden sm:inline-flex"
              aria-label="Wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </Link>
            <Link
              href="/cart"
              className="p-1.5 pr-6 text-text hover:text-muted relative inline-flex"
              aria-label="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <CartCount />
            </Link>
            <button
              type="button"
              className="md:hidden p-2 text-text hover:text-muted"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <span className="text-xl">×</span>
              ) : (
                <span className="text-xl">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
