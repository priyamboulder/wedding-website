'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import styles from './LeadCaptureModal.module.css';

type LeadCaptureModalProps = {
  vendorId: string;
  vendorName: string;
  sourceTool: string;
  context?: Record<string, unknown>;
  open: boolean;
  onClose: () => void;
};

type Status = 'idle' | 'submitting' | 'ok' | 'error';

export function LeadCaptureModal({
  vendorId,
  vendorName,
  sourceTool,
  context,
  open,
  onClose,
}: LeadCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    setTimeout(() => firstFieldRef.current?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || status === 'submitting') return;
    setStatus('submitting');
    setErrorMsg('');

    const payload = {
      vendor_id: vendorId,
      source_tool: sourceTool,
      email,
      context: {
        ...(context ?? {}),
        name: name || undefined,
        wedding_date: weddingDate || undefined,
        guest_count: guestCount ? Number(guestCount) : undefined,
        notes: notes || undefined,
      },
    };

    try {
      const res = await fetch('/api/tools/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? 'Could not send your inquiry.');
      }
      setStatus('ok');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Something went wrong.';
      setStatus('error');
      setErrorMsg(text);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={handleBackdrop}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-capture-title"
        className={styles.dialog}
      >
        <button
          type="button"
          aria-label="Close"
          className={styles.closeBtn}
          onClick={onClose}
        >
          ×
        </button>

        {status === 'ok' ? (
          <div className={styles.success}>
            <span className={styles.scrawl}>sent ✿</span>
            <h2 id="lead-capture-title" className={styles.successHeading}>
              they&apos;ll be in touch <em>within 48 hours</em>
            </h2>
            <p className={styles.successBody}>
              {vendorName} has your details. We&apos;ll save this to your account if you want it —
              one click and your shortlist follows you everywhere.
            </p>
            <div className={styles.successActions}>
              <Link href="/signup" className={styles.primaryBtn}>
                Save to my account
              </Link>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={onClose}
              >
                Keep browsing
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className={styles.scrawl}>say hi</span>
            <h2 id="lead-capture-title" className={styles.heading}>
              Tell <em>{vendorName}</em> you&apos;re interested
            </h2>
            <p className={styles.sub}>
              They&apos;ll get a single warm intro. No spam, no auto-DMs — just a heads up that
              someone planning a wedding wants to talk.
            </p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <label className={styles.field}>
                <span className={styles.label}>email *</span>
                <input
                  ref={firstFieldRef}
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@somewhere.com"
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>your name</span>
                <input
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="optional"
                />
              </label>

              <div className={styles.row}>
                <label className={`${styles.field} ${styles.fieldHalf}`}>
                  <span className={styles.label}>wedding date</span>
                  <input
                    type="date"
                    className={styles.input}
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                  />
                </label>
                <label className={`${styles.field} ${styles.fieldHalf}`}>
                  <span className={styles.label}>guests</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className={styles.input}
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="approx"
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>anything to share?</span>
                <textarea
                  className={styles.textarea}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="optional — vibe, dates, must-haves"
                />
              </label>

              {status === 'error' && (
                <div className={styles.errorMsg} role="alert">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className={styles.submit}
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Sending…' : 'Send →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
