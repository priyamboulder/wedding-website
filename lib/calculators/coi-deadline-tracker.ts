// ── COI deadline tracker ──────────────────────────────────────────────────
// Certificates of Insurance are the unglamorous backbone of every contracted
// vendor relationship. Venues require them before any vendor is allowed to
// load in; missing one on the day means the vendor is turned away at the
// gate. Couples don't track this — planners do — and even then it slips
// through the cracks because it's a 60-90-day-out task that has no obvious
// trigger.
//
// This calculator centralises the math. Section 4 of the cross-category
// refinement pass marks it as shared infrastructure used by Venue Build
// (which holds the requirements) and every contracted-vendor workspace
// (which holds the per-vendor status).
//
// Pure function — no side effects, no store reads. Inputs flow in from the
// venue contract surface; outputs feed checklist-style UI.

// ── Inputs ────────────────────────────────────────────────────────────────

export interface CoiRequirement {
  // Stable id from the venue's COI requirements list.
  id: string;
  // Human label, e.g. "$2M general liability" or "Liquor liability rider".
  label: string;
  // Which vendor categories must satisfy this requirement. Aligned with
  // VendorCategory in types/vendor-unified plus "all" as a catch-all.
  applies_to: ReadonlyArray<string>;
  // The required minimum coverage amount, when applicable. Some venues
  // gate just on existence (any COI accepted), some on amount.
  required_coverage_amount?: number;
  // Days before the wedding by which the COI must be received. Most
  // venues require 30 days; some require 14.
  due_days_before_event: number;
}

export interface VendorCoiStatus {
  // Stable vendor id.
  vendor_id: string;
  vendor_label: string;
  // Vendor's category, used to match against `applies_to`.
  vendor_category: string;
  // Has the vendor delivered a COI for this requirement?
  delivered: boolean;
  // ISO date of delivery — drives display only.
  delivered_on?: string;
  // Coverage amount on the delivered COI, when known. Used to validate
  // against `required_coverage_amount`.
  delivered_coverage_amount?: number;
  // Optional planner-side note (e.g. "Vendor's broker said by Friday").
  planner_note?: string;
}

export interface CoiTrackerInput {
  requirements: ReadonlyArray<CoiRequirement>;
  vendor_statuses: ReadonlyArray<VendorCoiStatus>;
  // ISO date "YYYY-MM-DD" of the wedding day. The deadline math uses this.
  wedding_date: string;
  // Today's date (override for testing). ISO "YYYY-MM-DD".
  today?: string;
}

// ── Outputs ───────────────────────────────────────────────────────────────

export type CoiUrgency =
  // Delivered; coverage validated. Green.
  | "ok"
  // Delivered; coverage below required amount. Red — the COI is on file
  // but the venue won't accept it.
  | "under_coverage"
  // Not delivered, > 30 days until deadline. Soft amber.
  | "scheduled"
  // Not delivered, ≤ 30 days until deadline. Amber.
  | "due_soon"
  // Not delivered, ≤ 7 days until deadline. Red.
  | "urgent"
  // Past the deadline. Red, with escalation messaging.
  | "overdue";

export interface CoiDeadlineRow {
  requirement_id: string;
  requirement_label: string;
  vendor_id: string;
  vendor_label: string;
  // ISO date "YYYY-MM-DD" of the deadline.
  deadline: string;
  // Days from `today` to deadline (negative when overdue).
  days_to_deadline: number;
  urgency: CoiUrgency;
  // Optional planner-side note carried through.
  planner_note?: string;
  // Soft copy describing the urgency, suitable for badge / tooltip.
  status_label: string;
}

// ── Pure derivation ───────────────────────────────────────────────────────

export function deriveCoiDeadlines(input: CoiTrackerInput): CoiDeadlineRow[] {
  const today = input.today ?? new Date().toISOString().split("T")[0];
  const rows: CoiDeadlineRow[] = [];

  for (const req of input.requirements) {
    const deadline = subtractDaysIso(input.wedding_date, req.due_days_before_event);
    const matchingVendors = input.vendor_statuses.filter((v) =>
      vendorMatchesRequirement(v, req),
    );

    for (const v of matchingVendors) {
      const days = daysBetween(today, deadline);
      const urgency = computeUrgency(req, v, days);
      rows.push({
        requirement_id: req.id,
        requirement_label: req.label,
        vendor_id: v.vendor_id,
        vendor_label: v.vendor_label,
        deadline,
        days_to_deadline: days,
        urgency,
        planner_note: v.planner_note,
        status_label: statusLabel(urgency, days),
      });
    }
  }

  return rows.sort((a, b) => a.days_to_deadline - b.days_to_deadline);
}

// ── Helpers ───────────────────────────────────────────────────────────────

function vendorMatchesRequirement(
  v: VendorCoiStatus,
  req: CoiRequirement,
): boolean {
  if (req.applies_to.includes("all")) return true;
  return req.applies_to.includes(v.vendor_category);
}

function computeUrgency(
  req: CoiRequirement,
  v: VendorCoiStatus,
  days: number,
): CoiUrgency {
  if (v.delivered) {
    if (
      req.required_coverage_amount &&
      (v.delivered_coverage_amount ?? 0) < req.required_coverage_amount
    ) {
      return "under_coverage";
    }
    return "ok";
  }
  if (days < 0) return "overdue";
  if (days <= 7) return "urgent";
  if (days <= 30) return "due_soon";
  return "scheduled";
}

function statusLabel(urgency: CoiUrgency, days: number): string {
  switch (urgency) {
    case "ok":
      return "On file";
    case "under_coverage":
      return "Below required coverage";
    case "scheduled":
      return `Due in ${days} days`;
    case "due_soon":
      return `Due in ${days} days`;
    case "urgent":
      return days === 0 ? "Due today" : `Due in ${days} days`;
    case "overdue":
      return `${Math.abs(days)} days overdue`;
  }
}

// ── Date math ─────────────────────────────────────────────────────────────
// Avoids pulling in a date library — wedding-date / today / deadline are
// all "YYYY-MM-DD" strings, so UTC midnight comparisons are sufficient and
// timezone-stable.

function subtractDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().split("T")[0];
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00Z`).getTime();
  const to = new Date(`${toIso}T00:00:00Z`).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

// ── Aggregations for the dashboard ────────────────────────────────────────

export interface CoiDashboardStats {
  total: number;
  ok: number;
  under_coverage: number;
  scheduled: number;
  due_soon: number;
  urgent: number;
  overdue: number;
}

export function summariseCoiRows(
  rows: ReadonlyArray<CoiDeadlineRow>,
): CoiDashboardStats {
  const stats: CoiDashboardStats = {
    total: rows.length,
    ok: 0,
    under_coverage: 0,
    scheduled: 0,
    due_soon: 0,
    urgent: 0,
    overdue: 0,
  };
  for (const r of rows) stats[r.urgency] += 1;
  return stats;
}
