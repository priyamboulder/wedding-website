'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser-client';
import {
  EXPLANATION_MAX,
  SPLURGE_ITEM_MAX,
  type OverspentRole,
  type OverspentVerdict,
} from '@/types/overspent';
import styles from './SubmitOverspentModal.module.css';

interface Props {
  authed: boolean;
  onClose: () => void;
}

async function getAuthToken(): Promise<string | null> {
  try {
    const { data } = await supabaseBrowser.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export function SubmitOverspentModal({ authed, onClose }: Props) {
  const [splurge, setSplurge] = useState('');
  const [amount, setAmount] = useState('');
  const [amountHidden, setAmountHidden] = useState(false);
  const [verdict, setVerdict] = useState<OverspentVerdict | null>(null);
  const [explanation, setExplanation] = useState('');
  const [role, setRole] = useState<OverspentRole | ''>('');
  const [guests, setGuests] = useState('');
  const [city, setCity] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const tooLong = explanation.length > EXPLANATION_MAX;
  const canSubmit =
    !busy &&
    splurge.trim().length > 0 &&
    splurge.length <= SPLURGE_ITEM_MAX &&
    verdict !== null &&
    explanation.trim().length > 0 &&
    !tooLong;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setBusy(true);
    const token = await getAuthToken();
    try {
      const res = await fetch('/api/overspent/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          splurge_item: splurge.trim(),
          amount: amountHidden ? null : amount === '' ? null : Number(amount),
          amount_hidden: amountHidden,
          verdict,
          explanation: explanation.trim(),
          role: role || undefined,
          guest_count: guests === '' ? undefined : Number(guests),
          city: city.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? 'Could not submit. Please try again.');
        setBusy(false);
        return;
      }
      setSuccess(true);
      setBusy(false);
    } catch {
      setError('Network error.');
      setBusy(false);
    }
  };

  if (!authed) {
    return (
      <div
        className={styles.backdrop}
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <div className={styles.eyebrow}>Share Your Splurge</div>
          <h2 className={styles.title}>
            Sign in to share <i>your splurge.</i>
          </h2>
          <p className={styles.sub}>
            Submissions live inside The Marigold. Sign up free, then come back
            and tell us what was worth it — and what wasn't.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={onClose}
            >
              maybe later
            </button>
            <a className={styles.submit} href="/pricing">
              Sign Up Free
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div
        className={styles.backdrop}
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <div className={styles.successWrap}>
            <div className={styles.eyebrow}>Submission Received</div>
            <h2 className={styles.successTitle}>
              Thanks for spilling.
            </h2>
            <p className={styles.successBody}>
              Your splurge is in our review queue. Approved entries land in the
              Editorial feed within a few days — we'll email you when yours
              goes live.
            </p>
            <button
              type="button"
              className={styles.submit}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className={styles.eyebrow}>Overspent or Worth It?</div>
        <h2 className={styles.title}>
          Share your <i>splurge.</i>
        </h2>
        <p className={styles.sub}>
          Tell us what you spent on, what it cost, and whether you'd do it
          again. Approved entries appear in the Editorial feed.
        </p>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ovs-splurge">
            What did you splurge on?
          </label>
          <input
            id="ovs-splurge"
            className={styles.input}
            type="text"
            maxLength={SPLURGE_ITEM_MAX}
            value={splurge}
            onChange={(e) => setSplurge(e.target.value)}
            placeholder="e.g. Live shehnai player during pheras"
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>How much?</span>
          <div className={styles.amountRow}>
            <div className={styles.amountWrap}>
              <input
                className={`${styles.input} ${styles.amountInput}`}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                disabled={amountHidden}
              />
            </div>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={amountHidden}
                onChange={(e) => setAmountHidden(e.target.checked)}
              />
              Prefer not to say
            </label>
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Worth it or overspent?</span>
          <div className={styles.verdictRow}>
            <button
              type="button"
              className={`${styles.verdictBtn} ${
                verdict === 'worth_it'
                  ? `${styles.verdictBtnActive} ${styles.verdictWorthActive}`
                  : ''
              }`}
              onClick={() => setVerdict('worth_it')}
              aria-pressed={verdict === 'worth_it'}
            >
              Worth Every Penny
            </button>
            <button
              type="button"
              className={`${styles.verdictBtn} ${
                verdict === 'overspent'
                  ? `${styles.verdictBtnActive} ${styles.verdictOverActive}`
                  : ''
              }`}
              onClick={() => setVerdict('overspent')}
              aria-pressed={verdict === 'overspent'}
            >
              Honestly? Overspent
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ovs-explain">
            Tell us why in one sentence
          </label>
          <textarea
            id="ovs-explain"
            className={styles.textarea}
            maxLength={EXPLANATION_MAX + 50}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="The honest, one-sentence version."
          />
          <span
            className={`${styles.charCount} ${
              tooLong ? styles.charCountOver : ''
            }`}
          >
            {explanation.length} / {EXPLANATION_MAX}
          </span>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ovs-role">
            Your role
          </label>
          <select
            id="ovs-role"
            className={styles.select}
            value={role}
            onChange={(e) => setRole(e.target.value as OverspentRole | '')}
          >
            <option value="">Choose one…</option>
            <option value="bride">Bride</option>
            <option value="groom">Groom</option>
            <option value="parent">Parent</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ovs-guests">
            Approximate guest count
          </label>
          <input
            id="ovs-guests"
            className={styles.input}
            type="number"
            min={0}
            inputMode="numeric"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="e.g. 200"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ovs-city">
            City
          </label>
          <input
            id="ovs-city"
            className={styles.input}
            type="text"
            maxLength={80}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Dallas"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            cancel
          </button>
          <button
            type="button"
            className={styles.submit}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {busy ? 'Submitting…' : 'Submit For Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
