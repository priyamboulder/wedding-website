// AI auto-layout engine — the core of the "magic moment" where photos arrive
// and the album is already designed.
//
// Runs entirely client-side: no Anthropic call. It uses the photo metadata we
// already capture (event tag, orientation, hearted, guest tags, source) to
// curate, sequence, pick layouts, and place photos. Output is a fully-formed
// `AlbumSpread[]` that the store replaces wholesale.

import { LAYOUT_BY_ID, suggestLayoutFor } from "@/lib/album-layouts";
import type {
  AlbumPhoto,
  AlbumSlot,
  AlbumSpread,
  AlbumTextBlock,
} from "@/types/album";

// Canonical event sequence — mirrors the Photography module's order.
export const EVENT_ORDER = [
  "haldi",
  "mehendi",
  "sangeet",
  "baraat",
  "wedding",
  "reception",
] as const;

const EVENT_LABELS: Record<string, string> = {
  haldi: "The Haldi",
  mehendi: "The Mehendi",
  sangeet: "The Sangeet",
  baraat: "The Baraat",
  wedding: "Our Wedding Day",
  reception: "The Reception",
};

function rid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// ── Step 1: scoring & curation ──────────────────────────────────────────────

interface ScoredPhoto {
  photo: AlbumPhoto;
  score: number;
  event: string;
}

function scorePhoto(photo: AlbumPhoto): number {
  let score = 0;
  if (photo.hearted) score += 50;
  // Favourites source implies the couple already hand-picked it.
  if (photo.source === "favourites") score += 20;
  // More guest tags = more inclusive photo, gets a small bump.
  if (photo.guestTags && photo.guestTags.length > 0) score += Math.min(10, photo.guestTags.length * 2);
  // Captioned photos are usually the keepers the couple remembered.
  if (photo.caption && photo.caption.length > 3) score += 5;
  return score;
}

// Picks up to `target` photos from the pool, ensuring every event has fair
// representation and every tagged guest has at least one appearance.
export function curatePhotos(pool: AlbumPhoto[], target: number): AlbumPhoto[] {
  if (pool.length <= target) return [...pool];

  // Group by event tag.
  const byEvent = new Map<string, ScoredPhoto[]>();
  pool.forEach((p) => {
    const event = p.eventTag ?? "other";
    const arr = byEvent.get(event) ?? [];
    arr.push({ photo: p, score: scorePhoto(p), event });
    byEvent.set(event, arr);
  });
  byEvent.forEach((arr) => arr.sort((a, b) => b.score - a.score));

  // Always-include: every hearted photo. Capped at half of target so we still
  // leave room to diversify events/guests.
  const alwaysInclude: ScoredPhoto[] = [];
  const remaining: ScoredPhoto[] = [];
  byEvent.forEach((arr) => {
    for (const sp of arr) {
      if (sp.photo.hearted) alwaysInclude.push(sp);
      else remaining.push(sp);
    }
  });
  alwaysInclude.sort((a, b) => b.score - a.score);
  remaining.sort((a, b) => b.score - a.score);

  const chosen = new Set<string>();
  const out: ScoredPhoto[] = [];
  const push = (sp: ScoredPhoto) => {
    if (chosen.has(sp.photo.id) || out.length >= target) return;
    chosen.add(sp.photo.id);
    out.push(sp);
  };

  // Heart-photos up to half the target.
  const heartCap = Math.max(1, Math.floor(target / 2));
  alwaysInclude.slice(0, heartCap).forEach(push);

  // Guest coverage — ensure every tagged guest has at least one photo chosen.
  const allGuests = new Set<string>();
  pool.forEach((p) => p.guestTags?.forEach((g) => allGuests.add(g)));
  const coveredGuests = new Set<string>();
  out.forEach((sp) => sp.photo.guestTags?.forEach((g) => coveredGuests.add(g)));

  for (const guest of allGuests) {
    if (coveredGuests.has(guest)) continue;
    const best = remaining.find(
      (sp) => sp.photo.guestTags?.includes(guest) && !chosen.has(sp.photo.id),
    );
    if (best) {
      push(best);
      best.photo.guestTags?.forEach((g) => coveredGuests.add(g));
    }
  }

  // Event proportional fill — give every event floor(target / eventCount) slots.
  const eventsWithPhotos = [...byEvent.keys()];
  const perEvent = Math.max(1, Math.floor(target / Math.max(1, eventsWithPhotos.length)));
  for (const event of eventsWithPhotos) {
    const arr = byEvent.get(event) ?? [];
    const already = out.filter((sp) => sp.event === event).length;
    for (const sp of arr) {
      if (out.length >= target) break;
      if (already + out.filter((sp2) => sp2.event === event).length - already >= perEvent) break;
      push(sp);
    }
  }

  // Fill remainder by score.
  for (const sp of remaining) {
    if (out.length >= target) break;
    push(sp);
  }

  return out.map((sp) => sp.photo);
}

