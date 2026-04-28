"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, ChevronUp, X, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoppingStatus } from "@/lib/link-preview/types";

const STATUS_OPTIONS: { value: ShoppingStatus; label: string; dot: string }[] =
  [
    { value: "considering", label: "Considering", dot: "bg-ink/80" },
    { value: "ordered", label: "Ordered", dot: "bg-saffron" },
    { value: "received", label: "Received", dot: "bg-sage" },
    { value: "returned", label: "Returned", dot: "bg-rose" },
  ];

export function BulkActionBar({
  count,
  onClear,
  onSetStatus,
  onDelete,
  onExport,
  onAssign,
}: {
  count: number;
  onClear: () => void;
  onSetStatus: (s: ShoppingStatus) => void;
  onDelete: () => void;
  onExport: () => void;
  onAssign: () => void;
}) {
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusOpen) return;
    function handler(e: MouseEvent) {
      if (!statusRef.current?.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [statusOpen]);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-x-0 bottom-6 z-30 flex justify-center px-4"
        >
          <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-ink px-4 py-2 text-ivory shadow-[0_8px_24px_rgba(26,26,26,0.2)]">
            <button
              onClick={onClear}
              aria-label="Clear selection"
              className="rounded-full p-1 text-ivory/60 transition-colors hover:bg-ivory/10 hover:text-ivory"
            >
              <X size={14} strokeWidth={1.8} />
            </button>
            <span className="border-r border-ivory/15 pr-3 font-mono text-[11.5px] uppercase tracking-wider">
              {count} selected
            </span>

            <div ref={statusRef} className="relative">
              <button
                onClick={() => setStatusOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full bg-ivory/10 px-3 py-1 text-[11.5px] transition-colors hover:bg-ivory/15"
              >
                Set status
                <ChevronUp
                  size={11}
                  strokeWidth={1.8}
                  className={cn(
                    "transition-transform",
                    statusOpen && "rotate-180",
                  )}
                />
              </button>
              {statusOpen && (
                <div className="absolute bottom-full left-0 mb-2 min-w-[160px] overflow-hidden rounded-md border border-border bg-white text-ink shadow-lg">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => {
                        onSetStatus(s.value);
                        setStatusOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-ivory-warm"
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onAssign}
              className="flex items-center gap-1.5 rounded-full bg-ivory/10 px-3 py-1 text-[11.5px] transition-colors hover:bg-ivory/15"
            >
              <Link2 size={11} strokeWidth={1.8} />
              Assign to task…
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-1.5 rounded-full bg-ivory/10 px-3 py-1 text-[11.5px] transition-colors hover:bg-ivory/15"
            >
              <Download size={11} strokeWidth={1.8} />
              Export CSV
            </button>

            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-full bg-rose/80 px-3 py-1 text-[11.5px] transition-colors hover:bg-rose"
            >
              <Trash2 size={11} strokeWidth={1.8} />
              Delete
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
