import type {
  ListingType,
  MarketplaceListing,
  MarketplaceFilterState,
  MarketplaceSortKey,
} from "@/types/marketplace";

// ── Price formatting ────────────────────────────────────────────────────────
// Seed prices are in paise/cents. We render them as rupees when the seller's
// country is India (or unknown), otherwise as USD. Crude but fine for v1.

export function formatPrice(
  cents?: number,
  country: string = "India",
  opts: { truncate?: boolean } = {},
): string {
  if (cents == null || Number.isNaN(cents)) return "—";
  const rupees = country === "USA" ? `$${(cents / 100).toLocaleString("en-US")}` : null;
  if (rupees) return rupees;
  // Indian numbering with lakhs for bigger values when requested.
  const n = cents / 100;
  if (opts.truncate && n >= 1_00_000) {
    const lakhs = n / 1_00_000;
    return `₹${lakhs.toFixed(lakhs >= 10 ? 0 : 1)}L`;
  }
  return `₹${n.toLocaleString("en-IN")}`;
}

export function discountPct(
  price?: number,
  original?: number,
): number | null {
  if (!price || !original || original <= 0 || price >= original) return null;
  return Math.round(((original - price) / original) * 100);
}

// ── Filtering ───────────────────────────────────────────────────────────────

export function applyFilters(
  listings: MarketplaceListing[],
  f: MarketplaceFilterState,
): MarketplaceListing[] {
  return listings.filter((l) => {
    if (l.status !== "active") return false;
    if (f.category && l.category !== f.category) return false;
    if (f.listingType !== "all" && l.listing_type !== f.listingType) return false;
    if (f.condition !== "any" && l.condition !== f.condition) return false;
    if (f.city && l.seller_location_city !== f.city) return false;
    if (f.size && l.size !== f.size) return false;
    if (f.shipsOnly && !l.shipping_available) return false;
    if (f.minPrice != null && (l.price_cents ?? 0) < f.minPrice * 100) return false;
    if (f.maxPrice != null && (l.price_cents ?? Infinity) > f.maxPrice * 100) return false;
    if (f.query) {
      const q = f.query.toLowerCase();
      const hay =
        l.title.toLowerCase() +
        " " +
        l.description.toLowerCase() +
        " " +
        l.tags.join(" ").toLowerCase() +
        " " +
        (l.brand ?? "").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ── Sorting ─────────────────────────────────────────────────────────────────

export function sortListings(
  listings: MarketplaceListing[],
  key: MarketplaceSortKey,
): MarketplaceListing[] {
  const arr = [...listings];
  switch (key) {
    case "price_asc":
      arr.sort((a, b) => (a.price_cents ?? 0) - (b.price_cents ?? 0));
      break;
    case "price_desc":
      arr.sort((a, b) => (b.price_cents ?? 0) - (a.price_cents ?? 0));
      break;
    case "most_saved":
      arr.sort((a, b) => b.save_count - a.save_count);
      break;
    case "best_deal":
      arr.sort((a, b) => {
        const da = discountPct(a.price_cents, a.original_price_cents) ?? -1;
        const db = discountPct(b.price_cents, b.original_price_cents) ?? -1;
        return db - da;
      });
      break;
    case "recent":
    default:
      arr.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
  return arr;
}

// ── Price line rendering helpers ────────────────────────────────────────────

export function listingTypeBadge(t: ListingType): {
  label: string;
  tone: string;
} {
  switch (t) {
    case "sell":
      return { label: "For Sale", tone: "border-gold/40 bg-gold-pale/50 text-gold" };
    case "rent":
      return { label: "For Rent", tone: "border-teal/40 bg-teal-pale/50 text-teal" };
    case "sell_or_rent":
      return { label: "Sale or Rent", tone: "border-saffron/40 bg-saffron-pale/60 text-saffron" };
    case "free":
      return { label: "Free", tone: "border-sage/40 bg-sage-pale/60 text-sage" };
  }
}

export function conditionBadge(c: MarketplaceListing["condition"]): string {
  switch (c) {
    case "new_with_tags":
      return "New with tags";
    case "like_new":
      return "Like new";
    case "good":
      return "Good";
    case "fair":
      return "Fair";
  }
}

// ── Relative time ───────────────────────────────────────────────────────────

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = now - then;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(months / 12);
  return `${years}y ago`;
}

// ── Size relevance (used to show size filter only for clothing) ─────────────

export const CLOTHING_CATEGORIES = new Set([
  "bridal_wear",
  "groom_wear",
  "shoes",
  "veils_dupattas",
]);