// ── Step 2: sequencing — chronological + section dividers ────────────────────

interface SequencedGroup {
  event: string;
  photos: AlbumPhoto[];
}

function groupByEventChronologically(photos: AlbumPhoto[]): SequencedGroup[] {
  const buckets = new Map<string, AlbumPhoto[]>();
  photos.forEach((p) => {
    const event = p.eventTag ?? "other";
    const arr = buckets.get(event) ?? [];
    arr.push(p);
    buckets.set(event, arr);
  });

  // Sort events by canonical order; tail unknown events.
  const known = EVENT_ORDER.filter((e) => buckets.has(e));
  const other = [...buckets.keys()].filter((e) => !EVENT_ORDER.includes(e as any));
  const groups: SequencedGroup[] = [];
  [...known, ...other].forEach((event) => {
    const arr = buckets.get(event) ?? [];
    // Inside an event: hearted first (hero), then others by score.
    arr.sort((a, b) => {
      if (a.hearted !== b.hearted) return a.hearted ? -1 : 1;
      return scorePhoto(b) - scorePhoto(a);
    });
    groups.push({ event, photos: arr });
  });
  return groups;
}

// ── Step 3/4: layout selection per spread ────────────────────────────────────

// Chunks an event's photos into spreads, trying to alternate dense and airy
// layouts for rhythm. Hero photos get solo/full-bleed spreads.
function chunkEventIntoSpreads(photos: AlbumPhoto[]): AlbumPhoto[][] {
  if (photos.length === 0) return [];
  const chunks: AlbumPhoto[][] = [];
  let i = 0;
  // Lead photo always gets a solo hero.
  chunks.push([photos[i++]]);

  // Alternate chunk sizes to create rhythm: 2 → 4 → 3 → 2 → ...
  const rhythm = [2, 4, 3, 2, 4];
  let step = 0;
  while (i < photos.length) {
    const size = rhythm[step % rhythm.length];
    const take = photos.slice(i, i + size);
    if (take.length > 0) chunks.push(take);
    i += size;
    step += 1;
  }
  return chunks;
}

function makeSection(event: string, subtitle?: string): AlbumSpread {
  const layout = LAYOUT_BY_ID["title-page"];
  const text_blocks: AlbumTextBlock[] = (layout.textFrames ?? []).map((_, idx) => ({
    id: rid("txt"),
    block_index: idx,
    content: EVENT_LABELS[event] ?? event,
    font: "playfair",
    color: "#1A1A1A",
    alignment: "center",
    is_ai_generated: true,
  }));
  // Support subtitle when passed by overriding the second-block content — for
  // our single-text-frame layout we embed it into the same line for now.
  if (subtitle && text_blocks[0]) {
    text_blocks[0].content = `${text_blocks[0].content}\n${subtitle}`;
  }
  return {
    id: rid("spread"),
    position: 0,
    layout_template_id: "title-page",
    is_text_only: true,
    slots: [],
    text_blocks,
    event_tag: event,
    is_section_divider: true,
  };
}

