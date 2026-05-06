"use client";

// ── Category drill-in view ─────────────────────────────────────────────────
// Renders /vendors/[category]. Header strip (back link + title + count
// subtitle), sticky filter rail on the left, masonry grid + sort on the
// right. Filter state persists into URL params so couples can share filtered
// views.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, Filter as FilterIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { useVendorsStore } from "@/stores/vendors-store";
import { useEventsStore } from "@/stores/events-store";
import { useVenueStore } from "@/stores/venue-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { deriveWeddingContext } from "@/lib/vendors/ai-recommendations";
import {
  CATEGORY_FILTER_CONFIG,
  EMPTY_DRILL_FILTERS,
  applyCategoryDrillFilters,
  categoryBudgetCeilings,
  sortCategoryDrill,
  suggestFilterRelaxation,
  vendorBudgetTier,
  type CategoryBudgetTier,
  type CategoryDrillFilters,
  type CategoryDrillSort,
  type CategoryTravelBucket,
} from "@/lib/vendors/filters";
import type { Vendor, VendorCategory } from "@/types/vendor";
import { CategoryFilters } from "./CategoryFilters";
import { VendorMasonryCard, type MasonryRibbon } from "./VendorMasonryCard";

const SORT_OPTIONS: Array<{ value: CategoryDrillSort; label: string }> = [
  { value: "best_match", label: "Best match" },
  { value: "price_asc", label: "Price low–high" },
  { value: "price_desc", label: "Price high–low" },
  { value: "most_reviewed", label: "Most reviewed" },
  { value: "newest", label: "Newest" },
];

// Render-side pagination: 24 cards = 3 columns × 8 rows on desktop. The full
// filtered list still drives counts and the "X match your budget tier"
// indicator; we just slice the rendered subset to keep DOM cost low and
// avoid masonry rebalancing as more cards appear.
const PAGE_SIZE = 24;

const CATEGORY_TITLE: Record<VendorCategory, string> = {
  photography: "Photography",
  decor_florals: "Décor & florals",
  catering: "Catering",
  entertainment: "Entertainment",
  hmua: "Hair & makeup",
  wardrobe: "Wardrobe",
  stationery: "Stationery",
  pandit_ceremony: "Officiant & ceremony",
};

// When the route is for an experience slug (e.g. /vendors/boba-cart) instead
// of an essential category, the page rents this same component but overrides
// the title, the filter chips, and adds a soft keyword filter on the parent
// category's vendor pool. Everything else (filter rail, masonry grid, sort)
// is identical to the essentials directory.
interface ExperienceOverride {
  title: string;
  noun_singular: string;
  noun_plural: string;
  styles: string[];
  // Soft match against name/style_tags/bio. If no parent-category vendors
  // match, the directory falls back to the full parent pool so the layout
  // doesn't read as broken.
  keyword?: string;
}

interface Props {
  category: VendorCategory;
  experience?: ExperienceOverride;
}

