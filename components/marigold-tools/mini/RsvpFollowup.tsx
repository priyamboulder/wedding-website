'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './RsvpFollowup.module.css';

type Step = {
  label: string;
  daysFromDeadline: number;
  why: string;
  template?: string;
};

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function offsetDays(iso: string, days: number): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return date;
}

const TEMPLATES = {
  gentle:
    'Hey [Name]! Just a friendly reminder that our RSVP deadline is [date]. Hope to see you celebrate with us! 💛',
  deadline:
    'Hi [Name]! Today\'s the RSVP deadline for our wedding. Just need a quick yes or no for catering counts — no pressure, but really hope you can make it!',
  direct:
    "Hey [Name]! Just following up on our wedding RSVP — we'd love to have you there. Can you let us know by [date] so we can finalize our count? 💛",
  final:
    "Hi [Name] — final ping! We need to give the venue a count by [date]. If we don't hear back, we'll mark you as not attending so we don't keep a seat empty. No hard feelings either way!",
};

export function RsvpFollowup() {
  const [deadline, setDeadline] = useState<string>('');
  const [wedding, setWedding] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);

  const steps: (Step & { date: Date })[] | null = useMemo(() => {
    if (!deadline) return null;
    const list: Step[] = [
      {
        label: '1 week before deadline',
        daysFromDeadline: -7,
        why: 'Gentle reminder to non-responders. Text or WhatsApp is fine.',
        template: TEMPLATES.gentle,
      },
      {
        label: 'On deadline',
        daysFromDeadline: 0,
        why: 'Note who hasn\'t responded. Send a same-day reminder to the holdouts.',
        template: TEMPLATES.deadline,
      },
      {
        label: '3 days after deadline',
        daysFromDeadline: 3,
        why: 'Direct call or text. Frame it as logistics, not pressure.',
        template: TEMPLATES.direct,
      },
      {
        label: '1 week after deadline',
        daysFromDeadline: 7,
        why: 'Final chase. If no response, assume not attending for catering — but keep their name on the list as a courtesy.',
        template: TEMPLATES.final,
      },
    ];

    if (wedding) {
      // Final count to vendor: 2 weeks before wedding
      const weddingDate = offsetDays(wedding, 0);
      const deadlineDate = offsetDays(deadline, 0);
      if (weddingDate && deadlineDate) {
        const finalDate = new Date(weddingDate);
        finalDate.setDate(finalDate.getDate() - 14);
        const daysFromDeadline = Math.round(
          (finalDate.getTime() - deadlineDate.getTime()) / 86_400_000,
        );
        list.push({
          label: '2 weeks before wedding',
          daysFromDeadline,
          why: 'Final count to caterer and venue. After this, you pay for empty seats.',
        });
      }
    }

    return list
      .map((s) => ({
        ...s,
        date: offsetDays(deadline, s.daysFromDeadline)!,
      }))
      .filter((s) => s.date)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [deadline, wedding]);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      // Clipboard blocked
    }
  }

  return (
    <MiniToolShell
      name="RSVP Follow-Up Timer"
      tagline="when to chase RSVPs without being annoying"
      estimatedTime="30 sec"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="rs-deadline">
            RSVP deadline
          </label>
          <input
            id="rs-deadline"
            type="date"
            className={primitives.input}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="rs-wedding">
            Wedding date (optional)
          </label>
          <input
            id="rs-wedding"
            type="date"
            className={primitives.input}
            value={wedding}
            onChange={(e) => setWedding(e.target.value)}
          />
        </div>
      </div>

      <AnimatePresence>
        {steps && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>your follow-up plan</span>
            <p className={primitives.resultLabel}>
              Tap a template to copy. Replace [Name] and [date] before sending.
            </p>

            <ol className={styles.stepList}>
              {steps.map((s) => (
                <li key={s.label} className={styles.stepItem}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepDate}>{fmtDate(s.date)}</span>
                    <span className={styles.stepTag}>{s.label}</span>
                  </div>
                  <p className={styles.stepWhy}>{s.why}</p>
                  {s.template && (
                    <button
                      type="button"
                      onClick={() => copy(s.template!, s.label)}
                      className={styles.templateBtn}
                    >
                      <span className={styles.templateText}>{s.template}</span>
                      <span className={styles.copyBadge}>
                        {copied === s.label ? 'copied!' : 'copy'}
                      </span>
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
