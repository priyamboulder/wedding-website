// ── Confessional anonymous name generator ───────────────────────────────────
// Outputs names like "The Reluctant Plus-One", "Chaos Florist". Used when a
// user submits a story without specifying their own display name. Pure
// function — re-rolls each call so the user can hit "generate again" until
// they like it.

const PREFIXES = [
  "Anonymous",
  "The Reluctant",
  "The Overworked",
  "Chaos",
  "The Exhausted",
  "Undercover",
  "The Uninvited",
  "Runaway",
  "The Petty",
  "Secret",
  "Vengeful",
  "The Forgotten",
  "Accidental",
  "Drama-Free",
  "The Over-It",
];

const SUFFIXES = [
  "Bride",
  "Groom",
  "Bridesmaid",
  "Groomsman",
  "Auntie",
  "Mother-in-Law",
  "Planner",
  "Photographer",
  "DJ",
  "Florist",
  "Caterer",
  "Guest",
  "Plus-One",
  "Officiant",
  "Ring Bearer",
];

export function generateAnonymousName(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  return `${prefix} ${suffix}`;
}

// Deterministic variant — derive a stable name from any string seed (e.g.
// post id). Used for replies where we want the same author to read as the
// same alias within a single thread without storing the alias separately.
export function deterministicAnonymousName(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const h = Math.abs(hash);
  return `${PREFIXES[h % PREFIXES.length]} ${SUFFIXES[Math.floor(h / PREFIXES.length) % SUFFIXES.length]}`;
}

// Avatar tone palette — muted warm tones consistent with the brand.
const AVATAR_TONES = [
  { bg: "#F0E4C8", fg: "#8B6508" },
  { bg: "#F5E0D6", fg: "#A85C45" },
  { bg: "#E8F0E0", fg: "#5E7548" },
  { bg: "#DCE9E7", fg: "#3F6663" },
  { bg: "#F5E6C8", fg: "#8E6A2A" },
  { bg: "#EDE7D9", fg: "#5C4F3E" },
];

export function avatarToneFor(seed: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

// Initials of a display name for the avatar circle. Strips "The" so
// "The Reluctant Plus-One" becomes "RP" not "TR".
export function initialsFor(name: string): string {
  const parts = name
    .replace(/^The\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
