"use client";

import { useState } from "react";

import styles from "./WelcomeMessageTool.module.css";

const FEEL_OPTIONS = [
  { value: "Joyful", label: "Joyful" },
  { value: "Welcomed into our family", label: "Welcomed into our family" },
  { value: "Part of something historic", label: "Part of something historic" },
  {
    value: "Like they're at the best party of the year",
    label: "Like they're at the best party of the year",
  },
];

const ACKNOWLEDGE_OPTIONS = [
  "Out-of-town guests traveling far",
  "Guests unfamiliar with South Asian traditions",
  "Multi-generational family",
  "Mixed cultural backgrounds",
];

const TONE_OPTIONS = [
  { value: "Formal and elegant", label: "Formal and elegant" },
  { value: "Warm and conversational", label: "Warm and conversational" },
  { value: "Fun and a little funny", label: "Fun and a little funny" },
  { value: "A mix", label: "A mix" },
];

interface Input {
  meet: string;
  location: string;
  feel: string;
  feelOther: string;
  acknowledge: string[];
  tone: string;
}

const EMPTY: Input = {
  meet: "",
  location: "",
  feel: "",
  feelOther: "",
  acknowledge: [],
  tone: "",
};

interface Messages {
  website: string;
  program: string;
  ootBag: string;
  welcomeSign: string;
}

type Stage = "intake" | "loading" | "result" | "error";

const TOTAL_STEPS = 5;

interface CardSpec {
  key: keyof Messages;
  label: string;
  hint: string;
}

