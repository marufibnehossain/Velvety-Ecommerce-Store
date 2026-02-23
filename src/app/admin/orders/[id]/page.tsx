"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";

type OrderItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  variationId?: string | null;
  variationLabel?: string | null;
};
type Order = {
  id: string;
  email: string;
  name: string | null;
  address: string;
  city: string;
  zip: string;
  country: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  couponCode: string | null;
  status: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  createdAt: string;
  items: OrderItem[];
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setStatus(data.status);
          setTrackingNumber(data.trackingNumber ?? "");
          setTrackingCarrier(data.trackingCarrier ?? "");
        } else if (res.status === 404) {
          setOrder(null);
        }
      } catch (_) {}
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  async function handleUpdate() {
    if (!order) return;
    const changed =
      status !== order.status ||
      (trackingNumber || "") !== (order.trackingNumber ?? "") ||
      (trackingCarrier || "") !== (order.trackingCarrier ?? "");
    if (!changed) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || null,
          trackingCarrier: trackingCarrier || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
      }
    } catch (_) {}
    setSaving(false);
  }

  if (loading) {
    return <p className="font-sans text-muted">Loading…</p>;
  }
  if (!order) {
    return (
      <div>
        <p className="font-sans text-muted">Order not found.</p>
        <Link href="/admin/orders" className="mt-4 inline-block font-sans text-sm text-sage-dark hover:underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/orders" className="font-sans text-sm text-sage-dark hover:underline mb-6 inline-block">
        ← Back to orders
      </Link>
      <h1 className="font-sans text-2xl font-semibold text-text mb-6">
        Order {order.id.slice(0, 8)}
      </h1>
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="border border-border rounded-lg bg-surface p-6">
          <h2 className="font-sans text-sm font-medium text-muted uppercase tracking-wide mb-3">
            Customer & shipping
          </h2>
          <p className="font-sans text-text">{order.name ?? "—"}</p>
          <p className="font-sans text-text">{order.email}</p>
          <p className="font-sans text-text mt-2">
            {order.address}, {order.city} {order.zip}, {order.country}
          </p>
        </div>
        <div className="border border-border rounded-lg bg-surface p-6">
          <h2 className="font-sans text-sm font-medium text-muted uppercase tracking-wide mb-3">
            Status & tracking
          </h2>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="SHIPPED">Shipped</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block font-sans text-xs text-muted mb-1">Carrier</label>
              <input
                type="text"
                value={trackingCarrier}
                onChange={(e) => setTrackingCarrier(e.target.value)}
                placeholder="e.g. USPS, FedEx"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-muted mb-1">Tracking number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking number"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm"
              />
            </div>
            <Button
              onClick={handleUpdate}
              variant="primary"
              disabled={
                saving ||
                (status === order.status &&
                  (trackingNumber || "") === (order.trackingNumber ?? "") &&
                  (trackingCarrier || "") === (order.trackingCarrier ?? ""))
              }
            >
              {saving ? "Saving…" : "Update"}
            </Button>
          </div>
        </div>
      </div>
      <div className="border border-border rounded-lg bg-surface overflow-hidden">
        <h2 className="font-sans text-sm font-medium text-muted uppercase tracking-wide p-4 border-b border-border">
          Items
        </h2>
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-border bg-sage-1/50">
              <th className="text-left p-3 font-medium text-text">Product</th>
              <th className="text-right p-3 font-medium text-text">Price</th>
              <th className="text-right p-3 font-medium text-text">Qty</th>
              <th className="text-right p-3 font-medium text-text">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="p-3 text-text">
                  <span>{item.name}</span>
                  {item.variationLabel && (
                    <span className="block text-xs text-muted mt-0.5">{item.variationLabel}</span>
                  )}
                </td>
                <td className="p-3 text-right text-muted">${(item.priceCents / 100).toFixed(2)}</td>
                <td className="p-3 text-right text-muted">{item.quantity}</td>
                <td className="p-3 text-right text-text">
                  ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-border space-y-1 font-sans text-sm">
          <p className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>${(order.subtotalCents / 100).toFixed(2)}</span>
          </p>
          {order.discountCents > 0 && (
            <p className="flex justify-between text-sage-dark">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>-${(order.discountCents / 100).toFixed(2)}</span>
            </p>
          )}
          <p className="flex justify-between text-muted">
            <span>Shipping</span>
            <span>${(order.shippingCents / 100).toFixed(2)}</span>
          </p>
          <p className="flex justify-between font-medium text-text pt-2">
            <span>Total</span>
            <span>${(order.totalCents / 100).toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
