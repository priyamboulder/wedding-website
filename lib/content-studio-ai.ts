// Content Studio AI helpers — heuristic stand-ins for the Vision + caption
// Claude calls in the spec. They run purely client-side so the localStorage-
// only build stays self-contained; swapping in real API routes later is a
// drop-in (see `analyzePhoto` / `generateCaptions` below).

import type {
  CaptionOptions,
  ContentEmotion,
  ContentEvent,
  ContentMoment,
  ContentPackage,
  ContentPhoto,
  ContentSubject,
  PackageRecipe,
} from "@/types/content-studio";

// ── Heuristic image analysis ─────────────────────────────────────────────
//
// Without a Vision model we use three signals:
//   1. file name hints ("ceremony_0042.jpg" → ceremony, "portrait" → portraits)
//   2. average colour sampled from the thumbnail (warm → haldi/ceremony, etc.)
//   3. deterministic hash of the file name for stable pseudo-random filling
//
// The output matches the real API shape so the rest of the app doesn't care.

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

const EVENT_KEYWORDS: { event: ContentEvent; keys: string[] }[] = [
  { event: "getting_ready", keys: ["ready", "getting", "prep", "robe"] },
  { event: "haldi", keys: ["haldi", "turmeric", "yellow"] },
  { event: "mehendi", keys: ["mehendi", "mehndi", "henna"] },
  { event: "sangeet", keys: ["sangeet", "garba", "dance", "dj"] },
  { event: "baraat", keys: ["baraat", "barat", "horse", "procession"] },
  { event: "ceremony", keys: ["ceremony", "mandap", "pheras", "phera", "vow", "vows", "pandit"] },
  { event: "reception", keys: ["reception", "party", "toast", "speech", "cake"] },
  { event: "portraits", keys: ["portrait", "couple", "bride", "groom", "solo"] },
  { event: "details", keys: ["detail", "decor", "flowers", "jewelry", "rings", "shoes", "invite"] },
];

function guessEventFromName(name: string): ContentEvent | null {
  const lower = name.toLowerCase();
  for (const { event, keys } of EVENT_KEYWORDS) {
    if (keys.some((k) => lower.includes(k))) return event;
  }
  return null;
}

function guessEventFromIndex(seed: number): ContentEvent {
  // Rough event distribution that roughly mimics a real wedding gallery.
  const table: ContentEvent[] = [
    "getting_ready", "getting_ready",
    "haldi",
    "mehendi", "mehendi",
    "sangeet", "sangeet", "sangeet",
    "baraat",
    "ceremony", "ceremony", "ceremony", "ceremony", "ceremony",
    "reception", "reception", "reception", "reception",
    "portraits", "portraits", "portraits",
    "details", "details",
  ];
  return table[seed % table.length];
}

const MOMENT_BY_EVENT: Record<ContentEvent, ContentMoment[]> = {
  getting_ready: ["getting_ready", "candid", "detail_shot", "bridal_party"],
  haldi: ["candid", "family_portrait", "detail_shot"],
  mehendi: ["candid", "detail_shot", "bridal_party"],
  sangeet: ["dance", "candid", "speech", "group_shot"],
  baraat: ["entrance", "dance", "candid"],
  ceremony: ["vows", "pheras", "first_look", "candid", "family_portrait", "group_shot"],
  reception: ["cake_cut", "dance", "speech", "candid", "entrance"],
  portraits: ["couple_portrait", "family_portrait", "bridal_party"],
  details: ["detail_shot", "decor", "jewelry", "food", "outfit"],
  other: ["other", "candid"],
};

const SUBJECT_BY_MOMENT: Record<ContentMoment, ContentSubject[]> = {
  first_look: ["couple"],
  vows: ["couple"],
  pheras: ["couple", "family"],
  dance: ["couple", "friends"],
  cake_cut: ["couple"],
  vidaai: ["bride", "family"],
  candid: ["friends"],
  group_shot: ["family", "friends"],
  detail_shot: ["details"],
  entrance: ["couple"],
  speech: ["family"],
  couple_portrait: ["couple"],
  family_portrait: ["family"],
  bridal_party: ["bridal_party"],
  getting_ready: ["bride", "bridal_party"],
  food: ["food", "details"],
  decor: ["venue", "details"],
  jewelry: ["details"],
  outfit: ["details"],
  other: ["friends"],
};

