// ── Stationery timeline math ──────────────────────────────────────────────
// The production critical path is the most unique thing about this
// workspace: miss one date and the rest cascade. This helper computes the
// backward chain of hard deadlines from the wedding date.

import type { StationeryPrintMethod } from "@/types/stationery";

// Days added to the *minimum* production turnaround for each print method.
// Based on standard Indian wedding-stationery vendor lead times; tuned for
// the letterpress path, which is the slowest.
export const PRINT_METHOD_PRODUCTION_WEEKS: Record<
  StationeryPrintMethod,
  number
> = {
  letterpress: 4,
  foil: 3,
  flat_premium: 2,
  digital: 1,
  hybrid: 3,
};

export interface StationeryTimeline {
  wedding: Date;
  // Reply-by date printed on the RSVP card.
  rsvpDue: Date;
  // Last day mail can go out to hit the RSVP deadline (adds 6w domestic buffer).
  mailBy: Date;
  // International guests need 2 weeks more.
  mailByInternational: Date;
  // Addressing must begin at least 2 weeks before mailing.
  addressingStartBy: Date;
  // Print finish lag — invitations in hand 1 week before addressing begins.
  printFinishedBy: Date;
  // Design must be approved at least `productionWeeks` before print finish.
  designApprovalBy: Date;
  // Save-the-dates go out much earlier — 8 months before the wedding.
  saveTheDateMailBy: Date;
  // Days until the next upcoming deadline (the "critical-path bottleneck").
  daysUntilDesignApproval: number;
  daysUntilMail: number;
  daysUntilRsvp: number;
  daysUntilSaveTheDate: number;
}

function daysBetween(later: Date, earlier: Date): number {
  const ms = later.getTime() - earlier.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function addDays(d: Date, delta: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + delta);
  return next;
}

export function computeStationeryTimeline(
  weddingDate: Date | null,
  printMethod: StationeryPrintMethod,
  now: Date = new Date(),
): StationeryTimeline | null {
  if (!weddingDate) return null;
  const wedding = new Date(weddingDate);

  const rsvpDue = addDays(wedding, -28); // 4 weeks
  const mailBy = addDays(rsvpDue, -28); // mail 4 weeks before RSVP deadline
  const mailByInternational = addDays(mailBy, -14); // +2w for intl
  const addressingStartBy = addDays(mailBy, -14);
  const printFinishedBy = addDays(addressingStartBy, -7);
  const productionWeeks = PRINT_METHOD_PRODUCTION_WEEKS[printMethod] ?? 3;
  const designApprovalBy = addDays(printFinishedBy, -productionWeeks * 7);
  const saveTheDateMailBy = addDays(wedding, -8 * 30);

  return {
    wedding,
    rsvpDue,
    mailBy,
    mailByInternational,
    addressingStartBy,
    printFinishedBy,
    designApprovalBy,
    saveTheDateMailBy,
    daysUntilDesignApproval: daysBetween(designApprovalBy, now),
    daysUntilMail: daysBetween(mailBy, now),
    daysUntilRsvp: daysBetween(rsvpDue, now),
    daysUntilSaveTheDate: daysBetween(saveTheDateMailBy, now),
  };
}

export function formatStationeryDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
