'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './OutfitChanges.module.css';

const EVENTS = [
  'Mehndi',
  'Haldi',
  'Sangeet',
  'Ceremony',
  'Cocktail Hour',
  'Reception',
  'Farewell Brunch',
] as const;

type EventName = (typeof EVENTS)[number];

const ROLES = [
  { key: 'bride', label: 'Bride' },
  { key: 'groom', label: 'Groom' },
  { key: 'mob', label: 'Mother of bride' },
  { key: 'mog', label: 'Mother of groom' },
  { key: 'bm', label: 'Bridesmaid' },
] as const;

type Role = (typeof ROLES)[number]['key'];

type OutfitGuide = {
  type: string;
  formality: 'casual' | 'semi-formal' | 'formal' | 'bridal';
  color: string;
  budget: string; // e.g. "$200 – $800"
};

const GUIDE: Record<Role, Partial<Record<EventName, OutfitGuide>>> = {
  bride: {
    Mehndi: { type: 'Sharara or anarkali', formality: 'semi-formal', color: 'Pastels, mint, peach', budget: '$200 – $800' },
    Haldi: { type: 'Casual lehenga or kurta', formality: 'casual', color: 'Yellow (and stainable!)', budget: '$100 – $400' },
    Sangeet: { type: 'Cocktail lehenga or gown', formality: 'formal', color: 'Bold — fuchsia, red, emerald', budget: '$800 – $3,000' },
    Ceremony: { type: 'Bridal lehenga', formality: 'bridal', color: 'Red, maroon, or gold', budget: '$2,500 – $10,000+' },
    'Cocktail Hour': { type: 'Outfit change opportunity', formality: 'formal', color: 'Anything but ceremony color', budget: '$500 – $2,000' },
    Reception: { type: 'Reception lehenga, gown, or saree', formality: 'formal', color: 'Modern — pastels, ivory, navy', budget: '$1,500 – $5,000' },
    'Farewell Brunch': { type: 'Light saree or suit', formality: 'casual', color: 'Soft, easy', budget: '$150 – $500' },
  },
  groom: {
    Mehndi: { type: 'Kurta', formality: 'casual', color: 'White or pastel', budget: '$100 – $400' },
    Haldi: { type: 'Casual kurta (stainable)', formality: 'casual', color: 'White or yellow', budget: '$80 – $200' },
    Sangeet: { type: 'Indo-western or suit', formality: 'formal', color: 'Black, navy, jewel tones', budget: '$300 – $1,500' },
    Ceremony: { type: 'Sherwani', formality: 'bridal', color: 'Cream, gold, ivory, maroon', budget: '$800 – $4,000' },
    'Cocktail Hour': { type: 'Outfit change opportunity', formality: 'formal', color: 'Sleeker than sherwani', budget: '$200 – $800' },
    Reception: { type: 'Suit, tux, or indo-western', formality: 'formal', color: 'Black-tie or jewel-tone', budget: '$300 – $2,500' },
    'Farewell Brunch': { type: 'Casual kurta or shirt', formality: 'casual', color: 'Soft', budget: '$80 – $200' },
  },
  mob: {
    Mehndi: { type: 'Suit or saree', formality: 'semi-formal', color: 'Coordinate with bride', budget: '$200 – $600' },
    Sangeet: { type: 'Lehenga or saree', formality: 'formal', color: 'Bold, festive', budget: '$300 – $1,500' },
    Ceremony: { type: 'Heavy saree or lehenga', formality: 'formal', color: 'Coordinate with bridal palette', budget: '$500 – $2,500' },
    Reception: { type: 'Saree or gown', formality: 'formal', color: 'Avoid bride colors', budget: '$300 – $1,500' },
  },
  mog: {
    Mehndi: { type: 'Suit or saree', formality: 'semi-formal', color: 'Coordinate with groom side', budget: '$200 – $600' },
    Sangeet: { type: 'Lehenga or saree', formality: 'formal', color: 'Bold, festive', budget: '$300 – $1,500' },
    Ceremony: { type: 'Heavy saree or lehenga', formality: 'formal', color: 'Coordinate with groom palette', budget: '$500 – $2,500' },
    Reception: { type: 'Saree or gown', formality: 'formal', color: 'Avoid bride colors', budget: '$300 – $1,500' },
  },
  bm: {
    Mehndi: { type: 'Sharara or anarkali', formality: 'semi-formal', color: 'Group-coordinated', budget: '$100 – $400' },
    Sangeet: { type: 'Lehenga', formality: 'formal', color: 'Group palette', budget: '$200 – $800' },
    Ceremony: { type: 'Lehenga or saree', formality: 'formal', color: 'Bridesmaid color story', budget: '$300 – $1,200' },
    Reception: { type: 'Cocktail attire or lehenga', formality: 'formal', color: 'Group-coordinated', budget: '$200 – $800' },
  },
};

