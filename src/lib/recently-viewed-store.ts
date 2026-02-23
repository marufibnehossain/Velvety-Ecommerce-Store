const STORAGE_KEY = "velvety-recently-viewed";
const MAX_ITEMS = 6;

export function getRecentlyViewedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(slug: string): void {
  if (typeof window === "undefined") return;
  const slugs = getRecentlyViewedSlugs().filter((s) => s !== slug);
  slugs.unshift(slug);
  const trimmed = slugs.slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}