export function CategoryDrillIn({ category, experience }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Subscribe to a per-category slice of the store rather than the global
  // `vendors` array. This way the global page-by-page bootstrap (initFromAPI)
  // can keep running in the background without re-rendering the grid mid-
  // scroll — that progressive-set was the source of cards "inserting above
  // the viewport" with the masonry layout.
  const categoryVendors = useVendorsStore((s) => s.categoryVendors[category]);
  const isCategoryLoading = useVendorsStore(
    (s) => s.loadingCategories[category] ?? false,
  );
  const loadCategory = useVendorsStore((s) => s.loadCategory);
  const isShortlisted = useVendorsStore((s) => s.isShortlisted);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);

  const venueProfile = useVenueStore((s) => s.profile);
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const events = useEventsStore((s) => s.events);
  const weddingDate = useChecklistStore((s) => s.weddingDate);

  // Fetch the category once on mount (or when the user navigates between
  // categories). loadCategory pages internally and only writes to state once
  // the full set is in hand, so the grid doesn't shift while loading.
  useEffect(() => {
    if (!categoryVendors) loadCategory(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const baseConfig = CATEGORY_FILTER_CONFIG[category];
  const config = useMemo(
    () =>
      experience
        ? {
            ...baseConfig,
            styles: experience.styles,
            // Past-venues filter is photographer-flavored — drop it for
            // experience directories so the rail stays uncluttered.
            past_venues: [],
            noun_singular: experience.noun_singular,
            noun_plural: experience.noun_plural,
          }
        : baseConfig,
    [baseConfig, experience],
  );

  const ctx = useMemo(
    () => deriveWeddingContext({ venueProfile, coupleContext, events }),
    [venueProfile, coupleContext, events],
  );
  const ceilings = useMemo(
    () => categoryBudgetCeilings(category, ctx.budgetMaxCents),
    [category, ctx.budgetMaxCents],
  );

  const weddingDateIso = weddingDate ? weddingDate.toISOString().slice(0, 10) : null;
  const weddingDateLabel = weddingDate
    ? weddingDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "wedding day";

  // ── Filter state, kept in sync with URL params ───────────────────────────
  const filters = useMemo<CategoryDrillFilters>(
    () => parseFiltersFromParams(searchParams, config),
    [searchParams, config],
  );

  const [sort, setSort] = useState<CategoryDrillSort>(() =>
    parseSortFromParams(searchParams),
  );

  const updateFilters = useCallback(
    (next: CategoryDrillFilters) => {
      const params = serializeFiltersToParams(next, sort, config);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, sort, config],
  );

  const updateSort = useCallback(
    (next: CategoryDrillSort) => {
      setSort(next);
      const params = serializeFiltersToParams(filters, next, config);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, filters, config],
  );

  const resetFilters = useCallback(() => {
    setSort("best_match");
    router.replace("?", { scroll: false });
  }, [router]);

  // ── Vendors in this category ──────────────────────────────────────────────
  const inCategory = useMemo(() => {
    const inParent = categoryVendors ?? [];
    if (!experience?.keyword) return inParent;
    const needle = experience.keyword.toLowerCase();
    const matched = inParent.filter((v) => {
      const hay = [
        v.name,
        v.bio,
        v.tagline,
        v.style_tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
    // Soft match: if the keyword filter is too aggressive and we'd render an
    // empty page, fall back to the full parent pool so the directory still
    // reads as a working listing.
    return matched.length > 0 ? matched : inParent;
  }, [categoryVendors, experience]);

  const filtered = useMemo(
    () =>
      applyCategoryDrillFilters(
        inCategory,
        filters,
        config,
        ceilings,
        weddingDateIso,
      ),
    [inCategory, filters, config, ceilings, weddingDateIso],
  );

  const sorted = useMemo(
    () => sortCategoryDrill(filtered, sort),
    [filtered, sort],
  );

  // ── Render-side pagination ───────────────────────────────────────────────
  // Reset back to the first page whenever filters or sort change so the user
  // doesn't end up viewing a stale slice. Using a stable string key avoids
  // resetting on identity-only changes to the searchParams object.
  const [displayedCount, setDisplayedCount] = useState<number>(PAGE_SIZE);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const filterKey = useMemo(
    () => `${searchParams?.toString() ?? ""}|${sort}`,
    [searchParams, sort],
  );
  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
  }, [filterKey]);

  const displayed = useMemo(
    () => sorted.slice(0, displayedCount),
    [sorted, displayedCount],
  );
  const hasMore = displayed.length < sorted.length;

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isFetchingMore) return;
    setIsFetchingMore(true);
    // Tiny defer so the spinner paints before React commits the larger slice.
    // The data is already in memory, so this is purely a render-time signal.
    window.setTimeout(() => {
      setDisplayedCount((c) => c + PAGE_SIZE);
      setIsFetchingMore(false);
    }, 0);
  }, [hasMore, isFetchingMore]);

  const ribbonByVendorId = useMemo(() => {
    const m = new Map<string, MasonryRibbon>();
    if (sort !== "best_match" || sorted.length === 0) return m;
    // Top match: highest scoring tier-select OR highest rating overall.
    const top = sorted[0];
    if (top) m.set(top.id, "top_match");
    // Rising star: highly-rated, low wedding count, not the top pick.
    const rising = sorted.find(
      (v) =>
        v.id !== top?.id &&
        v.tier !== "select" &&
        (v.rating ?? 0) >= 4.6 &&
        v.wedding_count <= 80,
    );
    if (rising) m.set(rising.id, "rising_star");
    return m;
  }, [sorted, sort]);

  const withinBudgetCount = useMemo(
    () => sorted.filter((v) => vendorBudgetTier(v, ceilings) === "within").length,
    [sorted, ceilings],
  );

  const hasActiveFilters = useMemo(
    () => !drillFiltersEqual(filters, EMPTY_DRILL_FILTERS),
    [filters],
  );

  const relaxation = useMemo(
    () =>
      sorted.length === 0
        ? suggestFilterRelaxation(
            inCategory,
            filters,
            config,
            ceilings,
            weddingDateIso,
          )
        : null,
    [sorted.length, inCategory, filters, config, ceilings, weddingDateIso],
  );

  // ── Mobile filter drawer ──────────────────────────────────────────────────
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 lg:px-8">
        <Header
          title={experience?.title ?? CATEGORY_TITLE[category]}
          totalCount={sorted.length}
          withinBudgetCount={withinBudgetCount}
          nounPlural={config.noun_plural}
        />

        <div className="mt-6 flex items-start gap-8">
          <CategoryFilters
            config={config}
            filters={filters}
            onChange={updateFilters}
            weddingDateLabel={weddingDateLabel}
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted lg:hidden"
              >
                <FilterIcon size={12} strokeWidth={1.6} />
                Filters
                {hasActiveFilters && (
                  <span className="ml-0.5 rounded-full bg-gold px-1.5 py-[1px] text-[9.5px] font-semibold text-white">
                    on
                  </span>
                )}
              </button>
              <div className="ml-auto">
                <SortDropdown value={sort} onChange={updateSort} />
              </div>
            </div>

            {!categoryVendors && isCategoryLoading ? (
              <SkeletonGrid />
            ) : sorted.length === 0 ? (
              <EmptyState
                nounPlural={config.noun_plural}
                relaxation={relaxation}
                hasActive={hasActiveFilters}
                onReset={resetFilters}
              />
            ) : (
              <>
                <MasonryGrid>
                  {displayed.map((v, i) => (
                    <VendorMasonryCard
                      key={v.id}
                      vendor={v}
                      shortlisted={isShortlisted(v.id)}
                      onToggleShortlist={() => toggleShortlist(v.id)}
                      ribbon={ribbonByVendorId.get(v.id) ?? null}
                      budgetTier={vendorBudgetTier(v, ceilings)}
                      imageHeight={imageHeightFor(i)}
                      venueMatchLabel={venueMatchLabelFor(v, config)}
                    />
                  ))}
                </MasonryGrid>

                <LoadMoreFooter
                  showing={displayed.length}
                  total={sorted.length}
                  nounPlural={config.noun_plural}
                  hasMore={hasMore}
                  isFetching={isFetchingMore}
                  onLoadMore={handleLoadMore}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {mobileFiltersOpen && (
        <MobileFilterDrawer onClose={() => setMobileFiltersOpen(false)}>
          <CategoryFilters
            config={config}
            filters={filters}
            onChange={updateFilters}
            weddingDateLabel={weddingDateLabel}
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          />
        </MobileFilterDrawer>
      )}
    </div>
  );
}

// ── Header strip ───────────────────────────────────────────────────────────

function Header({
  title,
  totalCount,
  withinBudgetCount,
  nounPlural,
}: {
  title: string;
  totalCount: number;
  withinBudgetCount: number;
  nounPlural: string;
}) {
  return (
    <header className="flex flex-col gap-2 border-b border-border pb-5">
      <Link
        href="/vendors"
        className="inline-flex w-fit items-center gap-1.5 text-[12px] text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={12} strokeWidth={1.8} />
        All vendors
      </Link>
      <h1
        className="font-serif text-[22px] font-medium text-ink"
        style={{ fontWeight: 500 }}
      >
        {title}
      </h1>
      <p className="text-[12.5px] text-ink-muted">
        {totalCount} {nounPlural} · {withinBudgetCount} match your budget tier
      </p>
    </header>
  );
}

// ── Sort dropdown ──────────────────────────────────────────────────────────

function SortDropdown({
  value,
  onChange,
}: {
  value: CategoryDrillSort;
  onChange: (v: CategoryDrillSort) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        Sort
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as CategoryDrillSort)}
          className="appearance-none rounded-md border border-border bg-white px-2.5 py-1 pr-7 text-[12px] text-ink outline-none focus:border-gold/60"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          strokeWidth={1.8}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint"
        />
      </div>
    </label>
  );
}

