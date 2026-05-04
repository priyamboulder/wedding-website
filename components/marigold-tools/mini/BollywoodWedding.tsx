'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './BollywoodWedding.module.css';

type Phase = 'intro' | 'quiz' | 'result';

type FilmKey = 'ddlj' | 'yjhd' | 'hahk' | '2states' | 'rnbdj' | 'kkkg';

const QUESTIONS: {
  id: string;
  prompt: string;
  options: { label: string; weights: Partial<Record<FilmKey, number>> }[];
}[] = [
  {
    id: 'energy',
    prompt: 'What energy do you want at your wedding?',
    options: [
      { label: 'Pure tradition. Pheras, songs, Punjabi mom in tears.', weights: { ddlj: 3, hahk: 2, kkkg: 2 } },
      { label: 'Massive dance numbers and chaos in the best way.', weights: { yjhd: 3, hahk: 2, rnbdj: 1 } },
      { label: 'Big family, bigger heart, many cousins.', weights: { hahk: 3, kkkg: 2, '2states': 1 } },
      { label: 'Two cultures meeting in the middle, with negotiation.', weights: { '2states': 3, rnbdj: 1 } },
      { label: 'Travel-themed, scenic, slightly indie.', weights: { yjhd: 3, ddlj: 1 } },
      { label: 'Designer everything. The aesthetic is luxury.', weights: { kkkg: 3, rnbdj: 2 } },
    ],
  },
  {
    id: 'venue',
    prompt: 'Dream venue?',
    options: [
      { label: 'Sprawling family home with marigolds everywhere.', weights: { hahk: 3, ddlj: 2 } },
      { label: 'A palace in Rajasthan.', weights: { kkkg: 3, rnbdj: 2 } },
      { label: 'Mountain town, intimate, with a view.', weights: { yjhd: 3, ddlj: 1 } },
      { label: 'A South-meets-North fusion at a beach resort.', weights: { '2states': 3, rnbdj: 1 } },
      { label: 'A Punjab farmhouse with mustard fields.', weights: { ddlj: 3, hahk: 1 } },
      { label: 'A five-star hotel ballroom with chandeliers.', weights: { rnbdj: 3, kkkg: 2 } },
    ],
  },
  {
    id: 'song',
    prompt: 'First-dance song vibe?',
    options: [
      { label: '"Tujhe Dekha Toh Yeh Jaana Sanam"', weights: { ddlj: 4 } },
      { label: '"Kabira" — soft, philosophical, soulful', weights: { yjhd: 4 } },
      { label: '"Pehla Pehla Pyaar" — old-school family musical', weights: { hahk: 4 } },
      { label: '"Mast Magan" — fusion, dreamy', weights: { '2states': 4 } },
      { label: '"Tum Hi Ho" — drama, intensity', weights: { rnbdj: 3, kkkg: 2 } },
      { label: '"Suraj Hua Maddham" — sweeping orchestral', weights: { kkkg: 4 } },
    ],
  },
  {
    id: 'family',
    prompt: 'Family situation, real talk?',
    options: [
      { label: 'Massive joint family. Cousins are siblings.', weights: { hahk: 3, kkkg: 2 } },
      { label: 'Friends are family. The squad runs deep.', weights: { yjhd: 3 } },
      { label: 'Two cultures, both very involved, a lot of opinions.', weights: { '2states': 4 } },
      { label: 'Old-school traditional, parents have the final say.', weights: { ddlj: 3, kkkg: 2 } },
      { label: 'Drama, tears, eventual reconciliation. Always.', weights: { rnbdj: 2, kkkg: 3 } },
      { label: 'Small but mighty. Quality over quantity.', weights: { '2states': 1, yjhd: 2 } },
    ],
  },
  {
    id: 'outfit',
    prompt: 'Wedding day look?',
    options: [
      { label: 'Red lehenga, gold jewelry, classic bride.', weights: { ddlj: 3, hahk: 2, kkkg: 2 } },
      { label: 'Pastel pink, floral jewelry, soft and dreamy.', weights: { yjhd: 3, '2states': 2 } },
      { label: 'Sabyasachi-coded. Heritage and weight.', weights: { kkkg: 3, rnbdj: 2 } },
      { label: 'Kanjeevaram silk + classic gold.', weights: { '2states': 3 } },
      { label: 'Whatever, but it photographs cinematically.', weights: { rnbdj: 3, yjhd: 1 } },
      { label: 'White Punjabi suit then red bridal lehenga later.', weights: { ddlj: 3, hahk: 1 } },
    ],
  },
  {
    id: 'guests',
    prompt: 'Guest count goal?',
    options: [
      { label: 'Under 100. Intimate.', weights: { yjhd: 3, '2states': 2 } },
      { label: '200-300. Big but manageable.', weights: { ddlj: 2, '2states': 2 } },
      { label: '500+. The more the merrier.', weights: { hahk: 4, kkkg: 3 } },
      { label: '1000+. We invited the entire town.', weights: { kkkg: 3, rnbdj: 3 } },
    ],
  },
];

