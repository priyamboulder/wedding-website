"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Link2,
  Link2Off,
  Plane,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Vendor,
  VendorFilters,
  ShortlistStatus,
  AssignmentFilter,
  PriceBand,
  VendorTravelLevel,
  DestinationRegion,
} from "@/types/vendor";
import {
  SHORTLIST_STATUSES,
  SHORTLIST_STATUS_LABEL,
  SHORTLIST_STATUS_DOT,
  DESTINATION_REGIONS,
  TRAVEL_LEVEL_LABEL,
} from "@/types/vendor";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import {
  countByAssignment,
  countByCategory,
  countByLocation,
  countByStatus,
  countByTravelLevel,
  filtersAreEmpty,
  type VendorFilterContext,
} from "@/lib/vendors/filters";

interface Props {
  vendors: Vendor[];
  filters: VendorFilters;
  ctx: VendorFilterContext;
  onChange: (next: VendorFilters) => void;
}

const ASSIGNMENT_OPTIONS: {
  value: AssignmentFilter;
  label: string;
  icon: typeof Link2;
}[] = [
  { value: "linked", label: "Linked to a task", icon: Link2 },
  { value: "unassigned", label: "Unassigned", icon: Link2Off },
];

const PRICE_BANDS: { value: PriceBand; label: string }[] = [
  { value: "budget", label: "Budget (≤ ₹5L)" },
  { value: "mid", label: "Mid (≤ ₹15L)" },
  { value: "premium", label: "Premium (≤ ₹40L)" },
  { value: "luxe", label: "Luxe (₹40L+)" },
];

const RATING_OPTIONS = [4.5, 4.0, 3.5];

const TRAVEL_LEVELS: VendorTravelLevel[] = [
  "local",
  "regional",
  "nationwide",
  "destination",
];

