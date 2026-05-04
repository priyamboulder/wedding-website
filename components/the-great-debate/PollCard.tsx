'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser-client';
import type { PollWithCounts } from '@/lib/polls/archive';
import styles from './PollCard.module.css';

interface Props {
  poll: PollWithCounts;
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

function typeBadge(pollType: PollWithCounts['poll_type'], optionCount: number): string | null {
  if (pollType === 'settle_this') return 'Settle This 🔥';
  if (pollType === 'would_you') return 'Would You?';
  if (pollType === 'three_way' || optionCount >= 3) return 'Three-Way †';
  return null;
}

const CATEGORY_LABEL: Record<string, string> = {
  ceremony_traditions: 'Ceremony & Traditions',
  guest_experience: 'Guest Experience',
  food_drinks: 'Food & Drinks',
  fashion_beauty: 'Fashion & Beauty',
  photography_video: 'Photography & Video',
  music_entertainment: 'Music & Entertainment',
  decor_venue: 'Décor & Venue',
  budget_planning: 'Budget & Planning',
  family_dynamics: 'Family Dynamics',
  honeymoon_post_wedding: 'Honeymoon',
  invitations_communication: 'Invitations',
  modern_vs_traditional: 'Modern vs Traditional',
  spicy_hot_takes: 'Spicy Hot Takes',
  would_you_ever: 'Would You Ever',
  this_or_that: 'This or That',
};

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M8 11l8-4M8 13l8 4" strokeLinecap="round" />
    </svg>
  );
}

export function PollCard({ poll }: Props) {
  const [counts, setCounts] = useState<number[]>(poll.counts);
  const [total, setTotal] = useState<number>(poll.total);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBars, setShowBars] = useState(false);
  const [copied, setCopied] = useState(false);
  const fingerprintRef = useRef<string>('');

  useEffect(() => {
    fingerprintRef.current = getFingerprint();
    const stored = window.localStorage.getItem(votedKey(poll.id));
    if (stored !== null) {
      const idx = Number(stored);
      if (Number.isFinite(idx) && idx >= 0 && idx < poll.options.length) {
        setVotedIndex(idx);
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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/the-great-debate#poll-${poll.id}`;
    const shareData = { title: poll.question, text: poll.question, url: shareUrl };
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // Fall through to clipboard.
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Final fallback — leave a hint inline.
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const showResults = votedIndex !== null;
  const isThreeWay = poll.poll_type === 'three_way' || poll.options.length >= 3;
  const badge = typeBadge(poll.poll_type, poll.options.length);
  const categoryLabel = CATEGORY_LABEL[poll.category] ?? poll.category;

  return (
    <article id={`poll-${poll.id}`} className={styles.card}>
      <div className={styles.headerRow}>
        <div className={styles.tagRow}>
          <span className={styles.cat}>{categoryLabel}</span>
          {badge && <span className={styles.typeBadge}>{badge}</span>}
          {poll.is_controversial && (
            <span className={styles.controversialBadge} aria-label="Controversial">
              ⚡ Controversial
            </span>
          )}
        </div>
        <button
          type="button"
          className={`${styles.shareBtn} ${copied ? styles.shareBtnCopied : ''}`}
          onClick={handleShare}
          aria-label="Share this debate"
        >
          {copied ? <span className={styles.shareCopied}>✓</span> : <ShareIcon />}
        </button>
      </div>

      <h3 className={styles.question}>{poll.question}</h3>

      {!showResults && (
        <div
          className={`${styles.options} ${isThreeWay ? styles.optionsThree : ''}`}
        >
          {poll.options.map((option, i) => (
            <button
              key={i}
              type="button"
              className={styles.optionBtn}
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
                          ✓
                        </span>
                      )}
                    </span>
                    <span
                      className={`${styles.barPercent} ${
                        isWinning && percent >= 80 ? styles.barPercentOnFill : ''
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
            {total.toLocaleString()} {total === 1 ? 'vote' : 'votes'}
          </p>
        </>
      )}

      {error && <p className={styles.errorRow}>{error}</p>}
    </article>
  );
}
