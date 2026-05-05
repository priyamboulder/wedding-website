// ── Family palette generator ───────────────────────────────────────────────
// Produces complementary (not competing) per-side palettes for family
// outfits, anchored on the bride's outfit colour for a given event.
//
// Used by:
//   • Wardrobe Family Coordination tab (full workspace) — live palettes per
//     event card.
//   • Wardrobe Build · Session 2 (Family Coordination) — same generator,
//     same "Regenerate / Accept" UX.
//
// The output is deterministic per (brideHex, style, event, seed). The
// `seed` knob is what "Regenerate" increments — same inputs give the same
// palette so accepted state stays stable across renders.
//
// Future use cases (Décor / Stationery / Cake decoration) can call this
// the same way, passing whichever anchor colour matters in their context.

export interface PaletteSuggestion {
  /** 4 hex strings, leading #, uppercase. */
  swatches: string[];
  /** One-sentence rationale used in tooltips and "Reasoning" lines. */
  description: string;
}

export interface EventPalettePair {
  seed: number;
  bride: PaletteSuggestion;
  groom: PaletteSuggestion;
}

export interface GeneratePalettePairInput {
  /** Hex of the bride's outfit for this event — anchors both sides. */
  brideHex: string;
  /** Free-form style direction string (e.g. "minimal modern", "fusion"). */
  style: string;
  /** Event label, used only for description copy. */
  event: string;
  /** Increment to regenerate. Same seed = same output. */
  seed: number;
}

export function generateEventPalettePair(
  input: GeneratePalettePairInput,
): EventPalettePair {
  const { brideHex, style, event, seed } = input;
  const { h, l } = hexToHsl(brideHex);
  const adj = styleAdjustments(style);
  const jitter = (seed * 17) % 30;

  // Bride's side — analogous, softer, photographs with the bride.
  const brideBaseHue = h + 28 + jitter;
  const brideSwatches = [
    hslToHex(brideBaseHue, 0.18 * adj.saturationScale, 0.82 + adj.lightnessBoost / 2),
    hslToHex(brideBaseHue + 18, 0.28 * adj.saturationScale, 0.72 + adj.lightnessBoost / 2),
    hslToHex(brideBaseHue - 14, 0.38 * adj.saturationScale, 0.58 + adj.lightnessBoost / 3),
    hslToHex(brideBaseHue + 4, 0.12, 0.92),
  ];

  // Groom's side — complementary but deeper, with a metallic/neutral anchor.
  const groomBaseHue = h + 180 - jitter;
  const groomSwatches = [
    hslToHex(groomBaseHue, 0.48 * adj.saturationScale, 0.32 - adj.lightnessBoost / 4),
    hslToHex(groomBaseHue + 22, 0.42 * adj.saturationScale, 0.46),
    hslToHex(groomBaseHue - 18, 0.3 * adj.saturationScale, 0.62 + adj.lightnessBoost / 3),
    hslToHex(42, 0.55, 0.52), // warm gold anchor, same for both sides
  ];

  // Hue-distance keeps rivalry low and photograph harmony high.
  const distance = Math.min(
    Math.abs(brideBaseHue - h),
    360 - Math.abs(brideBaseHue - h),
  );

  const hueName = nameHue(brideBaseHue);
  const groomName = nameHue(groomBaseHue);

  const brideDescription =
    l < 0.45
      ? `Soft ${hueName} and ivory for the bride's side — ${adj.tone}, a quiet frame around the ${describeColor(brideHex)} lehenga.`
      : `${capitalize(hueName)} and champagne on the bride's side — ${adj.tone}, echoing the ${describeColor(brideHex)} look without competing.`;

  const groomDescription =
    distance > 120
      ? `Deep ${groomName} with a warm gold anchor for the groom's side — ${adj.tone}, sits opposite the bride's palette in photos.`
      : `${capitalize(groomName)} and ink, lifted with a gold anchor on the groom's side — ${adj.tone}, a harmonious counterpoint for group photos at ${event.toLowerCase()}.`;

  return {
    seed,
    bride: { swatches: brideSwatches, description: brideDescription },
    groom: { swatches: groomSwatches, description: groomDescription },
  };
}

