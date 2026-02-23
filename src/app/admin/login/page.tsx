"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/components/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (result?.error === "EMAIL_NOT_VERIFIED") {
        setError("Please verify your email before signing in.");
        setLoading(false);
        return;
      }
      if (result?.error || !result?.ok) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      // Wait a moment for session to update, then check role
      await new Promise((resolve) => setTimeout(resolve, 100));
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;
      if (role !== "ADMIN") {
        setError(`Access denied. Your role is "${role || "not set"}" but ADMIN is required. Please sign out and sign in again if you were just granted admin access.`);
        await signIn("signout", { redirect: false });
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="font-sans text-2xl font-semibold text-sage-dark uppercase tracking-wide mb-1">
          Velvety Admin
        </h1>
        <p className="font-sans text-sm text-muted mb-8">Sign in with an admin account.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="block font-sans text-sm font-medium text-text mb-1">
              Email
            </label>
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
            <label htmlFor="password" className="block font-sans text-sm font-medium text-text mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 font-sans text-sm text-muted text-center">
          <a href="/account/login" className="text-sage-dark hover:underline">
            Customer login
          </a>
        </p>
      </div>
    </div>
  );
}
