"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Heart,
  LayoutGrid,
  MapPin,
  Rows,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useMarketplaceStore,
  CURRENT_USER_ID,
} from "@/stores/marketplace-store";
import { applyFilters, sortListings } from "@/lib/marketplace/utils";
import {
  ConditionBadge,
  Eyebrow,
  ListingCard,
  ListingTypePill,
  VerifiedSellerBadge,
} from "@/components/marketplace/primitives";
import { ReportListingModal } from "@/components/marketplace/ReportListingModal";
import { formatPrice } from "@/lib/marketplace/utils";
import {
  CONDITION_LABELS,
  EMPTY_FILTERS,
  LISTING_TYPE_LABELS,
  type MarketplaceFilterState,
  type MarketplaceListing,
  type MarketplaceSortKey,
} from "@/types/marketplace";
import {
  PriceTierChips,
  priceInSelectedTiers,
  type PriceTierKey,
} from "@/components/shopping/PriceTierChips";

export type MarketplaceGroupKey =
  | "category"
  | "city"
  | "condition"
  | "type"
  | "none";

export type MarketplaceViewKey = "grid" | "table";

interface Props {
  weddingId: string;
  filters: MarketplaceFilterState;
  onFiltersChange: (next: MarketplaceFilterState) => void;
  sort: MarketplaceSortKey;
  onSortChange: (s: MarketplaceSortKey) => void;
  group: MarketplaceGroupKey;
  onGroupChange: (g: MarketplaceGroupKey) => void;
  view: MarketplaceViewKey;
  onViewChange: (v: MarketplaceViewKey) => void;
}

