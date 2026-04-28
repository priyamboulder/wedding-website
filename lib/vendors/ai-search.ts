import type { VendorCategory, VendorFilters } from "@/types/vendor";
import { EMPTY_FILTERS } from "@/types/vendor";

// ── Local NL → filter translator ────────────────────────────────────────────
// Production intent is to route AI search queries through Claude with a
// structured-output system prompt (see ananya-ai-feature-spec.md). Until the
// Anthropic API plumbing is wired up, this local parser handles common
// shapes ("photographer under 10L", "minimalist decor in Delhi") so the UI
// still works offline. Swap this file's impl — not callers — when wiring API.

const CATEGORY_VOCAB: Array<[RegExp, VendorCategory]> = [
  [/photograph|photo(?!s)|shooter|film|video|cinemato/i, "photography"],
  [/makeup|mua|hmua|hair(?!loom)|beauty/i, "hmua"],
  [/decor|floral|flower|mandap|stage/i, "decor_florals"],
  [/cater|menu|chef|food/i, "catering"],
  [/dj|band|music|sangeet act|perform|dance troupe|entertain/i, "entertainment"],
  [/lehenga|saree|sherwani|couture|designer|wardrobe|outfit|bridal wear/i, "wardrobe"],
  [/invit|stationery|card|rsvp|save[- ]the[- ]date/i, "stationery"],
  [/pandit|priest|puja|ceremony|havan|pooja/i, "pandit_ceremony"],
];

const STYLE_VOCAB = [
  "editorial",
  "candid",
  "cinematic",
  "minimalist",
  "modern",
  "natural-light",
  "luminous",
  "glam",
  "soft-glam",
  "dewy",
  "maximalist",
  "traditional",
  "grand",
  "floral-heavy",
  "sustainable",
  "heritage",
  "bollywood",
  "letterpress",
  "handloom",
];

const LOCATION_VOCAB = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Udaipur",
  "Jaipur",
  "Kolkata",
  "Chennai",
  "Hyderabad",
  "Goa",
];

// Parse a price cap — "under 10L", "below 25 lakhs", "less than 2 crore"
function parsePriceBand(query: string): VendorFilters["price_band"] {
  const m = query.match(
    /(?:under|below|less than|<=?|upto|up to)\s*₹?\s*([\d.,]+)\s*(l|lakh|lakhs|cr|crore|crores|k)?/i,
  );
  if (!m) return null;
  const n = Number.parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  const unit = (m[2] || "").toLowerCase();
  let inRupees = n;
  if (unit.startsWith("cr")) inRupees = n * 1_00_00_000;
  else if (unit.startsWith("l") || unit === "lakh" || unit === "lakhs")
    inRupees = n * 1_00_000;
  else if (unit === "k") inRupees = n * 1_000;

  if (inRupees <= 5_00_000) return "budget";
  if (inRupees <= 15_00_000) return "mid";
  if (inRupees <= 40_00_000) return "premium";
  return "luxe";
}

export function parseNaturalLanguageQuery(query: string): VendorFilters {
  const filters: VendorFilters = { ...EMPTY_FILTERS, aiMode: true, query };
  if (!query.trim()) return filters;

  for (const [re, cat] of CATEGORY_VOCAB) {
    if (re.test(query)) {
      filters.category = cat;
      break;
    }
  }

  const lower = query.toLowerCase();
  const tags: string[] = [];
  for (const tag of STYLE_VOCAB) {
    if (lower.includes(tag.toLowerCase())) tags.push(tag);
  }
  filters.style_tags = tags;

  for (const loc of LOCATION_VOCAB) {
    if (lower.includes(loc.toLowerCase())) {
      filters.location = loc;
      break;
    }
  }

  const band = parsePriceBand(query);
  if (band) filters.price_band = band;

  // Destination intent. "destination photographer", "travels internationally",
  // or a named destination like "Cancun", "Tuscany" all flip the travel
  // filter to `destination` and capture the named location as a "willing to
  // travel to" query so proven destination vendors float to the top.
  if (/destination|international|overseas|worldwide|abroad/i.test(query)) {
    filters.travel_levels = ["destination"];
  }
  const destinationMatch = query.match(
    /\b(Cancun|Tulum|Cabo|Riviera Maya|Tuscany|Florence|Amalfi|Santorini|Udaipur|Jaipur|Bali|Dubai|Maldives|Mauritius|Montego Bay|Jamaica|Mexico|Italy|India)\b/i,
  );
  if (destinationMatch) {
    filters.willing_to_travel_to = destinationMatch[0];
    if (filters.travel_levels.length === 0) {
      filters.travel_levels = ["destination"];
    }
  }

  return filters;
}

export const AI_SEARCH_EXAMPLES = [
  "modern minimalist photographer under ₹10L with editorial style",
  "traditional decor in Udaipur, maximalist, floral-heavy",
  "soft-glam MUA in Delhi under ₹3L",
  "candid cinematic wedding film team, Mumbai",
];
