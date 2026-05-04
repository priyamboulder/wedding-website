"use client";

// ── Category drill-in filter rail ──────────────────────────────────────────
// Left rail on /vendors/[category]. Reads a CategoryFilterConfig to decide
// which sections to render — photography filters ≠ caterer filters. Filter
// state is owned by the parent so it can serialize into URL params.

import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CategoryDrillFilters,
  CategoryFilterConfig,
  CategoryBudgetTier,
  CategoryTravelBucket,
} from "@/lib/vendors/filters";

interface Props {
  config: CategoryFilterConfig;
  filters: CategoryDrillFilters;
  onChange: (next: CategoryDrillFilters) => void;
  weddingDateLabel: string;
  hasActiveFilters: boolean;
  onReset: () => void;
}

const BUDGET_TIERS: Array<{ value: CategoryBudgetTier; label: string }> = [
  { value: "within", label: "Within budget" },
  { value: "stretch", label: "Stretch" },
  { value: "splurge", label: "Splurge" },
];

const TRAVEL_BUCKETS: Array<{ value: CategoryTravelBucket; label: string }> = [
  { value: "local", label: "Local to Udaipur" },
  { value: "india", label: "Travels in India" },
  { value: "international", label: "International" },
];

export function CategoryFilters({
  config,
  filters,
  onChange,
  weddingDateLabel,
  hasActiveFilters,
  onReset,
}: Props) {
  return (
    <aside className="sticky top-6 hidden w-[220px] shrink-0 self-start lg:block">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Filters
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] text-ink-muted hover:text-ink"
          >
            <X size={11} strokeWidth={1.8} />
            Clear all
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-5">
        {config.styles.length > 0 && (
          <Section title="Style">
            <div className="flex flex-wrap gap-1.5">
              {config.styles.map((s) => {
                const active = filters.styles.includes(s);
                return (
                  <Chip
                    key={s}
                    active={active}
                    onClick={() =>
                      onChange({
                        ...filters,
                        styles: active
                          ? filters.styles.filter((x) => x !== s)
                          : [...filters.styles, s],
                      })
                    }
                  >
                    {s}
                  </Chip>
                );
              })}
            </div>
          </Section>
        )}

        {config.show_budget_tier && (
          <Section title="Budget tier">
            <div className="flex flex-col gap-1.5">
              {BUDGET_TIERS.map((b) => (
                <Radio
                  key={b.value}
                  label={b.label}
                  active={filters.budget_tier === b.value}
                  onClick={() =>
                    onChange({
                      ...filters,
                      budget_tier:
                        filters.budget_tier === b.value ? null : b.value,
                    })
                  }
                />
              ))}
            </div>
          </Section>
        )}

        {config.show_travel && (
          <Section title="Travel">
            <div className="flex flex-col gap-1.5">
              {TRAVEL_BUCKETS.map((t) => (
                <Radio
                  key={t.value}
                  label={t.label}
                  active={filters.travel === t.value}
                  onClick={() =>
                    onChange({
                      ...filters,
                      travel: filters.travel === t.value ? null : t.value,
                    })
                  }
                />
              ))}
            </div>
          </Section>
        )}

        {config.past_venues.length > 0 && (
          <Section title="Past venues">
            <div className="flex flex-col gap-1.5">
              {config.past_venues.map((pv) => (
                <Toggle
                  key={pv.label}
                  label={pv.label}
                  active={filters.past_venues.includes(pv.label)}
                  onClick={() =>
                    onChange({
                      ...filters,
                      past_venues: filters.past_venues.includes(pv.label)
                        ? filters.past_venues.filter((x) => x !== pv.label)
                        : [...filters.past_venues, pv.label],
                    })
                  }
                />
              ))}
            </div>
          </Section>
        )}

        {config.show_availability && (
          <Section title="Availability">
            <Toggle
              label={`Available ${weddingDateLabel}`}
              active={filters.available_on_date}
              onClick={() =>
                onChange({
                  ...filters,
                  available_on_date: !filters.available_on_date,
                })
              }
            />
          </Section>
        )}

        {config.show_select_only && (
          <Section title="Tier">
            <Toggle
              label="Ananya Select only"
              active={filters.select_only}
              onClick={() =>
                onChange({ ...filters, select_only: !filters.select_only })
              }
            />
          </Section>
        )}
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {title}
        <ChevronDown size={11} strokeWidth={1.8} className="text-ink-faint/40" />
      </div>
      {children}
    </div>
  );
}

function Chip({
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
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-[11.5px] transition-colors",
        active
          ? "bg-ink text-ivory"
          : "border border-border bg-white text-ink-muted hover:border-ink/15 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Radio({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1 text-left text-[12px] transition-colors",
        active
          ? "bg-gold-pale/40 text-ink"
          : "text-ink-muted hover:bg-ivory-warm hover:text-ink",
      )}
    >
      <span
        className={cn(
          "h-3 w-3 shrink-0 rounded-full border",
          active
            ? "border-gold bg-gold shadow-[inset_0_0_0_2px_white]"
            : "border-ink-faint/40",
        )}
      />
      {label}
    </button>
  );
}

function Toggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-[12px] transition-colors",
        active
          ? "bg-gold-pale/40 text-ink"
          : "text-ink-muted hover:bg-ivory-warm hover:text-ink",
      )}
    >
      <span className="truncate">{label}</span>
      <span
        className={cn(
          "relative h-3.5 w-6 shrink-0 rounded-full transition-colors",
          active ? "bg-gold" : "bg-ink-faint/30",
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] h-2.5 w-2.5 rounded-full bg-white shadow-sm transition-all",
            active ? "left-[12px]" : "left-[2px]",
          )}
        />
      </span>
    </button>
  );
}
