import type {
  ShoppingLink,
  ShoppingStatus,
  ShoppingSourceType,
  StockStatus,
} from "@/lib/link-preview/types";

export const UNASSIGNED_KEY = "__unassigned__";

export type AssignmentFilter = "linked" | "unassigned";

// The primary mode segments the whole Shopping module. "all" merges both
// external + native. "creator_picks" renders a parallel creator-curated view.
export type ShoppingMode =
  | "external"
  | "ananya_store"
  | "all"
  | "creator_picks"
  | "pre-loved";

// Buckets native items by effective availability (from the product, not
// the cart state). External items don't participate in this facet.
export type AvailabilityFilter = "in_stock" | "low_stock" | "made_to_order" | "sold_out";

export interface ShoppingFilterState {
  modules: string[];
  statuses: ShoppingStatus[];
  domains: string[];
  vendors: string[];
  assignment: AssignmentFilter[];
  availability: AvailabilityFilter[];
  minPrice: number | null;
  maxPrice: number | null;
  maxLeadTimeDays: number | null;
  query: string;
}

export const EMPTY_FILTERS: ShoppingFilterState = {
  modules: [],
  statuses: [],
  domains: [],
  vendors: [],
  assignment: [],
  availability: [],
  minPrice: null,
  maxPrice: null,
  maxLeadTimeDays: null,
  query: "",
};

export function scopeByMode(
  links: ShoppingLink[],
  mode: ShoppingMode,
): ShoppingLink[] {
  if (mode === "all") return links;
  if (mode === "external") return links.filter((l) => l.sourceType === "external");
  if (mode === "ananya_store")
    return links.filter((l) => l.sourceType === "ananya_store");
  // creator_picks — parallel catalog, doesn't pull from saved links
  return [];
}

export type GroupKey = "module" | "status" | "source" | "vendor" | "none";

export type SortKey =
  | "title"
  | "module"
  | "price"
  | "total"
  | "status"
  | "source"
  | "vendor"
  | "leadTime"
  | "added";

export type SortDir = "asc" | "desc";

export function filtersAreEmpty(f: ShoppingFilterState): boolean {
  return (
    f.modules.length === 0 &&
    f.statuses.length === 0 &&
    f.domains.length === 0 &&
    f.vendors.length === 0 &&
    f.assignment.length === 0 &&
    f.availability.length === 0 &&
    f.minPrice == null &&
    f.maxPrice == null &&
    f.maxLeadTimeDays == null &&
    f.query.trim() === ""
  );
}

function matchesSearch(link: ShoppingLink, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  const haystacks = [
    link.title,
    link.userNote,
    link.domain,
    link.description ?? "",
    link.siteName ?? "",
    link.vendorName ?? "",
    link.variant?.label ?? "",
  ]
    .join(" \u0001 ")
    .toLowerCase();
  return haystacks.includes(needle);
}

export function applyFilters(
  links: ShoppingLink[],
  f: ShoppingFilterState,
): ShoppingLink[] {
  return links.filter((l) => {
    if (f.modules.length) {
      const key = l.module ?? UNASSIGNED_KEY;
      if (!f.modules.includes(key)) return false;
    }
    if (f.statuses.length && !f.statuses.includes(l.status)) return false;
    if (f.domains.length) {
      // Domains only apply to external items; native items aren't excluded by
      // a domain filter in All mode unless no source filter is also driving it.
      if (l.sourceType === "external" && !f.domains.includes(l.domain)) return false;
      if (l.sourceType === "ananya_store") return false;
    }
    if (f.vendors.length) {
      if (l.sourceType !== "ananya_store") return false;
      if (!l.vendorId || !f.vendors.includes(l.vendorId)) return false;
    }
    if (f.assignment.length) {
      const state: AssignmentFilter = l.taskId ? "linked" : "unassigned";
      if (!f.assignment.includes(state)) return false;
    }
    if (f.availability.length) {
      if (l.sourceType !== "ananya_store") return false;
      if (!l.stockStatus || !f.availability.includes(l.stockStatus)) return false;
    }
    if (f.maxLeadTimeDays != null) {
      if (l.sourceType !== "ananya_store") return false;
      if ((l.leadTimeDays ?? 0) > f.maxLeadTimeDays) return false;
    }
    if (f.minPrice != null && (l.price ?? 0) < f.minPrice) return false;
    if (f.maxPrice != null && (l.price ?? Infinity) > f.maxPrice) return false;
    if (!matchesSearch(l, f.query)) return false;
    return true;
  });
}

