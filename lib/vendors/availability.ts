// ── Availability ──────────────────────────────────────────────────────────
// Vendors can block dates via (mocked) Google Cal / iCal sync or manually.
// Couples filter by their wedding date — the couple's targetDate is checked
// against blocked_ranges[]. A vendor with no AvailabilityRecord reads as
// "unknown" (shown as "Check availability" on the card).

import type {
  AvailabilityRecord,
  AvailabilityState,
} from "@/types/vendor-discovery";

export function availabilityStateFor(
  record: AvailabilityRecord | undefined,
  targetDateIso: string,
): AvailabilityState {
  if (!record) return "unknown";
  const t = new Date(targetDateIso).getTime();
  for (const range of record.blocked_ranges) {
    const start = new Date(range.start).getTime();
    const end = new Date(range.end).getTime();
    if (t >= start && t <= end) return "booked";
  }
  return "available";
}

export const AVAILABILITY_LABEL: Record<AvailabilityState, string> = {
  available: "Available on your date",
  tentative: "Tentative hold",
  booked: "Booked on your date",
  unknown: "Check availability",
};

export const AVAILABILITY_CLASS: Record<
  AvailabilityState,
  { dot: string; text: string; bg: string }
> = {
  available: { dot: "bg-sage",       text: "text-sage",       bg: "bg-sage-pale"       },
  tentative: { dot: "bg-gold-light", text: "text-gold",       bg: "bg-gold-pale"       },
  booked:    { dot: "bg-rose",       text: "text-rose",       bg: "bg-rose-pale"       },
  unknown:   { dot: "bg-ink-faint",  text: "text-ink-muted",  bg: "bg-ivory-warm"      },
};
