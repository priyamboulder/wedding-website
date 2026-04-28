"use client";

// ── DragDropZone ────────────────────────────────────────────────────────────
// Drag-and-drop file upload wrapper. Reveals a drop target while files are
// being dragged over. Also supports clipboard paste. The rendered child is
// the drop surface — usually a tile grid, list, or a dashed prompt.
//
// Use onDropFiles for file uploads; onDropUrls for URL-only surfaces like
// the moodboard (which also accepts image URLs). Can enable both at once.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface DragDropZoneProps {
  onDropFiles?: (files: File[]) => void;
  onDropUrls?: (urls: string[]) => void;
  // Listen for paste events on the whole document while mounted. Default false
  // (opt-in per zone so we don't capture every paste app-wide).
  acceptClipboardPaste?: boolean;
  overlayLabel?: string;           // default "Drop to upload"
  className?: string;
  children: ReactNode;
}

export function DragDropZone({
  onDropFiles,
  onDropUrls,
  acceptClipboardPaste = false,
  overlayLabel = "Drop to upload",
  className,
  children,
}: DragDropZoneProps) {
  const [over, setOver] = useState(false);
  const dragCounter = useRef(0);

  function handleEnter(e: DragEvent) {
    e.preventDefault();
    dragCounter.current++;
    setOver(true);
  }
  function handleLeave(e: DragEvent) {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setOver(false);
    }
  }
  function handleOver(e: DragEvent) {
    e.preventDefault();
  }
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setOver(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length && onDropFiles) {
      onDropFiles(files);
      return;
    }
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (url && onDropUrls) {
      const urls = url.split(/\r?\n/).filter((l) => l.startsWith("http"));
      if (urls.length) onDropUrls(urls);
    }
  }

  // Clipboard paste support. Listens while mounted when opted-in.
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const files: File[] = [];
      for (const it of items) {
        if (it.kind === "file") {
          const f = it.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length && onDropFiles) {
        onDropFiles(files);
        return;
      }
      const text = e.clipboardData?.getData("text/plain") ?? "";
      if (/^https?:\/\//i.test(text.trim()) && onDropUrls) {
        onDropUrls([text.trim()]);
      }
    },
    [onDropFiles, onDropUrls],
  );

  useEffect(() => {
    if (!acceptClipboardPaste) return;
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [acceptClipboardPaste, handlePaste]);

  return (
    <div
      onDragEnter={handleEnter}
      onDragLeave={handleLeave}
      onDragOver={handleOver}
      onDrop={handleDrop}
      className={cn("relative", className)}
    >
      {children}
      {over && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-md border-2 border-dashed border-saffron bg-saffron-pale/40 backdrop-blur-[1px]">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {overlayLabel}
          </span>
        </div>
      )}
    </div>
  );
}
