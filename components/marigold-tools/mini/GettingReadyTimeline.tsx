'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './GettingReadyTimeline.module.css';

type Role = 'bride' | 'groom';
type Complexity = 'minimal' | 'standard' | 'full';

const ROLE_LABELS: Record<Role, string> = {
  bride: 'Bride',
  groom: 'Groom',
};

const COMPLEXITY_LABELS: Record<Complexity, string> = {
  minimal: 'Minimal — small ceremony, simple look',
  standard: 'Standard — typical Indian ceremony',
  full: 'Full — heavy lehenga, elaborate jewelry, full bridal hair & makeup',
};

// Each item is a duration in minutes. They stack backward from ceremony time.
type Item = { task: string; minutes: number; note?: string };

function buildSchedule(role: Role, complexity: Complexity, hasFamily: boolean, hasBridalParty: boolean): Item[] {
  const items: Item[] = [];

  // Buffer at the end (between final touches and ceremony start)
  items.push({ task: 'Travel + first looks at venue', minutes: 30, note: 'Photos with bridal party + family on arrival.' });
  items.push({ task: 'Final touch-ups + bathroom break', minutes: 15 });
  items.push({ task: 'Bridal portraits / detail shots', minutes: 30, note: 'Photographer captures jewelry, shoes, outfit details.' });

  if (role === 'bride') {
    if (complexity === 'full') {
      items.push({ task: 'Outfit (lehenga / sari)', minutes: 60, note: 'Heavy outfits take time. Have help.' });
      items.push({ task: 'Jewelry — earrings, necklace, maang tikka, nath', minutes: 30 });
      items.push({ task: 'Hair styling', minutes: 75, note: 'Includes setting kalire / dupatta if attached.' });
      items.push({ task: 'Makeup — full bridal', minutes: 90, note: 'Lashes, base, eye, and lip layered slowly.' });
      items.push({ task: 'Skincare prep + hair blowout', minutes: 30 });
      items.push({ task: 'Light breakfast + tea', minutes: 30, note: 'Eat. You will not eat again for hours.' });
      items.push({ task: 'Shower + body lotion', minutes: 30 });
    } else if (complexity === 'standard') {
      items.push({ task: 'Outfit (lehenga / sari)', minutes: 45 });
      items.push({ task: 'Jewelry — earrings, necklace, set', minutes: 20 });
      items.push({ task: 'Hair styling', minutes: 60 });
      items.push({ task: 'Makeup — bridal', minutes: 75 });
      items.push({ task: 'Skincare prep', minutes: 20 });
      items.push({ task: 'Light breakfast + tea', minutes: 25 });
      items.push({ task: 'Shower + body lotion', minutes: 25 });
    } else {
      items.push({ task: 'Outfit', minutes: 30 });
      items.push({ task: 'Jewelry', minutes: 15 });
      items.push({ task: 'Hair styling', minutes: 45 });
      items.push({ task: 'Makeup', minutes: 60 });
      items.push({ task: 'Light breakfast', minutes: 20 });
      items.push({ task: 'Shower', minutes: 20 });
    }
  } else {
    if (complexity === 'full') {
      items.push({ task: 'Sherwani + safa / pagri', minutes: 30, note: 'Tying the safa takes longer than you think.' });
      items.push({ task: 'Jewelry / kalgi / sehra', minutes: 15 });
      items.push({ task: 'Grooming touch-ups + hair', minutes: 30 });
      items.push({ task: 'Light groom makeup / skincare', minutes: 25 });
      items.push({ task: 'Breakfast', minutes: 25 });
      items.push({ task: 'Shower + shave', minutes: 30 });
    } else {
      items.push({ task: 'Sherwani + safa', minutes: 25 });
      items.push({ task: 'Hair + grooming', minutes: 25 });
      items.push({ task: 'Skincare / light makeup', minutes: 15 });
      items.push({ task: 'Breakfast', minutes: 20 });
      items.push({ task: 'Shower + shave', minutes: 25 });
    }
  }

  if (hasFamily) {
    items.push({ task: 'Family blessings + parents see you ready', minutes: 20, note: 'Plan for tears. Photos here are gold.' });
  }
  if (hasBridalParty) {
    items.push({ task: 'Bridal party getting ready (in same room)', minutes: 0, note: 'Runs in parallel — start them 90 min before you finish makeup.' });
  }

  return items;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatTime(date: Date): string {
  const hr = date.getHours();
  const min = date.getMinutes();
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const h = ((hr + 11) % 12) + 1;
  return `${h}:${pad(min)} ${ampm}`;
}

function parseTime(value: string): Date | null {
  if (!value) return null;
  const [h, m] = value.split(':').map((s) => parseInt(s, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function GettingReadyTimeline() {
  const [ceremonyTime, setCeremonyTime] = useState('11:00');
  const [role, setRole] = useState<Role>('bride');
  const [complexity, setComplexity] = useState<Complexity>('standard');
  const [hasFamily, setHasFamily] = useState(true);
  const [hasBridalParty, setHasBridalParty] = useState(true);

  const items = useMemo(
    () => buildSchedule(role, complexity, hasFamily, hasBridalParty),
    [role, complexity, hasFamily, hasBridalParty],
  );

  const schedule = useMemo(() => {
    const target = parseTime(ceremonyTime);
    if (!target) return null;
    // items are in reverse-chronological order. We start at target and walk
    // backward, assigning a start time to each item.
    let cursor = new Date(target);
    const rows: { task: string; startsAt: Date; minutes: number; note?: string }[] = [];
    for (const item of items) {
      const start = new Date(cursor.getTime() - item.minutes * 60000);
      rows.push({ task: item.task, startsAt: start, minutes: item.minutes, note: item.note });
      cursor = start;
    }
    rows.reverse();
    return { rows, wakeUp: rows[0]?.startsAt ?? null };
  }, [items, ceremonyTime]);

  return (
    <MiniToolShell
      name="Getting-Ready Timeline"
      tagline="what time does the bride wake up?"
      estimatedTime="1 min"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="gr-time">
            Ceremony start time
          </label>
          <input
            id="gr-time"
            type="time"
            className={primitives.input}
            value={ceremonyTime}
            onChange={(e) => setCeremonyTime(e.target.value)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="gr-role">
            Who&apos;s getting ready?
          </label>
          <select
            id="gr-role"
            className={primitives.select}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="gr-complex">
          Complexity
        </label>
        <select
          id="gr-complex"
          className={primitives.select}
          value={complexity}
          onChange={(e) => setComplexity(e.target.value as Complexity)}
        >
          {(Object.keys(COMPLEXITY_LABELS) as Complexity[]).map((c) => (
            <option key={c} value={c}>
              {COMPLEXITY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.toggleRow}>
        <label
          className={`${primitives.checkboxLabel} ${
            hasFamily ? primitives.checkboxLabelChecked : ''
          }`}
        >
          <input
            type="checkbox"
            className={primitives.checkbox}
            checked={hasFamily}
            onChange={(e) => setHasFamily(e.target.checked)}
          />
          Family blessings included
        </label>
        <label
          className={`${primitives.checkboxLabel} ${
            hasBridalParty ? primitives.checkboxLabelChecked : ''
          }`}
        >
          <input
            type="checkbox"
            className={primitives.checkbox}
            checked={hasBridalParty}
            onChange={(e) => setHasBridalParty(e.target.checked)}
          />
          Bridal party in same room
        </label>
      </div>

      <AnimatePresence mode="wait">
        {schedule && (
          <motion.div
            key={`${role}-${complexity}-${ceremonyTime}-${hasFamily}-${hasBridalParty}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>wake-up time</span>
            <p className={styles.wakeUp}>
              {schedule.wakeUp ? formatTime(schedule.wakeUp) : '—'}
            </p>
            <p className={primitives.resultBody}>
              Set your alarm 15 minutes earlier than this. Coffee, water,
              breathing room — you will need it.
            </p>

            <ul className={styles.list}>
              {schedule.rows.map((r, idx) => (
                <li key={`${r.task}-${idx}`} className={styles.item}>
                  <span className={styles.time}>{formatTime(r.startsAt)}</span>
                  <span className={styles.task}>
                    <span className={styles.taskName}>{r.task}</span>
                    {r.minutes > 0 && (
                      <span className={styles.duration}>{r.minutes} min</span>
                    )}
                    {r.note && <span className={styles.note}>{r.note}</span>}
                  </span>
                </li>
              ))}
              <li className={`${styles.item} ${styles.itemFinal}`}>
                <span className={styles.time}>
                  {(() => {
                    const t = parseTime(ceremonyTime);
                    return t ? formatTime(t) : '—';
                  })()}
                </span>
                <span className={styles.task}>
                  <span className={styles.taskName}>Ceremony begins</span>
                </span>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
