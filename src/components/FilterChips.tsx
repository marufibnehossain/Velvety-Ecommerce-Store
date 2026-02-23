"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface FilterChipsProps {
  options: { id: string; name: string; slug?: string }[];
  paramKey?: string;
  className?: string;
}

export default function FilterChips({
  options,
  paramKey = "category",
  className = "",
}: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "all";

  function setFilter(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "all") next.delete(paramKey);
    else next.set(paramKey, value);
    router.push(`?${next.toString()}`);
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => setFilter("all")}
        className={`rounded-full border px-4 py-2 font-sans text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sage-2 ${
          current === "all"
            ? "border-text/40 bg-surface text-text"
            : "border-border bg-bg text-muted hover:border-sage-2 hover:text-text"
        }`}
      >
        All
      </button>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setFilter(opt.slug ?? opt.id)}
          className={`rounded-full border px-4 py-2 font-sans text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sage-2 ${
            current === (opt.slug ?? opt.id)
              ? "border-text/40 bg-surface text-text"
              : "border-border bg-bg text-muted hover:border-sage-2 hover:text-text"
          }`}
        >
          {opt.name}
        </button>
      ))}
    </div>
  );
}
