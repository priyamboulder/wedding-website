'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './HowExtra.module.css';

type Phase = 'intro' | 'quiz' | 'result';

// 8 questions, each answer scored 0..12.5. Total cap = 100.
const QUESTIONS: { id: string; prompt: string; options: { label: string; pts: number }[] }[] =
  [
    {
      id: 'guests',
      prompt: 'Guest count',
      options: [
        { label: 'Under 100', pts: 0 },
        { label: '100 – 250', pts: 4 },
        { label: '250 – 500', pts: 8 },
        { label: '500+', pts: 12.5 },
      ],
    },
    {
      id: 'events',
      prompt: 'Number of events',
      options: [
        { label: '1 – 2', pts: 0 },
        { label: '3 – 4', pts: 4 },
        { label: '5 – 6', pts: 8 },
        { label: '7+', pts: 12.5 },
      ],
    },
    {
      id: 'outfits',
      prompt: 'Bridal outfit situation',
      options: [
        { label: '1 outfit', pts: 0 },
        { label: '2 – 3 outfits', pts: 4 },
        { label: '4 – 5 outfits', pts: 8 },
        { label: '6+ outfits', pts: 12.5 },
      ],
    },
    {
      id: 'venue',
      prompt: 'Venue',
      options: [
        { label: 'Backyard', pts: 0 },
        { label: 'Banquet hall', pts: 3 },
        { label: 'Luxury hotel', pts: 6 },
        { label: 'Destination', pts: 9 },
        { label: 'Palace or estate', pts: 12.5 },
      ],
    },
    {
      id: 'entertainment',
      prompt: 'Entertainment',
      options: [
        { label: 'Spotify playlist', pts: 0 },
        { label: 'DJ', pts: 3 },
        { label: 'Live band', pts: 6 },
        { label: 'Multiple acts', pts: 9 },
        { label: 'Celebrity performance', pts: 12.5 },
      ],
    },
    {
      id: 'transport',
      prompt: 'Groom transport',
      options: [
        { label: 'Regular car', pts: 0 },
        { label: 'Vintage car', pts: 3 },
        { label: 'Horse', pts: 6 },
        { label: 'Helicopter', pts: 10 },
        { label: 'Elephant', pts: 12.5 },
      ],
    },
    {
      id: 'food',
      prompt: 'Food',
      options: [
        { label: 'Buffet', pts: 0 },
        { label: 'Plated dinner', pts: 4 },
        { label: 'Multiple live stations', pts: 8 },
        { label: 'Celebrity chef', pts: 10 },
        { label: 'All of the above × 4 events', pts: 12.5 },
      ],
    },
    {
      id: 'florals',
      prompt: 'Florals & decor',
      options: [
        { label: 'DIY', pts: 0 },
        { label: 'Standard florist', pts: 3 },
        { label: 'Luxury florist', pts: 6 },
        { label: 'Imported flowers', pts: 9 },
        { label: 'The venue IS the flowers', pts: 12.5 },
      ],
    },
  ];

const TIERS = [
  { max: 20, label: 'Refreshingly Chill', body: "Genuinely lovely. Less is, in fact, more — and you're already living that truth." },
  { max: 40, label: 'Tastefully Done', body: "Restrained, considered, beautiful. The grown-up at the wedding party planning table." },
  { max: 60, label: 'Properly Extra', body: "You're doing the most — and it's working. The photos will be unhinged in the best way." },
  { max: 80, label: 'Gloriously Over the Top', body: "We see you. Everyone will see you. The neighbors will see you. The astronauts might see you." },
  { max: 100, label: 'Ambani Energy', body: 'A wedding for the history books. Or at least the WhatsApp groups, for years to come.' },
];

export function HowExtra() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const total = QUESTIONS.length;
  const current = QUESTIONS[step];

  function answer(pts: number) {
    if (!current) return;
    const next = { ...answers, [current.id]: pts };
    setAnswers(next);
    if (step + 1 < total) setStep(step + 1);
    else setPhase('result');
  }

  function reset() {
    setAnswers({});
    setStep(0);
    setPhase('intro');
  }

  const score =
    phase === 'result'
      ? Math.min(100, Math.round(Object.values(answers).reduce((a, b) => a + b, 0)))
      : 0;
  const tier = TIERS.find((t) => score <= t.max) ?? TIERS[TIERS.length - 1]!;

  // Approx percentile vs. industry — calibrated so 50 = ~median.
  const percentile = Math.min(99, Math.max(1, Math.round(score)));

  return (
    <MiniToolShell
      name="How Extra Is Your Wedding?"
      tagline="rate your wedding on the extravagance scale"
      estimatedTime="2 min"
    >
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className={styles.intro}
          >
            <p className={styles.introText}>
              Eight questions. We&apos;ll tell you exactly where you land on the
              scale from chill to Ambani. Designed to be screenshot and shared.
            </p>
            <button
              type="button"
              className={primitives.button}
              onClick={() => setPhase('quiz')}
            >
              Start the quiz →
            </button>
          </motion.div>
        )}

        {phase === 'quiz' && current && (
          <motion.div
            key={`q-${step}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.28 }}
            className={styles.quizCard}
          >
            <div className={styles.progress}>
              <span className={styles.progressLabel}>
                Question {step + 1} of {total}
              </span>
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressFill}
                  initial={false}
                  animate={{ width: `${((step + 1) / total) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            <h2 className={styles.prompt}>{current.prompt}</h2>

            <div className={styles.options}>
              {current.options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className={styles.option}
                  onClick={() => answer(opt.pts)}
                >
                  <span className={styles.optionDot} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setStep(step - 1)}
              >
                ← previous
              </button>
            )}
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>your extra score</span>
            <div className={primitives.bigNumber}>
              {score}
              <span className={styles.outOf}>/100</span>
            </div>
            <p className={styles.tierLabel}>{tier.label}</p>
            <p className={primitives.resultBody}>{tier.body}</p>

            <div className={primitives.crosslink}>
              Your wedding is more extra than approximately {percentile}% of
              South Asian weddings in our calibration set.
            </div>

            <button
              type="button"
              className={styles.resetBtn}
              onClick={reset}
              style={{ marginTop: 24 }}
            >
              ↻ retake the quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
