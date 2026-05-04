"use client";

import { useState } from "react";

import styles from "./PersonalityQuiz.module.css";

type Letter = "A" | "B" | "C" | "D";

interface Choice {
  letter: Letter;
  label: string;
}

interface Question {
  prompt: string;
  choices: Choice[];
}

const QUESTIONS: Question[] = [
  {
    prompt: "It's 6 months until your wedding. What's your vibe?",
    choices: [
      { letter: "A", label: "I have a color-coded binder. And a backup binder." },
      { letter: "B", label: "I have a vision board and a Pinterest. That counts, right?" },
      { letter: "C", label: "I'm trusting the process. And my mom." },
      { letter: "D", label: "Wait — 6 months?!" },
    ],
  },
  {
    prompt: "Your caterer just raised their price by 15%. You…",
    choices: [
      { letter: "A", label: "Already negotiated this into the contract. Clause 4B." },
      { letter: "B", label: "Send a firm but polite email and find two backup options." },
      { letter: "C", label: "Ask my dad to handle it." },
      { letter: "D", label: "Panic, then handle it, then panic again." },
    ],
  },
  {
    prompt: "How do you feel about the aunty opinions?",
    choices: [
      { letter: "A", label: "I have a system. Some feedback goes in, most stays out." },
      { letter: "B", label: "I hear them. I do what I want. We're all happy." },
      { letter: "C", label: "The aunties ARE the planning committee." },
      { letter: "D", label: "Currently hiding from them." },
    ],
  },
  {
    prompt: "Your wedding aesthetic is closest to…",
    choices: [
      { letter: "A", label: "Editorial. Clean. Intentional." },
      { letter: "B", label: "Lush. Maximalist. Florals everywhere." },
      { letter: "C", label: "Traditional. Whatever my family did, but better." },
      { letter: "D", label: "I'll know it when I see it." },
    ],
  },
  {
    prompt: "Which of these stresses you out most?",
    choices: [
      { letter: "A", label: "Vendors not responding in writing." },
      { letter: "B", label: "The décor not matching my vision." },
      { letter: "C", label: "Family politics and seating charts." },
      { letter: "D", label: "Everything. Equally." },
    ],
  },
  {
    prompt: "Your partner's role in planning is…",
    choices: [
      { letter: "A", label: "Equal partner with assigned tasks and deadlines." },
      { letter: "B", label: "Creative collaborator with strong opinions." },
      { letter: "C", label: "Shows up when I tell them to." },
      { letter: "D", label: "Technically involved." },
    ],
  },
  {
    prompt: "Pick your wedding planning spirit animal:",
    choices: [
      { letter: "A", label: "Spreadsheet" },
      { letter: "B", label: "Mood board" },
      { letter: "C", label: "WhatsApp group" },
      { letter: "D", label: "Antacid" },
    ],
  },
];

const SCORES: Record<Letter, number> = { A: 4, B: 3, C: 2, D: 1 };

interface Archetype {
  id: string;
  name: string;
  scrawl: string;
  paragraphs: [string, string];
  strengths: [string, string, string];
}

const ARCHETYPES: Record<
  "control" | "vision" | "harmony" | "overwhelmed",
  Archetype
