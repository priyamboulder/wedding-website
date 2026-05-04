"use client";

import { useState, type Dispatch } from "react";

import {
  addonSelectionKey,
  type BuilderAction,
  type BuilderState,
  type EventBreakdown,
} from "@/lib/budget";
import type {
  BudgetAddonRow,
  BudgetLocationRow,
  BudgetTier,
  BudgetVendorTierRow,
} from "@/types/budget";
import type { VendorCategoryRow } from "@/types/vendors";

import { VendorRow } from "./VendorRow";
import { AddonsSection } from "./AddonsSection";
import styles from "./EventCard.module.css";

const TIERS: BudgetTier[] = ["essential", "elevated", "luxury", "ultra"];
const TIER_LABEL: Record<BudgetTier, string> = {
  essential: "Essential",
  elevated: "Elevated",
  luxury: "Luxury",
  ultra: "Ultra",
};

type Props = {
  breakdown: EventBreakdown;
  location: BudgetLocationRow;
  vendorCategories: VendorCategoryRow[];
  vendorTiers: BudgetVendorTierRow[];
  addons: BudgetAddonRow[];
  state: BuilderState;
  dispatch: Dispatch<BuilderAction>;
};

export function EventCard({
  breakdown,
  location,
  vendorCategories,
  vendorTiers,
  addons,
  state,
  dispatch,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [addonsOpen, setAddonsOpen] = useState(false);

  const event = breakdown.event;
  const total = breakdown.subtotal;

  const applicableCategories = vendorCategories.filter(
    (c) =>
      c.scope === "per_event" &&
      (event.ceremony || !c.ceremony_only),
  );

  return (
    <div className={[styles.card, expanded ? styles.cardExpanded : ""].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={styles.head}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className={styles.headIcon} aria-hidden>
          {event.icon}
        </span>
        <div className={styles.headBody}>
          <div className={styles.headTopRow}>
            <h3 className={styles.headName}>{event.name}</h3>
            {event.ceremony && <span className={styles.ceremonyBadge}>ceremony</span>}
          </div>
          <p className={styles.headMeta}>
            {breakdown.guestCount} guests
          </p>
        </div>
        <div className={styles.headRight}>
          <span className={styles.headTotal}>${total.toLocaleString("en-US")}</span>
          <span className={styles.headChevron} aria-hidden>
            {expanded ? "−" : "+"}
          </span>
        </div>
      </button>

      {expanded && (
        <div className={styles.body}>
          {/* Guest count slider for this event */}
          <div className={styles.guestStrip}>
            <div className={styles.guestStripLabel}>
              <span className={styles.eyebrow}>guests at {event.name.toLowerCase()}</span>
              <span className={styles.guestStripCount}>{breakdown.guestCount}</span>
            </div>
            <input
              type="range"
              min={20}
              max={1500}
              step={10}
              value={breakdown.guestCount}
              onChange={(e) =>
                dispatch({
                  type: "set_event_guests",
                  eventSlug: event.slug,
                  count: Number(e.target.value),
                })
              }
              className={styles.guestSlider}
              aria-label={`Guests at ${event.name}`}
            />
          </div>

          {/* Set-all-tiers row */}
          <div className={styles.setAllRow}>
            <span className={styles.setAllLabel}>set all to:</span>
            <div className={styles.setAllBtns}>
              {TIERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={styles.setAllBtn}
                  onClick={() =>
                    dispatch({
                      type: "set_event_all_tiers",
                      eventSlug: event.slug,
                      tier: t,
                      categorySlugs: applicableCategories.map((c) => c.slug),
                    })
                  }
                >
                  {TIER_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Vendor rows (one per applicable category) */}
          <div className={styles.vendorList}>
            {breakdown.vendors.map((line) => {
              const category = vendorCategories.find((c) => c.slug === line.categorySlug);
              if (!category) return null;
              return (
                <VendorRow
                  key={line.key}
                  category={category}
                  tiers={vendorTiers.filter((t) => t.vendor_category_id === category.id)}
                  selectedTier={line.tier}
                  cost={line.cost}
                  guestCount={line.guestCount}
                  perGuest={line.perGuest}
                  multiplier={location.multiplier}
                  locationSlug={location.slug}
                  onSelectTier={(tier) =>
                    dispatch({
                      type: "set_vendor_tier",
                      selectionKey: line.key,
                      tier,
                    })
                  }
                />
              );
            })}
          </div>

          {/* Per-event add-ons */}
          <button
            type="button"
            className={styles.addonsToggle}
            onClick={() => setAddonsOpen((v) => !v)}
            aria-expanded={addonsOpen}
          >
            <span>✨ Add-ons for {event.name}</span>
            <span aria-hidden>{addonsOpen ? "−" : "+"}</span>
          </button>

          {addonsOpen && (
            <AddonsSection
              addons={addons}
              location={location}
              eventSlug={event.slug}
              eventName={event.name}
              guestCount={breakdown.guestCount}
              isSelected={(slug) =>
                Boolean(state.selectedAddons[addonSelectionKey(event.slug, slug)])
              }
              onToggle={(slug) =>
                dispatch({
                  type: "toggle_addon",
                  selectionKey: addonSelectionKey(event.slug, slug),
                })
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

