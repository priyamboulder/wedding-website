"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  EVENT_BY_ID,
  EVENT_CATALOG,
  SUGGESTED_LAYOUT,
  type EventDef,
  type EventId,
} from "./events";

import styles from "./TimelineBuilderTool.module.css";

const STORAGE_KEY = "marigold:timeline-builder:state";
const DAY_COUNT = 3;
const STEPS = ["select", "arrange", "timeline"] as const;
type Step = (typeof STEPS)[number];

type DayMap = Record<number, EventId[]>;

type State = {
  step: Step;
  selected: EventId[];
  days: DayMap;
};

const INITIAL: State = {
  step: "select",
  selected: [],
  days: { 0: [], 1: [], 2: [] },
};

function emptyDays(): DayMap {
  return { 0: [], 1: [], 2: [] };
}

function dayHours(ids: EventId[]): number {
  return ids.reduce((acc, id) => acc + (EVENT_BY_ID[id]?.durationHours ?? 0), 0);
}

export function TimelineBuilderTool() {
  const [state, setState] = useState<State>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const persisted = JSON.parse(raw) as State;
        if (persisted && Array.isArray(persisted.selected) && persisted.days) {
          setState(persisted);
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  function toggle(id: EventId) {
    setState((s) => {
      const isOn = s.selected.includes(id);
      const selected = isOn
        ? s.selected.filter((x) => x !== id)
        : [...s.selected, id];
      const days: DayMap = isOn
        ? {
            0: s.days[0].filter((x) => x !== id),
            1: s.days[1].filter((x) => x !== id),
            2: s.days[2].filter((x) => x !== id),
          }
        : s.days;
      return { ...s, selected, days };
    });
  }

  function placeUnplaced() {
    setState((s) => {
      const placed = new Set([...s.days[0], ...s.days[1], ...s.days[2]]);
      const next = { 0: [...s.days[0]], 1: [...s.days[1]], 2: [...s.days[2]] };
      for (const id of s.selected) {
        if (!placed.has(id)) next[0].push(id);
      }
      return { ...s, days: next };
    });
  }

  function suggestOrder() {
    setState((s) => {
      const next: DayMap = emptyDays();
      for (const id of s.selected) {
        const day = SUGGESTED_LAYOUT[id] ?? 0;
        next[day].push(id);
      }
      return { ...s, days: next };
    });
  }

  function clearArrangement() {
    setState((s) => ({ ...s, days: emptyDays() }));
  }

  function reset() {
    setState(INITIAL);
  }

  function goStep(step: Step) {
    if (step === "arrange") placeUnplaced();
    setState((s) => ({ ...s, step }));
  }

  function handleDragEnd(e: DragEndEvent) {
    const eventId = e.active.id as EventId;
    const overId = e.over?.id as string | undefined;
    if (!overId || !overId.startsWith("day-")) return;
    const targetDay = Number(overId.replace("day-", ""));
    if (Number.isNaN(targetDay)) return;

    setState((s) => {
      const next: DayMap = {
        0: s.days[0].filter((x) => x !== eventId),
        1: s.days[1].filter((x) => x !== eventId),
        2: s.days[2].filter((x) => x !== eventId),
      };
      next[targetDay] = [...next[targetDay], eventId];
      return { ...s, days: next };
    });
  }

  const allArranged = useMemo(
    () =>
      state.selected.every((id) =>
        [...state.days[0], ...state.days[1], ...state.days[2]].includes(id),
      ),
    [state.selected, state.days],
  );

  const fullText = useMemo(() => {
    const lines: string[] = ["Wedding weekend timeline", ""];
    for (let d = 0; d < DAY_COUNT; d++) {
      const events = state.days[d];
      if (events.length === 0) continue;
      lines.push(`— Day ${d + 1} —`);
      for (const id of events) {
        const def = EVENT_BY_ID[id];
        lines.push("");
        lines.push(`${def.name} (${def.blurb})`);
        for (const row of def.skeleton) {
          lines.push(`  ${row.time} — ${row.line}`);
        }
      }
      lines.push("");
    }
    lines.push("From The Marigold — Indian Wedding Timeline Builder");
    return lines.join("\n");
  }, [state.days]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Link href="/tools" className={styles.backLink}>
          ← Back to all tools
        </Link>

        <header className={styles.header}>
          <span className={styles.timeBadge}>⚡ 2 min</span>
          <span className={styles.scrawl}>✿ timeline builder</span>
          <h1 className={styles.title}>
            Which events, which days, <em>what order?</em>
          </h1>
          <p className={styles.tagline}>
            Drag your weekend into shape. We'll hand back a day-of skeleton for
            every event — the kind of thing your planner would charge you for.
          </p>
        </header>

        <div className={styles.stepBar} aria-hidden>
          {STEPS.map((s, i) => {
            const idx = STEPS.indexOf(state.step);
            return (
              <span
                key={s}
                className={[
                  styles.stepDot,
                  i < idx ? styles.stepDotDone : "",
                  i === idx ? styles.stepDotActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            );
          })}
        </div>

        {state.step === "select" && (
          <div className={styles.card}>
            <span className={styles.eyebrow}>Step 1 of 3 — pick events</span>
            <h2 className={styles.heading}>
              Which events are you <em>actually</em> doing?
            </h2>
            <p className={styles.sub}>
              Toggle each one. Most full Indian-American weddings land on
              5–7 events across 2–3 days.
            </p>

            <div className={styles.eventGrid}>
              {EVENT_CATALOG.map((def) => {
                const on = state.selected.includes(def.id);
                return (
                  <button
                    key={def.id}
                    type="button"
                    className={[
                      styles.eventCard,
                      on ? styles.eventCardOn : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => toggle(def.id)}
                    aria-pressed={on}
                  >
                    <span className={styles.eventName}>{def.name}</span>
                    <span className={styles.eventBlurb}>{def.blurb}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setState((s) => ({ ...s, selected: [] }))}
                disabled={state.selected.length === 0}
              >
                clear
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => goStep("arrange")}
                disabled={state.selected.length === 0}
              >
                Arrange across days →
              </button>
            </div>
          </div>
        )}

        {state.step === "arrange" && (
          <div className={styles.card}>
            <span className={styles.eyebrow}>Step 2 of 3 — arrange</span>
            <h2 className={styles.heading}>
              Drop each event onto a <em>day</em>.
            </h2>
            <p className={styles.sub}>
              Drag and drop, or use Suggest to auto-arrange. Watch the daily
              hours — over 10 hrs is brutal for guests.
            </p>

            <div className={styles.arrangeActions}>
              <button
                type="button"
                className={styles.suggestBtn}
                onClick={suggestOrder}
              >
                ✨ Suggest a logical order
              </button>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={clearArrangement}
              >
                clear arrangement
              </button>
            </div>

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div className={styles.dayGrid}>
                {[0, 1, 2].map((d) => (
                  <DayColumn
                    key={d}
                    dayIndex={d}
                    eventIds={state.days[d]}
                  />
                ))}
              </div>
            </DndContext>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setState((s) => ({ ...s, step: "select" }))}
              >
                ← back
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setState((s) => ({ ...s, step: "timeline" }))}
                disabled={!allArranged}
              >
                {allArranged
                  ? "See the timeline →"
                  : "Place every event to continue"}
              </button>
            </div>
          </div>
        )}

        {state.step === "timeline" && (
          <>
            <div className={styles.card}>
              <span className={styles.eyebrow}>Step 3 of 3 — timeline</span>
              <h2 className={styles.heading}>
                Your <em>weekend</em>, hour by hour.
              </h2>
              <p className={styles.sub}>
                Skeleton timings below. These are starting points — your
                planner will refine them, but this is enough to share with
                family and vendors right now.
              </p>

              <div className={styles.timelineActions}>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={copyText}
                >
                  {copied ? "copied!" : "↪ copy as text"}
                </button>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={handlePrint}
                >
                  🖨 print timeline
                </button>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => setState((s) => ({ ...s, step: "arrange" }))}
                >
                  ← edit arrangement
                </button>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={reset}
                >
                  start over
                </button>
              </div>
            </div>

            <div className={styles.timelinePages}>
              {[0, 1, 2].map((d) => {
                const events = state.days[d];
                if (events.length === 0) return null;
                return (
                  <div className={styles.dayPage} key={d}>
                    <div className={styles.dayHeader}>
                      <span className={styles.dayKicker}>Day {d + 1}</span>
                      <span className={styles.dayHours}>
                        {dayHours(events).toFixed(1)} hrs total
                      </span>
                    </div>
                    {events.map((id) => {
                      const def = EVENT_BY_ID[id];
                      return (
                        <div className={styles.eventBlock} key={id}>
                          <div className={styles.eventBlockHeader}>
                            <h3 className={styles.eventBlockTitle}>
                              {def.name}
                            </h3>
                            <span className={styles.eventBlockMeta}>
                              {def.blurb}
                            </span>
                          </div>
                          <ol className={styles.skeletonList}>
                            {def.skeleton.map((row) => (
                              <li key={row.time} className={styles.skeletonRow}>
                                <span className={styles.skeletonTime}>
                                  {row.time}
                                </span>
                                <span className={styles.skeletonLine}>
                                  {row.line}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <p className={styles.softCta}>
              Save your timeline and build your full vendor checklist →{" "}
              <Link href="/signup?from=timeline-builder">
                Create free Marigold account
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function DayColumn({
  dayIndex,
  eventIds,
}: {
  dayIndex: number;
  eventIds: EventId[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `day-${dayIndex}` });
  const total = dayHours(eventIds);
  const overflow = total > 10;
  return (
    <div
      ref={setNodeRef}
      className={[
        styles.dayCol,
        isOver ? styles.dayColOver : "",
        overflow ? styles.dayColOverflow : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.dayColHeader}>
        <span className={styles.dayColLabel}>Day {dayIndex + 1}</span>
        <span className={styles.dayColHours}>
          {total > 0 ? `${total.toFixed(1)} hrs` : "—"}
        </span>
      </div>

      <div className={styles.dayColBody}>
        {eventIds.length === 0 ? (
          <div className={styles.empty}>drop events here</div>
        ) : (
          eventIds.map((id) => (
            <DraggableChip key={id} def={EVENT_BY_ID[id]} />
          ))
        )}
      </div>

      {overflow && (
        <div className={styles.warn}>
          Long day ahead — consider splitting one event.
        </div>
      )}
    </div>
  );
}

function DraggableChip({ def }: { def: EventDef }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: def.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      className={[styles.chip, isDragging ? styles.chipDragging : ""]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...attributes}
      {...listeners}
    >
      <span className={styles.chipName}>{def.name}</span>
      <span className={styles.chipMeta}>{def.blurb}</span>
    </div>
  );
}
