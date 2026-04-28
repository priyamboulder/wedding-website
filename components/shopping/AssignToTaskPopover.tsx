"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Check, Link2Off } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChecklistItem, Phase } from "@/types/checklist";

/**
 * Shared popover for assigning one or many links to a task (or unassigning).
 * Used both by card hover menus and the bulk action bar.
 *
 * Caller provides the phases + items; component handles local search & picking.
 * On apply, calls `onAssign(taskId, module)` where either can be null:
 *  - (null, null)       → unassign everything
 *  - (null, moduleId)   → tag a module with no specific task
 *  - (taskId, moduleId) → full assignment (module auto-inferred from task)
 */
export function AssignToTaskPopover({
  phases,
  items,
  currentTaskId,
  currentModule,
  anchorClassName,
  onClose,
  onAssign,
  title = "Assign to task",
}: {
  phases: Phase[];
  items: ChecklistItem[];
  currentTaskId?: string | null;
  currentModule?: string | null;
  anchorClassName?: string;
  onClose: () => void;
  onAssign: (taskId: string | null, module: string | null) => void;
  title?: string;
}) {
  const [moduleId, setModuleId] = useState<string | null>(
    currentModule ?? null,
  );
  const [query, setQuery] = useState("");
  const [taskId, setTaskId] = useState<string | null>(currentTaskId ?? null);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const itemsForModule = useMemo(() => {
    if (!moduleId) return items;
    return items.filter((it) => it.phase_id === moduleId);
  }, [items, moduleId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return itemsForModule.slice(0, 80);
    return itemsForModule
      .filter((it) => fuzzyMatch(it.title.toLowerCase(), q))
      .slice(0, 80);
  }, [itemsForModule, query]);

  const phaseById = useMemo(() => {
    const m = new Map<string, Phase>();
    for (const p of phases) m.set(p.id, p);
    return m;
  }, [phases]);

  function pickTask(id: string) {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    // Auto-infer module from the task's phase
    setModuleId(it.phase_id);
    setTaskId(id);
    onAssign(id, it.phase_id);
    onClose();
  }

  function applyModuleOnly() {
    onAssign(null, moduleId);
    onClose();
  }

  function unassign() {
    onAssign(null, null);
    onClose();
  }

  return (
    <div
      ref={ref}
      className={cn(
        "popover-enter z-40 w-[320px] overflow-hidden rounded-lg border border-border bg-white shadow-[0_8px_32px_rgba(26,26,26,0.12)]",
        anchorClassName,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {title}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-0.5 text-ink-faint transition-colors hover:text-ink"
        >
          <X size={12} strokeWidth={1.8} />
        </button>
      </div>

      {/* Module dropdown */}
      <div className="flex flex-col gap-1.5 border-b border-border/60 px-3 py-2.5">
        <span className="text-[10px] uppercase tracking-wider text-ink-faint">
          Module
        </span>
        <select
          value={moduleId ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setModuleId(v === "" ? null : v);
            setTaskId(null);
          }}
          className="w-full rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink outline-none focus:border-gold"
        >
          <option value="">— Unassigned —</option>
          {phases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Task search */}
      <div className="flex flex-col gap-1.5 px-3 py-2.5">
        <span className="text-[10px] uppercase tracking-wider text-ink-faint">
          Task
        </span>
        <div className="relative">
          <Search
            size={12}
            strokeWidth={1.6}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              moduleId
                ? `Search in ${phaseById.get(moduleId)?.title ?? "module"}…`
                : "Search any task…"
            }
            className="w-full rounded-md border border-border bg-white py-1 pl-7 pr-2 text-[12px] text-ink outline-none focus:border-gold"
          />
        </div>
        <div className="sidebar-scroll mt-1 max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-2 py-3 text-center text-[11px] italic text-ink-faint">
              No matching tasks
            </div>
          ) : (
            filtered.map((it) => {
              const phase = phaseById.get(it.phase_id);
              const active = taskId === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => pickTask(it.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11.5px] transition-colors",
                    active
                      ? "bg-gold-pale/40 text-ink"
                      : "text-ink-soft hover:bg-ivory-warm",
                  )}
                >
                  <span className="flex-1 truncate">{it.title}</span>
                  {phase && (
                    <span className="shrink-0 text-[10px] uppercase tracking-wider text-ink-faint">
                      {phase.title}
                    </span>
                  )}
                  {active && (
                    <Check size={11} strokeWidth={2.2} className="text-saffron" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-ivory/40 px-3 py-2">
        <button
          onClick={unassign}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-rose transition-colors hover:bg-rose-pale/50"
        >
          <Link2Off size={11} strokeWidth={1.8} />
          Unassign
        </button>
        {moduleId && (
          <button
            onClick={applyModuleOnly}
            className="rounded-md border border-gold/30 bg-gold-pale/30 px-2.5 py-1 text-[11px] font-medium text-gold transition-colors hover:bg-gold-pale/50"
          >
            Tag module only
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Tiny fuzzy substring — every char of needle appears in order.
 * Good enough for task titles.
 */
function fuzzyMatch(hay: string, needle: string): boolean {
  if (hay.includes(needle)) return true;
  let i = 0;
  for (const ch of hay) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return false;
}
