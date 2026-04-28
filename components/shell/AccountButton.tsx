"use client";

import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/25 bg-ivory-warm text-ink transition-colors hover:border-gold/50 hover:bg-gold-pale/40 focus-visible:border-gold/60 focus-visible:outline-none"
      >
        <User size={14} strokeWidth={1.8} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-30 mt-2 w-36 overflow-hidden rounded-md border border-gold/20 bg-white shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block w-full px-3 py-2 text-left text-[12px] font-medium text-ink transition-colors hover:bg-ivory-warm"
          >
            Sign In
          </button>
          <div className="h-px bg-gold/10" aria-hidden />
          <button
            type="button"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block w-full px-3 py-2 text-left text-[12px] font-medium text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
