"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import RatingStars from "@/components/RatingStars";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  body: string | null;
  createdAt: string;
};

interface ProductReviewsProps {
  slug: string;
}

export default function ProductReviews({ slug }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ authorName: "", rating: 5, body: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${slug}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (session?.user?.name) setForm((f) => ({ ...f, authorName: session.user.name ?? "" }));
  }, [session?.user?.name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: form.authorName.trim(),
          rating: form.rating,
          body: form.body.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setForm((f) => ({ ...f, body: "" }));
        setReviews((prev) => [
          {
            id: data.reviewId ?? "",
            authorName: form.authorName.trim(),
            rating: form.rating,
            body: form.body.trim() || null,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        setError(data.error ?? "Failed to submit review");
      }
    } catch (_) {
      setError("Failed to submit review");
    }
    setSubmitting(false);
  }

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="font-sans text-xl font-medium text-text mb-6">Reviews</h2>

      <form onSubmit={handleSubmit} className="mb-10 p-6 rounded-lg border border-border bg-surface space-y-4">
        <p className="font-sans text-sm text-muted">Write a review</p>
        {error && <p className="font-sans text-sm text-red-600">{error}</p>}
        <div>
          <label className="block font-sans text-sm font-medium text-text mb-1">Your name *</label>
          <input
            type="text"
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            required
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
            placeholder="Name"
          />
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-text mb-1">Rating *</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, rating: r })}
                className={`px-2 py-1 rounded font-sans text-sm ${form.rating >= r ? "text-amber-500" : "text-muted"}`}
                aria-label={`${r} stars`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-sans text-sm font-medium text-text mb-1">Review (optional)</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
            placeholder="Share your experience..."
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg border border-sage-dark bg-sage-dark text-white font-sans text-sm hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>

      {loading ? (
        <p className="font-sans text-muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="font-sans text-muted">No reviews yet. Be the first to review!</p>
      ) : (
        <ul className="space-y-6">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-sans font-medium text-text">{r.authorName}</span>
                <RatingStars rating={r.rating} reviewCount={0} />
              </div>
              <p className="font-sans text-xs text-muted mb-2">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
              {r.body && <p className="font-sans text-sm text-text">{r.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
