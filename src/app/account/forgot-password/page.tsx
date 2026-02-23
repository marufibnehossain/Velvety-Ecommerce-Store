"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <SectionHeading
            title="Check your email"
            subtitle="If an account exists with that email, we sent a link to reset your password. The link expires in 1 hour."
          />
          <Link href="/account/login" className="inline-block mt-8 font-sans text-sm text-sage-dark hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <SectionHeading
          title="Forgot password?"
          subtitle="Enter your email and we’ll send you a link to reset your password."
        />
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="block font-sans text-sm font-medium text-text mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full justify-center">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <p className="mt-6 font-sans text-sm text-muted text-center">
          <Link href="/account/login" className="text-sage-dark hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
