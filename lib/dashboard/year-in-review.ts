// ── Year in Review compiler ────────────────────────────────────────────
// Pure helpers that turn the raw store data (events, check-ins, journal,
// notepad, sealed letter, checklist) into the structured sections the
// keepsake page renders. No React here — keeps the keepsake itself thin
// and testable.

import type { DailyCheckIn } from "@/stores/daily-checkins-store";
import type { JournalPhoto } from "@/stores/dashboard-journal-store";
import type { DashboardNote } from "@/stores/dashboard-notepad-store";
import type { SealedLetter } from "@/stores/sealed-letters-store";
import type { ChecklistItem } from "@/types/checklist";
import type { EventRecord } from "@/types/events";
import { CLOSING_QUESTION } from "./checkin-questions";

export interface TimelineEntry {
  date: string;
  title: string;
  detail?: string;
}

export interface NumberStat {
  label: string;
  value: string;
}

export interface CompiledYearInReview {
  timeline: TimelineEntry[];
  highlights: DailyCheckIn[];
  closing: DailyCheckIn | null;
  letter: SealedLetter | null;
  numbers: NumberStat[];
  storyLine: string | null;
}

interface CompileInputs {
  weddingDate: Date | null;
  storyText: string | null;
  events: EventRecord[];
  checkIns: DailyCheckIn[];
  journalPhotos: JournalPhoto[];
  notes: DashboardNote[];
  letter: SealedLetter | null;
  checklist: ChecklistItem[];
  /** ms epoch of the earliest "joined Ananya" signal we can find. */
  joinedAtIso?: string | null;
}

const HIGHLIGHT_TARGET = 12;
const MIN_RESPONSE_CHARS = 25;

function isMeaningful(entry: DailyCheckIn): boolean {
  const text = entry.response.trim().toLowerCase();
  if (text.length < MIN_RESPONSE_CHARS) return false;
  if (["nothing", "nothing today", "nothing much", "n/a", "none"].includes(text))
    return false;
  return true;
}

/**
 * Pick a curated subset of check-in responses to thread through the
 * keepsake. We bias toward longer, more emotional answers, but spread
 * the picks across the planning months so the document doesn't feel
 * front-loaded.
 */
function pickHighlights(checkIns: DailyCheckIn[]): DailyCheckIn[] {
  const meaningful = checkIns.filter(isMeaningful);
  if (meaningful.length <= HIGHLIGHT_TARGET) return meaningful.slice().sort(byDateAsc);

  // Group by month, take the highest-scoring per month, then top up.
  const byMonth = new Map<string, DailyCheckIn[]>();
  for (const e of meaningful) {
    const key = e.date.slice(0, 7);
    const list = byMonth.get(key) ?? [];
    list.push(e);
    byMonth.set(key, list);
  }
  const months = Array.from(byMonth.keys()).sort();

  const score = (e: DailyCheckIn) => {
    const len = e.response.length;
    const punctBonus = (e.response.match(/[!?]/g) ?? []).length * 8;
    const ellipsisPenalty = e.response.endsWith("...") ? -10 : 0;
    return len + punctBonus + ellipsisPenalty;
  };

  const picks: DailyCheckIn[] = [];
  for (const m of months) {
    const sorted = (byMonth.get(m) ?? []).slice().sort((a, b) => score(b) - score(a));
    if (sorted[0]) picks.push(sorted[0]);
    if (picks.length >= HIGHLIGHT_TARGET) break;
  }
  if (picks.length < HIGHLIGHT_TARGET) {
    const used = new Set(picks.map((p) => p.id));
    const remainder = meaningful
      .filter((e) => !used.has(e.id))
      .sort((a, b) => score(b) - score(a))
      .slice(0, HIGHLIGHT_TARGET - picks.length);
    picks.push(...remainder);
  }
  return picks.sort(byDateAsc);
}

function byDateAsc(a: { date: string }, b: { date: string }): number {
  return a.date.localeCompare(b.date);
}

function firstSentence(text: string | null | undefined): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const m = trimmed.match(/[^.!?]+[.!?]/);
  return (m?.[0] ?? trimmed).trim();
}

