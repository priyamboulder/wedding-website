'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './KidsOrNoKidsCalculator.module.css';

const EVENTS = [
  { key: 'mehndi', label: 'Mehndi' },
  { key: 'sangeet', label: 'Sangeet' },
  { key: 'ceremony', label: 'Ceremony' },
  { key: 'reception', label: 'Reception' },
] as const;

const NO_KIDS_WORDING =
  "We love your little ones! To allow all guests to relax and celebrate fully, our wedding will be an adults-only evening. We hope you can make arrangements and join us for the night.";

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export function KidsOrNoKidsCalculator() {
  const [kids, setKids] = useState<number>(15);
  const [perKid, setPerKid] = useState<number>(40);
  const [events, setEvents] = useState<Set<string>>(
    new Set(['ceremony', 'reception']),
  );
  const [childcare, setChildcare] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  function toggleEvent(key: string) {
    const next = new Set(events);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setEvents(next);
  }

  const result = useMemo(() => {
    if (kids <= 0 || events.size === 0) return null;

    const eventCount = events.size;
    const kidMealCost = kids * perKid * eventCount;

    // Childcare: $25-$35/hr per sitter, 1 sitter per 4-5 kids, 4-6 hour event.
    // Use midpoints: $30/hr, 4.5 kids per sitter, 5 hours.
    const sitters = Math.max(1, Math.ceil(kids / 4.5));
    const childcareLow = sitters * 25 * 4;
    const childcareHigh = sitters * 35 * 6;

    return {
      kidMealCost,
      eventCount,
      sitters,
      childcareLow,
      childcareHigh,
    };
  }, [kids, perKid, events, childcare]);

  async function copyWording() {
    try {
      await navigator.clipboard.writeText(NO_KIDS_WORDING);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked
    }
  }

  return (
    <MiniToolShell
      name="Kids or No Kids Calculator"
      tagline="how many kids are on your list — and what does that cost?"
      estimatedTime="30 sec"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="kk-kids">
            Number of kids
          </label>
          <input
            id="kk-kids"
            type="number"
            className={primitives.input}
            value={kids || ''}
            min={0}
            onChange={(e) => setKids(Number(e.target.value) || 0)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="kk-permeal">
            Per-kid meal cost
          </label>
          <input
            id="kk-permeal"
            type="number"
            className={primitives.input}
            value={perKid || ''}
            min={0}
            step={5}
            onChange={(e) => setPerKid(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Events they&apos;ll attend</label>
        <div className={primitives.checkboxGrid}>
          {EVENTS.map((e) => {
            const isOn = events.has(e.key);
            return (
              <label
                key={e.key}
                className={`${primitives.checkboxLabel} ${
                  isOn ? primitives.checkboxLabelChecked : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={primitives.checkbox}
                  checked={isOn}
                  onChange={() => toggleEvent(e.key)}
                />
                {e.label}
              </label>
            );
          })}
        </div>
      </div>

      <label
        className={`${primitives.checkboxLabel} ${
          childcare ? primitives.checkboxLabelChecked : ''
        }`}
        style={{ marginBottom: 22 }}
      >
        <input
          type="checkbox"
          className={primitives.checkbox}
          checked={childcare}
          onChange={(e) => setChildcare(e.target.checked)}
        />
        I want childcare/babysitting at the venue
      </label>

      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>
              cost of including kids
            </span>
            <div className={primitives.bigNumber}>
              {fmt(
                result.kidMealCost +
                  (childcare ? result.childcareHigh : 0),
              )}
            </div>
            <p className={primitives.resultLabel}>
              {kids} kids across {result.eventCount} event
              {result.eventCount === 1 ? '' : 's'}
              {childcare ? ', including childcare' : ''}.
            </p>

            <div className={primitives.breakdown}>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  Kid meals ({kids} × {fmt(perKid)} × {result.eventCount})
                </span>
                <span className={primitives.breakdownValue}>
                  {fmt(result.kidMealCost)}
                </span>
              </div>
              {childcare && (
                <div className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>
                    Childcare ({result.sitters} sitter
                    {result.sitters === 1 ? '' : 's'}, 4–6 hr block)
                  </span>
                  <span className={primitives.breakdownValue}>
                    {fmt(result.childcareLow)} – {fmt(result.childcareHigh)}
                  </span>
                </div>
              )}
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  Cost if you go &ldquo;adults only&rdquo;
                </span>
                <span className={primitives.breakdownValue}>$0</span>
              </div>
            </div>

            <div className={primitives.crosslink}>
              <strong>If you choose adults-only:</strong> here&apos;s a polite
              wording to drop into your invite or wedding website.
              <div className={styles.wordingBox}>
                <p className={styles.wording}>{NO_KIDS_WORDING}</p>
                <button
                  type="button"
                  onClick={copyWording}
                  className={styles.copyBtn}
                >
                  {copied ? 'copied!' : 'copy'}
                </button>
              </div>
              <p className={primitives.note} style={{ marginTop: 12 }}>
                Pair it with a list of nearby trusted babysitting services on
                your wedding website.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
