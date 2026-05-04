"use client";

import styles from "./StepCard.module.css";

type City = { value: string; label: string; region: string };

type Props = {
  years: number[];
  city: string;
  cities: ReadonlyArray<City>;
  onSetYear: (year: number, both: boolean) => void;
  onSetCity: (city: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepLocation({
  years,
  city,
  cities,
  onSetYear,
  onSetCity,
  onNext,
  onBack,
}: Props) {
  const isBoth = years.length > 1;
  const yearOptions: { value: number; both: boolean; label: string; sub: string }[] = [
    { value: 2026, both: false, label: "2026", sub: "12 weeks of muhurat dates blocked by Chaturmas" },
    { value: 2027, both: false, label: "2027", sub: "More open year — no Adhik Maas" },
    { value: 0, both: true, label: "Show me both", sub: "I'm flexible — compare 2026 and 2027" },
  ];

  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Step 2 of 3</span>
      <h2 className={styles.heading}>
        Year and <em>city</em>.
      </h2>
      <p className={styles.sub}>
        Year picks the muhurat dataset. City swaps in local weather and venue
        pricing patterns.
      </p>

      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>Year</span>
        <div className={styles.choiceList}>
          {yearOptions.map((opt) => {
            const selected = opt.both
              ? isBoth
              : !isBoth && years[0] === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onSetYear(opt.value, opt.both)}
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
        <span className={styles.fieldLabel}>Where's the wedding?</span>
        <select
          className={styles.select}
          value={city}
          onChange={(e) => onSetCity(e.target.value)}
        >
          {cities.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label} — {c.region}
            </option>
          ))}
        </select>
        <p className={styles.helper}>
          Muhurat timings are technically location-specific. For exact times in
          your city, confirm with your family pandit or priest.
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← back
        </button>
        <button type="button" className={styles.primaryBtn} onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}
