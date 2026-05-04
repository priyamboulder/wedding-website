// lib/polls/vendor-category-polls.ts
//
// Maps the /vendors-directory category filter labels (the same display
// strings used on the filter pills — see VENDOR_CATEGORIES in
// lib/marigold/vendors.ts) onto a curated set of Great Debate poll
// questions. Used by the slim "while you're browsing…" poll card that
// surfaces above the vendor grid when a category filter is active.
//
// Polls are referenced by their canonical question text (the source of
// truth in lib/polls/seed-data.ts) rather than UUID, so the mapping
// survives reseeds and stays human-readable. The runtime lookup
// (/api/polls/for-vendor-category) resolves a question string to its
// row in the `polls` table and returns the rendered snapshot.
//
// Two to four questions are listed per category. The card picks one at
// random per page load, which gives returning visitors variety without
// fragmenting vote totals across the whole bank.
//
// Categories without a curated pool ('Wardrobe', 'Stationery', 'Venues',
// 'Videography', 'Mehendi', 'Cake & Sweets') silently no-op — the 300-
// poll bank doesn't have great fits for them right now.

// Filter labels used on the vendors-directory pills. Mirrors the union
// in lib/marigold/vendors.ts (VendorCategory). Kept as a string here so
// this module stays free of cross-cutting type imports.
export type VendorPollFilterLabel = string;

export const VENDOR_CATEGORY_POLL_QUESTIONS: Record<string, string[]> = {
  Photography: [
    "Candid photography or posed portraits?",
    "Dark & moody editing or bright & airy?",
    "Drone shots — epic or overdone?",
    "How many photographers do you actually need? (1, 2, or 3+)",
  ],
  "Décor & Florals": [
    "Roses or marigolds?",
    "Gold mandap or white mandap?",
    "Real flowers or artificial for the mandap?",
    "Ceiling draping — dreamy or overdone?",
  ],
  HMUA: [
    "Nude makeup or full glam for daytime ceremonies?",
    "Is a bridal hair trial actually necessary?",
    "Same makeup artist for all events or different for each?",
  ],
  Catering: [
    "Buffet or plated service?",
    "Biryani: Hyderabadi or Lucknowi?",
    "Is a live chaat station non-negotiable?",
    "Vegetarian-only wedding — respectful or restrictive?",
  ],
  Entertainment: [
    "Live band or DJ?",
    "Dhol player for the baraat — absolutely essential or optional?",
    "Choreographed sangeet or freestyle?",
  ],
};

// Maps a filter label onto its canonical snake_case slug — used as the
// vote `context` tag and inside URL/query params.
const LABEL_TO_SLUG: Record<string, string> = {
  Photography: "photography",
  "Décor & Florals": "decor_florals",
  HMUA: "hmua",
  Catering: "catering",
  Entertainment: "entertainment",
};

// Vote context tag stored on poll_votes.context when a vote originates
// from this placement. Lets analytics segment "what did couples browsing
// photographers think about candid vs posed".
export function vendorCategoryVoteContext(
  filterLabel: VendorPollFilterLabel,
): string | null {
  const slug = LABEL_TO_SLUG[filterLabel];
  return slug ? `vendor_${slug}` : null;
}

export function hasVendorCategoryPolls(
  filterLabel: VendorPollFilterLabel,
): boolean {
  const pool = VENDOR_CATEGORY_POLL_QUESTIONS[filterLabel];
  return Array.isArray(pool) && pool.length > 0;
}

// Picks one poll question for the given filter label. Returns null when
// the label has no polls assigned (caller treats that as "don't render").
export function pickVendorCategoryPollQuestion(
  filterLabel: VendorPollFilterLabel,
): string | null {
  const pool = VENDOR_CATEGORY_POLL_QUESTIONS[filterLabel];
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
