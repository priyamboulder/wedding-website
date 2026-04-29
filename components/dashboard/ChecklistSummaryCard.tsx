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

  const currentPhase = phases.find((ph) => {
    const phItems = items.filter((i) => i.phase_id === ph.id);
    return phItems.some((i) => i.status !== "done" && i.status !== "not_applicable");
  });

  return (
    <div className="playcard playcard-blush playcard-tilt-l flex flex-col" style={{ marginTop: 10 }}>
      <div className="flex items-baseline justify-between border-b px-4 py-3" style={{ borderColor: 'rgba(212,83,126,0.12)' }}>
        <span className="playcard-label">Checklist</span>
        <Link
          href="/checklist"
          className="playcard-body transition-colors hover:text-pink-500"
          style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 10 }}
        >
          Open →
        </Link>
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-baseline justify-between">
          <span className="playcard-stat">{pct}%</span>
          <span className="playcard-body">{done} / {total} tasks</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(212,83,126,0.12)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'var(--pink, #D4537E)' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x" style={{ borderTop: '1px solid rgba(212,83,126,0.12)', borderColor: 'rgba(212,83,126,0.12)' }}>
        <MiniStat label="In progress" value={`${inProgress}`} />
        <MiniStat label="Blocked" value={`${blocked}`} accent={blocked > 0} />
        <MiniStat label="Remaining" value={`${total - done}`} />
      </div>

      {currentPhase && (
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(212,83,126,0.12)' }}>
          <p className="playcard-body">
            Current phase:{" "}
            <span style={{ color: 'var(--wine, #4B1528)', fontWeight: 600 }}>{currentPhase.title}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-4 py-3">
      <p className="playcard-label" style={{ fontSize: 9, letterSpacing: '0.14em' }}>{label}</p>
      <p className="mt-1" style={{
        fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
        fontSize: 22,
        fontWeight: 400,
        lineHeight: 1,
        color: accent ? 'var(--pink, #D4537E)' : 'var(--wine, #4B1528)',
      }}>
        {value}
      </p>
    </div>
  );
}
