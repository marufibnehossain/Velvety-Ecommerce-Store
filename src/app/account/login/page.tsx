"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verified = searchParams.get("verified");

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
        setError("Please verify your email before signing in. Check your inbox for the verification link.");
        setLoading(false);
        return;
      }
      if (result?.error || !result?.ok) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {verified === "1" && (
          <p className="mb-4 font-sans text-sm text-sage-dark bg-sage-1 border border-sage-2 rounded-lg px-4 py-2">
            Your email is verified. You can sign in below.
          </p>
        )}
        <SectionHeading
          title="Welcome back"
          subtitle="Sign in to your account to view orders and manage your profile."
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
          <div>
            <label htmlFor="password" className="block font-sans text-sm font-medium text-text mb-1">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
            <Link href="/account/forgot-password" className="block mt-1 font-sans text-xs text-muted hover:text-sage-dark">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" variant="primary" className="w-full justify-center">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 font-sans text-sm text-muted text-center">
          Don’t have an account?{" "}
          <Link href="/account/register" className="text-sage-dark hover:underline">Create one</Link>
        </p>
        <p className="mt-2 font-sans text-sm text-muted text-center">
          <Link href="/admin/login" className="text-sage-dark hover:underline">Admin login</Link>
        </p>
      </div>
    </div>
  );
}
