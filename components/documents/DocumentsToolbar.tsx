"use client";

// ── Documents toolbar ──────────────────────────────────────────────────────
// Sticky row above the document table. Owns search, filter chips, view
// toggle, and sort.

import { ChevronDown, Grid2X2, List, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DocumentType,
  DocumentVendorCategory,
} from "@/types/documents";
import {
  DOCUMENT_TYPE_LABEL,
  VENDOR_CATEGORY_LABEL,
} from "@/types/documents";
import type { DocumentSortKey } from "@/lib/documents/helpers";
import { useRef, useState } from "react";

export type GroupByKey = "none" | "vendor" | "category" | "type" | "status" | "month";

const GROUP_BY_OPTIONS: { key: GroupByKey; label: string }[] = [
  { key: "none", label: "None" },
  { key: "vendor", label: "Vendor" },
  { key: "category", label: "Category" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "month", label: "Month uploaded" },
];

export interface ToolbarFilters {
  types: DocumentType[];
  vendors: DocumentVendorCategory[];
  status: string | null; // "signed" | "unsigned" | "paid" | "unpaid" | "expired" | null
  needsReview: boolean;
  amountMin: number | null;
  amountMax: number | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export const EMPTY_FILTERS: ToolbarFilters = {
  types: [],
  vendors: [],
  status: null,
  needsReview: false,
  amountMin: null,
  amountMax: null,
  dateFrom: null,
  dateTo: null,
};

export type ViewMode = "table" | "grid";

const SORT_OPTIONS: { key: DocumentSortKey; label: string }[] = [
  { key: "recent", label: "Recently uploaded" },
  { key: "date_newest", label: "Date (newest)" },
  { key: "date_oldest", label: "Date (oldest)" },
  { key: "amount_high", label: "Amount (high–low)" },
  { key: "name_asc", label: "Name (A–Z)" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "signed", label: "Signed" },
  { value: "unsigned", label: "Unsigned" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "expired", label: "Expired" },
];

export function DocumentsToolbar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  view,
  onViewChange,
  sort,
  onSortChange,
  groupBy,
  onGroupByChange,
  totalCount,
  filteredCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filters: ToolbarFilters;
  onFiltersChange: (next: ToolbarFilters) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  sort: DocumentSortKey;
  onSortChange: (key: DocumentSortKey) => void;
  groupBy: GroupByKey;
  onGroupByChange: (key: GroupByKey) => void;
  totalCount: number;
  filteredCount: number;
}) {
  const activeChips = [
    ...filters.types.map((t) => ({ label: DOCUMENT_TYPE_LABEL[t], onRemove: () => onFiltersChange({ ...filters, types: filters.types.filter((x) => x !== t) }) })),
    ...filters.vendors.map((v) => ({ label: VENDOR_CATEGORY_LABEL[v], onRemove: () => onFiltersChange({ ...filters, vendors: filters.vendors.filter((x) => x !== v) }) })),
    ...(filters.status ? [{ label: `Status: ${filters.status}`, onRemove: () => onFiltersChange({ ...filters, status: null }) }] : []),
    ...(filters.needsReview ? [{ label: "Needs review", onRemove: () => onFiltersChange({ ...filters, needsReview: false }) }] : []),
    ...(filters.amountMin != null || filters.amountMax != null
      ? [{
          label: `Amount ${filters.amountMin ?? 0}–${filters.amountMax ?? "∞"}`,
          onRemove: () => onFiltersChange({ ...filters, amountMin: null, amountMax: null }),
        }]
      : []),
    ...(filters.dateFrom || filters.dateTo
      ? [{
          label: `Date ${filters.dateFrom ?? "…"}→${filters.dateTo ?? "…"}`,
          onRemove: () => onFiltersChange({ ...filters, dateFrom: null, dateTo: null }),
        }]
      : []),
  ];

  return (
    <div className="sticky top-0 z-20 flex flex-col gap-2 border-b border-border bg-white px-10 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5 focus-within:border-gold/40">
          <Search size={14} className="text-ink-faint" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search filename, vendor, summary, tags"
            className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-faint outline-none"
          />
        </div>

        {/* Filter menus */}
        <FilterMenu
          label="Type"
          active={filters.types.length > 0}
          options={(Object.keys(DOCUMENT_TYPE_LABEL) as DocumentType[]).map((t) => ({
            value: t,
            label: DOCUMENT_TYPE_LABEL[t],
            selected: filters.types.includes(t),
          }))}
          onToggle={(v) => {
            const set = new Set(filters.types);
            if (set.has(v as DocumentType)) set.delete(v as DocumentType);
            else set.add(v as DocumentType);
            onFiltersChange({ ...filters, types: Array.from(set) });
          }}
        />
        <FilterMenu
          label="Vendor"
          active={filters.vendors.length > 0}
          options={(Object.keys(VENDOR_CATEGORY_LABEL) as DocumentVendorCategory[]).map((v) => ({
            value: v,
            label: VENDOR_CATEGORY_LABEL[v],
            selected: filters.vendors.includes(v),
          }))}
          onToggle={(v) => {
            const set = new Set(filters.vendors);
            if (set.has(v as DocumentVendorCategory)) set.delete(v as DocumentVendorCategory);
            else set.add(v as DocumentVendorCategory);
            onFiltersChange({ ...filters, vendors: Array.from(set) });
          }}
        />
        <FilterMenu
          label="Status"
          active={filters.status != null}
          options={STATUS_OPTIONS.map((o) => ({ ...o, selected: filters.status === o.value }))}
          onToggle={(v) =>
            onFiltersChange({ ...filters, status: filters.status === v ? null : v })
          }
          single
        />
        <button
          type="button"
          onClick={() => onFiltersChange({ ...filters, needsReview: !filters.needsReview })}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] transition-colors",
            filters.needsReview
              ? "border-saffron bg-saffron/10 text-saffron"
              : "border-border text-ink-muted hover:border-saffron/40 hover:text-saffron",
          )}
        >
          Needs review
        </button>

        <GroupByMenu value={groupBy} onChange={onGroupByChange} />

        <div className="ml-auto flex items-center gap-2">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {filteredCount} / {totalCount}
          </span>

          <SortMenu value={sort} onChange={onSortChange} />

          <div className="flex overflow-hidden rounded-md border border-border">
            <button
              type="button"
              onClick={() => onViewChange("table")}
              aria-label="Table view"
              className={cn(
                "flex h-7 w-8 items-center justify-center transition-colors",
                view === "table" ? "bg-ink text-ivory" : "bg-white text-ink-muted hover:text-ink",
              )}
            >
              <List size={14} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              aria-label="Grid view"
              className={cn(
                "flex h-7 w-8 items-center justify-center border-l border-border transition-colors",
                view === "grid" ? "bg-ink text-ivory" : "bg-white text-ink-muted hover:text-ink",
              )}
            >
              <Grid2X2 size={14} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold-pale/40 py-0.5 pl-2.5 pr-1 text-[11px] text-ink"
            >
              {c.label}
              <button
                type="button"
                onClick={c.onRemove}
                className="flex h-4 w-4 items-center justify-center rounded-full text-ink-muted hover:bg-ink/10 hover:text-ink"
                aria-label={`Clear ${c.label}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onFiltersChange(EMPTY_FILTERS)}
            className="text-[11px] text-ink-faint hover:text-ink"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function FilterMenu({
  label,
  active,
  options,
  onToggle,
  single,
}: {
  label: string;
  active: boolean;
  options: { value: string; label: string; selected: boolean }[];
  onToggle: (value: string) => void;
  single?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[12px] transition-colors",
          active
            ? "border-gold/40 bg-gold-pale/30 text-ink"
            : "border-border text-ink-muted hover:border-saffron/40 hover:text-saffron",
        )}
      >
        {label}
        <ChevronDown size={12} strokeWidth={1.8} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-30 mt-1 max-h-[320px] w-[220px] overflow-y-auto rounded-md border border-border bg-white py-1 shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onToggle(o.value);
                if (single) setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12.5px] transition-colors",
                o.selected
                  ? "bg-gold-pale/40 text-ink"
                  : "text-ink-muted hover:bg-ivory-warm",
              )}
            >
              <span
                className={cn(
                  "flex h-3.5 w-3.5 items-center justify-center rounded-sm border",
                  o.selected ? "border-gold bg-gold text-white" : "border-border",
                )}
              >
                {o.selected && "✓"}
              </span>
              <span className="flex-1 truncate">{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GroupByMenu({
  value,
  onChange,
}: {
  value: GroupByKey;
  onChange: (k: GroupByKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = GROUP_BY_OPTIONS.find((o) => o.key === value) ?? GROUP_BY_OPTIONS[0];
  const active = value !== "none";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[12px] transition-colors",
          active
            ? "border-gold/40 bg-gold-pale/30 text-ink"
            : "border-border text-ink-muted hover:border-saffron/40 hover:text-saffron",
        )}
      >
        Group by: {current.label}
        <ChevronDown size={12} strokeWidth={1.8} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-30 mt-1 w-[200px] rounded-md border border-border bg-white py-1 shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {GROUP_BY_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => {
                onChange(o.key);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center px-3 py-1.5 text-left text-[12.5px] transition-colors",
                o.key === value
                  ? "bg-gold-pale/40 text-ink"
                  : "text-ink-muted hover:bg-ivory-warm",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortMenu({
  value,
  onChange,
}: {
  value: DocumentSortKey;
  onChange: (k: DocumentSortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find((s) => s.key === value) ?? SORT_OPTIONS[0];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-[12px] text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
      >
        Sort: {current.label}
        <ChevronDown size={12} strokeWidth={1.8} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-30 mt-1 w-[200px] rounded-md border border-border bg-white py-1 shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => {
                onChange(o.key);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center px-3 py-1.5 text-left text-[12.5px] transition-colors",
                o.key === value
                  ? "bg-gold-pale/40 text-ink"
                  : "text-ink-muted hover:bg-ivory-warm",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
