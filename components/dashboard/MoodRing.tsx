"use client";

// ── MoodRing ──────────────────────────────────────────────────────────────
// Ambient emotional indicator that lives in the couple header. A small
// animated gradient orb whose color palette and animation rhythm shift
// with how close the wedding is, gently brightened by recent platform
// activity. Decorative only — no interaction, no link. Pure CSS keyframes.
//
// Inputs: daysUntilWedding (number | null) and activityLevel (low / medium /
// high). Activity is computed from notes, decisions, and check-ins in the
// last 7 days by the consumer.

import { useDashboardNotepadStore } from "@/stores/dashboard-notepad-store";
import { useDailyCheckInsStore } from "@/stores/daily-checkins-store";
import { useDecisionsStore } from "@/stores/decisions-store";
import { useMemo } from "react";

export type MoodActivityLevel = "low" | "medium" | "high";

interface MoodPhase {
  id: string;
  label: string;
  // Two stops sweep around the gradient — kept as plain hex so the CSS
  // variables animate cleanly when the phase changes.
  a: string;
  b: string;
  c: string;
  // Time the keyframe animation takes — closer dates feel faster.
  durationSec: number;
  whisper: (days: number) => string;
}

// All phases share the same blush → rose triad (#E8D5D0 → #D4A5A5 →
// #C4929B); only animation rhythm changes with proximity. Slow and
// dreamy when far out, faster and more vibrant near the date.
const TRIAD = { a: "#E8D5D0", b: "#D4A5A5", c: "#C4929B" } as const;

const PHASES: MoodPhase[] = [
  {
    id: "dreamy",
    label: "dreamy",
    ...TRIAD,
    durationSec: 14,
    whisper: (d) => `${d} days — the dream is taking shape`,
  },
  {
    id: "warming",
    label: "warming",
    ...TRIAD,
    durationSec: 10,
    whisper: (d) => `${d} days — it's beginning to feel real`,
  },
  {
    id: "building",
    label: "building",
    ...TRIAD,
    durationSec: 7,
    whisper: (d) => `${d} days — the excitement is building`,
  },
  {
    id: "alive",
    label: "alive",
    ...TRIAD,
    durationSec: 5,
    whisper: (d) => `${d} days — the excitement is palpable`,
  },
  {
    id: "electric",
    label: "electric",
    ...TRIAD,
    durationSec: 3.2,
    whisper: (d) => `${d} days — almost here`,
  },
  {
    id: "radiant",
    label: "radiant",
    ...TRIAD,
    durationSec: 2.2,
    whisper: (d) => (d <= 0 ? "this week — radiant" : `${d} days — full bloom`),
  },
];

function pickPhase(daysUntil: number): MoodPhase {
  if (daysUntil >= 365) return PHASES[0];
  if (daysUntil >= 180) return PHASES[1];
  if (daysUntil >= 90) return PHASES[2];
  if (daysUntil >= 30) return PHASES[3];
  if (daysUntil >= 14) return PHASES[4];
  return PHASES[5];
}

function activityFromStores(
  notes: number,
  checkins: number,
  decisions: number,
): MoodActivityLevel {
  const score = notes + checkins * 1.3 + decisions * 0.8;
  if (score >= 5) return "high";
  if (score >= 2) return "medium";
  return "low";
}

interface MoodRingProps {
  daysUntilWedding: number | null;
  size?: number;
  activityOverride?: MoodActivityLevel;
}

export function MoodRing({
  daysUntilWedding,
  size = 56,
  activityOverride,
}: MoodRingProps) {
  const notes = useDashboardNotepadStore((s) => s.notes);
  const checkins = useDailyCheckInsStore((s) => s.entries);
  const decisions = useDecisionsStore((s) => s.decisions);

  const activityLevel = useMemo<MoodActivityLevel>(() => {
    if (activityOverride) return activityOverride;
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentNotes = notes.filter(
      (n) => new Date(n.createdAt).getTime() >= cutoff,
    ).length;
    const recentCheckins = checkins.filter(
      (c) => new Date(c.createdAt).getTime() >= cutoff,
    ).length;
    const recentDecisions = decisions.filter(
      (d) => new Date(d.createdAt).getTime() >= cutoff,
    ).length;
    return activityFromStores(recentNotes, recentCheckins, recentDecisions);
  }, [notes, checkins, decisions, activityOverride]);

  if (daysUntilWedding == null) return null;

  const phase = pickPhase(daysUntilWedding);
  const intensity =
    activityLevel === "high" ? 1 : activityLevel === "medium" ? 0.78 : 0.6;

  // Slightly accelerate the loop when activity is high.
  const duration =
    activityLevel === "high"
      ? phase.durationSec * 0.78
      : activityLevel === "low"
        ? phase.durationSec * 1.18
        : phase.durationSec;

  const whisper =
    daysUntilWedding > 0
      ? phase.whisper(daysUntilWedding)
      : daysUntilWedding === 0
        ? "today — the day is here"
        : `${Math.abs(daysUntilWedding)} days since — the afterglow lingers`;

  return (
    <span
      className="dash-mood-ring group relative inline-flex shrink-0 items-center justify-center"
      style={
        {
          width: size,
          height: size,
          ["--mr-a"]: phase.a,
          ["--mr-b"]: phase.b,
          ["--mr-c"]: phase.c,
          ["--mr-duration"]: `${duration}s`,
          ["--mr-intensity"]: intensity.toString(),
        } as React.CSSProperties
      }
      aria-label={whisper}
      data-phase={phase.id}
      data-activity={activityLevel}
    >
      <span aria-hidden className="dash-mood-ring__halo" />
      <span aria-hidden className="dash-mood-ring__core" />
      <span aria-hidden className="dash-mood-ring__sheen" />
      <span
        role="tooltip"
        className="dash-mood-ring__whisper pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[color:var(--dash-canvas)] px-3 py-1 text-[12px] italic text-[color:var(--dash-text-muted)] opacity-0 shadow-[0_4px_18px_-6px_rgba(196,146,155,0.35)] ring-1 ring-[color:var(--dash-card-border)] transition-opacity duration-200 group-hover:opacity-100"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      >
        {whisper}
      </span>
    </span>
  );
}
