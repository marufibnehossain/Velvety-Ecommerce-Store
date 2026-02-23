"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/cart-store";
import Button from "@/components/Button";

type SavedAddress = { id: string; label: string | null; address: string; city: string; zip: string; country: string };

const STEPS = ["Contact", "Delivery", "Payment"];

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard", price: 9.99, freeOver: 50 },
  { id: "express", label: "Express (2–3 days)", price: 14.99, freeOver: null },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    zip: "",
    country: "United States",
    card: "",
    exp: "",
    cvc: "",
  });
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const { data: session } = useSession();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState("standard");

  useEffect(() => {
    if (session?.user && step === 1) {
      fetch("/api/account/addresses")
        .then((r) => r.ok ? r.json() : [])
        .then((data) => setSavedAddresses(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [session, step]);

  const subtotal = getSubtotal();
  const method = SHIPPING_METHODS.find((m) => m.id === shippingMethodId) ?? SHIPPING_METHODS[0];
  const shipping =
    method.freeOver != null && subtotal >= method.freeOver ? 0 : method.price;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount + shipping);

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.valid && typeof data.discount === "number") {
        setAppliedCoupon({ code: data.code ?? code, discount: data.discount });
        setCouponInput("");
      } else {
        setCouponError(data.error ?? "Invalid or expired code");
      }
    } catch {
      setCouponError("Could not validate code. Try again.");
    }
    setCouponLoading(false);
  }

  if (items.length === 0 && step === 0) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <h1 className="font-sans text-2xl font-medium text-text mb-2">Your cart is empty</h1>
        <Button href="/products" variant="primary">Shop products</Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      try {
        const res = await fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            name: form.name || undefined,
            address: form.address,
            city: form.city,
            zip: form.zip,
            country: form.country,
            items: items.map((i) => ({
              productId: i.productId,
              name: i.name,
              quantity: i.quantity,
              price: i.price,
              variationId: i.variationId ?? undefined,
              variationLabel: i.attributes
                ? Object.entries(i.attributes)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")
                : undefined,
            })),
            subtotal,
            discount,
            shipping,
            total,
            coupon: appliedCoupon?.code,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error ?? "Failed to place order. Please try again.");
          return;
        }
      } catch (_) {
        alert("Failed to place order. Please try again.");
        return;
      }
      clearCart();
      router.push("/checkout/success");
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link href="/cart" className="font-sans text-sm text-muted hover:text-text mb-8 inline-block">
          ← Back to cart
        </Link>
        <h1 className="font-sans text-2xl md:text-3xl font-medium text-text mb-8">
          Checkout
        </h1>
        <div className="flex gap-2 mb-10">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`font-sans text-sm ${i <= step ? "text-text" : "text-muted"}`}
            >
              {i > 0 && " → "}
              {label}
            </span>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="space-y-6">
              {step === 0 && (
                <>
                  <div>
                    <label htmlFor="email" className="block font-sans text-sm font-medium text-text mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block font-sans text-sm font-medium text-text mb-1">Full name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                    />
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <div>
                    <label className="block font-sans text-sm font-medium text-text mb-1">Shipping method</label>
                    <select
                      value={shippingMethodId}
                      onChange={(e) => setShippingMethodId(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                    >
                      {SHIPPING_METHODS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label} — {m.freeOver != null && subtotal >= m.freeOver ? "Free" : `$${m.price.toFixed(2)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  {savedAddresses.length > 0 && (
                    <div>
                      <label className="block font-sans text-sm font-medium text-text mb-1">Use saved address</label>
                      <select
                        className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                        onChange={(e) => {
                          const id = e.target.value;
                          const a = savedAddresses.find((x) => x.id === id);
                          if (a) {
                            setForm((f) => ({
                              ...f,
                              address: a.address,
                              city: a.city,
                              zip: a.zip,
                              country: a.country,
                            }));
                          }
                        }}
                      >
                        <option value="">— Select —</option>
                        {savedAddresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label || a.address} {a.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label htmlFor="address" className="block font-sans text-sm font-medium text-text mb-1">Address</label>
                    <input
                      id="address"
                      type="text"
                      required
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block font-sans text-sm font-medium text-text mb-1">City</label>
                      <input
                        id="city"
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="zip" className="block font-sans text-sm font-medium text-text mb-1">ZIP</label>
                      <input
                        id="zip"
                        type="text"
                        required
                        value={form.zip}
                        onChange={(e) => setForm({ ...form, zip: e.target.value })}
                        className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country" className="block font-sans text-sm font-medium text-text mb-1">Country</label>
                    <input
                      id="country"
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                    />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div>
                    <label htmlFor="card" className="block font-sans text-sm font-medium text-text mb-1">Card number</label>
                    <input
                      id="card"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      required
                      value={form.card}
                      onChange={(e) => setForm({ ...form, card: e.target.value })}
                      className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="exp" className="block font-sans text-sm font-medium text-text mb-1">Expiry</label>
                      <input
                        id="exp"
                        type="text"
                        placeholder="MM/YY"
                        required
                        value={form.exp}
                        onChange={(e) => setForm({ ...form, exp: e.target.value })}
                        className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block font-sans text-sm font-medium text-text mb-1">CVC</label>
                      <input
                        id="cvc"
                        type="text"
                        placeholder="123"
                        required
                        value={form.cvc}
                        onChange={(e) => setForm({ ...form, cvc: e.target.value })}
                        className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-8 flex gap-4">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="font-sans text-sm text-muted hover:text-text"
                >
                  Back
                </button>
              ) : null}
              <Button type="submit" variant="primary">
                {step < STEPS.length - 1 ? "Continue" : "Place order"}
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="sticky top-24 border border-border rounded-lg bg-surface p-6">
              <h2 className="font-sans text-lg font-medium text-text mb-4">Order summary</h2>
              <ul className="space-y-3 mb-6">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    <div className="relative w-14 h-14 shrink-0 rounded bg-sage-1 overflow-hidden">
                      <Image src={item.image} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-text truncate">{item.name}</p>
                      <p className="font-sans text-xs text-muted">Qty {item.quantity}</p>
                    </div>
                    <p className="font-sans text-sm text-text">${(item.price * item.quantity).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg bg-sage-1 px-3 py-2 font-sans text-sm text-text">
                    <span>Code: {appliedCoupon.code}</span>
                    <span>-${appliedCoupon.discount.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-muted hover:text-text"
                      aria-label="Remove coupon"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                      className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="shrink-0 rounded-lg border border-border px-3 py-2 font-sans text-sm text-text hover:bg-surface disabled:opacity-50"
                    >
                      {couponLoading ? "…" : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && <p className="mt-1 font-sans text-xs text-red-600">{couponError}</p>}
              </div>
              <div className="space-y-2 font-sans text-sm border-t border-border pt-4">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sage-dark">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-medium text-text pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
