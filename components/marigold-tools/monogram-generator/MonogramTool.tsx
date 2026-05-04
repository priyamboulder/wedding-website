"use client";

import { useMemo, useState } from "react";

import styles from "./MonogramTool.module.css";

type StyleKey = "intertwined" | "separated" | "stacked" | "side";

const STYLE_OPTIONS: { value: StyleKey; label: string }[] = [
  { value: "intertwined", label: "Classic intertwined" },
  { value: "separated", label: "Modern separated" },
  { value: "stacked", label: "Stacked" },
  { value: "side", label: "Side by side" },
];

interface Input {
  name1: string;
  name2: string;
  lastName: string;
  hindi1: string;
  hindi2: string;
  year: string;
  style: StyleKey;
}

const EMPTY: Input = {
  name1: "",
  name2: "",
  lastName: "",
  hindi1: "",
  hindi2: "",
  year: "",
  style: "intertwined",
};

interface Variation {
  id: string;
  label: string;
  description: string;
  svg: string;
}

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap";

const SVG_FONT_IMPORT = `@import url('${FONT_LINK}');`;

const COLORS = {
  wine: "#4B1528",
  pink: "#D4537E",
  gold: "#D4A853",
  paper: "#FFF8F2",
};

function firstLetter(s: string): string {
  const trimmed = s.trim();
  return trimmed ? trimmed[0].toUpperCase() : "";
}

function firstChar(s: string): string {
  return s.trim() ? s.trim()[0] : "";
}

function stripCarriage(s: string): string {
  return s.replace(/\r/g, "");
}

interface BuildArgs {
  i1: string;
  i2: string;
  l: string;
  d1: string;
  d2: string;
  year: string;
}

