"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <SectionHeading
            title="Invalid link"
            subtitle="This reset link is missing or invalid. Please request a new password reset."
          />
          <Button href="/account/forgot-password" variant="primary" className="mt-8">
            Request reset link
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <SectionHeading
            title="Password updated"
            subtitle="Your password has been reset. You can now sign in."
          />
          <Button href="/account/login" variant="primary" className="mt-8 w-full justify-center">
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <SectionHeading
          title="Set new password"
          subtitle="Enter your new password below."
        />
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="password" className="block font-sans text-sm font-medium text-text mb-1">New password (min 8 characters)</label>
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
          <div>
            <label htmlFor="confirm" className="block font-sans text-sm font-medium text-text mb-1">Confirm password</label>
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full justify-center">
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
        <p className="mt-6 font-sans text-sm text-muted text-center">
          <Link href="/account/login" className="text-sage-dark hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
