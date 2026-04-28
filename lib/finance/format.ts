// ── Currency formatters ───────────────────────────────────────────────────
// Finance stores everything in integer cents (USD). Format at the view layer.

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function formatDollars(cents: number, opts?: { compact?: boolean }): string {
  if (cents == null || Number.isNaN(cents)) return "—";
  const dollars = cents / 100;
  const abs = Math.abs(dollars);
  if (opts?.compact) {
    if (abs >= 1_000_000) return `${dollars < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 10_000) return `${dollars < 0 ? "-" : ""}$${Math.round(abs / 1_000)}K`;
    if (abs >= 1_000) return `${dollars < 0 ? "-" : ""}$${(abs / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
}

export function formatDollarsShort(cents: number): string {
  return formatDollars(cents, { compact: true });
}

export function formatPct(ratio: number): string {
  if (!Number.isFinite(ratio)) return "—";
  return `${Math.round(ratio * 100)}%`;
}

export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const d = new Date(iso).getTime();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.ceil((d - now.getTime()) / MS_PER_DAY);
}

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
