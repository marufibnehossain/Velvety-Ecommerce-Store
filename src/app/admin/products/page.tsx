"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  slug: string;
  productCode: string | null;
  name: string;
  price: number;
  compareAt: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  category: Category;
  tags: string[];
  shortDesc: string;
  longDesc: string | null;
  ingredients: string | null;
  howToUse: string | null;
  stock: number;
  trackInventory?: boolean;
  badge?: string | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"stock" | "category" | "delete" | "">("");
  const [bulkValue, setBulkValue] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    productCode: "",
    name: "",
    price: "",
    compareAt: "",
    rating: "0",
    reviewCount: "0",
    images: "",
    categoryId: "",
    tags: "",
    shortDesc: "",
    longDesc: "",
    ingredients: "",
    howToUse: "",
    stock: "0",
    trackInventory: true,
    badge: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (_) {}
    setLoading(false);
  }

  function openNew() {
    setForm({
      slug: "",
      productCode: "",
      name: "",
      price: "",
      compareAt: "",
      rating: "0",
      reviewCount: "0",
      images: "",
      categoryId: categories[0]?.id || "",
      tags: "",
      shortDesc: "",
      longDesc: "",
      ingredients: "",
      howToUse: "",
      stock: "0",
      trackInventory: true,
      badge: "",
    });
    setError("");
    setModal("new");
  }

  function openEdit(p: Product) {
    setForm({
      slug: p.slug,
      productCode: p.productCode || "",
      name: p.name,
      price: String(p.price),
      compareAt: p.compareAt ? String(p.compareAt) : "",
      rating: String(p.rating),
      reviewCount: String(p.reviewCount),
      images: p.images.join(", "),
      categoryId: p.category.id,
      tags: p.tags.join(", "),
      shortDesc: p.shortDesc,
      longDesc: p.longDesc || "",
      ingredients: p.ingredients || "",
      howToUse: p.howToUse || "",
      stock: String(p.stock),
      trackInventory: p.trackInventory !== false,
      badge: p.badge ?? "",
    });
    setError("");
    setModal(p);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim(),
        productCode: form.productCode.trim() || null,
        name: form.name.trim(),
        price: parseFloat(form.price) || 0,
        compareAt: form.compareAt ? parseFloat(form.compareAt) : null,
        rating: parseFloat(form.rating) || 0,
        reviewCount: parseInt(form.reviewCount, 10) || 0,
        images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
        categoryId: form.categoryId,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        shortDesc: form.shortDesc.trim(),
        longDesc: form.longDesc.trim() || null,
        ingredients: form.ingredients.trim() || null,
        howToUse: form.howToUse.trim() || null,
        stock: parseInt(form.stock, 10) || 0,
        trackInventory: form.trackInventory,
        badge: form.badge?.trim() || null,
      };
      if (modal === "new") {
        const res = await fetch("/api/admin/products", {
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
        const res = await fetch(`/api/admin/products/${modal.id}`, {
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
      loadData();
    } catch (_) {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Delete product "${p.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (_) {}
  }

  const filteredProducts = products.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.slug.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter && p.category.id !== categoryFilter) return false;
    const unlimited = p.trackInventory === false;
    if (stockFilter === "out" && (unlimited || p.stock > 0)) return false;
    if (stockFilter === "low" && (unlimited || p.stock === 0 || p.stock > 5)) return false;
    if (stockFilter === "in" && !unlimited && p.stock <= 5) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-text">Products</h1>
          <p className="font-sans text-sm text-muted mt-1">
            {filteredProducts.length} of {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openNew} variant="primary" disabled={categories.length === 0}>
          New product
        </Button>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
        >
          <option value="">All stock status</option>
          <option value="out">Out of stock</option>
          <option value="low">Low stock (≤5)</option>
          <option value="in">In stock</option>
        </select>
      </div>
      {!loading && selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-4 p-4 rounded-lg border border-border bg-sage-1/30">
          <span className="font-sans text-sm text-text">{selectedIds.size} selected</span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value as "stock" | "category" | "delete" | "")}
            className="rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm"
          >
            <option value="">Bulk action…</option>
            <option value="stock">Set stock to</option>
            <option value="category">Set category to</option>
            <option value="delete">Delete</option>
          </select>
          {bulkAction === "stock" && (
            <input
              type="number"
              min="0"
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              placeholder="0"
              className="w-24 rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm"
            />
          )}
          {bulkAction === "category" && (
            <select
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              className="rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            disabled={bulkSaving || (bulkAction === "stock" && bulkValue === "") || (bulkAction === "category" && !bulkValue)}
            onClick={async () => {
              if (bulkAction === "delete" && !confirm("Delete selected products? This cannot be undone.")) return;
              setBulkSaving(true);
              try {
                const res = await fetch("/api/admin/products/bulk", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ids: Array.from(selectedIds),
                    action: bulkAction,
                    value: bulkAction === "stock" ? parseInt(bulkValue, 10) : bulkAction === "category" ? bulkValue : undefined,
                  }),
                });
                if (res.ok) {
                  setSelectedIds(new Set());
                  setBulkAction("");
                  setBulkValue("");
                  loadData();
                }
              } catch (_) {}
              setBulkSaving(false);
            }}
            className="px-4 py-2 rounded-lg border border-sage-dark bg-sage-dark text-white font-sans text-sm hover:opacity-90 disabled:opacity-50"
          >
            {bulkSaving ? "Applying…" : "Apply"}
          </button>
          <button
            type="button"
            onClick={() => { setSelectedIds(new Set()); setBulkAction(""); setBulkValue(""); }}
            className="font-sans text-sm text-muted hover:text-text"
          >
            Clear selection
          </button>
        </div>
      )}
      {loading ? (
        <p className="font-sans text-muted">Loading…</p>
      ) : (
        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-border bg-sage-1/50">
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id))}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
                      else setSelectedIds(new Set());
                    }}
                    className="rounded border-border"
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left p-3 font-medium text-text">Name</th>
                <th className="text-left p-3 font-medium text-text">Slug</th>
                <th className="text-right p-3 font-medium text-text">Price</th>
                <th className="text-right p-3 font-medium text-text">Stock</th>
                <th className="text-left p-3 font-medium text-text">Category</th>
                <th className="p-3" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-muted text-center">
                    {products.length === 0 ? "No products yet" : "No products match your filters"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds((s) => new Set([...s, p.id]));
                          else setSelectedIds((s) => { const n = new Set(s); n.delete(p.id); return n; });
                        }}
                        className="rounded border-border"
                        aria-label={`Select ${p.name}`}
                      />
                    </td>
                    <td className="p-3 font-medium text-text">{p.name}</td>
                    <td className="p-3 text-muted">{p.slug}</td>
                    <td className="p-3 text-right text-text">${p.price.toFixed(2)}</td>
                    <td className={`p-3 text-right ${p.trackInventory === false ? "text-muted" : p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-text"}`}>
                      {p.trackInventory === false ? "∞" : p.stock}
                    </td>
                    <td className="p-3 text-muted">{p.category.name}</td>
                    <td className="p-3 flex gap-2">
                      <Link
                        href={`/admin/products/${p.id}/variations`}
                        className="font-sans text-sm text-sage-dark hover:underline"
                      >
                        Variations
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="font-sans text-sm text-sage-dark hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 overflow-y-auto" onClick={() => !saving && setModal(null)}>
          <div className="bg-bg border border-border rounded-lg shadow-lg w-full max-w-2xl p-6 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-sans text-lg font-semibold text-text mb-4">
              {modal === "new" ? "New product" : "Edit product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="font-sans text-sm text-red-600">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-sm font-medium text-text mb-1">Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-text mb-1">Product code</label>
                  <input
                    type="text"
                    value={form.productCode}
                    onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-sans text-sm font-medium text-text mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-text mb-1">Compare at ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.compareAt}
                    onChange={(e) => setForm({ ...form, compareAt: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-text mb-1.5">Stock</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 font-sans text-sm text-text cursor-pointer">
                      <input
                        type="radio"
                        name="stockMode"
                        checked={form.trackInventory}
                        onChange={() => setForm({ ...form, trackInventory: true })}
                        className="rounded border-border"
                      />
                      Limited (track quantity)
                    </label>
                    <label className="flex items-center gap-2 font-sans text-sm text-text cursor-pointer">
                      <input
                        type="radio"
                        name="stockMode"
                        checked={!form.trackInventory}
                        onChange={() => setForm({ ...form, trackInventory: false })}
                        className="rounded border-border"
                      />
                      Unlimited
                    </label>
                  </div>
                  {form.trackInventory && (
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-sans text-sm font-medium text-text mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-text mb-1">Review count</label>
                  <input
                    type="number"
                    min="0"
                    value={form.reviewCount}
                    onChange={(e) => setForm({ ...form, reviewCount: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-text mb-1">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-text mb-1">Badge</label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  >
                    <option value="">None</option>
                    <option value="NEW">New</option>
                    <option value="BESTSELLER">Bestseller</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Images (comma-separated URLs or upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.images}
                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                    placeholder="/images/product.jpg, /uploads/photo.jpg"
                    className="flex-1 rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  />
                  <label className="shrink-0 px-4 py-2 rounded-lg border border-border bg-surface font-sans text-sm text-text cursor-pointer hover:bg-sage-1/50">
                    Upload
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const fd = new FormData();
                        fd.append("file", f);
                        try {
                          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                          const data = await res.json().catch(() => ({}));
                          if (data.url) {
                            setForm((prev) => ({
                              ...prev,
                              images: prev.images ? `${prev.images.trim()}, ${data.url}` : data.url,
                            }));
                          }
                        } catch (_) {}
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="serum, calming, skincare"
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Short description *</label>
                <textarea
                  value={form.shortDesc}
                  onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Long description</label>
                <textarea
                  value={form.longDesc}
                  onChange={(e) => setForm({ ...form, longDesc: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Ingredients</label>
                <textarea
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">How to use</label>
                <textarea
                  value={form.howToUse}
                  onChange={(e) => setForm({ ...form, howToUse: e.target.value })}
                  rows={2}
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
