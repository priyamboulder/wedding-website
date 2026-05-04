// ──────────────────────────────────────────────────────────────────────────
// Question definitions for the "Am I Ready?" assessment.
//
// Each question is a single-screen step. Most are single-select; vendors
// is multi-select. Order matches the user-facing flow (1..8).
// ──────────────────────────────────────────────────────────────────────────

import type {
  AttireStatus,
  BudgetStatus,
  EventScope,
  FamilyAlignmentStatus,
  GuestListStatus,
  TimelineOption,
  VendorCategory,
  VenueStatus,
} from "@/types/readiness";

export interface ChoiceOption<V extends string> {
  value: V;
  label: string;
  sub?: string;
}

export const TIMELINE_OPTIONS: ChoiceOption<TimelineOption>[] = [
  { value: "already-happened", label: "It already happened", sub: "the wedding's behind us" },
  { value: "less-than-3-months", label: "Less than 3 months", sub: "we're sprinting" },
  { value: "3-6-months", label: "3 – 6 months", sub: "tight but doable" },
  { value: "6-12-months", label: "6 – 12 months", sub: "the sweet spot" },
  { value: "12-18-months", label: "12 – 18 months", sub: "ahead of schedule" },
  { value: "18-plus-months", label: "18+ months", sub: "early bird" },
  { value: "no-date", label: "No date set yet", sub: "we're figuring it out" },
];

export const VENUE_OPTIONS: ChoiceOption<VenueStatus>[] = [
  { value: "signed-deposited", label: "Signed and deposited", sub: "venue is locked" },
  { value: "venue-in-mind", label: "We have one in mind", sub: "nothing signed yet" },
  { value: "actively-touring", label: "Actively touring", sub: "still looking" },
  { value: "havent-started", label: "Haven't started", sub: "" },
  { value: "destination-package", label: "Destination — venue is bundled", sub: "package deal" },
];

export const BUDGET_OPTIONS: ChoiceOption<BudgetStatus>[] = [
  { value: "agreed-number", label: "Specific number, both families agreed", sub: "we have a real budget" },
  { value: "rough-range", label: "Rough range, nothing firm", sub: "" },
  { value: "one-side-only", label: "One side committed, other unclear", sub: "" },
  { value: "havent-talked", label: "We haven't talked about money yet", sub: "" },
  { value: "complicated", label: "It's… complicated", sub: "family dynamics" },
];

export const SCOPE_OPTIONS: ChoiceOption<EventScope>[] = [
  { value: "ceremony-reception", label: "Ceremony + reception", sub: "1 day" },
  { value: "two-three", label: "2 – 3 events", sub: "1 – 2 days" },
  { value: "four-five", label: "4 – 5 events", sub: "mehndi, sangeet, ceremony, reception…" },
  { value: "full-week", label: "The full wedding week", sub: "5+ events" },
  { value: "undecided", label: "Haven't decided yet", sub: "" },
];

export const VENDOR_OPTIONS: ChoiceOption<VendorCategory>[] = [
  { value: "venue", label: "Venue", sub: "" },
  { value: "photographer", label: "Photographer / Videographer", sub: "" },
  { value: "caterer", label: "Caterer", sub: "" },
  { value: "dj", label: "DJ / Music", sub: "" },
  { value: "decorator", label: "Decorator / Florist", sub: "" },
  { value: "mehndi", label: "Mehndi artist", sub: "" },
  { value: "hmua", label: "Hair & Makeup", sub: "" },
  { value: "planner", label: "Wedding planner", sub: "" },
  { value: "officiant", label: "Priest / Pandit / Officiant", sub: "" },
  { value: "none", label: "None yet", sub: "starting from zero" },
];

export const GUEST_OPTIONS: ChoiceOption<GuestListStatus>[] = [
  { value: "final-sent", label: "Final count, invitations sent", sub: "" },
  { value: "draft-negotiating", label: "Draft list, still negotiating with parents", sub: "" },
  { value: "rough-number", label: "Rough number, no actual list", sub: "" },
  { value: "havent-started", label: "Haven't started", sub: "dreading the politics" },
  { value: "parents-handling", label: "Parents are handling it", sub: "I'll find out when they tell me" },
];

export const ATTIRE_OPTIONS: ChoiceOption<AttireStatus>[] = [
  { value: "ordered", label: "Ordered or purchased", sub: "" },
  { value: "shopping", label: "Shopping in progress", sub: "appointments / trips planned" },
  { value: "know-what", label: "I know what I want, haven't shopped", sub: "" },
  { value: "havent-thought", label: "Haven't thought about it yet", sub: "" },
  { value: "from-india", label: "Getting something made in India", sub: "needs extra lead time" },
];

export const FAMILY_OPTIONS: ChoiceOption<FamilyAlignmentStatus>[] = [
  { value: "fully-aligned", label: "Yes — everyone agrees", sub: "scale, style, budget" },
  { value: "mostly-aligned", label: "Mostly", sub: "a few things to negotiate" },
  { value: "work-in-progress", label: "Work in progress", sub: "different visions" },
  { value: "tension", label: "Not really", sub: "there's tension" },
  { value: "independent", label: "Planning independently", sub: "families aren't heavily involved" },
];

export const STEP_LABELS = [
  "timeline",
  "venue",
  "budget",
  "events",
  "vendors",
  "guests",
  "attire",
  "family",
] as const;
