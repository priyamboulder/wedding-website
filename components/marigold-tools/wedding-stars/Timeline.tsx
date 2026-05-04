"use client";

import { useState } from "react";

import type { MonthBucket, TransitWindow } from "@/types/wedding-stars";

import { TransitCard } from "./TransitCard";
import styles from "./Timeline.module.css";

type Props = {
  months: MonthBucket[];
};

export function Timeline({ months }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Auto-expand the first highly-favorable transit so the page never
    // lands as a wall of collapsed cards.
    const set = new Set<string>();
    for (const m of months) {
      const golden = m.windows.find((w) => w.status === "highly-favorable");
      if (golden) {
        set.add(`${m.ymKey}::${golden.transitId}`);
        break;
      }
    }
    return set;
  });

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Render only months that contain at least one window. Months with zero
  // active transits would otherwise just be visual noise.
  const visible = months.filter((m) => m.windows.length > 0);

  return (
    <div className={styles.timeline}>
      <div className={styles.spine} aria-hidden />
      {visible.map((month) => (
        <section key={month.ymKey} className={styles.month}>
          <header className={styles.monthHeader}>
            <span className={styles.monthDot} aria-hidden />
            <h3 className={styles.monthLabel}>{month.label}</h3>
          </header>
          <div className={styles.windows}>
            {month.windows.map((w) => {
              const key = `${month.ymKey}::${w.transitId}`;
              return (
                <TransitCard
                  key={key}
                  window={w}
                  expanded={expanded.has(key)}
                  onToggle={() => toggle(key)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
