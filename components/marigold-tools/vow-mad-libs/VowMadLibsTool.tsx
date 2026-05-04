"use client";

import { useState } from "react";

import styles from "./VowMadLibsTool.module.css";

interface FieldDef {
  key: keyof Answers;
  label: string;
  helper?: string;
  placeholder: string;
  rows?: number;
}

interface Answers {
  meet: string;
  word: string;
  quirk: string;
  introduced: string;
  insideJoke: string;
  always: string;
  never: string;
  knew: string;
}

const FIELDS: FieldDef[] = [
  {
    key: "meet",
    label: "How did you meet?",
    placeholder: "a friend's birthday in 2019, his shirt was on backwards...",
    rows: 3,
  },
  {
    key: "word",
    label: "One word that describes your partner",
    placeholder: "stubborn (in the best way)",
  },
  {
    key: "quirk",
    label: "Something they do that drives you crazy",
    placeholder: "narrates everything they're doing in the kitchen...",
    rows: 2,
  },
  {
    key: "introduced",
    label: "Something you love that they introduced you to",
    placeholder: "filter coffee, sci-fi novels, his mom's biryani...",
    rows: 2,
  },
  {
    key: "insideJoke",
    label: "An inside joke only you two understand",
    placeholder: "the airport in Hyderabad, the cold pakora incident...",
    rows: 2,
  },
  {
    key: "always",
    label: "One thing you promise to always do",
    placeholder: "make you chai before you ask",
    rows: 2,
  },
  {
    key: "never",
    label: "One thing you promise to never do",
    placeholder: "side with the aunties",
    rows: 2,
  },
  {
    key: "knew",
    label: "How you knew they were the one",
    placeholder: "you handled my whole family at the same time and didn't flinch...",
    rows: 3,
  },
];

const EMPTY: Answers = {
  meet: "",
  word: "",
  quirk: "",
  introduced: "",
  insideJoke: "",
  always: "",
  never: "",
  knew: "",
};

type Stage = "intake" | "loading" | "result" | "error";

export function VowMadLibsTool() {
  const [stage, setStage] = useState<Stage>("intake");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [vow, setVow] = useState("");
  const [copied, setCopied] = useState(false);

  const field = FIELDS[step];
  const total = FIELDS.length;
  const value = answers[field.key];
  const isLast = step === total - 1;
  const canAdvance = value.trim().length > 0;

  function update(key: keyof Answers, v: string) {
    setAnswers((prev) => ({ ...prev, [key]: v.slice(0, 400) }));
  }

  async function generate(currentAnswers: Answers) {
    setStage("loading");
    try {
      const res = await fetch("/api/tools/vow-mad-libs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: currentAnswers }),
      });
      if (!res.ok) throw new Error("bad-status");
      const data = (await res.json()) as { ok: boolean; vow: string };
      if (!data.ok || !data.vow) throw new Error("no-vow");
      setVow(data.vow);
      setStage("result");
      requestAnimationFrame(() => {
        document
          .getElementById("vow-output")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setStage("error");
    }
  }

  function handleNext() {
    if (!canAdvance) return;
    if (isLast) {
      void generate(answers);
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  function handleCopy() {
    if (!vow) return;
    void navigator.clipboard.writeText(vow).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handleRegenerate() {
    void generate(answers);
  }

  function handleStartOver() {
    setStep(0);
    setAnswers(EMPTY);
    setVow("");
    setStage("intake");
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {stage === "intake" && step === 0 && (
          <div className={styles.introCard}>
            <span className={styles.scrawl}>✿ vow mad libs</span>
            <h1 className={styles.heading}>
              Fill in the blanks. Get a <em>vow</em>.
            </h1>
            <p className={styles.sub}>
              Eight tiny questions, one delightfully unhinged draft. Not the real
              vow — just the one your group chat will read aloud at the next
              brunch.
            </p>
            <div className={styles.metaRow}>
              <span className={styles.metaPill}>2 minutes</span>
              <span className={styles.metaPill}>8 questions</span>
              <span className={styles.metaPill}>Screenshot-ready</span>
              <span className={styles.metaPill}>No signup</span>
            </div>
          </div>
        )}

        {stage === "intake" && (
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
            <h2 className={styles.qHeading}>{field.label}</h2>
            {field.helper && <p className={styles.helper}>{field.helper}</p>}

            {field.rows && field.rows > 1 ? (
              <textarea
                className={styles.textarea}
                value={value}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows}
                autoFocus
              />
            ) : (
              <input
                className={styles.input}
                type="text"
                value={value}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                autoFocus
              />
            )}

            <div className={styles.actions}>
              {step > 0 ? (
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={handleBack}
                >
                  ← back
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleNext}
                disabled={!canAdvance}
              >
                {isLast ? "Generate my vow ✿" : "Next →"}
              </button>
            </div>
          </div>
        )}

        {stage === "loading" && (
          <div className={styles.loading} aria-live="polite">
            <p className={styles.loadingText}>
              writing your vow
              <span className={styles.dot} aria-hidden="true" />
            </p>
            <p className={styles.loadingSub}>
              ✿ pulling out the dramatic punctuation, just for you
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className={styles.errorCard}>
            <h2 className={styles.errorTitle}>The muse is offline.</h2>
            <p className={styles.errorBody}>
              Couldn&apos;t reach the vow generator just now. Try again — your
              answers are still here.
            </p>
            <div className={styles.errorActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleRegenerate}
              >
                Try again →
              </button>
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleStartOver}
              >
                start over
              </button>
            </div>
          </div>
        )}

        {stage === "result" && (
          <>
            <article id="vow-output" className={styles.output}>
              <header className={styles.outputHeader}>
                <span className={styles.outputScrawl}>✿ your vow, slightly theatrical</span>
                <h2 className={styles.outputTitle}>
                  A draft, with <em>feelings</em>.
                </h2>
              </header>

              <div className={styles.vowBody}>
                {vow.split(/\n\s*\n/).map((para, i) => (
                  <p key={i} className={styles.vowPara}>
                    {para.trim()}
                  </p>
                ))}
              </div>

              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleCopy}
                  data-copied={copied || undefined}
                >
                  {copied ? "Copied ✓" : "Copy vow"}
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleRegenerate}
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleStartOver}
                >
                  Start over
                </button>
              </div>
            </article>

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
