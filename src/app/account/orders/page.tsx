"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Button from "@/components/Button";

type OrderSummary = { id: string; date: string; total: number; status: string };

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/account/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

  const statusLabel: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    SHIPPED: "Shipped",
    CANCELLED: "Cancelled",
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <Link href="/account" className="font-sans text-sm text-muted hover:text-text mb-8 inline-block">
          ← Account
        </Link>
        <SectionHeading
          title="Order history"
          subtitle="View and track your orders."
        />
        {loading ? (
          <p className="font-sans text-muted mt-10">Loading…</p>
        ) : (
          <div className="mt-10 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-4 border border-border rounded-lg bg-surface p-6"
              >
                <div>
                  <p className="font-sans font-medium text-text">{order.id.slice(0, 12)}…</p>
                  <p className="font-sans text-sm text-muted">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-sans font-medium text-text">${order.total.toFixed(2)}</p>
                  <p className="font-sans text-sm text-muted">{statusLabel[order.status] ?? order.status}</p>
                </div>
                <Button href={`/account/orders/${order.id}`} variant="text-arrow">
                  View details
                </Button>
              </div>
            ))}
          </div>
        )}
        {!loading && orders.length === 0 && (
          <p className="font-sans text-muted mt-8">You haven’t placed any orders yet.</p>
        )}
      </div>
    </div>
  );
}
