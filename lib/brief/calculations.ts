import { PRIORITY_OPTIONS, VIBE_OPTIONS } from './options';
import type {
  BriefAnswers,
  Budget,
  Events,
  Guests,
  Priority,
  Timeline,
} from './types';

const GUEST_MIDPOINT: Record<Guests, number> = {
  intimate: 120,
  classic: 225,
  grand: 400,
  epic: 650,
};

const EVENT_COUNT: Record<Events, number> = {
  '1': 1,
  '3': 3,
  '5': 5,
  '7+': 7,
};

const BUDGET_RANGE: Record<Exclude<Budget, 'unsure'>, [number, number]> = {
  'under-50k': [30_000, 50_000],
  '50-100k': [50_000, 100_000],
  '100-250k': [100_000, 250_000],
  '250-500k': [250_000, 500_000],
  '500k-plus': [500_000, 900_000],
};

export function eventsCount(answers: BriefAnswers) {
  return EVENT_COUNT[answers.events];
}

export function guestMidpoint(answers: BriefAnswers) {
  return GUEST_MIDPOINT[answers.guests];
}

export function pickBudgetMidpoint(b: Budget): number | null {
  if (b === 'unsure') return null;
  const [lo, hi] = BUDGET_RANGE[b];
  return Math.round((lo + hi) / 2);
}

export function budgetRange(b: Budget): [number, number] | null {
  if (b === 'unsure') return null;
  return BUDGET_RANGE[b];
}

export type BudgetCategory = {
  key: Priority | 'venue-lodging' | 'other';
  label: string;
  pct: number;
  amount: number;
};

// Base budget allocation for an Indian wedding. Tilts with priorities and
// destination. Always sums to 100%.
const BASE_ALLOCATION: { key: BudgetCategory['key']; label: string; pct: number }[] = [
  { key: 'venue-lodging', label: 'Venue & Lodging',         pct: 24 },
  { key: 'food',          label: 'Catering',                pct: 22 },
  { key: 'decor',         label: 'Décor & Florals',         pct: 14 },
  { key: 'photography',   label: 'Photography & Video',     pct: 9 },
  { key: 'attire',        label: 'Attire & Jewelry',        pct: 11 },
  { key: 'music',         label: 'Music & Entertainment',   pct: 8 },
  { key: 'beauty',        label: 'Hair, Makeup & Styling',  pct: 4 },
  { key: 'invitations',   label: 'Invitations & Stationery', pct: 3 },
  { key: 'other',         label: 'Other (gifts, transport, contingency)', pct: 5 },
];

const PRIORITY_TO_KEY: Record<Priority, BudgetCategory['key']> = {
  food: 'food',
  photography: 'photography',
  decor: 'decor',
  music: 'music',
  attire: 'attire',
  venue: 'venue-lodging',
  invitations: 'invitations',
  beauty: 'beauty',
};

// Boost top priorities a little, trim "other" to make it sum to 100.
function applyPriorityTilt(
  base: typeof BASE_ALLOCATION,
  priorities: BriefAnswers['priorities'],
) {
  const boosts = [3, 2, 1]; // rank #1 → +3pp, #2 → +2pp, #3 → +1pp
  const tilted = base.map((c) => ({ ...c }));
  let totalBoost = 0;

  priorities.forEach((p, idx) => {
    const targetKey = PRIORITY_TO_KEY[p];
    const cat = tilted.find((c) => c.key === targetKey);
    if (cat) {
      cat.pct += boosts[idx];
      totalBoost += boosts[idx];
    }
  });

  // Trim "other" first, then "invitations", to balance the boost.
  const trimOrder: BudgetCategory['key'][] = ['other', 'invitations', 'beauty', 'music'];
  let remaining = totalBoost;
  for (const key of trimOrder) {
    if (remaining <= 0) break;
    const cat = tilted.find((c) => c.key === key);
    if (!cat) continue;
    const trim = Math.min(cat.pct - 1, remaining); // never drop a category below 1%
    if (trim > 0) {
      cat.pct -= trim;
      remaining -= trim;
    }
  }

  return tilted;
}

export function buildBudgetBreakdown(answers: BriefAnswers): {
  total: number | null;
  range: [number, number] | null;
  perGuest: number | null;
  categories: BudgetCategory[];
} {
  const total = pickBudgetMidpoint(answers.budget);
  const range = budgetRange(answers.budget);
  const tilted = applyPriorityTilt(BASE_ALLOCATION, answers.priorities);

  const categories: BudgetCategory[] = tilted.map((c) => ({
    key: c.key,
    label: c.label,
    pct: c.pct,
    amount: total ? Math.round(((total * c.pct) / 100) / 500) * 500 : 0,
  }));

  const perGuest = total ? Math.round(total / GUEST_MIDPOINT[answers.guests]) : null;

  return { total, range, perGuest, categories };
}

// ── Timeline ────────────────────────────────────────────────────────────

const TIMELINE_MONTHS: Record<Timeline, number> = {
  'under-6m': 6,
  '6-12m': 9,
  '12-18m': 15,
  '18m-plus': 20,
  'no-date': 12,
};

export type TimelineMilestone = {
  label: string;
  marker: string;
  description: string;
};