export function MarketplaceBoard({
  weddingId,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  group,
  onGroupChange,
  view,
  onViewChange,
}: Props) {
  const ensureSeeded = useMarketplaceStore((s) => s.ensureSeeded);
  useEffect(() => { ensureSeeded(); }, [ensureSeeded]);
  const listings = useMarketplaceStore((s) => s.listings);
  const allCategories = useMarketplaceStore((s) => s.categories);
  const saves = useMarketplaceStore((s) => s.saves);
  const toggleSave = useMarketplaceStore((s) => s.toggleSave);
  const reportListing = useMarketplaceStore((s) => s.reportListing);

  const [reportingId, setReportingId] = useState<string | null>(null);
  const [priceTiers, setPriceTiers] = useState<Set<PriceTierKey>>(new Set());
  const togglePriceTier = (key: PriceTierKey) => {
    setPriceTiers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allListings = useMemo(
    () =>
      listings
        .filter((l) => l.status === "active")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
    [listings],
  );

  const categoryLabels = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of allCategories) m.set(c.slug, c.label);
    return m;
  }, [allCategories]);

  const savedIds = useMemo(() => {
    const s = new Set<string>();
    for (const x of saves) if (x.user_id === CURRENT_USER_ID) s.add(x.listing_id);
    return s;
  }, [saves]);

  const mySaves = useMemo(
    () => listings.filter((l) => savedIds.has(l.id)),
    [listings, savedIds],
  );

  const filtered = useMemo(
    () =>
      applyFilters(allListings, filters).filter((l) =>
        priceInSelectedTiers(
          l.price_cents != null ? l.price_cents / 100 : null,
          priceTiers,
        ),
      ),
    [allListings, filters, priceTiers],
  );
  const sorted = useMemo(() => sortListings(filtered, sort), [filtered, sort]);

  const grouped = useMemo(() => {
    if (group === "none") return [{ key: "__all__", label: "", items: sorted }];
    const m = new Map<string, MarketplaceListing[]>();
    for (const l of sorted) {
      const key =
        group === "category"
          ? l.category
          : group === "city"
            ? l.seller_location_city
            : group === "condition"
              ? l.condition
              : l.listing_type;
      const arr = m.get(key) ?? [];
      arr.push(l);
      m.set(key, arr);
    }
    const labelFor = (key: string): string => {
      if (group === "category") return categoryLabels.get(key) ?? key;
      if (group === "city") return key;
      if (group === "condition")
        return CONDITION_LABELS[key as keyof typeof CONDITION_LABELS] ?? key;
      if (group === "type")
        return LISTING_TYPE_LABELS[key as keyof typeof LISTING_TYPE_LABELS] ?? key;
      return key;
    };
    return Array.from(m.entries())
      .map(([key, items]) => ({ key, label: labelFor(key), items }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [sorted, group, categoryLabels]);

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
      {/* Hero header */}
      <div className="mb-6">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Shopping · Second-Hand & Rental
        </p>
        <h1 className="mt-2 font-serif text-[28px] leading-[1.1] tracking-tight text-ink sm:text-[32px]">
          wedding finds from brides who&rsquo;ve been where you are.
        </h1>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
          One-of-a-kind pieces, a fraction of the price — from lehengas worn
          once to centerpieces looking for a new celebration. Message the
          seller directly and handle the rest together.
        </p>
      </div>

      <ControlsBar
        query={filters.query}
        onQuery={(q) => onFiltersChange({ ...filters, query: q })}
        view={view}
        onView={onViewChange}
        group={group}
        onGroup={onGroupChange}
        sort={sort}
        onSort={onSortChange}
        resultCount={sorted.length}
        totalCount={allListings.length}
      />

      <div className="mb-5">
        <PriceTierChips selected={priceTiers} onToggle={togglePriceTier} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          hasAny={allListings.length > 0}
          onClear={() => onFiltersChange({ ...EMPTY_FILTERS, query: "" })}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map((g) => (
            <section key={g.key}>
              {g.label && (
                <Eyebrow className="mb-4">{g.label.toLowerCase()}</Eyebrow>
              )}
              {view === "grid" ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {g.items.map((l) => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      weddingId={weddingId}
                      saved={savedIds.has(l.id)}
                      onToggleSave={() => toggleSave(l.id)}
                      onReport={(id) => setReportingId(id)}
                    />
                  ))}
                </div>
              ) : (
                <ListingsTable
                  listings={g.items}
                  weddingId={weddingId}
                  savedIds={savedIds}
                  onToggleSave={toggleSave}
                  categoryLabels={categoryLabels}
                />
              )}
            </section>
          ))}
        </div>
      )}

      {mySaves.length > 0 && (
        <section className="mt-16">
          <Eyebrow className="mb-5">your saves</Eyebrow>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {mySaves.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                weddingId={weddingId}
                saved={true}
                onToggleSave={() => toggleSave(l.id)}
                onReport={(id) => setReportingId(id)}
              />
            ))}
          </div>
        </section>
      )}

      {reportingId && (
        <ReportListingModal
          onClose={() => setReportingId(null)}
          onSubmit={(reason, details) => {
            reportListing(reportingId, reason, details);
            setReportingId(null);
          }}
        />
      )}
    </main>
  );
}

function ControlsBar({
  query,
  onQuery,
  view,
  onView,
  group,
  onGroup,
  sort,
  onSort,
  resultCount,
  totalCount,
}: {
  query: string;
  onQuery: (q: string) => void;
  view: MarketplaceViewKey;
  onView: (v: MarketplaceViewKey) => void;
  group: MarketplaceGroupKey;
  onGroup: (g: MarketplaceGroupKey) => void;
  sort: MarketplaceSortKey;
  onSort: (s: MarketplaceSortKey) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:w-80">
          <Search
            size={13}
            strokeWidth={1.6}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search lehengas, décor, signs…"
            className="w-full rounded-md border border-border bg-white py-1.5 pl-8 pr-8 text-[12.5px] text-ink outline-none focus:border-gold"
          />
          {query && (
            <button
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <span
          className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {resultCount} of {totalCount}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-ink-faint">
            Group
          </span>
          <select
            value={group}
            onChange={(e) => onGroup(e.target.value as MarketplaceGroupKey)}
            className="rounded-md border border-border bg-white py-1 pl-2 pr-6 text-[11.5px] text-ink outline-none focus:border-gold"
          >
            <option value="category">Category</option>
            <option value="type">Type</option>
            <option value="condition">Condition</option>
            <option value="city">City</option>
            <option value="none">None</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-ink-faint">
            Sort
          </span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as MarketplaceSortKey)}
            className="rounded-md border border-border bg-white py-1 pl-2 pr-6 text-[11.5px] text-ink outline-none focus:border-gold"
          >
            <option value="recent">Recently listed</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="most_saved">Most saved</option>
            <option value="best_deal">Best deal</option>
          </select>
        </div>

        <div className="flex overflow-hidden rounded-md border border-border">
          <ViewButton
            active={view === "grid"}
            onClick={() => onView("grid")}
            icon={LayoutGrid}
            label="Grid"
          />
          <ViewButton
            active={view === "table"}
            onClick={() => onView("table")}
            icon={Rows}
            label="Table"
          />
        </div>
      </div>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 text-[11.5px] transition-colors",
        active ? "bg-ink text-ivory" : "bg-white text-ink-muted hover:bg-ivory-warm",
      )}
    >
      <Icon size={12} strokeWidth={1.8} />
      {label}
    </button>
  );
}

