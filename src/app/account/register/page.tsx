"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/account/verify-email?sent=1");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <SectionHeading
          title="Create an account"
          subtitle="Join us for order history, saved addresses, and exclusive offers. We’ll send a verification link to your email."
        />
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-sans text-sm font-medium text-text mb-1">Password (min 8 characters)</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full justify-center">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="mt-6 font-sans text-sm text-muted text-center">
          Already have an account?{" "}
          <Link href="/account/login" className="text-sage-dark hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
