// ── Style matching ────────────────────────────────────────────────────────
// Couples answer a 5-question quiz during onboarding and their style_profile
// is persisted in the discovery store. Vendors self-describe a style_signature
// (same axes) in their dashboard. Match score is 1 - avg(|Δ|) / 2 across
// shared axes — so identical answers = 1.0, maximally different = 0.0.
//
// Thresholds:
//   >= 0.8 → "Strong match" (green chip)
//   >= 0.6 → "Good match"    (gold chip)
//   >= 0.4 → "Partial match" (muted chip — hidden by default on cards)
//   <  0.4 → not shown

import type {
  StyleAxis,
  StyleSignature,
  StylePreset,
} from "@/types/vendor-discovery";

export const STYLE_AXES: StyleAxis[] = [
  "tone",
  "era",
  "density",
  "scale",
  "palette",
];

export const AXIS_POLES: Record<StyleAxis, { minus: string; plus: string }> = {
  tone: { minus: "Moody & editorial", plus: "Bright & airy" },
  era: { minus: "Traditional", plus: "Fusion / modern" },
  density: { minus: "Minimalist", plus: "Maximalist" },
  scale: { minus: "Intimate", plus: "Grand" },
  palette: { minus: "Neutral / earth", plus: "Saturated / jewel-tone" },
};

export const QUIZ_QUESTIONS: Array<{
  axis: StyleAxis;
  prompt: string;
}> = [
  { axis: "tone", prompt: "How do you picture the light?" },
  { axis: "era", prompt: "Traditional or a fusion of both worlds?" },
  { axis: "density", prompt: "How much visual detail do you want?" },
  { axis: "scale", prompt: "Is the day intimate or grand?" },
  { axis: "palette", prompt: "What palette feels like you?" },
];

// Presets let couples skip the quiz and pick a vibe.
export const STYLE_PRESETS: Record<StylePreset, StyleSignature> = {
  moody_editorial:   { tone: -0.9, era:  0.4, density:  0.2, scale:  0.0, palette: -0.6 },
  bright_airy:       { tone:  0.9, era:  0.3, density: -0.3, scale:  0.0, palette: -0.2 },
  traditional:       { tone: -0.2, era: -0.9, density:  0.7, scale:  0.4, palette:  0.8 },
  fusion:            { tone:  0.2, era:  0.9, density:  0.0, scale:  0.3, palette:  0.2 },
  minimalist:        { tone:  0.4, era:  0.5, density: -0.9, scale: -0.3, palette: -0.7 },
  maximalist:        { tone:  0.0, era: -0.2, density:  0.9, scale:  0.7, palette:  0.9 },
  intimate:          { tone: -0.2, era:  0.0, density: -0.2, scale: -0.9, palette: -0.3 },
  grand:             { tone:  0.2, era:  0.0, density:  0.7, scale:  0.9, palette:  0.6 },
};

export const STYLE_PRESET_LABEL: Record<StylePreset, string> = {
  moody_editorial: "Moody & Editorial",
  bright_airy: "Bright & Airy",
  traditional: "Traditional",
  fusion: "Fusion",
  minimalist: "Minimalist",
  maximalist: "Maximalist",
  intimate: "Intimate",
  grand: "Grand",
};

export function matchScore(
  couple: StyleSignature,
  vendor: StyleSignature | undefined,
): number {
  if (!vendor) return 0;
  const axes = STYLE_AXES.filter((a) => a in couple && a in vendor);
  if (axes.length === 0) return 0;
  const totalDelta = axes.reduce(
    (sum, a) => sum + Math.abs((couple[a] ?? 0) - (vendor[a] ?? 0)),
    0,
  );
  // Each axis contributes a delta in [0, 2]. Normalize to [0, 1] then invert.
  const avgDelta = totalDelta / axes.length / 2;
  return Math.max(0, 1 - avgDelta);
}

export type MatchBand = "strong" | "good" | "partial" | "weak";

export function matchBand(score: number): MatchBand {
  if (score >= 0.8) return "strong";
  if (score >= 0.6) return "good";
  if (score >= 0.4) return "partial";
  return "weak";
}

export const MATCH_BAND_LABEL: Record<MatchBand, string> = {
  strong: "Strong match",
  good: "Good match",
  partial: "Partial match",
  weak: "Weak match",
};

// Tailwind class pairs: { chip background, chip text }
export const MATCH_BAND_CLASS: Record<MatchBand, { bg: string; text: string }> = {
  strong:  { bg: "bg-sage-pale",  text: "text-sage"         },
  good:    { bg: "bg-gold-pale",  text: "text-gold"         },
  partial: { bg: "bg-ivory-warm", text: "text-ink-muted"    },
  weak:    { bg: "bg-ivory-warm", text: "text-ink-faint"    },
};
