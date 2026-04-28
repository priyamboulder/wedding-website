"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CONDITION_LABELS,
  EMPTY_FILTERS,
  type ListingType,
  type ListingCondition,
  type MarketplaceCategory,
  type MarketplaceFilterState,
  type MarketplaceListing,
  type MarketplaceSortKey,
} from "@/types/marketplace";
import { CLOTHING_CATEGORIES } from "@/lib/marketplace/utils";

interface BrowseFiltersProps {
  filters: MarketplaceFilterState;
  onChange: (f: MarketplaceFilterState) => void;
  sort: MarketplaceSortKey;
  onSortChange: (s: MarketplaceSortKey) => void;
  categories: MarketplaceCategory[];
  listings: MarketplaceListing[];
  resultCount: number;
  totalCount: number;
}

export function BrowseFilters({
  filters,
  onChange,
  sort,
  onSortChange,
  categories,
  listings,
  resultCount,
  totalCount,
}: BrowseFiltersProps) {
  const cities = Array.from(
    new Set(listings.map((l) => l.seller_location_city)),
  ).sort();
  const sizes = Array.from(
    new Set(listings.map((l) => l.size).filter((s): s is string => !!s)),
  ).sort();

  const showSize =
    filters.category == null || CLOTHING_CATEGORIES.has(filters.category);

  const anyFilter =
    filters.category != null ||
    filters.listingType !== "all" ||
    filters.condition !== "any" ||
    filters.city != null ||
    filters.size != null ||
    filters.shipsOnly ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.query.trim().length > 0;

  function patch(p: Partial<MarketplaceFilterState>) {
    onChange({ ...filters, ...p });
  }

  return (
    <div className="space-y-4">
      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <CategoryChip
          active={filters.category == null}
          onClick={() => patch({ category: null })}
        >
          All
        </CategoryChip>
        {categories.map((c) => (
          <CategoryChip
            key={c.slug}
            active={filters.category === c.slug}
            onClick={() => patch({ category: c.slug })}
          >
            <span className="mr-1" aria-hidden>{c.emoji}</span>
            {c.label}
          </CategoryChip>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={13}
            strokeWidth={1.6}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
            placeholder="Search lehengas, décor, signs…"
            className="w-full rounded-md border border-border bg-white py-1.5 pl-8 pr-8 text-[12.5px] text-ink outline-none focus:border-gold"
          />
          {filters.query && (
            <button
              onClick={() => patch({ query: "" })}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Listing type */}
        <LabeledSelect
          label="Type"
          value={filters.listingType}
          onChange={(v) => patch({ listingType: v as ListingType | "all" })}
          options={[
            { v: "all", label: "All" },
            { v: "sell", label: "Buy" },
            { v: "rent", label: "Rent" },
            { v: "sell_or_rent", label: "Either" },
            { v: "free", label: "Free" },
          ]}
        />

        {/* Condition */}
        <LabeledSelect
          label="Condition"
          value={filters.condition}
          onChange={(v) => patch({ condition: v as ListingCondition | "any" })}
          options={[
            { v: "any", label: "Any" },
            ...Object.entries(CONDITION_LABELS).map(([v, label]) => ({
              v,
              label,
            })),
          ]}
        />

        {/* City */}
        <LabeledSelect
          label="City"
          value={filters.city ?? ""}
          onChange={(v) => patch({ city: v || null })}
          options={[
            { v: "", label: "Anywhere" },
            ...cities.map((c) => ({ v: c, label: c })),
          ]}
        />

        {/* Size (only for clothing) */}
        {showSize && sizes.length > 0 && (
          <LabeledSelect
            label="Size"
            value={filters.size ?? ""}
            onChange={(v) => patch({ size: v || null })}
            options={[
              { v: "", label: "Any" },
              ...sizes.map((s) => ({ v: s, label: s })),
            ]}
          />
        )}

        {/* Price range */}
        <div className="flex flex-col gap-1">
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Price
          </span>
          <div className="flex items-center gap-1">
            <PriceInput
              value={filters.minPrice}
              onChange={(v) => patch({ minPrice: v })}
              placeholder="Min"
            />
            <span className="text-ink-faint">–</span>
            <PriceInput
              value={filters.maxPrice}
              onChange={(v) => patch({ maxPrice: v })}
              placeholder="Max"
            />
          </div>
        </div>

        {/* Ships toggle */}
        <label className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted cursor-pointer hover:border-gold/30">
          <input
            type="checkbox"
            checked={filters.shipsOnly}
            onChange={(e) => patch({ shipsOnly: e.target.checked })}
            className="accent-gold"
          />
          Ships to me
        </label>

        {/* Sort */}
        <LabeledSelect
          label="Sort"
          value={sort}
          onChange={(v) => onSortChange(v as MarketplaceSortKey)}
          options={[
            { v: "recent", label: "Recently listed" },
            { v: "price_asc", label: "Price: low to high" },
            { v: "price_desc", label: "Price: high to low" },
            { v: "most_saved", label: "Most saved" },
            { v: "best_deal", label: "Best deal" },
          ]}
        />

        {anyFilter && (
          <button
            onClick={() => onChange(EMPTY_FILTERS)}
            className="rounded-md border border-gold/25 bg-gold-pale/30 px-3 py-1.5 text-[11px] font-medium text-gold transition-colors hover:bg-gold-pale/50"
          >
            Clear filters
          </button>
        )}
      </div>

      <div
        className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {resultCount} of {totalCount} listings
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-gold/30 hover:bg-ivory-warm hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-white py-1.5 pl-2 pr-6 text-[11.5px] text-ink outline-none focus:border-gold"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PriceInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value ?? ""}
      onChange={(e) => {
        const raw = e.target.value.trim();
        if (!raw) return onChange(null);
        const n = Number(raw);
        onChange(Number.isFinite(n) && n >= 0 ? n : null);
      }}
      placeholder={placeholder}
      className="w-20 rounded-md border border-border bg-white py-1.5 px-2 text-[11.5px] text-ink outline-none focus:border-gold"
    />
  );
}
