"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import SectionHeading from "@/components/SectionHeading";
import Button from "@/components/Button";

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <SectionHeading
          title="Your account"
          subtitle="Manage your orders, details, and preferences."
        />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/account/orders"
            className="block border border-border rounded-lg bg-surface p-6 hover:border-sage-2 transition-colors"
          >
            <h2 className="font-sans text-lg font-medium text-text">Orders</h2>
            <p className="mt-1 font-sans text-sm text-muted">View order history and track shipments.</p>
          </Link>
          <Link
            href="/account/addresses"
            className="block border border-border rounded-lg bg-surface p-6 hover:border-sage-2 transition-colors"
          >
            <h2 className="font-sans text-lg font-medium text-text">Addresses</h2>
            <p className="mt-1 font-sans text-sm text-muted">Save shipping addresses for faster checkout.</p>
          </Link>
          <Link
            href="/account/settings"
            className="block border border-border rounded-lg bg-surface p-6 hover:border-sage-2 transition-colors"
          >
            <h2 className="font-sans text-lg font-medium text-text">Settings</h2>
            <p className="mt-1 font-sans text-sm text-muted">Update your profile and password.</p>
          </Link>
        </div>
        <div className="mt-10 pt-8 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
