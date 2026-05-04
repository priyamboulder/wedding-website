"use client";

import { useMemo, type Dispatch } from "react";

import {
  addonSelectionKey,
  type BuilderAction,
  type BuilderState,
  type BudgetSummary,
} from "@/lib/budget";
import type {
  BudgetAddonRow,
  BudgetCultureWithEvents,
  BudgetLocationRow,
  BudgetVendorTierRow,
} from "@/types/budget";
import type { VendorCategoryRow } from "@/types/vendors";

import { EventCard } from "./EventCard";
import { WeddingWideSection } from "./WeddingWideSection";
import { AddonsSection } from "./AddonsSection";
import styles from "./BuildView.module.css";

type Props = {
  state: BuilderState;
  dispatch: Dispatch<BuilderAction>;
  location: BudgetLocationRow;
  culture: BudgetCultureWithEvents;
  vendorCategories: VendorCategoryRow[];
  vendorTiers: BudgetVendorTierRow[];
  addons: BudgetAddonRow[];
  summary: BudgetSummary;
};

export function BuildView({
  state,
  dispatch,
  location,
  culture,
  vendorCategories,
  vendorTiers,
  addons,
  summary,
}: Props) {
  const perEventAddons = useMemo(
    () => addons.filter((a) => a.scope === "per_event"),
    [addons],
  );
  const weddingWideAddons = useMemo(
    () => addons.filter((a) => a.scope === "wedding_wide"),
    [addons],
  );

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* ── Per-event breakdown ─────────────────────────────────────── */}
        <SectionHeader
          eyebrow="Section 1"
          title="Per-event"
          tagline={`${culture.name} · ${culture.events.length} events`}
        />
        <div className={styles.eventList}>
          {summary.events.map((breakdown) => (
            <EventCard
              key={breakdown.event.slug}
              breakdown={breakdown}
              location={location}
              vendorCategories={vendorCategories}
              vendorTiers={vendorTiers}
              addons={perEventAddons}
              state={state}
              dispatch={dispatch}
            />
          ))}
        </div>

        {/* ── Wedding-wide costs ─────────────────────────────────────── */}
        <SectionHeader
          eyebrow="Section 2"
          title="Wedding-wide"
          tagline="costs that span every event"
        />
        <WeddingWideSection
          location={location}
          summary={summary}
          vendorCategories={vendorCategories}
          vendorTiers={vendorTiers}
          state={state}
          dispatch={dispatch}
        />

        {/* ── Wedding-wide add-ons ───────────────────────────────────── */}
        <SectionHeader
          eyebrow="Bonus"
          title="Wedding-wide add-ons"
          tagline="the little flourishes that span the whole weekend"
        />
        <AddonsSection
          addons={weddingWideAddons}
          location={location}
          eventSlug={null}
          eventName={null}
          guestCount={maxGuestsFromSummary(summary)}
          isSelected={(slug) => Boolean(state.selectedAddons[addonSelectionKey(null, slug)])}
          onToggle={(slug) =>
            dispatch({ type: "toggle_addon", selectionKey: addonSelectionKey(null, slug) })
          }
        />
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  tagline,
}: {
  eyebrow: string;
  title: string;
  tagline: string;
}) {
  return (
    <header className={styles.sectionHeader}>
      <span className={styles.sectionEyebrow}>{eyebrow}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionTagline}>{tagline}</p>
    </header>
  );
}

function maxGuestsFromSummary(summary: BudgetSummary): number {
  let max = 0;
  for (const e of summary.events) if (e.guestCount > max) max = e.guestCount;
  return max;
}