const FILMS: Record<FilmKey, { name: string; year: string; tagline: string; vibe: string }> = {
  ddlj: {
    name: 'Dilwale Dulhania Le Jayenge',
    year: '1995',
    tagline: 'the timeless one',
    vibe: 'Mustard fields, Punjabi heart, and a love story that earned every yes. Your wedding has soul, tradition, and the kind of moment that makes elders cry. Ja Simran ja, jee le apni zindagi.',
  },
  yjhd: {
    name: 'Yeh Jawaani Hai Deewani',
    year: '2013',
    tagline: 'the wanderlust one',
    vibe: 'Mountains, friends-as-family, sangeet that doubles as a music festival. Your wedding is intimate but unforgettable — the kind of weekend people quote for years.',
  },
  hahk: {
    name: 'Hum Aapke Hain Koun',
    year: '1994',
    tagline: 'the maximalist family one',
    vibe: 'Marigolds, antakshari, twelve functions, and approximately one thousand cousins. Your wedding is a 14-track musical and absolutely everyone is invited.',
  },
  '2states': {
    name: '2 States',
    year: '2014',
    tagline: 'the cross-cultural one',
    vibe: 'Two traditions, two sets of parents, and a beautifully negotiated middle. Your wedding is half kanjeevaram, half lehenga, and entirely a love letter to merging.',
  },
  rnbdj: {
    name: 'Rab Ne Bana Di Jodi',
    year: '2008',
    tagline: 'the cinematic one',
    vibe: 'Wide shots, slow dances, and a story that earns its emotion. Your wedding is dramatic in the best way — every detail considered, every photo a frame from a film.',
  },
  kkkg: {
    name: 'Kabhi Khushi Kabhie Gham',
    year: '2001',
    tagline: 'the larger-than-life one',
    vibe: 'Designer everything, palace venues, sprawling family epics. Your wedding is opulent, layered, and unapologetically grand. It\'s all about loving your family.',
  },
};

function topFilm(scores: Record<FilmKey, number>): FilmKey {
  let best: FilmKey = 'ddlj';
  let bestScore = -1;
  for (const k of Object.keys(scores) as FilmKey[]) {
    if (scores[k] > bestScore) {
      best = k;
      bestScore = scores[k];
    }
  }
  return best;
}

export function BollywoodWedding() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<FilmKey, number>>({
    ddlj: 0,
    yjhd: 0,
    hahk: 0,
    '2states': 0,
    rnbdj: 0,
    kkkg: 0,
  });

  const total = QUESTIONS.length;
  const current = QUESTIONS[step];

  function answer(weights: Partial<Record<FilmKey, number>>) {
    const next: Record<FilmKey, number> = { ...scores };
    for (const k of Object.keys(weights) as FilmKey[]) {
      next[k] = (next[k] ?? 0) + (weights[k] ?? 0);
    }
    setScores(next);
    if (step + 1 < total) setStep(step + 1);
    else setPhase('result');
  }

  function reset() {
    setScores({ ddlj: 0, yjhd: 0, hahk: 0, '2states': 0, rnbdj: 0, kkkg: 0 });
    setStep(0);
    setPhase('intro');
  }

  const winner = phase === 'result' ? topFilm(scores) : null;
  const film = winner ? FILMS[winner] : null;

  return (
    <MiniToolShell
      name="What Bollywood Wedding Are You?"
      tagline="DDLJ or Yeh Jawaani Hai Deewani?"
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
              Six questions about your venue, vibe, and family. We&apos;ll match
              you to the Bollywood wedding film your wedding is secretly
              channeling.
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
                  onClick={() => answer(opt.weights)}
                >
                  <span className={styles.optionDot} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'result' && film && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>your wedding is</span>
            <p className={styles.filmName}>{film.name}</p>
            <p className={styles.filmYear}>
              {film.year} — {film.tagline}
            </p>
            <p className={primitives.resultBody}>{film.vibe}</p>

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
