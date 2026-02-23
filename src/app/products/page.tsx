import { getProducts, getCategories } from "@/lib/products";
import { categories } from "@/lib/data";
import type { Product } from "@/lib/data";
import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import FilterChips from "@/components/FilterChips";
import ProductsClient from "./ProductsClient";

interface ProductsPageProps {
  searchParams?: { category?: string; sort?: string };
}

function sortProducts(items: Product[], sort?: string) {
  if (!sort) return items;
  const list = [...items];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
      return list; // server already returns by createdAt DESC
    case "rating":
      return list.sort((a, b) => b.rating - a.rating);
    default:
      return list;
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const categorySlug = searchParams?.category ?? null;
  const allProducts = await getProducts();
  const filtered =
    categorySlug && categorySlug !== "all"
      ? allProducts.filter((p) => p.category === categorySlug)
      : allProducts;
  const sorted = sortProducts(filtered, searchParams?.sort);

  return (
    <div className="min-h-screen bg-bg">
      <section className="border-b border-border bg-surface py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading
            eyebrow="Shop"
            title="All products"
            subtitle="Natural and certified organic skincare. Filter by category or browse the full collection."
          />
        </div>
      </section>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <FilterChips options={categories} paramKey="category" />
            <ProductsClient sort={searchParams?.sort} />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {sorted.length === 0 && (
            <div className="text-center py-16">
              <p className="font-sans text-muted">No products match this filter.</p>
              <a href="/products" className="font-sans text-sage-dark hover:underline mt-2 inline-block">
                View all products
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
