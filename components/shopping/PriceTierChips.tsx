"use client";

import { cn } from "@/lib/utils";

// Shared quick-filter chips for wedding price tiers. Toggle any subset —
// matches resolve via `priceInSelectedTiers`. Use across Our Store, Creator
// Picks, and Marketplace so couples can narrow spend at a glance.

export type PriceTierKey = "under_500" | "500_5k" | "5k_25k" | "25k_plus";

interface Tier {
  key: PriceTierKey;
  label: string;
  min: number;
  max: number | null;
}

export const PRICE_TIERS: Tier[] = [
  { key: "under_500", label: "Under $500", min: 0, max: 500 },
  { key: "500_5k", label: "$500 – $5K", min: 500, max: 5000 },
  { key: "5k_25k", label: "$5K – $25K", min: 5000, max: 25000 },
  { key: "25k_plus", label: "$25K+", min: 25000, max: null },
];

export function priceInSelectedTiers(
  priceUsd: number | null | undefined,
  selected: Set<PriceTierKey>,
): boolean {
  if (selected.size === 0) return true;
  if (priceUsd == null) return false;
  for (const tier of PRICE_TIERS) {
    if (!selected.has(tier.key)) continue;
    const aboveMin = priceUsd >= tier.min;
    const belowMax = tier.max == null || priceUsd < tier.max;
    if (aboveMin && belowMax) return true;
  }
  return false;
}

export function PriceTierChips({
  selected,
  onToggle,
  className,
}: {
  selected: Set<PriceTierKey>;
  onToggle: (key: PriceTierKey) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span
        className="mr-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Price
      </span>
      {PRICE_TIERS.map((tier) => {
        const active = selected.has(tier.key);
        return (
          <button
            key={tier.key}
            type="button"
            onClick={() => onToggle(tier.key)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[10.5px] tracking-wide transition-colors",
              active
                ? "border-saffron bg-saffron/15 text-ink"
                : "border-border bg-white text-ink-muted hover:border-gold/35 hover:text-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {tier.label}
          </button>
        );
      })}
    </div>
  );
}
