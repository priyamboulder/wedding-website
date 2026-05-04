'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './InvitationTimeline.module.css';

type Mode = 'physical' | 'digital' | 'both';

const MODE_LABELS: Record<Mode, string> = {
  physical: 'Physical only',
  digital: 'Digital only',
  both: 'Both physical & digital',
};

type Milestone = {
  label: string;
  weeksBefore: number;
  note: string;
  // Some milestones only apply to physical/digital flows.
  applies?: (mode: Mode) => boolean;
};

function buildMilestones(destination: boolean): Milestone[] {
  return [
    {
      label: 'Save-the-date sent',
      weeksBefore: destination ? 52 : 40,
      note: destination
        ? 'Destination weddings need a year of runway so guests can book travel.'
        : 'Eight to twelve months out is the sweet spot.',
    },
    {
      label: 'Invitation design finalized',
      weeksBefore: 20,
      note: 'Lock copy, fonts, and any custom artwork. Last chance for changes.',
    },
    {
      label: 'Print production starts',
      weeksBefore: 16,
      note: 'Allow 3–4 weeks for print, foiling, and assembly.',
      applies: (m) => m !== 'digital',
    },
    {
      label: 'Mail invitations / send digital',
      weeksBefore: destination ? 12 : 9,
      note: destination
        ? 'Twelve weeks lets out-of-town guests book flights.'
        : 'Eight to ten weeks is standard.',
    },
    {
      label: 'RSVP deadline',
      weeksBefore: 5,
      note: "Give people enough time to chase the slow ones, but don't let it stretch past 4–5 weeks.",
    },
    {
      label: 'Follow-up non-responders',
      weeksBefore: 3,
      note: 'A WhatsApp message is fine. Mention catering counts so it feels like logistics, not pressure.',
    },
    {
      label: 'Final headcount to caterer & venue',
      weeksBefore: 2,
      note: 'After this, you are paying for any later additions or absent guests.',
    },
  ];
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function offsetWeeks(weddingISO: string, weeks: number): Date | null {
  if (!weddingISO) return null;
  const [y, m, d] = weddingISO.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - weeks * 7);
  return date;
}

export function InvitationTimeline() {
  const [wedding, setWedding] = useState<string>('');
  const [destination, setDestination] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>('both');

  const milestones = useMemo(() => {
    if (!wedding) return null;
    const all = buildMilestones(destination);
    return all
      .filter((m) => (m.applies ? m.applies(mode) : true))
      .map((m) => ({
        ...m,
        date: offsetWeeks(wedding, m.weeksBefore),
      }))
      .filter((m): m is Milestone & { date: Date } => m.date !== null);
  }, [wedding, destination, mode]);

  return (
    <MiniToolShell
      name="Invitation Timeline Calculator"
      tagline="when should you send what?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="it-wedding">
          Wedding date
        </label>
        <input
          id="it-wedding"
          type="date"
          className={primitives.input}
          value={wedding}
          onChange={(e) => setWedding(e.target.value)}
        />
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="it-mode">
          Invitation type
        </label>
        <select
          id="it-mode"
          className={primitives.select}
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
        >
          {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
            <option key={m} value={m}>
              {MODE_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      <label
        className={`${primitives.checkboxLabel} ${
          destination ? primitives.checkboxLabelChecked : ''
        }`}
        style={{ marginBottom: 22 }}
      >
        <input
          type="checkbox"
          className={primitives.checkbox}
          checked={destination}
          onChange={(e) => setDestination(e.target.checked)}
        />
        Destination wedding (extra runway)
      </label>

      <AnimatePresence>
        {milestones && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>
              your invitation timeline
            </span>
            <p className={primitives.resultLabel}>
              Working backward from {fmtDate(new Date(wedding + 'T00:00'))}.
            </p>

            <ol className={styles.timeline}>
              {milestones.map((m) => (
                <li key={m.label} className={styles.item}>
                  <div className={styles.dot} />
                  <div className={styles.itemBody}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemDate}>{fmtDate(m.date)}</span>
                      <span className={styles.itemWeeks}>
                        {m.weeksBefore} wk before
                      </span>
                    </div>
                    <h3 className={styles.itemLabel}>{m.label}</h3>
                    <p className={styles.itemNote}>{m.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