function makeTitleSpread(title: string, subtitle: string): AlbumSpread {
  const layout = LAYOUT_BY_ID["title-page"];
  const text_blocks: AlbumTextBlock[] = (layout.textFrames ?? []).map((_, idx) => ({
    id: rid("txt"),
    block_index: idx,
    content: idx === 0 ? `${title}\n${subtitle}` : subtitle,
    font: "playfair",
    color: "#1A1A1A",
    alignment: "center",
    is_ai_generated: true,
  }));
  return {
    id: rid("spread"),
    position: 0,
    layout_template_id: "title-page",
    is_text_only: true,
    slots: [],
    text_blocks,
    is_section_divider: true,
  };
}

function makeClosingSpread(): AlbumSpread {
  const layout = LAYOUT_BY_ID["quote-page"];
  const text_blocks: AlbumTextBlock[] = (layout.textFrames ?? []).map((_, idx) => ({
    id: rid("txt"),
    block_index: idx,
    content: "Thank you for celebrating with us.",
    font: "cormorant",
    color: "#1A1A1A",
    alignment: "center",
    is_ai_generated: true,
  }));
  return {
    id: rid("spread"),
    position: 0,
    layout_template_id: "quote-page",
    is_text_only: true,
    slots: [],
    text_blocks,
    is_section_divider: true,
  };
}

function guessOrientation(photo: AlbumPhoto): "portrait" | "landscape" | "square" {
  return photo.aspect ?? "landscape";
}

// Re-score layouts so hearted photos land in the hero slot of their spread.
function arrangeForLayout(layoutId: string, photos: AlbumPhoto[]): AlbumPhoto[] {
  const layout = LAYOUT_BY_ID[layoutId];
  if (!layout) return photos;
  // Find the "biggest" frame — the hero slot.
  const frameAreas = layout.frames.map((f) => f.w * f.h);
  const heroIdx = frameAreas.indexOf(Math.max(...frameAreas));
  const sorted = [...photos].sort((a, b) => scorePhoto(b) - scorePhoto(a));
  // Put the highest-scored into the hero slot; keep remainder by score order.
  const rearranged: AlbumPhoto[] = Array(photos.length);
  rearranged[heroIdx] = sorted[0];
  let cursor = 1;
  for (let i = 0; i < rearranged.length; i++) {
    if (i === heroIdx) continue;
    rearranged[i] = sorted[cursor++];
  }
  return rearranged;
}

