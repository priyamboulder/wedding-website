// ── Events AI adapter ──────────────────────────────────────────────────────
// Thin adapter for everything the Events dashboard needs to generate. Today
// this returns deterministic stub output synthesized from the couple's own
// answers (story, traditions, palette, mood) so the dashboard is immediately
// useful without any network calls. Step 2 of the feature spec will swap
// these bodies for real Claude Sonnet 4.6 / Haiku 4.5 calls behind the same
// function signatures — call sites in `components/events/dashboard/*` won't
// change.

import type {
  AISuggestionScope,
  CoupleContext,
  EventRecord,
  EventType,
  InspirationImage,
  MoodTile,
  Palette,
  PaletteSwatch,
  VibeOption,
} from "@/types/events";
import {
  EVENT_TYPE_OPTIONS,
  MOOD_TILE_OPTIONS,
  PALETTE_LIBRARY,
  PRIORITY_OPTIONS,
} from "@/lib/events-seed";
import {
  COLOR_LIBRARY,
  type ColorLibraryEntry,
} from "@/lib/events/color-library";

// ── Shared context ─────────────────────────────────────────────────────────

export interface EventsAIContext {
  coupleContext: CoupleContext;
  events: EventRecord[];
}

// ── Suggestion shapes (narrowed per scope) ─────────────────────────────────

export interface EventNameSuggestion {
  eventId: string;
  name: string;
  rationale: string;
}

export interface EventThemeSuggestion {
  eventId: string;
  theme: string;
  narrative: string;
}

export interface AttireSuggestion {
  eventId: string;
  bride: string;
  groom: string;
  partyDressCode: string;
  rationale: string;
}

export interface PalettePerEventSuggestion {
  eventId: string;
  paletteId: string;
  shiftNote: string;
}

export interface CuisineSuggestion {
  eventId: string;
  direction: string;
}

export interface BudgetSuggestion {
  allocation: Record<string, number>;
  summary: string;
}

export interface WeddingPartySuggestion {
  bridesmaids: number;
  groomsmen: number;
  parents: number;
  grandparents: number;
  flowerGirls: number;
  ringBearers: number;
  summary: string;
}

// ── Deterministic stub generators ──────────────────────────────────────────

export function generateEventNames(ctx: EventsAIContext): EventNameSuggestion[] {
  const { coupleContext, events } = ctx;
  const storyHint = firstEvocativePhrase(coupleContext.storyText);
  return events.map((e) => {
    const base = labelFor(e);
    const name = storyHint
      ? `${storyHint} — ${base}`
      : poeticNameFor(e.type, base);
    return {
      eventId: e.id,
      name,
      rationale: storyHint
        ? `Pulled from your story's opening image, tuned to feel like the ${base.toLowerCase()} moment.`
        : `Keeps the ${base.toLowerCase()} recognisable while setting an editorial register for your paper suite.`,
    };
  });
}

export function generateEventThemes(ctx: EventsAIContext): EventThemeSuggestion[] {
  const { events, coupleContext } = ctx;
  const traditions = coupleContext.traditions.join(", ") || "your traditions";
  return events.map((e) => {
    const mood = e.moodTile
      ? MOOD_TILE_OPTIONS.find((m) => m.id === e.moodTile)?.name ?? "your vibe"
      : "your vibe";
    return {
      eventId: e.id,
      theme: themeFor(e.type, e.moodTile),
      narrative:
        `A ${mood.toLowerCase()} read on ${labelFor(e).toLowerCase()}, grounded in ${traditions}. ` +
        `We'll lean into texture, music, and a single memorable moment — everything else supports that.`,
    };
  });
}

export function generateAttire(ctx: EventsAIContext): AttireSuggestion[] {
  const { events, coupleContext } = ctx;
  const hero = PALETTE_LIBRARY.find(
    (p) => p.id === coupleContext.heroPaletteId,
  );
  return events.map((e) => {
    const palette =
      PALETTE_LIBRARY.find((p) => p.id === e.paletteId) ?? hero ?? PALETTE_LIBRARY[0];
    const accent = palette.colors.find((c) => c.role === "primary")?.name ?? "accent";
    const label = labelFor(e).toLowerCase();
    return {
      eventId: e.id,
      bride: brideAttireFor(e.type, accent),
      groom: groomAttireFor(e.type, accent),
      partyDressCode: partyDressCodeFor(e.type),
      rationale: `Sits inside your ${palette.name} anchor and photographs cleanly against the ${label} setting.`,
    };
  });
}

export function generatePalettePerEvent(
  ctx: EventsAIContext,
): PalettePerEventSuggestion[] {
  const { events, coupleContext } = ctx;
  const hero = coupleContext.heroPaletteId ?? PALETTE_LIBRARY[0].id;
  return events.map((e) => ({
    eventId: e.id,
    paletteId: shiftPaletteFor(e.type, hero),
    shiftNote: paletteShiftNoteFor(e.type),
  }));
}

export function generateCuisine(ctx: EventsAIContext): CuisineSuggestion[] {
  const { events, coupleContext } = ctx;
  const primary = coupleContext.traditions[0];
  return events.map((e) => ({
    eventId: e.id,
    direction: cuisineFor(e.type, primary),
  }));
}

