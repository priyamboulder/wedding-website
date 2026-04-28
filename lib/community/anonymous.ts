// ── Anonymous identity ──────────────────────────────────────────────────────
// Deterministic pseudonym + avatar color derived from (profile_id,
// discussion_id). The same bride posting anonymously in the same thread
// always reads as the same pseudonym; a different thread gives her a
// different one, so anonymous identities can't be correlated across
// threads.
//
// Pseudonym is computed client-side at render time. The store keeps the
// real author_id so moderation, edit/delete, and block filtering still
// work — anonymity is a display-layer concern.

const ADJECTIVES = [
  "moonlit",
  "golden",
  "velvet",
  "silver",
  "ivory",
  "peacock",
  "jasmine",
  "saffron",
  "champagne",
  "blush",
  "dahlia",
  "indigo",
  "copper",
  "pearl",
  "rosewood",
  "lavender",
  "coral",
  "sage",
  "amber",
  "orchid",
  "marigold",
  "ruby",
  "opal",
  "willow",
  "ember",
  "cobalt",
  "fern",
  "plum",
  "honey",
  "thistle",
];

const NOUNS = [
  "bride",
  "bloom",
  "petal",
  "spark",
  "dream",
  "veil",
  "glow",
  "star",
  "breeze",
  "flame",
  "wish",
  "charm",
  "light",
  "song",
  "muse",
  "dawn",
  "feather",
  "bell",
  "garden",
  "wave",
  "moon",
  "cloud",
  "stone",
  "forest",
  "river",
  "meadow",
  "lotus",
  "silk",
  "haze",
  "frost",
];

// Muted warm tones that sit alongside the ivory / gold / saffron palette.
const AVATAR_COLORS = [
  "#C4A882",
  "#A8B5A0",
  "#B8A0C4",
  "#C4A0A0",
  "#A0B8C4",
  "#C4B882",
  "#A88282",
  "#82A8A0",
  "#A0A0C4",
  "#C4C4A0",
];

function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface AnonymousIdentity {
  name: string;
  color: string;
}

export function getAnonymousIdentity(
  profileId: string,
  threadId: string,
): AnonymousIdentity {
  const hash = simpleHash(`${profileId}::${threadId}`);
  const adj = ADJECTIVES[hash % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(hash / ADJECTIVES.length) % NOUNS.length];
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return { name: `${adj} ${noun}`, color };
}

// Daily limits for anonymous content per bride. Enforced in the store.
export const DAILY_ANON_DISCUSSION_LIMIT = 3;
export const DAILY_ANON_REPLY_LIMIT = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

export function withinLast24h(iso: string, now = Date.now()): boolean {
  return now - new Date(iso).getTime() < DAY_MS;
}