function formatIso(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildTimeline(input: CompileInputs): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  if (input.joinedAtIso) {
    entries.push({
      date: input.joinedAtIso,
      title: "Joined Ananya",
      detail: "You started telling us your story.",
    });
  }

  // First check-in = a strong "we got into the rhythm" milestone.
  const firstCheckIn = input.checkIns
    .slice()
    .sort(byDateAsc)[0];
  if (firstCheckIn) {
    entries.push({
      date: firstCheckIn.date,
      title: "First daily check-in",
      detail: `"${firstCheckIn.response.slice(0, 80)}${firstCheckIn.response.length > 80 ? "…" : ""}"`,
    });
  }

  if (input.weddingDate) {
    entries.push({
      date: input.weddingDate.toISOString().slice(0, 10),
      title: "Set your wedding date",
    });
  }

  if (input.events.length > 0) {
    // EventRecord has no creation timestamp; fall back to the earliest
    // per-event eventDate when available so the milestone has *some*
    // grounding. If neither exists we just drop this entry.
    const earliestEventDate = input.events
      .map((e) => e.eventDate ?? null)
      .filter((d): d is string => Boolean(d))
      .sort()[0];
    if (earliestEventDate) {
      entries.push({
        date: earliestEventDate.slice(0, 10),
        title: "Defined your celebrations",
        detail: `${input.events.length} event${input.events.length === 1 ? "" : "s"}.`,
      });
    }
  }

  // Big task completions — we have status but no completed_at timestamp on
  // ChecklistItem, so use updated_at for done items as a proxy.
  const completedTasks = input.checklist.filter((t) => t.status === "done");
  if (completedTasks.length > 0) {
    const earliest = completedTasks
      .map((t) => t.updated_at)
      .filter(Boolean)
      .sort()[0];
    if (earliest) {
      entries.push({
        date: earliest.slice(0, 10),
        title: "First task crossed off",
      });
    }
  }

  // Letter sealed = a quietly meaningful moment.
  if (input.letter) {
    entries.push({
      date: input.letter.sealedAt.slice(0, 10),
      title: "Sealed a letter to your future selves",
    });
  }

  return entries.sort(byDateAsc);
}

function buildNumbers(input: CompileInputs): NumberStat[] {
  const out: NumberStat[] = [];

  const decisions = input.checklist.filter((t) => t.status === "done").length;
  if (decisions > 0) out.push({ label: "Decisions made", value: String(decisions) });

  if (input.notes.length > 0) {
    out.push({ label: "Notes saved", value: String(input.notes.length) });
  }

  if (input.checkIns.length > 0) {
    out.push({
      label: "Daily check-ins answered",
      value: String(input.checkIns.length),
    });
  }

  if (input.journalPhotos.length > 0) {
    out.push({
      label: "Planning journal photos",
      value: String(input.journalPhotos.length),
    });
  }

  if (input.events.length > 0) {
    const totalGuests = input.events.reduce(
      (acc, e) => acc + (e.guestCount ?? 0),
      0,
    );
    out.push({ label: "Events designed", value: String(input.events.length) });
    if (totalGuests > 0) {
      out.push({ label: "Guests invited", value: String(totalGuests) });
    }
  }

  // Most active planning day — bucket check-ins, notes, and completed
  // tasks by ISO date and find the busiest one.
  const dayMap = new Map<string, number>();
  const bump = (iso: string) => {
    const key = iso.slice(0, 10);
    dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
  };
  for (const e of input.checkIns) bump(e.date);
  for (const n of input.notes) bump(n.createdAt);
  for (const t of input.checklist) {
    if (t.status === "done") bump(t.updated_at);
  }
  let busiestKey = "";
  let busiestCount = 0;
  for (const [k, v] of dayMap.entries()) {
    if (v > busiestCount) {
      busiestKey = k;
      busiestCount = v;
    }
  }
  if (busiestKey && busiestCount >= 3) {
    out.push({
      label: "Most active planning day",
      value: `${formatIso(busiestKey)} · ${busiestCount} actions`,
    });
  }

  return out;
}

export function compileYearInReview(input: CompileInputs): CompiledYearInReview {
  const closing = input.checkIns
    .filter((e) => e.questionId === CLOSING_QUESTION.id)
    .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
  // Exclude the closing entry from highlights — it gets its own showcase.
  const highlights = pickHighlights(
    input.checkIns.filter((e) => e.questionId !== CLOSING_QUESTION.id),
  );

  return {
    timeline: buildTimeline(input),
    highlights,
    closing,
    letter: input.letter,
    numbers: buildNumbers(input),
    storyLine: firstSentence(input.storyText),
  };
}
