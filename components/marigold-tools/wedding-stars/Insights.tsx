"use client";

import type { StarsInsight } from "@/types/wedding-stars";

import styles from "./Insights.module.css";

type Props = {
  insights: StarsInsight[];
};

const KIND_GLYPH: Record<StarsInsight["kind"], string> = {
  golden: "★",
  warning: "⚠",
  weddingDate: "♡",
  general: "✦",
};

export function Insights({ insights }: Props) {
  if (insights.length === 0) return null;
  return (
    <section className={styles.wrap} aria-label="Personalized insights">
      <header className={styles.header}>
        <span className={styles.eyebrow}>Your year at a glance</span>
        <h3 className={styles.title}>
          What the <em>stars</em> are telling you.
        </h3>
      </header>
      <ul className={styles.list}>
        {insights.map((ins, i) => (
          <li key={i} className={`${styles.item} ${kindClass(ins.kind)}`}>
            <span className={styles.glyph} aria-hidden>{KIND_GLYPH[ins.kind]}</span>
            <div className={styles.body}>
              <h4 className={styles.itemTitle}>{ins.title}</h4>
              <p className={styles.itemBody}>{ins.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function kindClass(k: StarsInsight["kind"]): string {
  switch (k) {
    case "golden": return styles.itemGolden;
    case "warning": return styles.itemWarning;
    case "weddingDate": return styles.itemWedding;
    default: return "";
  }
}
