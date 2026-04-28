"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Link2, Link2Off, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoppingLink, ShoppingStatus } from "@/lib/link-preview/types";
import {
  countByAssignment,
  countByAvailability,
  countByDomain,
  countByModule,
  countByStatus,
  countByVendor,
  filtersAreEmpty,
  UNASSIGNED_KEY,
  type AssignmentFilter,
  type AvailabilityFilter,
  type ShoppingFilterState,
  type ShoppingMode,
} from "@/lib/shopping/filters";
import { getStoreVendor } from "@/lib/store-seed";

interface Props {
  allLinks: ShoppingLink[];
  filters: ShoppingFilterState;
  onChange: (next: ShoppingFilterState) => void;
  moduleTitles: Map<string, string>;
  mode: ShoppingMode;
}

const STATUS_OPTIONS: { value: ShoppingStatus; label: string; dot: string }[] =
  [
    { value: "considering", label: "Considering", dot: "bg-ink/80" },
    { value: "ordered", label: "Ordered", dot: "bg-saffron" },
    { value: "received", label: "Received", dot: "bg-sage" },
    { value: "returned", label: "Returned", dot: "bg-rose" },
  ];

const AVAILABILITY_OPTIONS: {
  value: AvailabilityFilter;
  label: string;
  dot: string;
}[] = [
  { value: "in_stock", label: "In Stock", dot: "bg-sage" },
  { value: "low_stock", label: "Low Stock", dot: "bg-saffron" },
  { value: "made_to_order", label: "Made to Order", dot: "bg-ink/80" },
  { value: "sold_out", label: "Sold Out", dot: "bg-rose" },
];

const LEAD_TIME_OPTIONS = [
  { value: 14, label: "≤ 2 weeks" },
  { value: 30, label: "≤ 1 month" },
  { value: 60, label: "≤ 2 months" },
  { value: 90, label: "≤ 3 months" },
];