> = {
  control: {
    id: "control",
    name: "The Control Maharani",
    scrawl: "✿ in command",
    paragraphs: [
      "You are the CEO of this wedding. Color-coded. Clause-aware. Completely prepared. Your vendors are both impressed and slightly intimidated, and that is exactly how you like it.",
      "You don't trust the universe to deliver — you've drafted a contract, scheduled a follow-up, and built a contingency for the contingency. The wedding will run on time. Your aunties are amazed. Nothing is happening on your day that you didn't approve in writing.",
    ],
    strengths: [
      "Reads contracts the way other people read novels",
      "Has a system for the system",
      "Will not be surprised on her wedding day",
    ],
  },
  vision: {
    id: "vision",
    name: "The Vision Weaver",
    scrawl: "✿ a clear eye",
    paragraphs: [
      "You know exactly how it should look and feel, even if you can't always explain it. You lead with aesthetics and figure out the logistics as you go — and somehow, miraculously, it always comes together.",
      "Your Pinterest is a portfolio. Your vendors send you mood boards back hoping you'll approve. The whole wedding is going to feel like one cohesive editorial spread, because that's how your brain works — every napkin matters, every color is on purpose.",
    ],
    strengths: [
      "Can describe a feeling in three reference images",
      "Edits relentlessly — only the right florals make the cut",
      "Trusts her eye more than any vendor's portfolio",
    ],
  },
  harmony: {
    id: "harmony",
    name: "The Harmony Keeper",
    scrawl: "✿ holding it all",
    paragraphs: [
      "You're planning a wedding and managing a family production. You're a diplomat, a daughter, and a bride — and somehow making it all work, often by absorbing the things no one else wants to absorb.",
      "The Marigold knows: your wedding has at least three stakeholders before you and your partner even count. You translate between sides, you pre-empt arguments, you know which aunty needs to be seated by which uncle. The wedding will be beautiful. You deserve a spa day after.",
    ],
    strengths: [
      "Reads the WhatsApp group before anyone else does",
      "Defuses the mehndi-night drama before it lands",
      "Knows every relationship in the family tree",
    ],
  },
  overwhelmed: {
    id: "overwhelmed",
    name: "The Beautifully Overwhelmed",
    scrawl: "✿ deep breath",
    paragraphs: [
      "You want a stunning wedding, you love your partner, and you have no idea how any of this works yet. That's okay. That's literally what The Marigold is for.",
      "You're not behind — you're at the start. Most planning content was written for someone who already knows what 'venue lead time' means and you, very reasonably, do not. We'll meet you exactly where you are. Eight weeks from now, you'll feel like a different person.",
    ],
    strengths: [
      "Self-aware enough to ask for help — most of the internet isn't",
      "Open to the right system, not married to a wrong one",
      "Will have the most fun on the actual wedding day",
    ],
  },
};

function archetypeFor(score: number): Archetype {
  if (score >= 22) return ARCHETYPES.control;
  if (score >= 15) return ARCHETYPES.vision;
  if (score >= 8) return ARCHETYPES.harmony;
  return ARCHETYPES.overwhelmed;
}

const CTA_BY_ARCHETYPE: Record<string, string> = {
  control: "The Marigold was built for the Control Maharani.",
  vision: "The Marigold was built for the Vision Weaver.",
  harmony: "The Marigold was built for the Harmony Keeper.",
  overwhelmed: "The Marigold was built for the Beautifully Overwhelmed.",
};

type Stage = "welcome" | "questions" | "result";

