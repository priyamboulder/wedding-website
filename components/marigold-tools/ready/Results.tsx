"use client";

// ──────────────────────────────────────────────────────────────────────────
// Results — the readiness report.
//
// Tier card + score, priority list (top 5), can-wait list, conversion
// footer with PDF download and shareable link.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";

import type { AssessmentAnswer, ReadinessResult } from "@/types/readiness";
import {
  downloadReadinessPdf,
  encodeAnswers,
  exportReadinessPdf,
} from "@/lib/readiness";

import styles from "./Results.module.css";

type Props = {
  result: ReadinessResult;
  answers: AssessmentAnswer;
  onRestart: () => void;
  onEdit: () => void;
};

const TIER_PALETTE: Record<
  ReadinessResult["tier"],
  { color: string; glow: string }
> = {
  "ahead-of-the-game": { color: "#3F6E4A", glow: "rgba(63, 110, 74, 0.18)" },
  "right-on-track": { color: "#B58A3D", glow: "rgba(212, 168, 83, 0.22)" },
  "time-to-get-moving": {
    color: "#C46A2D",
    glow: "rgba(196, 106, 45, 0.22)",
  },
  "lets-build-your-plan": {
    color: "#C25775",
    glow: "rgba(212, 83, 126, 0.22)",
  },
  "dont-panic": { color: "#7A1F2E", glow: "rgba(122, 31, 46, 0.22)" },
};

export function Results({ result, answers, onRestart, onEdit }: Props) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const palette = TIER_PALETTE[result.tier];

  const handleDownload = () => {
    const filename = `marigold-readiness-${result.tier}.pdf`;
    const doc = exportReadinessPdf(result);
    downloadReadinessPdf(filename, doc);
  };

  const handleShare = async () => {
    try {
      const token = encodeAnswers(answers);
      const url = `${window.location.origin}${window.location.pathname}#a=${token}`;
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", `#a=${token}`);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2400);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2400);
    }
  };

  const signupHref = `/signup?from=readiness&a=${encodeAnswers(answers)}`;

  return (
    <div className={styles.wrap}>
      <article
        className={styles.tierCard}
        style={
          {
            "--tier-color": palette.color,
            "--tier-glow": palette.glow,
          } as React.CSSProperties
        }
      >
        <div>
          <span className={styles.tierEyebrow}>Your readiness</span>
          <h2 className={styles.tierLabel}>{result.tierLabel}</h2>
          <p className={styles.tierBlurb}>{result.tierBlurb}</p>
        </div>
        <div className={styles.scoreCircle}>
          <span className={styles.scoreNum}>{Math.round(result.score)}</span>
          <span className={styles.scoreSlash}>/ 100</span>
        </div>
      </article>

      <section>
        <div className={styles.sectionHead}>
          <span className={styles.sectionEyebrow}>this week</span>
          <h3 className={styles.sectionTitle}>
            Your top 5 <em>right now</em>
          </h3>
        </div>

        <div className={styles.priorityList}>
          {result.priorities.map((p) => (
            <article key={p.id} className={styles.priorityCard}>
              <div className={styles.priorityRank}>
                {String(p.rank).padStart(2, "0")}
              </div>
              <div className={styles.priorityBody}>
                <p className={styles.priorityAction}>{p.action}</p>
                <p className={styles.priorityWhy}>{p.why}</p>
                <div className={styles.priorityMeta}>
                  <span className={styles.metaPill}>
                    <span className={styles.metaLabel}>When:</span>
                    {p.timeframe}
                  </span>
                  {p.budgetNote && (
                    <span
                      className={[styles.metaPill, styles.metaPillGold].join(
                        " ",
                      )}
                    >
                      <span className={styles.metaLabel}>Budget:</span>
                      {p.budgetNote}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {result.canWait.length > 0 && (
        <section className={styles.canWaitCard}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionEyebrow}>breathe</span>
            <h3 className={styles.sectionTitle}>
              what can <em>wait</em>
            </h3>
          </div>
          <div className={styles.canWaitList}>
            {result.canWait.map((item) => (
              <div key={item.label} className={styles.canWaitItem}>
                <p className={styles.canWaitLabel}>{item.label}</p>
                <p className={styles.canWaitDetail}>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.ctaWrap}>
        <h3 className={styles.ctaTitle}>
          Now turn this into a <em>real plan</em>.
        </h3>
        <p className={styles.ctaBody}>
          Track every deadline, every vendor, every conversation — in one place
          built for your kind of wedding. We'll pre-fill your workspace with
          everything you just told us.
        </p>

        <div>
          <Link href={signupHref} className={styles.primaryBtn}>
            Create your planning workspace →
          </Link>
        </div>

        <div className={styles.secondaryRow}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleDownload}
          >
            ↓ Download report (PDF)
          </button>
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
                : "Share with my partner"}
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
