"use client";

// ── Journey Step 5 · Plan your timeline ─────────────────────────────────
//
// Generates a reverse-chronological set of milestones based on the
// couple's wedding date. Critical deadlines (save-the-dates,
// invitations, custom outfits) get a terracotta accent. Tapping
// "Generate timeline" seeds the checklist store with a custom item
// per milestone, with calculated due dates.

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useChecklistStore } from "@/stores/checklist-store";
import { useDashboardJourneyStore } from "@/stores/dashboard-journey-store";
import {
  groupMilestonesByPhase,
  resolveMilestones,
  type ResolvedMilestone,
} from "@/lib/journey/timeline-milestones";
import { cn } from "@/lib/utils";

interface Step5Props {
  weddingDate: Date | null;
  done: boolean;
  active: boolean;
}

const SEED_PHASE_ID = "phase-0"; // Foundation & Vision — first checklist phase
const SEED_SUBSECTION = "journey-timeline";

export function JourneyStep5Timeline({
  weddingDate,
  done,
  active,
}: Step5Props) {
  const generated = useDashboardJourneyStore((s) => s.timelineGenerated);
  const generatedAt = useDashboardJourneyStore((s) => s.timelineGeneratedAt);
  const markGenerated = useDashboardJourneyStore((s) => s.markTimelineGenerated);
  const items = useChecklistStore((s) => s.items);
  const addCustomItem = useChecklistStore((s) => s.addCustomItem);

  const resolved = useMemo<ResolvedMilestone[]>(() => {
    if (!weddingDate) return [];
    return resolveMilestones(weddingDate);
  }, [weddingDate]);
  const grouped = useMemo(() => groupMilestonesByPhase(resolved), [resolved]);

  const handleGenerate = () => {
    if (!weddingDate) return;
    // Avoid duplicates: only add a custom item for milestones we haven't
    // already seeded (matched by title + due_date).
    const existingKeys = new Set(
      items.map((i) => `${i.title}|${i.due_date ?? ""}`),
    );
    resolved.forEach((m) => {
      const key = `${m.title}|${m.dueIso}`;
      if (existingKeys.has(key)) return;
      addCustomItem({
        phase_id: SEED_PHASE_ID,
        subsection: SEED_SUBSECTION,
        title: m.title,
        description: m.description,
        priority: m.critical ? "high" : "medium",
        due_date: m.dueIso,
      });
    });
    markGenerated();
  };

  // Done collapsed
  if (done && !active) {
    return (
      <p className="text-[13.5px] text-[color:var(--dash-text)]">
        Timeline seeded
        {generatedAt && (
          <span className="ml-2 text-[color:var(--dash-text-muted)]">
            ·{" "}
            {new Date(generatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
        <Link
          href="/checklist"
          className="ml-3 inline-flex items-center gap-0.5 text-[12px] font-medium text-[color:var(--dash-blush-deep)] hover:text-[color:var(--dash-text)]"
        >
          Open in checklist <ArrowUpRight size={11} strokeWidth={1.8} />
        </Link>
      </p>
    );
  }

  // No date yet — gentle nudge to do Step 1 first.
  if (!weddingDate) {
    return (
      <p
        className="font-serif text-[15px] italic leading-relaxed text-[color:var(--dash-text-muted)]"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      >
        Pick your date in Step 1 and we&apos;ll calculate every milestone
        backward from there.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p
          className="max-w-[44rem] font-serif text-[15px] italic leading-relaxed text-[color:var(--dash-text-muted)]"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          Now let&apos;s make sure nothing falls through the cracks. Here are
          the moments that matter before the big day — calculated from your
          date.
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          className={cn("dash-btn dash-btn--sm shrink-0", generated && "opacity-60")}
        >
          <Sparkles size={13} strokeWidth={1.8} />
          {generated ? "Re-seed checklist" : "Add to checklist"}
        </button>
      </div>

      <ol className="flex flex-col gap-4">
        {grouped.map(({ phase, items }) => (
          <li key={phase.label}>
            <div className="mb-2 flex items-baseline gap-3">
              <span
                className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-blush-deep)]"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
              >
                {phase.label}
              </span>
              <span
                className="text-[10px] italic text-[color:var(--dash-text-faint)]"
                style={{
                  fontFamily:
                    "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                }}
              >
                {phase.range}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {items.map((m) => (
                <Milestone key={m.id} m={m} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Milestone({ m }: { m: ResolvedMilestone }) {
  return (
    <li
      className={cn(
        "rounded-[4px] border border-[color:var(--dash-blush-soft)] bg-[color:var(--dash-canvas)] px-3 py-2.5",
        m.critical && "dash-deadline border-transparent",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h5
            className="font-serif text-[14.5px] leading-snug text-[color:var(--dash-text)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
            }}
          >
            {m.title}
          </h5>
          <p className="mt-0.5 text-[12px] leading-snug text-[color:var(--dash-text-muted)]">
            {m.description}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={cn(
              "text-[11px] font-medium tabular-nums",
              m.critical
                ? "text-[color:var(--color-terracotta)]"
                : "text-[color:var(--dash-blush-deep)]",
            )}
            style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
          >
            {m.dueLabel}
          </p>
          <p className="text-[10px] text-[color:var(--dash-text-faint)]">
            {m.daysUntil > 0
              ? `${m.daysUntil} days out`
              : m.daysUntil === 0
                ? "today"
                : `${Math.abs(m.daysUntil)} days ago`}
          </p>
        </div>
      </div>
      {m.href && (
        <Link
          href={m.href}
          className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-medium text-[color:var(--dash-blush-deep)] hover:text-[color:var(--dash-text)]"
        >
          Open module <ArrowUpRight size={10} strokeWidth={1.8} />
        </Link>
      )}
    </li>
  );
}
