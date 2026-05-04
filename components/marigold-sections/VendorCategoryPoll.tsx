"use client";

// ── VendorCategoryPoll ─────────────────────────────────────────────────────
// Slim horizontal poll card that surfaces above the vendor grid on
// /vendors-directory when a category filter is active. Reads from
// /api/polls/for-vendor-category which picks one of the curated polls
// for the filter label and returns its current counts. Votes are
// recorded with context = `vendor_<slug>` so we can later segment
// "what photographers' shoppers think" vs the homepage feed.
//
// Visibility rules:
//   - Caller is responsible for not rendering when filter === 'All'.
//   - Renders nothing while loading or if the label has no mapped polls
//     (the API replies 204 in that case).
//   - Renders nothing on transient errors (silent — this is a "while
//     you're here" moment, not a load-bearing surface).

import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser-client";
import { vendorCategoryVoteContext } from "@/lib/polls/vendor-category-polls";
import type { Poll } from "@/types/polls";
import styles from "./VendorCategoryPoll.module.css";

interface Props {
  /** The currently selected category filter label (e.g. 'Photography'). */
  filterLabel: string;
}

interface PollSnapshot {
  poll: Poll;
  counts: number[];
  total: number;
}

const FINGERPRINT_KEY = "marigold-poll-fingerprint";
const votedKey = (pollId: string) => `marigold-poll-vote:${pollId}`;

function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  let fp = window.localStorage.getItem(FINGERPRINT_KEY);
  if (!fp) {
    fp =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `fp_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    window.localStorage.setItem(FINGERPRINT_KEY, fp);
  }
  return fp;
}

function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export function VendorCategoryPoll({ filterLabel }: Props) {
  const [snapshot, setSnapshot] = useState<PollSnapshot | null>(null);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fingerprintRef = useRef<string>("");
  // Cache the picked poll per label for the lifetime of the page so the
  // card doesn't reshuffle every keystroke or unrelated state change.
  const pickedForLabelRef = useRef<string | null>(null);

  useEffect(() => {
    fingerprintRef.current = getFingerprint();
  }, []);

  useEffect(() => {
    if (pickedForLabelRef.current === filterLabel && snapshot) return;
    pickedForLabelRef.current = filterLabel;
    let cancelled = false;
    setSnapshot(null);
    setVotedIndex(null);
    setError(null);

    (async () => {
      try {
        const res = await fetch(
          `/api/polls/for-vendor-category?label=${encodeURIComponent(filterLabel)}`,
          { cache: "no-store" },
        );
        if (cancelled) return;
        if (res.status === 204 || !res.ok) {
          setSnapshot(null);
          return;
        }
        const json = (await res.json()) as PollSnapshot;
        setSnapshot(json);

        const stored = window.localStorage.getItem(votedKey(json.poll.id));
        if (stored !== null) {
          const idx = Number(stored);
          if (
            Number.isFinite(idx) &&
            idx >= 0 &&
            idx < json.poll.options.length
          ) {
            setVotedIndex(idx);
          }
        }
      } catch {
        if (!cancelled) setSnapshot(null);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLabel]);

  const winningIndex = useMemo(() => {
    if (!snapshot) return -1;
    let max = -1;
    let idx = 0;
    snapshot.counts.forEach((c, i) => {
      if (c > max) {
        max = c;
        idx = i;
      }
    });
    return max > 0 ? idx : -1;
  }, [snapshot]);

  if (!snapshot) return null;
  const { poll, counts, total } = snapshot;
  const showResults = votedIndex !== null;

  const handleVote = async (optionIndex: number) => {
    if (submitting || votedIndex !== null) return;
    setSubmitting(true);
    setError(null);

    let token: string | null = null;
    try {
      const session = await supabaseBrowser.auth.getSession();
      token = session.data.session?.access_token ?? null;
    } catch {
      token = null;
    }

    try {
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pollId: poll.id,
          optionIndex,
          fingerprint: fingerprintRef.current,
          context: vendorCategoryVoteContext(filterLabel),
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok && res.status !== 409) {
        setError("Couldn't save your vote.");
        setSubmitting(false);
        return;
      }

      const nextCounts: number[] = Array.isArray(json?.counts)
        ? json.counts
        : counts.map((c, i) => (i === optionIndex ? c + 1 : c));
      const nextTotal: number =
        typeof json?.total === "number"
          ? json.total
          : nextCounts.reduce((a, b) => a + b, 0);
      const recordedIndex: number =
        typeof json?.optionIndex === "number" ? json.optionIndex : optionIndex;

      setSnapshot({ poll, counts: nextCounts, total: nextTotal });
      setVotedIndex(recordedIndex);
      window.localStorage.setItem(votedKey(poll.id), String(recordedIndex));
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card} role="group" aria-label="Quick poll">
        <div className={styles.text}>
          <p className={styles.eyebrow}>while you're browsing…</p>
          <p className={styles.question}>{poll.question}</p>
        </div>

        {!showResults ? (
          <div className={styles.options}>
            {poll.options.map((option, i) => (
              <button
                key={i}
                type="button"
                className={styles.option}
                onClick={() => handleVote(i)}
                disabled={submitting}
              >
                {option}
              </button>
            ))}
            {error && <span className={styles.errorRow}>{error}</span>}
          </div>
        ) : (
          <div className={styles.results}>
            <div className={styles.bars}>
              {poll.options.map((option, i) => {
                const percent = pct(counts[i] ?? 0, total);
                const isWinning = i === winningIndex;
                const myVote = i === votedIndex;
                return (
                  <div key={i} className={styles.bar}>
                    <span
                      className={`${styles.barFill} ${
                        isWinning ? styles.barFillWinning : ""
                      }`}
                      style={{ width: `${percent}%` }}
                      aria-hidden="true"
                    />
                    <div className={styles.barRow}>
                      <span
                        className={`${styles.barLabel} ${
                          isWinning && percent >= 30
                            ? styles.barLabelOnFill
                            : ""
                        }`}
                      >
                        {option}
                        {myVote && (
                          <span
                            className={`${styles.barCheck} ${
                              isWinning && percent >= 30
                                ? styles.barCheckOnFill
                                : ""
                            }`}
                            aria-label="your pick"
                          >
                            ✓
                          </span>
                        )}
                      </span>
                      <span
                        className={`${styles.barPercent} ${
                          isWinning && percent >= 85
                            ? styles.barPercentOnFill
                            : ""
                        }`}
                      >
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <span className={styles.totalRow}>
              {total.toLocaleString()} {total === 1 ? "vote" : "votes"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
