"use client";

// ── Production Timeline ───────────────────────────────────────────────────
// Month-by-month checklist from 6 months out through post-wedding thank-you
// cards. Each milestone is a check-off toggle; the couple can see at a
// glance which bucket they're sitting in. This replaces the old per-printer
// Production Tracker with a simpler critical-path view that mirrors how
// planners actually pace the stationery workflow.

import { useMemo } from "react";
import { CheckCircle2, Circle, Clock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStationeryStore } from "@/stores/stationery-store";
import { useChecklistStore } from "@/stores/checklist-store";
import {
  STATIONERY_TIMELINE_BUCKET_LABEL,
  type StationeryTimelineBucket,
  type StationeryTimelineMilestone,
} from "@/types/stationery";
import {
  computeStationeryTimeline,
  formatStationeryDate,
} from "@/lib/stationery/timeline";
import {
  Eyebrow,
  MiniStat,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";

const BUCKET_ORDER: StationeryTimelineBucket[] = [
  "6_months_out",
  "5_months_out",
  "4_months_out",
  "3_months_out",
  "2_months_out",
  "1_month_out",
  "1_week_out",
  "post_wedding",
];

export function ProductionTimeline() {
  const milestones = useStationeryStore((s) => s.timelineMilestones);
  const done = useStationeryStore((s) => s.milestoneDone);
  const toggleMilestone = useStationeryStore((s) => s.toggleMilestone);
  const resetMilestones = useStationeryStore((s) => s.resetMilestones);

  const printMethod = useStationeryStore((s) => s.primaryPrintMethod);
  const weddingDate = useChecklistStore((s) => s.weddingDate);
  const timeline = useMemo(
    () => computeStationeryTimeline(weddingDate, printMethod),
    [weddingDate, printMethod],
  );

  // Group milestones by bucket.
  const grouped = useMemo(() => {
    const map = new Map<StationeryTimelineBucket, StationeryTimelineMilestone[]>();
    for (const b of BUCKET_ORDER) map.set(b, []);
    for (const m of milestones) {
      map.get(m.bucket)?.push(m);
    }
    return map;
  }, [milestones]);

  // Running totals.
  const { total, completed, percent } = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.reduce(
      (sum, m) => sum + (done[m.id] ? 1 : 0),
      0,
    );
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [milestones, done]);

  // First unfinished milestone — the "you are here" marker.
  const nextMilestone = useMemo(
    () => milestones.find((m) => !done[m.id]),
    [milestones, done],
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Production Timeline"
        title="The critical path from six months out to thank-you cards"
        description="Indian wedding stationery has cascading deadlines — miss one date and the rest shift. Tick milestones as you complete them; the next open row is the one to focus on."
        right={
          <button
            type="button"
            onClick={resetMilestones}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            <RotateCcw size={12} strokeWidth={1.8} />
            Reset
          </button>
        }
      />

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Milestones" value={total} hint="Across every bucket" />
        <MiniStat
          label="Completed"
          value={`${completed}/${total}`}
          hint={`${percent}% of the path`}
          tone={percent >= 50 ? "sage" : "saffron"}
        />
        <MiniStat
          label="You are here"
          value={
            nextMilestone
              ? STATIONERY_TIMELINE_BUCKET_LABEL[nextMilestone.bucket]
              : "Finished"
          }
          hint={nextMilestone ? "Next open milestone" : "Everything is checked"}
        />
        {timeline && (
          <MiniStat
            label="Mail deadline"
            value={formatStationeryDate(timeline.mailBy)}
            hint={`${timeline.daysUntilMail} days away`}
            tone={timeline.daysUntilMail < 14 ? "rose" : "ink"}
          />
        )}
      </div>

      {/* ── Computed deadlines (if wedding date is set) ───────────────── */}
      {timeline && (
        <aside className="rounded-lg border border-border bg-ivory-warm/30 px-4 py-3">
          <Eyebrow>Computed critical dates</Eyebrow>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
            <DateChip
              label="Save-the-date mail"
              date={formatStationeryDate(timeline.saveTheDateMailBy)}
              days={timeline.daysUntilSaveTheDate}
            />
            <DateChip
              label="Design approval"
              date={formatStationeryDate(timeline.designApprovalBy)}
              days={timeline.daysUntilDesignApproval}
            />
            <DateChip
              label="Mail suite"
              date={formatStationeryDate(timeline.mailBy)}
              days={timeline.daysUntilMail}
            />
            <DateChip
              label="RSVP deadline"
              date={formatStationeryDate(timeline.rsvpDue)}
              days={timeline.daysUntilRsvp}
            />
          </div>
          <p className="mt-2 text-[11px] italic text-ink-muted">
            Derived from your wedding date + primary print method. International
            guests need suite mailed by{" "}
            <span className="font-medium text-ink">
              {formatStationeryDate(timeline.mailByInternational)}
            </span>
            .
          </p>
        </aside>
      )}

      {/* ── Timeline buckets ──────────────────────────────────────────── */}
      <div className="space-y-4">
        {BUCKET_ORDER.map((bucket) => {
          const items = grouped.get(bucket) ?? [];
          if (items.length === 0) return null;
          const bucketCompleted = items.reduce(
            (sum, m) => sum + (done[m.id] ? 1 : 0),
            0,
          );
          const bucketAllDone = bucketCompleted === items.length;

          return (
            <section
              key={bucket}
              className={cn(
                "rounded-lg border bg-white",
                bucketAllDone
                  ? "border-sage/30 bg-sage-pale/20"
                  : "border-border",
              )}
            >
              <header className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Clock
                    size={13}
                    strokeWidth={1.8}
                    className={bucketAllDone ? "text-sage" : "text-saffron"}
                  />
                  <h4 className="font-serif text-[15px] text-ink">
                    {STATIONERY_TIMELINE_BUCKET_LABEL[bucket]}
                  </h4>
                </div>
                <span
                  className="font-mono text-[10.5px] tabular-nums text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {bucketCompleted}/{items.length}
                </span>
              </header>
              <ul className="divide-y divide-border/40">
                {items.map((m) => {
                  const isDone = !!done[m.id];
                  return (
                    <li
                      key={m.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-ivory-warm/40",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleMilestone(m.id)}
                        aria-label={
                          isDone ? `Mark "${m.label}" incomplete` : `Complete "${m.label}"`
                        }
                        className={cn(
                          "flex h-5 w-5 items-center justify-center",
                          isDone ? "text-sage" : "text-ink-faint hover:text-saffron",
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 size={16} strokeWidth={1.8} />
                        ) : (
                          <Circle size={16} strokeWidth={1.8} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleMilestone(m.id)}
                        className={cn(
                          "flex-1 text-left text-[13px] transition-colors",
                          isDone
                            ? "text-ink-muted line-through"
                            : "text-ink hover:text-saffron",
                        )}
                      >
                        {m.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function DateChip({
  label,
  date,
  days,
}: {
  label: string;
  date: string;
  days: number;
}) {
  const isPast = days < 0;
  const urgent = days >= 0 && days < 14;
  return (
    <div
      className={cn(
        "rounded-md border bg-white px-3 py-2",
        urgent ? "border-rose/40 bg-rose-pale/30" : "border-border",
      )}
    >
      <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-[12px] tabular-nums text-ink">
        {date}
      </p>
      <p
        className={cn(
          "text-[10.5px]",
          isPast
            ? "text-sage"
            : urgent
              ? "text-rose"
              : "text-ink-muted",
        )}
      >
        {isPast ? `${Math.abs(days)} days ago` : `in ${days} days`}
      </p>
    </div>
  );
}
