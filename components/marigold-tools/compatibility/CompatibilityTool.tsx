"use client";

import { useEffect, useMemo, useState } from "react";

import {
  QUESTIONS,
  compareAnswers,
  decodeAnswers,
  encodeAnswers,
  tierFor,
  type Letter,
} from "./questions";
import styles from "./CompatibilityTool.module.css";

type Mode = "together" | "share";
type PartnerSlot = "P1" | "P2";

type Stage =
  | "welcome"
  | "p1-questions"
  | "p1-handoff" // hand-the-phone screen between partners (together mode)
  | "p2-questions"
  | "p1-share-ready" // share-mode: partner 1 has finished, show link
  | "p2-arrived" // share-mode: partner 2 just opened the link
  | "result";

const TOTAL = QUESTIONS.length;

function emptyAnswers(): (Letter | null)[] {
  return Array(TOTAL).fill(null) as (Letter | null)[];
}

function isComplete(arr: (Letter | null)[]): arr is Letter[] {
  return arr.every((a) => a !== null);
}

export function CompatibilityTool() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [mode, setMode] = useState<Mode>("together");
  const [step, setStep] = useState(0);
  const [partner, setPartner] = useState<PartnerSlot>("P1");
  const [p1Answers, setP1Answers] = useState<(Letter | null)[]>(emptyAnswers);
  const [p2Answers, setP2Answers] = useState<(Letter | null)[]>(emptyAnswers);
  const [shareUrl, setShareUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [resultCopied, setResultCopied] = useState(false);

  // On mount: detect ?p1=... in URL → partner 2 just arrived from a share link.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("p1");
    if (!token) return;
    const decoded = decodeAnswers(token);
    if (!decoded) return;
    setMode("share");
    setP1Answers(decoded);
    setPartner("P2");
    setStep(0);
    setStage("p2-arrived");
  }, []);

  function startTogether() {
    setMode("together");
    setPartner("P1");
    setStep(0);
    setP1Answers(emptyAnswers());
    setP2Answers(emptyAnswers());
    setStage("p1-questions");
  }

  function startShare() {
    setMode("share");
    setPartner("P1");
    setStep(0);
    setP1Answers(emptyAnswers());
    setP2Answers(emptyAnswers());
    setStage("p1-questions");
  }

  function selectAnswer(letter: Letter) {
    if (partner === "P1") {
      const next = p1Answers.slice();
      next[step] = letter;
      setP1Answers(next);
      if (step < TOTAL - 1) {
        setStep(step + 1);
      } else {
        if (mode === "together") {
          setStage("p1-handoff");
        } else {
          // share mode: build the URL for partner 2 and show it.
          if (isComplete(next)) {
            const token = encodeAnswers(next);
            const url = `${window.location.origin}${window.location.pathname}?p1=${token}`;
            setShareUrl(url);
            setStage("p1-share-ready");
          }
        }
      }
    } else {
      const next = p2Answers.slice();
      next[step] = letter;
      setP2Answers(next);
      if (step < TOTAL - 1) {
        setStep(step + 1);
      } else {
        setStage("result");
      }
    }
  }

  function handleBack() {
    if (step === 0) return;
    setStep(step - 1);
  }

  function handP2() {
    setPartner("P2");
    setStep(0);
    setStage("p2-questions");
  }

  function p2Begin() {
    setStep(0);
    setStage("p2-questions");
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
  }

  async function shareLink() {
    if (!shareUrl) return;
    type NavWithShare = Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    };
    const nav = navigator as NavWithShare;
    const text = "I took the Marigold compatibility quiz. Now your turn — same 10 questions.";
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: "Compatibility quiz — your turn", text, url: shareUrl });
        return;
      } catch {
        // user dismissed
      }
    }
    await copyLink();
  }

  function restart() {
    setStage("welcome");
    setMode("together");
    setPartner("P1");
    setStep(0);
    setP1Answers(emptyAnswers());
    setP2Answers(emptyAnswers());
    setShareUrl("");
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  const result = useMemo(() => {
    if (stage !== "result") return null;
    if (!isComplete(p1Answers) || !isComplete(p2Answers)) return null;
    return compareAnswers(p1Answers, p2Answers);
  }, [stage, p1Answers, p2Answers]);

  const tier = result ? tierFor(result.score) : null;

  function copyResult() {
    if (!result || !tier) return;
    const lines = [
      `Compatibility score: ${result.score} / 100`,
      `Tier: ${tier.name} — ${tier.blurb}`,
      "",
      "Top agreements:",
      ...result.agreements.slice(0, 3).map((a) => `· ${a.question.prompt}`),
    ];
    if (result.biggestDivergence) {
      lines.push("");
      lines.push(
        `Worth a conversation: ${result.biggestDivergence.question.topic}`,
      );
    }
    lines.push("");
    lines.push("— The Marigold · the math, the maps, the moves");
    void navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setResultCopied(true);
      setTimeout(() => setResultCopied(false), 1800);
    });
  }

  async function shareResult() {
    if (!result || !tier) return;
    const text = `${tier.name} — we scored ${result.score}/100 on the Marigold compatibility quiz.`;
    type NavWithShare = Navigator & {
      share?: (data: { title?: string; text?: string }) => Promise<void>;
    };
    const nav = navigator as NavWithShare;
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: "Our compatibility score", text });
        return;
      } catch {
        // dismissed
      }
    }
    void navigator.clipboard.writeText(text).then(() => {
      setResultCopied(true);
      setTimeout(() => setResultCopied(false), 1800);
    });
  }

  // ── render ───────────────────────────────────────────────────────────────

  const currentAnswers = partner === "P1" ? p1Answers : p2Answers;
  const currentQuestion = QUESTIONS[step];

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {stage === "welcome" && (
          <div className={styles.introCard}>
            <span className={styles.scrawl}>✿ couple compatibility</span>
            <h1 className={styles.heading}>
              Answer separately. <em>Compare</em>. Survive.
            </h1>
            <p className={styles.sub}>
              Ten questions, both of you, no peeking. We&apos;ll show you where
              you sync — and the one thing that&apos;s probably worth a
              conversation.
            </p>
            <div className={styles.metaRow}>
              <span className={styles.metaPill}>2 minutes each</span>
              <span className={styles.metaPill}>10 questions</span>
              <span className={styles.metaPill}>Shareable result</span>
              <span className={styles.metaPill}>No signup</span>
            </div>
            <div className={styles.modeRow}>
              <button
                type="button"
                className={styles.modeBtn}
                onClick={startTogether}
              >
                <span className={styles.modeLabel}>Play together</span>
                <span className={styles.modeSub}>
                  Same device, pass the phone. The classic.
                </span>
              </button>
              <button
                type="button"
                className={styles.modeBtn}
                onClick={startShare}
              >
                <span className={styles.modeLabel}>Share with my partner</span>
                <span className={styles.modeSub}>
                  You answer first. We&apos;ll generate a link to send them.
                </span>
              </button>
            </div>
          </div>
        )}

        {(stage === "p1-questions" || stage === "p2-questions") && (
          <div className={styles.card} key={`${partner}-${step}`}>
            <span className={styles.eyebrow}>
              {partner === "P1" ? "Partner 1" : "Partner 2"} · Question {step + 1} of {TOTAL}
            </span>
            <div className={styles.progressTrack}>
              <span
                className={styles.progressFill}
                style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
              />
            </div>
            <h2 className={styles.qHeading}>{currentQuestion.prompt}</h2>

            <div className={styles.choiceList}>
              {(["A", "B", "C", "D"] as Letter[]).map((letter) => (
                <button
                  key={letter}
                  type="button"
                  className={styles.choiceBtn}
                  onClick={() => selectAnswer(letter)}
                  aria-pressed={currentAnswers[step] === letter}
                >
                  <span className={styles.choiceLetter}>{letter}</span>
                  <span className={styles.choiceLabel}>
                    {currentQuestion.choices[letter]}
                  </span>
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleBack}
                disabled={step === 0}
              >
                ← back
              </button>
              <span className={styles.skipNote}>tap an answer to continue</span>
            </div>
          </div>
        )}

        {stage === "p1-handoff" && (
          <div className={styles.handoffCard}>
            <span className={styles.scrawl}>✿ pass the phone</span>
            <h2 className={styles.handoffHeading}>
              Now hand it to <em>your partner</em>.
            </h2>
            <p className={styles.handoffBody}>
              Partner 1 — you&apos;re done. We&apos;ve hidden your answers so
              there&apos;s no peeking. Hand the phone over.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handP2}
            >
              I&apos;m partner 2 — let&apos;s go →
            </button>
          </div>
        )}

        {stage === "p1-share-ready" && (
          <div className={styles.handoffCard}>
            <span className={styles.scrawl}>✿ your link is ready</span>
            <h2 className={styles.handoffHeading}>
              Send this to <em>your partner</em>.
            </h2>
            <p className={styles.handoffBody}>
              When they finish, the result will show on their screen — and
              you&apos;ll both see how aligned you actually are.
            </p>
            <div className={styles.shareLinkBox}>
              <code className={styles.shareLink}>{shareUrl}</code>
            </div>
            <div className={styles.shareActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={shareLink}
              >
                {linkCopied ? "Copied ✓" : "Share / Copy link →"}
              </button>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={copyLink}
                data-copied={linkCopied || undefined}
              >
                {linkCopied ? "Copied ✓" : "Copy link"}
              </button>
            </div>
          </div>
        )}

        {stage === "p2-arrived" && (
          <div className={styles.handoffCard}>
            <span className={styles.scrawl}>✿ your partner played</span>
            <h2 className={styles.handoffHeading}>
              Your turn — <em>10 questions</em>.
            </h2>
            <p className={styles.handoffBody}>
              They&apos;ve already answered. We&apos;ve hidden their picks so
              you can answer honestly. When you finish, the result reveals for
              both of you.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={p2Begin}
            >
              Start the quiz →
            </button>
          </div>
        )}

        {stage === "result" && result && tier && (
          <>
            <article className={styles.result}>
              <div className={styles.resultHeader}>
                <span className={styles.resultScrawl}>✿ here&apos;s the math</span>
                <p className={styles.resultEyebrow}>Your score</p>
                <div className={styles.scoreNumber}>{result.score}</div>
                <p className={styles.scoreOutOf}>out of 100</p>
                <h2 className={styles.tierName}>{tier.name}</h2>
                <p className={styles.tierBlurb}>{tier.blurb}</p>
              </div>

              {result.agreements.length > 0 && (
                <section className={styles.section3}>
                  <p className={styles.sectionLabel}>Top agreements</p>
                  <ul className={styles.agreeList}>
                    {result.agreements.slice(0, 3).map((a) => (
                      <li key={a.question.id} className={styles.agreeItem}>
                        <span className={styles.agreeBullet}>✦</span>
                        <span>
                          You both {a.question.agreementHook}
                          <span className={styles.agreeAnswer}>
                            ({a.question.choices[a.p1]})
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.biggestDivergence && (
                <section className={styles.divergeCard}>
                  <p className={styles.sectionLabel}>Worth a conversation</p>
                  <p className={styles.divergeTopic}>
                    {result.biggestDivergence.question.topic}
                  </p>
                  <div className={styles.divergeRow}>
                    <div className={styles.divergeBubble}>
                      <span className={styles.divergeWho}>You</span>
                      <span className={styles.divergeAnswer}>
                        {result.biggestDivergence.question.choices[result.biggestDivergence.p1]}
                      </span>
                    </div>
                    <span className={styles.divergeVs}>vs.</span>
                    <div className={styles.divergeBubble}>
                      <span className={styles.divergeWho}>Partner</span>
                      <span className={styles.divergeAnswer}>
                        {result.biggestDivergence.question.choices[result.biggestDivergence.p2]}
                      </span>
                    </div>
                  </div>
                </section>
              )}

              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={copyResult}
                  data-copied={resultCopied || undefined}
                >
                  {resultCopied ? "Copied ✓" : "Copy result"}
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={shareResult}
                >
                  Share
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={restart}
                >
                  Play again
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