export function generateBudgetAllocation(ctx: EventsAIContext): BudgetSuggestion {
  // Convert the ranking into a softly decreasing weight, then normalise to
  // 100. Reserves a 10% misc floor so no line goes below a sensible minimum.
  const ranking = ctx.coupleContext.priorityRanking;
  const miscFloor = 0.1;
  const weights = ranking.map((_, i) => 1 / (i + 1.2));
  const sum = weights.reduce((a, b) => a + b, 0);
  const allocation: Record<string, number> = {};
  ranking.forEach((p, i) => {
    allocation[p] = Math.round((weights[i] / sum) * (1 - miscFloor) * 100);
  });
  allocation.misc = Math.max(
    1,
    100 - Object.values(allocation).reduce((a, b) => a + b, 0),
  );
  const top = ranking
    .slice(0, 2)
    .map((p) => PRIORITY_OPTIONS.find((o) => o.id === p)?.name ?? p)
    .join(" and ");
  return {
    allocation,
    summary: `With ${top} as your top two, expect the weight of your budget to land there; everything else flexes around them.`,
  };
}

export function generateWeddingParty(ctx: EventsAIContext): WeddingPartySuggestion {
  const total = ctx.coupleContext.totalGuestCount;
  const scale = Math.max(1, Math.round(total / 120));
  return {
    bridesmaids: 4 + Math.min(4, scale),
    groomsmen: 4 + Math.min(4, scale),
    parents: 4,
    grandparents: Math.min(4, 2 + scale),
    flowerGirls: 2,
    ringBearers: 1,
    summary:
      `Scaled to ${total} guests. Adjust any line — the downstream stationery and ceremony modules read from this directly.`,
  };
}

// ── Proactive flags ────────────────────────────────────────────────────────
// Lightweight rule-based version of the spec's flags engine. Later this runs
// on top of the AI; for now deterministic checks are enough to validate the
// surface.

export interface EventsFlag {
  id: string;
  tone: "conflict" | "opportunity" | "warning";
  message: string;
  scope: AISuggestionScope | "program" | "context";
}

export function detectFlags(ctx: EventsAIContext): EventsFlag[] {
  const flags: EventsFlag[] = [];
  const { coupleContext, events } = ctx;

  if (coupleContext.traditions.includes("gujarati")) {
    const hasGarba = events.some((e) => e.type === "garba");
    const hasCeremony = events.some((e) => e.type === "ceremony");
    if (hasCeremony && !hasGarba) {
      flags.push({
        id: "missing-garba",
        tone: "opportunity",
        scope: "program",
        message:
          "Gujarati couples often run a Garba the night before the ceremony — worth considering before you lock the program.",
      });
    }
  }

  const moodCoverage = events.filter((e) => e.moodTile).length;
  if (events.length > 0 && moodCoverage < events.length) {
    flags.push({
      id: "moods-incomplete",
      tone: "warning",
      scope: "context",
      message:
        `${events.length - moodCoverage} of your events still need a vibe — set them so attire and décor stay coherent.`,
    });
  }

  if (
    coupleContext.storyText.trim().length > 0 &&
    coupleContext.storyText.trim().length < 40
  ) {
    flags.push({
      id: "story-thin",
      tone: "warning",
      scope: "context",
      message:
        "Your story is brief — adding a line about how you met will make event names and themes land much harder.",
    });
  }

  return flags;
}

// ── Internal helpers ───────────────────────────────────────────────────────

function labelFor(e: EventRecord): string {
  if (e.type === "custom" && e.customName) return e.customName;
  return EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ?? e.type;
}

function firstEvocativePhrase(story: string): string | null {
  const trimmed = story.trim();
  if (trimmed.length < 40) return null;
  // Pull the first noun-ish phrase — the first 2–3 content words after a
  // connector like "at", "in", "on", "under". Fallback to null when nothing
  // obvious lands.
  const match = trimmed.match(/\b(at|in|on|under|by|near)\s+(the\s+)?([A-Za-z][\w'-]*(?:\s+[A-Za-z][\w'-]*){0,2})/i);
  if (!match) return null;
  const phrase = match[3]
    .split(/\s+/)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return `Under the ${phrase}`;
}

function poeticNameFor(type: EventRecord["type"], base: string): string {
  switch (type) {
    case "mehendi":
      return "Henna & Marigolds";
    case "sangeet":
      return "Late Light Sangeet";
    case "garba":
      return "Spin of the Dandiya";
    case "pithi":
      return "Turmeric Morning";
    case "haldi":
      return "Gold in the Garden";
    case "baraat":
      return "The Arrival";
    case "ceremony":
      return "Seven Steps";
    case "cocktail":
      return "First Pour";
    case "reception":
      return "The Long Table";
    case "after_party":
      return "After Hours";
    case "welcome_dinner":
      return "Welcome Home";
    case "farewell_brunch":
      return "Slow Brunch";
    default:
      return base;
  }
}

