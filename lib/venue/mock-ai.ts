// ── Mock AI utilities for the Venue workspace ─────────────────────────────
// Deterministic, synchronous "AI" helpers used while real AI wiring is out
// of scope. Every function produces plausible, context-aware output from
// data the store already has — so the UX looks real and replacing with a
// network call later is a drop-in swap.

import type {
  DiscoveryQuizAnswers,
  ShortlistVenue,
  VenueSpace,
  VenueVibe,
} from "@/types/venue";
import { VIBE_OPTIONS } from "./discovery-quiz-config";

// ── Photo analysis ────────────────────────────────────────────────────────
// Given a photo's space tag + optional caption, produce a paragraph that
// reads like an AI vision model's output (estimated capacity, potential
// uses, décor ideas). The context of the wedding — guest count, vibe — is
// folded in so the output feels tailored.

export interface PhotoAnalysisContext {
  guestCount: number;
  primaryVibe: VenueVibe | null;
  eventScope: string | null;
}

export function analyzePhoto(
  spaceTag: string,
  caption: string,
  ctx: PhotoAnalysisContext,
): string {
  const tag = spaceTag.toLowerCase().trim();
  const capacityGuess = estimateCapacity(tag, ctx.guestCount);

  // Build a use-case recommendation from the tag.
  const uses = suggestUses(tag, ctx);
  const decor = suggestDecor(tag, ctx.primaryVibe);

  const line1 = `Reads as ${describeSpace(tag, caption)} — estimated capacity around ${capacityGuess}.`;
  const line2 = uses.length
    ? `Could work for ${uses.join(" or ")} given your ${ctx.guestCount || 300}-guest celebration.`
    : "";
  const line3 = decor
    ? `Décor direction: ${decor}.`
    : "";

  return [line1, line2, line3].filter(Boolean).join(" ");
}

function describeSpace(tag: string, caption: string): string {
  if (!tag && !caption) return "an event space";
  if (tag.includes("ballroom")) return "a formal indoor ballroom";
  if (tag.includes("garden") || tag.includes("lawn")) return "an outdoor garden / lawn";
  if (tag.includes("courtyard")) return "an open-air courtyard";
  if (tag.includes("terrace")) return "an open terrace";
  if (tag.includes("kitchen")) return "a back-of-house catering kitchen";
  if (tag.includes("bridal") || tag.includes("suite")) return "a private suite";
  if (tag.includes("parking") || tag.includes("valet")) return "a parking / arrival zone";
  if (tag.includes("entrance") || tag.includes("foyer")) return "an arrival / foyer space";
  return caption ? `a ${caption.toLowerCase()}` : "an event space";
}

function estimateCapacity(tag: string, guestCount: number): string {
  if (tag.includes("ballroom") || tag.includes("hall")) {
    const seated = Math.max(Math.round((guestCount || 300) * 0.9), 180);
    return `${seated} seated dinner`;
  }
  if (tag.includes("garden") || tag.includes("lawn") || tag.includes("courtyard")) {
    const cocktail = Math.max(Math.round((guestCount || 300) * 1.1), 200);
    return `${cocktail} standing for cocktails`;
  }
  if (tag.includes("terrace")) {
    return "120–180 cocktail-style";
  }
  if (tag.includes("bridal") || tag.includes("suite")) {
    return "6–10 people (bride + attendants)";
  }
  if (tag.includes("kitchen")) {
    return "full service for 400+";
  }
  return `${Math.max(guestCount || 250, 150)} mixed use`;
}

function suggestUses(
  tag: string,
  ctx: PhotoAnalysisContext,
): string[] {
  const uses: string[] = [];
  if (tag.includes("ballroom") || tag.includes("hall")) {
    uses.push("sangeet", "reception dinner");
  }
  if (tag.includes("garden") || tag.includes("lawn")) {
    uses.push("haldi", "outdoor ceremony", "cocktail hour");
  }
  if (tag.includes("courtyard")) {
    uses.push("mehendi", "ceremony with mandap on stone");
  }
  if (tag.includes("terrace")) {
    uses.push("cocktail hour at golden hour");
  }
  if (tag.includes("bridal") || tag.includes("suite")) {
    uses.push("getting-ready");
  }
  if (ctx.eventScope === "weekend" && uses.length === 0) {
    uses.push("one of your weekend events");
  }
  return uses.slice(0, 2);
}

