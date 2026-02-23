"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";

type Attribute = {
  id: string;
  name: string;
  values: string[];
};

type Variation = {
  id: string;
  attributes: Record<string, string>;
  price: number | null;
  stock: number;
  sku: string | null;
  images: string[] | null;
};

export default function ProductVariationsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [loading, setLoading] = useState(true);
  const [attrModal, setAttrModal] = useState<"new" | Attribute | null>(null);
  const [varModal, setVarModal] = useState<"new" | Variation | null>(null);
  const [attrForm, setAttrForm] = useState({ name: "", values: "" });
  const [varForm, setVarForm] = useState<{
    attributes: Record<string, string>;
    price: string;
    stock: string;
    sku: string;
    images: string;
  }>({ attributes: {}, price: "", stock: "0", sku: "", images: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (productId) loadData();
  }, [productId]);

  async function loadData() {
    try {
      const [productRes, attrsRes, varsRes] = await Promise.all([
        fetch(`/api/admin/products/${productId}`),
        fetch(`/api/admin/products/${productId}/attributes`),
        fetch(`/api/admin/products/${productId}/variations`),
      ]);
      if (productRes.ok) {
        const p = await productRes.json();
        setProduct({ id: p.id, name: p.name, slug: p.slug });
      }
      if (attrsRes.ok) setAttributes(await attrsRes.json());
      if (varsRes.ok) setVariations(await varsRes.json());
    } catch (_) {}
    setLoading(false);
  }

  function openNewAttribute() {
    setAttrForm({ name: "", values: "" });
    setError("");
    setAttrModal("new");
  }

  function openEditAttribute(a: Attribute) {
    setAttrForm({ name: a.name, values: a.values.join(", ") });
    setError("");
    setAttrModal(a);
  }

  async function handleAttributeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const values = attrForm.values.split(",").map(s => s.trim()).filter(Boolean);
      if (!attrForm.name.trim() || values.length === 0) {
        setError("Name and at least one value required");
        setSaving(false);
        return;
      }
      if (attrModal === "new") {
        const res = await fetch(`/api/admin/products/${productId}/attributes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: attrForm.name.trim(), values }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to create");
          setSaving(false);
          return;
        }
      } else if (attrModal) {
        const res = await fetch(`/api/admin/products/${productId}/attributes/${attrModal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: attrForm.name.trim(), values }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to update");
          setSaving(false);
          return;
        }
      }
      setAttrModal(null);
      loadData();
    } catch (_) {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  async function handleDeleteAttribute(a: Attribute) {
    if (!confirm(`Delete attribute "${a.name}"? This will also delete all variations using it.`)) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}/attributes/${a.id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (_) {}
  }

  function generateVariations() {
    if (attributes.length === 0) {
      alert("Add attributes first");
      return;
    }
    const combinations: Record<string, string>[] = [];
    function combine(current: Record<string, string>, attrs: Attribute[], index: number) {
      if (index === attrs.length) {
        combinations.push({ ...current });
        return;
      }
      const attr = attrs[index];
      for (const value of attr.values) {
        combine({ ...current, [attr.name]: value }, attrs, index + 1);
      }
    }
    combine({}, attributes, 0);
    setVariations(combinations.map((attrs, i) => ({
      id: `temp-${i}`,
      attributes: attrs,
      price: null,
      stock: 0,
      sku: null,
      images: null,
    })));
  }

  function openNewVariation() {
    if (attributes.length === 0) {
      alert("Add attributes first");
      return;
    }
    const initialAttrs: Record<string, string> = {};
    attributes.forEach(a => {
      if (a.values.length > 0) initialAttrs[a.name] = a.values[0];
    });
    setVarForm({ attributes: initialAttrs, price: "", stock: "0", sku: "", images: "" });
    setError("");
    setVarModal("new");
  }

  function openEditVariation(v: Variation) {
    setVarForm({
      attributes: v.attributes,
      price: v.price ? String(v.price) : "",
      stock: String(v.stock),
      sku: v.sku || "",
      images: v.images ? v.images.join(", ") : "",
    });
    setError("");
    setVarModal(v);
  }

  async function handleVariationSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        attributes: varForm.attributes,
        price: varForm.price ? parseFloat(varForm.price) : null,
        stock: parseInt(varForm.stock, 10) || 0,
        sku: varForm.sku.trim() || null,
        images: varForm.images.split(",").map(s => s.trim()).filter(Boolean),
      };
      if (varModal === "new") {
        const res = await fetch(`/api/admin/products/${productId}/variations`, {
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
      } else if (varModal) {
        const res = await fetch(`/api/admin/products/${productId}/variations/${varModal.id}`, {
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
      setVarModal(null);
      loadData();
    } catch (_) {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  async function handleDeleteVariation(v: Variation) {
    if (!confirm("Delete this variation?")) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}/variations/${v.id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (_) {}
  }

  if (loading) {
    return <p className="font-sans text-muted">Loading…</p>;
  }
  if (!product) {
    return (
      <div>
        <p className="font-sans text-muted">Product not found.</p>
        <Link href="/admin/products" className="mt-4 inline-block font-sans text-sm text-sage-dark hover:underline">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/products" className="font-sans text-sm text-sage-dark hover:underline mb-6 inline-block">
        ← Back to products
      </Link>
      <h1 className="font-sans text-2xl font-semibold text-text mb-2">
        {product.name} — Attributes & Variations
      </h1>
      <p className="font-sans text-sm text-muted mb-8">Manage product attributes and variations</p>

      {/* Attributes Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-lg font-medium text-text">Attributes</h2>
          <Button onClick={openNewAttribute} variant="primary">New attribute</Button>
        </div>
        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          {attributes.length === 0 ? (
            <div className="p-6 text-muted text-center">
              <p className="font-sans text-sm">No attributes yet. Add attributes like Size, Color, etc.</p>
            </div>
          ) : (
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-border bg-sage-1/50">
                  <th className="text-left p-3 font-medium text-text">Name</th>
                  <th className="text-left p-3 font-medium text-text">Values</th>
                  <th className="p-3" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {attributes.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium text-text">{a.name}</td>
                    <td className="p-3 text-muted">{a.values.join(", ")}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditAttribute(a)}
                        className="font-sans text-sm text-sage-dark hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttribute(a)}
                        className="font-sans text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Variations Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-lg font-medium text-text">Variations</h2>
          <div className="flex gap-2">
            {attributes.length > 0 && (
              <Button onClick={openNewVariation} variant="primary">New variation</Button>
            )}
          </div>
        </div>
        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          {variations.length === 0 ? (
            <div className="p-6 text-muted text-center">
              <p className="font-sans text-sm">No variations yet. Add attributes first, then create variations.</p>
            </div>
          ) : (
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-border bg-sage-1/50">
                  {attributes.map((a) => (
                    <th key={a.id} className="text-left p-3 font-medium text-text">{a.name}</th>
                  ))}
                  <th className="text-right p-3 font-medium text-text">Price</th>
                  <th className="text-right p-3 font-medium text-text">Stock</th>
                  <th className="text-left p-3 font-medium text-text">SKU</th>
                  <th className="p-3" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {variations.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0">
                    {attributes.map((a) => (
                      <td key={a.id} className="p-3 text-text">{v.attributes[a.name] || "—"}</td>
                    ))}
                    <td className="p-3 text-right text-text">
                      {v.price ? `$${v.price.toFixed(2)}` : "Base price"}
                    </td>
                    <td className={`p-3 text-right ${v.stock === 0 ? "text-red-600" : v.stock <= 5 ? "text-amber-600" : "text-text"}`}>
                      {v.stock}
                    </td>
                    <td className="p-3 text-muted">{v.sku || "—"}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditVariation(v)}
                        className="font-sans text-sm text-sage-dark hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVariation(v)}
                        className="font-sans text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Attribute Modal */}
      {attrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={() => !saving && setAttrModal(null)}>
          <div className="bg-bg border border-border rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-sans text-lg font-semibold text-text mb-4">
              {attrModal === "new" ? "New attribute" : "Edit attribute"}
            </h3>
            <form onSubmit={handleAttributeSubmit} className="space-y-4">
              {error && <p className="font-sans text-sm text-red-600">{error}</p>}
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Name *</label>
                <input
                  type="text"
                  value={attrForm.name}
                  onChange={(e) => setAttrForm({ ...attrForm, name: e.target.value })}
                  placeholder="e.g., Size, Color"
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Values (comma-separated) *</label>
                <input
                  type="text"
                  value={attrForm.values}
                  onChange={(e) => setAttrForm({ ...attrForm, values: e.target.value })}
                  placeholder="e.g., Small, Medium, Large"
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving…" : attrModal === "new" ? "Create" : "Update"}
                </Button>
                <button
                  type="button"
                  onClick={() => setAttrModal(null)}
                  className="px-4 py-2 font-sans text-sm text-muted hover:text-text border border-border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Variation Modal */}
      {varModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 overflow-y-auto" onClick={() => !saving && setVarModal(null)}>
          <div className="bg-bg border border-border rounded-lg shadow-lg w-full max-w-md p-6 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-sans text-lg font-semibold text-text mb-4">
              {varModal === "new" ? "New variation" : "Edit variation"}
            </h3>
            <form onSubmit={handleVariationSubmit} className="space-y-4">
              {error && <p className="font-sans text-sm text-red-600">{error}</p>}
              {attributes.map((a) => (
                <div key={a.id}>
                  <label className="block font-sans text-sm font-medium text-text mb-1">{a.name} *</label>
                  <select
                    value={varForm.attributes[a.name] || ""}
                    onChange={(e) => setVarForm({
                      ...varForm,
                      attributes: { ...varForm.attributes, [a.name]: e.target.value },
                    })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                    required
                  >
                    <option value="">Select {a.name}</option>
                    {a.values.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Price override ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={varForm.price}
                  onChange={(e) => setVarForm({ ...varForm, price: e.target.value })}
                  placeholder="Leave empty to use base price"
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Stock *</label>
                <input
                  type="number"
                  min="0"
                  value={varForm.stock}
                  onChange={(e) => setVarForm({ ...varForm, stock: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">SKU</label>
                <input
                  type="text"
                  value={varForm.sku}
                  onChange={(e) => setVarForm({ ...varForm, sku: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Images (comma-separated URLs or upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={varForm.images}
                    onChange={(e) => setVarForm({ ...varForm, images: e.target.value })}
                    placeholder="/uploads/variation.jpg"
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
                            setVarForm((prev) => ({
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
                <p className="mt-1 font-sans text-xs text-muted">These images will show when this variation is selected</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving…" : varModal === "new" ? "Create" : "Update"}
                </Button>
                <button
                  type="button"
                  onClick={() => setVarModal(null)}
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