function ListingsTable({
  listings,
  weddingId,
  savedIds,
  onToggleSave,
  categoryLabels,
}: {
  listings: MarketplaceListing[];
  weddingId: string;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  categoryLabels: Map<string, string>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gold/15 bg-white">
      <table className="w-full text-[12.5px]">
        <thead
          className="border-b border-gold/15 bg-ivory-warm/40 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <tr>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Condition</th>
            <th className="px-4 py-2 text-left">Price</th>
            <th className="px-4 py-2 text-left">City</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => {
            const saved = savedIds.has(l.id);
            return (
              <tr
                key={l.id}
                className="border-t border-border/60 transition-colors hover:bg-ivory-warm/40"
              >
                <td className="px-4 py-2.5">
                  <Link
                    href={`/${weddingId}/shopping/marketplace/${l.id}`}
                    className="font-serif text-[13.5px] text-ink hover:underline"
                  >
                    {l.title}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-ink-muted">
                  {categoryLabels.get(l.category) ?? l.category}
                </td>
                <td className="px-4 py-2.5">
                  <ListingTypePill type={l.listing_type} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <ConditionBadge condition={l.condition} />
                    {l.seller_is_verified && <VerifiedSellerBadge />}
                  </div>
                </td>
                <td className="px-4 py-2.5 font-serif text-[13px] text-ink">
                  {l.listing_type === "free"
                    ? "FREE"
                    : formatPrice(l.price_cents, l.seller_location_country)}
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-1 text-ink-muted">
                    <MapPin size={11} strokeWidth={1.6} className="text-ink-faint" />
                    {l.seller_location_city}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => onToggleSave(l.id)}
                    aria-label={saved ? "Remove from saves" : "Save"}
                    aria-pressed={saved}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                      saved
                        ? "border-rose/40 bg-rose text-ivory"
                        : "border-border bg-white text-ink-muted hover:text-rose",
                    )}
                  >
                    <Heart
                      size={12}
                      strokeWidth={1.8}
                      fill={saved ? "currentColor" : "none"}
                    />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({
  hasAny,
  onClear,
}: {
  hasAny: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gold/25 bg-white px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-pale/40 text-gold">
        <ShoppingBag size={26} strokeWidth={1.3} />
      </div>
      <h2 className="font-serif text-[20px] text-ink">
        {hasAny ? "No listings match these filters" : "No listings yet"}
      </h2>
      <p className="max-w-sm text-[13px] text-ink-muted">
        {hasAny
          ? "Try removing a filter or clearing your search to see more pieces."
          : "Pre-Loved will fill up as brides finish their weddings. Check back soon."}
      </p>
      {hasAny && (
        <button
          onClick={onClear}
          className="mt-1 rounded-md border border-gold/30 bg-gold-pale/30 px-4 py-1.5 text-[11.5px] font-medium text-gold transition-colors hover:bg-gold-pale/50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