function themeFor(type: EventRecord["type"], mood: MoodTile | null): string {
  const base: Record<string, string> = {
    mehendi: "Afternoon garden",
    sangeet: "Cinematic performance",
    garba: "Folk dance courtyard",
    pithi: "Intimate family ritual",
    haldi: "Golden morning",
    baraat: "Procession energy",
    ceremony: "Sacred canopy",
    cocktail: "Editorial arrival",
    reception: "Long-table dinner",
    after_party: "Night-club take-over",
    welcome_dinner: "Unhurried welcome",
    farewell_brunch: "Soft send-off",
    custom: "Bespoke moment",
  };
  const moodLabel = mood
    ? MOOD_TILE_OPTIONS.find((m) => m.id === mood)?.name
    : null;
  return moodLabel ? `${base[type] ?? base.custom}, ${moodLabel.toLowerCase()}` : base[type] ?? base.custom;
}

function brideAttireFor(type: EventRecord["type"], accentName: string): string {
  switch (type) {
    case "mehendi":
      return `Soft ${accentName.toLowerCase()} anarkali with mirrorwork, barefoot-friendly`;
    case "sangeet":
      return `Deep ${accentName.toLowerCase()} lehenga, sheer dupatta, statement earrings`;
    case "reception":
      return `Hand-embroidered saree or gown in ${accentName.toLowerCase()}, long drape`;
    case "ceremony":
      return "Heirloom red lehenga, full ceremonial jewellery";
    case "pithi":
    case "haldi":
      return "Pale cotton chanderi, something you don't mind staining";
    case "garba":
      return "Chaniya choli, mirrorwork, full skirt for the spin";
    default:
      return `Palette-aligned look in ${accentName.toLowerCase()} tones`;
  }
}

function groomAttireFor(type: EventRecord["type"], accentName: string): string {
  switch (type) {
    case "mehendi":
      return "Breathable kurta, linen trousers, open sandals";
    case "sangeet":
      return `Bandhgala in ${accentName.toLowerCase()} with a crisp pocket square`;
    case "reception":
      return `Tuxedo or tailored suit with a ${accentName.toLowerCase()} tie or boutonnière`;
    case "ceremony":
      return "Ivory sherwani, safa, traditional jutti";
    case "pithi":
    case "haldi":
      return "Simple white kurta, the turmeric will do the rest";
    case "garba":
      return "Short kurta, colourful dupatta, comfortable for hours of dance";
    default:
      return `Outfit coordinated to the ${accentName.toLowerCase()} anchor`;
  }
}

function partyDressCodeFor(type: EventRecord["type"]): string {
  switch (type) {
    case "mehendi":
      return "Garden Indian — florals, pastels";
    case "sangeet":
      return "Jewel tones, cocktail formal";
    case "reception":
      return "Black tie with an Indian twist";
    case "ceremony":
      return "Traditional Indian — bright, no black";
    case "pithi":
    case "haldi":
      return "Yellows, whites, old favourites";
    case "garba":
      return "Chaniya choli / kurta, comfortable shoes";
    default:
      return "Dressy casual";
  }
}

function cuisineFor(
  type: EventRecord["type"],
  primary: EventsAIContext["coupleContext"]["traditions"][number] | undefined,
): string {
  const regional = regionalCuisineFor(primary);
  switch (type) {
    case "mehendi":
      return `${regional} street-food stations — chaats, tikkis, live kathi rolls`;
    case "sangeet":
      return "Pan-Indian with live stations (tandoor, dosa, biryani) and a dessert wall";
    case "reception":
      return `Dual-cuisine plated: one course ${regional}, one continental, shared mithai course`;
    case "ceremony":
      return "Light vegetarian thali — eaten quickly between rituals";
    case "pithi":
    case "haldi":
      return `Home-style ${regional} — simple, familial, lots of tea`;
    case "garba":
      return "Gujarati thali stations — farsan, dhokla, undhiyu, shrikhand";
    case "after_party":
      return "Late-night bites — sliders, masala fries, cold sweets";
    case "welcome_dinner":
      return `Regional ${regional} introduction menu for travelling guests`;
    case "farewell_brunch":
      return "Egg stations, masala chai, kathi rolls, fresh fruit";
    default:
      return `${regional} anchored menu with one showcase course`;
  }
}

function regionalCuisineFor(
  primary: EventsAIContext["coupleContext"]["traditions"][number] | undefined,
): string {
  switch (primary) {
    case "gujarati":
      return "Gujarati";
    case "punjabi":
      return "Punjabi";
    case "tamil":
    case "telugu":
      return "South Indian";
    case "bengali":
      return "Bengali";
    case "marwari":
      return "Marwari-Rajasthani";
    case "marathi":
      return "Maharashtrian";
    case "sindhi":
      return "Sindhi";
    case "south_indian_christian":
      return "Syrian Christian / South Indian";
    default:
      return "Modern Indian";
  }
}

