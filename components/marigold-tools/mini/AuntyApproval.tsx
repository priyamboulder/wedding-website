'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './HowExtra.module.css';

type Phase = 'intro' | 'quiz' | 'result';

// 8 questions × max 12.5 pts = 100 max
const QUESTIONS: { id: string; prompt: string; options: { label: string; pts: number }[] }[] =
  [
    {
      id: 'venue',
      prompt: "Who's picking the venue?",
      options: [
        { label: 'Our parents', pts: 12.5 },
        { label: "It's a family decision", pts: 9 },
        { label: 'We are', pts: 4 },
        { label: "We're eloping and telling them later", pts: 0 },
      ],
    },
    {
      id: 'guests',
      prompt: 'The guest list situation',
      options: [
        { label: '500+ — everyone dad has ever met', pts: 12.5 },
        { label: '300 – 500 — go big', pts: 9 },
        { label: '150 – 250 — standard', pts: 6 },
        { label: 'Under 100 — intimate', pts: 0 },
      ],
    },
    {
      id: 'ceremony',
      prompt: 'The ceremony',
      options: [
        { label: 'Full traditional with every ritual', pts: 12.5 },
        { label: 'Traditional but shortened', pts: 9 },
        { label: 'Fusion or interfaith', pts: 4 },
        { label: 'Courthouse + party', pts: 0 },
      ],
    },
    {
      id: 'mehndi',
      prompt: 'The mehndi plan',
      options: [
        { label: 'Full mehndi night with professional artists', pts: 12.5 },
        { label: 'DIY mehndi with friends', pts: 7 },
        { label: 'Henna tattoo stickers', pts: 2 },
        { label: "What's mehndi?", pts: 0 },
      ],
    },
    {
      id: 'sangeet',
      prompt: 'Your sangeet approach',
      options: [
        { label: 'Choreographed family performances, rehearsed for months', pts: 12.5 },
        { label: 'Open dance floor, Bollywood hits', pts: 9 },
        { label: 'Live band, cocktail vibe', pts: 5 },
        { label: 'Skipping it', pts: 0 },
      ],
    },
    {
      id: 'food',
      prompt: 'Food situation',
      options: [
        { label: 'Traditional Indian catering, multiple courses', pts: 12.5 },
        { label: 'Indo-fusion menu', pts: 7 },
        { label: 'Mix of cuisines', pts: 4 },
        { label: 'Food trucks', pts: 0 },
      ],
    },
    {
      id: 'outfit',
      prompt: 'The bridal outfit',
      options: [
        { label: 'Designer lehenga from India', pts: 12.5 },
        { label: 'Lehenga from US boutique', pts: 9 },
        { label: 'Western wedding dress', pts: 3 },
        { label: 'Pantsuit or something unconventional', pts: 0 },
      ],
    },
    {
      id: 'shagun',
      prompt: 'The shagun situation',
      options: [
        { label: 'Formal shagun ceremony with both families', pts: 12.5 },
        { label: 'Casual gift exchange', pts: 7 },
        { label: 'Registry only', pts: 3 },
        { label: '"Your presence is the present"', pts: 0 },
      ],
    },
  ];

const TIERS = [
  {
    max: 19,
    label: 'Aunty has left the group chat',
    body: 'You did it your way. The cousins respect it. The aunties will need a minute. (And maybe a cup of chai.)',
  },
  {
    max: 39,
    label: 'Full main character energy',
    body: 'Aunty needs a moment. The wedding will be talked about for years — half admiringly, half scandalized.',
  },
  {
    max: 59,
    label: 'The rebel with a cause',
    body: "You're doing it your way and aunty has Opinions. The good news: your wedding will look like YOU.",
  },
  {
    max: 79,
    label: 'Respectfully modern',
    body: 'Traditional with your own twist. The sweet spot — aunty approves, you still feel like yourself.',
  },
  {
    max: 100,
    label: 'Aunty-Approved™',
    body: 'Your nani would be proud. The mehndi will be flawless, the catering will be talked about, and someone will cry happy tears.',
  },
];

export function AuntyApproval() {
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

  return (
    <MiniToolShell
      name="The Aunty Approval Score"
      tagline="how traditional is your wedding, really?"
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
              Eight questions on the tradition spectrum. We&apos;ll tell you
              where you land — from courthouse rebel to grandmother-approved.
              Designed to be screenshot and shared in the cousin group chat.
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
            <span className={primitives.resultEyebrow}>aunty approval</span>
            <div className={primitives.bigNumber}>
              {score}
              <span className={styles.outOf}>/100</span>
            </div>
            <p className={styles.tierLabel}>{tier.label}</p>
            <p className={primitives.resultBody}>{tier.body}</p>

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
