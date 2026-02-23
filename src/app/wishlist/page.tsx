"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useCartStore } from "@/lib/cart-store";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";

type ProductStock = { slug: string; stock: number };
type ProductFromApi = { id: string; slug: string; name: string; price: number; images: string[]; stock?: number; trackInventory?: boolean };

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);
  const [productStocks, setProductStocks] = useState<Record<string, number>>({});
  const [dbItems, setDbItems] = useState<ProductFromApi[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    if (status !== "authenticated" || !session) {
      setLoadingDb(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/account/wishlist");
        if (!res.ok || cancelled) return;
        const rows = (await res.json()) as Array<{ productId: string; slug: string }>;
        if (rows.length === 0) {
          if (!cancelled) setDbItems([]);
          setLoadingDb(false);
          return;
        }
        const slugs = rows.map((r) => r.slug);
        const prodsRes = await fetch(`/api/products?slugs=${encodeURIComponent(slugs.join(","))}`);
        if (!prodsRes.ok || cancelled) {
          setLoadingDb(false);
          return;
        }
        const prods = (await prodsRes.json()) as ProductFromApi[];
        if (!cancelled) setDbItems(Array.isArray(prods) ? prods : []);
      } catch (_) {}
      if (!cancelled) setLoadingDb(false);
    })();
    return () => { cancelled = true; };
  }, [status, session?.user?.email]);

  const mergedItems = useMemo(() => {
    const byId = new Map<string, { slug: string; name: string; price: number; image: string; productId: string }>();
    for (const p of dbItems) {
      byId.set(p.id, { productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.images?.[0] ?? "/images/placeholder.svg" });
    }
    for (const i of items) {
      if (!byId.has(i.productId)) byId.set(i.productId, { productId: i.productId, slug: i.slug, name: i.name, price: i.price, image: i.image });
    }
    return Array.from(byId.values());
  }, [dbItems, items]);

  useEffect(() => {
    async function loadStocks() {
      const stocks: Record<string, number> = {};
      for (const item of mergedItems) {
        try {
          const res = await fetch(`/api/products/${item.slug}`);
          if (res.ok) {
            const product = await res.json();
            const p = product as { stock?: number; trackInventory?: boolean };
            stocks[item.slug] = p.trackInventory === false ? 999 : (p.stock ?? 0);
          }
        } catch (_) {}
      }
      setProductStocks(stocks);
    }
    if (mergedItems.length > 0) loadStocks();
  }, [mergedItems]);

  async function handleRemove(productId: string, slug: string) {
    if (session) {
      try {
        await fetch(`/api/account/wishlist?productId=${encodeURIComponent(productId)}`, { method: "DELETE" });
      } catch (_) {}
    }
    removeItem(productId);
  }

  const displayItems = status === "loading" || loadingDb ? items : mergedItems;
  if (displayItems.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <SectionHeading
          title="Your wishlist is empty"
          subtitle="Save items you love by clicking the heart on any product."
        />
        <Button href="/products" variant="primary" className="mt-8">
          Shop products
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <SectionHeading
          title="Wishlist"
          subtitle={`${displayItems.length} item${displayItems.length !== 1 ? "s" : ""} saved for later.`}
        />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayItems.map((item) => {
            const stock = productStocks[item.slug] ?? null;
            const outOfStock = stock !== null && stock <= 0;
            return (
            <article key={item.productId} className="group border border-border rounded-lg bg-surface overflow-hidden">
              <Link href={`/product/${item.slug}`} className="block relative aspect-[3/4] bg-sage-1">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain object-center p-4"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </Link>
              <div className="p-4 border-t border-border">
                <h3 className="font-sans text-sm font-medium text-text uppercase tracking-wide">
                  {item.name}
                </h3>
                <p className="font-sans text-base font-medium text-text mt-1">${item.price}</p>
                {stock !== null && (
                  <p className={`font-sans text-xs mt-0.5 ${outOfStock ? "text-red-600" : stock <= 5 ? "text-amber-600" : "text-muted"}`}>
                    {outOfStock ? "Out of stock" : stock <= 5 ? `${stock} left` : "In stock"}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => {
                      if (outOfStock) return;
                      addToCart(
                        {
                          productId: item.productId,
                          slug: item.slug,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                        },
                        1
                      );
                    }}
                    variant="primary"
                    className="flex-1 justify-center"
                    disabled={outOfStock}
                  >
                    {outOfStock ? "Out of stock" : "Add to cart"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId, item.slug)}
                    className="px-3 py-2 font-sans text-sm text-muted hover:text-text border border-border rounded-lg"
                    aria-label="Remove from wishlist"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
            );
          })}
        </div>
        <div className="mt-10">
          <Button href="/products" variant="secondary">
            Continue shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