function suggestDecor(tag: string, vibe: VenueVibe | null): string | null {
  const vibeLabel = vibe
    ? VIBE_OPTIONS.find((v) => v.id === vibe)?.label.toLowerCase() ?? null
    : null;
  if (tag.includes("ballroom")) {
    if (vibeLabel?.includes("palace"))
      return "low brass / mirrored centerpieces, marigold runners, amber uplighting";
    return "tall floral centerpieces, pin-spot lighting on the dance floor, mirror risers";
  }
  if (tag.includes("garden") || tag.includes("lawn")) {
    return "fabric canopy overhead, lantern clusters, low seating rounds";
  }
  if (tag.includes("courtyard")) {
    return "marigold strands across archways, brass diyas, stone-platform mandap";
  }
  if (tag.includes("terrace")) {
    return "cafe lights strung overhead, cocktail rounds with ikebana-style florals";
  }
  return null;
}

// ── Floor plan / space layout suggestion ──────────────────────────────────
// Produce a short "this is what we can turn this space into" blurb for a
// given venue space, given the event attached to it and the wedding brief.

export interface LayoutContext {
  guestCount: number;
  vibes: VenueVibe[];
  mustHaves: string[];
  eventName?: string;
}

export function suggestLayout(
  space: VenueSpace,
  ctx: LayoutContext,
): string {
  const cap = parseFirstNumber(space.capacity);
  const guests = ctx.guestCount || 300;
  const use = (space.use || ctx.eventName || "your event").toLowerCase();

  const parts: string[] = [];

  if (use.includes("ceremony") || use.includes("wedding")) {
    const rows = Math.ceil(guests / 14);
    parts.push(
      `${rows} rows of 14 chairs with a 5-ft center aisle · mandap on the short wall for best guest sight-lines`,
    );
    if (ctx.mustHaves.includes("havan_allowed")) {
      parts.push("havan kund on a raised stone platform, 6 ft clearance from fabric");
    }
  } else if (use.includes("reception") || use.includes("dinner") || use.includes("sangeet")) {
    const tables = Math.ceil(guests / 10);
    parts.push(
      `${tables} rounds of 10 · perimeter bar on the long wall · 12×14 ft dance floor centered under chandelier`,
    );
    parts.push("stage flush against the short wall, 16×8 ft performance deck");
  } else if (use.includes("cocktail")) {
    const standing = Math.round(guests * 0.9);
    parts.push(
      `${standing} standing · 6 cocktail rounds · bar stations on opposite walls so flow doesn't bottleneck`,
    );
  } else if (use.includes("haldi") || use.includes("mehendi")) {
    parts.push("low cushion seating on the perimeter · instrumental musicians in the corner · drop cloths under turmeric stations");
  } else {
    parts.push("open floor · flexible setup based on event");
  }

  if (cap !== null && guests > cap) {
    parts.push(
      `⚠️ Your guest count (${guests}) exceeds this space's max (${cap}) — consider splitting across spaces or a larger room.`,
    );
  }

  const vibeLabel = ctx.vibes
    .map((v) => VIBE_OPTIONS.find((x) => x.id === v)?.label)
    .filter(Boolean)
    .join(" / ");
  if (vibeLabel) {
    parts.push(`Holds the ${vibeLabel.toLowerCase()} direction you loved.`);
  }

  return parts.join(". ") + ".";
}

function parseFirstNumber(cap: string): number | null {
  const m = cap.match(/\d+/);
  return m ? Number(m[0]) : null;
}

// ── "Find Venues" suggestions ─────────────────────────────────────────────
// Turn a completed quiz into a 3-sentence summary that becomes the
// "suggestion explainer" above the Shortlist "Suggested for you" grid.

