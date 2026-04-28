// ── Schedule time helpers ──────────────────────────────────────────────────
// Pure HH:MM arithmetic. Kept in its own module so both the resolver and
// the data access layer can depend on it without a circular import.

export function minutesToHhmm(totalMinutes: number): string {
  // Normalise into a 0..(24*60)-1 window so wrap-around (past midnight)
  // still produces a legible clock time.
  const m = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function hhmmToMinutes(hhmm: string): number {
  const [h = "0", m = "0"] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

export function addMinutes(hhmm: string, delta: number): string {
  return minutesToHhmm(hhmmToMinutes(hhmm) + delta);
}

export function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime12h(start)} – ${formatTime12h(end)}`;
}
