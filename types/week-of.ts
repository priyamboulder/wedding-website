// Types for "The Week Of" — diary-format real-wedding articles surfaced
// in the Real Weddings tab of the Planning Circle (/blog).
//
// Each diary is one row in `week_of_diaries` (see migration 0030). The
// per-day entries live in the `days` JSONB column as an ordered array of
// DiaryDay objects; everything else is a top-level column.

export type DiaryMood =
  | "excited"
  | "overwhelmed"
  | "emotional"
  | "chaotic"
  | "peaceful"
  | "joyful"
  | "anxious";

export interface DiaryDay {
  day_number: number;
  day_of_week: string;
  title: string;
  mood: DiaryMood;
  body: string;
  pull_quote: string | null;
  image_url: string | null;
}

export type DiaryStatus = "draft" | "published";

export interface WeekOfDiary {
  id: string;
  title: string;
  author_persona: string;
  intro_text: string | null;
  cover_image: string | null;
  days: DiaryDay[];
  tags: string[];
  wedding_date: string | null;
  location: string | null;
  guest_count: number | null;
  status: DiaryStatus;
  published_at: string | null;
  created_at: string;
}

// Card-shaped projection: drops the heavy `days` payload so the
// /blog grid doesn't pull every diary's full body into the bundle.
export type WeekOfDiarySummary = Omit<WeekOfDiary, "days" | "intro_text"> & {
  day_count: number;
};

// Mood → pill color, matching the spec in the design brief. Used by both
// the card chip and the day-section pill on the article page.
export const MOOD_COLORS: Record<DiaryMood, { bg: string; fg: string }> = {
  excited:     { bg: "#F0E4C8", fg: "#7A5B0F" }, // gold
  overwhelmed: { bg: "#F5E0D6", fg: "#8C3A1F" }, // rose
  emotional:   { bg: "#E0D0F0", fg: "#4B2A6E" }, // lavender
  chaotic:     { bg: "#FFD8B8", fg: "#A0481A" }, // orange
  peaceful:    { bg: "#C8EDDA", fg: "#1F5E3F" }, // mint
  joyful:      { bg: "#FFD17A", fg: "#7A4A0A" }, // marigold
  anxious:     { bg: "#E2E2E2", fg: "#4A4A4A" }, // grey
};

export function moodLabel(mood: DiaryMood): string {
  return mood.charAt(0).toUpperCase() + mood.slice(1);
}
