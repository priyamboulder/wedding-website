'use client';

import { useState, type FormEvent } from 'react';
import styles from './WaitlistForm.module.css';

type WaitlistOption = {
  slug: string;
  label: string;
};

type WaitlistFormProps = {
  options: WaitlistOption[];
  defaultSlug?: string;
  source?: string;
  placeholder?: string;
  cta?: string;
};

type Status = 'idle' | 'submitting' | 'ok' | 'error';

export function WaitlistForm({
  options,
  defaultSlug,
  source = 'tools_hub',
  placeholder = 'your@email.com',
  cta = 'Tell me when',
}: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [slug, setSlug] = useState(defaultSlug ?? options[0]?.slug ?? '');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !slug || status === 'submitting') return;

    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/tools/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_slug: slug, email, source }),
      });
      const json = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        error?: string;
      };
      if (!response.ok || !json.ok) {
        throw new Error(json.error ?? 'Could not save your email.');
      }
      setStatus('ok');
      setMessage(
        json.alreadySubscribed
          ? "you're already on the list, friend ✿"
          : "you're in — we'll holler when it drops",
      );
      setEmail('');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Something went wrong.';
      setStatus('error');
      setMessage(text);
    }
  };

  const showSelect = options.length > 1;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <input
          type="email"
          className={styles.input}
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email"
        />
        {showSelect && (
          <select
            className={styles.select}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            aria-label="Which tool"
          >
            {options.map((opt) => (
              <option key={opt.slug} value={opt.slug}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        <button
          type="submit"
          className={styles.button}
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Saving…' : cta}
        </button>
      </div>
      <div
        className={[styles.message, status === 'error' ? styles.messageError : '']
          .filter(Boolean)
          .join(' ')}
        aria-live="polite"
      >
        {message}
      </div>
    </form>
  );
}
