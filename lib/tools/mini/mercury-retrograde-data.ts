// Hardcoded Mercury retrograde windows. Dates are inclusive on both ends and
// stored as YYYY-MM-DD in UTC. Source: NASA / published ephemeris tables.
// Update annually as new years come into scope.

export type RetrogradeWindow = {
  start: string;
  end: string;
  shadowEnd?: string;
};

export const MERCURY_RETROGRADES: RetrogradeWindow[] = [
  { start: '2025-03-15', end: '2025-04-07' },
  { start: '2025-07-18', end: '2025-08-11' },
  { start: '2025-11-09', end: '2025-11-29' },
  { start: '2026-02-25', end: '2026-03-20' },
  { start: '2026-06-29', end: '2026-07-23' },
  { start: '2026-10-24', end: '2026-11-13' },
  { start: '2027-02-09', end: '2027-03-03' },
  { start: '2027-06-12', end: '2027-07-06' },
  { start: '2027-10-07', end: '2027-10-28' },
];
