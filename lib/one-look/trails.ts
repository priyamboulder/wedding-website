// ── One Look trail computation ────────────────────────────────────────────
// Pure helpers that turn the flat list of published One Look reviews into
// city+category trails (ranked vendor lists). Used by the trails discovery
// grid and the individual trail page.

import type { OneLookReview } from "@/types/one-look";

export interface TrailSummary {
  category: string;
  categorySlug: string;
  city: string;
  citySlug: string;
  vendorCount: number;
  totalLooks: number;
}

export interface TrailVendorEntry {
  vendorId: string;               // coordinationVendorId or platformVendorId
  vendorName: string;
  vendorCategory: string;
  averageScore: number;
  lookCount: number;
  words: { word: string; count: number }[];
  reviews: OneLookReview[];
}

export interface FullTrail extends TrailSummary {
  vendors: TrailVendorEntry[];
}

// Trail thresholds from the spec.
const MIN_VENDORS_PER_TRAIL = 3;
const MIN_LOOKS_PER_VENDOR_IN_TRAIL = 2;

export function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Normalize the city field on reviews. Empty cities are excluded so we don't
// generate a "trail" from reviews whose bride hasn't set a wedding city.
function reviewCity(r: OneLookReview): string | null {
  const c = (r.brideCity ?? "").trim().toLowerCase();
  return c ? c : null;
}

function reviewCategory(r: OneLookReview): string {
  return (r.vendorCategory || r.vendorRole || "vendor").toLowerCase();
}

function reviewVendorId(r: OneLookReview): string | null {
  return r.coordinationVendorId ?? r.platformVendorId ?? null;
}

// Groups all published reviews by (category, city) and returns trail summaries
// that clear the vendor+look minimums.
export function computeTrailSummaries(
  allReviews: OneLookReview[],
): TrailSummary[] {
  const published = allReviews.filter((r) => r.status === "published");
  type CatCity = { category: string; city: string; reviews: OneLookReview[] };
  const byKey = new Map<string, CatCity>();

  for (const r of published) {
    const city = reviewCity(r);
    if (!city) continue;
    const category = reviewCategory(r);
    const key = `${category}__${city}`;
    if (!byKey.has(key)) byKey.set(key, { category, city, reviews: [] });
    byKey.get(key)!.reviews.push(r);
  }

  const summaries: TrailSummary[] = [];
  for (const { category, city, reviews } of byKey.values()) {
    const vendors = groupByVendor(reviews).filter(
      (v) => v.lookCount >= MIN_LOOKS_PER_VENDOR_IN_TRAIL,
    );
    if (vendors.length < MIN_VENDORS_PER_TRAIL) continue;
    const totalLooks = vendors.reduce((a, v) => a + v.lookCount, 0);
    summaries.push({
      category,
      categorySlug: slug(category),
      city,
      citySlug: slug(city),
      vendorCount: vendors.length,
      totalLooks,
    });
  }

  summaries.sort((a, b) => b.totalLooks - a.totalLooks);
  return summaries;
}

// Build the full trail (ranked vendor list) for a given category+city pair.
export function computeTrail(
  allReviews: OneLookReview[],
  categorySlug: string,
  citySlug: string,
): FullTrail | null {
  const published = allReviews.filter(
    (r) =>
      r.status === "published" &&
      slug(reviewCategory(r)) === categorySlug &&
      reviewCity(r) &&
      slug(reviewCity(r) as string) === citySlug,
  );

  if (published.length === 0) return null;

  const vendors = groupByVendor(published).filter(
    (v) => v.lookCount >= MIN_LOOKS_PER_VENDOR_IN_TRAIL,
  );

  if (vendors.length < MIN_VENDORS_PER_TRAIL) return null;

  vendors.sort((a, b) => b.averageScore - a.averageScore);

  const firstReview = published[0];
  return {
    category: firstReview.vendorCategory || firstReview.vendorRole,
    categorySlug,
    city: firstReview.brideCity,
    citySlug,
    vendorCount: vendors.length,
    totalLooks: vendors.reduce((a, v) => a + v.lookCount, 0),
    vendors,
  };
}

function groupByVendor(reviews: OneLookReview[]): TrailVendorEntry[] {
  const byVendor = new Map<string, OneLookReview[]>();
  for (const r of reviews) {
    const id = reviewVendorId(r);
    if (!id) continue;
    if (!byVendor.has(id)) byVendor.set(id, []);
    byVendor.get(id)!.push(r);
  }

  const entries: TrailVendorEntry[] = [];
  for (const [vendorId, group] of byVendor.entries()) {
    const averageScore =
      Math.round(
        (group.reduce((a, r) => a + r.score, 0) / group.length) * 10,
      ) / 10;
    const wordCounts = new Map<string, number>();
    group.forEach((r) =>
      wordCounts.set(r.oneWord, (wordCounts.get(r.oneWord) ?? 0) + 1),
    );
    const words = [...wordCounts.entries()]
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
    entries.push({
      vendorId,
      vendorName: group[0].vendorName,
      vendorCategory: group[0].vendorCategory,
      averageScore,
      lookCount: group.length,
      words,
      reviews: group,
    });
  }

  return entries;
}

// Emoji for a category — used by the trail discovery grid. Falls back to a
// generic sparkle if we haven't seen the category before.
export function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    photographer: "📸",
    videographer: "🎥",
    florist: "💐",
    dj: "🎵",
    mua: "💄",
    makeup_artist: "💄",
    caterer: "🍽️",
    catering: "🍽️",
    venue: "🏛️",
    planner: "📋",
    decorator: "🎀",
    mehndi: "🌿",
    mehendi: "🌿",
    baker: "🎂",
    bartender: "🍾",
    officiant: "🕯️",
  };
  return map[category.toLowerCase()] ?? "✨";
}
