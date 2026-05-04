"use client";

// ──────────────────────────────────────────────────────────────────────────
// Results — the dashboard.
//
// Big-range hero, side-by-side breakdown, per-event bar chart, what-if
// levers (which dispatch back into the reducer), cost preview, insights,
// and the conversion footer (workspace signup, PDF, share, retake).
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";

import type {
  EstimateOutput,
  GuestEstimateState,
} from "@/types/guests";
import {
  downloadGuestPdf,
  encodeState,
  exportGuestPdf,
} from "@/lib/guests";

import styles from "./Results.module.css";

type Props = {
  state: GuestEstimateState;
  output: EstimateOutput;
  onCostPerHeadChange: (v: number) => void;
  onApplyLever: (lever: LeverId) => void;
  activeLevers: LeverId[];
  onRestart: () => void;
  onEdit: () => void;
};

export type LeverId =
  | "drop-obligation"
  | "family-only-mehndi"
  | "no-plus-ones"
  | "kids-free"
  | "drop-outer-extended";

const LEVERS: { id: LeverId; label: string; tier?: string }[] = [
  {
    id: "drop-obligation",
    label: "Drop parents' obligation invites",
  },
  {
    id: "family-only-mehndi",
    label: "Make mehndi family-only",
  },
  {
    id: "no-plus-ones",
    label: "Skip +1s for single friends",
  },
  {
    id: "kids-free",
    label: "Kids-free reception",
  },
  {
    id: "drop-outer-extended",
    label: "Cut outer extended family",
  },
];

