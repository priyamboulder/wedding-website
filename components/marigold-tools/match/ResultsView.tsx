"use client";

// ──────────────────────────────────────────────────────────────────────────
// ResultsView — the editorial spread brides see at the end of the flow.
//
// Layout: hero, top-3 cards in a varied magazine grid, then any remaining
// matches in a compact row, then the deep-dive CTA, then save-results.
// ──────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import Link from "next/link";

import { PRIORITY_LABELS } from "@/lib/match";
import type {
  MatchInputs,
  MatchedDestination,
  PrioritySlug,
} from "@/types/match";

import { DestinationCard } from "./DestinationCard";
import { AiDestinationAnalyst } from "@/components/marigold-tools/ai/AiDestinationAnalyst";
import { SaveMatchesPrompt } from "./SaveMatchesPrompt";
import styles from "./ResultsView.module.css";

type Props = {
  inputs: MatchInputs;
  matches: MatchedDestination[];
  anonymousToken: string | null;
  onRestart: () => void;
  onEditInputs: () => void;
};

export function ResultsView({
  inputs,
  matches,
  anonymousToken,
  onRestart,
  onEditInputs,
}: Props) {
  const [saved, setSaved] = useState(false);

  const summaryLine = useMemo(() => {
    const priorityLine =
      inputs.priorities.length === 0
        ? "open to anything"
        : inputs.priorities
            .map((p) => PRIORITY_LABELS[p as PrioritySlug])
            .join(", ");
    return `${formatMoney(inputs.budget)} · ${inputs.guests.toLocaleString("en-US")} guests · ${priorityLine}`;
  }, [inputs]);

  const top = matches[0] ?? null;
  const restOfTop3 = matches.slice(1, 3);
  const tail = matches.slice(3);

  return (
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <span className={styles.scrawl}>here's where</span>
        <h2 className={styles.heroTitle}>
          your wedding could <em>happen</em>
        </h2>
        <p className={styles.summary}>{summaryLine}</p>
        <div className={styles.heroActions}>
          <button type="button" className={styles.editLink} onClick={onEditInputs}>
            ← edit inputs
          </button>
          <button type="button" className={styles.editLink} onClick={onRestart}>
            start over
          </button>
        </div>
      </header>

      {matches.length === 0 ? (
        <div className={styles.empty}>
          <h3 className={styles.emptyHeading}>nothing matched ✿</h3>
          <p className={styles.emptyBody}>
            Your dealbreakers ruled out the field — try removing one. Or
            stretch the budget by 15% and we'll show you reach destinations.
          </p>
          <button
            type="button"
            className={styles.emptyBtn}
            onClick={onEditInputs}
          >
            Adjust inputs →
          </button>
        </div>
      ) : (
        <>
          {top && (
            <div className={styles.featured}>
              <span className={styles.featuredKicker}>
                ✿ your <em>top match</em>
              </span>
              <DestinationCard match={top} variant="featured" />
            </div>
          )}

          {restOfTop3.length > 0 && (
            <div className={styles.spread}>
              {restOfTop3.map((m) => (
                <DestinationCard key={m.slug} match={m} variant="standard" />
              ))}
            </div>
          )}

          {tail.length > 0 && (
            <>
              <div className={styles.divider}>
                <span className={styles.dividerLabel}>
                  also worth a look
                </span>
              </div>
              <div className={styles.tailGrid}>
                {tail.map((m) => (
                  <DestinationCard key={m.slug} match={m} variant="tail" />
                ))}
              </div>
            </>
          )}

          <AiDestinationAnalyst inputs={inputs} matches={matches} />

          <SaveMatchesPrompt
            inputs={inputs}
            matches={matches}
            anonymousToken={anonymousToken}
            saved={saved}
            onSaved={() => setSaved(true)}
          />
        </>
      )}

      <footer className={styles.footer}>
        <Link href="/tools/destinations" className={styles.footerLink}>
          didn't see the right vibe? browse all destinations →
        </Link>
        {top && (
          <Link
            href={`/tools/budget/build?location=${top.slug}&from=match`}
            className={styles.footerLink}
          >
            want to see exact costs? build a budget for {top.name} →
          </Link>
        )}
      </footer>
    </div>
  );
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}