function shiftPaletteFor(type: EventRecord["type"], heroId: string): string {
  // Simple rule: pithi/haldi go a shade lighter, reception goes a shade
  // deeper, everything else stays on the hero. Good enough until the AI
  // produces actual per-event variations.
  const hero = PALETTE_LIBRARY.find((p) => p.id === heroId) ?? PALETTE_LIBRARY[0];
  const lighten = ["saffron-ivory", "coral-mint"];
  const deepen = ["ink-gold", "emerald-copper", "rose-burgundy", "indigo-mirror"];
  if (type === "pithi" || type === "haldi" || type === "mehendi") {
    return lighten.includes(hero.id) ? hero.id : "saffron-ivory";
  }
  if (type === "reception" || type === "after_party") {
    return deepen.includes(hero.id) ? hero.id : "ink-gold";
  }
  return hero.id;
}

function paletteShiftNoteFor(type: EventRecord["type"]): string {
  switch (type) {
    case "pithi":
    case "haldi":
    case "mehendi":
      return "Lifted a shade — turmeric and florals photograph better against lighter tones.";
    case "reception":
    case "after_party":
      return "Pushed deeper — more contrast, heavier velvet energy for night-time portraits.";
    default:
      return "Held on the hero palette so the day reads as one event.";
  }
}

export function findPalette(id: string | null): Palette | null {
  if (!id) return null;
  return PALETTE_LIBRARY.find((p) => p.id === id) ?? null;
}

// ── Vibe suggestion (Q4 favorites → label + name + theme) ─────────────────
// Deterministic stub that reads the tag intersection across a couple's
// favorited images for one event and proposes a 2-word vibe label, an
// evocative event name, and a one-sentence theme. Stable output for a
// given `(favorites, rotation)` pair so "See alternatives" cycles through
// distinct proposals.

export interface VibeSuggestion {
  vibeLabel: string;
  vibeEventName: string;
  vibeTheme: string;
  rationale: string;
}

interface VibeFamily {
  label: string;
  // Tags that "unlock" this family when they appear in the favorites.
  // Matched by frequency — the family with the highest total tag score
  // wins (first tag weighted heaviest).
  triggerTags: string[];
  // Name pool keyed by event type for rotation. If an event isn't
  // listed, we fall back to the generic list.
  eventNames: Partial<Record<EventType, string[]>> & { default: string[] };
  themeStem: string;
}

