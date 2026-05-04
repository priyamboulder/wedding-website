'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './HowExtra.module.css';
import drama from './FamilyDramaPredictor.module.css';

type Phase = 'intro' | 'quiz' | 'result';

type Answers = {
  families: number;
  guestList: number;
  budget: 'self' | 'one-side' | 'both' | 'complicated';
  brideTradition: 'very' | 'somewhat' | 'modern' | 'whatever';
  groomTradition: 'very' | 'somewhat' | 'modern' | 'whatever';
  landmines: Set<string>;
  partner: 'rock' | 'stress' | 'avoids' | 'absent';
};

const QUESTIONS = [
  {
    id: 'families',
    prompt: 'How many families are involved in planning?',
    type: 'single' as const,
    options: [
      { label: 'Just us', value: 1 },
      { label: 'Both sets of parents', value: 2 },
      { label: '3+ — extended family weighing in', value: 3 },
    ],
  },
  {
    id: 'guestList',
    prompt: 'Guest list agreement level',
    type: 'single' as const,
    options: [
      { label: 'Total agreement', value: 0 },
      { label: 'Minor disagreements', value: 1 },
      { label: 'Active negotiations', value: 2 },
      { label: 'Full-on battle', value: 3 },
    ],
  },
  {
    id: 'budget',
    prompt: "Budget — who's paying?",
    type: 'single' as const,
    options: [
      { label: "We're paying ourselves", value: 'self' },
      { label: 'One side paying', value: 'one-side' },
      { label: 'Both sides contributing', value: 'both' },
      { label: "It's complicated", value: 'complicated' },
    ],
  },
  {
    id: 'brideTradition',
    prompt: "How traditional is the bride's side?",
    type: 'single' as const,
    options: [
      { label: 'Very traditional', value: 'very' },
      { label: 'Somewhat', value: 'somewhat' },
      { label: 'Modern', value: 'modern' },
      { label: "Couldn't care less", value: 'whatever' },
    ],
  },
  {
    id: 'groomTradition',
    prompt: "How traditional is the groom's side?",
    type: 'single' as const,
    options: [
      { label: 'Very traditional', value: 'very' },
      { label: 'Somewhat', value: 'somewhat' },
      { label: 'Modern', value: 'modern' },
      { label: "Couldn't care less", value: 'whatever' },
    ],
  },
  {
    id: 'landmines',
    prompt: 'Any of these landmines? (pick all that apply)',
    type: 'multi' as const,
    options: [
      { label: 'Divorced parents', value: 'divorced' },
      { label: 'Feuding family members', value: 'feud' },
      { label: 'Interfaith or intercultural', value: 'interfaith' },
      { label: 'One side significantly larger', value: 'lopsided' },
      { label: 'One side significantly wealthier', value: 'wealth-gap' },
      { label: 'Destination vs. local disagreement', value: 'destination' },
    ],
  },
  {
    id: 'partner',
    prompt: 'How does your partner handle family stress?',
    type: 'single' as const,
    options: [
      { label: 'Rock solid', value: 'rock' },
      { label: 'Gets stressed but copes', value: 'stress' },
      { label: 'Avoids conflict', value: 'avoids' },
      { label: 'What partner?', value: 'absent' },
    ],
  },
];

type Trigger = {
  id: string;
  test: (a: Answers) => boolean;
  weight: (a: Answers) => number;
  issue: string;
  why: string;
  defuse: string;
};

// `w(n)` is just sugar for a constant-weight trigger.
const w = (n: number) => () => n;