const CALLOUTS = [
  {
    when: (selected: Set<EventName>) =>
      selected.has('Ceremony') && selected.has('Reception'),
    text: 'Need a 1.5-hour gap between ceremony and reception for a full bridal outfit change. Hair and makeup retouch alone takes 30 minutes.',
  },
  {
    when: (selected: Set<EventName>) => selected.has('Haldi'),
    text: "Haldi outfit will get stained. Pick something you don't mind sacrificing.",
  },
  {
    when: (selected: Set<EventName>) =>
      selected.has('Mehndi') && selected.size > 4,
    text: 'With many events, repeat one or two looks across casual events to save your sanity (and budget).',
  },
];

export function OutfitChanges() {
  const [role, setRole] = useState<Role>('bride');
  const [selected, setSelected] = useState<Set<EventName>>(
    new Set(['Mehndi', 'Sangeet', 'Ceremony', 'Reception']),
  );

  function toggle(e: EventName) {
    const next = new Set(selected);
    if (next.has(e)) next.delete(e);
    else next.add(e);
    setSelected(next);
  }

  const result = useMemo(() => {
    const outfits = EVENTS.filter((e) => selected.has(e))
      .map((e) => ({ event: e, guide: GUIDE[role][e] }))
      .filter((r): r is { event: EventName; guide: OutfitGuide } => Boolean(r.guide));
    const callouts = CALLOUTS.filter((c) => c.when(selected)).map((c) => c.text);
    return { outfits, callouts };
  }, [role, selected]);

  return (
    <MiniToolShell
      name="How Many Outfit Changes?"
      tagline="based on your events, how many looks do you need?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="oc-role">
          Who is this for?
        </label>
        <select
          id="oc-role"
          className={primitives.select}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {ROLES.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Events attended</label>
        <div className={primitives.checkboxGrid}>
          {EVENTS.map((e) => {
            const isOn = selected.has(e);
            return (
              <label
                key={e}
                className={`${primitives.checkboxLabel} ${
                  isOn ? primitives.checkboxLabelChecked : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={primitives.checkbox}
                  checked={isOn}
                  onChange={() => toggle(e)}
                />
                {e}
              </label>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result.outfits.length > 0 && (
          <motion.div
            key={`${role}-${result.outfits.length}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>outfit changes needed</span>
            <div className={primitives.bigNumber}>{result.outfits.length}</div>
            <p className={primitives.resultLabel}>
              One look per event. Here&apos;s what each one wants to be.
            </p>

            <ol className={styles.list}>
              {result.outfits.map((o) => (
                <li key={o.event} className={styles.item}>
                  <span className={styles.eventName}>{o.event}</span>
                  <div className={styles.itemBody}>
                    <span className={styles.outfitType}>{o.guide.type}</span>
                    <span className={styles.outfitColor}>{o.guide.color}</span>
                    <span className={styles.outfitBudget}>{o.guide.budget}</span>
                  </div>
                </li>
              ))}
            </ol>

            {result.callouts.length > 0 && (
              <div className={styles.callouts}>
                {result.callouts.map((c) => (
                  <p key={c} className={styles.callout}>
                    {c}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