// ── Coordination-rule suggestions ──────────────────────────────────────────
// Used by Build Session 2's "Suggest rules" CTA. Deterministic, derived
// from accepted palettes — not a Claude call. (The prompt mentions Claude;
// this generator gives a fast, free baseline. Wire a Claude refinement by
// passing the same anchors plus generated rules to /api/ai-assist.)

export interface SuggestedRule {
  rule_text: string;
  applies_to_event?: string;
}

export function suggestCoordinationRules(input: {
  brideAnchorByEvent: Partial<Record<string, string>>;
  acceptedPalettes: Array<{ event: string; side: "bride" | "groom"; swatches: string[] }>;
}): SuggestedRule[] {
  const rules: SuggestedRule[] = [];
  const events = Array.from(
    new Set([
      ...Object.keys(input.brideAnchorByEvent),
      ...input.acceptedPalettes.map((p) => p.event),
    ]),
  );

  // Rule 1 — global "no one wears the bride's anchor colour" for distinctive
  // hues (red on Wedding, fuchsia on Sangeet).
  for (const ev of events) {
    const anchor = input.brideAnchorByEvent[ev];
    if (!anchor) continue;
    const { h, l } = hexToHsl(anchor);
    if (l < 0.45 && (nameHue(h) === "crimson" || nameHue(h) === "magenta")) {
      rules.push({
        applies_to_event: ev,
        rule_text: `Nobody wears ${describeColor(anchor)} on ${ev} — that's the bride's lane.`,
      });
    }
  }

  // Rule 2 — mothers don't match each other.
  rules.push({
    rule_text: "Mothers wear different palettes — both ivory or both gold reads as a uniform in photos.",
  });

  // Rule 3 — no white at the wedding ceremony unless palette explicitly
  // includes it.
  if (events.some((e) => e.toLowerCase() === "wedding")) {
    rules.push({
      applies_to_event: "Wedding",
      rule_text: "Family wears ivory or champagne at the Wedding, not pure white — too close to the bride.",
    });
  }

  return rules.slice(0, 4);
}

// ── Color helpers ──────────────────────────────────────────────────────────
// Shared hex/HSL plumbing. Lifted from wardrobe FamilyCoordinationTab so it
// can also serve Stationery and Décor.

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, l };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.min(1, Math.max(0, s));
  const lig = Math.min(1, Math.max(0, l));
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function styleAdjustments(style: string): {
  saturationScale: number;
  lightnessBoost: number;
  tone: string;
} {
  const s = style.toLowerCase();
  if (s.includes("minimal") || s.includes("modern"))
    return { saturationScale: 0.55, lightnessBoost: 0.18, tone: "muted and modern" };
  if (s.includes("fusion"))
    return { saturationScale: 0.8, lightnessBoost: 0.08, tone: "fusion-contemporary" };
  if (s.includes("vintage") || s.includes("heirloom"))
    return { saturationScale: 0.7, lightnessBoost: 0.1, tone: "heirloom and warm" };
  if (s.includes("bold") || s.includes("forward"))
    return { saturationScale: 1.05, lightnessBoost: -0.05, tone: "editorial and bold" };
  if (s.includes("romantic") || s.includes("soft"))
    return { saturationScale: 0.65, lightnessBoost: 0.2, tone: "romantic and soft" };
  if (s.includes("traditional") || s.includes("regal"))
    return { saturationScale: 0.95, lightnessBoost: 0, tone: "traditional and regal" };
  return { saturationScale: 0.75, lightnessBoost: 0.1, tone: "balanced" };
}

export function describeColor(hex: string): string {
  const { h, l } = hexToHsl(hex);
  const name = nameHue(h);
  if (l < 0.35) return `deep ${name}`;
  if (l > 0.75) return `pale ${name}`;
  return name;
}

export function nameHue(h: number): string {
  const hue = ((h % 360) + 360) % 360;
  if (hue < 15 || hue >= 345) return "crimson";
  if (hue < 35) return "coral";
  if (hue < 55) return "marigold";
  if (hue < 75) return "saffron";
  if (hue < 95) return "chartreuse";
  if (hue < 150) return "sage";
  if (hue < 190) return "teal";
  if (hue < 230) return "slate blue";
  if (hue < 270) return "indigo";
  if (hue < 300) return "plum";
  if (hue < 335) return "dusty rose";
  return "magenta";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
