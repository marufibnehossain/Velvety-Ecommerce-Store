"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import Button from "@/components/Button";
import QuantityStepper from "@/components/QuantityStepper";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shippingEstimate = subtotal >= 50 ? 0 : 9.99;
  const total = subtotal + shippingEstimate;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <h1 className="font-sans text-2xl font-medium text-text mb-2">Your cart is empty</h1>
        <p className="font-sans text-muted mb-8 text-center max-w-sm">
          Add something you love and come back here when you’re ready.
        </p>
        <Button href="/products" variant="primary">
          Shop products
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="font-sans text-2xl md:text-3xl font-medium text-text mb-8">
          Cart
        </h1>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-8">
            <ul className="divide-y divide-border">
              {items.map((item, index) => (
                <li key={`${item.productId}-${item.variationId || index}`} className="py-6 flex gap-4 md:gap-6">
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-lg overflow-hidden bg-sage-1 border border-border"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-sans font-medium text-text hover:text-muted"
                    >
                      {item.name}
                    </Link>
                    <p className="font-sans text-sm text-muted mt-0.5">
                      ${item.price}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => updateQuantity(item.productId, q, item.variationId)}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.variationId)}
                        className="font-sans text-sm text-muted hover:text-text underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-sans font-medium text-text">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-4">
            <div className="sticky top-24 border border-border rounded-lg bg-surface p-6">
              <h2 className="font-sans text-lg font-medium text-text mb-4">
                Summary
              </h2>
              <div className="space-y-2 font-sans text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span>
                    {shippingEstimate === 0 ? "Free" : `$${shippingEstimate.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-text font-medium pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              {subtotal < 50 && (
                <p className="font-sans text-xs text-muted mt-2">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping.
                </p>
              )}
              <Button href="/checkout" variant="primary" className="w-full mt-6 justify-center">
                Proceed to checkout
              </Button>
              <Link
                href="/products"
                className="block text-center font-sans text-sm text-muted hover:text-text mt-4"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