const TRIGGERS: Trigger[] = [
  {
    id: 'guest-list-war',
    test: (a) => a.guestList >= 2,
    weight: (a) => a.guestList,
    issue: 'The guest list battle',
    why: 'Already in active negotiation. Every "+1" debate makes this worse, not better.',
    defuse: 'Set hard caps per family (numerically), then let each side decide their own list within their cap. Removes you from the middle.',
  },
  {
    id: 'seating-divorce',
    test: (a) => a.landmines.has('divorced') && a.guestList >= 2,
    weight: w(4),
    issue: 'Divorced-parent seating chart',
    why: "Divorced parents + a contested guest list means seating becomes a status statement.",
    defuse: 'Use sweetheart table for the couple. Skip the head table entirely. Remove the chess board.',
  },
  {
    id: 'feuding',
    test: (a) => a.landmines.has('feud'),
    weight: w(4),
    issue: 'Feuding family members in one venue',
    why: 'They WILL be at the same wedding. Pretending otherwise creates the explosion.',
    defuse: 'Acknowledge the conflict to a trusted relative ahead of time. Ask them to be the buffer. Seat the parties at opposite sides of the room.',
  },
  {
    id: 'interfaith-format',
    test: (a) =>
      a.landmines.has('interfaith') &&
      (a.brideTradition === 'very' || a.groomTradition === 'very'),
    weight: w(4),
    issue: 'Ceremony format clash',
    why: 'Interfaith + one strongly traditional side = whose rituals, in what order, for how long.',
    defuse: 'Have a ceremony-design conversation with both families together (not separately). One meeting prevents 20 phone calls.',
  },
  {
    id: 'who-decides',
    test: (a) =>
      a.budget === 'one-side' || a.budget === 'complicated',
    weight: w(3),
    issue: '"Whoever pays decides"',
    why: "When one side funds the bulk, they assume editorial control. Even if they don't say it.",
    defuse: 'Set decision rights in writing before the first deposit lands. "We pay X% and decide Y" — explicit.',
  },
  {
    id: 'tradition-mismatch',
    test: (a) =>
      (a.brideTradition === 'very' && a.groomTradition === 'modern') ||
      (a.brideTradition === 'modern' && a.groomTradition === 'very') ||
      (a.brideTradition === 'very' && a.groomTradition === 'whatever') ||
      (a.brideTradition === 'whatever' && a.groomTradition === 'very'),
    weight: w(4),
    issue: 'Cross-family tradition mismatch',
    why: 'One side wants every ritual; the other wants a courthouse + party. Every event becomes a negotiation.',
    defuse: "Pick rituals deliberately, not by default. Each event gets a 'why' you both agree on. The 'because we always have' answer doesn't fly anymore.",
  },
  {
    id: 'lopsided',
    test: (a) => a.landmines.has('lopsided'),
    weight: w(2),
    issue: 'Lopsided guest counts',
    why: '300 vs. 80 makes the smaller side feel exposed. Photos suddenly feel like one team.',
    defuse: 'Mix tables on purpose. Cocktail-hour mingling games. Bridge the gap visually and physically.',
  },
  {
    id: 'wealth-gap',
    test: (a) => a.landmines.has('wealth-gap'),
    weight: w(3),
    issue: 'Wealth gap between families',
    why: 'Different default budgets create constant low-grade friction over what is "reasonable."',
    defuse: 'Avoid public 50/50 splits on contributions. Couple-led budgeting lets each family give what they comfortably can.',
  },
  {
    id: 'destination-fight',
    test: (a) => a.landmines.has('destination'),
    weight: w(3),
    issue: 'Destination vs. local disagreement',
    why: 'Logistics, cost, and "we just want everyone to come" all pull different ways.',
    defuse: "Survey the actual must-have guests on what they could attend. Often the data resolves it without further debate.",
  },
  {
    id: 'partner-absent',
    test: (a) => a.partner === 'avoids' || a.partner === 'absent',
    weight: w(4),
    issue: "Partner isn't running interference",
    why: 'If one partner avoids family conflict, the other ends up handling both families alone — exhausting.',
    defuse: "Each partner manages their OWN family for high-stakes calls. Non-negotiable. Don't make the other half explain your mom to your mom.",
  },
  {
    id: 'too-many-cooks',
    test: (a) => a.families >= 3,
    weight: w(3),
    issue: 'Too many decision-makers',
    why: 'Three or more families = parallel WhatsApp threads, contradictory directives, and no clear final word.',
    defuse: 'Make a 1-page "who decides what" doc. Share with all involved families. Removes 80% of the loop.',
  },
];