export function summarizeQuiz(answers: DiscoveryQuizAnswers): string {
  const vibes = answers.vibes
    .map((v) => VIBE_OPTIONS.find((x) => x.id === v)?.label)
    .filter(Boolean)
    .join(" · ");
  const guestLabel = {
    intimate: "under 100",
    medium: "100–250",
    large: "250–400",
    grand: "400+",
  }[answers.guest_count ?? "medium"] ?? "your crowd";

  const scope =
    answers.event_scope === "weekend"
      ? "a full wedding weekend"
      : answers.event_scope === "few"
        ? "a few key events"
        : "the wedding itself";

  const catering =
    answers.catering === "outside"
      ? "must welcome an outside caterer"
      : answers.catering === "venue"
        ? "handles catering in-house"
        : "flexible on catering";

  const mustHaves = answers.must_haves.length
    ? ` Prioritizing: ${answers.must_haves.slice(0, 3).join(", ")}.`
    : "";

  const loc = answers.location.trim()
    ? ` Searching in ${answers.location}.`
    : "";

  return `Looking for ${vibes || "the right feeling"} venues for ${guestLabel} guests across ${scope} — ${catering}.${loc}${mustHaves}`;
}

// Seed a handful of "suggested for you" picks from the quiz result. Pure
// mapping — no network. Production replaces this with a real recommendation
// service.
export interface QuizVenueSuggestion {
  name: string;
  location: string;
  vibe_summary: string;
  hero_image_url: string;
  match_reason: string;
}

const VIBE_SUGGESTION_LIBRARY: Record<VenueVibe, QuizVenueSuggestion[]> = {
  palace_grand: [
    {
      name: "Rambagh Palace · Jaipur",
      location: "Jaipur, Rajasthan",
      vibe_summary: "Former royal residence, walled gardens, courtyards for every event.",
      hero_image_url:
        "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=900&q=80",
      match_reason: "Palace direction · multi-event weekend fit",
    },
    {
      name: "Jagmandir Island Palace · Udaipur",
      location: "Lake Pichola, Udaipur",
      vibe_summary: "Private island palace — water on every side, arrival by boat.",
      hero_image_url:
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
      match_reason: "Scenic backdrop · grand-entrance factor",
    },
  ],
  garden_natural: [
    {
      name: "Samode Bagh",
      location: "Samode, Rajasthan",
      vibe_summary: "Tented garden estate — lush lawns, Mughal-style pavilions.",
      hero_image_url:
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80",
      match_reason: "Garden direction · outdoor ceremony option",
    },
  ],
  modern_minimal: [
    {
      name: "The Leela Gandhinagar",
      location: "Gandhinagar, Gujarat",
      vibe_summary: "Glass-and-stone modern palace · minimal, wide spaces.",
      hero_image_url:
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80",
      match_reason: "Modern direction · indoor/outdoor flex",
    },
  ],
  rustic_warm: [
    {
      name: "Amanbagh",
      location: "Ajabgarh, Rajasthan",
      vibe_summary: "Stone haveli retreat · intimate, rustic, lantern-lit.",
      hero_image_url:
        "https://images.unsplash.com/photo-1533606688076-b6683a5f59f1?w=900&q=80",
      match_reason: "Rustic direction · intimate scale",
    },
  ],
  beachfront: [
    {
      name: "Taj Exotica · Goa",
      location: "Benaulim, Goa",
      vibe_summary: "Beachfront ceremony lawn · resort-block logistics.",
      hero_image_url:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
      match_reason: "Beach direction · outdoor ceremony",
    },
  ],
  intimate_boutique: [
    {
      name: "The Serai · Jaisalmer",
      location: "Jaisalmer, Rajasthan",
      vibe_summary: "Under-40-tent desert camp · bespoke, under-150 only.",
      hero_image_url:
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
      match_reason: "Intimate direction · full buyout feel",
    },
  ],
};

export function suggestionsFromQuiz(
  answers: DiscoveryQuizAnswers,
): QuizVenueSuggestion[] {
  const vibes = answers.vibes.length > 0 ? answers.vibes : (["palace_grand"] as VenueVibe[]);
  const seen = new Set<string>();
  const out: QuizVenueSuggestion[] = [];
  for (const v of vibes) {
    for (const s of VIBE_SUGGESTION_LIBRARY[v] ?? []) {
      if (seen.has(s.name)) continue;
      seen.add(s.name);
      out.push(s);
    }
  }
  return out.slice(0, 6);
}

// ── Brief-refine (placeholder rewrite) ────────────────────────────────────
// The existing "Refine with AI" button on DreamBrief was an alert(). Keep the
// door open to a real call later; for now, gently reformat the user's prose.

export function refineBrief(current: string): string {
  const trimmed = current.trim();
  if (!trimmed) return "";
  // Split on full sentences, capitalize first letter of each, collapse ws.
  return trimmed
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