// Order matters for ties — earlier families win. Keep widest nets
// (traditional, jewel) before more specific ones.
const VIBE_FAMILIES: VibeFamily[] = [
  {
    label: "Bollywood Glam",
    triggerTags: ["bollywood", "glam", "stage", "theatrical", "velvet", "sequined"],
    eventNames: {
      sangeet: ["A Night in Bombay", "Curtain Call", "Studio Lights", "The Big Number"],
      reception: ["Silver Screen", "The Gala", "Spotlight", "Filmi Nights"],
      after_party: ["Encore", "Backlot", "Last Show"],
      default: ["Cinema House", "Spotlight", "Curtain Call"],
    },
    themeStem: "1970s Bollywood cinema, deep jewel tones, a stage you can't ignore",
  },
  {
    label: "Jewel Box",
    triggerTags: ["jewel", "emerald", "sapphire", "ruby", "saturated", "ornate"],
    eventNames: {
      sangeet: ["The Jewel Box", "Peacock Hour", "Lapis & Gold"],
      reception: ["The Jewel Box", "Emerald Table", "Gilded Evening"],
      ceremony: ["Sacred Jewel", "Gilded Vows", "Temple Gold"],
      default: ["Jewel Tones", "Gilded Room", "Ruby & Emerald"],
    },
    themeStem: "Saturated emerald, sapphire, and gold — a room that reads like a gemstone",
  },
  {
    label: "Garden Romance",
    triggerTags: ["garden", "romance", "pastel", "floral", "candlelight", "outdoor"],
    eventNames: {
      mehendi: ["The Rose Garden", "Wild Herbs", "Midsummer"],
      welcome_dinner: ["The Walled Garden", "Long Table in Bloom"],
      ceremony: ["Garden Vows", "Under the Arbor"],
      farewell_brunch: ["Morning Garden", "Orchard Brunch"],
      default: ["The Rose Garden", "Into the Green", "Petal Hour"],
    },
    themeStem: "Overflowing florals, dusk candlelight, linen that moves in the breeze",
  },
  {
    label: "Bollywood Retro",
    triggerTags: ["retro", "70s", "bollywood", "saturated", "deep"],
    eventNames: {
      sangeet: ["Disco Deewane", "Qurbani", "70s Reel"],
      after_party: ["Late Reel", "Backlot", "Encore"],
      default: ["Vintage Reel", "Film City", "Retro Night"],
    },
    themeStem: "Deep burgundies, antique gold, a wink at seventies Hindi cinema",
  },
  {
    label: "Heritage Haveli",
    triggerTags: ["haveli", "fresco", "indigo", "mirror", "ornate", "courtyard"],
    eventNames: {
      mehendi: ["Blue Courtyard", "Fresco Afternoon"],
      sangeet: ["Haveli Nights", "Indigo & Mirror"],
      ceremony: ["The Courtyard", "Haveli Vows"],
      default: ["Haveli Hours", "Courtyard Air", "Mirror Walls"],
    },
    themeStem: "Indigo fresco walls, mirror work, gilded accents from a restored haveli",
  },
  {
    label: "Coastal Ease",
    triggerTags: ["coastal", "whitewash", "linen", "sea-salt", "fresh"],
    eventNames: {
      welcome_dinner: ["Salt Air", "The Boathouse"],
      farewell_brunch: ["Morning Tide", "The Shoreline"],
      haldi: ["Salt & Sun", "Tide Pool"],
      default: ["Salt Air", "Shoreline", "White Sail"],
    },
    themeStem: "Breezy whites, woven rattan, a coastline you can walk barefoot on",
  },
  {
    label: "Monsoon Modern",
    triggerTags: ["monsoon", "modern", "architectural", "ink", "sage", "minimal"],
    eventNames: {
      cocktail: ["Architect's Hour", "Ink & Sage", "The Gallery"],
      sangeet: ["Gallery Night", "Cast Shadow"],
      reception: ["The Long Room", "Concrete & Silk"],
      default: ["Ink & Sage", "The Gallery", "Architect's Hour"],
    },
    themeStem: "Concrete lines, sage accents, a room that feels designed, not decorated",
  },
  {
    label: "Folk Saturation",
    triggerTags: ["folk", "saturated", "marigold", "playful", "fuchsia", "dance"],
    eventNames: {
      garba: ["Full Spin", "Marigold Night", "Folk & Fire"],
      mehendi: ["Henna & Marigolds", "Colour Afternoon"],
      default: ["Marigold Night", "Full Saturation", "Colour Hour"],
    },
    themeStem: "Marigold, fuchsia, and saffron turned all the way up",
  },
  {
    label: "Temple Traditional",
    triggerTags: ["traditional", "south-indian", "banana-leaf", "brass", "marigold", "ceremonial"],
    eventNames: {
      ceremony: ["Seven Steps", "The Mandapam", "Brass & Marigold"],
      pithi: ["Turmeric Morning", "Family Circle"],
      haldi: ["Gold Morning", "Brass Afternoon"],
      default: ["Temple Air", "Brass & Marigold", "The Mandapam"],
    },
    themeStem: "Brass, banana leaf greens, marigold garlands — deeply traditional register",
  },
  {
    label: "Champagne Tonal",
    triggerTags: ["champagne", "blush", "tonal", "shimmer", "soft", "formal"],
    eventNames: {
      cocktail: ["First Pour", "Shimmer Hour", "Gilded Hour"],
      reception: ["The Gilded Table", "Champagne Room"],
      default: ["Shimmer Hour", "First Pour", "Gilded Room"],
    },
    themeStem: "Soft blush, champagne, and rose gold — tonal and just-lit",
  },
  {
    label: "Midnight & Gold",
    triggerTags: ["midnight", "navy", "gold", "evening", "candlelight", "formal"],
    eventNames: {
      reception: ["Midnight Table", "Gold Hour", "Navy & Gilt"],
      cocktail: ["Blue Hour", "Candlelit Arrival"],
      default: ["Midnight & Gold", "Blue Hour", "Candlelit"],
    },
    themeStem: "Deep navy, antique gold, and a candle on every surface",
  },
  {
    label: "Black Tie Modern",
    triggerTags: ["black-tie", "monochrome", "onyx", "pearl", "silver", "formal"],
    eventNames: {
      cocktail: ["The Ballroom", "Black & Pearl", "The Standard"],
      reception: ["The Standard", "Black Tie", "Onyx & Gold"],
      after_party: ["Onyx Hour", "The Club", "Last Call"],
      default: ["The Standard", "Black & Gold", "The Ballroom"],
    },
    themeStem: "Monochrome with one slash of gold — unapologetically black-tie",
  },
];

