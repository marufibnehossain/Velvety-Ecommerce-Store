"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) setCategories(await res.json());
    } catch (_) {}
    setLoading(false);
  }

  function openNew() {
    setForm({ name: "", slug: "" });
    setError("");
    setModal("new");
  }

  function openEdit(c: Category) {
    setForm({ name: c.name, slug: c.slug });
    setError("");
    setModal(c);
  }

  function updateSlugFromName(name: string) {
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setForm({ ...form, name, slug });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.toLowerCase().trim().replace(/\s+/g, "-"),
      };
      if (modal === "new") {
        const res = await fetch("/api/admin/categories", {
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
        const res = await fetch(`/api/admin/categories/${modal.id}`, {
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
      loadCategories();
    } catch (_) {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  async function handleDelete(c: Category) {
    if (!confirm(`Delete category "${c.name}"? Products using this category will need to be reassigned first.`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Failed to delete");
        return;
      }
      loadCategories();
    } catch (_) {
      alert("Failed to delete");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sans text-2xl font-semibold text-text">Categories</h1>
        <Button onClick={openNew} variant="primary">New category</Button>
      </div>
      {loading ? (
        <p className="font-sans text-muted">Loading…</p>
      ) : (
        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-border bg-sage-1/50">
                <th className="text-left p-3 font-medium text-text">Name</th>
                <th className="text-left p-3 font-medium text-text">Slug</th>
                <th className="p-3" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-muted text-center">No categories yet</td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium text-text">{c.name}</td>
                    <td className="p-3 text-muted">{c.slug}</td>
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
              {modal === "new" ? "New category" : "Edit category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="font-sans text-sm text-red-600">{error}</p>}
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateSlugFromName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
                <p className="mt-1 font-sans text-xs text-muted">URL-friendly identifier (e.g., skincare, body-care)</p>
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