function svgWrapper(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <defs>
    <style type="text/css">
      ${SVG_FONT_IMPORT}
      .latin { font-family: 'Cormorant Garamond', Georgia, serif; }
      .deva { font-family: 'Noto Sans Devanagari', sans-serif; }
    </style>
  </defs>
  <rect width="300" height="300" fill="${COLORS.paper}" />
  ${inner}
</svg>`;
}

function buildIntertwined({ i1, i2 }: BuildArgs): string {
  const left = i1 || "?";
  const right = i2 || "?";
  return svgWrapper(`
    <text x="115" y="190" class="latin" font-size="200" font-weight="500" fill="${COLORS.wine}" text-anchor="middle" font-style="italic">${left}</text>
    <text x="185" y="190" class="latin" font-size="200" font-weight="500" fill="${COLORS.pink}" opacity="0.78" text-anchor="middle" font-style="italic">${right}</text>
    <line x1="80" y1="225" x2="220" y2="225" stroke="${COLORS.gold}" stroke-width="1.5" />
  `);
}

function buildSeparated({ i1, i2 }: BuildArgs): string {
  const left = i1 || "?";
  const right = i2 || "?";
  return svgWrapper(`
    <text x="80" y="180" class="latin" font-size="120" font-weight="500" fill="${COLORS.wine}" text-anchor="middle">${left}</text>
    <text x="150" y="180" class="latin" font-size="80" font-weight="400" fill="${COLORS.gold}" text-anchor="middle" font-style="italic">&amp;</text>
    <text x="220" y="180" class="latin" font-size="120" font-weight="500" fill="${COLORS.wine}" text-anchor="middle">${right}</text>
  `);
}

function buildStacked({ i1, i2, year }: BuildArgs): string {
  const left = i1 || "?";
  const right = i2 || "?";
  const y = year ? `<text x="150" y="265" class="latin" font-size="20" font-weight="500" fill="${COLORS.gold}" letter-spacing="6" text-anchor="middle">${year}</text>` : "";
  return svgWrapper(`
    <text x="150" y="130" class="latin" font-size="100" font-weight="500" fill="${COLORS.wine}" text-anchor="middle">${left}</text>
    <line x1="100" y1="155" x2="200" y2="155" stroke="${COLORS.pink}" stroke-width="1.5" />
    <text x="150" y="220" class="latin" font-size="100" font-weight="500" fill="${COLORS.wine}" text-anchor="middle">${right}</text>
    ${y}
  `);
}

function buildDevanagari({ d1, d2, i1, i2 }: BuildArgs): string {
  // Graceful fallback: if no Devanagari provided, use Latin styled large.
  const hasDeva = Boolean(d1 || d2);
  const left = hasDeva ? d1 || "?" : i1 || "?";
  const right = hasDeva ? d2 || "?" : i2 || "?";
  const cls = hasDeva ? "deva" : "latin";
  return svgWrapper(`
    <text x="120" y="180" class="${cls}" font-size="120" font-weight="500" fill="${COLORS.wine}" text-anchor="middle">${left}</text>
    <circle cx="150" cy="170" r="3" fill="${COLORS.gold}" />
    <text x="180" y="180" class="${cls}" font-size="120" font-weight="500" fill="${COLORS.pink}" text-anchor="middle">${right}</text>
  `);
}

function buildCombined({ d1, i2 }: BuildArgs): string {
  const left = d1 || "?";
  const right = i2 || "?";
  const leftCls = d1 ? "deva" : "latin";
  return svgWrapper(`
    <text x="115" y="180" class="${leftCls}" font-size="120" font-weight="500" fill="${COLORS.wine}" text-anchor="middle">${left}</text>
    <line x1="155" y1="115" x2="155" y2="200" stroke="${COLORS.gold}" stroke-width="1.5" />
    <text x="195" y="180" class="latin" font-size="120" font-weight="500" fill="${COLORS.pink}" text-anchor="middle" font-style="italic">${right}</text>
  `);
}

function buildFullMonogram({ i1, i2, l }: BuildArgs): string {
  const left = i1 || "?";
  const right = i2 || "?";
  const center = l || "&";
  return svgWrapper(`
    <text x="80" y="195" class="latin" font-size="90" font-weight="400" fill="${COLORS.wine}" text-anchor="middle" font-style="italic">${left}</text>
    <text x="150" y="210" class="latin" font-size="170" font-weight="600" fill="${COLORS.pink}" text-anchor="middle">${center}</text>
    <text x="220" y="195" class="latin" font-size="90" font-weight="400" fill="${COLORS.wine}" text-anchor="middle" font-style="italic">${right}</text>
    <line x1="50" y1="240" x2="250" y2="240" stroke="${COLORS.gold}" stroke-width="1" />
  `);
}

function buildVariations(input: Input): Variation[] {
  const args: BuildArgs = {
    i1: firstLetter(input.name1),
    i2: firstLetter(input.name2),
    l: firstLetter(input.lastName),
    d1: firstChar(input.hindi1),
    d2: firstChar(input.hindi2),
    year: input.year.trim(),
  };

  return [
    {
      id: "intertwined",
      label: "Traditional intertwined",
      description: "overlapping Latin initials",
      svg: buildIntertwined(args),
    },
    {
      id: "separated",
      label: "Modern separated",
      description: "clean initials with an ampersand",
      svg: buildSeparated(args),
    },
    {
      id: "stacked",
      label: "Stacked with year",
      description: "vertical, with the wedding year",
      svg: buildStacked(args),
    },
    {
      id: "devanagari",
      label: "Devanagari initials",
      description: input.hindi1 || input.hindi2
        ? "first character of each Hindi name"
        : "add Hindi names for the Devanagari version",
      svg: buildDevanagari(args),
    },
    {
      id: "combined",
      label: "Combined",
      description: "one Devanagari, one Latin",
      svg: buildCombined(args),
    },
    {
      id: "full",
      label: "Full monogram",
      description: "last initial centered, partners flanking",
      svg: buildFullMonogram(args),
    },
  ];
}

async function svgToPngDataUrl(svg: string, size = 1200): Promise<string | null> {
  return new Promise((resolve) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }
        ctx.fillStyle = COLORS.paper;
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/png");
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      } catch {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function downloadFile(content: string | Blob, filename: string, mime?: string) {
  const blob =
    typeof content === "string"
      ? new Blob([content], { type: mime || "text/plain" })
      : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  const [meta, b64] = dataUrl.split(",");
  if (!meta || !b64) return null;
  const mime = meta.match(/:(.*?);/)?.[1] ?? "image/png";
  try {
    const bin = atob(b64);
    const len = bin.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  } catch {
    return null;
  }
}

export function MonogramTool() {
  const [input, setInput] = useState<Input>(EMPTY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const variations = useMemo(() => buildVariations(input), [input]);
  const showResults =
    input.name1.trim().length > 0 && input.name2.trim().length > 0;
  const selected = variations.find((v) => v.id === selectedId) ?? null;

  function update<K extends keyof Input>(key: K, value: Input[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    requestAnimationFrame(() => {
      document
        .getElementById("selected-actions")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function handleDownloadSvg(v: Variation) {
    downloadFile(stripCarriage(v.svg), `monogram-${v.id}.svg`, "image/svg+xml");
  }

  async function handleDownloadPng(v: Variation) {
    setDownloading(v.id);
    try {
      const dataUrl = await svgToPngDataUrl(stripCarriage(v.svg), 1200);
      if (!dataUrl) return;
      const blob = dataUrlToBlob(dataUrl);
      if (!blob) return;
      downloadFile(blob, `monogram-${v.id}.png`);
    } finally {
      setDownloading(null);
    }
  }

  function handleCopySvg(v: Variation) {
    void navigator.clipboard.writeText(stripCarriage(v.svg)).then(() => {
      setCopiedId(v.id);
      setTimeout(() => setCopiedId((c) => (c === v.id ? null : c)), 1600);
    });
  }

  function handleStartOver() {
    setInput(EMPTY);
    setSelectedId(null);
  }

  return (
    <section className={styles.section}>
      {/* Preload Google Fonts so SVG previews render correctly */}
      <link rel="stylesheet" href={FONT_LINK} />

      <div className={styles.inner}>
        <div className={styles.introCard}>
          <span className={styles.scrawl}>✿ wedding monogram generator</span>
          <h1 className={styles.heading}>
            Your initials, <em>your way.</em>
          </h1>
          <p className={styles.sub}>
            Six variations — Latin, Devanagari, intertwined, stacked. Pick a
            favorite and send it to your stationery designer or invitation
            artist.
          </p>
          <div className={styles.metaRow}>
            <span className={styles.metaPill}>1 minute</span>
            <span className={styles.metaPill}>6 variations</span>
            <span className={styles.metaPill}>SVG + PNG</span>
            <span className={styles.metaPill}>No signup</span>
          </div>
        </div>

        <form className={styles.card} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Partner 1 first name</span>
              <input
                className={styles.input}
                type="text"
                value={input.name1}
                onChange={(e) => update("name1", e.target.value.slice(0, 40))}
                placeholder="Priya"
                autoComplete="off"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Partner 2 first name</span>
              <input
                className={styles.input}
                type="text"
                value={input.name2}
                onChange={(e) => update("name2", e.target.value.slice(0, 40))}
                placeholder="Arjun"
                autoComplete="off"
              />
            </label>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                Shared last name / family initial{" "}
                <span className={styles.optional}>optional</span>
              </span>
              <input
                className={styles.input}
                type="text"
                value={input.lastName}
                onChange={(e) =>
                  update("lastName", e.target.value.slice(0, 60))
                }
                placeholder="Sharma"
                autoComplete="off"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                Wedding year <span className={styles.optional}>optional</span>
              </span>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                value={input.year}
                onChange={(e) =>
                  update("year", e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="2026"
                autoComplete="off"
              />
            </label>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                Partner 1 in Hindi{" "}
                <span className={styles.optional}>for Devanagari version</span>
              </span>
              <input
                className={styles.input}
                type="text"
                lang="hi"
                value={input.hindi1}
                onChange={(e) => update("hindi1", e.target.value.slice(0, 40))}
                placeholder="प्रिया"
                autoComplete="off"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                Partner 2 in Hindi{" "}
                <span className={styles.optional}>optional</span>
              </span>
              <input
                className={styles.input}
                type="text"
                lang="hi"
                value={input.hindi2}
                onChange={(e) => update("hindi2", e.target.value.slice(0, 40))}
                placeholder="अर्जुन"
                autoComplete="off"
              />
            </label>
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.fieldLabel}>Style preference</legend>
            <div className={styles.styleGrid}>
              {STYLE_OPTIONS.map((s) => {
                const selectedStyle = input.style === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    className={styles.styleBtn}
                    aria-pressed={selectedStyle}
                    onClick={() => update("style", s.value)}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </form>

        {showResults && (
          <article className={styles.output}>
            <header className={styles.outputHeader}>
              <span className={styles.outputScrawl}>
                ✿ six variations · pick one
              </span>
              <h2 className={styles.outputTitle}>
                Your <em>monograms</em>
              </h2>
              <p className={styles.outputSub}>
                tap any variation to download or copy the SVG
              </p>
            </header>

            <div className={styles.grid}>
              {variations.map((v) => {
                const isSelected = selectedId === v.id;
                return (
                  <button
                    type="button"
                    key={v.id}
                    className={styles.variation}
                    aria-pressed={isSelected}
                    onClick={() => handleSelect(v.id)}
                  >
                    <div
                      className={styles.svgFrame}
                      dangerouslySetInnerHTML={{ __html: v.svg }}
                    />
                    <p className={styles.varLabel}>{v.label}</p>
                    <p className={styles.varDesc}>{v.description}</p>
                  </button>
                );
              })}
            </div>

            {selected && (
              <div id="selected-actions" className={styles.selectedBlock}>
                <p className={styles.selectedLabel}>
                  selected · {selected.label}
                </p>
                <div className={styles.actionsRow}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => handleDownloadSvg(selected)}
                  >
                    Download SVG
                  </button>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => handleDownloadPng(selected)}
                    disabled={downloading === selected.id}
                  >
                    {downloading === selected.id ? "Rendering…" : "Download PNG"}
                  </button>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => handleCopySvg(selected)}
                    data-copied={copiedId === selected.id || undefined}
                  >
                    {copiedId === selected.id ? "Copied ✓" : "Copy SVG code"}
                  </button>
                </div>
              </div>
            )}

            <p className={styles.disclaimer}>
              These are digital mockups. Share with your stationery designer,
              invitation artist, or décor team — they&apos;ll finalize for print.
            </p>

            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.startOver}
                onClick={handleStartOver}
              >
                Start over
              </button>
            </div>
          </article>
        )}

        {showResults && (
          <p className={styles.convert}>
            Want to save this and keep planning?{" "}
            <a href="/signup" className={styles.convertLink}>
              Make a free Marigold account →
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
