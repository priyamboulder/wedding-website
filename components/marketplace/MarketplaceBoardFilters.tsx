"use client";

import { useMemo, useState } from "react";
import { ChevronDown, MapPin, Tag as TagIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CONDITION_LABELS,
  EMPTY_FILTERS,
  type ListingCondition,
  type ListingType,
  type MarketplaceCategory,
  type MarketplaceFilterState,
  type MarketplaceListing,
} from "@/types/marketplace";
import { CLOTHING_CATEGORIES } from "@/lib/marketplace/utils";

interface Props {
  listings: MarketplaceListing[];
  categories: MarketplaceCategory[];
  filters: MarketplaceFilterState;
  onChange: (next: MarketplaceFilterState) => void;
}

const TYPE_OPTIONS: { value: ListingType | "all"; label: string; dot: string }[] = [
  { value: "all", label: "All", dot: "bg-ink/60" },
  { value: "sell", label: "For sale", dot: "bg-saffron" },
  { value: "rent", label: "For rent", dot: "bg-ink/80" },
  { value: "sell_or_rent", label: "Sale or rent", dot: "bg-gold" },
  { value: "free", label: "Free", dot: "bg-sage" },
];

export function MarketplaceBoardFilters({
  listings,
  categories,
  filters,
  onChange,
}: Props) {
  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of listings) m.set(l.category, (m.get(l.category) ?? 0) + 1);
    return m;
  }, [listings]);

  const cityCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of listings)
      m.set(l.seller_location_city, (m.get(l.seller_location_city) ?? 0) + 1);
    return Array.from(m.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  }, [listings]);

  const typeCounts = useMemo(() => {
    const m = new Map<ListingType, number>();
    for (const l of listings)
      m.set(l.listing_type, (m.get(l.listing_type) ?? 0) + 1);
    return m;
  }, [listings]);

  const conditionCounts = useMemo(() => {
    const m = new Map<ListingCondition, number>();
    for (const l of listings)
      m.set(l.condition, (m.get(l.condition) ?? 0) + 1);
    return m;
  }, [listings]);

  const sizeCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of listings) {
      if (!l.size) continue;
      m.set(l.size, (m.get(l.size) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [listings]);

  const showSize =
    filters.category == null || CLOTHING_CATEGORIES.has(filters.category);

  function patch(p: Partial<MarketplaceFilterState>) {
    onChange({ ...filters, ...p });
  }

  const empty =
    filters.category == null &&
    filters.listingType === "all" &&
    filters.condition === "any" &&
    filters.city == null &&
    filters.size == null &&
    !filters.shipsOnly &&
    filters.minPrice == null &&
    filters.maxPrice == null;

  function clearAll() {
    onChange({ ...EMPTY_FILTERS, query: filters.query });
  }

  return (
    <aside
      className="sidebar-scroll sticky top-0 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-border bg-ivory/60 px-5 py-6 lg:block"
      aria-label="Pre-Loved filters"
    >
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Filters
        </h2>
        {!empty && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-muted transition-colors hover:text-rose"
          >
            <X size={10} strokeWidth={1.8} /> clear all
          </button>
        )}
      </div>

      <FilterSection title="Category" defaultOpen>
        <RadioRow
          label={<span className="italic text-ink-muted">All</span>}
          count={listings.length}
          checked={filters.category == null}
          onSelect={() => patch({ category: null })}
        />
        {categories.map((c) => (
          <RadioRow
            key={c.slug}
            label={
              <span className="flex items-center gap-2">
                <span aria-hidden>{c.emoji}</span>
                <span className="truncate">{c.label}</span>
              </span>
            }
            count={categoryCounts.get(c.slug) ?? 0}
            checked={filters.category === c.slug}
            onSelect={() => patch({ category: c.slug })}
          />
        ))}
      </FilterSection>

      <FilterSection title="Listing Type" defaultOpen>
        {TYPE_OPTIONS.map((o) => (
          <RadioRow
            key={o.value}
            label={
              <span className="flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 rounded-full", o.dot)} />
                {o.label}
              </span>
            }
            count={
              o.value === "all"
                ? listings.length
                : typeCounts.get(o.value as ListingType) ?? 0
            }
            checked={filters.listingType === o.value}
            onSelect={() => patch({ listingType: o.value })}
          />
        ))}
      </FilterSection>

      <FilterSection title="Condition">
        <RadioRow
          label={<span className="italic text-ink-muted">Any</span>}
          count={listings.length}
          checked={filters.condition === "any"}
          onSelect={() => patch({ condition: "any" })}
        />
        {(Object.entries(CONDITION_LABELS) as [ListingCondition, string][]).map(
          ([v, label]) => (
            <RadioRow
              key={v}
              label={label}
              count={conditionCounts.get(v) ?? 0}
              checked={filters.condition === v}
              onSelect={() => patch({ condition: v })}
            />
          ),
        )}
      </FilterSection>

      <FilterSection title="City">
        <RadioRow
          label={<span className="italic text-ink-muted">Anywhere</span>}
          count={listings.length}
          checked={filters.city == null}
          onSelect={() => patch({ city: null })}
        />
        {cityCounts.length === 0 ? (
          <EmptyFacet />
        ) : (
          cityCounts.map((c) => (
            <RadioRow
              key={c.value}
              label={
                <span className="flex items-center gap-2">
                  <MapPin size={10} strokeWidth={1.6} className="text-ink-faint" />
                  <span className="truncate">{c.value}</span>
                </span>
              }
              count={c.count}
              checked={filters.city === c.value}
              onSelect={() => patch({ city: c.value })}
            />
          ))
        )}
      </FilterSection>

      {showSize && sizeCounts.length > 0 && (
        <FilterSection title="Size">
          <RadioRow
            label={<span className="italic text-ink-muted">Any</span>}
            count={listings.filter((l) => l.size).length}
            checked={filters.size == null}
            onSelect={() => patch({ size: null })}
          />
          {sizeCounts.map((s) => (
            <RadioRow
              key={s.value}
              label={
                <span className="flex items-center gap-2">
                  <TagIcon size={10} strokeWidth={1.6} className="text-ink-faint" />
                  {s.value}
                </span>
              }
              count={s.count}
              checked={filters.size === s.value}
              onSelect={() => patch({ size: s.value })}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Price">
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              patch({ minPrice: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="w-full rounded-md border border-border bg-white px-2 py-1 font-mono text-[11px] text-ink outline-none focus:border-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <span className="text-ink-faint">–</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              patch({ maxPrice: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="w-full rounded-md border border-border bg-white px-2 py-1 font-mono text-[11px] text-ink outline-none focus:border-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>
      </FilterSection>

      <FilterSection title="Shipping">
        <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[12px] transition-colors hover:bg-ivory-warm">
          <input
            type="checkbox"
            checked={filters.shipsOnly}
            onChange={(e) => patch({ shipsOnly: e.target.checked })}
            className="h-3 w-3 accent-saffron"
          />
          <span className="text-ink-soft">Ships to me</span>
        </label>
      </FilterSection>

      <div className="pt-4">
        <button
          onClick={clearAll}
          disabled={empty}
          className="w-full rounded-md border border-border px-3 py-1.5 text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:border-rose/40 hover:text-rose disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear all filters
        </button>
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border-b border-border/60 py-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-1 text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {title}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={1.8}
          className={cn(
            "text-ink-faint transition-transform",
            !open && "-rotate-90",
          )}
        />
      </button>
      {open && (
        <div className="mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

function RadioRow({
  label,
  count,
  checked,
  onSelect,
}: {
  label: React.ReactNode;
  count: number;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center justify-between gap-2 rounded-md px-1.5 py-1 text-[12px] transition-colors",
        checked ? "bg-gold-pale/30" : "hover:bg-ivory-warm",
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <input
          type="radio"
          checked={checked}
          onChange={onSelect}
          className="h-3 w-3 shrink-0 accent-saffron"
        />
        <span className="truncate text-ink-soft">{label}</span>
      </span>
      <span
        className="font-mono text-[10px] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {count}
      </span>
    </label>
  );
}

function EmptyFacet() {
  return (
    <div className="py-1.5 text-[11px] italic text-ink-faint">No options yet</div>
  );
}
