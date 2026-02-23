"use client";

import { useState } from "react";
import type { Product, ProductVariation } from "@/lib/data";
import RatingStars from "@/components/RatingStars";
import Accordion from "@/components/Accordion";
import VariationSelector from "./VariationSelector";
import AddToCartButton from "./AddToCartButton";
import ProductGallery from "./ProductGallery";

interface ProductDetailsProps {
  product: Product;
  selectedVariation?: ProductVariation | null;
  selectedAttributes?: Record<string, string>;
  onVariationChange?: (variation: ProductVariation | null, attrs: Record<string, string>) => void;
}

export default function ProductDetails({
  product,
  selectedVariation: externalVariation,
  selectedAttributes: externalAttributes,
  onVariationChange,
}: ProductDetailsProps) {
  const [internalVariation, setInternalVariation] = useState<ProductVariation | null>(null);
  const [internalAttributes, setInternalAttributes] = useState<Record<string, string>>({});

  const selectedVariation = externalVariation ?? internalVariation;
  const selectedAttributes = externalAttributes ?? internalAttributes;

  function handleVariationChange(variation: ProductVariation | null, attrs: Record<string, string>) {
    if (onVariationChange) {
      onVariationChange(variation, attrs);
    } else {
      setInternalVariation(variation);
      setInternalAttributes(attrs);
    }
  }

  const currentPrice = selectedVariation?.price ?? product.price;
  const unlimitedStock = product.trackInventory === false;
  const currentStock = unlimitedStock ? 999 : (selectedVariation?.stock ?? product.stock);

  const accordionItems = [
    {
      title: "Ingredients",
      content: product.ingredients ?? "Full ingredient list available on request. All our formulations are free from parabens, sulfates, and synthetic fragrances.",
    },
    {
      title: "How to use",
      content: product.howToUse ?? "Apply as needed. For best results, use as part of your daily routine.",
    },
    {
      title: "Shipping & returns",
      content: "Free shipping on orders over $50. We offer a 30-day return policy for unopened items. Please contact us for returns.",
    },
  ];

  const stockLabel = unlimitedStock
    ? "In stock"
    : currentStock === 0
      ? "Out of stock"
      : currentStock <= 5
        ? `${currentStock} left`
        : "In stock";

  return (
    <div className="lg:sticky lg:top-24">
      {product.productCode && (
        <p className="font-sans text-xs text-muted mb-1">{product.productCode}</p>
      )}
      <h1 className="font-sans text-2xl md:text-3xl font-medium text-text">
        {product.name}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        <span className="font-sans text-xl font-medium text-text">
          ${currentPrice.toFixed(2)}
        </span>
        {product.compareAt != null && (
          <span className="font-sans text-sm text-muted line-through">
            ${product.compareAt}
          </span>
        )}
        <span
          className={`font-sans text-sm ${unlimitedStock || currentStock > 5 ? "text-muted" : currentStock === 0 ? "text-red-600" : "text-amber-600"}`}
        >
          {stockLabel}
        </span>
      </div>
      <p className="mt-3 font-sans text-muted leading-relaxed text-sm">
        {product.shortDesc}
      </p>

      <div className="mt-5 pt-4 border-t border-border space-y-4">
        {product.attributes && product.attributes.length > 0 && product.variations && product.variations.length > 0 ? (
          <>
            <VariationSelector
              attributes={product.attributes}
              variations={product.variations}
              basePrice={product.price}
              baseImages={product.images.length ? product.images : ["/images/placeholder.svg"]}
              onVariationChange={handleVariationChange}
            />
            <div>
              <p className="font-sans text-sm font-medium text-text mb-2">Quantity</p>
              <AddToCartButton
                product={product}
                selectedVariation={selectedVariation}
                selectedAttributes={selectedAttributes}
                hideStockLabel
              />
            </div>
          </>
        ) : (
          <>
            <p className="font-sans text-sm font-medium text-text mb-2">Quantity</p>
            <AddToCartButton product={product} />
          </>
        )}
      </div>

      <div className="mt-6">
        <Accordion items={accordionItems} />
      </div>
    </div>
  );
}
