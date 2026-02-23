"use client";

import { useState } from "react";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Button from "@/components/Button";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-xl">
        <Link href="/account" className="font-sans text-sm text-muted hover:text-text mb-8 inline-block">
          ← Account
        </Link>
        <SectionHeading
          title="Settings"
          subtitle="Update your profile and preferences."
        />
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="name" className="block font-sans text-sm font-medium text-text mb-1">Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block font-sans text-sm font-medium text-text mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
          </div>
          <Button type="submit" variant="primary">
            Save changes
          </Button>
        </form>
      </div>
    </div>
  );
}
