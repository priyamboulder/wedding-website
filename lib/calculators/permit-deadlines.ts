// ── Permit deadline calculator ────────────────────────────────────────────
// Shared math for any workflow that needs to apply for a permit a fixed
// number of days before the event date. Today's primary consumer is the
// Transportation Build · Session 1 (baraat_walkthrough) which auto-suggests
// road-closure / police-escort / noise permit deadlines from the wedding
// date. Likely to grow venue and other permit-required workflows over time.
//
// Heuristic: 60 days is the safe default. DFW police escort applications
// run 30 days; some California cities run 90. Couples can override per
// permit on the form.

export const DEFAULT_PERMIT_LEAD_DAYS = 60;

export interface PermitDeadlineInput {
  /** ISO date "YYYY-MM-DD" — typically the wedding day. */
  event_date: string;
  /** Days of lead time required. Defaults to 60. */
  lead_days?: number;
}

/**
 * Returns the latest acceptable date the couple can submit the permit
 * application as an ISO date "YYYY-MM-DD". Returns `null` if event_date
 * is invalid or empty.
 */
export function permitApplicationDeadline(
  input: PermitDeadlineInput,
): string | null {
  if (!input.event_date) return null;
  const event = new Date(`${input.event_date}T12:00:00`);
  if (Number.isNaN(event.getTime())) return null;
  const lead = input.lead_days ?? DEFAULT_PERMIT_LEAD_DAYS;
  const deadline = new Date(event.getTime() - lead * 24 * 60 * 60 * 1000);
  return toIsoDate(deadline);
}

/**
 * Days remaining between today and the deadline. Negative when the
 * deadline has already passed. Useful for surfacing soft warnings on
 * permit cards.
 */
export function daysUntilDeadline(
  deadlineIso: string,
  now: Date = new Date(),
): number | null {
  const d = new Date(`${deadlineIso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.ceil((d.getTime() - now.getTime()) / dayMs);
}

export type PermitUrgency = "comfortable" | "tight" | "overdue" | "unknown";

/**
 * Bucket a deadline into one of three urgency levels.
 *   • overdue     — deadline has already passed
 *   • tight       — within 14 days
 *   • comfortable — more than 14 days remain
 *   • unknown     — invalid input
 */
export function permitUrgency(
  deadlineIso: string | null | undefined,
  now: Date = new Date(),
): PermitUrgency {
  if (!deadlineIso) return "unknown";
  const days = daysUntilDeadline(deadlineIso, now);
  if (days == null) return "unknown";
  if (days < 0) return "overdue";
  if (days <= 14) return "tight";
  return "comfortable";
}

function toIsoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
