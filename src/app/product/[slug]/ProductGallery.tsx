"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Product, ProductVariation } from "@/lib/data";

interface ProductGalleryProps {
  product: Product;
  selectedVariation?: ProductVariation | null;
}

export default function ProductGallery({ product, selectedVariation }: ProductGalleryProps) {
  const baseImages = product.images.length ? product.images : ["/images/placeholder.svg"];
  const variationImages = selectedVariation?.images;
  const displayImages = variationImages && variationImages.length > 0 ? variationImages : baseImages;
  const [mainImage, setMainImage] = useState(displayImages[0]);

  useEffect(() => {
    setMainImage(displayImages[0]);
  }, [displayImages]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-sage-1 border border-border">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMainImage(src)}
              className={`relative w-20 h-20 shrink-0 rounded border overflow-hidden bg-surface transition-opacity ${
                mainImage === src ? "border-sage-dark opacity-100" : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