const TIERS = [
  { max: 4, label: 'Smooth sailing', body: 'Genuinely few flashpoints. Stay communicative and you\'re golden.' },
  { max: 8, label: 'A few speed bumps', body: 'Normal stuff. A pre-agreed playbook handles most of it.' },
  { max: 14, label: 'Buckle up, buttercup', body: 'Serious overlap of friction sources. Plan deliberate weekly check-ins between you and your partner.' },
  { max: 100, label: 'Therapy recommended (kidding. mostly.)', body: "Multiple high-friction zones at once. A pre-marital counselor is genuinely worth it — not a sign of failure, just a force multiplier." },
];

export function FamilyDramaPredictor() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    families: 2,
    guestList: 0,
    budget: 'self',
    brideTradition: 'somewhat',
    groomTradition: 'somewhat',
    landmines: new Set(),
    partner: 'stress',
  });

  const total = QUESTIONS.length;
  const current = QUESTIONS[step];

  function setAnswer(id: string, value: string | number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(value: string) {
    setAnswers((prev) => {
      const next = new Set(prev.landmines);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, landmines: next };
    });
  }

  function next() {
    if (step + 1 < total) setStep(step + 1);
    else setPhase('result');
  }

  function reset() {
    setStep(0);
    setPhase('intro');
    setAnswers({
      families: 2,
      guestList: 0,
      budget: 'self',
      brideTradition: 'somewhat',
      groomTradition: 'somewhat',
      landmines: new Set(),
      partner: 'stress',
    });
  }

  const triggered =
    phase === 'result'
      ? TRIGGERS.filter((t) => t.test(answers))
          .map((t) => ({ ...t, weightVal: t.weight(answers) }))
          .sort((a, b) => b.weightVal - a.weightVal)
      : [];

  const top3 = triggered.slice(0, 3);
  const totalScore = triggered.reduce((s, t) => s + t.weightVal, 0);
  const tier = TIERS.find((t) => totalScore <= t.max) ?? TIERS[TIERS.length - 1]!;

  return (
    <MiniToolShell
      name="Family Drama Predictor"
      tagline="which decision will cause the most debate?"
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
              Six questions to map where your wedding-planning friction is
              likely to come from. The output is your top 3 drama triggers
              with concrete defusing tips.
            </p>
            <button
              type="button"
              className={primitives.button}
              onClick={() => setPhase('quiz')}
            >
              Start the assessment →
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
              {current.options.map((opt) => {
                if (current.type === 'multi') {
                  const isOn = answers.landmines.has(opt.value as string);
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      className={`${styles.option} ${isOn ? drama.optionOn : ''}`}
                      onClick={() => toggleMulti(opt.value as string)}
                    >
                      <span className={styles.optionDot} />
                      <span>{opt.label}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={opt.label}
                    type="button"
                    className={styles.option}
                    onClick={() => {
                      setAnswer(current.id, opt.value);
                      next();
                    }}
                  >
                    <span className={styles.optionDot} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {current.type === 'multi' && (
              <button
                type="button"
                onClick={next}
                className={primitives.button}
                style={{ marginTop: 16 }}
              >
                Continue →
              </button>
            )}

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
            <span className={primitives.resultEyebrow}>drama forecast</span>
            <p className={drama.tierLabel}>{tier.label}</p>
            <p className={primitives.resultBody}>{tier.body}</p>

            {top3.length > 0 && (
              <>
                <div className={drama.divider} />
                <span className={primitives.resultEyebrow}>
                  your top {top3.length} drama trigger{top3.length === 1 ? '' : 's'}
                </span>
                <ol className={drama.triggerList}>
                  {top3.map((t, idx) => (
                    <li key={t.id} className={drama.triggerItem}>
                      <span className={drama.triggerIdx}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className={drama.triggerIssue}>{t.issue}</h3>
                        <p className={drama.triggerWhy}>{t.why}</p>
                        <p className={drama.triggerDefuse}>
                          <strong>Defuse:</strong> {t.defuse}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}

            <button
              type="button"
              className={styles.resetBtn}
              onClick={reset}
              style={{ marginTop: 24 }}
            >
              ↻ retake the assessment
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
