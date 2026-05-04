"use client";

import { useState } from "react";

import { buildQuestionSet, type Length, type Vibe } from "./questions";
import styles from "./ShoeGameTool.module.css";

interface GeneratedSet {
  questions: string[];
  customCount: number;
  customAttempted: boolean;
}

const LENGTH_OPTIONS: Array<{ value: Length; label: string }> = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
];

const VIBE_OPTIONS: Array<{ value: Vibe; label: string }> = [
  { value: "wholesome", label: "Wholesome" },
  { value: "roast", label: "Roast-worthy" },
  { value: "mix", label: "Mix of both" },
];

const MC_INSTRUCTIONS =
  "Read each question aloud. Each partner raises the shoe of whoever they think the answer applies to. No peeking, no whispering, no aunty assists.";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildPrintHTML(opts: {
  questions: string[];
  customStartIndex: number;
}): string {
  const { questions, customStartIndex } = opts;
  const items = questions
    .map((q, i) => {
      const isCustom = customStartIndex >= 0 && i >= customStartIndex;
      const num = String(i + 1).padStart(2, "0");
      const customMark = isCustom
        ? `<span class="custom-mark">✦ made for them</span>`
        : "";
      return `<li><span class="num">${num}</span><span class="text">${customMark}${escapeHtml(q)}</span></li>`;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>The Shoe Game — for the MC</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Instrument+Serif:ital@0;1&family=Syne:wght@600;700&display=swap" rel="stylesheet">
<style>
  @page { size: letter; margin: 0.55in; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Instrument Serif', Georgia, serif;
    color: #4B1528;
    background: #FFF8F2;
    padding: 28px 24px 24px;
    line-height: 1.5;
  }
  .head {
    text-align: center;
    border-bottom: 1px dashed rgba(75, 21, 40, 0.25);
    padding-bottom: 18px;
    margin-bottom: 22px;
  }
  .scrawl {
    font-family: 'Caveat', cursive;
    font-size: 22px;
    color: #D4537E;
    margin: 0 0 4px;
    transform: rotate(-1.5deg);
    display: inline-block;
  }
  h1 {
    font-style: italic;
    font-weight: 400;
    font-size: 36px;
    color: #4B1528;
    margin: 0 0 10px;
    line-height: 1.05;
  }
  h1 em { color: #D4537E; }
  .mc {
    font-style: italic;
    font-size: 14px;
    color: #8A6070;
    max-width: 540px;
    margin: 0 auto;
  }
  ol { list-style: none; padding: 0; margin: 0; }
  li {
    display: grid;
    grid-template-columns: 38px 1fr;
    gap: 10px;
    align-items: baseline;
    font-size: 17px;
    color: #4B1528;
    padding: 10px 0;
    border-bottom: 1px solid rgba(75, 21, 40, 0.1);
    page-break-inside: avoid;
  }
  li .num {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 1.4px;
    color: #D4537E;
    padding-top: 3px;
  }
  .custom-mark {
    display: block;
    font-family: 'Caveat', cursive;
    font-style: normal;
    font-size: 15px;
    color: #D4537E;
    margin-bottom: 2px;
    transform: rotate(-0.5deg);
  }
  .footer {
    margin-top: 22px;
    text-align: center;
    font-family: 'Syne', sans-serif;
    font-size: 9px;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: #8A6070;
  }
</style>
</head>
<body>
  <div class="head">
    <span class="scrawl">✿ the shoe game</span>
    <h1>Questions for the <em>couple</em></h1>
    <p class="mc">${escapeHtml(MC_INSTRUCTIONS)}</p>
  </div>
  <ol>${items}</ol>
  <p class="footer">The Marigold · the math, the moves</p>
  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 250); });</script>
</body>
</html>`;
}

export function ShoeGameTool() {
  const [length, setLength] = useState<Length>(10);
  const [vibe, setVibe] = useState<Vibe>("mix");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedSet | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setCopied(false);

    const baseQuestions = buildQuestionSet({ length, vibe });
    const trimmedDetail = detail.trim();

    let customQuestions: string[] = [];
    let customAttempted = false;

    if (trimmedDetail.length > 0) {
      customAttempted = true;
      try {
        const res = await fetch("/api/tools/shoe-game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ detail: trimmedDetail }),
        });
        if (res.ok) {
          const data = (await res.json()) as { ok: boolean; questions: string[] };
          if (data.ok && Array.isArray(data.questions)) {
            customQuestions = data.questions.slice(0, 3);
          }
        }
      } catch {
        // Silent fallback — the static set still ships.
      }
    }

    setResult({
      questions: [...baseQuestions, ...customQuestions],
      customCount: customQuestions.length,
      customAttempted,
    });
    setLoading(false);

    requestAnimationFrame(() => {
      document.getElementById("shoe-game-output")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleCopy() {
    if (!result) return;
    const lines = [
      "THE SHOE GAME — for the MC",
      "",
      MC_INSTRUCTIONS,
      "",
      ...result.questions.map((q, i) => `${i + 1}. ${q}`),
    ];
    void navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handleDownload() {
    if (!result) return;
    const customStart =
      result.customCount > 0 ? result.questions.length - result.customCount : -1;
    const html = buildPrintHTML({
      questions: result.questions,
      customStartIndex: customStart,
    });
    const w = window.open("", "_blank", "noopener,noreferrer,width=820,height=900");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  async function handleShare() {
    if (!result) return;
    const text = `Our Shoe Game questions ↓\n\n${result.questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n")}\n\n— built on The Marigold`;
    type NavWithShare = Navigator & {
      share?: (data: { title?: string; text?: string }) => Promise<void>;
    };
    const nav = navigator as NavWithShare;
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: "Our Shoe Game set", text });
        return;
      } catch {
        // user dismissed — fall through to clipboard
      }
    }
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const customStartIndex =
    result && result.customCount > 0
      ? result.questions.length - result.customCount
      : -1;
  const vibeLabel =
    VIBE_OPTIONS.find((v) => v.value === vibe)?.label.toLowerCase() ?? "";

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.introCard}>
          <span className={styles.scrawl}>✿ the shoe game</span>
          <h1 className={styles.heading}>
            The set that turns your reception into the <em>group chat</em>.
          </h1>
          <p className={styles.sub}>
            Sit back-to-back. One of your shoes, one of theirs. Raise whichever
            one fits. Custom questions, MC-ready, screenshot-friendly. No aunty
            input required (she'll have notes anyway).
          </p>
          <div className={styles.metaRow}>
            <span className={styles.metaPill}>2 minutes</span>
            <span className={styles.metaPill}>15–25 questions</span>
            <span className={styles.metaPill}>Print-ready</span>
            <span className={styles.metaPill}>No signup</span>
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.field}>
            <label className={styles.label}>How long should it run?</label>
            <div className={styles.optionRow} role="radiogroup">
              {LENGTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={styles.option}
                  aria-pressed={length === opt.value}
                  onClick={() => setLength(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Vibe</label>
            <div className={styles.optionRow} role="radiogroup">
              {VIBE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={styles.option}
                  aria-pressed={vibe === opt.value}
                  onClick={() => setVibe(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="shoe-game-detail" className={styles.label}>
              Tell us one thing about the two of you
              <span className={styles.optional}>· optional</span>
            </label>
            <textarea
              id="shoe-game-detail"
              className={styles.textarea}
              value={detail}
              onChange={(e) => setDetail(e.target.value.slice(0, 500))}
              placeholder="he's always late, she's the planner of the friend group..."
              rows={3}
            />
            <p className={styles.helper}>
              We'll write 3 extra questions just for you two — the kind that
              gets a shriek from the back table.
            </p>
          </div>

          <div className={styles.ctaWrap}>
            <button
              type="button"
              className={styles.cta}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Cooking..." : "Generate the set →"}
            </button>
          </div>
        </div>

        {loading && (
          <div className={styles.loading} aria-live="polite">
            <p className={styles.loadingText}>
              writing your questions
              <span className={styles.dot} aria-hidden="true" />
            </p>
          </div>
        )}

        {result && !loading && (
          <>
            <article id="shoe-game-output" className={styles.output}>
              <header className={styles.outputHeader}>
                <span className={styles.outputScrawl}>✿ hot off the press</span>
                <h2 className={styles.outputTitle}>
                  Your <em>Shoe Game</em> set
                </h2>
                <p className={styles.outputSub}>
                  <em>{result.questions.length}</em> questions ·{" "}
                  <em>{length} min</em> · <em>{vibeLabel}</em>
                </p>
              </header>

              <p className={styles.mcInstructions}>{MC_INSTRUCTIONS}</p>

              <ol className={styles.questionList}>
                {result.questions.map((q, i) => (
                  <li
                    className={styles.questionItem}
                    key={i}
                    data-custom={i === customStartIndex ? "true" : undefined}
                  >
                    {q}
                  </li>
                ))}
              </ol>

              {result.customAttempted && result.customCount === 0 && (
                <p className={styles.fallbackNote}>
                  Couldn't reach the custom-question generator just now — the
                  curated set above still slaps.
                </p>
              )}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleCopy}
                  data-copied={copied || undefined}
                >
                  {copied ? "Copied ✓" : "Copy all"}
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleDownload}
                >
                  Print / PDF
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleShare}
                >
                  Share
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
