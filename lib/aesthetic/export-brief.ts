// ── Vendor brief export ─────────────────────────────────────────────────────
// Produces a print-ready HTML document from the locked AestheticDNA, then
// triggers the browser's native Print-to-PDF. No external PDF library — the
// print stylesheet in globals.css + a temporary iframe is enough for a
// one-page hand-off that a designer can read cold.
//
// Real implementation (Part 2) may swap in a server-rendered PDF via
// @react-pdf/renderer or Puppeteer. This file's signature stays stable.

import type { AestheticDNA, PaletteSwatch } from "@/types/aesthetic";

export function exportVendorBrief(dna: AestheticDNA, directionName: string) {
  const html = buildBriefHtml(dna, directionName);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    setTimeout(() => document.body.removeChild(iframe), 500);
  };

  const cw = iframe.contentWindow;
  if (!cw) {
    cleanup();
    return;
  }
  cw.addEventListener("afterprint", cleanup);
  setTimeout(() => {
    cw.focus();
    cw.print();
  }, 100);
}

function paletteRow(swatches: PaletteSwatch[]): string {
  return swatches
    .map(
      (s) => `
      <div class="swatch">
        <div class="chip" style="background:${s.hex}"></div>
        <div class="name">${escapeHtml(s.name)}</div>
        <div class="hex">${s.hex.toUpperCase()}</div>
      </div>`,
    )
    .join("");
}

function listItems(items: string[], marker: string = "•"): string {
  return items.map((i) => `<li><span class="marker">${marker}</span>${escapeHtml(i)}</li>`).join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBriefHtml(dna: AestheticDNA, directionName: string): string {
  const locked = new Date(dna.locked_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Vendor brief — ${escapeHtml(directionName)}</title>
<style>
  :root {
    --ink: #1A1A1A;
    --ink-soft: #2E2E2E;
    --ink-muted: #6B6B6B;
    --ivory: #FBF9F4;
    --gold: #B8860B;
    --border: rgba(26, 26, 26, 0.12);
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--ink);
    background: var(--ivory);
  }
  .page {
    padding: 48px 56px;
    max-width: 8.5in;
    margin: 0 auto;
  }
  .kicker {
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
  h1 {
    font-family: "Fraunces", Georgia, serif;
    font-size: 36px;
    font-weight: 500;
    margin: 4px 0 0;
    line-height: 1.15;
  }
  .meta { margin-top: 8px; color: var(--ink-muted); font-size: 12px; }
  section { margin-top: 28px; }
  section h2 {
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gold);
    margin: 0 0 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }
  .palette { display: flex; gap: 14px; flex-wrap: wrap; }
  .swatch { text-align: center; }
  .chip { width: 56px; height: 56px; border-radius: 2px; border: 1px solid var(--border); }
  .name { font-size: 11px; margin-top: 4px; color: var(--ink-soft); }
  .hex { font-family: "JetBrains Mono", monospace; font-size: 9px; color: var(--ink-muted); margin-top: 1px; }
  ul { list-style: none; padding: 0; margin: 0; }
  ul li {
    font-size: 13px;
    line-height: 1.5;
    padding: 3px 0;
    display: flex;
    gap: 8px;
  }
  .marker { color: var(--gold); font-weight: 600; }
  .forbidden .marker { color: #C97B63; }
  .cultural {
    font-family: "Fraunces", Georgia, serif;
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-soft);
  }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag {
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 3px 8px;
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--ink-soft);
  }
  footer {
    margin-top: 40px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ink-muted);
    display: flex;
    justify-content: space-between;
  }
  @media print {
    body { background: white; }
    .page { padding: 36px 44px; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="kicker">Décor brief · the Aesthetic</div>
    <h1>${escapeHtml(directionName)}</h1>
    <div class="meta">Locked ${escapeHtml(locked)}${
      dna.amended_at
        ? ` · Amended ${escapeHtml(new Date(dna.amended_at).toLocaleDateString())}`
        : ""
    }</div>

    <section>
      <h2>Primary palette</h2>
      <div class="palette">${paletteRow(dna.palette_primary)}</div>
    </section>

    ${
      dna.palette_secondary.length > 0
        ? `
    <section>
      <h2>Secondary palette</h2>
      <div class="palette">${paletteRow(dna.palette_secondary)}</div>
    </section>`
        : ""
    }

    <section>
      <h2>Mood</h2>
      <div class="tags">${dna.mood_tags
        .map((m) => `<span class="tag">${escapeHtml(m)}</span>`)
        .join("")}</div>
    </section>

    <section>
      <h2>Textures</h2>
      <ul>${listItems(dna.textures)}</ul>
    </section>

    <section>
      <h2>Implied moves</h2>
      <ul>${listItems(dna.implied_moves)}</ul>
    </section>

    <section class="forbidden">
      <h2>Forbidden — do not propose these</h2>
      <ul>${listItems(dna.forbidden, "✕")}</ul>
    </section>

    ${
      dna.cultural_notes
        ? `
    <section>
      <h2>Cultural notes</h2>
      <p class="cultural">${escapeHtml(dna.cultural_notes)}</p>
    </section>`
        : ""
    }

    <footer>
      <span>Ananya · Aesthetic DNA</span>
      <span>Generated ${new Date().toLocaleString()}</span>
    </footer>
  </div>
</body>
</html>`;
}
