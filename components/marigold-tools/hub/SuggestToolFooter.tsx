'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import styles from './hub.module.css';

export function SuggestToolFooter() {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'sent'>('idle');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim() || state === 'submitting') return;
    setState('submitting');
    // Local-only acknowledgment until the suggest endpoint exists.
    setTimeout(() => {
      setState('sent');
      setValue('');
    }, 350);
  }

  return (
    <section className={styles.suggestSection}>
      <div className={styles.suggestInner}>
        <span className={styles.suggestEyebrow}>something missing?</span>
        <h2 className={styles.suggestTitle}>
          Tell us what you wish <em>existed.</em>
        </h2>
        <p className={styles.suggestSub}>
          We add new tools every week. Your idea might be next.
        </p>

        <form className={styles.suggestForm} onSubmit={handleSubmit} aria-label="Suggest a tool">
          <input
            className={styles.suggestInput}
            type="text"
            placeholder="A tool that calculates…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={state === 'submitting'}
            aria-label="Tool suggestion"
          />
          <button
            type="submit"
            className={styles.suggestButton}
            disabled={state === 'submitting' || !value.trim()}
          >
            {state === 'submitting' ? 'Sending…' : 'Submit →'}
          </button>
        </form>

        {state === 'sent' && (
          <span className={styles.suggestSuccess}>got it — thank you!</span>
        )}

        <p className={styles.suggestSecondary}>
          Or{' '}
          <Link href="/signup" className={styles.suggestSecondaryLink}>
            start planning your wedding →
          </Link>
        </p>
      </div>
    </section>
  );
}