export function PersonalityQuiz() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(Letter | null)[]>(
    () => Array(QUESTIONS.length).fill(null) as (Letter | null)[],
  );
  const [copied, setCopied] = useState(false);

  const total = QUESTIONS.length;

  function handleSelect(letter: Letter) {
    setAnswers((prev) => {
      const next = prev.slice();
      next[step] = letter;
      return next;
    });
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setStage("result");
    }
  }

  function handleBack() {
    if (step === 0) {
      setStage("welcome");
      return;
    }
    setStep(step - 1);
  }

  function handleRestart() {
    setStage("welcome");
    setStep(0);
    setAnswers(Array(QUESTIONS.length).fill(null) as (Letter | null)[]);
  }

  const score = answers.reduce<number>(
    (sum, a) => sum + (a ? SCORES[a] : 0),
    0,
  );
  const archetype = archetypeFor(score);

  function handleCopy() {
    if (stage !== "result") return;
    const lines = [
      `My wedding planning archetype: ${archetype.name}`,
      "",
      archetype.paragraphs[0],
      "",
      archetype.paragraphs[1],
      "",
      "— The Marigold · the math, the maps, the moves",
    ];
    void navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  async function handleShare() {
    if (stage !== "result") return;
    const text = `I'm ${archetype.name} — The Marigold's wedding planning quiz had me figured in 7 questions.`;
    type NavWithShare = Navigator & {
      share?: (data: { title?: string; text?: string }) => Promise<void>;
    };
    const nav = navigator as NavWithShare;
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: "My wedding planning archetype", text });
        return;
      } catch {
        // user dismissed
      }
    }
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {stage === "welcome" && (
          <div className={styles.introCard}>
            <span className={styles.scrawl}>✿ what's your wedding personality?</span>
            <h1 className={styles.heading}>
              Micromanager or <em>mystery bride?</em>
            </h1>
            <p className={styles.sub}>
              Seven questions, one slightly judgmental archetype, fully
              shareable. We've calibrated this on every desi WhatsApp group ever
              made.
            </p>
            <div className={styles.metaRow}>
              <span className={styles.metaPill}>2 minutes</span>
              <span className={styles.metaPill}>7 questions</span>
              <span className={styles.metaPill}>Built for screenshots</span>
              <span className={styles.metaPill}>No signup</span>
            </div>
            <button
              type="button"
              className={styles.cta}
              onClick={() => setStage("questions")}
            >
              Find my archetype →
            </button>
          </div>
        )}

        {stage === "questions" && (
          <div className={styles.card} key={step}>
            <span className={styles.eyebrow}>
              Question {step + 1} of {total}
            </span>
            <div className={styles.progressTrack}>
              <span
                className={styles.progressFill}
                style={{ width: `${((step + 1) / total) * 100}%` }}
              />
            </div>
            <h2 className={styles.qHeading}>{QUESTIONS[step].prompt}</h2>

            <div className={styles.choiceList}>
              {QUESTIONS[step].choices.map((c) => (
                <button
                  key={c.letter}
                  type="button"
                  className={styles.choiceBtn}
                  onClick={() => handleSelect(c.letter)}
                  aria-pressed={answers[step] === c.letter}
                >
                  <span className={styles.choiceLetter}>{c.letter}</span>
                  <span className={styles.choiceLabel}>{c.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleBack}
              >
                ← back
              </button>
              <span className={styles.skipNote}>tap an answer to continue</span>
            </div>
          </div>
        )}

        {stage === "result" && (
          <>
            <article className={styles.result}>
              <header className={styles.resultHeader}>
                <span className={styles.resultScrawl}>{archetype.scrawl}</span>
                <p className={styles.resultEyebrow}>You are…</p>
                <h2 className={styles.resultName}>
                  {archetype.name.split(" ").map((w, i) =>
                    w === "The" ? (
                      <span key={i} className={styles.theWord}>
                        {w}{" "}
                      </span>
                    ) : (
                      <span key={i}>{w} </span>
                    ),
                  )}
                </h2>
                <p className={styles.scoreNote}>
                  {score} / 28 · calibrated to your answers
                </p>
              </header>

              <div className={styles.resultBody}>
                {archetype.paragraphs.map((p, i) => (
                  <p key={i} className={styles.resultPara}>
                    {p}
                  </p>
                ))}
              </div>

              <div className={styles.strengths}>
                <p className={styles.strengthsLabel}>Your strengths</p>
                <ul className={styles.strengthsList}>
                  {archetype.strengths.map((s, i) => (
                    <li key={i} className={styles.strengthsItem}>
                      <span className={styles.bullet}>✦</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleCopy}
                  data-copied={copied || undefined}
                >
                  {copied ? "Copied ✓" : "Copy result"}
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleShare}
                >
                  Share
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleRestart}
                >
                  Retake
                </button>
              </div>
            </article>

            <p className={styles.archetypeCta}>
              {CTA_BY_ARCHETYPE[archetype.id]}{" "}
              <a href="/signup" className={styles.archetypeCtaLink}>
                Start planning here →
              </a>
            </p>

            <p className={styles.convert}>
              Want to save this and keep planning?{" "}
              <a href="/signup" className={styles.convertLink}>
                Make a free Marigold account →
              </a>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
