// ── Discovery ranking ─────────────────────────────────────────────────────
// Wraps the existing ai-recommendations scoring with three extra signals:
//   • video_score    (weight 0.08)
//   • style_match    (weight 0.15)
//   • collaboration  (weight 0.10)
// The original venue/planner/rating/budget signals stay untouched. We keep
// this out of ai-recommendations.ts to avoid breaking the current vendors
// page that imports from that file.

import type {
  VendorWithDiscovery,
  StyleSignature,
} from "@/types/vendor-discovery";
import { matchScore } from "./style-matching";
import { summarizeVideoProfile } from "./video-scoring";
import {
  availabilityStateFor,
} from "./availability";

export interface DiscoveryRankCtx {
  coupleStyle: StyleSignature | null;
  targetDateIso: string | null;
  shortlistedVendorIds: string[];
  adjacency: Map<string, Map<string, number>>;
  venueName: string | null;
  plannerCompany: string | null;
}

export interface DiscoveryScore {
  total: number;
  components: {
    base: number;
    video: number;
    style: number;
    collaboration: number;
    availabilityBoost: number;
  };
  whyThisPick: string[]; // Human-readable "why" reasons.
}

// A minimal base-score heuristic suitable for the showcase; the real engine
// would reuse buildRecommendations. Rating + review_count + wedding_count.
function baseScore(v: VendorWithDiscovery): number {
  const rating = v.rating ?? 0;
  const ratingScore = rating / 5;
  const reviewWeight = Math.min(1, v.review_count / 50);
  const weddingScore = Math.min(1, v.wedding_count / 100);
  return 0.55 * ratingScore * (0.6 + 0.4 * reviewWeight) + 0.45 * weddingScore;
}

export function scoreForDiscovery(
  v: VendorWithDiscovery,
  ctx: DiscoveryRankCtx,
): DiscoveryScore {
  const base = baseScore(v);

  // Video
  const videoProfile = v.video_profile ?? summarizeVideoProfile(v.videos);
  const video = videoProfile.video_score;

  // Style
  const style =
    ctx.coupleStyle && v.style_signature
      ? matchScore(ctx.coupleStyle, v.style_signature)
      : 0;

  // Collaboration
  const neighbors = ctx.adjacency.get(v.id);
  let collabOverlap = 0;
  if (neighbors) {
    for (const id of ctx.shortlistedVendorIds) {
      const w = neighbors.get(id) ?? 0;
      if (w > 0) collabOverlap += 1;
    }
  }
  const collab = Math.min(1, collabOverlap / 3);

  // Availability boost
  let availabilityBoost = 0;
  if (ctx.targetDateIso) {
    const state = availabilityStateFor(v.availability, ctx.targetDateIso);
    availabilityBoost = state === "available" ? 0.05 : state === "booked" ? -0.5 : 0;
  }

  const total =
    base * 0.62 +
    video * 0.08 +
    style * 0.15 +
    collab * 0.1 +
    availabilityBoost;

  const whyThisPick: string[] = [];
  if (style >= 0.75 && ctx.coupleStyle) {
    whyThisPick.push(`Matches your style (${Math.round(style * 100)}%)`);
  }
  if (videoProfile.badge === "earned") {
    whyThisPick.push(`Has an intro video and ${videoProfile.portfolio_count} reels`);
  }
  if (collabOverlap >= 1) {
    whyThisPick.push(
      `Has worked with ${collabOverlap} vendor${collabOverlap === 1 ? "" : "s"} in your shortlist`,
    );
  }
  if (ctx.venueName) {
    const venueMatch = v.venue_connections.find((vc) =>
      ctx.venueName!.toLowerCase().includes(vc.name.toLowerCase()),
    );
    if (venueMatch) {
      whyThisPick.push(
        `${venueMatch.wedding_count} wedding${venueMatch.wedding_count === 1 ? "" : "s"} at ${venueMatch.name}`,
      );
    }
  }
  if (ctx.plannerCompany) {
    const plannerMatch = v.planner_connections.find(
      (p) => p.company.toLowerCase() === ctx.plannerCompany!.toLowerCase(),
    );
    if (plannerMatch) {
      whyThisPick.push(`Works with your planner ${plannerMatch.company}`);
    }
  }
  if ((v.rating ?? 0) >= 4.8 && v.review_count >= 30) {
    whyThisPick.push(
      `${v.rating!.toFixed(1)} stars across ${v.review_count} reviews`,
    );
  }

  return {
    total,
    components: { base, video, style, collaboration: collab, availabilityBoost },
    whyThisPick: whyThisPick.slice(0, 4),
  };
}
