"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MonogramExportFormat } from "@/lib/monogram-export";

export interface DownloadMenuProps {
  onDownload: (format: MonogramExportFormat) => Promise<void> | void;
  className?: string;
}

type Option = {
  key: MonogramExportFormat;
  label: string;
  hint: string;
};

const OPTIONS: Option[] = [
  { key: "svg", label: "SVG", hint: "Vector, scalable — best for designers" },
  { key: "png-transparent", label: "PNG", hint: "2048×2048 · transparent background" },
  { key: "png-ivory", label: "PNG", hint: "2048×2048 · ivory background (#F5F1EA)" },
  { key: "pdf", label: "PDF", hint: "Letter-size, centered, print-ready" },
];

export function DownloadMenu({ onDownload, className }: DownloadMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<MonogramExportFormat | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setFocusIdx(0);
      setTimeout(() => itemRefs.current[0]?.focus(), 0);
    }
  }, [open]);

  const run = async (format: MonogramExportFormat) => {
    if (busy) return;
    setBusy(format);
    try {
      await onDownload(format);
    } finally {
      setBusy(null);
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-ivory"
      >
        <Download className="h-3.5 w-3.5" strokeWidth={2} />
        Download
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Download format"
          className="absolute bottom-full left-0 right-0 z-10 mb-2 overflow-hidden rounded-md border border-ink/15 bg-ivory shadow-xl"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const next = (focusIdx + 1) % OPTIONS.length;
              setFocusIdx(next);
              itemRefs.current[next]?.focus();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              const prev = (focusIdx - 1 + OPTIONS.length) % OPTIONS.length;
              setFocusIdx(prev);
              itemRefs.current[prev]?.focus();
            }
          }}
        >
          {OPTIONS.map((opt, i) => {
            const isBusy = busy === opt.key;
            return (
              <button
                key={`${opt.key}-${i}`}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role="menuitem"
                onClick={() => run(opt.key)}
                disabled={busy !== null}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-ink/5 px-4 py-3 text-left transition-colors last:border-b-0 focus:bg-gold-pale/30 focus:outline-none hover:bg-gold-pale/30",
                  busy !== null && !isBusy && "opacity-40",
                )}
              >
                <div className="w-10 font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                  {opt.label}
                </div>
                <div className="flex-1 text-[12px] leading-snug text-ink-muted">
                  {opt.hint}
                </div>
                {isBusy && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-muted" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DownloadMenu;
