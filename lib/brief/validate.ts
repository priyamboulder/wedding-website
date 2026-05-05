// Server-side validation for the /api/brief POST body. Mirrors the column
// constraints in migration 0038 — keeps the DB layer the source of truth
// for the option whitelist (everything below is just a fast-fail copy).

import type {
  BriefAnswers,
  Budget,
  Destination,
  Events,
  Guests,
  Priority,
  Timeline,
  Vibe,
} from './types';

const EVENTS: Events[]         = ['1', '3', '5', '7+'];
const GUESTS: Guests[]         = ['intimate', 'classic', 'grand', 'epic'];
const BUDGETS: Budget[]        = ['under-50k', '50-100k', '100-250k', '250-500k', '500k-plus', 'unsure'];
const VIBES: Vibe[]            = ['mughal', 'modern', 'garden', 'bollywood', 'coastal', 'heritage'];
const DESTS: Destination[]     = ['local', 'us', 'india', 'international', 'undecided'];
const TIMELINES: Timeline[]    = ['under-6m', '6-12m', '12-18m', '18m-plus', 'no-date'];
const PRIORITIES: Priority[]   = ['food', 'photography', 'decor', 'music', 'attire', 'venue', 'invitations', 'beauty'];

function isOneOf<T extends string>(set: readonly T[], v: unknown): v is T {
  return typeof v === 'string' && (set as readonly string[]).includes(v);
}

export function parseBriefAnswers(raw: unknown):
  | { ok: true; answers: BriefAnswers }
  | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Invalid body' };
  const o = raw as Record<string, unknown>;

  if (!isOneOf(EVENTS, o.events))           return { ok: false, error: 'Invalid events' };
  if (!isOneOf(GUESTS, o.guests))           return { ok: false, error: 'Invalid guests' };
  if (!isOneOf(BUDGETS, o.budget))          return { ok: false, error: 'Invalid budget' };
  if (!isOneOf(VIBES, o.vibe))              return { ok: false, error: 'Invalid vibe' };
  if (!isOneOf(DESTS, o.destination))       return { ok: false, error: 'Invalid destination' };
  if (!isOneOf(TIMELINES, o.timeline))      return { ok: false, error: 'Invalid timeline' };

  if (!Array.isArray(o.priorities) || o.priorities.length !== 3) {
    return { ok: false, error: 'Pick exactly 3 priorities' };
  }
  for (const p of o.priorities) {
    if (!isOneOf(PRIORITIES, p)) return { ok: false, error: 'Invalid priority' };
  }
  // No duplicates
  if (new Set(o.priorities as string[]).size !== 3) {
    return { ok: false, error: 'Priorities must be unique' };
  }

  return {
    ok: true,
    answers: {
      events: o.events as Events,
      guests: o.guests as Guests,
      budget: o.budget as Budget,
      vibe: o.vibe as Vibe,
      destination: o.destination as Destination,
      timeline: o.timeline as Timeline,
      priorities: o.priorities as [Priority, Priority, Priority],
    },
  };
}

// Short URL-safe id. 10 chars from the [a-z0-9] alphabet → ~50 bits of
// entropy, enough that anonymous IDs aren't guessable but the URL stays
// short enough to read on a phone.
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
export function generatePublicId(len = 10): string {
  let out = '';
  // crypto.getRandomValues on Node 19+ (and Edge runtime) is global.
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) out += ALPHABET[buf[i] % ALPHABET.length];
  return out;
}
