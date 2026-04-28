"use client";

// ── Name Change Checklist tab ─────────────────────────────────────────────
// Seed data is inserted on first open via ensureNameChangeSeeded. Users can
// cycle status (not_started → in_progress → done), mark items N/A, and add
// notes. Progress bar at the top excludes N/A items so the number reflects
// real remaining work.

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, MinusCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePostWeddingStore } from "@/stores/post-wedding-store";
import type {
  NameChangeCategory,
  NameChangeItem,
  NameChangeStatus,
} from "@/types/post-wedding";
import { NAME_CHANGE_CATEGORY_LABEL } from "@/types/post-wedding";
import {
  PillButton,
  ProgressBar,
  SecondaryButton,
  Section,
  TextArea,
  formatDate,
} from "../ui";

const CATEGORY_ORDER: NameChangeCategory[] = [
  "government",
  "financial",
  "employment",
  "personal",
];

const STATUS_FILTERS: { value: NameChangeStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "not_applicable", label: "N/A" },
];

export function NameChangeTab() {
  const ensureSeeded = usePostWeddingStore((s) => s.ensureNameChangeSeeded);
  const items = usePostWeddingStore((s) => s.nameChange);
  const nameChangeProgress = usePostWeddingStore((s) => s.nameChangeProgress);
  const [filter, setFilter] = useState<NameChangeStatus | "all">("all");

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  const { done, total } = nameChangeProgress();

  const filtered = useMemo(() => {
    if (filter === "all") {
      return items.filter((i) => i.status !== "not_applicable");
    }
    return items.filter((i) => i.status === filter);
  }, [items, filter]);

  const grouped = useMemo(() => {
    const map = new Map<NameChangeCategory, NameChangeItem[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const item of filtered) {
      const bucket = map.get(item.category);
      if (bucket) bucket.push(item);
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-5">
      <Section
        eyebrow="NAME CHANGE CHECKLIST"
        title="the unsexy part of getting married"
        description="— but future you will be glad you did it now. tap through at your own pace, mark items N/A if they don't apply."
      >
        <div className="space-y-3">
          <ProgressBar done={done} total={total} label="Progress" />
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="mr-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Filter —
            </span>
            {STATUS_FILTERS.map((f) => (
              <PillButton
                key={f.value}
                active={filter === f.value}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </PillButton>
            ))}
          </div>
        </div>
      </Section>

      {CATEGORY_ORDER.map((category) => {
        const rows = grouped.get(category) ?? [];
        if (rows.length === 0) return null;
        return (
          <div key={category} className="space-y-3">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {NAME_CHANGE_CATEGORY_LABEL[category]} — {rows.length}
            </p>
            <ul className="space-y-2" role="list">
              {rows.map((item) => (
                <li key={item.id}>
                  <NameChangeRow item={item} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function NameChangeRow({ item }: { item: NameChangeItem }) {
  const cycle = usePostWeddingStore((s) => s.cycleNameChangeStatus);
  const setStatus = usePostWeddingStore((s) => s.setNameChangeStatus);
  const setNotes = usePostWeddingStore((s) => s.setNameChangeNotes);
  const [expanded, setExpanded] = useState(false);
  const [notesDraft, setNotesDraft] = useState(item.notes);

  const icon = statusIcon(item.status);
  const isDone = item.status === "done";
  const isNa = item.status === "not_applicable";

  return (
    <div
      className={cn(
        "rounded-lg border bg-white transition-colors",
        isDone && "border-sage/40 bg-sage/5",
        isNa && "border-border/60 bg-ivory-warm/30 opacity-70",
        !isDone && !isNa && "border-border",
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          type="button"
          onClick={() => cycle(item.id)}
          aria-label={`Cycle status for ${item.label}`}
          className="mt-0.5 shrink-0 transition-transform hover:scale-110"
        >
          {icon}
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-start justify-between gap-3 text-left"
          >
            <div className="min-w-0">
              <p
                className={cn(
                  "font-medium text-[13.5px] text-ink",
                  isDone && "text-sage line-through",
                  isNa && "text-ink-muted line-through",
                )}
              >
                {item.label}
              </p>
              {!expanded && (
                <p className="mt-0.5 line-clamp-1 text-[12px] text-ink-muted">
                  {item.description}
                </p>
              )}
              {isDone && item.completedAt && (
                <p
                  className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-sage"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  done {formatDate(item.completedAt)}
                </p>
              )}
            </div>
          </button>

          {expanded && (
            <div className="mt-3 space-y-3">
              <p className="text-[12.5px] leading-relaxed text-ink-muted">
                {item.description}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Set status —
                </span>
                {(
                  [
                    "not_started",
                    "in_progress",
                    "done",
                    "not_applicable",
                  ] as NameChangeStatus[]
                ).map((s) => (
                  <PillButton
                    key={s}
                    active={item.status === s}
                    onClick={() => setStatus(item.id, s)}
                  >
                    {statusLabel(s)}
                  </PillButton>
                ))}
              </div>

              <div>
                <p
                  className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Notes
                </p>
                <TextArea
                  value={notesDraft}
                  onChange={setNotesDraft}
                  rows={2}
                  placeholder="e.g., submitted on Nov 30, tracking #A12345"
                />
                {notesDraft !== item.notes && (
                  <div className="mt-2">
                    <SecondaryButton
                      size="sm"
                      onClick={() => setNotes(item.id, notesDraft)}
                    >
                      Save notes
                    </SecondaryButton>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function statusIcon(status: NameChangeStatus) {
  switch (status) {
    case "done":
      return <CheckCircle2 size={18} strokeWidth={1.8} className="text-sage" />;
    case "in_progress":
      return <Play size={18} strokeWidth={1.8} className="text-saffron" />;
    case "not_applicable":
      return (
        <MinusCircle size={18} strokeWidth={1.8} className="text-ink-faint" />
      );
    default:
      return <Circle size={18} strokeWidth={1.6} className="text-ink-faint" />;
  }
}

function statusLabel(status: NameChangeStatus): string {
  return {
    not_started: "Not started",
    in_progress: "In progress",
    done: "Done",
    not_applicable: "N/A",
  }[status];
}
