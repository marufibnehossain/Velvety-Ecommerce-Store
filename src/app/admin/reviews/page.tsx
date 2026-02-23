"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Review = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  authorName: string;
  rating: number;
  body: string | null;
  status: string;
  createdAt: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/reviews");
        if (res.ok) setReviews(await res.json());
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      }
    } catch (_) {}
    setSaving(null);
  }

  if (loading) return <p className="font-sans text-muted">Loading…</p>;

  return (
    <div>
      <h1 className="font-sans text-2xl font-semibold text-text mb-6">Reviews</h1>
      <div className="border border-border rounded-lg bg-surface overflow-hidden">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-border bg-sage-1/50">
              <th className="text-left p-3 font-medium text-text">Product</th>
              <th className="text-left p-3 font-medium text-text">Author</th>
              <th className="text-right p-3 font-medium text-text">Rating</th>
              <th className="text-left p-3 font-medium text-text">Body</th>
              <th className="text-left p-3 font-medium text-text">Status</th>
              <th className="p-3" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-muted text-center">No reviews yet</td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <Link href={`/product/${r.productSlug}`} className="text-sage-dark hover:underline">
                      {r.productName}
                    </Link>
                  </td>
                  <td className="p-3 text-text">{r.authorName}</td>
                  <td className="p-3 text-right text-muted">{r.rating}/5</td>
                  <td className="p-3 text-muted max-w-xs truncate">{r.body ?? "—"}</td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      disabled={saving === r.id}
                      className="rounded border border-border bg-bg px-2 py-1 font-sans text-sm"
                    >
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending</option>
                      <option value="HIDDEN">Hidden</option>
                    </select>
                  </td>
                  <td className="p-3 text-muted text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
