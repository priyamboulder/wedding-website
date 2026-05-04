'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './WeddingROICalculator.module.css';

const TIERS = [
  {
    max: 0.2,
    label: "you're doing this for love",
    body: "And that's beautiful. Genuinely. The math here is never going to math.",
  },
  {
    max: 0.4,
    label: "your parents' obligation list is paying dividends",
    body: 'Every aunty who showed up with an envelope is a tiny act of return-on-relationship. Treasure them.',
  },
  {
    max: 0.6,
    label: 'not bad — your guest list is pulling its weight',
    body: 'The shagun economy is doing its job. Send the thank-you cards.',
  },
  {
    max: 0.8,
    label: "are you sure you're not a financial planner?",
    body: 'This is real engineering. You either have a very generous family or a very strategic guest list.',
  },
  {
    max: 1.0,
    label: 'you might actually break even — teach us your ways',
    body: 'Frame the spreadsheet. This is rare air.',
  },
  {
    max: Infinity,
    label: 'you made money on your wedding. legend.',
    body: "We're not even mad. We're impressed. Go invest the surplus before you spend it on the honeymoon.",
  },
];

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export function WeddingROICalculator() {
  const [budget, setBudget] = useState<number>(150000);
  const [shagun, setShagun] = useState<number>(45000);
  const [other, setOther] = useState<number>(0);
  const [guests, setGuests] = useState<number>(300);

  const result = useMemo(() => {
    if (budget <= 0) return null;
    const totalGifts = shagun + other;
    const roi = totalGifts / budget;
    const net = budget - totalGifts;
    const perGuestNet = guests > 0 ? net / guests : net;
    const tier = TIERS.find((t) => roi <= t.max) ?? TIERS[TIERS.length - 1]!;
    return {
      roi,
      roiPct: Math.round(roi * 100),
      net,
      perGuestNet,
      tier,
    };
  }, [budget, shagun, other, guests]);

  return (
    <MiniToolShell
      name="Wedding ROI Calculator"
      tagline="shagun in vs. wedding cost"
      estimatedTime="1 min"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="roi-budget">
            Total wedding budget
          </label>
          <input
            id="roi-budget"
            type="number"
            className={primitives.input}
            value={budget || ''}
            min={0}
            step={1000}
            onChange={(e) => setBudget(Number(e.target.value) || 0)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="roi-shagun">
            Expected shagun
          </label>
          <input
            id="roi-shagun"
            type="number"
            className={primitives.input}
            value={shagun || ''}
            min={0}
            step={500}
            onChange={(e) => setShagun(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="roi-other">
            Other monetary gifts
          </label>
          <input
            id="roi-other"
            type="number"
            className={primitives.input}
            value={other || ''}
            min={0}
            step={500}
            onChange={(e) => setOther(Number(e.target.value) || 0)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="roi-guests">
            Guest count (for per-guest)
          </label>
          <input
            id="roi-guests"
            type="number"
            className={primitives.input}
            value={guests || ''}
            min={1}
            onChange={(e) => setGuests(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <p className={primitives.note}>
        Not sure what to expect for shagun? Use the{' '}
        <Link href="/tools/shagun" className={styles.inlineLink}>
          Shagun Calculator
        </Link>{' '}
        to back into a number.
      </p>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.tier.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>your &ldquo;ROI&rdquo;</span>
            <div className={primitives.bigNumber}>
              {result.roiPct}<span className={styles.pct}>%</span>
            </div>
            <p className={styles.tierLabel}>{result.tier.label}</p>
            <p className={primitives.resultBody}>{result.tier.body}</p>

            <div className={primitives.breakdown}>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  Net cost (budget − gifts)
                </span>
                <span className={primitives.breakdownValue}>
                  {fmt(result.net)}
                </span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  Net per guest
                </span>
                <span className={primitives.breakdownValue}>
                  {fmt(result.perGuestNet)}
                </span>
              </div>
            </div>

            <p className={primitives.note}>
              For entertainment purposes only. Weddings aren&apos;t investments.
              (But it is fun math.)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
