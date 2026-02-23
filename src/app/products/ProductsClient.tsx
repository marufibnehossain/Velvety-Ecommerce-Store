"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Rating" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

export default function ProductsClient({ sort }: { sort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(searchParams.toString());
    const v = e.target.value;
    if (v) next.set("sort", v);
    else next.delete("sort");
    router.push(`/products?${next.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="font-sans text-sm text-muted shrink-0">
        Sort
      </label>
      <select
        id="sort"
        value={sort ?? ""}
        onChange={handleSortChange}
        className="rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm text-text focus:outline-none focus:ring-2 focus:ring-sage-2"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
