"use client";

import { useState } from "react";

import styles from "./BaraatBriefTool.module.css";

const DURATION_OPTIONS = [
  "Under 10 min",
  "10–20 min",
  "20–30 min",
  "30+ min",
];

const TRANSPORT_OPTIONS = [
  "Horse",
  "Car",
  "Walking",
  "Horse + car combo",
];

const CROWD_OPTIONS = [
  "Just close family (~20–30 people)",
  "Half the guests",
  "Everyone",
];

const ARC_OPTIONS = [
  "Build slowly, peak at arrival",
  "High energy the whole way",
  "Start intense, slow for actual entry",
];

const ERA_OPTIONS = [
  "Classic Bollywood (pre-2000)",
  "2000s–2015",
  "New Bollywood (2015+)",
  "Mix all eras",
  "Bhangra-forward",
];

interface Input {
  duration: string;
  transport: string;
  crowd: string;
  arc: string;
  era: string;
  mustPlay: string;
  mustAvoid: string;
}

const EMPTY: Input = {
  duration: "",
  transport: "",
  crowd: "",
  arc: "",
  era: "",
  mustPlay: "",
  mustAvoid: "",
};

interface Song {
  title: string;
  artist: string;
}

interface Section {
  name: string;
  moodNote: string;
  songs: Song[];
  djNotes: string;
}

type Stage = "intake" | "loading" | "result" | "error";

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
        ${s.djNotes ? `<p class="cue"><span>DJ cues</span> ${escapeHtml(s.djNotes)}</p>` : ""}
      </section>`;
    })
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8" />
<title>Baraat DJ Brief — The Marigold</title>
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
  .head { text-align: center; border-bottom: 1px dashed rgba(75, 21, 40, 0.25); padding-bottom: 18px; margin-bottom: 22px; }
  .scrawl { font-family: 'Caveat', cursive; font-size: 22px; color: #D4537E; margin: 0 0 4px; transform: rotate(-1.5deg); display: inline-block; }
  h1 { font-style: italic; font-weight: 400; font-size: 36px; color: #4B1528; margin: 0 0 6px; line-height: 1.05; }
  h1 em { color: #D4537E; }
  .lede { font-style: italic; font-size: 13px; color: #8A6070; margin: 0; }
  section { page-break-inside: avoid; margin-bottom: 22px; padding-bottom: 16px; border-bottom: 1px dashed rgba(75, 21, 40, 0.2); }
  section:last-child { border-bottom: none; }
  h2 { font-family: 'Syne', sans-serif; font-size: 12px; letter-spacing: 1.8px; text-transform: uppercase; color: #D4537E; margin: 0 0 6px; }
  .mood { font-style: italic; font-size: 16px; color: #4B1528; margin: 0 0 10px; }
  ul { list-style: none; padding: 0; margin: 0 0 10px; }
  li { font-size: 16px; color: #4B1528; padding: 6px 0; border-bottom: 1px dotted rgba(75, 21, 40, 0.1); }
  li:last-child { border-bottom: none; }
  li strong { font-style: italic; font-weight: 400; }
  .artist { font-family: 'Syne', sans-serif; font-size: 11px; letter-spacing: 0.6px; color: #8A6070; }
  .cue { background: #FFF5EB; border-left: 2px solid #D4A853; padding: 8px 12px; margin: 8px 0 0; font-size: 13px; line-height: 1.5; color: #4B1528; }
  .cue span { font-family: 'Syne', sans-serif; font-size: 9px; letter-spacing: 1.4px; text-transform: uppercase; color: #D4537E; margin-right: 6px; font-weight: 700; }
  .footer { margin-top: 22px; text-align: center; font-family: 'Syne', sans-serif; font-size: 9px; letter-spacing: 1.6px; text-transform: uppercase; color: #8A6070; }
</style>
</head>
<body>
  <div class="head">
    <span class="scrawl">✿ for the DJ</span>
    <h1>The <em>Baraat</em> Brief</h1>
    <p class="lede">Four sections — departure, procession, arrival, milni.</p>
  </div>
  ${items}
  <p class="footer">The Marigold · the math, the maps, the moves</p>
  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 250); });</script>
</body></html>`;
}

interface ChoiceFieldProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