export function buildTimeline(answers: BriefAnswers): TimelineMilestone[] {
  const total = TIMELINE_MONTHS[answers.timeline];

  const m = (months: number) =>
    months <= 1
      ? 'Wedding week'
      : months <= 3
        ? `${months} months out`
        : `${months} months out`;

  const milestones: TimelineMilestone[] = [
    {
      label: 'Now',
      marker: 'Today',
      description:
        'Lock in your vibe, build your moodboard, narrow your destination shortlist.',
    },
    {
      label: m(Math.round(total * 0.85)),
      marker: `${Math.round(total * 0.85)} mo`,
      description:
        'Book the heavy hitters — venue, photographer, lead caterer. The decisions everything else hangs from.',
    },
    {
      label: m(Math.round(total * 0.55)),
      marker: `${Math.round(total * 0.55)} mo`,
      description:
        'Décor, entertainment, mehendi artist, save-the-dates. Outfit silhouettes locked in.',
    },
    {
      label: m(Math.round(total * 0.3)),
      marker: `${Math.round(total * 0.3)} mo`,
      description:
        'Invitations sent, attire fittings, guest list finalized, hotel blocks confirmed.',
    },
    {
      label: m(Math.round(total * 0.1)),
      marker: `${Math.round(total * 0.1)} mo`,
      description:
        'Final confirmations, rehearsals, baraat logistics, week-of timeline.',
    },
    {
      label: 'Wedding week',
      marker: 'Day 0',
      description:
        'You did it. Breathe. Maybe cry a little. Eat something before the ceremony.',
    },
  ];

  return milestones;
}

// ── Editorial summary string ────────────────────────────────────────────

const VIBE_LABEL = Object.fromEntries(
  VIBE_OPTIONS.map((v) => [v.value, v.label]),
) as Record<BriefAnswers['vibe'], string>;

const DEST_PHRASE: Record<BriefAnswers['destination'], string> = {
  local: 'in your hometown',
  us: 'at a US destination',
  india: 'in India',
  international: 'at an international destination',
  undecided: 'somewhere still being decided',
};

const TIMELINE_PHRASE: Record<BriefAnswers['timeline'], string> = {
  'under-6m': 'a sprint of under 6 months',
  '6-12m': '6 to 12 months',
  '12-18m': '12 to 18 months',
  '18m-plus': '18+ months',
  'no-date': 'no fixed date yet',
};

export function buildSummary(answers: BriefAnswers): string {
  const events = EVENT_COUNT[answers.events];
  const guests = GUEST_MIDPOINT[answers.guests];
  const vibe = VIBE_LABEL[answers.vibe];
  const dest = DEST_PHRASE[answers.destination];
  const time = TIMELINE_PHRASE[answers.timeline];
  const total = pickBudgetMidpoint(answers.budget);
  const dollars = total
    ? `a $${(total / 1000).toFixed(0)}K budget`
    : 'a budget still being shaped';

  return `You're planning a ${events}-event, ~${guests}-guest ${vibe} wedding ${dest} — with ${dollars} and ${time} to plan. Here's what we'd do.`;
}

// ── Priority insights ──────────────────────────────────────────────────

const PRIORITY_LABEL = Object.fromEntries(
  PRIORITY_OPTIONS.map((p) => [p.value, p.label]),
) as Record<Priority, string>;

export function priorityInsight(
  rank: 1 | 2 | 3,
  priority: Priority,
  answers: BriefAnswers,
): string {
  const label = PRIORITY_LABEL[priority];
  const guests = GUEST_MIDPOINT[answers.guests];
  const events = EVENT_COUNT[answers.events];
  const vibe = VIBE_LABEL[answers.vibe];
  const breakdown = buildBudgetBreakdown(answers);
  const cat = breakdown.categories.find((c) => c.key === PRIORITY_TO_KEY[priority]);

  switch (priority) {
    case 'food':
      return `With ${events} event${events > 1 ? 's' : ''} and ~${guests} guests, catering is your biggest single line item. Plan for ${Math.min(events, 4)} distinct menus${
        cat ? ` and roughly ${cat.pct}% of your total (~$${(cat.amount / 1000).toFixed(0)}K).` : '.'
      }`;
    case 'photography':
      return `For a ${vibe} wedding, look for photographers who specialize in cultural ceremonies and a candid editorial style. Book 9–12 months out — the best ones go fast.`;
    case 'decor':
      return `${vibe} weddings lean heavily on décor to set the mood. Budget at least ${cat?.pct ?? 14}% of your total here — and find one designer for all events to keep the visual language coherent.`;
    case 'music':
      return `Across ${events} events, you'll likely need at least two distinct entertainment acts (DJ for sangeet, baraat band, ceremony musicians). Bundle pricing exists — ask.`;
    case 'attire':
      return `For ${events} events, plan ${events} outfit changes at minimum. Start fittings 6+ months out if anything is being commissioned.`;
    case 'venue':
      return `For ${guests} guests across ${events} events, your venue search should anchor everything else. Book this first.`;
    case 'invitations':
      return `For a ${vibe} wedding, the invitation suite sets the visual tone. Block-printed, letterpress, or fully digital — pick the lane and commit.`;
    case 'beauty':
      return `Across ${events} events, you'll typically need ${events >= 3 ? '2 or more' : '1'} HMUA artists, plus airbrush touch-ups. Trial 4+ months out, lock once you find a fit.`;
    default:
      return `${label} is in your top 3. We'll prioritize this on your checklist.`;
  }
}

export const PRIORITY_LABEL_MAP = PRIORITY_LABEL;
