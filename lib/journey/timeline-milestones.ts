// ── Timeline milestones (Journey Step 5) ──────────────────────────────
//
// Reverse-chronological wedding planning milestones, each anchored
// to "X months before the wedding". The generator below converts an
// abstract milestone list into concrete dates given the couple's
// wedding date, and surfaces the three CRITICAL deadlines (save-the-
// dates, invitations, custom outfits) in their own special slot.

export type MilestoneCategory =
  | "venue"
  | "vendors"
  | "stationery"
  | "outfits"
  | "guests"
  | "logistics"
  | "rehearsal";

export interface MilestoneTemplate {
  id: string;
  // months-before-wedding the milestone should be hit
  monthsBefore: number;
  title: string;
  description: string;
  category: MilestoneCategory;
  href?: string;       // optional deep-link to relevant module
  critical?: boolean;  // surfaced with terracotta accent + special copy
}

export const MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  // ── 12+ months out ─────────────────────────────────────────────────
  {
    id: "research-venues",
    monthsBefore: 12,
    title: "Research venues",
    description: "Tour your top 5 — peak Saturdays book 12+ months out.",
    category: "venue",
    href: "/vendors",
  },
  {
    id: "set-budget",
    monthsBefore: 12,
    title: "Set your budget",
    description: "The number that anchors every other choice.",
    category: "logistics",
    href: "/workspace/finance",
  },
  {
    id: "start-guest-list",
    monthsBefore: 12,
    title: "Start your guest list",
    description: "Even a rough head count helps venue and caterer conversations.",
    category: "guests",
    href: "/guests",
  },

  // ── 9–12 months out ────────────────────────────────────────────────
  {
    id: "book-venue",
    monthsBefore: 10,
    title: "Lock the venue",
    description: "Sign the contract. Everything else cascades from this.",
    category: "venue",
    href: "/vendors",
  },
  {
    id: "book-photo-video",
    monthsBefore: 10,
    title: "Book photographer + videographer",
    description: "The two that always go first. Top names book a year out.",
    category: "vendors",
    href: "/vendors",
  },
  {
    id: "save-the-dates",
    monthsBefore: 8,
    title: "Send save-the-dates",
    description: "6–8 months ahead so guests can plan travel.",
    category: "stationery",
    href: "/stationery",
    critical: true,
  },

  // ── 6–9 months out ─────────────────────────────────────────────────
  {
    id: "book-caterer",
    monthsBefore: 7,
    title: "Book caterer",
    description: "Multi-cuisine menus need lead time for tastings.",
    category: "vendors",
    href: "/vendors",
  },
  {
    id: "book-decor",
    monthsBefore: 7,
    title: "Book decorator",
    description: "Mandap + reception design needs 4–6 months to fabricate.",
    category: "vendors",
    href: "/vendors",
  },
  {
    id: "book-music",
    monthsBefore: 6,
    title: "Book DJ / band",
    description: "Sangeet performers, dholki team, baraat band.",
    category: "vendors",
    href: "/vendors",
  },
  {
    id: "outfit-orders",
    monthsBefore: 6,
    title: "Order custom bridal outfits",
    description: "Lehengas, sherwanis, and kanjivarams need 4–6 months.",
    category: "outfits",
    critical: true,
  },

  // ── 4–6 months out ─────────────────────────────────────────────────
  {
    id: "send-invitations",
    monthsBefore: 5,
    title: "Send invitations",
    description: "6–8 weeks before for local guests, 8–10 for destination.",
    category: "stationery",
    href: "/stationery",
    critical: true,
  },
  {
    id: "book-hmua",
    monthsBefore: 5,
    title: "Book HMUA",
    description: "Trial first. Lead artists book 4–6 months out.",
    category: "vendors",
    href: "/vendors",
  },
  {
    id: "book-mehndi-artist",
    monthsBefore: 5,
    title: "Book mehndi artist",
    description: "For bride and bridal party. Top artists book early.",
    category: "vendors",
    href: "/vendors",
  },
  {
    id: "book-pandit",
    monthsBefore: 4,
    title: "Book priest / pandit",
    description: "Confirm muhurat, ritual details, and language preferences.",
    category: "vendors",
    href: "/vendors",
  },

  // ── 2–4 months out ─────────────────────────────────────────────────
  {
    id: "tastings",
    monthsBefore: 3,
    title: "Tastings & menu finalization",
    description: "Lock dietary, station vs. plated, late-night snacks.",
    category: "vendors",
  },
  {
    id: "fittings",
    monthsBefore: 3,
    title: "First outfit fittings",
    description: "Build in time for two rounds before the day-of fitting.",
    category: "outfits",
  },
  {
    id: "seating-chart",
    monthsBefore: 3,
    title: "Start the seating chart",
    description: "Right after RSVP deadline. Diagram every event separately.",
    category: "guests",
    href: "/guests/seating-chart",
  },
  {
    id: "wedding-website",
    monthsBefore: 3,
    title: "Wedding website live",
    description: "RSVP, schedule, travel, dress code — one source of truth.",
    category: "stationery",
    href: "/studio",
  },

  // ── 1–2 months out ─────────────────────────────────────────────────
  {
    id: "vendor-confirms",
    monthsBefore: 2,
    title: "Final vendor confirmations",
    description: "Reconfirm load-in times, contracts, and final payments.",
    category: "vendors",
    href: "/vendors",
  },
  {
    id: "timeline-walkthrough",
    monthsBefore: 2,
    title: "Day-of timeline walkthrough",
    description: "Coordinate with planner, photographer, and venue contact.",
    category: "logistics",
    href: "/app/timeline",
  },

  // ── Last 2 weeks ───────────────────────────────────────────────────
  {
    id: "final-headcount",
    monthsBefore: 0.5,
    title: "Final headcount to caterer",
    description: "Most caterers lock 7–10 days before for plate counts.",
    category: "vendors",
  },
  {
    id: "final-fittings",
    monthsBefore: 0.5,
    title: "Final fittings",
    description: "Get the day-of look fully assembled and photographed.",
    category: "outfits",
  },
];

