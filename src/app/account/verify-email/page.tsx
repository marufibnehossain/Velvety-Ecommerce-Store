"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");
  const sent = searchParams.get("sent");

  if (success === "1") {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-sage-1 border border-sage-2 flex items-center justify-center mx-auto mb-6 text-sage-dark text-2xl">
            ✓
          </div>
          <SectionHeading
            title="Email verified"
            subtitle="Your account is active. You can now sign in."
          />
          <Button href="/account/login?verified=1" variant="primary" className="mt-8 w-full justify-center">
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    const messages: Record<string, string> = {
      invalid: "This link is invalid or has already been used.",
      expired: "This link has expired. Please sign up again or request a new verification email.",
      missing: "No verification link was provided.",
      server: "Something went wrong. Please try again.",
    };
    const message = messages[error] ?? "Something went wrong. Please try again.";
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <SectionHeading
            title="Verification failed"
            subtitle={message}
          />
          <div className="mt-8 flex flex-col gap-4">
            <Button href="/account/register" variant="primary" className="w-full justify-center">
              Sign up again
            </Button>
            <Link href="/account/login" className="font-sans text-sm text-muted hover:text-text">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (sent === "1") {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <SectionHeading
            title="Check your email"
            subtitle="We sent a verification link to your email address. Click the link in the email to activate your account. The link expires in 24 hours."
          />
          <p className="mt-6 font-sans text-sm text-muted">
            Didn’t receive the email? Check your spam folder or{" "}
            <Link href="/account/register" className="text-sage-dark hover:underline">
              try again
            </Link>
            .
          </p>
          <Link href="/account/login" className="inline-block mt-8 font-sans text-sm text-muted hover:text-text">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <SectionHeading
          title="Verify your email"
          subtitle="If you just signed up, check your inbox for a verification link."
        />
        <Button href="/account/login" variant="primary" className="mt-8 w-full justify-center">
          Go to sign in
        </Button>
      </div>
    </div>
  );
}
