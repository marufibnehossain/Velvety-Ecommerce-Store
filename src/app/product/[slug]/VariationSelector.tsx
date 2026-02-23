"use client";

import { useState, useEffect } from "react";
import type { ProductAttribute, ProductVariation } from "@/lib/data";

interface VariationSelectorProps {
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  basePrice: number;
  baseImages: string[];
  onVariationChange?: (variation: ProductVariation | null, selectedAttributes: Record<string, string>) => void;
}

export default function VariationSelector({
  attributes,
  variations,
  basePrice,
  baseImages,
  onVariationChange,
}: VariationSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [currentVariation, setCurrentVariation] = useState<ProductVariation | null>(null);
  const [displayImages, setDisplayImages] = useState<string[]>(baseImages);

  useEffect(() => {
    // Initialize with first value of each attribute
    const initial: Record<string, string> = {};
    attributes.forEach(attr => {
      if (attr.values.length > 0) {
        initial[attr.name] = attr.values[0];
      }
    });
    setSelectedAttributes(initial);
  }, [attributes]);

  useEffect(() => {
    // Find matching variation
    const match = variations.find(v => {
      return Object.keys(selectedAttributes).every(key => v.attributes[key] === selectedAttributes[key]);
    });
    setCurrentVariation(match || null);
    if (match?.images && match.images.length > 0) {
      setDisplayImages(match.images);
    } else {
      setDisplayImages(baseImages);
    }
    onVariationChange?.(match || null, selectedAttributes);
  }, [selectedAttributes, variations, baseImages, onVariationChange]);

  function handleAttributeChange(attrName: string, value: string) {
    setSelectedAttributes(prev => ({ ...prev, [attrName]: value }));
  }

  return (
    <div className="space-y-3">
      {attributes.map((attr) => (
        <div key={attr.id}>
          <label className="block font-sans text-sm font-medium text-text mb-1.5">
            {attr.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((value) => {
              const isSelected = selectedAttributes[attr.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleAttributeChange(attr.name, value)}
                  className={`px-3 py-1.5 rounded-lg border font-sans text-sm transition-colors ${
                    isSelected
                      ? "border-sage-dark bg-sage-1 text-sage-dark"
                      : "border-border bg-bg text-text hover:border-text/30"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {currentVariation?.sku && (
        <p className="font-sans text-xs text-muted">SKU: {currentVariation.sku}</p>
      )}
    </div>
  );
}