export function ShoppingBoardFilters({
  allLinks,
  filters,
  onChange,
  moduleTitles,
  mode,
}: Props) {
  const moduleCounts = useMemo(() => countByModule(allLinks), [allLinks]);
  const statusCountsFacet = useMemo(() => countByStatus(allLinks), [allLinks]);
  const domainCounts = useMemo(() => countByDomain(allLinks), [allLinks]);
  const vendorCounts = useMemo(() => countByVendor(allLinks), [allLinks]);
  const availabilityCounts = useMemo(
    () => countByAvailability(allLinks),
    [allLinks],
  );
  const assignmentCountsFacet = useMemo(
    () => countByAssignment(allLinks),
    [allLinks],
  );

  function toggle<K extends keyof ShoppingFilterState>(
    key: K,
    value: string,
  ) {
    const current = filters[key] as unknown as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next } as ShoppingFilterState);
  }

  function setPrice(kind: "min" | "max", raw: string) {
    const v = raw === "" ? null : Number(raw);
    if (kind === "min") onChange({ ...filters, minPrice: v });
    else onChange({ ...filters, maxPrice: v });
  }

  function setLeadTime(raw: string) {
    const v = raw === "" ? null : Number(raw);
    onChange({ ...filters, maxLeadTimeDays: v });
  }

  function clearAll() {
    onChange({
      modules: [],
      statuses: [],
      domains: [],
      vendors: [],
      assignment: [],
      availability: [],
      minPrice: null,
      maxPrice: null,
      maxLeadTimeDays: null,
      query: filters.query,
    });
  }

  const ASSIGNMENT_OPTIONS: {
    value: AssignmentFilter;
    label: string;
    icon: typeof Link2;
  }[] = [
    { value: "linked", label: "Linked to a task", icon: Link2 },
    { value: "unassigned", label: "Unassigned", icon: Link2Off },
  ];

  const empty = filtersAreEmpty({ ...filters, query: "" });

  const showExternalSources = mode !== "ananya_store";
  const showVendors = mode !== "external";
  const showAvailability = mode !== "external";
  const showLeadTime = mode !== "external";

  return (
    <aside
      className="sidebar-scroll sticky top-0 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-border bg-ivory/60 px-5 py-6 lg:block"
      aria-label="Shopping filters"
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
              onToggle={() => toggle("assignment", opt.value)}
            />
          );
        })}
      </FilterSection>

      <FilterSection title="Module" defaultOpen>
        {moduleCounts.length === 0 ? (
          <EmptyFacet />
        ) : (
          [...moduleCounts]
            .sort((a, b) => {
              if (a.value === UNASSIGNED_KEY) return 1;
              if (b.value === UNASSIGNED_KEY) return -1;
              const al = moduleTitles.get(a.value) ?? a.value;
              const bl = moduleTitles.get(b.value) ?? b.value;
              return al.localeCompare(bl);
            })
            .map((m) => {
              const isUnassigned = m.value === UNASSIGNED_KEY;
              return (
                <FacetRow
                  key={m.value}
                  label={
                    isUnassigned ? (
                      <span className="italic text-ink-muted">Unassigned</span>
                    ) : (
                      moduleTitles.get(m.value) ?? m.value
                    )
                  }
                  count={m.count}
                  checked={filters.modules.includes(m.value)}
                  onToggle={() => toggle("modules", m.value)}
                />
              );
            })
        )}
      </FilterSection>

      <FilterSection title="Status" defaultOpen>
        {STATUS_OPTIONS.map((s) => {
          const facet = statusCountsFacet.find((f) => f.value === s.value);
          return (
            <FacetRow
              key={s.value}
              label={
                <span className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                  {s.label}
                </span>
              }
              count={facet?.count ?? 0}
              checked={filters.statuses.includes(s.value)}
              onToggle={() => toggle("statuses", s.value)}
            />
          );
        })}
      </FilterSection>

      {showAvailability && (
        <FilterSection
          title="Availability"
          defaultOpen={mode === "ananya_store"}
        >
          {AVAILABILITY_OPTIONS.map((o) => (
            <FacetRow
              key={o.value}
              label={
                <span className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", o.dot)} />
                  {o.label}
                </span>
              }
              count={availabilityCounts[o.value]}
              checked={filters.availability.includes(o.value)}
              onToggle={() => toggle("availability", o.value)}
            />
          ))}
        </FilterSection>
      )}

      {showVendors && (
        <FilterSection title="Vendor" defaultOpen={mode === "ananya_store"}>
          {vendorCounts.length === 0 ? (
            <EmptyFacet />
          ) : (
            vendorCounts.map((v) => {
              const vendor = getStoreVendor(v.value);
              return (
                <FacetRow
                  key={v.value}
                  label={
                    <span className="flex items-center gap-2">
                      <Sparkles
                        size={10}
                        strokeWidth={1.6}
                        className="text-saffron"
                      />
                      <span className="truncate">
                        {vendor?.name ?? v.value}
                      </span>
                    </span>
                  }
                  count={v.count}
                  checked={filters.vendors.includes(v.value)}
                  onToggle={() => toggle("vendors", v.value)}
                />
              );
            })
          )}
        </FilterSection>
      )}

      {showExternalSources && (
        <FilterSection title={mode === "all" ? "External Source" : "Source"}>
          {domainCounts.length === 0 ? (
            <EmptyFacet />
          ) : (
            domainCounts
              .filter((d) => d.value !== "ananya.store")
              .map((d) => (
                <FacetRow
                  key={d.value}
                  label={
                    <span
                      className="truncate font-mono text-[11px] text-ink-soft"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {d.value}
                    </span>
                  }
                  count={d.count}
                  checked={filters.domains.includes(d.value)}
                  onToggle={() => toggle("domains", d.value)}
                />
              ))
          )}
        </FilterSection>
      )}

      <FilterSection title="Price">
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => setPrice("min", e.target.value)}
            className="w-full rounded-md border border-border bg-white px-2 py-1 font-mono text-[11px] text-ink outline-none focus:border-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <span className="text-ink-faint">–</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => setPrice("max", e.target.value)}
            className="w-full rounded-md border border-border bg-white px-2 py-1 font-mono text-[11px] text-ink outline-none focus:border-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>
      </FilterSection>

      {showLeadTime && (
        <FilterSection title="Lead Time">
          <div className="flex flex-col gap-1 pt-1">
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[12px] transition-colors hover:bg-ivory-warm">
              <input
                type="radio"
                name="leadTime"
                checked={filters.maxLeadTimeDays == null}
                onChange={() => setLeadTime("")}
                className="h-3 w-3 accent-saffron"
              />
              <span className="text-ink-soft">Any</span>
            </label>
            {LEAD_TIME_OPTIONS.map((o) => (
              <label
                key={o.value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[12px] transition-colors hover:bg-ivory-warm"
              >
                <input
                  type="radio"
                  name="leadTime"
                  checked={filters.maxLeadTimeDays === o.value}
                  onChange={() => setLeadTime(String(o.value))}
                  className="h-3 w-3 accent-saffron"
                />
                <span className="text-ink-soft">{o.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

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
      {open && <div className="mt-2 flex max-h-56 flex-col gap-1 overflow-y-auto">{children}</div>}
    </div>
  );
}

function FacetRow({
  label,
  count,
  checked,
  onToggle,
}: {
  label: React.ReactNode;
  count: number;
  checked: boolean;
  onToggle: () => void;
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
