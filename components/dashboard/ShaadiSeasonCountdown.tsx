"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import type { ChecklistItem, Priority } from "@/types/checklist";

// ── Countdown bands ────────────────────────────────────────────────────────
// Each band has: a day window, a nudge sentence, and the phase it points at.
// Tied to PHASE_WINDOWS in lib/checklist-seed.ts so the link lands on the
// phase that owns the work the nudge is asking for.

interface CountdownBand {
  label: string;
  nudge: string;
  phaseId: string;
}

function bandFor(daysUntil: number): CountdownBand {
  if (daysUntil >= 365) {
    return {
      label: "12+ months",
      nudge:
        "You're ahead of the game. Focus on the big three: venue, photographer, caterer.",
      phaseId: "phase-2",
    };
  }
  if (daysUntil >= 270) {
    return {
      label: "9–12 months",
      nudge:
        "Lock in your venue and photographer now — peak dates fill 12+ months out.",
      phaseId: "phase-2",
    };
  }
  if (daysUntil >= 180) {
    return {
      label: "6–9 months",
      nudge:
        "Outfit shopping window is open. Custom orders need 4–6 months.",
      phaseId: "phase-3",
    };
  }
  if (daysUntil >= 90) {
    return {
      label: "3–6 months",
      nudge:
        "Invitations should go out soon. Finalize your guest list this month.",
      phaseId: "phase-5",
    };
  }
  if (daysUntil >= 30) {
    return {
      label: "1–3 months",
      nudge:
        "Final vendor confirmations. Seating chart. Final fittings. You're in the home stretch.",
      phaseId: "phase-6",
    };
  }
  return {
    label: "Under 30 days",
    nudge:
      "Week-of timeline mode. Delegate everything you can. And breathe.",
    phaseId: "phase-10",
  };
}

const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function isOpen(item: ChecklistItem): boolean {
  return item.status !== "done" && item.status !== "not_applicable";
}

