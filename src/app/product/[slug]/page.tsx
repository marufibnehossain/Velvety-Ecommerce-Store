import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import ProductWithVariations from "./ProductWithVariations";
import ProductReviews from "./ProductReviews";
import RecentlyViewed from "@/components/RecentlyViewed";
import { RecordRecentlyViewed } from "./RecordRecentlyViewed";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product not found" };
  }
  const title = `${product.name} | Velvety`;
  const description = product.shortDesc.slice(0, 160);
  const image = product.images[0] ? (product.images[0].startsWith("http") ? product.images[0] : undefined) : undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image && { images: [image] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://velvety.example.com";
  const productUrl = `${baseUrl}/product/${product.slug}`;
  const imageUrl = product.images[0]
    ? product.images[0].startsWith("http")
      ? product.images[0]
      : `${baseUrl}${product.images[0]}`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc,
    url: productUrl,
    ...(imageUrl && { image: imageUrl }),
    sku: product.productCode ?? product.id,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability:
        product.trackInventory === false || product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <RecordRecentlyViewed slug={product.slug} />
        <ProductWithVariations product={product} />

        <ProductReviews slug={product.slug} />

        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="font-sans text-xl font-medium text-text mb-8">
              Related products
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        <RecentlyViewed currentSlug={product.slug} />
      </div>
    </div>
  );
}