// ── Masonry grid ───────────────────────────────────────────────────────────

function MasonryGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="[column-gap:12px] sm:columns-2 lg:columns-3"
      style={{ columnFill: "balance" }}
    >
      {children}
    </div>
  );
}

// ── Load-more footer ───────────────────────────────────────────────────────
// Sits below the grid. Surfaces the showing/total count so the user can see
// how many vendors are still hidden, and reveals the next batch on click.

function LoadMoreFooter({
  showing,
  total,
  nounPlural,
  hasMore,
  isFetching,
  onLoadMore,
}: {
  showing: number;
  total: number;
  nounPlural: string;
  hasMore: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
}) {
  return (
    <div className="mt-4 flex flex-col items-center gap-3 pt-2">
      <p
        className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Showing {showing} of {total} {nounPlural}
      </p>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isFetching}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border border-border bg-white px-5 py-2 text-[12.5px] font-medium text-ink transition-colors",
            "hover:border-gold/40 hover:text-saffron",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isFetching ? (
            <>
              <Loader2 size={13} strokeWidth={1.8} className="animate-spin" />
              Loading…
            </>
          ) : (
            <>Load more</>
          )}
        </button>
      )}
    </div>
  );
}

// ── Skeleton grid ──────────────────────────────────────────────────────────
// Placeholder cards shown during the initial fetch so the layout doesn't
// shift when real cards arrive. Mirrors the masonry structure with the same
// height cycle as the live grid.