export interface FacetCount {
  value: string;
  count: number;
}

export function countByModule(links: ShoppingLink[]): FacetCount[] {
  return countBy(links, (l) => l.module ?? UNASSIGNED_KEY);
}

export function countByStatus(links: ShoppingLink[]): FacetCount[] {
  return countBy(links, (l) => l.status);
}

export function countByDomain(links: ShoppingLink[]): FacetCount[] {
  return countBy(links, (l) => l.domain).sort((a, b) => b.count - a.count);
}

export function countByAssignment(links: ShoppingLink[]): Record<AssignmentFilter, number> {
  const out: Record<AssignmentFilter, number> = { linked: 0, unassigned: 0 };
  for (const l of links) {
    if (l.taskId) out.linked += 1;
    else out.unassigned += 1;
  }
  return out;
}

export function countByVendor(links: ShoppingLink[]): FacetCount[] {
  return countBy(
    links.filter((l) => l.sourceType === "ananya_store" && l.vendorId),
    (l) => l.vendorId as string,
  ).sort((a, b) => b.count - a.count);
}

export function countByAvailability(
  links: ShoppingLink[],
): Record<AvailabilityFilter, number> {
  const out: Record<AvailabilityFilter, number> = {
    in_stock: 0,
    low_stock: 0,
    made_to_order: 0,
    sold_out: 0,
  };
  for (const l of links) {
    if (l.sourceType === "ananya_store" && l.stockStatus) {
      out[l.stockStatus] += 1;
    }
  }
  return out;
}

export function countBySourceType(
  links: ShoppingLink[],
): Record<ShoppingSourceType, number> {
  const out: Record<ShoppingSourceType, number> = {
    external: 0,
    ananya_store: 0,
  };
  for (const l of links) out[l.sourceType] += 1;
  return out;
}

function countBy(
  links: ShoppingLink[],
  key: (l: ShoppingLink) => string,
): FacetCount[] {
  const counts = new Map<string, number>();
  for (const l of links) {
    const k = key(l);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return Array.from(counts, ([value, count]) => ({ value, count }));
}

export function groupLinks(
  links: ShoppingLink[],
  by: GroupKey,
): Array<{ key: string; links: ShoppingLink[] }> {
  if (by === "none") return [{ key: "", links }];
  const bucket = new Map<string, ShoppingLink[]>();
  for (const l of links) {
    let k: string;
    switch (by) {
      case "module":
        k = l.module ?? UNASSIGNED_KEY;
        break;
      case "status":
        k = l.status;
        break;
      case "vendor":
        k =
          l.sourceType === "ananya_store" && l.vendorId
            ? l.vendorId
            : UNASSIGNED_KEY;
        break;
      case "source":
      default:
        k = l.sourceType === "ananya_store" ? "Ananya Store" : l.domain;
        break;
    }
    if (!bucket.has(k)) bucket.set(k, []);
    bucket.get(k)!.push(l);
  }
  return Array.from(bucket, ([key, links]) => ({ key, links }));
}

export function sortLinks(
  links: ShoppingLink[],
  key: SortKey,
  dir: SortDir,
): ShoppingLink[] {
  const mul = dir === "asc" ? 1 : -1;
  const copy = [...links];
  copy.sort((a, b) => {
    const av = sortValue(a, key);
    const bv = sortValue(b, key);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * mul;
    }
    return String(av).localeCompare(String(bv)) * mul;
  });
  return copy;
}

function sortValue(l: ShoppingLink, key: SortKey): string | number | null {
  switch (key) {
    case "title":
      return l.title.toLowerCase();
    case "module":
      return l.module ?? "";
    case "price":
      return l.price;
    case "total":
      return l.price == null ? null : l.price * l.quantity;
    case "status":
      return l.status;
    case "source":
      return l.sourceType === "ananya_store" ? "_ananya" : l.domain;
    case "vendor":
      return l.vendorName ?? "";
    case "leadTime":
      return l.leadTimeDays;
    case "added":
      return l.createdAt;
    default:
      return null;
  }
}