// Phase grouping headers used in the timeline UI.
export interface MilestonePhase {
  label: string;
  range: string;
  monthsMin: number; // inclusive lower bound (months before)
  monthsMax: number; // inclusive upper bound (months before)
}

export const MILESTONE_PHASES: MilestonePhase[] = [
  { label: "12+ months out",  range: "Foundation",    monthsMin: 11.5, monthsMax: 999 },
  { label: "9–11 months",     range: "Lock the bones", monthsMin: 9,    monthsMax: 11.49 },
  { label: "6–9 months",      range: "Book the team", monthsMin: 5.5,  monthsMax: 8.99 },
  { label: "4–6 months",      range: "Invitations & artists", monthsMin: 3.5, monthsMax: 5.49 },
  { label: "2–4 months",      range: "Refine",        monthsMin: 1.5,  monthsMax: 3.49 },
  { label: "1–2 months",      range: "Confirm",       monthsMin: 0.75, monthsMax: 1.49 },
  { label: "Last 2 weeks",    range: "Wrap up",       monthsMin: 0,    monthsMax: 0.74 },
];

// ── Date math ─────────────────────────────────────────────────────────

export interface ResolvedMilestone extends MilestoneTemplate {
  dueDate: Date;
  dueIso: string;
  dueLabel: string;
  daysUntil: number;
}

export function resolveMilestones(weddingDate: Date): ResolvedMilestone[] {
  const today = new Date();
  return MILESTONE_TEMPLATES.map((m) => {
    const due = new Date(weddingDate);
    // monthsBefore can be fractional (0.5 = ~2 weeks)
    due.setMonth(due.getMonth() - Math.floor(m.monthsBefore));
    if (m.monthsBefore % 1 !== 0) {
      const fractionalDays = Math.round((m.monthsBefore % 1) * 30);
      due.setDate(due.getDate() - fractionalDays);
    }
    const daysUntil = Math.round(
      (due.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000,
    );
    return {
      ...m,
      dueDate: new Date(due),
      dueIso: new Date(due).toISOString().slice(0, 10),
      dueLabel: new Date(due).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      daysUntil,
    };
  });
}

export function groupMilestonesByPhase(
  resolved: ResolvedMilestone[],
): { phase: MilestonePhase; items: ResolvedMilestone[] }[] {
  return MILESTONE_PHASES.map((phase) => ({
    phase,
    items: resolved.filter(
      (m) =>
        m.monthsBefore >= phase.monthsMin && m.monthsBefore <= phase.monthsMax,
    ),
  })).filter((g) => g.items.length > 0);
}
