"use client";

import Link from "next/link";
import { useChecklistStore } from "@/stores/checklist-store";

export function ChecklistSummaryCard() {
  const items = useChecklistStore((s) => s.items);
  const phases = useChecklistStore((s) => s.phases);

  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const inProgress = items.filter((i) => i.status === "in_progress").length;
  const blocked = items.filter((i) => i.status === "blocked").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Find current phase (first phase with incomplete tasks)
  const currentPhase = phases.find((ph) => {
    const phItems = items.filter((i) => i.phase_id === ph.id);
    return phItems.some((i) => i.status !== "done" && i.status !== "not_applicable");
  });

  return (
    <div className="flex flex-col border border-border bg-white">
      <div className="flex items-baseline justify-between border-b border-border px-4 py-3">
        <h3
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Checklist
        </h3>
        <Link
          href="/checklist"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint transition-colors hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Open →
        </Link>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-baseline justify-between">
          <span className="font-serif text-[26px] leading-none text-ink">{pct}%</span>
          <span className="text-[11.5px] text-ink-muted">
            {done} / {total} tasks
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ivory-warm">
          <div
            className="h-full rounded-full bg-ink transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
        <MiniStat label="In progress" value={`${inProgress}`} />
        <MiniStat label="Blocked" value={`${blocked}`} accent={blocked > 0} />
        <MiniStat label="Remaining" value={`${total - done}`} />
      </div>

      {currentPhase && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-[11.5px] text-ink-muted">
            Current phase:{" "}
            <span className="text-ink">{currentPhase.title}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="px-4 py-3">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-[20px] font-medium leading-none ${accent ? "text-rose" : "text-ink"}`}
      >
        {value}
      </p>
    </div>
  );
}
