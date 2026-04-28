"use client";

// ── UndoToast ───────────────────────────────────────────────────────────────
// Lightweight toast stack with undo action. No external deps — uses a simple
// event-emitter pattern so any component can push a toast without prop
// drilling.
//
// Usage:
//   pushUndo({ message: "Removed from shortlist", undo: () => restore(id) });
//
// Render <UndoToastHost /> once near the root of the Photography workspace.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Undo2, X } from "lucide-react";

interface UndoToastEntry {
  id: string;
  message: string;
  undo?: () => void;
  timeout_ms?: number;        // default 6000
}

type Listener = (list: UndoToastEntry[]) => void;

const entries: UndoToastEntry[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function notify() {
  for (const l of listeners) l([...entries]);
}

function schedule(id: string, ms: number) {
  const t = setTimeout(() => {
    dismiss(id);
  }, ms);
  timers.set(id, t);
}

export function pushUndo(entry: Omit<UndoToastEntry, "id">) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const full: UndoToastEntry = { id, ...entry };
  entries.push(full);
  schedule(id, entry.timeout_ms ?? 6000);
  notify();
  return id;
}

export function dismiss(id: string) {
  const t = timers.get(id);
  if (t) clearTimeout(t);
  timers.delete(id);
  const idx = entries.findIndex((e) => e.id === id);
  if (idx >= 0) {
    entries.splice(idx, 1);
    notify();
  }
}

// ── Host ────────────────────────────────────────────────────────────────────

export function UndoToastHost() {
  const [list, setList] = useState<UndoToastEntry[]>([]);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    listeners.add(setList);
    setList([...entries]);
    return () => {
      mounted.current = false;
      listeners.delete(setList);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {list.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="pointer-events-auto flex items-center gap-3 rounded-md border border-ink/30 bg-ink px-4 py-2 text-[12.5px] text-ivory shadow-[0_6px_20px_rgba(26,26,26,0.18)]"
          >
            <span>{t.message}</span>
            {t.undo && (
              <button
                type="button"
                onClick={() => {
                  t.undo?.();
                  dismiss(t.id);
                }}
                className="flex items-center gap-1 rounded-sm border border-ivory/40 px-2 py-0.5 text-[11px] font-medium text-ivory transition-colors hover:bg-ivory/10"
              >
                <Undo2 size={11} strokeWidth={2} />
                Undo
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-ivory/60 hover:text-ivory"
              aria-label="Dismiss"
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