export function generateVibeSuggestion(input: {
  event: EventRecord;
  coupleContext: CoupleContext;
  favoritedImages: InspirationImage[];
  rotation?: number;
  refinementNote?: string;
}): VibeSuggestion {
  const { event, favoritedImages, refinementNote } = input;
  const rotation = Math.max(0, input.rotation ?? 0);

  // Tally tags. First tag in each trigger list counts double since it's
  // the most indicative of the family.
  const tagCounts = new Map<string, number>();
  for (const img of favoritedImages) {
    for (const t of img.tags) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }

  // Score each family, then pick one — primary at rotation 0, alternates
  // at rotation > 0. We keep the full ranking so refinement can cycle.
  const ranked = VIBE_FAMILIES.map((family) => {
    let score = 0;
    family.triggerTags.forEach((t, i) => {
      const weight = i === 0 ? 2 : 1;
      score += (tagCounts.get(t) ?? 0) * weight;
    });
    return { family, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  // Fallback when favorites are sparse or tags don't match any family:
  // pick from the first family whose triggers include the event's own
  // typical tags, else the first family in the list.
  let chosen: VibeFamily;
  let primaryTags: string[] = [];
  if (ranked.length === 0) {
    chosen = VIBE_FAMILIES[0];
    primaryTags = Array.from(tagCounts.keys()).slice(0, 3);
  } else {
    const idx = rotation % ranked.length;
    chosen = ranked[idx].family;
    primaryTags = chosen.triggerTags.filter((t) => tagCounts.has(t));
  }

  const nameList = chosen.eventNames[event.type] ?? chosen.eventNames.default;
  const vibeEventName = nameList[rotation % nameList.length];

  const rationaleTags = primaryTags.slice(0, 3).join(", ") || "the overall direction";
  const refinementNoteTrimmed = refinementNote?.trim();

  const rationale = refinementNoteTrimmed
    ? `Revised to honor your note — "${refinementNoteTrimmed}" — while keeping the ${chosen.label.toLowerCase()} anchor pulled from ${rationaleTags}.`
    : `Drawn from recurring cues across your favorites: ${rationaleTags}. ${chosen.label} keeps the direction consistent across décor, attire, and stationery.`;

  return {
    vibeLabel: chosen.label,
    vibeEventName,
    vibeTheme: `${chosen.themeStem}.`,
    rationale,
  };
}

// ── v4: 4-option vibe suggestions (per-event canvas) ──────────────────────
// The v4 quiz shows a 2×2 grid of distinct vibe directions at the top of
// the per-event canvas. Each option spans a different register so the
// couple sees a meaningful spread (traditional, modern, intimate,
// theatrical) rather than four variations of the same idea.
//
// Stub reasoning: pick a baseline pool of 4 families per event type; if
// favorites exist, re-rank by tag fit; if a refinement note exists, bias
// the pool by keyword hints; rotation cycles through alternates.

const EVENT_BASELINE_POOLS: Record<EventType, string[]> = {
  sangeet: ["Bollywood Glam", "Jewel Box", "Monsoon Modern", "Garden Romance"],
  garba: ["Folk Saturation", "Heritage Haveli", "Jewel Box", "Bollywood Retro"],
  ceremony: ["Temple Traditional", "Jewel Box", "Garden Romance", "Heritage Haveli"],
  reception: ["Midnight & Gold", "Black Tie Modern", "Champagne Tonal", "Bollywood Glam"],
  mehendi: ["Garden Romance", "Folk Saturation", "Heritage Haveli", "Champagne Tonal"],
  cocktail: ["Black Tie Modern", "Champagne Tonal", "Midnight & Gold", "Monsoon Modern"],
  after_party: ["Black Tie Modern", "Bollywood Retro", "Midnight & Gold", "Jewel Box"],
  welcome_dinner: ["Garden Romance", "Coastal Ease", "Heritage Haveli", "Champagne Tonal"],
  farewell_brunch: ["Garden Romance", "Coastal Ease", "Champagne Tonal", "Monsoon Modern"],
  baraat: ["Folk Saturation", "Temple Traditional", "Bollywood Retro", "Jewel Box"],
  pithi: ["Folk Saturation", "Temple Traditional", "Garden Romance", "Champagne Tonal"],
  haldi: ["Folk Saturation", "Garden Romance", "Coastal Ease", "Champagne Tonal"],
  custom: ["Garden Romance", "Jewel Box", "Monsoon Modern", "Champagne Tonal"],
};

// Alternates cycled in when the couple clicks "Generate more" past the
// baseline pool. We keep all 13 families available so rotation doesn't
// run out.
const FAMILY_ORDER_FALLBACK: string[] = [
  "Bollywood Glam",
  "Jewel Box",
  "Garden Romance",
  "Bollywood Retro",
  "Heritage Haveli",
  "Coastal Ease",
  "Monsoon Modern",
  "Folk Saturation",
  "Temple Traditional",
  "Champagne Tonal",
  "Midnight & Gold",
  "Black Tie Modern",
];

function findFamily(label: string): VibeFamily | undefined {
  return VIBE_FAMILIES.find((f) => f.label === label);
}

function buildOptionFromFamily(
  family: VibeFamily,
  event: EventRecord,
  seed: number,
): VibeOption {
  const nameList = family.eventNames[event.type] ?? family.eventNames.default;
  const eventName = nameList[Math.abs(seed) % nameList.length];
  return {
    vibeLabel: family.label,
    eventName,
    theme: `${family.themeStem}.`,
  };
}

// Simple keyword → family bias. Used when the couple types a refinement
// note ("same direction but less formal") — we nudge pool selection.
function familyBiasFromNote(note: string): {
  boost: string[];
  suppress: string[];
} {
  const lower = note.toLowerCase();
  const boost: string[] = [];
  const suppress: string[] = [];

  const rules: { trigger: RegExp; boost?: string[]; suppress?: string[] }[] = [
    { trigger: /less formal|casual|relaxed|chill/, boost: ["Garden Romance", "Coastal Ease", "Folk Saturation"], suppress: ["Black Tie Modern", "Midnight & Gold"] },
    { trigger: /more formal|black[- ]tie|elevated|refined/, boost: ["Black Tie Modern", "Midnight & Gold", "Champagne Tonal"], suppress: ["Folk Saturation"] },
    { trigger: /more modern|minimal|clean|architectural/, boost: ["Monsoon Modern", "Black Tie Modern"], suppress: ["Heritage Haveli", "Temple Traditional"] },
    { trigger: /more traditional|classical|ceremonial/, boost: ["Temple Traditional", "Heritage Haveli", "Jewel Box"], suppress: ["Black Tie Modern", "Coastal Ease"] },
    { trigger: /jewel|saturated|deeper|richer/, boost: ["Jewel Box", "Bollywood Glam", "Midnight & Gold"] },
    { trigger: /softer|pastel|lighter|daytime/, boost: ["Garden Romance", "Champagne Tonal", "Coastal Ease"], suppress: ["Bollywood Glam", "Midnight & Gold"] },
    { trigger: /theatrical|dramatic|stage|bollywood/, boost: ["Bollywood Glam", "Bollywood Retro"] },
    { trigger: /intimate|small|close/, boost: ["Garden Romance", "Champagne Tonal", "Coastal Ease"], suppress: ["Bollywood Glam"] },
    { trigger: /garden|outdoor|florals?/, boost: ["Garden Romance", "Folk Saturation"] },
    { trigger: /coast|beach|sea/, boost: ["Coastal Ease"] },
    { trigger: /haveli|fresco|indigo|mirror/, boost: ["Heritage Haveli"] },
  ];

  for (const rule of rules) {
    if (rule.trigger.test(lower)) {
      if (rule.boost) boost.push(...rule.boost);
      if (rule.suppress) suppress.push(...rule.suppress);
    }
  }
  return { boost, suppress };
}

export interface GenerateVibeOptionsInput {
  event: EventRecord;
  coupleContext: CoupleContext;
  favoritedImages: InspirationImage[];
  // Each click of "Generate more" increments rotation — advances the pool
  // one step so the next 4 options aren't the previous 4.
  rotation?: number;
  refinementNote?: string;
  // Labels the couple has already been shown this session — we avoid
  // repeating them when we can.
  avoidLabels?: string[];
}

export function generateVibeOptions(input: GenerateVibeOptionsInput): VibeOption[] {
  const { event, favoritedImages, refinementNote, avoidLabels = [] } = input;
  const rotation = Math.max(0, input.rotation ?? 0);

  // Tally favorites' tags for ranking.
  const tagCounts = new Map<string, number>();
  for (const img of favoritedImages) {
    for (const t of img.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  function scoreFamily(label: string): number {
    const fam = findFamily(label);
    if (!fam) return 0;
    let score = 0;
    fam.triggerTags.forEach((t, i) => {
      const weight = i === 0 ? 2 : 1;
      score += (tagCounts.get(t) ?? 0) * weight;
    });
    return score;
  }

  const baselinePool = EVENT_BASELINE_POOLS[event.type] ?? EVENT_BASELINE_POOLS.custom;
  const allFamilies = Array.from(
    new Set([...baselinePool, ...FAMILY_ORDER_FALLBACK]),
  );

  // Apply refinement bias.
  const bias = refinementNote ? familyBiasFromNote(refinementNote) : { boost: [], suppress: [] };

  // Score each family: tag score + bias boost − suppression + baseline bonus.
  const scored = allFamilies.map((label) => {
    let s = scoreFamily(label);
    if (baselinePool.includes(label)) s += 2;
    if (bias.boost.includes(label)) s += 5;
    if (bias.suppress.includes(label)) s -= 10;
    if (avoidLabels.includes(label)) s -= 3;
    return { label, score: s };
  });
  scored.sort((a, b) => b.score - a.score);

  // Rotate the ranked list so "Generate more" surfaces later families.
  const rotated = [
    ...scored.slice(rotation * 2),
    ...scored.slice(0, rotation * 2),
  ];

  // Pick top 4 unique labels.
  const picked: string[] = [];
  for (const r of rotated) {
    if (!picked.includes(r.label)) picked.push(r.label);
    if (picked.length === 4) break;
  }
  while (picked.length < 4) {
    const next = allFamilies.find((l) => !picked.includes(l));
    if (!next) break;
    picked.push(next);
  }

  return picked.map((label, i) => {
    const fam = findFamily(label);
    if (!fam) {
      return {
        vibeLabel: label,
        eventName: labelFor(event),
        theme: "A distinctive direction, shaped around your answers.",
      };
    }
    return buildOptionFromFamily(fam, event, rotation * 4 + i);
  });
}

// ── v4: curated palette ranking ───────────────────────────────────────────
// Ranks the PALETTE_LIBRARY by fit to the couple's favorited images and
// the already-chosen vibe label. Returns the top N palettes; the UI shows
// the top 6 in a 2-col grid.

export interface RankedPalette {
  palette: Palette;
  rationale: string;
  score: number;
}

export function rankPalettesFromFavorites(input: {
  favoritedImages: InspirationImage[];
  vibeLabel?: string | null;
  limit?: number;
}): RankedPalette[] {
  const limit = input.limit ?? 6;
  const tagCounts = new Map<string, number>();
  const hexCounts = new Map<string, number>();
  for (const img of input.favoritedImages) {
    for (const t of img.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    for (const h of img.paletteHex)
      hexCounts.set(h.toLowerCase(), (hexCounts.get(h.toLowerCase()) ?? 0) + 1);
  }

  const vibeLabel = input.vibeLabel?.toLowerCase();

  const scored = PALETTE_LIBRARY.map((palette) => {
    let score = 0;
    const reasons: string[] = [];

    // Palette name / description → tag overlap.
    const words = `${palette.name} ${palette.description}`.toLowerCase().split(/\W+/);
    for (const w of words) {
      if (tagCounts.has(w)) {
        score += tagCounts.get(w) ?? 0;
      }
    }

    // Direct hex color proximity — shared palette entries bump the score.
    for (const swatch of palette.colors) {
      const key = swatch.hex.toLowerCase();
      if (hexCounts.has(key)) {
        score += 3;
        reasons.push(swatch.name.toLowerCase());
      }
    }

    // Vibe-label affinity.
    if (vibeLabel) {
      const paletteWords = palette.description.toLowerCase();
      if (paletteWords.split(/\W+/).some((w) => vibeLabel.includes(w))) {
        score += 4;
      }
      if (vibeLabel.includes("jewel") && palette.id.includes("jewel")) score += 6;
      if (vibeLabel.includes("midnight") && palette.id.includes("midnight")) score += 6;
      if (vibeLabel.includes("champagne") && palette.id.includes("champagne")) score += 6;
      if (vibeLabel.includes("garden") && palette.description.toLowerCase().includes("garden")) score += 4;
    }

    const rationale = reasons.length
      ? `Picks up ${Array.from(new Set(reasons)).slice(0, 3).join(", ")} from your favorites.`
      : `Sits in the ${palette.description.toLowerCase()} direction your answers lean toward.`;

    return { palette, rationale, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ── v4: Coolors workbench regenerate ──────────────────────────────────────
// Given the current palette swatches and a set of locked positions, swap
// each unlocked position with a color from the curated library. Biases
// toward colors that harmonize with the locked swatches and fit the
// event's vibe.

export interface RegenerateSwatchesInput {
  current: PaletteSwatch[];
  lockedPositions: number[];
  vibeLabel?: string | null;
  // A deterministic nonce — increment on each regen click so consecutive
  // clicks don't produce the exact same swap.
  rotation?: number;
}

export function regenerateUnlockedSwatches(
  input: RegenerateSwatchesInput,
): PaletteSwatch[] {
  const rotation = Math.max(0, input.rotation ?? 0);
  const lockedSet = new Set(input.lockedPositions);
  const lockedHexes = new Set(
    input.current
      .filter((_, i) => lockedSet.has(i))
      .map((s) => s.hex.toLowerCase()),
  );
  const usedHexes = new Set(lockedHexes);

  const vibe = input.vibeLabel?.toLowerCase() ?? "";
  // Detect warmth bias from locked swatches — average in color-library.
  let warmScore = 0;
  let coolScore = 0;
  for (const h of lockedHexes) {
    const entry = COLOR_LIBRARY.find((c) => c.hex.toLowerCase() === h);
    if (!entry) continue;
    if (entry.warmth === "warm") warmScore++;
    if (entry.warmth === "cool") coolScore++;
  }
  const warmthBias: "warm" | "cool" | "neutral" =
    warmScore > coolScore + 1 ? "warm" : coolScore > warmScore + 1 ? "cool" : "neutral";

  function scoreEntry(entry: ColorLibraryEntry): number {
    let s = 0;
    if (warmthBias !== "neutral" && entry.warmth === warmthBias) s += 3;
    if (warmthBias === "neutral" && entry.warmth === "neutral") s += 1;
    for (const tag of entry.vibeTags) {
      if (vibe.includes(tag)) s += 4;
    }
    // Mild preference for formal scores around the vibe's register.
    if (vibe.includes("black tie") || vibe.includes("midnight")) {
      if (entry.formalityScore >= 8) s += 2;
    }
    if (vibe.includes("garden") || vibe.includes("coastal")) {
      if (entry.formalityScore <= 6) s += 2;
    }
    return s;
  }

  const ranked = [...COLOR_LIBRARY]
    .map((c) => ({ c, score: scoreEntry(c) }))
    .sort((a, b) => b.score - a.score)
    .map((r) => r.c);

  return input.current.map((swatch, index) => {
    if (lockedSet.has(index)) return swatch;
    // Walk the ranked list with a rotation offset; skip colors already used
    // elsewhere in the palette (including locked ones).
    for (let step = 0; step < ranked.length; step++) {
      const pick = ranked[(index * 7 + rotation * 11 + step) % ranked.length];
      if (usedHexes.has(pick.hex.toLowerCase())) continue;
      usedHexes.add(pick.hex.toLowerCase());
      return {
        hex: pick.hex,
        name: pick.name,
        role: swatch.role,
      };
    }
    return swatch;
  });
}

// Convenience: turn any Palette (or a locked set of swatches) into the
// 5-swatch array the workbench displays. If the palette has fewer than 5
// swatches we pad with neutral entries.
export function paletteSwatchesFor(palette: Palette, minLength = 5): PaletteSwatch[] {
  const colors = palette.colors.slice(0, Math.max(minLength, palette.colors.length));
  while (colors.length < minLength) {
    colors.push({ hex: "#EDE4D3", name: "Oat", role: "neutral" });
  }
  return colors;
}
