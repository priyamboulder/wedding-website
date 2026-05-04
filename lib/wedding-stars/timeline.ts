// ──────────────────────────────────────────────────────────────────────────
// Build a 12-month Wedding Stars timeline for a Moon sign + wedding date.
//
// Steps:
//   1. Determine the time window — starts the current month, runs 12 months.
//   2. Filter pre-baked transits to those overlapping the window.
//   3. Interpret each transit per Moon sign.
//   4. Bucket interpreted windows by month (a transit may appear in
//      several month buckets if it spans multiple months).
//   5. Surface a "golden window" (the most favorable highlighted transit)
//      and a "watch outs" list (warnings).
//   6. Generate 3-5 personalized insights.
// ──────────────────────────────────────────────────────────────────────────

import type { Rashi } from "@/types/kundli";
import type {
  MonthBucket,
  StarsInsight,
  StarsResult,
  TransitDef,
  TransitWindow,
  WeddingDateInput,
} from "@/types/wedding-stars";
import { RASHIS } from "@/lib/kundli";

import { interpret } from "./interpret";
import { MAJOR_TRANSITS_2026_2027 } from "./transits";
import { ACTION_LABEL } from "./actions";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface BuildOpts {
  rashi: Rashi;
  weddingDate: WeddingDateInput;
  resolvedFromBirth: boolean;
  // Lets us deterministically test the timeline. Defaults to "now".
  now?: Date;
}

