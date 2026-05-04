"use client";

import type { Season, UserFilters } from "@/types/auspicious-date";
import styles from "./StepCard.module.css";

type Props = {
  filters: UserFilters;
  onSetDayPref: (v: UserFilters["dayOfWeekPref"]) => void;
  onToggleSeason: (v: Season) => void;
  onToggleFilter: (key: keyof UserFilters) => void;
  onNext: () => void;
  onBack: () => void;
};

const DAY_OPTIONS: { value: UserFilters["dayOfWeekPref"]; label: string; sub: string }[] = [
  { value: "saturday-only", label: "Saturday only", sub: "The classic. Most US guests can travel for a Saturday." },
  { value: "weekends", label: "Weekends (Fri / Sat / Sun)", sub: "More flexibility. Friday and Sunday open up extra muhurats." },
  { value: "any", label: "Any day", sub: "Traditional muhurats don't care about weekdays. Tuesdays and Thursdays are common." },
];

const SEASONS: { value: Season; label: string; sub: string }[] = [
  { value: "spring", label: "Spring", sub: "March – May" },
  { value: "summer", label: "Summer", sub: "June – August" },
  { value: "fall", label: "Fall", sub: "September – November" },
  { value: "winter", label: "Winter", sub: "December – February" },
];

const TOGGLES: { key: keyof UserFilters; label: string; sub: string }[] = [
  { key: "avoidExtremeHeat", label: "Avoid extreme heat", sub: "Skip months where the average high exceeds 95°F in your city" },
  { key: "avoidExtremeCold", label: "Avoid extreme cold", sub: "Skip months where the average high is below 40°F" },
  { key: "showLongWeekends", label: "Show long weekends only", sub: "Memorial Day, Labor Day, Thanksgiving — easier for out-of-town guests" },
  { key: "avoidPeakPricing", label: "Avoid peak venue pricing", sub: "Skip months where Indian wedding venues charge premium rates" },
  { key: "crossTraditionMatch", label: "Show cross-tradition matches only", sub: "For fusion couples — only dates favorable in all selected traditions" },
];

export function StepFilters({
  filters,
  onSetDayPref,
  onToggleSeason,
  onToggleFilter,
  onNext,
  onBack,
}: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Step 3 of 3</span>
      <h2 className={styles.heading}>
        What matters <em>logistically?</em>
      </h2>
      <p className={styles.sub}>
        All optional. Skip any of this if you want to see the full calendar
        unfiltered.
      </p>

      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>Day of week</span>
        <div className={styles.choiceList}>
          {DAY_OPTIONS.map((opt) => {
            const selected = filters.dayOfWeekPref === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSetDayPref(opt.value)}
                className={[
                  styles.choiceBtn,
                  selected ? styles.choiceBtnSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={selected}
              >
                <span className={styles.choiceLabel}>{opt.label}</span>
                <span className={styles.choiceSub}>{opt.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>Season preference</span>
        <p className={styles.helper}>Multi-select. Leave empty to show every season.</p>
        <div className={[styles.choiceList, styles.choiceListTwoCol].join(" ")}>
          {SEASONS.map((s) => {
            const selected = filters.seasonPref.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onToggleSeason(s.value)}
                className={[
                  styles.choiceBtn,
                  selected ? styles.choiceBtnSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={selected}
              >
                <span className={styles.choiceLabel}>{s.label}</span>
                <span className={styles.choiceSub}>{s.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>Additional filters</span>
        <div className={styles.toggleRow}>
          {TOGGLES.map((t) => {
            const selected = !!filters[t.key];
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onToggleFilter(t.key)}
                className={[
                  styles.toggle,
                  selected ? styles.toggleSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={selected}
              >
                <span className={styles.toggleBox}>{selected ? "✓" : ""}</span>
                <span className={styles.toggleBody}>
                  <span className={styles.toggleLabel}>{t.label}</span>
                  <span className={styles.toggleSub}>{t.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← back
        </button>
        <button type="button" className={styles.primaryBtn} onClick={onNext}>
          See the calendar ✦
        </button>
      </div>
    </div>
  );
}