export function Results({
  state,
  output,
  onCostPerHeadChange,
  onApplyLever,
  activeLevers,
  onRestart,
  onEdit,
}: Props) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const handleDownload = () => {
    const filename = `marigold-guest-count.pdf`;
    const doc = exportGuestPdf(state, output);
    downloadGuestPdf(filename, doc);
  };

  const handleShare = async () => {
    try {
      const token = encodeState(state);
      const url = `${window.location.origin}${window.location.pathname}#g=${token}`;
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", `#g=${token}`);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2400);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2400);
    }
  };

  const enabledSides = output.bySide.filter((s) => s.enabled);
  const sharedTotal =
    output.totalNames -
    enabledSides.reduce((a, s) => a + s.totalNames, 0);

  const maxEvent = Math.max(
    1,
    ...output.byEvent.map((e) => e.estimatedCount),
  );

  const signupHref = `/signup?from=guest-count&g=${encodeState(state)}`;

  return (
    <div className={styles.wrap}>
      <article className={styles.rangeCard}>
        <span className={styles.rangeEyebrow}>your estimated guest count</span>
        <h2 className={styles.rangeNum}>
          <em>{output.totalRange.low}</em>
          <span className={styles.rangeDash}>–</span>
          <em>{output.totalRange.high}</em>
        </h2>
        <p className={styles.rangeMeta}>
          across <strong>{state.events.length}</strong>{" "}
          event{state.events.length === 1 ? "" : "s"} ·{" "}
          <strong>{output.totalNames}</strong> total names on the master list
        </p>
      </article>

      <section className={styles.sectionCard}>
        <span className={styles.sectionEyebrow}>side by side</span>
        <h3 className={styles.sectionTitle}>
          Where the number <em>actually comes from</em>.
        </h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tier</th>
                {enabledSides.map((s) => (
                  <th key={s.sideId}>{s.label}</th>
                ))}
                {sharedTotal > 0 && <th>Shared</th>}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {output.byTier.map((tier) => {
                const sideSum = enabledSides.reduce(
                  (a, s) => a + s.byTier[tier.tierId],
                  0,
                );
                const sharedForTier = Math.max(0, tier.count - sideSum);
                return (
                  <tr key={tier.tierId}>
                    <td>{tier.name}</td>
                    {enabledSides.map((s) => {
                      const a = enabledSides[0];
                      const b = enabledSides[1];
                      const isLargerCol =
                        a && b && s.byTier[tier.tierId] > 0 &&
                        s.byTier[tier.tierId] >=
                          (s.sideId === a.sideId
                            ? b.byTier[tier.tierId]
                            : a.byTier[tier.tierId]) &&
                        s.byTier[tier.tierId] !==
                          (s.sideId === a.sideId
                            ? b.byTier[tier.tierId]
                            : a.byTier[tier.tierId]);
                      return (
                        <td
                          key={s.sideId}
                          className={isLargerCol ? styles.bigCol : ""}
                        >
                          {s.byTier[tier.tierId]}
                        </td>
                      );
                    })}
                    {sharedTotal > 0 && (
                      <td className={styles.smallCol}>
                        {sharedForTier > 0 ? sharedForTier : "—"}
                      </td>
                    )}
                    <td>{tier.count}</td>
                  </tr>
                );
              })}
              <tr className={styles.totalRow}>
                <td>Total names</td>
                {enabledSides.map((s) => (
                  <td key={s.sideId}>{s.totalNames}</td>
                ))}
                {sharedTotal > 0 && <td>{sharedTotal}</td>}
                <td>{output.totalNames}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <span className={styles.sectionEyebrow}>per event</span>
        <h3 className={styles.sectionTitle}>
          Who shows up <em>where</em>.
        </h3>
        <div>
          {output.byEvent.map((evt) => {
            const ratio = evt.estimatedCount / maxEvent;
            const isCeremony =
              evt.slug === "ceremony" || evt.slug === "reception";
            return (
              <div key={evt.slug} className={styles.barRow}>
                <span className={styles.barLabel}>{evt.name}</span>
                <span className={styles.barTrack}>
                  <span
                    className={[
                      styles.barFill,
                      isCeremony ? styles.barFillCeremony : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ width: `${Math.max(2, ratio * 100)}%` }}
                  />
                </span>
                <span className={styles.barCount}>{evt.estimatedCount}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.sectionCard}>
        <span className={styles.sectionEyebrow}>what if</span>
        <h3 className={styles.sectionTitle}>
          The <em>levers</em>.
        </h3>
        <div className={styles.leversGrid}>
          {LEVERS.map((lever) => {
            const active = activeLevers.includes(lever.id);
            return (
              <button
                key={lever.id}
                type="button"
                className={[
                  styles.leverBtn,
                  active ? styles.leverActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onApplyLever(lever.id)}
                aria-pressed={active}
              >
                <span className={styles.leverLabel}>{lever.label}</span>
                <span
                  className={[
                    styles.leverDelta,
                    active ? styles.leverDeltaNegative : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {active ? "applied — tap to undo" : "tap to apply"}
                </span>
              </button>
            );
          })}
        </div>
        <p className={styles.leverNote}>
          Levers cascade into every event count and the cost estimate. Tap
          again to undo.
        </p>
      </section>

      <section className={styles.costCard}>
        <span className={styles.sectionEyebrow}>cost preview</span>
        <h3 className={styles.costNum}>
          ${formatNum(output.costEstimate.low)} – $
          {formatNum(output.costEstimate.high)}
        </h3>
        <p className={styles.costSub}>
          Estimated food + venue + basic decor across all events.
        </p>
        <div className={styles.costMeta}>
          <div className={styles.costMetaPiece}>
            <div className={styles.costMetaLabel}>Every 25 you add</div>
            <div className={styles.costMetaValue}>
              +${formatNum(state.costPerHead * 25 * Math.max(1, state.events.length * 0.55))}–$
              {formatNum(state.costPerHead * 25 * Math.max(1, state.events.length * 0.7))}
            </div>
          </div>
          <div className={styles.costMetaPiece}>
            <div className={styles.costMetaLabel}>Biggest cost driver</div>
            <div className={styles.costMetaValue}>
              {biggestDriver(output)}
            </div>
          </div>
        </div>
        <div className={styles.costPerHeadRow}>
          <span>Per-head cost:</span>
          <span>$</span>
          <input
            type="number"
            min={50}
            max={2000}
            value={state.costPerHead}
            onChange={(e) => onCostPerHeadChange(parseCost(e.target.value))}
          />
          <span>(default $150 — DFW Indian-wedding average)</span>
        </div>
        <p className={styles.costFootnote}>
          A rough estimate. Actual costs vary by vendor tier, venue, and
          menu.{" "}
          <Link href="/tools/budget">
            Try the Shaadi Budget tool for a detailed breakdown →
          </Link>
        </p>
      </section>

      {output.insights.length > 0 && (
        <section className={styles.sectionCard}>
          <span className={styles.sectionEyebrow}>what this tells us</span>
          <h3 className={styles.sectionTitle}>
            Patterns <em>worth talking about</em>.
          </h3>
          <div className={styles.insights}>
            {output.insights.map((insight, i) => (
              <p key={i} className={styles.insight}>
                {insight}
              </p>
            ))}
          </div>
        </section>
      )}

      <section className={styles.ctaCard}>
        <h3 className={styles.ctaTitle}>
          Now turn this into your <em>real guest list</em>.
        </h3>
        <p className={styles.ctaBody}>
          Import these numbers into your Marigold workspace. Add names, track
          RSVPs, manage seating — across every event.
        </p>

        <div>
          <Link href={signupHref} className={styles.ctaPrimary}>
            Build my guest list →
          </Link>
        </div>

        <div className={styles.ctaRow}>
          <button
            type="button"
            className={styles.ctaSecondary}
            onClick={handleDownload}
          >
            ↓ Download the breakdown (PDF)
          </button>
          <button
            type="button"
            className={styles.ctaSecondary}
            onClick={handleShare}
          >
            ↗{" "}
            {shareState === "copied"
              ? "Link copied!"
              : shareState === "error"
                ? "Couldn't copy"
                : "Share with family"}
          </button>
        </div>

        <div className={styles.tertiaryRow}>
          <button
            type="button"
            className={styles.tertiaryLink}
            onClick={onEdit}
          >
            ← edit my numbers
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

function formatNum(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(Math.round(n));
}

function parseCost(raw: string): number {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(2000, Math.max(0, n));
}

function biggestDriver(output: EstimateOutput): string {
  const top = [...output.byTier].sort((a, b) => b.count - a.count)[0];
  if (!top || top.count === 0) return "—";
  return `${top.name} (${top.count})`;
}
