// ── AI feature flag registry ────────────────────────────────────────────────
// Section 10 of the cross-category refinement pass lists every AI feature
// the Build journeys reference. The platform's quality bar is "couples
// never see half-baked AI outputs," so most ship behind flags defaulted
// off — UI affordances render "Coming soon" or hide entirely until we're
// confident the AI layer can carry the weight.
//
// This module is the single source of truth for those flags. Couple-facing
// code reads only through `isAiFeatureEnabled`; the source-of-truth (env
// vars, GrowthBook, hard-coded) is swapped here without touching callers.

export type AiFeatureFlag =
  // Photography / Videography — manual addition is fine for v1.
  | "ai_shot_suggestion"
  | "ai_story_outline"
  // Décor — highest-risk feature; ship without.
  | "ai_scene_previews"
  // Catering — caterer collaboration is sufficient for v1.
  | "ai_menu_suggestion"
  | "ai_dish_suggestion"
  // Venue — affordance only for v1.
  | "ai_layout_suggestion"
  // Venue — already proven; this is the only flag default-on.
  | "ai_direction_cards"
  // Music — out of scope for v1.
  | "ai_music_suggestion"
  // Hair & Makeup
  | "ai_undertone_analysis"
  | "ai_accessory_recommender"
  | "ai_schedule_review";

// ── Defaults ───────────────────────────────────────────────────────────────
// Section 10 enumerates these explicitly; mirroring the table here means a
// future engineer adjusting a flag has one obvious place to look.

const AI_FEATURE_DEFAULTS: Record<AiFeatureFlag, boolean> = {
  ai_shot_suggestion: false,
  ai_story_outline: false,
  ai_scene_previews: false,
  ai_menu_suggestion: false,
  ai_dish_suggestion: false,
  ai_layout_suggestion: false,
  ai_direction_cards: true,
  ai_music_suggestion: false,
  ai_undertone_analysis: false,
  ai_accessory_recommender: false,
  ai_schedule_review: false,
};

// ── Runtime overrides ──────────────────────────────────────────────────────
// Server-side env: `MARIGOLD_AI_FLAGS=ai_scene_previews,ai_shot_suggestion`
// Client-side: not exposed yet — flip the default if you genuinely need a
// flag rolled out broadly. When we wire GrowthBook, replace this resolver.

function readEnvOverrides(): ReadonlySet<AiFeatureFlag> {
  if (typeof process === "undefined") return new Set();
  const raw = process.env.MARIGOLD_AI_FLAGS;
  if (!raw) return new Set();
  const tokens = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const valid = new Set<AiFeatureFlag>();
  for (const t of tokens) {
    if (t in AI_FEATURE_DEFAULTS) valid.add(t as AiFeatureFlag);
  }
  return valid;
}

const ENV_OVERRIDES = readEnvOverrides();

// ── Public API ─────────────────────────────────────────────────────────────

export function isAiFeatureEnabled(flag: AiFeatureFlag): boolean {
  if (ENV_OVERRIDES.has(flag)) return true;
  return AI_FEATURE_DEFAULTS[flag];
}

// Listing helper — useful in admin/debug surfaces. Don't wire to couple-
// facing UI without a reason.
export function listAiFeatureFlags(): ReadonlyArray<{
  flag: AiFeatureFlag;
  enabled: boolean;
}> {
  return (Object.keys(AI_FEATURE_DEFAULTS) as AiFeatureFlag[]).map((flag) => ({
    flag,
    enabled: isAiFeatureEnabled(flag),
  }));
}
