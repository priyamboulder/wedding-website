'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import {
  AESTHETICS,
  QUESTIONS,
  scoreAnswers,
} from '@/lib/tools/mini/wedding-aesthetic-data';
import primitives from './MiniToolPrimitives.module.css';
import styles from './WeddingAestheticQuiz.module.css';

type Phase = 'intro' | 'quiz' | 'result';

export function WeddingAestheticQuiz() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const total = QUESTIONS.length;
  const current = QUESTIONS[step];

  function answer(idx: number) {
    if (!current) return;
    const next = { ...answers, [current.id]: idx };
    setAnswers(next);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      setPhase('result');
    }
  }

  function reset() {
    setAnswers({});
    setStep(0);
    setPhase('intro');
  }

  const result = phase === 'result' ? scoreAnswers(answers) : null;

  return (
    <MiniToolShell
      name="What's Your Wedding Aesthetic?"
      tagline="minimalist queen or maximalist maharani?"
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
              Five questions. One unmistakable verdict on what your wedding
              wants to be. Pick the answer that&apos;s closest, even if none of
              them are exactly you.
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
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                />
              </div>
            </div>

            <h2 className={styles.prompt}>{current.prompt}</h2>

            <div className={styles.options}>
              {current.options.map((opt, idx) => (
                <button
                  key={opt.label}
                  type="button"
                  className={styles.option}
                  onClick={() => answer(idx)}
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

        {phase === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>your aesthetic</span>
            <h2 className={styles.resultName}>{result.name}</h2>
            <p className={styles.resultTagline}>{result.tagline}</p>
            <p className={primitives.resultBody}>{result.description}</p>

            <div className={styles.paletteSection}>
              <span className={primitives.resultEyebrow}>your palette</span>
              <div className={styles.paletteRow}>
                {result.palette.map((color) => (
                  <div key={color.hex} className={styles.swatch}>
                    <div
                      className={styles.swatchColor}
                      style={{ background: color.hex }}
                    />
                    <span className={styles.swatchName}>{color.name}</span>
                    <span className={styles.swatchHex}>{color.hex}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.keywordsRow}>
              {result.keywords.map((kw) => (
                <span key={kw} className={styles.keyword}>
                  {kw}
                </span>
              ))}
            </div>

            <div className={primitives.crosslink}>
              <strong>What to look for in vendors:</strong> {result.vendorStyle}
            </div>

            <div className={styles.resultActions}>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={reset}
              >
                ↻ retake the quiz
              </button>
              <Link href="/tools/color-palette" className={styles.resultLink}>
                Generate full color palette →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
