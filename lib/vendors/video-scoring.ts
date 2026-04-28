// ── Video profile scoring ─────────────────────────────────────────────────
// Derives the badge state + a normalized video_score used by the ranking
// algorithm. The badge rule is spec-stated: 1 intro + 2 portfolio reels.
//
// video_score = 0.35*intro_presence
//             + 0.25*normalizedPortfolio
//             + 0.15*normalizedTestimonials
//             + 0.10*normalizedBehindScenes
//             + 0.15*normalizedEngagement
// clamped to [0, 1]; decays if most recent upload > 18 months old.

import type {
  VideoMeta,
  VideoProfileSummary,
} from "@/types/vendor-discovery";

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function norm(n: number, cap: number): number {
  return Math.min(1, n / cap);
}

export function summarizeVideoProfile(
  videos: VideoMeta[] | undefined,
): VideoProfileSummary {
  const list = videos ?? [];
  const intro = list.find((v) => v.kind === "intro") ?? null;
  const portfolio = list.filter((v) => v.kind === "portfolio");
  const testimonial = list.filter((v) => v.kind === "testimonial");
  const behind = list.filter((v) => v.kind === "behind_scenes");

  const introScore = intro ? 1 : 0;
  const portfolioScore = norm(portfolio.length, 6);
  const testimonialScore = norm(testimonial.length, 4);
  const behindScore = norm(behind.length, 3);

  // Engagement — play-through rate averaged across videos, capped at 80%.
  const engagement = norm(avg(list.map((v) => v.play_through_rate ?? 0)), 0.8);

  let score =
    0.35 * introScore +
    0.25 * portfolioScore +
    0.15 * testimonialScore +
    0.1 * behindScore +
    0.15 * engagement;

  // Recency decay. If the latest upload is older than 18 months, knock off
  // up to 25%.
  const latest = list
    .map((v) => new Date(v.uploaded_at).getTime())
    .sort((a, b) => b - a)[0];
  if (latest) {
    const monthsOld = (Date.now() - latest) / (1000 * 60 * 60 * 24 * 30);
    if (monthsOld > 18) {
      const decay = Math.min(0.25, (monthsOld - 18) / 60);
      score *= 1 - decay;
    }
  }

  score = Math.max(0, Math.min(1, score));

  const badge =
    intro && portfolio.length >= 2
      ? ("earned" as const)
      : intro || portfolio.length >= 1
        ? ("partial" as const)
        : ("none" as const);

  return {
    badge,
    intro_video: intro,
    portfolio_count: portfolio.length,
    testimonial_count: testimonial.length,
    behind_scenes_count: behind.length,
    video_score: score,
  };
}

// ── Contextual reel ranking ───────────────────────────────────────────────
// Given a couple's venue/style/planner, find the most relevant portfolio reels.

export interface ReelContext {
  venue_name?: string | null;
  venue_city?: string | null;
  style_preset_labels?: string[];
  planner_name?: string | null;
}

export function rankContextualReels(
  videos: VideoMeta[],
  ctx: ReelContext,
  limit: number = 3,
): VideoMeta[] {
  const reels = videos.filter((v) => v.kind === "portfolio");
  const scored = reels.map((v) => {
    let score = 0;
    if (ctx.venue_name && v.venue_name) {
      const a = v.venue_name.toLowerCase();
      const b = ctx.venue_name.toLowerCase();
      if (a === b) score += 6;
      else if (a.includes(b) || b.includes(a)) score += 4;
    }
    if (ctx.venue_city && v.venue_city) {
      if (v.venue_city.toLowerCase() === ctx.venue_city.toLowerCase()) score += 2;
    }
    if (ctx.planner_name && v.planner_name) {
      if (v.planner_name.toLowerCase() === ctx.planner_name.toLowerCase()) score += 3;
    }
    for (const styleLabel of ctx.style_preset_labels ?? []) {
      if ((v.wedding_style ?? []).some((s) => s.toLowerCase() === styleLabel.toLowerCase())) {
        score += 2;
      }
    }
    // Engagement tiebreaker
    score += (v.play_through_rate ?? 0) * 0.5;
    return { v, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.v);
}