const EMOTIONS_BY_EVENT: Record<ContentEvent, ContentEmotion[]> = {
  getting_ready: ["tender", "joyful", "serene"],
  haldi: ["joyful", "playful"],
  mehendi: ["tender", "joyful"],
  sangeet: ["celebratory", "playful", "joyful"],
  baraat: ["celebratory", "dramatic"],
  ceremony: ["emotional", "tender", "dramatic", "serene"],
  reception: ["celebratory", "joyful", "playful"],
  portraits: ["tender", "dramatic", "serene"],
  details: ["serene", "tender"],
  other: ["joyful"],
};

// Quality score blends image dimensions (bigger ≈ more likely to be a
// keeper from the photographer) and a small deterministic jitter so the
// same file always gets the same score.
function scoreQuality(photo: Pick<ContentPhoto, "width" | "height" | "file_name" | "file_size">): number {
  const megapixels = (photo.width * photo.height) / 1_000_000;
  const resolutionBoost = Math.min(megapixels / 12, 1);                // 0..1 at ~12MP
  const seed = hash(photo.file_name);
  const jitter = ((seed % 1000) / 1000) * 0.35;                        // 0..0.35
  const base = 0.55 + resolutionBoost * 0.25 + jitter * 0.6;
  return Math.max(0.2, Math.min(1, Number(base.toFixed(2))));
}

