import { searchProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import SearchForm from "./SearchForm";

interface SearchPageProps {
  searchParams?: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams?.q ?? "";
  const results = await searchProducts(query);

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <SectionHeading
          title="Search"
          subtitle="Find products by name, category, or ingredient."
        />
        <div className="mt-8">
          <SearchForm initialQuery={query} />
        </div>
        <div className="mt-10">
          {query ? (
            results.length > 0 ? (
              <>
                <p className="font-sans text-sm text-muted mb-6">
                  {results.length} result{results.length !== 1 ? "s" : ""} for “{query}”
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="font-sans text-muted">No products match “{query}”.</p>
                <p className="font-sans text-sm text-muted mt-2">Try a different search or browse all products.</p>
                <a href="/products" className="font-sans text-sage-dark hover:underline mt-4 inline-block">
                  View all products
                </a>
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <p className="font-sans text-muted">Enter a search term above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
