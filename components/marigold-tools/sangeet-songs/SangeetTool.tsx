"use client";

import { useState } from "react";

import styles from "./SangeetTool.module.css";

type SingleQuestionId = "vibe" | "crowd" | "size" | "finale";

interface SingleQuestion {
  id: SingleQuestionId;
  prompt: string;
  helper?: string;
  choices: { value: string; label: string }[];
}

const SINGLE_QUESTIONS: SingleQuestion[] = [
  {
    id: "vibe",
    prompt: "Overall Sangeet vibe?",
    choices: [
      { value: "full-bollywood", label: "Full Bollywood — DDLJ era, nothing but classics" },
      { value: "new-bollywood", label: "New Bollywood — 2015 to now, filmy but fresh" },
      { value: "fusion", label: "Fusion — Bollywood + English/trending crossover" },
      { value: "surprise", label: "Surprise me — curate based on my other answers" },
    ],
  },
  {
    id: "crowd",
    prompt: "How bold is your family on the dance floor?",
    choices: [
      { value: "very", label: "Very — uncles will clear the floor, aunties join in" },
      { value: "moderate", label: "Moderate — a few key people carry it, rest watch" },
      { value: "shy", label: "Shy — need songs that pull people in gently" },
      { value: "performance", label: "It's a performance wedding — mostly choreography" },
    ],
  },
  {
    id: "size",
    prompt: "Sangeet size?",
    choices: [
      { value: "intimate", label: "Intimate (under 75)" },
      { value: "medium", label: "Medium (75–150)" },
      { value: "large", label: "Large (150–300)" },
      { value: "huge", label: "It's basically the wedding (300+)" },
    ],
  },
  {
    id: "finale",
    prompt: "What should the last song feel like?",
    choices: [
      { value: "euphoric", label: "Euphoric — peak energy, everyone on the floor" },
      { value: "emotional", label: "Emotional — brings it all together" },
      { value: "chaotic", label: "Fun and chaotic — the aunties are still dancing at midnight" },
      { value: "smooth", label: "Smooth landing — people leave happy, not exhausted" },
    ],
  },
];

const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "Hindi", label: "Hindi" },
  { value: "Punjabi", label: "Punjabi" },
  { value: "Tamil", label: "Tamil" },
  { value: "Telugu", label: "Telugu" },
  { value: "Gujarati", label: "Gujarati" },
  { value: "English only", label: "English only" },
  { value: "Surprise us", label: "Surprise us" },
];

interface Prefs {
  vibe: string;
  crowd: string;
  size: string;
  languages: string[];
  finale: string;
}

const EMPTY: Prefs = {
  vibe: "",
  crowd: "",
  size: "",
  languages: [],
  finale: "",
};

interface Song {
  title: string;
  artist: string;
}

interface Section {
  name: string;
  moodNote: string;
  songs: Song[];
}

type Stage = "intake" | "loading" | "result" | "error";

const TOTAL_STEPS = 5; // 4 single + 1 multi (languages)

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildPrintHTML(sections: Section[]): string {
  const items = sections
    .map((s) => {
      const songs = s.songs
        .map(
          (sg) =>
            `<li><strong>${escapeHtml(sg.title)}</strong><span class="artist"> · ${escapeHtml(sg.artist)}</span></li>`,
        )
        .join("");
      return `<section>
        <h2>${escapeHtml(s.name)}</h2>
        <p class="mood">${escapeHtml(s.moodNote)}</p>
        <ul>${songs}</ul>
      </section>`;
    })
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8" />
<title>Sangeet DJ Brief — The Marigold</title>
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
    margin: 0 0 6px;
    line-height: 1.05;
  }
  h1 em { color: #D4537E; }
  .lede {
    font-style: italic;
    font-size: 13px;
    color: #8A6070;
    margin: 0;
  }
  section {
    page-break-inside: avoid;
    margin-bottom: 22px;
    padding-bottom: 16px;
    border-bottom: 1px dashed rgba(75, 21, 40, 0.2);
  }
  section:last-child { border-bottom: none; }
  h2 {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    color: #D4537E;
    margin: 0 0 6px;
  }
  .mood {
    font-style: italic;
    font-size: 16px;
    color: #4B1528;
    margin: 0 0 10px;
  }
  ul { list-style: none; padding: 0; margin: 0; }
  li {
    font-size: 16px;
    color: #4B1528;
    padding: 6px 0;
    border-bottom: 1px dotted rgba(75, 21, 40, 0.1);
  }
  li:last-child { border-bottom: none; }
  li strong { font-style: italic; font-weight: 400; }
  .artist { font-family: 'Syne', sans-serif; font-size: 11px; letter-spacing: 0.6px; color: #8A6070; }
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
    <span class="scrawl">✿ for the DJ</span>
    <h1>The <em>Sangeet</em> Brief</h1>
    <p class="lede">Six sections, real songs, ready for the first DJ meeting.</p>
  </div>
  ${items}
  <p class="footer">The Marigold · the math, the maps, the moves</p>
  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 250); });</script>
