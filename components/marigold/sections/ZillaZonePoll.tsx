'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser-client';
import type { Poll } from '@/types/polls';
import styles from './ZillaZonePoll.module.css';

type VoterTypeBreakdown = Record<string, number[]>;

interface Snapshot {
  poll: Poll;
  counts: number[];
  total: number;
  byVoterType: VoterTypeBreakdown;
}

const FINGERPRINT_KEY = 'marigold-poll-fingerprint';
const votedKey = (pollId: string) => `marigold-poll-vote:${pollId}`;
const MIN_PER_VOTER_TYPE = 5;

// Curated bride-vs-mom polls for this slot. The DB row is the source of
// truth (real vote counts, real poll.id for voting), but we keep the
// question text mirrored here so the section renders immediately on first
// paint and still looks intentional if the migration hasn't run yet — in
// that fallback state voting is disabled with a "voting opens soon" hint.
const FALLBACK_QUESTIONS: { question: string; options: [string, string] }[] = [
  {
    question: "Should the couple have final say or is it the parents' wedding too?",
    options: ['Couple has final say', "It's the parents' wedding too"],
  },
  {
    question: 'Mother-in-law involvement — welcome it or set boundaries early?',
    options: ['Welcome it', 'Set boundaries early'],
  },
  {
    question: 'Family WhatsApp group for planning — helpful or a nightmare?',
    options: ['Helpful', 'A nightmare'],
  },
  {
    question: 'Handling unsolicited aunty opinions — engage or ignore?',
    options: ['Engage', 'Ignore'],
  },
  {
    question: "Is the bride's family paying for everything still a thing?",
    options: ['Yes', 'No'],
  },
  {
    question: 'Should siblings get a say in wedding decisions?',
    options: ['Yes', 'No'],
  },
];

function pickFallbackIndex(): number {
  return Math.floor(Math.random() * FALLBACK_QUESTIONS.length);
}

// SSR and the first client paint must match, so the initial index is
// deterministic. The randomized pick happens in a post-mount effect.
const INITIAL_FALLBACK_INDEX = 0;

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

function buildSplitTakeaway(
  options: string[],
  byVoterType: VoterTypeBreakdown,
): string | null {
  const brideCounts = byVoterType.bride ?? [];
  const momCounts = byVoterType.mom ?? [];
  const brideTotal = brideCounts.reduce((a, b) => a + b, 0);
  const momTotal = momCounts.reduce((a, b) => a + b, 0);

  if (brideTotal < MIN_PER_VOTER_TYPE || momTotal < MIN_PER_VOTER_TYPE) {
    return null;
  }

  const brideTopIdx = brideCounts.indexOf(Math.max(...brideCounts));
  const momTopIdx = momCounts.indexOf(Math.max(...momCounts));
  const bridePct = pct(brideCounts[brideTopIdx] ?? 0, brideTotal);
  const momPct = pct(momCounts[momTopIdx] ?? 0, momTotal);

  return `${bridePct}% of brides said “${options[brideTopIdx]}.” ${momPct}% of moms said “${options[momTopIdx]}.” 👀`;
}