function SkeletonGrid() {
  return (
    <MasonryGrid>
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} height={imageHeightFor(i)} />
      ))}
    </MasonryGrid>
  );
}

function SkeletonCard({ height }: { height: 240 | 280 | 320 }) {
  return (
    <div className="mb-3 overflow-hidden rounded-[12px] border border-border bg-white break-inside-avoid">
      <div
        className="w-full animate-pulse bg-ivory-warm"
        style={{ height }}
      />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-ivory-warm" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-ivory-warm" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-4 w-16 animate-pulse rounded-full bg-ivory-warm" />
          <div className="h-4 w-12 animate-pulse rounded-full bg-ivory-warm" />
        </div>
      </div>
    </div>
  );
}

function imageHeightFor(index: number): 240 | 280 | 320 {
  // Cycle through three heights to create vertical rhythm in the masonry.
  const cycle: Array<240 | 280 | 320> = [280, 240, 320, 240, 320, 280];
  return cycle[index % cycle.length];
}

function venueMatchLabelFor(
  vendor: Vendor,
  config: { past_venues: Array<{ label: string; match: string }> },
): string | null {
  for (const pv of config.past_venues) {
    if (
      vendor.venue_connections.some((vc) =>
        vc.name.toLowerCase().includes(pv.match.toLowerCase()),
      )
    ) {
      // Strip "Has shot at " prefix if present, so the badge reads cleanly.
      return pv.label.replace(/^Has shot at\s*/i, "Shoots ");
    }
  }
  return null;
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyState({
  nounPlural,
  relaxation,
  hasActive,
  onReset,
}: {
  nounPlural: string;
  relaxation: { hint: string; gain: number } | null;
  hasActive: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-white/60 px-6 py-14 text-center">
      <p className="font-serif text-[18px] text-ink">No {nounPlural} match these filters.</p>
      {relaxation ? (
        <p className="text-[13px] text-ink-muted">
          Try removing {relaxation.hint} to see {relaxation.gain} more.
        </p>
      ) : hasActive ? (
        <p className="text-[13px] text-ink-muted">
          Try clearing some filters to widen the pool.
        </p>
      ) : (
        <p className="text-[13px] text-ink-muted">
          The directory hasn't loaded any {nounPlural} yet.
        </p>
      )}
      {hasActive && (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink/15 hover:text-ink"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

// ── Mobile drawer ──────────────────────────────────────────────────────────

function MobileFilterDrawer({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close filters"
        className="flex-1 bg-ink/40"
      />
      <div className="w-[280px] overflow-y-auto bg-ivory px-5 py-6">
        <button
          type="button"
          onClick={onClose}
          className="mb-3 inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink"
        >
          <X size={12} strokeWidth={1.8} />
          Close
        </button>
        {/* CategoryFilters is hidden on mobile by default — re-show it inside
            this drawer with a wrapping override. */}
        <div className={cn("[&>aside]:!block [&>aside]:!sticky-0 [&>aside]:!w-full")}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── URL param (de)serialization ────────────────────────────────────────────

function parseFiltersFromParams(
  params: URLSearchParams | null,
  config: { styles: string[]; past_venues: Array<{ label: string }> },
): CategoryDrillFilters {
  const get = (k: string) => params?.get(k) ?? null;
  const getAll = (k: string) => params?.getAll(k) ?? [];

  const validBudget: CategoryBudgetTier[] = ["within", "stretch", "splurge"];
  const validTravel: CategoryTravelBucket[] = ["local", "india", "international"];

  const stylesParam = getAll("style").filter((s) => config.styles.includes(s));
  const venuesParam = getAll("venue").filter((v) =>
    config.past_venues.some((pv) => pv.label === v),
  );

  return {
    styles: stylesParam,
    budget_tier: validBudget.includes(get("budget") as CategoryBudgetTier)
      ? (get("budget") as CategoryBudgetTier)
      : null,
    travel: validTravel.includes(get("travel") as CategoryTravelBucket)
      ? (get("travel") as CategoryTravelBucket)
      : null,
    past_venues: venuesParam,
    // Default-on; the URL stores `avail=0` to express "off".
    available_on_date: get("avail") !== "0",
    select_only: get("select") === "1",
  };
}

function parseSortFromParams(
  params: URLSearchParams | null,
): CategoryDrillSort {
  const valid: CategoryDrillSort[] = [
    "best_match",
    "price_asc",
    "price_desc",
    "most_reviewed",
    "newest",
  ];
  const v = params?.get("sort") ?? "best_match";
  return (valid.includes(v as CategoryDrillSort) ? v : "best_match") as CategoryDrillSort;
}

function serializeFiltersToParams(
  f: CategoryDrillFilters,
  sort: CategoryDrillSort,
  _config: { styles: string[] },
): URLSearchParams {
  const params = new URLSearchParams();
  for (const s of f.styles) params.append("style", s);
  if (f.budget_tier) params.set("budget", f.budget_tier);
  if (f.travel) params.set("travel", f.travel);
  for (const v of f.past_venues) params.append("venue", v);
  // Default-on for availability; only serialize when toggled OFF.
  if (!f.available_on_date) params.set("avail", "0");
  if (f.select_only) params.set("select", "1");
  if (sort !== "best_match") params.set("sort", sort);
  return params;
}

function drillFiltersEqual(
  a: CategoryDrillFilters,
  b: CategoryDrillFilters,
): boolean {
  return (
    a.budget_tier === b.budget_tier &&
    a.travel === b.travel &&
    a.available_on_date === b.available_on_date &&
    a.select_only === b.select_only &&
    a.styles.length === b.styles.length &&
    a.styles.every((s) => b.styles.includes(s)) &&
    a.past_venues.length === b.past_venues.length &&
    a.past_venues.every((s) => b.past_venues.includes(s))
  );
}
