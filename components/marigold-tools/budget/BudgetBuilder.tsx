"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import {
  ensureAnonymousToken,
  computeBudget,
  builderReducer,
  INITIAL_BUILDER_STATE,
  isOnboardingComplete,
  readPersistedState,
  writePersistedState,
  type BuilderState,
} from "@/lib/budget";
import type {
  BudgetAddonRow,
  BudgetCultureWithEvents,
  BudgetLocationRow,
  BudgetVendorTierRow,
} from "@/types/budget";
import type { VendorCategoryRow } from "@/types/vendors";

import { OnboardingFlow } from "./OnboardingFlow";
import { StickySummary } from "./StickySummary";
import { BuildView } from "./BuildView";
import { SummaryView } from "./SummaryView";
import { SaveAuthGate } from "./SaveAuthGate";
import { AiBudgetAdvisor } from "@/components/marigold-tools/ai/AiBudgetAdvisor";
import styles from "./BudgetBuilder.module.css";

export type BudgetBuilderProps = {
  locations: BudgetLocationRow[];
  cultures: BudgetCultureWithEvents[];
  vendorCategories: VendorCategoryRow[];
  vendorTiers: BudgetVendorTierRow[];
  addons: BudgetAddonRow[];
  initialLocationSlug: string | null;
  sourceLabel: string | null;
};

export type GateReason = "save" | "share" | "ai";

export function BudgetBuilder(props: BudgetBuilderProps) {
  const {
    locations,
    cultures,
    vendorCategories,
    vendorTiers,
    addons,
    initialLocationSlug,
  } = props;

  const [state, dispatch] = useReducer(builderReducer, INITIAL_BUILDER_STATE);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [gateReason, setGateReason] = useState<GateReason | null>(null);
  const buildSectionRef = useRef<HTMLDivElement>(null);

  // ── Hydration ─────────────────────────────────────────────────────────
  // 1) On mount: read or mint the anonymous token.
  // 2) Read any persisted state for that token.
  // 3) If a ?location= param was passed and we don't already have a
  //    location set, apply it.
  useEffect(() => {
    const t = ensureAnonymousToken();
    setToken(t);
    const persisted = readPersistedState(t);
    if (persisted) {
      // If the URL says location=X and the persisted state already has a
      // different location, the URL wins so that "open builder for Goa"
      // links land on Goa.
      let next: BuilderState = persisted;
      if (initialLocationSlug && initialLocationSlug !== persisted.locationSlug) {
        next = {
          ...persisted,
          locationSlug: initialLocationSlug,
          // If that was their only blocker, advance them.
          step: persisted.cultureSlug && persisted.totalBudget ? "build" : "culture",
        };
      }
      dispatch({ type: "hydrate", state: next });
    } else if (initialLocationSlug) {
      dispatch({ type: "set_location", slug: initialLocationSlug });
      dispatch({ type: "set_step", step: "culture" });
    }
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change, once we have a token.
  useEffect(() => {
    if (!hydrated || !token) return;
    writePersistedState(token, state);
  }, [hydrated, token, state]);

  // ── Derived data ──────────────────────────────────────────────────────

  const location = useMemo(
    () => locations.find((l) => l.slug === state.locationSlug) ?? null,
    [locations, state.locationSlug],
  );

  const culture = useMemo(
    () => cultures.find((c) => c.slug === state.cultureSlug) ?? null,
    [cultures, state.cultureSlug],
  );

  const summary = useMemo(() => {
    if (!location || !culture) return null;
    return computeBudget({
      events: culture.events,
      categories: vendorCategories,
      tiers: vendorTiers,
      addons,
      multiplier: location.multiplier,
      guestCounts: state.guestCounts,
      vendorTiers: state.vendorTiers,
      selectedAddons: state.selectedAddons,
      globalTier: state.globalTier,
    });
  }, [
    location,
    culture,
    vendorCategories,
    vendorTiers,
    addons,
    state.guestCounts,
    state.vendorTiers,
    state.selectedAddons,
    state.globalTier,
  ]);

  // ── Smooth-scroll to the build section after onboarding completes ─────

  const handleAdvanceToBuild = () => {
    dispatch({ type: "set_step", step: "build" });
    setTimeout(() => {
      buildSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const showOnboardingComplete = isOnboardingComplete(state);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className={styles.root}>
      <OnboardingFlow
        state={state}
        dispatch={dispatch}
        locations={locations}
        cultures={cultures}
        onComplete={handleAdvanceToBuild}
      />

      {showOnboardingComplete && location && culture && summary && (
        <>
          <div ref={buildSectionRef} className={styles.buildAnchor} />
          <StickySummary
            summary={summary}
            totalBudget={state.totalBudget}
            view={state.view}
            onChangeView={(v) => dispatch({ type: "set_view", view: v })}
            onRequestSave={() => setGateReason("save")}
          />

          {state.view === "build" ? (
            <BuildView
              state={state}
              dispatch={dispatch}
              location={location}
              culture={culture}
              vendorCategories={vendorCategories}
              vendorTiers={vendorTiers}
              addons={addons}
              summary={summary}
            />
          ) : (
            <>
              <SummaryView
                summary={summary}
                location={location}
                totalBudget={state.totalBudget}
                token={token}
                onShare={() => setGateReason("share")}
                onSave={() => setGateReason("save")}
                onAi={() => {
                  if (typeof document !== "undefined") {
                    document
                      .getElementById("ai-budget-advisor")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              />
              <AiBudgetAdvisor
                summary={summary}
                location={location}
                culture={culture}
                totalBudget={state.totalBudget}
                globalTier={state.globalTier}
              />
            </>
          )}
        </>
      )}

      {gateReason && token && (
        <SaveAuthGate
          reason={gateReason}
          anonymousToken={token}
          onClose={() => setGateReason(null)}
        />
      )}
    </div>
  );
}