</body></html>`;
}

export function SangeetTool() {
  const [stage, setStage] = useState<Stage>("intake");
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Prefs>(EMPTY);
  const [sections, setSections] = useState<Section[]>([]);
  const [copied, setCopied] = useState(false);

  function selectSingle(qid: SingleQuestionId, value: string) {
    setPrefs((prev) => ({ ...prev, [qid]: value }));
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  }

  function toggleLanguage(value: string) {
    setPrefs((prev) => {
      const has = prev.languages.includes(value);
      return {
        ...prev,
        languages: has
          ? prev.languages.filter((l) => l !== value)
          : [...prev.languages, value],
      };
    });
  }

  function handleBack() {
    if (step === 0) return;
    setStep(step - 1);
  }

  async function generate(p: Prefs) {
    setStage("loading");
    try {
      const res = await fetch("/api/tools/sangeet-songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefs: p }),
      });
      if (!res.ok) throw new Error("bad-status");
      const data = (await res.json()) as { ok: boolean; sections: Section[] };
      if (!data.ok || !Array.isArray(data.sections) || data.sections.length === 0) {
        throw new Error("no-sections");
      }
      setSections(data.sections);
      setStage("result");
      requestAnimationFrame(() => {
        document
          .getElementById("sangeet-output")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setStage("error");
    }
  }

  function handleGenerate() {
    if (prefs.languages.length === 0) return;
    void generate(prefs);
  }

  function handleStartOver() {
    setStage("intake");
    setStep(0);
    setPrefs(EMPTY);
    setSections([]);
  }

  function handleCopy() {
    if (sections.length === 0) return;
    const lines: string[] = ["SANGEET DJ BRIEF — The Marigold", ""];
    for (const s of sections) {
      lines.push(s.name.toUpperCase());
      lines.push(s.moodNote);
      for (const sg of s.songs) {
        lines.push(`  · ${sg.title} — ${sg.artist}`);
      }
      lines.push("");
    }
    lines.push("Share this with your DJ at your first meeting.");
    void navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handlePrint() {
    if (sections.length === 0) return;
    const html = buildPrintHTML(sections);
    const w = window.open("", "_blank", "noopener,noreferrer,width=820,height=900");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  // ── render ───────────────────────────────────────────────────────────────

  const isLanguagesStep = step === 4;
  const singleStep = isLanguagesStep ? null : SINGLE_QUESTIONS[step];
  const languagesValid = prefs.languages.length > 0;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {stage === "intake" && step === 0 && (
          <div className={styles.introCard}>
            <span className={styles.scrawl}>✿ sangeet song suggester</span>
            <h1 className={styles.heading}>
              Bollywood night or <em>something unexpected?</em>
            </h1>
            <p className={styles.sub}>
              Five quick questions — we&apos;ll write a six-section brief your
              DJ can read in one sitting. Real songs, real artists, no
              guessing.
            </p>
            <div className={styles.metaRow}>
              <span className={styles.metaPill}>1 minute</span>
              <span className={styles.metaPill}>5 questions</span>
              <span className={styles.metaPill}>Print-ready brief</span>
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

            {singleStep && (
              <>
                <h2 className={styles.qHeading}>{singleStep.prompt}</h2>
                <div className={styles.choiceList}>
                  {singleStep.choices.map((c) => {
                    const selected = prefs[singleStep.id] === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        className={styles.choiceBtn}
                        aria-pressed={selected}
                        onClick={() => selectSingle(singleStep.id, c.value)}
                      >
                        <span className={styles.choiceLabel}>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {isLanguagesStep && (
              <>
                <h2 className={styles.qHeading}>
                  Languages to include?
                </h2>
                <p className={styles.helper}>Multi-select — pick everything you want on the brief.</p>
                <div className={styles.checkGrid}>
                  {LANGUAGE_OPTIONS.map((c) => {
                    const selected = prefs.languages.includes(c.value);
                    return (
                      <button
                        key={c.value}
                        type="button"
                        className={styles.checkBtn}
                        aria-pressed={selected}
                        onClick={() => toggleLanguage(c.value)}
                      >
                        <span className={styles.checkBox} aria-hidden="true">
                          {selected ? "✓" : ""}
                        </span>
                        <span>{c.label}</span>
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

              {isLanguagesStep ? (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleGenerate}
                  disabled={!languagesValid}
                >
                  Build my DJ brief →
                </button>
              ) : (
                <span className={styles.skipNote}>tap an answer to continue</span>
              )}
            </div>
          </div>
        )}

        {stage === "loading" && (
          <div className={styles.loading} aria-live="polite">
            <p className={styles.loadingText}>
              cueing up your set
              <span className={styles.dot} aria-hidden="true" />
            </p>
            <p className={styles.loadingSub}>
              ✿ asking the right uncle for a second opinion
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className={styles.errorCard}>
            <h2 className={styles.errorTitle}>The DJ booth is offline.</h2>
            <p className={styles.errorBody}>
              Couldn&apos;t reach the playlist generator just now. Try again —
              your answers are still here.
            </p>
            <div className={styles.errorActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => generate(prefs)}
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
            <article id="sangeet-output" className={styles.output}>
              <header className={styles.outputHeader}>
                <span className={styles.outputScrawl}>✿ for the DJ</span>
                <h2 className={styles.outputTitle}>
                  Your <em>Sangeet</em> brief
                </h2>
                <p className={styles.outputSub}>
                  Six sections · real songs · share this at the first meeting
                </p>
              </header>

              <div className={styles.sectionList}>
                {sections.map((s, i) => (
                  <section key={i} className={styles.briefSection}>
                    <p className={styles.sectionNum}>
                      {String(i + 1).padStart(2, "0")} · {s.name}
                    </p>
                    <p className={styles.moodNote}>{s.moodNote}</p>
                    <ul className={styles.songList}>
                      {s.songs.map((sg, j) => (
                        <li key={j} className={styles.songItem}>
                          <span className={styles.songTitle}>{sg.title}</span>
                          <span className={styles.songArtist}>· {sg.artist}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>

              <p className={styles.djNote}>
                Share this with your DJ at your first meeting.
              </p>

              <div className={styles.actionsRow}>
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
                  onClick={handlePrint}
                >
                  Print brief
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
