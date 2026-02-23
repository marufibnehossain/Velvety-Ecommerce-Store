"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/lib/data";
import { getRecentlyViewedSlugs, addRecentlyViewed } from "@/lib/recently-viewed-store";
import ProductCard from "@/components/ProductCard";
interface RecentlyViewedProps {
  /** Current product slug to exclude from list and to record as viewed */
  currentSlug?: string;
  /** Max number of products to show */
  max?: number;
}

export function useRecordRecentlyViewed(slug: string | undefined) {
  useEffect(() => {
    if (slug) addRecentlyViewed(slug);
  }, [slug]);
}

export default function RecentlyViewed({ currentSlug, max = 4 }: RecentlyViewedProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slugs = getRecentlyViewedSlugs().filter((s) => s !== currentSlug).slice(0, max);
    if (slugs.length === 0) {
      setLoading(false);
      return;
    }
    fetch(`/api/products?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [currentSlug, max]);

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="font-sans text-xl font-medium text-text mb-8">
        Recently viewed
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
