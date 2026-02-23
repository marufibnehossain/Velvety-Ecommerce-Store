"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Product } from "@/lib/data";
import RatingStars from "./RatingStars";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "featured";
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const img = product.images[0] ?? "/images/placeholder.svg";
  const isFeatured = variant === "featured";

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: img,
    }, 1);
  }

  const outOfStock = product.trackInventory !== false && product.stock <= 0;

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const item = { productId: product.id, slug: product.slug, name: product.name, price: product.price, image: img };
    const adding = !isInWishlist;
    toggleWishlist(item);
    if (session) {
      try {
        if (adding) {
          await fetch("/api/account/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
        } else {
          await fetch(`/api/account/wishlist?productId=${encodeURIComponent(product.id)}`, { method: "DELETE" });
        }
      } catch (_) {}
    }
  }

  return (
    <article className="group">
      <Link href={`/product/${product.slug}`} className="block">
        {/* Upper section: light sage green background, product image */}
        <div
          className={`relative aspect-[3/4] overflow-hidden transition-colors ${
            isFeatured
              ? "bg-sage-1 border border-sage-2 rounded-t-lg"
              : "bg-sage-1 border border-border rounded-t-lg border-b-0 group-hover:border-text/20"
          }`}
        >
          <button
            type="button"
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-bg/90 border border-border flex items-center justify-center text-text hover:bg-surface transition-colors pointer-events-auto"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <span className={`text-xl ${isInWishlist ? "text-red-500" : "text-muted"}`}>
              {isInWishlist ? "♥" : "♡"}
            </span>
          </button>
          {/* Badges: Sale, New, Bestseller */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
            {product.compareAt != null && product.compareAt > product.price && (
              <span className="rounded bg-red-600 px-2 py-0.5 font-sans text-xs font-medium text-white">
                Sale
              </span>
            )}
            {product.badge === "NEW" && (
              <span className="rounded bg-sage-dark px-2 py-0.5 font-sans text-xs font-medium text-white">
                New
              </span>
            )}
            {product.badge === "BESTSELLER" && (
              <span className="rounded bg-amber-600 px-2 py-0.5 font-sans text-xs font-medium text-white">
                Bestseller
              </span>
            )}
          </div>
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-contain object-center p-4"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Add to cart overlay – visible on hover */}
          {!outOfStock && (
            <div
              className="absolute inset-0 z-10 flex items-end p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
              aria-hidden
            >
              <button
                type="button"
                onClick={handleAddToCart}
                className="pointer-events-auto w-full rounded-lg border border-border bg-bg px-5 py-2.5 font-sans text-sm font-medium text-text shadow-sm hover:bg-surface hover:border-text/30 transition-colors"
              >
                Add to cart
              </button>
            </div>
          )}
        </div>
        {/* Lower section: light background, name, price, rating */}
        <div
          className={`rounded-b-lg border border-t-0 px-4 py-3 ${
            isFeatured
              ? "bg-surface border-sage-2 border-x border-b"
              : "bg-surface border-border border-x border-b group-hover:border-text/20"
          }`}
        >
          {isFeatured && product.productCode && (
            <p className="font-sans text-xs text-muted mb-0.5">{product.productCode}</p>
          )}
          <h3 className="font-sans text-sm font-medium text-text uppercase tracking-wide">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-base font-medium text-text">
                ${product.price}
              </span>
              {product.compareAt != null && (
                <span className="font-sans text-sm text-muted line-through">
                  ${product.compareAt}
                </span>
              )}
            </div>
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
            />
          </div>
        </div>
      </Link>
    </article>
  );
}
