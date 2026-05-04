'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './HotelRoomBlockEstimator.module.css';

const OOT_TIERS = [
  { label: '< 25%', value: 0.2 },
  { label: '25 – 50%', value: 0.375 },
  { label: '50 – 75%', value: 0.625 },
  { label: '75%+', value: 0.85 },
] as const;

const NIGHT_OPTIONS = [1, 2, 3, 4] as const;

// Per-night DFW average for wedding room blocks (per spec).
const PER_NIGHT_LOW = 150;
const PER_NIGHT_HIGH = 250;

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export function HotelRoomBlockEstimator() {
  const [guests, setGuests] = useState<number>(200);
  const [oot, setOot] = useState<number>(0.625);
  const [perRoom, setPerRoom] = useState<number>(2);
  const [nights, setNights] = useState<number>(2);

  const result = useMemo(() => {
    if (guests <= 0 || perRoom <= 0) return null;
    const ootGuests = guests * oot;
    const roomsNeeded = Math.ceil(ootGuests / perRoom);
    // Assume 75% will book through the block.
    const blockSize = Math.ceil(roomsNeeded * 0.75);
    const guarantee = Math.ceil(blockSize * 0.8);
    const totalRoomNights = blockSize * nights;
    return {
      ootGuests: Math.round(ootGuests),
      roomsNeeded,
      blockSize,
      guarantee,
      totalRoomNights,
      costLow: totalRoomNights * PER_NIGHT_LOW,
      costHigh: totalRoomNights * PER_NIGHT_HIGH,
    };
  }, [guests, oot, perRoom, nights]);

  return (
    <MiniToolShell
      name="Hotel Room Block Estimator"
      tagline="how many rooms should you block?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="hr-guests">
          Total guest count
        </label>
        <input
          id="hr-guests"
          type="number"
          className={primitives.input}
          value={guests || ''}
          min={0}
          onChange={(e) => setGuests(Number(e.target.value) || 0)}
        />
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>% out-of-town</label>
        <div className={styles.tierRow}>
          {OOT_TIERS.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setOot(t.value)}
              className={`${styles.tierChip} ${
                oot === t.value ? styles.tierChipActive : ''
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="hr-perroom">
            Avg. guests per room
          </label>
          <input
            id="hr-perroom"
            type="number"
            className={primitives.input}
            value={perRoom || ''}
            min={1}
            max={6}
            step={0.5}
            onChange={(e) => setPerRoom(Number(e.target.value) || 1)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="hr-nights">
            Nights
          </label>
          <select
            id="hr-nights"
            className={primitives.select}
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
          >
            {NIGHT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'night' : 'nights'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>recommended block</span>
            <div className={primitives.bigNumber}>
              {result.blockSize} <span className={styles.unit}>rooms</span>
            </div>
            <p className={primitives.resultLabel}>
              That covers your out-of-town guests with a buffer for those who
              book outside the block.
            </p>

            <div className={primitives.breakdown}>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  Out-of-town guests
                </span>
                <span className={primitives.breakdownValue}>
                  {result.ootGuests}
                </span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  Rooms needed (raw)
                </span>
                <span className={primitives.breakdownValue}>
                  {result.roomsNeeded}
                </span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  Total room-nights
                </span>
                <span className={primitives.breakdownValue}>
                  {result.totalRoomNights}
                </span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  Estimated cost (DFW range)
                </span>
                <span className={primitives.breakdownValue}>
                  {fmt(result.costLow)} – {fmt(result.costHigh)}
                </span>
              </div>
            </div>

            <div className={primitives.crosslink}>
              <strong>Heads up on guarantees:</strong> most hotels require you
              to commit to ~80% of the block. With {result.blockSize} rooms,
              you&apos;d be on the hook for {result.guarantee} if they don&apos;t fill.
              Negotiate &ldquo;courtesy block&rdquo; terms (no guarantee, no penalty) if you
              can — venues that compete for weddings will agree.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