export interface CurrencyTotals {
  currency: string;
  ordered: number;
  considering: number;
  received: number;
  returned: number;
}

export function totalsByCurrency(links: ShoppingLink[]): CurrencyTotals[] {
  const map = new Map<string, CurrencyTotals>();
  for (const l of links) {
    if (l.price == null) continue;
    const cur = l.currency || "USD";
    let row = map.get(cur);
    if (!row) {
      row = {
        currency: cur,
        ordered: 0,
        considering: 0,
        received: 0,
        returned: 0,
      };
      map.set(cur, row);
    }
    const sub = l.price * l.quantity;
    row[l.status] += sub;
  }
  return Array.from(map.values()).sort((a, b) =>
    a.currency.localeCompare(b.currency),
  );
}

export function statusCounts(links: ShoppingLink[]): Record<ShoppingStatus, number> {
  const out: Record<ShoppingStatus, number> = {
    considering: 0,
    ordered: 0,
    received: 0,
    returned: 0,
  };
  for (const l of links) out[l.status] += 1;
  return out;
}

// Store-only breakdown for the adaptive stats row.
export interface StoreTotals {
  currency: string;
  inCart: number;
  inCartCount: number;
  inProduction: number;
  inProductionCount: number;
  ordered: number;
  received: number;
}

export function storeTotals(
  links: ShoppingLink[],
  cartIds: Set<string>,
): StoreTotals[] {
  const map = new Map<string, StoreTotals>();
  for (const l of links) {
    if (l.sourceType !== "ananya_store") continue;
    const cur = l.currency || "USD";
    let row = map.get(cur);
    if (!row) {
      row = {
        currency: cur,
        inCart: 0,
        inCartCount: 0,
        inProduction: 0,
        inProductionCount: 0,
        ordered: 0,
        received: 0,
      };
      map.set(cur, row);
    }
    const sub = (l.price ?? 0) * l.quantity;
    if (cartIds.has(l.id) && l.status === "considering") {
      row.inCart += sub;
      row.inCartCount += 1;
    }
    if (
      l.status === "ordered" &&
      l.stockStatus === "made_to_order"
    ) {
      row.inProduction += sub;
      row.inProductionCount += 1;
    }
    if (l.status === "ordered") row.ordered += sub;
    if (l.status === "received") row.received += sub;
  }
  return Array.from(map.values()).sort((a, b) =>
    a.currency.localeCompare(b.currency),
  );
}

// Split all-time spend by source, for the "All" mode stats row.
export interface SpendSplit {
  currency: string;
  total: number;
  native: number;
  external: number;
}

export function spendSplit(links: ShoppingLink[]): SpendSplit[] {
  const map = new Map<string, SpendSplit>();
  for (const l of links) {
    if (l.price == null) continue;
    if (l.status !== "ordered" && l.status !== "received") continue;
    const cur = l.currency || "USD";
    let row = map.get(cur);
    if (!row) {
      row = { currency: cur, total: 0, native: 0, external: 0 };
      map.set(cur, row);
    }
    const sub = l.price * l.quantity;
    row.total += sub;
    if (l.sourceType === "ananya_store") row.native += sub;
    else row.external += sub;
  }
  return Array.from(map.values()).sort((a, b) =>
    a.currency.localeCompare(b.currency),
  );
}

/**
 * Sort module groups so unassigned is last, then alphabetically.
 * Accepts an optional module-title resolver for prettier ordering.
 */
export function sortGroupsWithUnassignedLast<T extends { key: string }>(
  groups: T[],
  labeler?: (key: string) => string,
): T[] {
  return [...groups].sort((a, b) => {
    if (a.key === UNASSIGNED_KEY) return 1;
    if (b.key === UNASSIGNED_KEY) return -1;
    const al = labeler ? labeler(a.key) : a.key;
    const bl = labeler ? labeler(b.key) : b.key;
    return al.localeCompare(bl);
  });
}

/**
 * Count how many times each normalizedUrl appears across all links.
 * Used for the "Saved X times" hint on cards.
 */
export function computeDuplicateCounts(
  links: ShoppingLink[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const l of links) {
    counts.set(l.normalizedUrl, (counts.get(l.normalizedUrl) ?? 0) + 1);
  }
  return counts;
}
