"use client";

import { useMemo, useState } from "react";

import type { BudgetAddonRow, BudgetLocationRow } from "@/types/budget";

import styles from "./AddonsSection.module.css";

type Props = {
  addons: BudgetAddonRow[];
  location: BudgetLocationRow;
  eventSlug: string | null;
  eventName: string | null;
  // For per_event sections, this is the event's guest count.
  // For wedding-wide sections, this is the largest event's guest count.
  guestCount: number;
  isSelected: (addonSlug: string) => boolean;
  onToggle: (addonSlug: string) => void;
};

const ALL_FILTER = "All";

export function AddonsSection({
  addons,
  location,
  guestCount,
  isSelected,
  onToggle,
}: Props) {
  const [filter, setFilter] = useState<string>(ALL_FILTER);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const a of addons) if (a.category) set.add(a.category);
    return [ALL_FILTER, ...Array.from(set).sort()];
  }, [addons]);

  const filtered = useMemo(() => {
    if (filter === ALL_FILTER) return addons;
    return addons.filter((a) => a.category === filter);
  }, [addons, filter]);

  if (addons.length === 0) {
    return <p className={styles.empty}>No add-ons applicable here.</p>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.filters}>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={[
              styles.filterPill,
              filter === c ? styles.filterPillActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {c}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map((a) => {
          const selected = isSelected(a.slug);
          const base = a.base_cost_usd * location.multiplier;
          const lineCost = a.per_guest ? Math.round(base * guestCount) : Math.round(base);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onToggle(a.slug)}
              className={[
                styles.card,
                selected ? styles.cardSelected : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={selected}
            >
              <div className={styles.cardHead}>
                <span className={styles.cardIcon} aria-hidden>{a.icon}</span>
                <span className={styles.cardName}>{a.name}</span>
                <span
                  className={[
                    styles.checkbox,
                    selected ? styles.checkboxOn : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden
                >
                  {selected ? "✓" : ""}
                </span>
              </div>
              {a.description && (
                <p className={styles.cardDesc}>{a.description}</p>
              )}
              <div className={styles.cardFoot}>
                <span className={styles.cardCost}>
                  ${lineCost.toLocaleString("en-US")}
                </span>
                {a.per_guest && (
                  <span className={styles.perGuest}>
                    ${Math.round(base)}/guest × {guestCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
