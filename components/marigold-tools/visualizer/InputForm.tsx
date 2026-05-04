"use client";

// ──────────────────────────────────────────────────────────────────────────
// InputForm — the single-page wedding config screen.
//
// Four input sections (format, events, style, days, ceremony time) on one
// card. Day count auto-suggests from event count but stays user-overridable.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";

import type {
  CeremonyTimePref,
  EventSlug,
  VisualizerInputs,
  WeddingFormat,
  WeddingStyle,
} from "@/types/visualizer";
import {
  ALL_EVENT_SLUGS,
  ceremonyPrefLabel,
  EVENT_CATALOG,
  formatLabel,
  resolveEvent,
  styleLabel,
  suggestDayCount,
} from "@/lib/tools/visualizer";

import styles from "./InputForm.module.css";

const FORMAT_OPTIONS: { value: WeddingFormat; sub: string }[] = [
  { value: "intimate", sub: "50–100 guests" },
  { value: "classic", sub: "150–250 guests" },
  { value: "grand", sub: "300–500 guests" },
  { value: "royal", sub: "500+ guests" },
];

const STYLE_OPTIONS: { value: WeddingStyle; sub: string }[] = [
  { value: "hindu_north", sub: "muhurat morning, baraat energy" },
  { value: "hindu_south", sub: "early morning, multi-stage" },
  { value: "sikh", sub: "Anand Karaj at the Gurdwara" },
  { value: "muslim", sub: "Nikah after Zuhr" },
  { value: "fusion", sub: "the both/and ceremony" },
  { value: "modern", sub: "make-your-own-rules" },
];

const CEREMONY_PREF_OPTIONS: CeremonyTimePref[] = [
  "morning_muhurat",
  "afternoon",
  "evening",
  "unsure",
];

const DAY_OPTIONS = [1, 2, 3, 4, 5];

type Props = {
  inputs: VisualizerInputs;
  onChange: (next: VisualizerInputs) => void;
  onGenerate: () => void;
};

export function InputForm({ inputs, onChange, onGenerate }: Props) {
  const userOverrodeDays = useRef(false);

  // Auto-suggest day count from event count until the user manually picks.
  useEffect(() => {
    if (userOverrodeDays.current) return;
    const suggested = suggestDayCount(inputs.events.length);
    if (suggested !== inputs.days) {
      onChange({ ...inputs, days: suggested });
    }
  }, [inputs, onChange]);

  const toggleEvent = (slug: EventSlug) => {
    const next = inputs.events.includes(slug)
      ? inputs.events.filter((e) => e !== slug)
      : [...inputs.events, slug];
    onChange({ ...inputs, events: next });
  };

  const canGenerate = inputs.events.length > 0;

  return (
    <div className={styles.card}>
      {/* ── Format ───────────────────────────────────────────────────── */}
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <span className={styles.eyebrow}>01 · Wedding format</span>
          <h2 className={styles.heading}>How big are we talking?</h2>
        </div>
        <div className={styles.gridFour}>
          {FORMAT_OPTIONS.map((opt) => {
            const selected = inputs.format === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={[
                  styles.choiceBtn,
                  selected ? styles.choiceBtnSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={selected}
                onClick={() => onChange({ ...inputs, format: opt.value })}
              >
                <span className={styles.choiceLabel}>
                  {formatLabel(opt.value).split(" (")[0]}
                </span>
                <span className={styles.choiceSub}>{opt.sub}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Events ───────────────────────────────────────────────────── */}
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <span className={styles.eyebrow}>02 · Events</span>
          <h2 className={styles.heading}>
            What's on the <em>itinerary?</em>
          </h2>
          <p className={styles.help}>
            Pre-checked are the most common. Add or remove anything — we'll
            adjust the day count.
          </p>
        </div>
        <div className={styles.eventGrid}>
          {ALL_EVENT_SLUGS.map((slug) => {
            const event = resolveEvent(slug, inputs.style);
            const selected = inputs.events.includes(slug);
            return (
              <button
                key={slug}
                type="button"
                className={[
                  styles.eventBtn,
                  selected ? styles.eventBtnSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={selected}
                onClick={() => toggleEvent(slug)}
              >
                <span className={styles.eventIcon} aria-hidden>
                  {event.icon}
                </span>
                <span className={styles.eventLabel}>{event.name}</span>
                <span className={styles.eventCheck} aria-hidden>
                  {selected ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Style ────────────────────────────────────────────────────── */}
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <span className={styles.eyebrow}>03 · Wedding style</span>
          <h2 className={styles.heading}>
            Whose <em>traditions</em> are leading?
          </h2>
          <p className={styles.help}>
            Drives muhurat timing, ritual sequence, and event names (Sangeet
            vs Jaggo, Vidaai vs Rukhsati, etc).
          </p>
        </div>
        <div className={styles.gridThree}>
          {STYLE_OPTIONS.map((opt) => {
            const selected = inputs.style === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={[
                  styles.choiceBtn,
                  selected ? styles.choiceBtnSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={selected}
                onClick={() => onChange({ ...inputs, style: opt.value })}
              >
                <span className={styles.choiceLabel}>
                  {styleLabel(opt.value)}
                </span>
                <span className={styles.choiceSub}>{opt.sub}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Days + ceremony preference ───────────────────────────────── */}
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <span className={styles.eyebrow}>
            04 · Days &amp; ceremony timing
          </span>
          <h2 className={styles.heading}>The shape of the weekend.</h2>
        </div>

        <div className={styles.subBlock}>
          <span className={styles.subLabel}>Number of days</span>
          <div className={styles.dayPicker}>
            {DAY_OPTIONS.map((d) => {
              const selected = inputs.days === d;
              return (
                <button
                  key={d}
                  type="button"
                  className={[
                    styles.dayBtn,
                    selected ? styles.dayBtnSelected : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={selected}
                  onClick={() => {
                    userOverrodeDays.current = true;
                    onChange({ ...inputs, days: d });
                  }}
                >
                  {d === 5 ? "5+" : d}
                </button>
              );
            })}
          </div>
          {!userOverrodeDays.current && (
            <span className={styles.suggestion}>
              auto-suggested for your event count
            </span>
          )}
        </div>

        <div className={styles.subBlock}>
          <span className={styles.subLabel}>Ceremony time preference</span>
          <div className={styles.gridFour}>
            {CEREMONY_PREF_OPTIONS.map((pref) => {
              const selected = inputs.ceremonyTimePref === pref;
              return (
                <button
                  key={pref}
                  type="button"
                  className={[
                    styles.choiceBtn,
                    styles.choiceBtnSm,
                    selected ? styles.choiceBtnSelected : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={selected}
                  onClick={() =>
                    onChange({ ...inputs, ceremonyTimePref: pref })
                  }
                >
                  <span className={styles.choiceLabel}>
                    {ceremonyPrefLabel(pref)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Submit ───────────────────────────────────────────────────── */}
      <div className={styles.submitRow}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onGenerate}
          disabled={!canGenerate}
        >
          {canGenerate ? "Show me the weekend →" : "Pick at least one event"}
        </button>
        <span className={styles.submitHint}>
          generates instantly · no email required
        </span>
      </div>
    </div>
  );
}

// Surface for callers that want the catalog alongside the form (kept here so
// the form stays the one component that imports the catalog directly).
export { EVENT_CATALOG };
