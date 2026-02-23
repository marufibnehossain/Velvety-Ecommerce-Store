"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Button from "@/components/Button";

type OrderItem = { name: string; quantity: number; price: number; variationLabel?: string | null };
type Order = {
  id: string;
  date: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  address: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  items: OrderItem[];
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/account/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setError(true);
        }
      } catch (_) {
        setError(true);
      }
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  const statusLabel: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    SHIPPED: "Shipped",
    CANCELLED: "Cancelled",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-sans text-muted">Loading…</p>
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-2xl">
          <Link href="/account/orders" className="font-sans text-sm text-muted hover:text-text mb-8 inline-block">
            ← Order history
          </Link>
          <p className="font-sans text-muted">Order not found.</p>
          <Button href="/account/orders" variant="secondary" className="mt-6">
            Back to orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-2xl">
        <Link href="/account/orders" className="font-sans text-sm text-muted hover:text-text mb-8 inline-block">
          ← Order history
        </Link>
        <SectionHeading
          title={`Order ${order.id.slice(0, 12)}…`}
          subtitle={`Placed on ${order.date}. ${statusLabel[order.status] ?? order.status}.`}
        />
        <div className="mt-6 font-sans text-sm text-muted">
          <p className="font-medium text-text mb-1">Shipping address</p>
          <p>{order.address}</p>
        </div>
        {order.trackingNumber && (
          <div className="mt-6 font-sans text-sm text-muted">
            <p className="font-medium text-text mb-1">Tracking</p>
            <p>
              {order.trackingCarrier && `${order.trackingCarrier}: `}
              <span className="text-sage-dark">{order.trackingNumber}</span>
            </p>
          </div>
        )}
        <div className="mt-10 border border-border rounded-lg bg-surface divide-y divide-border">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start p-4">
              <div>
                <p className="font-sans font-medium text-text">{item.name}</p>
                {item.variationLabel && (
                  <p className="font-sans text-xs text-muted mt-0.5">{item.variationLabel}</p>
                )}
                <p className="font-sans text-sm text-muted">Qty {item.quantity}</p>
              </div>
              <p className="font-sans text-text">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 font-sans text-sm space-y-2">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-muted">
              <span>Discount</span>
              <span>-${order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-medium text-text pt-2 border-t border-border">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
        <Button href="/account/orders" variant="secondary" className="mt-8">
          Back to orders
        </Button>
      </div>
    </div>
  );
}
