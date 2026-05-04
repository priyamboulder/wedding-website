"use client";

// ──────────────────────────────────────────────────────────────────────────
// EventTuner — Step 3 of the builder.
//
// One card per selected event. Sliders for each tier's attendance % plus a
// single out-of-town modifier. Live count updates as the user drags.
// ──────────────────────────────────────────────────────────────────────────

import type {
  EventAttendanceOverrides,
  EventSlug,
  GuestEstimateState,
  TierId,
} from "@/types/guests";
import {
  DEFAULT_ATTENDANCE_RATES,
  DEFAULT_OUT_OF_TOWN_MODIFIERS,
  TIERS,
  TIER_ORDER,
  computeEventBreakdown,
} from "@/lib/guests";

import styles from "./EventTuner.module.css";

type Props = {
  state: GuestEstimateState;
  onSetRate: (event: EventSlug, tier: TierId, value: number) => void;
  onSetOutOfTown: (event: EventSlug, value: number) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function EventTuner({
  state,
  onSetRate,
  onSetOutOfTown,
  onContinue,
  onBack,
}: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.headerCard}>
        <span className={styles.eyebrow}>Step 3 of 4 — attendance</span>
        <h2 className={styles.heading}>
          Not everyone comes to <em>every event</em>.
        </h2>
        <p className={styles.sub}>
          We've pre-set defaults from typical South Asian wedding patterns.
          Slide each tier up or down for your family — counts update live.
        </p>
      </div>

      {state.events.map((slug) => {
        const breakdown = computeEventBreakdown(state, slug);
        const overrides: EventAttendanceOverrides =
          state.eventOverrides[slug] ?? { rates: {} };
        const ootValue =
          overrides.outOfTownModifier ?? DEFAULT_OUT_OF_TOWN_MODIFIERS[slug];
        return (
          <div key={slug} className={styles.eventCard}>
            <div className={styles.eventHeader}>
              <h3 className={styles.eventName}>{breakdown.name}</h3>
              <div>
                <div className={styles.eventCount}>
                  {breakdown.estimatedCount}
                </div>
                <span className={styles.eventCountSub}>estimated</span>
              </div>
            </div>

            {TIER_ORDER.map((tier) => {
              const tierDef = TIERS.find((t) => t.id === tier);
              const rate =
                overrides.rates?.[tier] ??
                DEFAULT_ATTENDANCE_RATES[slug][tier];
              const tierCount = breakdown.byTier[tier];
              return (
                <div key={tier} className={styles.tierRow}>
                  <label className={styles.tierLabel}>
                    {tierDef?.name ?? tier}
                    <span className={styles.tierLabelSub}>
                      ≈ {tierCount} attending
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(rate * 100)}
                    onChange={(e) =>
                      onSetRate(
                        slug,
                        tier,
                        Number(e.target.value) / 100,
                      )
                    }
                    className={styles.slider}
                    aria-label={`${tierDef?.name ?? tier} attendance %`}
                  />
                  <span className={styles.pct}>{Math.round(rate * 100)}%</span>
                </div>
              );
            })}

            <div className={styles.ootRow}>
              <label className={styles.ootLabel}>
                Out-of-town reduction
                <span className={styles.ootSub}>
                  How much harder is it to attend if you're flying in?
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={70}
                value={Math.round(ootValue * 100)}
                onChange={(e) =>
                  onSetOutOfTown(slug, Number(e.target.value) / 100)
                }
                className={styles.slider}
                aria-label={`${breakdown.name} out-of-town reduction`}
              />
              <span className={styles.pct}>
                −{Math.round(ootValue * 100)}%
              </span>
            </div>
          </div>
        );
      })}

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← back
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onContinue}
        >
          See my number →
        </button>
      </div>
    </div>
  );
}
