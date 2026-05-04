"use client";

import { useMemo, type Dispatch } from "react";

import {
  vendorSelectionKey,
  type BudgetSummary,
  type BuilderAction,
  type BuilderState,
} from "@/lib/budget";
import type {
  BudgetLocationRow,
  BudgetVendorTierRow,
} from "@/types/budget";
import type { VendorCategoryRow } from "@/types/vendors";

import { VendorRow } from "./VendorRow";
import styles from "./WeddingWideSection.module.css";

type Props = {
  location: BudgetLocationRow;
  summary: BudgetSummary;
  vendorCategories: VendorCategoryRow[];
  vendorTiers: BudgetVendorTierRow[];
  state: BuilderState;
  dispatch: Dispatch<BuilderAction>;
};

export function WeddingWideSection({
  location,
  summary,
  vendorCategories,
  vendorTiers,
  dispatch,
}: Props) {
  // Group wedding-wide vendor lines by their category group_name so the UI
  // reads as: Photo & Video → Attire → Beauty → ...
  const grouped = useMemo(() => {
    const map = new Map<string, typeof summary.weddingWideVendors>();
    for (const line of summary.weddingWideVendors) {
      const arr = map.get(line.groupName) ?? [];
      arr.push(line);
      map.set(line.groupName, arr);
    }
    return Array.from(map.entries());
  }, [summary.weddingWideVendors]);

  if (grouped.length === 0) {
    return (
      <p className={styles.empty}>No wedding-wide vendors in this catalog.</p>
    );
  }

  return (
    <div className={styles.groups}>
      {grouped.map(([groupName, lines]) => {
        const groupTotal = lines.reduce((s, l) => s + l.cost, 0);
        return (
          <div key={groupName} className={styles.group}>
            <div className={styles.groupHead}>
              <h3 className={styles.groupName}>{groupName}</h3>
              <span className={styles.groupTotal}>
                ${groupTotal.toLocaleString("en-US")}
              </span>
            </div>
            <div className={styles.rows}>
              {lines.map((line) => {
                const category = vendorCategories.find(
                  (c) => c.slug === line.categorySlug,
                );
                if (!category) return null;
                return (
                  <VendorRow
                    key={line.key}
                    category={category}
                    tiers={vendorTiers.filter(
                      (t) => t.vendor_category_id === category.id,
                    )}
                    selectedTier={line.tier}
                    cost={line.cost}
                    guestCount={line.guestCount}
                    perGuest={line.perGuest}
                    multiplier={location.multiplier}
                    locationSlug={location.slug}
                    onSelectTier={(tier) =>
                      dispatch({
                        type: "set_vendor_tier",
                        selectionKey: vendorSelectionKey(null, line.categorySlug),
                        tier,
                      })
                    }
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