const CARDS: CardSpec[] = [
  { key: "website", label: "For your wedding website", hint: "150–200 words" },
  { key: "program", label: "For your ceremony program", hint: "75–100 words" },
  { key: "ootBag", label: "For your OOT bags", hint: "50–75 words" },
  { key: "welcomeSign", label: "For your welcome sign", hint: "3–5 lines" },
];

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function WelcomeMessageTool() {
  const [stage, setStage] = useState<Stage>("intake");
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<Input>(EMPTY);
  const [messages, setMessages] = useState<Messages | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function update<K extends keyof Input>(key: K, value: Input[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAcknowledge(v: string) {
    setInput((prev) => {
      const has = prev.acknowledge.includes(v);
      return {
        ...prev,
        acknowledge: has
          ? prev.acknowledge.filter((x) => x !== v)
          : [...prev.acknowledge, v],
      };
    });
  }

  function feelValid(): boolean {
    if (input.feel === "Other") return input.feelOther.trim().length > 0;
    return input.feel.length > 0;
  }

  function stepValid(s: number): boolean {
    if (s === 0) return input.meet.trim().length > 0;
    if (s === 1) return input.location.trim().length > 0;
    if (s === 2) return feelValid();
    if (s === 3) return true; // optional
    if (s === 4) return input.tone.length > 0;
    return false;
  }

  function handleNext() {
    if (!stepValid(step)) return;
    if (step === TOTAL_STEPS - 1) {
      void generate();
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  async function generate() {
    setStage("loading");
    const feel =
      input.feel === "Other" ? input.feelOther.trim() : input.feel;
    try {
      const res = await fetch("/api/tools/welcome-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            meet: input.meet,
            location: input.location,
            feel,
            acknowledge: input.acknowledge,
            tone: input.tone,
          },
        }),
      });
      if (!res.ok) throw new Error("bad-status");
      const data = (await res.json()) as { ok: boolean; messages: Messages | null };
      if (!data.ok || !data.messages) throw new Error("no-messages");
      setMessages(data.messages);
      setStage("result");
      requestAnimationFrame(() => {
        document
          .getElementById("welcome-output")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setStage("error");
    }
  }

  function handleStartOver() {
    setStage("intake");
    setStep(0);
    setInput(EMPTY);
    setMessages(null);
  }

  function handleCopy(key: keyof Messages) {
    if (!messages) return;
    void navigator.clipboard.writeText(messages[key]).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1600);
    });
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {stage === "intake" && step === 0 && (
          <div className={styles.introCard}>
            <span className={styles.scrawl}>✿ welcome message generator</span>
            <h1 className={styles.heading}>
              The words for your <em>website,</em> programs, and OOT bags.
            </h1>
            <p className={styles.sub}>
              Five questions about your story. Four versions back — formatted
              for exactly where each one will go. Specific to you, not pulled
              from a template.
            </p>
            <div className={styles.metaRow}>
              <span className={styles.metaPill}>2 minutes</span>
              <span className={styles.metaPill}>5 questions</span>
              <span className={styles.metaPill}>4 ready-to-paste versions</span>
              <span className={styles.metaPill}>No signup</span>
            </div>
          </div>
        )}

        {stage === "intake" && (
          <div className={styles.card} key={step}>
            <span className={styles.eyebrow}>
              Question {step + 1} of {TOTAL_STEPS}
            </span>
            <div className={styles.progressTrack}>
              <span
                className={styles.progressFill}
                style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              />
            </div>

            {step === 0 && (
              <>
                <h2 className={styles.qHeading}>How did you meet?</h2>
                <p className={styles.helper}>
                  One to three sentences. The detail that makes it yours.
                </p>
                <textarea
                  className={styles.textarea}
                  value={input.meet}
                  onChange={(e) => update("meet", e.target.value.slice(0, 600))}
                  placeholder="we matched on Hinge in 2021, his first message was a typo, neither of us has let it go..."
                  rows={4}
                  autoFocus
                />
              </>
            )}

            {step === 1 && (
              <>
                <h2 className={styles.qHeading}>
                  Where are you getting married, and why does that place matter?
                </h2>
                <textarea
                  className={styles.textarea}
                  value={input.location}
                  onChange={(e) =>
                    update("location", e.target.value.slice(0, 400))
                  }
                  placeholder="Dallas, where his parents settled in '94 — the only place that feels like home to both of our families..."
                  rows={3}
                  autoFocus
                />
              </>
            )}

            {step === 2 && (
              <>
                <h2 className={styles.qHeading}>
                  One thing you want guests to feel?
                </h2>
                <div className={styles.choiceList}>
                  {FEEL_OPTIONS.map((c) => {
                    const selected = input.feel === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        className={styles.choiceBtn}
                        aria-pressed={selected}
                        onClick={() => update("feel", c.value)}
                      >
                        <span className={styles.choiceLabel}>{c.label}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className={styles.choiceBtn}
                    aria-pressed={input.feel === "Other"}
                    onClick={() => update("feel", "Other")}
                  >
                    <span className={styles.choiceLabel}>Other (write your own)</span>
                  </button>
                </div>
                {input.feel === "Other" && (
                  <input
                    className={styles.input}
                    type="text"
                    value={input.feelOther}
                    onChange={(e) =>
                      update("feelOther", e.target.value.slice(0, 200))
                    }
                    placeholder="like they're inside a movie, like they're the family we chose..."
                    autoFocus
                  />
                )}
              </>
            )}

            {step === 3 && (
              <>
                <h2 className={styles.qHeading}>
                  Any specific guests to acknowledge?
                </h2>
                <p className={styles.helper}>
                  Optional. Pick everything that fits — we&apos;ll weave it in
                  where it makes sense.
                </p>
                <div className={styles.checkGrid}>
                  {ACKNOWLEDGE_OPTIONS.map((c) => {
                    const selected = input.acknowledge.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        className={styles.checkBtn}
                        aria-pressed={selected}
                        onClick={() => toggleAcknowledge(c)}
                      >
                        <span className={styles.checkBox} aria-hidden="true">
                          {selected ? "✓" : ""}
                        </span>
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className={styles.qHeading}>Tone preference?</h2>
                <div className={styles.choiceList}>
                  {TONE_OPTIONS.map((c) => {
                    const selected = input.tone === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        className={styles.choiceBtn}
                        aria-pressed={selected}
                        onClick={() => update("tone", c.value)}
                      >
                        <span className={styles.choiceLabel}>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleBack}
                disabled={step === 0}
              >
                ← back
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleNext}
                disabled={!stepValid(step)}
              >
                {step === TOTAL_STEPS - 1
                  ? "Write my messages →"
                  : "Next →"}
              </button>
            </div>
          </div>
        )}

        {stage === "loading" && (
          <div className={styles.loading} aria-live="polite">
            <p className={styles.loadingText}>
              writing four versions
              <span className={styles.dot} aria-hidden="true" />
            </p>
            <p className={styles.loadingSub}>
              ✿ each one tuned to where it goes
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className={styles.errorCard}>
            <h2 className={styles.errorTitle}>The wordsmith is offline.</h2>
            <p className={styles.errorBody}>
              Couldn&apos;t reach the message generator just now. Try again —
              your answers are still here.
            </p>
            <div className={styles.errorActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={generate}
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

        {stage === "result" && messages && (
          <>
            <article id="welcome-output" className={styles.output}>
              <header className={styles.outputHeader}>
                <span className={styles.outputScrawl}>
                  ✿ four versions, ready to paste
                </span>
                <h2 className={styles.outputTitle}>
                  Your <em>welcome</em>
                </h2>
                <p className={styles.outputSub}>
                  website · program · OOT bag · welcome sign
                </p>
              </header>

              <div className={styles.cardGrid}>
                {CARDS.map((c) => {
                  const text = messages[c.key];
                  const wc = wordCount(text);
                  const isSign = c.key === "welcomeSign";
                  return (
                    <article key={c.key} className={styles.msgCard}>
                      <div className={styles.msgHead}>
                        <p className={styles.msgLabel}>{c.label}</p>
                        <span className={styles.msgHint}>
                          {c.hint} · {wc} word{wc === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div
                        className={
                          isSign ? styles.msgBodySign : styles.msgBody
                        }
                      >
                        {isSign
                          ? text.split(/\n+/).map((line, i) => (
                              <p key={i} className={styles.signLine}>
                                {line.trim()}
                              </p>
                            ))
                          : text.split(/\n\s*\n/).map((para, i) => (
                              <p key={i} className={styles.msgPara}>
                                {para.trim()}
                              </p>
                            ))}
                      </div>
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => handleCopy(c.key)}
                        data-copied={copiedKey === c.key || undefined}
                      >
                        {copiedKey === c.key ? "Copied ✓" : "Copy"}
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={generate}
                >
                  Regenerate all
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
