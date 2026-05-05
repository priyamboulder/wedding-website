// ── Dress code options (Journey Step 4) ───────────────────────────────

export const DRESS_CODE_STYLES = [
  "Formal",
  "Semi-formal",
  "Festive",
  "Casual",
  "Traditional",
  "Black Tie",
  "Smart Casual",
  "Cocktail",
] as const;

export type DressCodeStyle = (typeof DRESS_CODE_STYLES)[number];

export const DRESS_CODE_COLOR_GUIDANCE = [
  "Pastels",
  "Jewel tones",
  "White",
  "Black",
  "Bright florals",
  "Earthy / neutral",
  "Wear yellow",
  "Wear red",
  "Wear green",
  "No white",
] as const;

export type DressCodeColorGuidance = (typeof DRESS_CODE_COLOR_GUIDANCE)[number];

export interface DressCode {
  style: DressCodeStyle | null;
  colorGuidance: DressCodeColorGuidance | null;
  notes: string;
}

export const EMPTY_DRESS_CODE: DressCode = {
  style: null,
  colorGuidance: null,
  notes: "",
};
