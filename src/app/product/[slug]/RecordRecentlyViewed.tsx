"use client";

import { useRecordRecentlyViewed } from "@/components/RecentlyViewed";

export function RecordRecentlyViewed({ slug }: { slug: string }) {
  useRecordRecentlyViewed(slug);
  return null;
}