export function VendorFilterRail({ vendors, filters, ctx, onChange }: Props) {
  const categoryCounts = useMemo(() => countByCategory(vendors), [vendors]);
  const locationCounts = useMemo(() => countByLocation(vendors), [vendors]);
  const statusCountsFacet = useMemo(
    () => countByStatus(vendors, ctx),
    [vendors, ctx],
  );
  const assignmentCountsFacet = useMemo(
    () => countByAssignment(vendors, ctx),
    [vendors, ctx],
  );
  const travelCounts = useMemo(() => countByTravelLevel(vendors), [vendors]);

  function toggleInList<K extends keyof VendorFilters>(
    key: K,
    value: string,
  ) {
    const current = filters[key] as unknown as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next } as VendorFilters);
  }

  function setSingle<K extends keyof VendorFilters>(
    key: K,
    value: VendorFilters[K] | null,
  ) {
    onChange({ ...filters, [key]: value } as VendorFilters);
  }

  function clearAll() {
    onChange({
      ...filters,
      category: null,
      collection: null,
      location: null,
      price_band: null,
      rating_min: null,
      assignment: [],
      statuses: [],
      style_tags: [],
      select_only: false,
      travel_levels: [],
      preferred_regions: [],
      willing_to_travel_to: "",
    });
  }

  const selectCount = useMemo(
    () => vendors.filter((v) => v.tier === "select").length,
    [vendors],
  );

  const empty = filtersAreEmpty({ ...filters, query: "" });

  return (
    <aside
      className="sidebar-scroll sticky top-0 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-border bg-ivory/60 px-5 py-6 lg:block"
      aria-label="Vendor filters"
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

      <FilterSection title="Tier" defaultOpen>
        <FacetRow
          label={
            <span className="flex items-center gap-2 text-gold">
              <Sparkles
                size={10}
                strokeWidth={2}
                className="shrink-0 text-gold"
              />
              Ananya Select only
            </span>
          }
          count={selectCount}
          checked={filters.select_only}
          onToggle={() =>
            setSingle("select_only", !filters.select_only as never)
          }
        />
      </FilterSection>

      <FilterSection title="Travel availability" defaultOpen>
        {TRAVEL_LEVELS.map((lvl) => (
          <FacetRow
            key={lvl}
            label={
              <span className="flex items-center gap-2">
                {lvl === "destination" ? (
                  <Plane
                    size={10}
                    strokeWidth={1.8}
                    className="shrink-0 text-teal"
                  />
                ) : lvl === "local" ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint" />
                ) : (
                  <Plane
                    size={10}
                    strokeWidth={1.6}
                    className="shrink-0 text-ink-faint"
                  />
                )}
                <span className={lvl === "destination" ? "text-teal" : undefined}>
                  {TRAVEL_LEVEL_LABEL[lvl]}
                </span>
              </span>
            }
            count={travelCounts[lvl]}
            checked={filters.travel_levels.includes(lvl)}
            onToggle={() =>
              onChange({
                ...filters,
                travel_levels: filters.travel_levels.includes(lvl)
                  ? filters.travel_levels.filter((l) => l !== lvl)
                  : [...filters.travel_levels, lvl],
              })
            }
          />
        ))}
      </FilterSection>

      <FilterSection title="Destination experience">
        {DESTINATION_REGIONS.map((region) => (
          <FacetRow
            key={region}
            label={region}
            count={0}
            hideCount
            checked={filters.preferred_regions.includes(region)}
            onToggle={() => toggleRegion(filters, onChange, region)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Willing to travel to">
        <div className="flex flex-col gap-1.5 pt-1">
          <input
            type="text"
            value={filters.willing_to_travel_to}
            onChange={(e) =>
              onChange({ ...filters, willing_to_travel_to: e.target.value })
            }
            placeholder="Cancun, Tuscany, Dubai…"
            className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-teal"
          />
          <p className="text-[10.5px] italic text-ink-faint">
            Matches vendors with proven destination work or self-reported
            travel willingness.
          </p>
        </div>
      </FilterSection>

      <FilterSection title="Assignment" defaultOpen>
        {ASSIGNMENT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <FacetRow
              key={opt.value}
              label={
                <span className="flex items-center gap-2">
                  <Icon size={10} strokeWidth={1.8} className="text-ink-faint" />
                  {opt.label}
                </span>
              }
              count={assignmentCountsFacet[opt.value]}
              checked={filters.assignment.includes(opt.value)}
              onToggle={() => toggleInList("assignment", opt.value)}
            />
          );
        })}
      </FilterSection>

      <FilterSection title="Category" defaultOpen>
        {categoryCounts.length === 0 ? (
          <EmptyFacet />
        ) : (
          categoryCounts.map((c) => (
            <FacetRow
              key={c.value}
              label={
                CATEGORY_LABELS[c.value as keyof typeof CATEGORY_LABELS] ??
                c.value
              }
              count={c.count}
              checked={filters.category === c.value}
              onToggle={() =>
                setSingle(
                  "category",
                  filters.category === c.value ? null : (c.value as never),
                )
              }
            />
          ))
        )}
      </FilterSection>

      <FilterSection title="Status" defaultOpen>
        {SHORTLIST_STATUSES.map((s) => {
          const facet = statusCountsFacet.find((f) => f.value === s);
          return (
            <FacetRow
              key={s}
              label={
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      SHORTLIST_STATUS_DOT[s],
                    )}
                  />
                  {SHORTLIST_STATUS_LABEL[s]}
                </span>
              }
              count={facet?.count ?? 0}
              checked={filters.statuses.includes(s)}
              onToggle={() => toggleStatus(filters, onChange, s)}
            />
          );
        })}
      </FilterSection>

      <FilterSection title="Location">
        {locationCounts.length === 0 ? (
          <EmptyFacet />
        ) : (
          locationCounts.map((l) => (
            <FacetRow
              key={l.value}
              label={l.value}
              count={l.count}
              checked={filters.location === l.value}
              onToggle={() =>
                setSingle(
                  "location",
                  filters.location === l.value ? null : l.value,
                )
              }
            />
          ))
        )}
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="flex flex-col gap-1 pt-1">
          {PRICE_BANDS.map((b) => (
            <FacetRow
              key={b.value}
              label={b.label}
              count={0}
              hideCount
              checked={filters.price_band === b.value}
              onToggle={() =>
                setSingle(
                  "price_band",
                  filters.price_band === b.value ? null : b.value,
                )
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        <div className="flex flex-col gap-1 pt-1">
          {RATING_OPTIONS.map((r) => (
            <FacetRow
              key={r}
              label={
                <span className="flex items-center gap-1.5">
                  <Star
                    size={10}
                    strokeWidth={1.6}
                    className="text-saffron"
                    fill="currentColor"
                  />
                  {r.toFixed(1)}+
                </span>
              }
              count={0}
              hideCount
              checked={filters.rating_min === r}
              onToggle={() =>
                setSingle("rating_min", filters.rating_min === r ? null : r)
              }
            />
          ))}
        </div>
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

function toggleStatus(
  filters: VendorFilters,
  onChange: (f: VendorFilters) => void,
  status: ShortlistStatus,
) {
  const has = filters.statuses.includes(status);
  onChange({
    ...filters,
    statuses: has
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status],
  });
}

function toggleRegion(
  filters: VendorFilters,
  onChange: (f: VendorFilters) => void,
  region: DestinationRegion,
) {
  const has = filters.preferred_regions.includes(region);
  onChange({
    ...filters,
    preferred_regions: has
      ? filters.preferred_regions.filter((r) => r !== region)
      : [...filters.preferred_regions, region],
  });
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

function FacetRow({
  label,
  count,
  checked,
  onToggle,
  hideCount,
}: {
  label: React.ReactNode;
  count: number;
  checked: boolean;
  onToggle: () => void;
  hideCount?: boolean;
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
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="h-3 w-3 shrink-0 accent-saffron"
        />
        <span className="truncate text-ink-soft">{label}</span>
      </span>
      {!hideCount && (
        <span
          className="font-mono text-[10px] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {count}
        </span>
      )}
    </label>
  );
}

function EmptyFacet() {
  return (
    <div className="py-1.5 text-[11px] italic text-ink-faint">
      No options yet
    </div>
  );
}
