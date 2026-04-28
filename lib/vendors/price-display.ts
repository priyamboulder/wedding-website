import type { PriceDisplay } from "@/types/vendor-unified";

// Short INR summary used in dense tables and vendor cards where we don't have
// room for the full "₹1,20,000 – ₹1,50,000" spelling. Falls back to K / L / Cr
// so large sums stay readable.
function shortInr(n: number): string {
  if (!Number.isFinite(n)) return "";
  if (n >= 1_00_00_000) {
    const v = n / 1_00_00_000;
    return `₹${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}Cr`;
  }
  if (n >= 1_00_000) {
    const v = n / 1_00_000;
    return `₹${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}L`;
  }
  if (n >= 1_000) return `₹${Math.round(n / 1_000)}K`;
  return `₹${Math.round(n)}`;
}

function fullInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

// Short card/table label: "From ₹3.8L", "₹12L – ₹25L", "Contact".
export function formatPriceShort(pd: PriceDisplay | null | undefined): string {
  if (!pd) return "";
  switch (pd.type) {
    case "exact":
      return shortInr(pd.amount);
    case "starting_from":
      return `From ${shortInr(pd.amount)}`;
    case "range":
      return `${shortInr(pd.min)} – ${shortInr(pd.max)}`;
    case "contact":
      return "Contact";
  }
}

// Verbose label used on the profile panel and package cards: "₹3,80,000",
// "From ₹3,80,000", "₹12,00,000 – ₹25,00,000", "Contact for pricing".
export function formatPriceDetail(pd: PriceDisplay | null | undefined): string {
  if (!pd) return "";
  switch (pd.type) {
    case "exact":
      return fullInr(pd.amount);
    case "starting_from":
      return `From ${fullInr(pd.amount)}`;
    case "range":
      return `${fullInr(pd.min)} – ${fullInr(pd.max)}`;
    case "contact":
      return "Contact for pricing";
  }
}

// Kind label for the "Price display" switcher in the vendor portal.
export const PRICE_DISPLAY_LABEL: Record<PriceDisplay["type"], string> = {
  exact: "Exact price",
  starting_from: "Starting from",
  range: "Price range",
  contact: "Contact for pricing",
};

// Upper bound used for price-band filters and budget scoring.
// Returns the highest amount the vendor might charge (`max` for a range,
// `amount` for exact/starting_from, null for contact).
export function priceDisplayHighEnd(pd: PriceDisplay | null | undefined): number | null {
  if (!pd) return null;
  switch (pd.type) {
    case "exact":
    case "starting_from":
      return pd.amount;
    case "range":
      return pd.max;
    case "contact":
      return null;
  }
}

// Lower bound — symmetric to `priceDisplayHighEnd`. Useful for sorting
// "cheapest first" lists.
export function priceDisplayLowEnd(pd: PriceDisplay | null | undefined): number | null {
  if (!pd) return null;
  switch (pd.type) {
    case "exact":
    case "starting_from":
      return pd.amount;
    case "range":
      return pd.min;
    case "contact":
      return null;
  }
}
