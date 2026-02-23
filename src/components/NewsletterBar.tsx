"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("done");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="bg-sage-2 border-y border-border py-6 md:py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="font-sans text-hero-text md:text-lg font-medium">
            Subscribe to get 10% off your first order
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 md:max-w-md gap-0 rounded-lg overflow-hidden bg-white border border-border shadow-sm"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 min-w-0 px-4 py-3 font-sans text-sm text-text placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-4 py-3 bg-white text-sage-dark font-sans font-medium hover:bg-sage-1 transition-colors disabled:opacity-70"
              aria-label="Subscribe"
            >
              {status === "loading" ? "…" : status === "done" ? "✓" : status === "error" ? "!" : ">"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
