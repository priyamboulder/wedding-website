// ── UpcomingTasksPanel preview ──────────────────────────────────────────────
// Isolated demo for reviewing the reusable panel. Renders three variants
// side-by-side with live data from the real checklist store so you can see
// shared-state sync in action (complete a task here → it's also done on
// /checklist).
//
// Route: /workspace/demo

"use client";

import { useMemo } from "react";
import { UpcomingTasksPanel } from "@/components/workspace/shared/UpcomingTasksPanel";
import { useChecklistStore } from "@/stores/checklist-store";
import { computeCategoryProgress } from "@/lib/workspace/category-queries";
import { SectionHeader } from "@/components/workspace/blocks/primitives";

export default function UpcomingTasksPanelDemoPage() {
  // Compute via useMemo — never pass `s.getCategoryProgress(...)` directly to
  // a Zustand selector (the returned object is fresh each call and breaks
  // getSnapshot caching).
  const items = useChecklistStore((s) => s.items);
  const weddingDate = useChecklistStore((s) => s.weddingDate);
  const progress = useMemo(
    () => computeCategoryProgress(items, "photography", weddingDate),
    [items, weddingDate],
  );

  return (
    <main className="mx-auto max-w-[1200px] space-y-10 px-6 py-10">
      <SectionHeader
        eyebrow="Workspace · component preview"
        title="UpcomingTasksPanel"
        description={`Photography tasks: ${progress.done}/${progress.total} complete · ${progress.atRisk} at risk. Changes sync live with /checklist.`}
      />

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h4 className="font-serif text-[15px] text-ink">
            Bucketed variant (7 rows)
          </h4>
          <p className="text-[12px] text-ink-muted">
            Groups by Overdue / This Week / Next 2 weeks / Later.
          </p>
          <UpcomingTasksPanel
            category="photography"
            limit={7}
            grouping="buckets"
            title="Up next · photography"
          />
        </div>

        <div className="space-y-2">
          <h4 className="font-serif text-[15px] text-ink">
            Tab-specific variant (flat, 5 rows)
          </h4>
          <p className="text-[12px] text-ink-muted">
            Lives at the bottom of each tab (shortlist shown here). Shows only
            tasks tagged with that tab.
          </p>
          <UpcomingTasksPanel
            category="photography"
            tab="shortlist"
            limit={5}
            grouping="flat"
          />
        </div>

        <div className="space-y-2">
          <h4 className="font-serif text-[15px] text-ink">Decisions tab</h4>
          <p className="text-[12px] text-ink-muted">
            Same panel, different tab tag.
          </p>
          <UpcomingTasksPanel
            category="photography"
            tab="decisions"
            limit={5}
            grouping="flat"
          />
        </div>

        <div className="space-y-2">
          <h4 className="font-serif text-[15px] text-ink">
            Catering (no tags — empty state)
          </h4>
          <p className="text-[12px] text-ink-muted">
            Confirms the reusable panel handles uninitialized categories
            gracefully.
          </p>
          <UpcomingTasksPanel category="catering" limit={5} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-ivory-warm/30 p-4 text-[12.5px] leading-relaxed text-ink-muted">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
          Keyboard
        </p>
        <p className="mt-2">
          Click into a list, then press <kbd>j</kbd>/<kbd>k</kbd> to navigate,{" "}
          <kbd>x</kbd> to complete the focused task, <kbd>s</kbd> to snooze 1
          week, <kbd>Enter</kbd> to open the task detail handler.
        </p>
      </section>
    </main>
  );
}
