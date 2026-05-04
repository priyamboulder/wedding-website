'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './DayOfTimeline.module.css';

const ACTIVITIES = [
  { key: 'getting-ready', label: 'Getting ready' },
  { key: 'baraat', label: 'Baraat' },
  { key: 'ceremony', label: 'Ceremony', required: true },
  { key: 'cocktail', label: 'Cocktail hour' },
  { key: 'reception', label: 'Reception' },
  { key: 'after-party', label: 'After party' },
] as const;

const CEREMONIES = [
  { key: 'hindu-north', label: 'Hindu — North Indian', mins: 120 },
  { key: 'hindu-south', label: 'Hindu — South Indian', mins: 150 },
  { key: 'sikh', label: 'Sikh — Anand Karaj', mins: 105 },
  { key: 'muslim', label: 'Muslim — Nikah', mins: 60 },
  { key: 'christian', label: 'Christian / Western', mins: 40 },
  { key: 'fusion', label: 'Interfaith / fusion', mins: 90 },
] as const;

type Activity = (typeof ACTIVITIES)[number]['key'];
type CeremonyKey = (typeof CEREMONIES)[number]['key'];

type Block = {
  startMin: number;
  durationMin: number;
  label: string;
  detail?: string;
};

function buildTimeline(
  selected: Set<Activity>,
  ceremonyMins: number,
  ceremonyStartMin: number,
): Block[] {
  const blocks: Block[] = [];

  if (selected.has('getting-ready')) {
    blocks.push({
      startMin: ceremonyStartMin - 240,
      durationMin: 180,
      label: 'Bride getting ready begins',
      detail: 'Hair, makeup, outfit, jewelry — 3 to 4 hours.',
    });
    blocks.push({
      startMin: ceremonyStartMin - 120,
      durationMin: 90,
      label: 'Groom getting ready begins',
      detail: 'Sherwani, sehra, accessories.',
    });
    blocks.push({
      startMin: ceremonyStartMin - 75,
      durationMin: 45,
      label: 'Couple / family photos',
      detail: 'Optional first-look or pre-ceremony portraits.',
    });
  }

  if (selected.has('baraat')) {
    blocks.push({
      startMin: ceremonyStartMin - 45,
      durationMin: 45,
      label: 'Baraat arrives & milni',
      detail: 'Procession + arrival ceremony with families.',
    });
  }

  // Ceremony itself
  blocks.push({
    startMin: ceremonyStartMin,
    durationMin: ceremonyMins,
    label: 'Ceremony begins',
    detail: 'Pheras, vows, the actual marriage.',
  });

  let cursor = ceremonyStartMin + ceremonyMins;

  if (selected.has('cocktail')) {
    blocks.push({
      startMin: cursor,
      durationMin: 60,
      label: 'Cocktail hour',
      detail: "Couple does outfit change while guests mingle.",
    });
    cursor += 60;
  }

  if (selected.has('reception')) {
    blocks.push({
      startMin: cursor,
      durationMin: 15,
      label: 'Grand entrance',
      detail: 'Doors open, lights drop, song hits.',
    });
    cursor += 15;
    blocks.push({
      startMin: cursor,
      durationMin: 90,
      label: 'Dinner',
      detail: 'Plated or buffet — 90 minutes typical.',
    });
    cursor += 90;
    blocks.push({
      startMin: cursor,
      durationMin: 35,
      label: 'Toasts & speeches',
      detail: '3–5 speeches at ~7 minutes each. Cap them.',
    });
    cursor += 35;
    blocks.push({
      startMin: cursor,
      durationMin: 10,
      label: 'First dance',
      detail: 'Couple, then parents, then open the floor.',
    });
    cursor += 10;
    blocks.push({
      startMin: cursor,
      durationMin: 105,
      label: 'Open dancing',
      detail: '90 minutes to 2 hours of dance floor.',
    });
    cursor += 105;
    blocks.push({
      startMin: cursor,
      durationMin: 15,
      label: 'Send-off',
      detail: 'Sparklers, rose petals, or just a wave goodbye.',
    });
    cursor += 15;
  }

  if (selected.has('after-party')) {
    blocks.push({
      startMin: cursor,
      durationMin: 120,
      label: 'After party',
      detail: 'For the closest 50. Different venue, no expectations.',
    });
  }

  return blocks.sort((a, b) => a.startMin - b.startMin);
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function minutesToTime(min: number): string {
  // Wrap negatives gracefully
  const wrapped = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function DayOfTimeline() {
  const [selected, setSelected] = useState<Set<Activity>>(
    new Set(['getting-ready', 'baraat', 'ceremony', 'cocktail', 'reception']),
  );
  const [ceremonyTime, setCeremonyTime] = useState<string>('17:00');
  const [ceremonyKey, setCeremonyKey] = useState<CeremonyKey>('hindu-north');

  function toggle(a: Activity) {
    if (a === 'ceremony') return; // required
    const next = new Set(selected);
    if (next.has(a)) next.delete(a);
    else next.add(a);
    setSelected(next);
  }

  const blocks = useMemo(() => {
    const ceremony = CEREMONIES.find((c) => c.key === ceremonyKey)!;
    return buildTimeline(selected, ceremony.mins, timeToMinutes(ceremonyTime));
  }, [selected, ceremonyKey, ceremonyTime]);

  return (
    <MiniToolShell
      name="Day-Of Timeline Builder"
      tagline="what time does everything happen?"
      estimatedTime="2 min"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Activities on this day</label>
        <div className={primitives.checkboxGrid}>
          {ACTIVITIES.map((a) => {
            const isLocked = 'required' in a && a.required === true;
            const isOn = selected.has(a.key) || isLocked;
            return (
              <label
                key={a.key}
                className={`${primitives.checkboxLabel} ${
                  isOn ? primitives.checkboxLabelChecked : ''
                } ${isLocked ? styles.locked : ''}`}
              >
                <input
                  type="checkbox"
                  className={primitives.checkbox}
                  checked={isOn}
                  disabled={isLocked}
                  onChange={() => toggle(a.key)}
                />
                {a.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="dot-time">
            Ceremony start time
          </label>
          <input
            id="dot-time"
            type="time"
            className={primitives.input}
            value={ceremonyTime}
            onChange={(e) => setCeremonyTime(e.target.value || '17:00')}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="dot-ceremony">
            Ceremony type
          </label>
          <select
            id="dot-ceremony"
            className={primitives.select}
            value={ceremonyKey}
            onChange={(e) => setCeremonyKey(e.target.value as CeremonyKey)}
          >
            {CEREMONIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${ceremonyTime}-${ceremonyKey}-${selected.size}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>your day-of timeline</span>
          <p className={primitives.resultLabel}>
            Built from your ceremony time. Adjust for travel, family chaos,
            and the inevitable 15-minute slips.
          </p>

          <ol className={styles.tl}>
            {blocks.map((b, idx) => (
              <li key={idx} className={styles.block}>
                <span className={styles.time}>{minutesToTime(b.startMin)}</span>
                <div className={styles.body}>
                  <h3 className={styles.label}>{b.label}</h3>
                  {b.detail && <p className={styles.detail}>{b.detail}</p>}
                  <span className={styles.dur}>
                    {b.durationMin >= 60
                      ? `${(b.durationMin / 60).toFixed(b.durationMin % 60 === 0 ? 0 : 1)} hr`
                      : `${b.durationMin} min`}
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <p className={primitives.note}>
            This is a skeleton. Send the final version to your photographer,
            DJ, and coordinator at least 2 weeks out — they all need it.
          </p>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
