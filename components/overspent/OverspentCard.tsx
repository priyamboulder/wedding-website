'use client';

import { useMemo, useState } from 'react';
import {
  formatAmount,
  formatAttribution,
  type OverspentSubmissionWithVotes,
  type OverspentVote,
} from '@/types/overspent';
import { supabaseBrowser } from '@/lib/supabase/browser-client';
import styles from './OverspentCard.module.css';

interface Props {
  submission: OverspentSubmissionWithVotes;
  myVote: OverspentVote | null;
  onVoted: (
    id: string,
    vote: OverspentVote,
    counts: { agree_count: number; disagree_count: number },
  ) => void;
}

function getFingerprint(): string {
  if (typeof window === 'undefined') return '';
  const KEY = 'overspent_fp';
  let fp = window.localStorage.getItem(KEY);
  if (!fp) {
    fp = `fp_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    window.localStorage.setItem(KEY, fp);
  }
  return fp;
}

async function getAuthToken(): Promise<string | null> {
  try {
    const { data } = await supabaseBrowser.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export function OverspentCard({ submission, myVote, onVoted }: Props) {
  const [busy, setBusy] = useState(false);
  const [localVote, setLocalVote] = useState<OverspentVote | null>(myVote);
  const [counts, setCounts] = useState({
    agree_count: submission.agree_count,
    disagree_count: submission.disagree_count,
  });

  const total = counts.agree_count + counts.disagree_count;
  const agreePct = total === 0 ? 0 : Math.round((counts.agree_count / total) * 100);
  const disagreePct = total === 0 ? 0 : 100 - agreePct;

  const verdictClass =
    submission.verdict === 'worth_it' ? styles.worth_it : styles.overspent;

  const stampClass =
    submission.verdict === 'worth_it' ? styles.stampWorth : styles.stampOver;
  const stampLabel =
    submission.verdict === 'worth_it' ? 'Worth Every Penny' : 'Overspent';

  const attribution = useMemo(() => formatAttribution(submission), [submission]);

  const handleVote = async (vote: OverspentVote) => {
    if (busy || localVote) return;
    setBusy(true);
    const token = await getAuthToken();
    const fp = getFingerprint();
    try {
      const res = await fetch('/api/overspent/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          submission_id: submission.id,
          vote,
          fingerprint: token ? undefined : fp,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.ok || json?.alreadyVoted) {
        const recordedVote = (json.vote ?? vote) as OverspentVote;
        const next = {
          agree_count: json.agree_count ?? counts.agree_count,
          disagree_count: json.disagree_count ?? counts.disagree_count,
        };
        setLocalVote(recordedVote);
        setCounts(next);
        onVoted(submission.id, recordedVote, next);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`${styles.card} ${verdictClass}`}>
      <span className={styles.tag}>Overspent or Worth It?</span>

      <h3 className={styles.splurge}>{submission.splurge_item}</h3>

      <div className={styles.amountRow}>
        {submission.amount_hidden || submission.amount === null ? (
          <span className={styles.amountHidden}>Amount kept private</span>
        ) : (
          <span className={styles.amount}>{formatAmount(submission.amount)}</span>
        )}
        <span className={`${styles.stamp} ${stampClass}`}>{stampLabel}</span>
      </div>

      <p className={styles.explanation}>"{submission.explanation}"</p>

      {attribution && <span className={styles.attribution}>{attribution}</span>}

      <div className={styles.poll}>
        <span className={styles.pollPrompt}>Do you agree?</span>
        {localVote ? (
          <div className={styles.results}>
            <span className={styles.resultLabel}>Agree {agreePct}%</span>
            <div className={styles.bar}>
              <div
                className={styles.barFill}
                style={{ width: `${agreePct}%` }}
                aria-hidden="true"
              />
            </div>
            <span className={styles.resultLabel}>Disagree {disagreePct}%</span>
          </div>
        ) : (
          <div className={styles.pollRow}>
            <button
              type="button"
              className={styles.voteBtn}
              onClick={() => handleVote('agree')}
              disabled={busy}
            >
              Agree
            </button>
            <button
              type="button"
              className={styles.voteBtn}
              onClick={() => handleVote('disagree')}
              disabled={busy}
            >
              Disagree
            </button>
          </div>
        )}
        {localVote && (
          <span className={styles.attribution}>
            You voted {localVote === 'agree' ? 'Agree' : 'Disagree'} · {total}{' '}
            {total === 1 ? 'reader' : 'readers'}
          </span>
        )}
      </div>
    </article>
  );
}