function makePhotoSpread(photos: AlbumPhoto[], event: string, lead?: boolean): AlbumSpread {
  const orientations = photos.map(guessOrientation);
  // Lead spread of an event always gets a full-bleed hero when it's a single
  // photo, giving every chapter a strong opener.
  let layoutId: string;
  if (lead && photos.length === 1) {
    layoutId = orientations[0] === "portrait" ? "hero-left" : "full-bleed";
  } else {
    layoutId = suggestLayoutFor(orientations);
  }
  const layout = LAYOUT_BY_ID[layoutId] ?? LAYOUT_BY_ID["full-bleed"];
  const clampedCount = Math.min(photos.length, layout.frames.length);
  const arranged = arrangeForLayout(layoutId, photos.slice(0, clampedCount));

  const slots: AlbumSlot[] = layout.frames.map((_, i) => ({
    id: rid("slot"),
    slot_index: i,
    photo_id: arranged[i]?.id ?? null,
    crop_x: 0.5,
    crop_y: 0.45, // slightly-above-center default; favours faces
    crop_zoom: 1,
    rotation: 0,
  }));
  const text_blocks: AlbumTextBlock[] = (layout.textFrames ?? []).map((_, idx) => ({
    id: rid("txt"),
    block_index: idx,
    content: "",
    font: "playfair",
    color: "#1A1A1A",
    alignment: "center",
    is_ai_generated: true,
  }));
  return {
    id: rid("spread"),
    position: 0,
    layout_template_id: layout.id,
    is_text_only: false,
    slots,
    text_blocks,
    event_tag: event,
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

export interface AutoLayoutInput {
  title: string;
  subtitle: string;
  pool: AlbumPhoto[];
  // Maximum number of photos we want to include. Defaults to roughly 3 per
  // spread starting from the spec's default of 30 spreads → 90 photos.
  maxPhotos?: number;
}

export interface AutoLayoutResult {
  spreads: AlbumSpread[];
  curatedCount: number;
  unusedCount: number;
  spreadCount: number;
}

export function generateAlbumLayout(input: AutoLayoutInput): AutoLayoutResult {
  const { title, subtitle, pool, maxPhotos = 90 } = input;

  // Empty pool — return a title + one empty cover placeholder + closing.
  if (pool.length === 0) {
    return {
      spreads: [makeTitleSpread(title, subtitle), makeClosingSpread()],
      curatedCount: 0,
      unusedCount: 0,
      spreadCount: 2,
    };
  }

  // 1. Curate the subset that'll make the album.
  const curated = curatePhotos(pool, Math.min(maxPhotos, pool.length));

  // 2. Sequence by event.
  const groups = groupByEventChronologically(curated);

  // 3/4. For each group: section divider (unless only one event exists), then
  // a sequence of photo spreads.
  const spreads: AlbumSpread[] = [makeTitleSpread(title, subtitle)];
  const useDividers = groups.length > 1;

  for (const group of groups) {
    if (useDividers) spreads.push(makeSection(group.event));
    const chunks = chunkEventIntoSpreads(group.photos);
    chunks.forEach((chunk, i) => {
      spreads.push(makePhotoSpread(chunk, group.event, i === 0));
    });
  }

  spreads.push(makeClosingSpread());

  return {
    spreads: spreads.map((s, i) => ({ ...s, position: i })),
    curatedCount: curated.length,
    unusedCount: pool.length - curated.length,
    spreadCount: spreads.length,
  };
}

// Re-design a single spread — keep its assigned photos, pick a new layout.
export function redesignSpread(spread: AlbumSpread, pool: AlbumPhoto[]): AlbumSpread {
  const photoById = new Map(pool.map((p) => [p.id, p]));
  const photos = spread.slots.map((s) => (s.photo_id ? photoById.get(s.photo_id) : null)).filter(Boolean) as AlbumPhoto[];
  if (photos.length === 0) return spread;
  return { ...makePhotoSpread(photos, spread.event_tag ?? "other"), id: spread.id, position: spread.position };
}

// Suggest a replacement photo for a slot — best unused photo in the pool that
// matches the orientation / event context of the target slot.
export function suggestReplacement(
  spread: AlbumSpread,
  slotId: string,
  pool: AlbumPhoto[],
  usedPhotoIds: Set<string>,
): AlbumPhoto | null {
  const slotIndex = spread.slots.findIndex((s) => s.id === slotId);
  if (slotIndex < 0) return null;

  const candidates = pool.filter((p) => !usedPhotoIds.has(p.id));
  if (candidates.length === 0) return null;

  const eventTag = spread.event_tag;
  const scored = candidates.map((p) => {
    let score = scorePhoto(p);
    if (eventTag && p.eventTag === eventTag) score += 30;
    return { photo: p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].photo;
}

// Add missing event: insert spreads of unused photos for the named event at the
// end of that event's existing section (or at the end of the album if unknown).
export function addEventSpreads(
  spreads: AlbumSpread[],
  event: string,
  unusedPhotos: AlbumPhoto[],
): AlbumSpread[] {
  const eventPhotos = unusedPhotos.filter((p) => p.eventTag === event);
  if (eventPhotos.length === 0) return spreads;
  const chunks = chunkEventIntoSpreads(eventPhotos);
  const newSpreads = chunks.map((chunk, i) => makePhotoSpread(chunk, event, i === 0));

  // Find the index just after the last spread tagged with this event, else
  // append.
  const lastIdx = [...spreads].reverse().findIndex((s) => s.event_tag === event);
  const insertAt = lastIdx === -1 ? spreads.length : spreads.length - lastIdx;
  const before = spreads.slice(0, insertAt);
  const after = spreads.slice(insertAt);
  return [...before, ...newSpreads, ...after].map((s, i) => ({ ...s, position: i }));
}
