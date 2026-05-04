"use client";

import type { TransitStatus, TransitWindow } from "@/types/wedding-stars";
import type { Planet } from "@/types/kundli";

import { ACTION_LABEL } from "@/lib/wedding-stars";

import styles from "./TransitCard.module.css";

type Props = {
  window: TransitWindow;
  expanded: boolean;
  onToggle: () => void;
};

const PLANET_GLYPH: Record<Planet, string> = {
  Sun: "☉",
  Moon: "☾",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄",
  Rahu: "☊",
  Ketu: "☋",
};

const STATUS_LABEL: Record<TransitStatus, string> = {
  "highly-favorable": "Highly favorable",
  favorable: "Favorable",
  mixed: "Mixed",
  caution: "Caution",
  avoid: "Avoid major commitments",
};

const STATUS_GLYPH: Record<TransitStatus, string> = {
  "highly-favorable": "★",
  favorable: "✦",
  mixed: "◐",
  caution: "⚠",
  avoid: "⊘",
};

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((v) => parseInt(v, 10));
  return `${MONTH_NAMES_SHORT[m - 1]} ${d}`;
}

export function TransitCard({ window: w, expanded, onToggle }: Props) {
  const statusClass =
    w.status === "highly-favorable" ? styles.statusGolden :
    w.status === "favorable" ? styles.statusFavorable :
    w.status === "mixed" ? styles.statusMixed :
    w.status === "caution" ? styles.statusCaution :
    styles.statusAvoid;

  return (
    <article className={`${styles.card} ${statusClass} ${w.highlight ? styles.cardGlow : ""}`}>
      <button
        type="button"
        className={styles.head}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span className={styles.glyph} aria-hidden>
          {PLANET_GLYPH[w.planet]}
        </span>
        <div className={styles.headBody}>
          <div className={styles.headTopRow}>
            <span className={styles.planet}>{w.planet}</span>
            <span className={styles.house}>your {ordinal(w.houseForRashi)} house</span>
          </div>
          <div className={styles.event}>{w.event}</div>
          <div className={styles.range}>
            {formatDate(w.startISO)} – {formatDate(w.endISO)}
          </div>
        </div>
        <div className={styles.statusPill}>
          <span className={styles.statusGlyph} aria-hidden>{STATUS_GLYPH[w.status]}</span>
          <span className={styles.statusLabel}>{STATUS_LABEL[w.status]}</span>
        </div>
        <span className={styles.chev} aria-hidden>{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className={styles.body}>
          <p className={styles.impact}>{w.weddingImpact}</p>

          {(w.bestFor.length > 0 || w.avoid.length > 0) && (
            <dl className={styles.actionGrid}>
              {w.bestFor.length > 0 && (
                <div className={styles.actionBlock}>
                  <dt className={styles.actionLabel}>Best for</dt>
                  <dd className={styles.actionList}>
                    {w.bestFor.map((a) => (
                      <span key={a} className={`${styles.chip} ${styles.chipGood}`}>
                        {ACTION_LABEL[a]}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {w.avoid.length > 0 && (
                <div className={styles.actionBlock}>
                  <dt className={styles.actionLabel}>Avoid</dt>
                  <dd className={styles.actionList}>
                    {w.avoid.map((a) => (
                      <span key={a} className={`${styles.chip} ${styles.chipAvoid}`}>
                        {ACTION_LABEL[a]}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {w.proTip && (
            <p className={styles.proTip}>
              <span className={styles.proTipLabel}>Pro tip</span>
              {w.proTip}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}