// Sample dominant colours from a thumbnail data URI. Returns up to 3 hex
// strings. Runs on a tiny hidden canvas; bails silently on failure.
async function sampleColors(thumbUrl: string): Promise<string[]> {
  if (typeof document === "undefined") return [];
  try {
    const img = await loadImage(thumbUrl);
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    ctx.drawImage(img, 0, 0, 32, 32);
    const data = ctx.getImageData(0, 0, 32, 32).data;
    const buckets = new Map<string, number>();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] & 0xf0;
      const g = data[i + 1] & 0xf0;
      const b = data[i + 2] & 0xf0;
      const key = `${r},${g},${b}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const sorted = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return sorted.map(([k]) => {
      const [r, g, b] = k.split(",").map(Number);
      return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
    });
  } catch {
    return [];
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export interface AnalysisResult {
  ai_event: ContentEvent;
  ai_moment: ContentMoment;
  ai_quality_score: number;
  ai_emotion: ContentEmotion;
  ai_subjects: ContentSubject[];
  ai_description: string;
  ai_colors: string[];
}

export async function analyzePhoto(photo: ContentPhoto, index: number): Promise<AnalysisResult> {
  const seed = hash(photo.file_name + index);
  const event = guessEventFromName(photo.file_name) ?? guessEventFromIndex(seed);
  const moment = pick(MOMENT_BY_EVENT[event], seed >> 3);
  const emotion = pick(EMOTIONS_BY_EVENT[event], seed >> 5);
  const subjects = SUBJECT_BY_MOMENT[moment] ?? ["couple"];
  const quality = scoreQuality(photo);
  const colors = await sampleColors(photo.thumbnail_url);

  return {
    ai_event: event,
    ai_moment: moment,
    ai_quality_score: quality,
    ai_emotion: emotion,
    ai_subjects: subjects,
    ai_description: buildDescription(event, moment, emotion),
    ai_colors: colors,
  };
}

function buildDescription(event: ContentEvent, moment: ContentMoment, emotion: ContentEmotion): string {
  const eventName = event.replace("_", " ");
  const momentName = moment.replace("_", " ");
  return `${capitalize(emotion)} ${momentName} during ${eventName}.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Picker registry ──────────────────────────────────────────────────────
//
// Each package recipe names a picker. A picker takes the analyzed photo
// pool and returns an ordered list of photo ids, at most `recipe.max_photos`.

type Picker = (pool: ContentPhoto[], recipe: PackageRecipe) => string[];

const EVENT_ORDER: ContentEvent[] = [
  "getting_ready", "haldi", "mehendi", "sangeet", "baraat",
  "ceremony", "reception", "portraits", "details", "other",
];

function available(pool: ContentPhoto[]): ContentPhoto[] {
  return pool.filter((p) => !p.is_excluded);
}

function sortByQuality(photos: ContentPhoto[]): ContentPhoto[] {
  return [...photos].sort((a, b) => b.ai_quality_score - a.ai_quality_score);
}

function eventIndex(e: ContentEvent | null): number {
  const i = EVENT_ORDER.indexOf((e ?? "other") as ContentEvent);
  return i === -1 ? EVENT_ORDER.length : i;
}

const pickers: Record<string, Picker> = {
  chronological: (pool, recipe) => {
    // One or two top photos from each event, in event order.
    const pick: string[] = [];
    const pool2 = available(pool);
    const perEvent = Math.max(1, Math.floor(recipe.max_photos / 6));
    for (const e of EVENT_ORDER) {
      const slice = sortByQuality(pool2.filter((p) => p.ai_event === e)).slice(0, perEvent);
      for (const p of slice) {
        if (pick.length < recipe.max_photos) pick.push(p.id);
      }
    }
    // Top up with remaining best if we came up short.
    if (pick.length < recipe.max_photos) {
      for (const p of sortByQuality(pool2)) {
        if (pick.length >= recipe.max_photos) break;
        if (!pick.includes(p.id)) pick.push(p.id);
      }
    }
    return pick.slice(0, recipe.max_photos);
  },

  best_moments: (pool, recipe) => {
    const pool2 = available(pool);
    const chosen: ContentPhoto[] = [];
    for (const p of sortByQuality(pool2)) {
      if (chosen.length >= recipe.max_photos) break;
      // Skip if the previous photo is the same event (avoid two in a row).
      const prev = chosen[chosen.length - 1];
      if (prev && prev.ai_event === p.ai_event && Math.random() > 0.3) continue;
      chosen.push(p);
    }
    return chosen.slice(0, recipe.max_photos).map((p) => p.id);
  },

  couple_portraits: (pool, recipe) => {
    const pool2 = available(pool).filter(
      (p) => p.ai_subjects.includes("couple") || p.ai_moment === "couple_portrait" || p.ai_event === "portraits",
    );
    return sortByQuality(pool2).slice(0, recipe.max_photos).map((p) => p.id);
  },

  announcement: (pool) => {
    const candidates = available(pool).filter(
      (p) => p.ai_subjects.includes("couple") || p.ai_event === "portraits",
    );
    const best = sortByQuality(candidates)[0] ?? sortByQuality(available(pool))[0];
    return best ? [best.id] : [];
  },

  story_chronological: (pool, recipe) => {
    const pool2 = available(pool);
    const pick: string[] = [];
    for (const e of EVENT_ORDER) {
      const slice = sortByQuality(pool2.filter((p) => p.ai_event === e)).slice(0, 2);
      for (const p of slice) if (pick.length < recipe.max_photos) pick.push(p.id);
    }
    return pick.slice(0, recipe.max_photos);
  },

  facebook_balanced: (pool, recipe) => {
    const pool2 = available(pool);
    const pick: string[] = [];
    const perEvent = Math.max(3, Math.floor(recipe.max_photos / 7));
    for (const e of EVENT_ORDER) {
      const slice = sortByQuality(pool2.filter((p) => p.ai_event === e)).slice(0, perEvent);
      for (const p of slice) if (pick.length < recipe.max_photos) pick.push(p.id);
    }
    // Sort final selection by event order.
    const byId = new Map(pool2.map((p) => [p.id, p]));
    return pick
      .map((id) => byId.get(id)!)
      .filter(Boolean)
      .sort((a, b) => eventIndex(a.ai_event) - eventIndex(b.ai_event))
      .slice(0, recipe.max_photos)
      .map((p) => p.id);
  },

  whatsapp_highlights: (pool, recipe) => {
    // Striking + emotional + no group shots.
    const pool2 = available(pool).filter((p) => p.ai_moment !== "group_shot");
    return sortByQuality(pool2).slice(0, recipe.max_photos).map((p) => p.id);
  },

  thank_you: (pool) => {
    const group = available(pool).filter(
      (p) => p.ai_moment === "group_shot" || p.ai_moment === "family_portrait",
    );
    const best = sortByQuality(group)[0] ?? sortByQuality(available(pool))[0];
    return best ? [best.id] : [];
  },
};

export function pickPhotosForRecipe(pool: ContentPhoto[], recipe: PackageRecipe): string[] {
  const picker = pickers[recipe.pickerSlug] ?? pickers.best_moments;
  return picker(pool, recipe);
}

// ── Caption generation ───────────────────────────────────────────────────
//
// We generate three tone variants per package so the couple can flip
// between them. All of these could be replaced by a real Claude call
// later — same input, same output shape.

export interface CaptionContext {
  coupleNames: string;                 // "Priya & Aarav"
  partnerName: string;                 // "Aarav"
  date: string;                        // "November 18" or "2026-11-18"
  city: string | null;
  eventsRepresented: string[];         // ["ceremony", "reception"]
  theme: string;
  photoCount: number;
}

export function generateCaptions(ctx: CaptionContext): CaptionOptions {
  const romantic = renderRomantic(ctx);
  const minimal = renderMinimal(ctx);
  const fun = renderFun(ctx);
  return { romantic, minimal, fun };
}

function renderRomantic(ctx: CaptionContext): string {
  if (ctx.theme === "couple_portraits") {
    return `Just us, for a minute. ${ctx.date} — the day I married my favorite person.`;
  }
  if (ctx.theme === "detail_focused" || ctx.theme === "details") {
    return `It's in the details — every piece of our wedding was a love letter. ${ctx.date}.`;
  }
  if (ctx.theme === "gratitude") {
    return `To everyone who loved us through ${ctx.date} — thank you for making it the most magical day of our lives. We felt every ounce of love.`;
  }
  return `Forever starts here. ${ctx.date} was the day our story became a celebration — surrounded by the people who made us who we are. ${ctx.partnerName}, I'd choose you in every lifetime.`;
}

function renderMinimal(ctx: CaptionContext): string {
  if (ctx.theme === "announcement") return `${ctx.date}. Married.`;
  return `${ctx.date}.`;
}

function renderFun(ctx: CaptionContext): string {
  if (ctx.theme === "announcement") {
    return `Told you we'd actually do it. ${ctx.date}, officially stuck with ${ctx.partnerName}.`;
  }
  if (ctx.theme === "gratitude") {
    return `You danced. You cried. You stayed for the after-party. We love you. ${ctx.date}, forever grateful.`;
  }
  return `${ctx.photoCount} photos, a week of jet lag, and zero regrets. ${ctx.date} was perfect.`;
}

export function defaultHashtags(ctx: CaptionContext): string[] {
  const tag = ctx.coupleNames
    .replace(/\s*&\s*/g, "And")
    .replace(/[^A-Za-z0-9]/g, "");
  const base = [
    tag ? `#${tag}` : "#OurWedding",
    "#IndianWedding",
    "#WeddingDay",
    "#ForeverStartsHere",
  ];
  if (ctx.city) base.push(`#${ctx.city.replace(/[^A-Za-z0-9]/g, "")}Wedding`);
  if (ctx.eventsRepresented.includes("ceremony")) base.push("#Pheras");
  if (ctx.eventsRepresented.includes("sangeet")) base.push("#Sangeet");
  if (ctx.eventsRepresented.includes("mehendi")) base.push("#Mehendi");
  return base.slice(0, 8);
}

// Utility — swap a package's tone without losing user edits to custom text.
export function captionForTone(pkg: ContentPackage, tone: ContentPackage["caption_tone"]): string {
  if (tone === "custom") return pkg.caption;
  const opts = pkg.caption_options;
  if (tone === "romantic") return opts.romantic;
  if (tone === "minimal") return opts.minimal;
  if (tone === "fun") return opts.fun;
  return opts.romantic;
}