function ChoiceField({ label, options, value, onChange }: ChoiceFieldProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.fieldLabel}>{label}</legend>
      <div className={styles.choiceGrid}>
        {options.map((o) => {
          const selected = value === o;
          return (
            <button
              key={o}
              type="button"
              className={styles.choiceBtn}
              aria-pressed={selected}
              onClick={() => onChange(o)}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function BaraatBriefTool() {
  const [stage, setStage] = useState<Stage>("intake");
  const [input, setInput] = useState<Input>(EMPTY);
  const [sections, setSections] = useState<Section[]>([]);
  const [copied, setCopied] = useState(false);

  const canSubmit =
    input.duration && input.transport && input.crowd && input.arc && input.era;

  function update<K extends keyof Input>(key: K, value: Input[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function generate(p: Input) {
    setStage("loading");
    try {
      const res = await fetch("/api/tools/baraat-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: p }),
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
          .getElementById("baraat-output")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setStage("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    void generate(input);
  }

  function handleStartOver() {
    setStage("intake");
    setInput(EMPTY);
    setSections([]);
  }

  function handleCopy() {
    if (sections.length === 0) return;
    const lines: string[] = ["BARAAT DJ BRIEF — The Marigold", ""];
    sections.forEach((s, i) => {
      lines.push(`${String(i + 1).padStart(2, "0")} · ${s.name.toUpperCase()}`);
      lines.push(s.moodNote);
      for (const sg of s.songs) {
        lines.push(`  · ${sg.title} — ${sg.artist}`);
      }
      if (s.djNotes) {
        lines.push(`  DJ cues: ${s.djNotes}`);
      }
      lines.push("");
    });
    lines.push("Bring this to your first DJ meeting.");
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

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {stage === "intake" && (
          <>
            <div className={styles.introCard}>
              <span className={styles.scrawl}>✿ baraat dj brief</span>
              <h1 className={styles.heading}>
                The DJ brief that <em>actually works.</em>
              </h1>
              <p className={styles.sub}>
                The Baraat is the groom&apos;s arrival procession — horse, dhol,
                family, and controlled chaos. Your DJ needs to know how long
                the walk is, who&apos;s dancing, and where to peak the energy.
                This generates that brief.
              </p>
              <div className={styles.metaRow}>
                <span className={styles.metaPill}>1 minute</span>
                <span className={styles.metaPill}>4 sections</span>
                <span className={styles.metaPill}>Print-ready</span>
                <span className={styles.metaPill}>No signup</span>
              </div>
            </div>

            <form className={styles.card} onSubmit={handleSubmit}>
              <ChoiceField
                label="Baraat duration"
                options={DURATION_OPTIONS}
                value={input.duration}
                onChange={(v) => update("duration", v)}
              />
              <ChoiceField
                label="Transportation"
                options={TRANSPORT_OPTIONS}
                value={input.transport}
                onChange={(v) => update("transport", v)}
              />
              <ChoiceField
                label="Who's dancing?"
                options={CROWD_OPTIONS}
                value={input.crowd}
                onChange={(v) => update("crowd", v)}
              />
              <ChoiceField
                label="Energy arc"
                options={ARC_OPTIONS}
                value={input.arc}
                onChange={(v) => update("arc", v)}
              />
              <ChoiceField
                label="Music era"
                options={ERA_OPTIONS}
                value={input.era}
                onChange={(v) => update("era", v)}
              />

              <label className={styles.field}>
                <span className={styles.fieldLabel}>
                  Must-play songs <span className={styles.optional}>optional</span>
                </span>
                <textarea
                  className={styles.textarea}
                  value={input.mustPlay}
                  onChange={(e) =>
                    update("mustPlay", e.target.value.slice(0, 400))
                  }
                  placeholder="Mundian To Bach Ke, Aaja Nachle, anything from Veer-Zaara..."
                  rows={2}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>
                  Must-avoid songs <span className={styles.optional}>optional</span>
                </span>
                <textarea
                  className={styles.textarea}
                  value={input.mustAvoid}
                  onChange={(e) =>
                    update("mustAvoid", e.target.value.slice(0, 400))
                  }
                  placeholder="anything from Kal Ho Naa Ho — too sad, no remixes of bhangra classics..."
                  rows={2}
                />
              </label>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={!canSubmit}
                >
                  Build my Baraat brief →
                </button>
              </div>
            </form>
          </>
        )}

        {stage === "loading" && (
          <div className={styles.loading} aria-live="polite">
            <p className={styles.loadingText}>
              cueing up the dhol
              <span className={styles.dot} aria-hidden="true" />
            </p>
            <p className={styles.loadingSub}>
              ✿ pacing the walk to the door
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className={styles.errorCard}>
            <h2 className={styles.errorTitle}>The horse is offline.</h2>
            <p className={styles.errorBody}>
              Couldn&apos;t reach the brief generator just now. Try again — your
              answers are still here.
            </p>
            <div className={styles.errorActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => generate(input)}
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
            <article id="baraat-output" className={styles.output}>
              <header className={styles.outputHeader}>
                <span className={styles.outputScrawl}>✿ for the DJ</span>
                <h2 className={styles.outputTitle}>
                  Your <em>Baraat</em> brief
                </h2>
                <p className={styles.outputSub}>
                  four sections · real songs · cue notes · ready for the meeting
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
                    {s.djNotes && (
                      <div className={styles.djCue}>
                        <span className={styles.djCueLabel}>DJ cues</span>
                        <p className={styles.djCueText}>{s.djNotes}</p>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              <p className={styles.djNote}>
                Bring this to your first DJ meeting.
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
