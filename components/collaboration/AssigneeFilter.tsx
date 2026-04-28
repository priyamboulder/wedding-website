"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/checklist";
import { Avatar } from "./Avatar";

export function AssigneeFilter({
  value,
  members,
  onChange,
}: {
  value: string | "all";
  members: Member[];
  onChange: (value: string | "all") => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const selected = value === "all" ? null : members.find((m) => m.id === value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-border bg-ivory py-1.5 pl-2.5 pr-2 text-[12px] text-ink-muted outline-none transition-colors",
          "hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20",
        )}
        aria-label="Filter by assignee"
        aria-expanded={open}
      >
        {selected ? (
          <Avatar member={selected} size={16} showTooltip={false} />
        ) : (
          <Users size={12} strokeWidth={1.5} className="text-ink-faint" />
        )}
        <span>{selected ? selected.name.split(" ")[0] : "Everyone"}</span>
        <ChevronDown
          size={11}
          strokeWidth={1.5}
          className={cn(
            "text-ink-faint transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
            className="absolute right-0 top-full z-30 mt-1 w-[220px] overflow-hidden rounded-lg border border-border bg-white py-1 shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
            role="listbox"
          >
            <button
              type="button"
              onClick={() => {
                onChange("all");
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-colors hover:bg-ivory-warm/60",
                value === "all" ? "text-ink" : "text-ink-muted",
              )}
              role="option"
              aria-selected={value === "all"}
            >
              <Users size={14} strokeWidth={1.5} className="text-ink-faint" />
              Everyone
            </button>
            <div className="my-1 h-px bg-border/60" />
            {members.length === 0 ? (
              <div className="px-3 py-2 text-[12px] text-ink-faint italic">
                No members yet
              </div>
            ) : (
              members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-ivory-warm/60",
                    value === m.id ? "bg-gold-pale/20" : "",
                  )}
                  role="option"
                  aria-selected={value === m.id}
                >
                  <Avatar member={m} size={20} showTooltip={false} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] text-ink">
                      {m.name}
                    </div>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
