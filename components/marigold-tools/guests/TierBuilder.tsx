"use client";

// ──────────────────────────────────────────────────────────────────────────
// TierBuilder — Step 2 of the builder.
//
// Two-column layout for both family sides plus a single shared section for
// couple's-friends and professional categories. Counts are entered once for
// shared categories so they're not double-counted.
// ──────────────────────────────────────────────────────────────────────────

import type {
  GuestEstimateState,
  SideId,
} from "@/types/guests";
import {
  TIERS,
  computeSideTotals,
  computeSharedTierTotals,
  computeTotalNames,
} from "@/lib/guests";

import styles from "./TierBuilder.module.css";

type Props = {
  state: GuestEstimateState;
  onSetCount: (
    side: SideId,
    tierId: string,
    categoryId: string,
    value: number,
  ) => void;
  onSetSharedCount: (
    tierId: string,
    categoryId: string,
    value: number,
  ) => void;
  onRenameSide: (side: SideId, label: string) => void;
  onToggleSide: (side: SideId) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function TierBuilder({
  state,
  onSetCount,
  onSetSharedCount,
  onRenameSide,
  onToggleSide,
  onContinue,
  onBack,
}: Props) {
  const sideTotals = computeSideTotals(state);
  const sharedTotals = computeSharedTierTotals(state);
  const sharedSum = Object.values(sharedTotals).reduce((a, b) => a + b, 0);
  const grandTotal = computeTotalNames(state);

  return (
    <div className={styles.wrap}>
      <div className={styles.headerCard}>
        <span className={styles.headerEyebrow}>Step 2 of 4 — the list</span>
        <h2 className={styles.headerTitle}>
          Build it <em>tier by tier</em>.
        </h2>
        <p className={styles.headerSub}>
          Walk through each side. Be honest — under-counting now means
          surprised over-counting later. Numbers update as you type.
        </p>

        <div className={styles.runningTotal}>
          {sideTotals.map((s) => (
            <span key={s.sideId} className={styles.runningPiece}>
              <span className={styles.runningLabel}>{s.label}</span>
              <span className={styles.runningNum}>{s.totalNames}</span>
            </span>
          ))}
          <span className={styles.runningPiece}>
            <span className={styles.runningLabel}>Shared</span>
            <span className={styles.runningNum}>{sharedSum}</span>
          </span>
          <span className={styles.runningPiece}>
            <span className={styles.runningLabel}>Total</span>
            <span className={styles.runningNum}>{grandTotal}</span>
          </span>
        </div>
      </div>

      <div className={styles.sidesGrid}>
        {state.sides.map((side) => {
          const totals = sideTotals.find((t) => t.sideId === side.id)!;
          return (
            <div
              key={side.id}
              className={[
                styles.sideCard,
                side.enabled ? "" : styles.sideCardDisabled,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={styles.sideHeader}>
                <input
                  className={styles.sideLabelInput}
                  value={side.label}
                  onChange={(e) => onRenameSide(side.id, e.target.value)}
                  aria-label={`${side.id === "a" ? "Side A" : "Side B"} label`}
                />
                <span className={styles.sideTotal}>{totals.totalNames}</span>
              </div>

              <button
                type="button"
                className={styles.toggleEnabled}
                onClick={() => onToggleSide(side.id)}
              >
                {side.enabled ? "Hide this side" : "Include this side"}
              </button>

              {side.enabled &&
                TIERS.map((tier) => {
                  const sideTierTotal = tier.categories.reduce(
                    (acc, c) =>
                      acc +
                      (c.sideSpecific
                        ? side.counts[`${tier.id}:${c.id}`] ?? 0
                        : 0),
                    0,
                  );
                  const sideCats = tier.categories.filter(
                    (c) => c.sideSpecific,
                  );
                  if (sideCats.length === 0) return null;
                  return (
                    <section key={tier.id} className={styles.tier}>
                      <div className={styles.tierHeader}>
                        <span className={styles.tierName}>{tier.name}</span>
                        <span className={styles.tierTotal}>
                          {sideTierTotal}
                        </span>
                      </div>
                      <p className={styles.tierDesc}>{tier.description}</p>
                      {sideCats.map((cat) => (
                        <div key={cat.id} className={styles.row}>
                          <label className={styles.rowLabel}>
                            {cat.label}
                            {cat.helpText && (
                              <span className={styles.rowHelp}>
                                {cat.helpText}
                              </span>
                            )}
                          </label>
                          <input
                            type="number"
                            min={0}
                            className={styles.numInput}
                            value={
                              side.counts[`${tier.id}:${cat.id}`] ?? 0
                            }
                            onChange={(e) =>
                              onSetCount(
                                side.id,
                                tier.id,
                                cat.id,
                                parseNumber(e.target.value),
                              )
                            }
                          />
                        </div>
                      ))}
                    </section>
                  );
                })}
            </div>
          );
        })}
      </div>

      <div className={styles.sharedSection}>
        <p className={styles.sharedHeader}>shared between both of you</p>
        <h3 className={styles.sharedHeading}>
          Couple's friends + professional ({sharedSum})
        </h3>
        <p className={styles.sharedNote}>
          Entered once — not split by side, since they're typically your
          shared list.
        </p>
        {TIERS.filter((t) =>
          t.categories.some((c) => !c.sideSpecific),
        ).map((tier) => {
          const tierCats = tier.categories.filter((c) => !c.sideSpecific);
          const tierTotal = tierCats.reduce(
            (a, c) => a + (state.shared.counts[`${tier.id}:${c.id}`] ?? 0),
            0,
          );
          return (
            <section key={tier.id} className={styles.tier}>
              <div className={styles.tierHeader}>
                <span className={styles.tierName}>{tier.name}</span>
                <span className={styles.tierTotal}>{tierTotal}</span>
              </div>
              <p className={styles.tierDesc}>{tier.description}</p>
              {tierCats.map((cat) => (
                <div key={cat.id} className={styles.row}>
                  <label className={styles.rowLabel}>
                    {cat.label}
                    {cat.helpText && (
                      <span className={styles.rowHelp}>{cat.helpText}</span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={0}
                    className={styles.numInput}
                    value={state.shared.counts[`${tier.id}:${cat.id}`] ?? 0}
                    onChange={(e) =>
                      onSetSharedCount(
                        tier.id,
                        cat.id,
                        parseNumber(e.target.value),
                      )
                    }
                  />
                </div>
              ))}
            </section>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← back
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onContinue}
        >
          Tune attendance →
        </button>
      </div>
    </div>
  );
}

function parseNumber(raw: string): number {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}