function parseWeddingDate(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.setHours(0, 0, 0, 0) - new Date(from).setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

export function ShaadiSeasonCountdown() {
  const weddingDateRaw = useAuthStore((s) => s.user?.wedding?.weddingDate);
  const fallbackDate = useChecklistStore((s) => s.weddingDate);
  const items = useChecklistStore((s) => s.items);
  const phases = useChecklistStore((s) => s.phases);
  const [expanded, setExpanded] = useState(false);

  const weddingDate = useMemo(
    () => parseWeddingDate(weddingDateRaw) ?? fallbackDate ?? null,
    [weddingDateRaw, fallbackDate],
  );

  // No wedding date set → CTA prompt instead of countdown.
  if (!weddingDate) {
    return (
      <section className="mt-10">
        <Link
          href="/settings"
          className="group block border border-[color:var(--color-gold-pale)] bg-[linear-gradient(135deg,var(--color-ivory)_0%,var(--color-gold-pale)_100%)] px-8 py-10 transition-shadow hover:shadow-md"
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-gold)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Shaadi season countdown
          </p>
          <div className="mt-3 flex items-baseline justify-between gap-6">
            <h2
              className="font-serif text-[36px] leading-[1.05] text-ink"
              style={{
                fontFamily:
                  "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              }}
            >
              Set your wedding date
            </h2>
            <ArrowUpRight
              size={20}
              strokeWidth={1.6}
              className="shrink-0 text-ink-faint transition-colors group-hover:text-[color:var(--color-gold)]"
            />
          </div>
          <p
            className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-muted"
            style={{ fontFamily: "Outfit, var(--font-sans), sans-serif" }}
          >
            Add the big day so we can map your countdown, surface the right
            checklist phase, and keep the next moves in season.
          </p>
        </Link>
      </section>
    );
  }

  const today = new Date();
  const daysUntil = daysBetween(today, new Date(weddingDate));
  const isPast = daysUntil < 0;
  const band = bandFor(Math.max(daysUntil, 0));

  // Current and previous phase progress, used by the expandable section.
  const phaseOrder = phases.map((p) => p.id);
  const currentPhaseIdx = phaseOrder.indexOf(band.phaseId);
  const relevantPhaseIds = phaseOrder
    .slice(0, Math.max(currentPhaseIdx + 1, 1))
    .filter((id) => id !== "phase-11"); // Event Days isn't a planning phase

  const phaseSummaries = relevantPhaseIds.map((pid) => {
    const phase = phases.find((p) => p.id === pid)!;
    const phItems = items.filter((i) => i.phase_id === pid);
    const total = phItems.length;
    const done = phItems.filter((i) => i.status === "done").length;
    return { phase, total, done };
  });

  const totalRelevant = phaseSummaries.reduce((s, p) => s + p.total, 0);
  const doneRelevant = phaseSummaries.reduce((s, p) => s + p.done, 0);
  const isBehind = totalRelevant > 0 && doneRelevant / totalRelevant < 0.7;

  const todayIso = today.toISOString().slice(0, 10);
  const upcomingTasks = items
    .filter(
      (i) =>
        relevantPhaseIds.includes(i.phase_id) &&
        isOpen(i) &&
        (i.priority === "critical" || i.priority === "high"),
    )
    .sort((a, b) => {
      // Overdue first, then by priority, then by due date.
      const aOverdue = a.due_date && a.due_date < todayIso ? 0 : 1;
      const bOverdue = b.due_date && b.due_date < todayIso ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (pr !== 0) return pr;
      const aDue = a.due_date ?? "9999-12-31";
      const bDue = b.due_date ?? "9999-12-31";
      return aDue.localeCompare(bDue);
    })
    .slice(0, 5);

  // Link target: the first open item in the band's phase, so clicking the
  // nudge drops the couple into the work that's actually waiting on them.
  const nudgeTarget =
    items.find((i) => i.phase_id === band.phaseId && isOpen(i))?.id ?? null;
  const nudgeHref = nudgeTarget
    ? `/checklist?open=${nudgeTarget}`
    : "/checklist";

  return (
    <section className="mt-10">
      <article
        className="border border-[color:var(--color-gold-pale)] bg-[linear-gradient(135deg,var(--color-ivory)_0%,var(--color-gold-pale)_100%)]"
      >
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-gold)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Shaadi season countdown
          </p>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              {isPast ? (
                <>
                  <p
                    className="font-serif text-[88px] leading-[0.9] text-ink sm:text-[120px]"
                    style={{
                      fontFamily:
                        "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    {Math.abs(daysUntil)}
                  </p>
                  <p
                    className="mt-3 text-[14px] uppercase tracking-[0.14em] text-ink-muted"
                    style={{
                      fontFamily: "Outfit, var(--font-sans), sans-serif",
                    }}
                  >
                    days since your wedding
                  </p>
                </>
              ) : (
                <>
                  <p
                    className="font-serif text-[88px] leading-[0.9] text-ink sm:text-[120px]"
                    style={{
                      fontFamily:
                        "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    {daysUntil}
                  </p>
                  <p
                    className="mt-3 text-[14px] uppercase tracking-[0.14em] text-ink-muted"
                    style={{
                      fontFamily: "Outfit, var(--font-sans), sans-serif",
                    }}
                  >
                    days until your wedding
                  </p>
                </>
              )}
            </div>

            <div
              className="text-right font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <div>{band.label}</div>
              <div className="mt-1 text-ink-muted">
                {new Date(weddingDate).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {!isPast && (
            <Link
              href={nudgeHref}
              className="group mt-8 flex items-start gap-4 border-t border-[color:var(--color-gold-pale)] pt-6 transition-colors hover:text-[color:var(--color-gold)]"
            >
              <p
                className="flex-1 font-serif text-[20px] italic leading-snug text-ink-soft"
                style={{
                  fontFamily:
                    "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                }}
              >
                {band.nudge}
              </p>
              <ArrowUpRight
                size={18}
                strokeWidth={1.6}
                className="mt-1 shrink-0 text-ink-faint transition-colors group-hover:text-[color:var(--color-gold)]"
              />
            </Link>
          )}
        </div>

        {!isPast && phaseSummaries.length > 0 && (
          <div className="border-t border-[color:var(--color-gold-pale)]">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[color:var(--color-gold-pale)]/40 sm:px-10"
              aria-expanded={expanded}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  What you should have done by now
                </span>
                <span className="text-[12px] tabular-nums text-ink-faint">
                  {doneRelevant} / {totalRelevant} tasks
                </span>
              </div>
              {expanded ? (
                <ChevronDown size={16} strokeWidth={1.6} className="text-ink-faint" />
              ) : (
                <ChevronRight size={16} strokeWidth={1.6} className="text-ink-faint" />
              )}
            </button>

            {expanded && (
              <div className="border-t border-[color:var(--color-gold-pale)] px-6 py-6 sm:px-10">
                {isBehind && (
                  <p
                    className="mb-5 font-serif text-[15px] italic text-[color:var(--color-gold)]"
                    style={{
                      fontFamily:
                        "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    A few things to catch up on…
                  </p>
                )}

                <ul className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {phaseSummaries.map(({ phase, total, done }) => {
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    return (
                      <li
                        key={phase.id}
                        className="flex items-baseline justify-between border border-[color:var(--color-gold-pale)] bg-white/60 px-3 py-2"
                      >
                        <span className="truncate text-[13px] text-ink">
                          {phase.title}
                        </span>
                        <span
                          className="ml-3 font-mono text-[11px] tabular-nums text-ink-muted"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {done}/{total} · {pct}%
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {upcomingTasks.length > 0 ? (
                  <ol className="divide-y divide-[color:var(--color-gold-pale)] border-y border-[color:var(--color-gold-pale)]">
                    {upcomingTasks.map((task) => {
                      const overdue =
                        task.due_date != null && task.due_date < todayIso;
                      return (
                        <li key={task.id}>
                          <Link
                            href={`/checklist?open=${task.id}`}
                            className="group flex items-center gap-4 py-3 transition-colors hover:bg-[color:var(--color-gold-pale)]/40"
                          >
                            <span
                              className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] ${overdue ? "text-rose" : "text-ink-faint"}`}
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {overdue ? "Overdue" : task.priority}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[14px] text-ink">
                              {task.title}
                            </span>
                            <ArrowUpRight
                              size={14}
                              strokeWidth={1.6}
                              className="shrink-0 text-ink-faint transition-colors group-hover:text-ink"
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="text-[13px] italic text-ink-muted">
                    Nothing urgent in your current phase. Keep going.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </article>
    </section>
  );
}
