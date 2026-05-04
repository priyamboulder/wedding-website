"use client";

// ──────────────────────────────────────────────────────────────────────────
// Setup — Step 1 of the builder.
//
// Picks events to include, free-text wedding location, and the guest
// distribution that drives the out-of-town attendance modifiers.
// ──────────────────────────────────────────────────────────────────────────

import type {
  EventSlug,
  GuestDistribution,
  GuestEstimateState,
} from "@/types/guests";
import {
  ALL_EVENT_SLUGS,
  EVENT_NAMES,
  GUEST_DISTRIBUTION_LABELS,
} from "@/lib/guests";

import styles from "./Setup.module.css";

type Props = {
  state: GuestEstimateState;
  onToggleEvent: (e: EventSlug) => void;
  onChangeLocation: (loc: string) => void;
  onChangeDistribution: (d: GuestDistribution) => void;
  onContinue: () => void;
  onBack: () => void;
};

const DIST_SUBS: Record<GuestDistribution, string> = {
  "mostly-local": "uncle-in-Dallas attendance rates",
  mixed: "the most common pattern",
  "mostly-traveling": "out-of-towners flying in",
  international: "multi-continent guest list",
};

export function Setup({
  state,
  onToggleEvent,
  onChangeLocation,
  onChangeDistribution,
  onContinue,
  onBack,
}: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Step 1 of 4 — setup</span>
      <h2 className={styles.heading}>
        Tell us about the <em>weekend</em>.
      </h2>
      <p className={styles.sub}>
        Each event has its own attendance pattern — your mehndi might be 60
        people, your reception 400. We'll estimate them separately.
      </p>

      <div className={styles.section}>
        <span className={styles.label}>Events you're planning</span>
        <p className={styles.helper}>
          Tap to toggle. You can adjust per-event attendance % later.
        </p>
        <div className={styles.eventGrid}>
          {ALL_EVENT_SLUGS.map((slug) => {
            const selected = state.events.includes(slug);
            return (
              <button
                key={slug}
                type="button"
                className={[
                  styles.eventChip,
                  selected ? styles.eventChipSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onToggleEvent(slug)}
                aria-pressed={selected}
              >
                {EVENT_NAMES[slug]}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Where's the wedding?</span>
        <p className={styles.helper}>
          Optional — used in your shareable PDF.
        </p>
        <input
          type="text"
          className={styles.locationInput}
          placeholder="Dallas, Goa, Lake Como…"
          value={state.weddingLocation}
          onChange={(e) => onChangeLocation(e.target.value)}
        />
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Where do most of your guests live?</span>
        <p className={styles.helper}>
          Out-of-town attendance rates are dramatically different from local.
        </p>
        <div className={styles.distGrid}>
          {(
            Object.keys(GUEST_DISTRIBUTION_LABELS) as GuestDistribution[]
          ).map((d) => {
            const selected = state.guestDistribution === d;
            return (
              <button
                key={d}
                type="button"
                className={[
                  styles.distBtn,
                  selected ? styles.distBtnSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onChangeDistribution(d)}
                aria-pressed={selected}
              >
                <span className={styles.distLabel}>
                  {GUEST_DISTRIBUTION_LABELS[d]}
                </span>
                <span className={styles.distSub}>{DIST_SUBS[d]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← back
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onContinue}
          disabled={state.events.length === 0}
        >
          Build the list →
        </button>
      </div>
    </div>
  );
}
