"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderCents: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | Coupon | null>(null);
  const [form, setForm] = useState({ code: "", type: "PERCENT" as "PERCENT" | "FIXED", value: "10", minOrderCents: "", maxUses: "", expiresAt: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) setCoupons(await res.json());
    } catch (_) {}
    setLoading(false);
  }

  function openNew() {
    setForm({ code: "", type: "PERCENT", value: "10", minOrderCents: "", maxUses: "", expiresAt: "" });
    setError("");
    setModal("new");
  }

  function openEdit(c: Coupon) {
    setForm({
      code: c.code,
      type: c.type as "PERCENT" | "FIXED",
      value: c.type === "FIXED" ? (c.value / 100).toFixed(2) : String(c.value),
      minOrderCents: c.minOrderCents != null ? String(c.minOrderCents / 100) : "",
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : "",
    });
    setError("");
    setModal(c);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: form.type === "PERCENT" ? Math.min(100, Math.max(0, parseInt(form.value, 10))) : Math.round(parseFloat(form.value) * 100),
        minOrderCents: form.minOrderCents ? Math.round(parseFloat(form.minOrderCents) * 100) : null,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      if (modal === "new") {
        const res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to create");
          setSaving(false);
          return;
        }
      } else {
        const res = await fetch(`/api/admin/coupons/${modal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to update");
          setSaving(false);
          return;
        }
      }
      setModal(null);
      loadCoupons();
    } catch (_) {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  async function handleDelete(c: Coupon) {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
      if (res.ok) loadCoupons();
    } catch (_) {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sans text-2xl font-semibold text-text">Coupons</h1>
        <Button onClick={openNew} variant="primary">New coupon</Button>
      </div>
      {loading ? (
        <p className="font-sans text-muted">Loading…</p>
      ) : (
        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-border bg-sage-1/50">
                <th className="text-left p-3 font-medium text-text">Code</th>
                <th className="text-left p-3 font-medium text-text">Type</th>
                <th className="text-right p-3 font-medium text-text">Value</th>
                <th className="text-right p-3 font-medium text-text">Min order</th>
                <th className="text-right p-3 font-medium text-text">Uses</th>
                <th className="text-left p-3 font-medium text-text">Expires</th>
                <th className="p-3" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-muted text-center">No coupons yet</td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium text-text">{c.code}</td>
                    <td className="p-3 text-muted">{c.type}</td>
                    <td className="p-3 text-right text-text">
                      {c.type === "PERCENT" ? `${c.value}%` : `$${(c.value / 100).toFixed(2)}`}
                    </td>
                    <td className="p-3 text-right text-muted">
                      {c.minOrderCents != null ? `$${(c.minOrderCents / 100).toFixed(2)}` : "—"}
                    </td>
                    <td className="p-3 text-right text-muted">
                      {c.maxUses != null ? `${c.usedCount ?? 0} / ${c.maxUses}` : (c.usedCount ?? 0)}
                    </td>
                    <td className="p-3 text-muted">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="font-sans text-sm text-sage-dark hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="font-sans text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={() => !saving && setModal(null)}>
          <div className="bg-bg border border-border rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-sans text-lg font-semibold text-text mb-4">
              {modal === "new" ? "New coupon" : "Edit coupon"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="font-sans text-sm text-red-600">{error}</p>}
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENT" | "FIXED" })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                >
                  <option value="PERCENT">Percent off</option>
                  <option value="FIXED">Fixed amount off</option>
                </select>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">
                  Value {form.type === "PERCENT" ? "(0–100)" : "($)"}
                </label>
                <input
                  type={form.type === "PERCENT" ? "number" : "number"}
                  min={form.type === "PERCENT" ? 0 : 0}
                  max={form.type === "PERCENT" ? 100 : undefined}
                  step={form.type === "FIXED" ? 0.01 : 1}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Min order ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderCents}
                  onChange={(e) => setForm({ ...form, minOrderCents: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Max uses</label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  placeholder="Unlimited if empty"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Expires</label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving…" : modal === "new" ? "Create" : "Update"}
                </Button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 font-sans text-sm text-muted hover:text-text border border-border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
