"use client";

// ──────────────────────────────────────────────────────────────────────────
// Results — guest-mode shagun result.
//
// Big-number reveal as the hero, then auspicious option ladder, rationale,
// reciprocity / budget callouts (when applicable), and the "+1" explainer.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";

import type { GuestInputs, ShagunResult } from "@/types/shagun";
import { encodeGuestInputs } from "@/lib/shagun";

import {
  LOCATION_LABELS,
  RELATIONSHIP_LABELS,
  TRADITION_LABELS,
  WEDDING_STYLE_LABELS,
} from "@/lib/shagun";

import styles from "./Results.module.css";

type Props = {
  result: ShagunResult;
  inputs: GuestInputs;
  onRestart: () => void;
  onEdit: () => void;
  onSwitchMode: () => void;
};

function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function Results({
  result,
  inputs,
  onRestart,
  onEdit,
  onSwitchMode,
}: Props) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  // Counter tick-up for the hero number — feels like a moment.
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const target = result.recommendation;
    let frame = 0;
    const total = 28;
    let raf = 0;
    const tick = () => {
      frame += 1;
      const t = Math.min(1, frame / total);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(target * eased));
      if (frame < total) raf = requestAnimationFrame(tick);
      else setDisplayed(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result.recommendation]);

  const handleShare = async () => {
    try {
      const token = encodeGuestInputs(inputs);
      const url = `${window.location.origin}${window.location.pathname}#m=g&a=${token}`;
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", `#m=g&a=${token}`);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2400);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2400);
    }
  };

  const contextLine = `For ${RELATIONSHIP_LABELS[inputs.relationship].toLowerCase()} — ${WEDDING_STYLE_LABELS[inputs.weddingStyle].toLowerCase()}`;
  const contextSub = `${TRADITION_LABELS[inputs.tradition]} · ${LOCATION_LABELS[inputs.location]}`;

  return (
    <div className={styles.wrap}>
      <article className={styles.numberCard}>
        <span className={styles.eyebrow}>Your recommended shagun</span>
        <div className={styles.bigNumber}>${displayed.toLocaleString()}</div>
        <p className={styles.contextLine}>{contextLine}</p>
        <p className={styles.contextSubLine}>{contextSub}</p>
        <span className={styles.rangeLine}>
          Range for your relationship: {formatUsd(result.range.low)} –{" "}
          {formatUsd(result.range.high)}
        </span>
      </article>

      <section className={styles.optionsCard}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionEyebrow}>auspicious options</span>
          <h3 className={styles.sectionTitle}>
            pick a number that <em>fits you</em>
          </h3>
        </div>
        <div className={styles.optionsList}>
          {result.options.map((opt) => (
            <div
              key={opt.amount}
              className={[
                styles.optionRow,
                opt.isRecommended ? styles.optionRowRecommended : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className={styles.optionAmount}>{formatUsd(opt.amount)}</span>
              <p className={styles.optionDescription}>{opt.description}</p>
              {opt.isRecommended ? (
                <span className={styles.optionStar}>★ recommended</span>
              ) : (
                <span className={styles.optionPlaceholder} />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.rationaleCard}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionEyebrow}>why this amount</span>
          <h3 className={styles.sectionTitle}>
            here's the <em>thinking</em>
          </h3>
        </div>
        <p className={styles.rationaleText}>{result.rationale}</p>
        {result.notes.length > 0 && (
          <ul className={styles.noteList}>
            {result.notes.map((n) => (
              <li key={n} className={styles.noteItem}>
                {n}
              </li>
            ))}
          </ul>
        )}
      </section>

      {result.reciprocity && (
        <article className={styles.calloutCard}>
          <span className={styles.calloutEyebrow}>reciprocity check</span>
          <p className={styles.calloutText}>{result.reciprocity.note}</p>
        </article>
      )}

      {result.budget && (
        <article
          className={[styles.calloutCard, styles.calloutCardGold]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.calloutEyebrow}>budget reality</span>
          <p className={styles.calloutText}>{result.budget.note}</p>
        </article>
      )}

      <details className={styles.plusOneCard}>
        <summary className={styles.plusOneSummary}>
          <span>
            why does it end in <em>1?</em>
          </span>
          <span className={styles.plusOneArrow}>read →</span>
        </summary>
        <div className={styles.plusOneBody}>
          <p>
            In South Asian tradition, shagun amounts always end in 1 — never a
            round number. You give $101, not $100. $251, not $250.
          </p>
          <p>
            The extra rupee or dollar symbolizes that this is not a transaction
            but a blessing — and blessings, like relationships, should never
            feel "complete" or "settled." The 1 represents growth, continuity,
            and the hope that good fortune will keep flowing.
          </p>
          <p>
            That's why you'll see amounts like $501 or $1,001 at weddings — the
            base number ($500, $1,000) represents the practical gift, and the
            +1 carries the spiritual intent. Some families extend this to 11 —
            $111, $511, $1,011 — where the extra $11 amplifies the blessing.
          </p>
          <p>
            There's no wrong version. The principle is the same: never give a
            round number at an Indian wedding.
          </p>
        </div>
      </details>

      <section className={styles.ctaWrap}>
        <h3 className={styles.ctaTitle}>
          Got the number you came for? <em>Pass it on.</em>
        </h3>
        <p className={styles.ctaBody}>
          Half the value of this tool is texting the result to your cousin who's
          also going to the wedding. The parking-lot panic ends here.
        </p>

        <div className={styles.secondaryRow}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleShare}
          >
            ↗{" "}
            {shareState === "copied"
              ? "Link copied!"
              : shareState === "error"
                ? "Couldn't copy"
                : "Share with my cousin"}
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onSwitchMode}
          >
            We're the couple — estimate total →
          </button>
        </div>

        <div className={styles.secondaryRow}>
          <button type="button" className={styles.tertiaryLink} onClick={onEdit}>
            ← edit my answers
          </button>
          <button
            type="button"
            className={styles.tertiaryLink}
            onClick={onRestart}
          >
            start over
          </button>
        </div>
      </section>
    </div>
  );
}
