"use client";

import { useState, useEffect } from "react";
import type { Product, ProductVariation } from "@/lib/data";
import { getStockLabel } from "@/lib/data";
import { useCartStore } from "@/lib/cart-store";
import QuantityStepper from "@/components/QuantityStepper";
import Button from "@/components/Button";

interface AddToCartButtonProps {
  product: Product;
  selectedVariation?: ProductVariation | null;
  selectedAttributes?: Record<string, string>;
  /** When true, hide the "In stock" / "X left" label (e.g. when shown above) */
  hideStockLabel?: boolean;
}

export default function AddToCartButton({ product, selectedVariation, selectedAttributes, hideStockLabel }: AddToCartButtonProps) {
  const currentPrice = selectedVariation?.price ?? product.price;
  const unlimitedStock = product.trackInventory === false;
  const currentStock = unlimitedStock ? 999 : (selectedVariation?.stock ?? product.stock);
  const currentImages = selectedVariation?.images ?? product.images;
  const maxQty = unlimitedStock ? 999 : Math.max(0, currentStock);
  const [quantity, setQuantity] = useState(() => Math.min(1, maxQty));
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setQuantity((q) => Math.min(q, maxQty));
  }, [maxQty]);

  function handleAdd() {
    if (!unlimitedStock && currentStock <= 0) return;
    const qty = unlimitedStock ? quantity : Math.min(quantity, currentStock);
    const variationName = selectedVariation && selectedAttributes
      ? `${product.name} (${Object.values(selectedAttributes).join(", ")})`
      : product.name;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: variationName,
      price: currentPrice,
      image: currentImages[0] ?? product.images[0] ?? "/images/placeholder.svg",
      variationId: selectedVariation?.id,
      attributes: selectedAttributes,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const outOfStock = !unlimitedStock && currentStock <= 0;
  const stockLabel = unlimitedStock ? "In stock" : getStockLabel(currentStock);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!outOfStock && (
        <QuantityStepper
          value={quantity}
          onChange={(v) => setQuantity(Math.min(Math.max(1, v), maxQty))}
          min={1}
          max={maxQty}
        />
      )}
      <Button
        onClick={handleAdd}
        variant="primary"
        arrow={false}
        disabled={outOfStock}
      >
        {outOfStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
      </Button>
      {!hideStockLabel && (
        <span
          className={`font-sans text-sm ${outOfStock ? "text-red-600" : stockLabel === "Low stock" ? "text-amber-600" : "text-muted"}`}
        >
          {outOfStock ? "Out of stock" : stockLabel === "Low stock" ? `${currentStock} left` : "In stock"}
        </span>
      )}
    </div>
  );
}