export function ZillaZonePoll() {
  // Start with a deterministic fallback so SSR and first client paint
  // agree, then randomize once on the client to vary across visits. The
  // index is held in state so a re-render doesn't shuffle the question
  // mid-interaction.
  const [fallbackIdx, setFallbackIdx] = useState(INITIAL_FALLBACK_INDEX);
  useEffect(() => {
    setFallbackIdx(pickFallbackIndex());
  }, []);
  const fallback = FALLBACK_QUESTIONS[fallbackIdx];

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBars, setShowBars] = useState(false);
  const fingerprintRef = useRef<string>('');

  useEffect(() => {
    fingerprintRef.current = getFingerprint();
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/polls/zilla-zone', { cache: 'no-store' });
        if (res.status === 204 || !res.ok) {
          if (!cancelled) setApiUnavailable(true);
          return;
        }
        const data = (await res.json()) as Snapshot;
        if (cancelled) return;
        setSnapshot(data);

        const stored = window.localStorage.getItem(votedKey(data.poll.id));
        if (stored !== null) {
          const idx = Number(stored);
          if (Number.isFinite(idx) && idx >= 0 && idx < data.poll.options.length) {
            setVotedIndex(idx);
            requestAnimationFrame(() => setShowBars(true));
          }
        }
      } catch {
        if (!cancelled) setApiUnavailable(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const liveQuestion = snapshot?.poll.question ?? fallback.question;
  const liveOptions = snapshot?.poll.options ?? fallback.options;
  const counts = snapshot?.counts ?? [];
  const total = snapshot?.total ?? 0;

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

  const takeaway = useMemo(() => {
    if (!snapshot || votedIndex === null) return null;
    return buildSplitTakeaway(snapshot.poll.options, snapshot.byVoterType);
  }, [snapshot, votedIndex]);

  const handleVote = async (optionIndex: number) => {
    if (submitting || votedIndex !== null || !snapshot) return;
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
          pollId: snapshot.poll.id,
          optionIndex,
          fingerprint: fingerprintRef.current,
          context: 'zilla_zone',
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok && res.status !== 409) {
        setError(json?.error ?? 'Could not record your vote.');
        setSubmitting(false);
        return;
      }

      const nextCounts: number[] = Array.isArray(json?.counts)
        ? json.counts
        : counts.map((c, i) => (i === optionIndex ? c + 1 : c));
      const nextTotal: number =
        typeof json?.total === 'number'
          ? json.total
          : nextCounts.reduce((a, b) => a + b, 0);
      const recordedIndex: number =
        typeof json?.optionIndex === 'number' ? json.optionIndex : optionIndex;

      let nextBreakdown = snapshot.byVoterType;
      try {
        const refresh = await fetch('/api/polls/zilla-zone', {
          cache: 'no-store',
        });
        if (refresh.ok) {
          const fresh = (await refresh.json()) as Snapshot;
          if (fresh.poll.id === snapshot.poll.id) {
            nextBreakdown = fresh.byVoterType;
          }
        }
      } catch {
        // Stale breakdown is fine.
      }

      setSnapshot({
        poll: snapshot.poll,
        counts: nextCounts,
        total: nextTotal,
        byVoterType: nextBreakdown,
      });
      setVotedIndex(recordedIndex);
      window.localStorage.setItem(
        votedKey(snapshot.poll.id),
        String(recordedIndex),
      );
      requestAnimationFrame(() => setShowBars(true));
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const showResults = votedIndex !== null;
  const votingDisabled = !snapshot || apiUnavailable;

  return (
    <div className={styles.wrap}>
      <p className={styles.subhead}>settle this:</p>
      <h3 className={styles.question}>{liveQuestion}</h3>

      {!showResults && (
        <div className={styles.options}>
          {liveOptions.map((option, i) => (
            <button
              key={i}
              type="button"
              className={styles.button}
              onClick={() => handleVote(i)}
              disabled={submitting || votingDisabled}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {!showResults && apiUnavailable && (
        <p className={styles.errorRow}>Voting opens soon.</p>
      )}

      {showResults && snapshot && (
        <>
          <div className={`${styles.bars} ${showBars ? styles.barsVisible : ''}`}>
            {snapshot.poll.options.map((option, i) => {
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
                    <span className={styles.barLabel}>
                      {option}
                      {myVote && (
                        <span className={styles.barCheck} aria-label="your pick">
                          ✓ your pick
                        </span>
                      )}
                    </span>
                    <span className={styles.barPercent}>{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {takeaway && <p className={styles.takeaway}>{takeaway}</p>}

          <p className={styles.totalRow}>
            {total.toLocaleString()} {total === 1 ? 'vote' : 'votes'}
          </p>
        </>
      )}

      {error && <p className={styles.errorRow}>{error}</p>}
    </div>
  );
}
