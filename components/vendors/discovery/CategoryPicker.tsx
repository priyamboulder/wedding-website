"use client";

import { useMemo, useRef, useState } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VendorCategory } from "@/types/vendor-unified";
import type { SubcategoryDef } from "@/types/vendor-discovery";
import {
  SUBCATEGORIES,
  TOP_CATEGORY_ICON,
  TOP_CATEGORY_LABEL,
  getSubcategoriesForParent,
  searchSubcategories,
} from "@/lib/vendors/taxonomy";

interface CategoryPickerProps {
  selectedSubcategoryIds: string[];
  onToggleSubcategory: (id: string) => void;
  topCategory: VendorCategory | null;
  onSetTopCategory: (c: VendorCategory | null) => void;
  // Result counts by subcategory id, shown in the sidebar.
  countsBySubId?: Map<string, number>;
}

const TOP_CATEGORIES: VendorCategory[] = [
  "photography",
  "entertainment",
  "hmua",
  "decor_florals",
  "catering",
  "wardrobe",
  "stationery",
  "pandit_ceremony",
];

export function CategoryPicker({
  selectedSubcategoryIds,
  onToggleSubcategory,
  topCategory,
  onSetTopCategory,
  countsBySubId,
}: CategoryPickerProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<VendorCategory | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => {
    if (query.trim().length === 0) return [];
    return searchSubcategories(query).slice(0, 10);
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search — dhol, henna, drone, turban, chai cart…"
          className={cn(
            "w-full rounded-[10px] border border-border bg-white py-2 pl-8 pr-8 text-[13px] text-ink outline-none",
            "placeholder:text-ink-faint focus:border-gold/50 focus:ring-2 focus:ring-gold/20",
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              searchRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-faint hover:bg-ivory-warm hover:text-ink"
            aria-label="Clear search"
          >
            <X size={12} strokeWidth={1.8} />
          </button>
        )}

        {/* Autocomplete dropdown */}
        {hits.length > 0 && (
          <div
            className={cn(
              "absolute left-0 right-0 top-full z-20 mt-1 max-h-[320px] overflow-y-auto rounded-[10px] border border-border bg-white shadow-[0_12px_28px_-8px_rgba(26,26,26,0.15)]",
            )}
          >
            {hits.map((hit) => (
              <button
                key={hit.subcategory.id}
                type="button"
                onClick={() => {
                  onToggleSubcategory(hit.subcategory.id);
                  setQuery("");
                  searchRef.current?.focus();
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink transition-colors",
                  "hover:bg-gold-pale/30",
                  selectedSubcategoryIds.includes(hit.subcategory.id) && "bg-gold-pale/50",
                )}
              >
                <span className="text-[15px]">
                  {hit.subcategory.emoji ?? TOP_CATEGORY_ICON[hit.subcategory.parent]}
                </span>
                <span className="flex-1">{hit.subcategory.label}</span>
                <span
                  className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {TOP_CATEGORY_LABEL[hit.subcategory.parent]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Top-level sidebar */}
      <nav className="flex flex-col gap-1">
        <SidebarRow
          active={topCategory === null}
          onClick={() => onSetTopCategory(null)}
          label="All categories"
          icon="✨"
        />
        {TOP_CATEGORIES.map((cat) => {
          const subs = getSubcategoriesForParent(cat);
          const isActive = topCategory === cat;
          const isExpanded = expanded === cat || isActive;
          return (
            <div key={cat}>
              <SidebarRow
                active={isActive}
                onClick={() => {
                  onSetTopCategory(isActive ? null : cat);
                  setExpanded(isActive ? null : cat);
                }}
                label={TOP_CATEGORY_LABEL[cat]}
                icon={TOP_CATEGORY_ICON[cat]}
                count={subs.reduce(
                  (sum, s) => sum + (countsBySubId?.get(s.id) ?? 0),
                  0,
                )}
                expandable
                expanded={isExpanded}
              />
              {isExpanded && (
                <ul className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-border pl-3 pb-1">
                  {subs.map((sub) => (
                    <li key={sub.id}>
                      <SubRow
                        def={sub}
                        selected={selectedSubcategoryIds.includes(sub.id)}
                        onClick={() => onToggleSubcategory(sub.id)}
                        count={countsBySubId?.get(sub.id) ?? 0}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Selected chips */}
      {selectedSubcategoryIds.length > 0 && (
        <div className="flex flex-col gap-2 rounded-[10px] border border-gold/30 bg-gold-pale/30 p-3">
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Selected
            </span>
            <button
              type="button"
              onClick={() => selectedSubcategoryIds.forEach(onToggleSubcategory)}
              className="text-[11px] text-ink-muted transition-colors hover:text-ink"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedSubcategoryIds.map((id) => {
              const sub = SUBCATEGORIES.find((s) => s.id === id);
              if (!sub) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onToggleSubcategory(id)}
                  className="group flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-ink shadow-sm ring-1 ring-gold/20 transition-all hover:ring-gold/40"
                >
                  <span>{sub.emoji ?? TOP_CATEGORY_ICON[sub.parent]}</span>
                  <span>{sub.label}</span>
                  <X
                    size={10}
                    strokeWidth={2}
                    className="text-ink-faint transition-colors group-hover:text-rose"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarRow({
  active,
  onClick,
  label,
  icon,
  count,
  expandable,
  expanded,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: string;
  count?: number;
  expandable?: boolean;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-left text-[13px] transition-all",
        active
          ? "bg-ink text-ivory"
          : "text-ink hover:bg-ivory-warm",
      )}
    >
      {expandable && (
        <ChevronRight
          size={12}
          strokeWidth={1.9}
          className={cn(
            "shrink-0 transition-transform duration-150",
            expanded && "rotate-90",
          )}
        />
      )}
      {icon && <span className="text-[14px]">{icon}</span>}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "font-mono text-[10px]",
            active ? "text-ivory/70" : "text-ink-faint",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function SubRow({
  def,
  selected,
  onClick,
  count,
}: {
  def: SubcategoryDef;
  selected: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-[6px] px-2 py-1 text-left text-[12px] transition-colors",
        selected
          ? "bg-gold-pale text-gold"
          : "text-ink-soft hover:bg-ivory-warm hover:text-ink",
      )}
    >
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
          selected ? "bg-gold" : "bg-ink-faint/30",
        )}
      />
      <span className="flex-1 truncate">{def.label}</span>
      {count > 0 && (
        <span
          className="font-mono text-[9.5px] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
