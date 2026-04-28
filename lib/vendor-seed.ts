// Re-exports lightweight lookup tables. The 107K-line seed is NOT imported
// here — components that only need CATEGORY_LABELS stay small.
// SEED_VENDORS is loaded lazily only by server-side API routes.
export { CATEGORY_LABELS, TASK_KEYWORDS_TO_CATEGORY } from "@/lib/vendor-categories";

import type { Vendor } from "@/types/vendor";
import type { Collection } from "@/types/vendor";

// Only used by server-side API routes (e.g. recommendations). Lazy so the
// 3 MB seed never lands in client bundles.
export async function getSeedVendors(): Promise<Vendor[]> {
  const { UNIFIED_VENDORS } = await import("@/lib/vendor-unified-seed");
  return UNIFIED_VENDORS as unknown as Vendor[];
}

export const SEED_COLLECTIONS: Collection[] = [];