export function buildTimeline(opts: BuildOpts): StarsResult {
  const now = opts.now ?? new Date();
  // Normalize to the first of this month.
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // 12-month window, inclusive of start month.
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 12, 1);

  // Filter transits overlapping the window.
  const inRange = MAJOR_TRANSITS_2026_2027.filter((t) =>
    overlapsRange(t, startMonth, endMonth),
  );

  // Interpret per Moon sign.
  const interpreted = inRange
    .map((t) => interpret(t, opts.rashi))
    .sort((a, b) => a.startISO.localeCompare(b.startISO));

  // Bucket by month: a transit appears in every month it touches within
  // our window.
  const buckets = bucketByMonth(interpreted, startMonth, endMonth);

  const goldenWindow = pickGoldenWindow(interpreted);
  const watchOuts = interpreted.filter((w) =>
    w.warning ||
    w.status === "avoid" ||
    (w.status === "caution" && w.kind === "retrograde"),
  );

  const rashiRow = RASHIS.find((r) => r.name === opts.rashi)!;

  const insights = generateInsights({
    rashi: opts.rashi,
    rashiEnglish: rashiRow.englishName,
    weddingDate: opts.weddingDate,
    interpreted,
    goldenWindow,
    watchOuts,
  });

  return {
    rashi: opts.rashi,
    rashiEnglish: rashiRow.englishName,
    resolvedFromBirth: opts.resolvedFromBirth,
    weddingDate: opts.weddingDate,
    months: buckets,
    goldenWindow,
    watchOuts,
    insights,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function overlapsRange(t: TransitDef, start: Date, end: Date): boolean {
  const s = new Date(t.startISO + "T00:00:00");
  const e = new Date(t.endISO + "T00:00:00");
  return e >= start && s < end;
}

function bucketByMonth(
  windows: TransitWindow[],
  start: Date,
  end: Date,
): MonthBucket[] {
  // Each transit lands in exactly one month — its start month — so a
  // long-running transit doesn't repeat across every bucket it touches.
  // If a transit began before the window opened, anchor it to the window's
  // first month (so the user sees what's already active).
  const buckets: MonthBucket[] = [];
  const monthIndex = new Map<string, MonthBucket>();
  for (
    let d = new Date(start);
    d < end;
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  ) {
    const ymKey = formatYM(d);
    const bucket = {
      ymKey,
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      windows: [] as TransitWindow[],
    };
    buckets.push(bucket);
    monthIndex.set(ymKey, bucket);
  }
  if (buckets.length === 0) return buckets;
  const firstKey = buckets[0].ymKey;

  for (const w of windows) {
    const ws = new Date(w.startISO + "T00:00:00");
    let key: string;
    if (ws < start) {
      key = firstKey;
    } else {
      key = formatYM(ws);
    }
    const bucket = monthIndex.get(key);
    if (bucket) bucket.windows.push(w);
  }

  return buckets;
}

function formatYM(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function pickGoldenWindow(windows: TransitWindow[]): TransitWindow | null {
  // Prefer Jupiter exalted (the standout transit), else any highlighted
  // highly-favorable window.
  const jupiterExalted = windows.find(
    (w) => w.kind === "exalted" && w.planet === "Jupiter",
  );
  if (jupiterExalted) return jupiterExalted;
  const highlighted = windows.find((w) => w.highlight && w.status === "highly-favorable");
  if (highlighted) return highlighted;
  const favored = windows.find((w) => w.status === "highly-favorable");
  return favored ?? null;
}

interface InsightCtx {
  rashi: Rashi;
  rashiEnglish: string;
  weddingDate: WeddingDateInput;
  interpreted: TransitWindow[];
  goldenWindow: TransitWindow | null;
  watchOuts: TransitWindow[];
}

function generateInsights(ctx: InsightCtx): StarsInsight[] {
  const out: StarsInsight[] = [];

  if (ctx.goldenWindow) {
    out.push({
      kind: "golden",
      title: "Your golden window",
      body: insightForGolden(ctx),
    });
  }

  // Wedding-date-specific insight.
  const weddingInsight = insightForWeddingDate(ctx);
  if (weddingInsight) out.push(weddingInsight);

  // Mercury retrograde callout — usually three windows, very common ask.
  const mercuryRx = ctx.interpreted.filter(
    (w) => w.kind === "retrograde" && w.planet === "Mercury",
  );
  if (mercuryRx.length > 0) {
    const dateRanges = mercuryRx.map((w) => formatRange(w.startISO, w.endISO));
    out.push({
      kind: "warning",
      title: `Mercury retrograde hits ${countWord(mercuryRx.length)}`,
      body: `${dateRanges.join("; ")}. Don't send invitations, sign vendor contracts, or finalize wording during these windows. Everything else is fine — including the wedding itself, if that's when it falls.`,
    });
  }

  // Venus retrograde callout.
  const venusRx = ctx.interpreted.find(
    (w) => w.kind === "retrograde" && w.planet === "Venus",
  );
  if (venusRx) {
    out.push({
      kind: "warning",
      title: "Watch out for Venus retrograde",
      body: `Venus retrograde (${formatRange(venusRx.startISO, venusRx.endISO)}) is the time NOT to make new aesthetic commitments — outfits, decor, hair-and-makeup vendors. Lock in your look before this window opens. Existing choices are safe; new ones are risky.`,
    });
  }

  // Saturn long-arc insight.
  const saturn = ctx.interpreted.find(
    (w) => w.planet === "Saturn" && w.kind === "ingress",
  );
  if (saturn) {
    out.push({
      kind: "general",
      title: `Saturn in your ${ordinal(saturn.houseForRashi)} house`,
      body: saturnNarrative(saturn),
    });
  }

  return out;
}

function insightForGolden(ctx: InsightCtx): string {
  const w = ctx.goldenWindow!;
  const range = formatRange(w.startISO, w.endISO);
  const housePhrase = w.houseForRashi
    ? `your ${ordinal(w.houseForRashi)} house`
    : "your chart";
  if (w.kind === "exalted" && w.planet === "Jupiter") {
    return `Jupiter exalted in Cancer (${range}) activates ${housePhrase}. This is the most auspicious transit you'll see this year — your green light for major commitments. Make your biggest decisions (venue, photographer, caterer, family conversations) during this window.`;
  }
  return `${w.event} (${range}) lights up ${housePhrase}. ${w.weddingImpact}`;
}

function insightForWeddingDate(ctx: InsightCtx): StarsInsight | null {
  if (ctx.weddingDate.kind === "open") return null;
  const target = resolveTargetISO(ctx.weddingDate);
  if (!target) return null;
  const overlapping = ctx.interpreted.filter((w) =>
    target >= w.startISO && target <= w.endISO,
  );
  const venusRx = overlapping.find(
    (w) => w.kind === "retrograde" && w.planet === "Venus",
  );
  const mercuryRx = overlapping.find(
    (w) => w.kind === "retrograde" && w.planet === "Mercury",
  );

  if (venusRx) {
    return {
      kind: "weddingDate",
      title: "Your wedding falls during Venus retrograde",
      body: "This is NOT a reason to change your date — millions of happy marriages have begun during Venus retrograde. It does mean: finalize all aesthetic decisions (outfit, decor, hair, makeup) BEFORE October 3rd. Lock it in, then resist the urge to second-guess.",
    };
  }
  if (mercuryRx) {
    return {
      kind: "weddingDate",
      title: "Your wedding falls during Mercury retrograde",
      body: "Don't change the date — your wedding will be beautiful. Do this instead: double-check vendor arrival times, keep backup contact numbers handy, proofread everything twice, and assume small communication hiccups. The day will work.",
    };
  }
  if (overlapping.some((w) => w.status === "highly-favorable")) {
    return {
      kind: "weddingDate",
      title: "Your wedding falls during a favorable transit",
      body: "The stars are with you. Lean into this — book the vendors, send the invitations, and don't waste the window second-guessing yourself.",
    };
  }
  return null;
}

function saturnNarrative(w: TransitWindow): string {
  const action = ACTION_LABEL[w.bestFor[0] ?? "general-decisions"];
  return `Saturn rewards discipline. Through this window, the couples who do best are the ones who pick a vision and execute it methodically — instead of pivoting every other week. Use it for ${action}, your decor commitments, and structural decisions.`;
}

function resolveTargetISO(d: WeddingDateInput): string | null {
  if (d.kind === "specific-date" && d.iso) return d.iso;
  if (d.kind === "approx-month" && d.ymKey) return `${d.ymKey}-15`;
  return null;
}

function formatRange(startISO: string, endISO: string): string {
  return `${formatShort(startISO)} – ${formatShort(endISO)}`;
}

function formatShort(iso: string): string {
  const [y, m, d] = iso.split("-").map((v) => parseInt(v, 10));
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`;
}

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

function countWord(n: number): string {
  if (n === 1) return "once";
  if (n === 2) return "twice";
  if (n === 3) return "three times";
  if (n === 4) return "four times";
  return `${n} times`;
}
