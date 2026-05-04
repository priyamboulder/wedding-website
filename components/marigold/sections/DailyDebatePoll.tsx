'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser-client';
import type { Poll } from '@/types/polls';
import styles from './DailyDebate.module.css';

interface Props {
  poll: Poll;
  initialCounts: number[];
  initialTotal: number;
}

const FINGERPRINT_KEY = 'marigold-poll-fingerprint';
const votedKey = (pollId: string) => `marigold-poll-vote:${pollId}`;

function getFingerprint(): string {
  if (typeof window === 'undefined') return '';
  let fp = window.localStorage.getItem(FINGERPRINT_KEY);
  if (!fp) {
    fp =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
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

export function DailyDebatePoll({ poll, initialCounts, initialTotal }: Props) {
  const [counts, setCounts] = useState<number[]>(initialCounts);
  const [total, setTotal] = useState<number>(initialTotal);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBars, setShowBars] = useState(false);
  const fingerprintRef = useRef<string>('');

  // Restore prior-vote state from localStorage on mount.
  useEffect(() => {
    fingerprintRef.current = getFingerprint();
    const stored = window.localStorage.getItem(votedKey(poll.id));
    if (stored !== null) {
      const idx = Number(stored);
      if (Number.isFinite(idx) && idx >= 0 && idx < poll.options.length) {
        setVotedIndex(idx);
        // Defer to next frame so the bars animate in.
        requestAnimationFrame(() => setShowBars(true));
      }
    }
  }, [poll.id, poll.options.length]);

  const winningIndex = useMemo(() => {
    if (counts.length === 0) return -1;
    let max = -1;
    let idx = 0;
    counts.forEach((c, i) => {
      if (c > max) {
        max = c;
        idx = i;
      }
    });
    return max > 0 ? idx : -1;
  }, [counts]);

  const isThreeWay = poll.poll_type === 'three_way' || poll.options.length >= 3;
  const isSettleThis = poll.poll_type === 'settle_this';
  const isWouldYou = poll.poll_type === 'would_you';

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
      const res = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pollId: poll.id,
          optionIndex,
          fingerprint: fingerprintRef.current,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok && res.status !== 409) {
        setError(json?.error ?? 'Could not record your vote. Try again.');
        setSubmitting(false);
        return;
      }

      // 409 = already voted. Treat as success and surface the latest counts.
      const nextCounts: number[] = Array.isArray(json?.counts)
        ? json.counts
        : counts.map((c, i) => (i === optionIndex ? c + 1 : c));
      const nextTotal: number =
        typeof json?.total === 'number'
          ? json.total
          : nextCounts.reduce((a, b) => a + b, 0);
      const recordedIndex: number =
        typeof json?.optionIndex === 'number' ? json.optionIndex : optionIndex;

      setCounts(nextCounts);
      setTotal(nextTotal);
      setVotedIndex(recordedIndex);
      window.localStorage.setItem(votedKey(poll.id), String(recordedIndex));
      requestAnimationFrame(() => setShowBars(true));
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const showResults = votedIndex !== null;

  return (
    <>
      <p className={styles.subhead}>
        {isSettleThis && (
          <span className={styles.subheadIcon} aria-hidden="true">
            🔥
          </span>
        )}
        settle this before the shaadi
      </p>

      <h2 id="daily-debate-question" className={styles.question}>
        {poll.question}
      </h2>

      {isWouldYou && !showResults && (
        <p className={styles.teaser}>Results might surprise you</p>
      )}
      {!isWouldYou && !showResults && <div className={styles.teaserSpacer} />}

      {!showResults && (
        <div
          className={`${styles.options} ${isThreeWay ? styles.optionsThree : ''}`}
        >
          {poll.options.map((option, i) => (
            <button
              key={i}
              type="button"
              className={styles.button}
              onClick={() => handleVote(i)}
              disabled={submitting}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {showResults && (
        <>
          <div className={`${styles.bars} ${showBars ? styles.barsVisible : ''}`}>
            {poll.options.map((option, i) => {
              const percent = pct(counts[i] ?? 0, total);
              const isWinning = i === winningIndex;
              const myVote = i === votedIndex;
              return (
                <div key={i} className={styles.bar}>
                  <span
                    className={`${styles.barFill} ${
                      isWinning ? styles.barFillWinning : ''
                    }`}
                    style={{ width: `${percent}%` }}
                    aria-hidden="true"
                  />
                  <div className={styles.barRow}>
                    <span
                      className={`${styles.barLabel} ${
                        isWinning && percent >= 30 ? styles.barLabelOnFill : ''
                      }`}
                    >
                      {option}
                      {myVote && (
                        <span className={styles.barCheck} aria-label="your pick">
                          ✓ your pick
                        </span>
                      )}
                    </span>
                    <span
                      className={`${styles.barPercent} ${
                        isWinning && percent >= 85 ? styles.barPercentOnFill : ''
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className={styles.totalRow}>
            {total.toLocaleString()} {total === 1 ? 'person' : 'people'} voted
          </p>

          <div className={styles.shareRow}>
            <button
              type="button"
              className={styles.shareButton}
              onClick={() => {
                // Placeholder — share-card generator wires up later.
              }}
            >
              Share Your Result
            </button>
          </div>
        </>
      )}

      {error && <p className={styles.errorRow}>{error}</p>}
    </>
  );
}
