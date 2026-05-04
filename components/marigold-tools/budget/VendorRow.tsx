"use client";

import { useState } from "react";

import { tierCostFor } from "@/lib/budget";
import type { BudgetTier, BudgetVendorTierRow } from "@/types/budget";
import type { VendorCategoryRow } from "@/types/vendors";

import { VendorPreview } from "./VendorPreview";
import styles from "./VendorRow.module.css";

const TIERS: BudgetTier[] = ["essential", "elevated", "luxury", "ultra"];
const TIER_LABEL: Record<BudgetTier, string> = {
  essential: "Essential",
  elevated: "Elevated",
  luxury: "Luxury",
  ultra: "Ultra",
};

type Props = {
  category: VendorCategoryRow;
  tiers: BudgetVendorTierRow[];
  selectedTier: BudgetTier;
  cost: number;
  guestCount: number | null;
  perGuest: boolean;
  multiplier: number;
  locationSlug: string;
  onSelectTier: (tier: BudgetTier) => void;
};

export function VendorRow({
  category,
  tiers,
  selectedTier,
  cost,
  guestCount,
  perGuest,
  multiplier,
  locationSlug,
  onSelectTier,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const description = tiers.find((t) => t.tier === selectedTier)?.description ?? "";

  return (
    <div className={[styles.row, expanded ? styles.rowExpanded : ""].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={styles.head}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className={styles.icon} aria-hidden>
          {category.icon}
        </span>
        <div className={styles.headBody}>
          <span className={styles.name}>{category.name}</span>
          <span className={styles.tierBadge}>{TIER_LABEL[selectedTier]}</span>
          {perGuest && guestCount != null && (
            <span className={styles.perGuestNote}>${(cost / Math.max(1, guestCount)).toFixed(0)}/guest × {guestCount}</span>
          )}
        </div>
        <div className={styles.headRight}>
          <span className={styles.cost}>${cost.toLocaleString("en-US")}</span>
          <span className={styles.chevron} aria-hidden>{expanded ? "−" : "+"}</span>
        </div>
      </button>

      {expanded && (
        <div className={styles.body}>
          {description && (
            <p className={styles.description}>{description}</p>
          )}

          <div className={styles.tierBtns}>
            {TIERS.map((t) => {
              const tierCost = tierCostFor(
                { tiers, multiplier },
                category,
                t,
                guestCount,
              );
              const isActive = t === selectedTier;
              return (
                <button
                  key={t}
                  type="button"
                  className={[
                    styles.tierBtn,
                    isActive ? styles.tierBtnActive : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelectTier(t)}
                >
                  <span className={styles.tierBtnLabel}>{TIER_LABEL[t]}</span>
                  <span className={styles.tierBtnCost}>${tierCost.toLocaleString("en-US")}</span>
                </button>
              );
            })}
          </div>

          <VendorPreview
            categorySlug={category.slug}
            categoryName={category.name}
            locationSlug={locationSlug}
            tier={selectedTier}
          />
        </div>
      )}
    </div>
  );
}
