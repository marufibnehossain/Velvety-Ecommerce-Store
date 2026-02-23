"use client";

import { useState } from "react";
import type { Product, ProductVariation } from "@/lib/data";
import ProductGallery from "./ProductGallery";
import ProductDetails from "./ProductDetails";

interface ProductWithVariationsProps {
  product: Product;
}

export default function ProductWithVariations({ product }: ProductWithVariationsProps) {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  function handleVariationChange(variation: ProductVariation | null, attrs: Record<string, string>) {
    setSelectedVariation(variation);
    setSelectedAttributes(attrs);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 lg:items-start">
      <ProductGallery product={product} selectedVariation={selectedVariation} />
      <ProductDetails
        product={product}
        selectedVariation={selectedVariation}
        selectedAttributes={selectedAttributes}
        onVariationChange={handleVariationChange}
      />
    </div>
  );
}
