"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/checklist";
import { Avatar } from "./Avatar";

export function AssignPopover({
  members,
  assigneeIds,
  onToggle,
  onClose,
  anchorRef,
}: {
  members: Member[];
  assigneeIds: string[];
  onToggle: (memberId: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const [query, setQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Position below the anchor element
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const estWidth = 280;
    const margin = 8;
    let left = rect.right - estWidth;
    if (left < margin) left = margin;
    if (left + estWidth > window.innerWidth - margin) {
      left = window.innerWidth - estWidth - margin;
    }
    setPosition({ top: rect.bottom + 6, left });
  }, [anchorRef]);

  // Outside click / escape
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !(anchorRef.current?.contains(e.target as Node) ?? false)
      ) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // Delay mouse handler for the click that opened us
    const t = setTimeout(() => {
      document.addEventListener("mousedown", handleMouse);
    }, 0);
    document.addEventListener("keydown", handleKey);
    inputRef.current?.focus();
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleMouse);
      document.removeEventListener("keydown", handleKey);
    };
  }, [anchorRef, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }, [members, query]);

  if (!position) return null;

  const assignedSet = new Set(assigneeIds);

  return (
    <motion.div
      ref={popoverRef}
      role="dialog"
      aria-label="Assign members"
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
      className="fixed z-50 w-[280px] overflow-hidden rounded-xl border border-border bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      style={{ top: position.top, left: position.left }}
    >
      {/* Search */}
      <div className="relative border-b border-border">
        <Search
          size={12}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search members…"
          className="w-full bg-transparent py-2.5 pl-8 pr-3 text-[12px] text-ink placeholder:text-ink-faint/60 outline-none"
        />
      </div>

      {/* List */}
      <div className="sidebar-scroll max-h-64 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <div className="px-4 py-4 text-center text-[12px] text-ink-faint italic">
            No members match
          </div>
        ) : (
          filtered.map((m) => {
            const isAssigned = assignedSet.has(m.id);
            return (
              <button
                key={m.id}
                onClick={() => onToggle(m.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                  "hover:bg-ivory-warm/60",
                )}
              >
                <Avatar member={m} size={22} showTooltip={false} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-ink">
                    {m.name}
                  </div>
                  <div className="truncate text-[11px] text-ink-faint">
                    {m.email}
                  </div>
                </div>
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                    isAssigned
                      ? "border-gold bg-gold text-white"
                      : "border-ink-faint/30",
                  )}
                >
                  {isAssigned && <Check size={10} strokeWidth={2.5} />}
                </span>
              </button>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
