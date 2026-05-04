"use client";

import styles from "./Legend.module.css";

const ITEMS = [
  { label: "Highly auspicious", className: "swatchGoldDeep" },
  { label: "Auspicious", className: "swatchGoldSoft" },
  { label: "Neutral", className: "swatchNeutral" },
  { label: "Avoid", className: "swatchRose" },
  { label: "Blocked", className: "swatchBurgundy" },
  { label: "Sweet spot (auspicious + good weather + matches filters)", className: "swatchSweet" },
] as const;

export function Legend() {
  return (
    <aside className={styles.legend}>
      <h4 className={styles.title}>How to read the calendar</h4>
      <ul className={styles.list}>
        {ITEMS.map((item) => (
          <li key={item.label} className={styles.item}>
            <span
              className={[styles.swatch, styles[item.className]].join(" ")}
              aria-hidden
            />
            <span className={styles.itemLabel}>{item.label}</span>
          </li>
        ))}
      </ul>
      <p className={styles.note}>
        Tap any date to see the muhurat window, weather, and venue pricing
        notes. Some modern families proceed with weddings during blocked
        periods — discuss with your pandit.
      </p>
    </aside>
  );
}
