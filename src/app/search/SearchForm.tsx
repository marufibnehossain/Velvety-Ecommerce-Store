"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 rounded-lg border border-border bg-bg px-4 py-3 font-sans text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-sage-2"
          aria-label="Search"
        />
        <button
          type="submit"
          className="rounded-lg border border-border bg-surface px-6 py-3 font-sans text-sm text-text hover:bg-sage-1 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
