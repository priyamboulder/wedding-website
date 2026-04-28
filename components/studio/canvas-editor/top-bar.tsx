"use client";

// ──────────────────────────────────────────────────────────────────────────
// Canvas editor — top bar
//
// Canvas size dropdown · zoom · undo/redo · preview · save · print/download.
// The "Order Print" button only renders for physical surface types; digital
// surfaces get a "Download PNG" button instead.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Undo2,
  Redo2,
  Plus,
  Minus,
  Eye,
  Save,
  Download,
  Printer,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanvasSize, SurfaceType } from "./types";
import { PHYSICAL_SURFACES } from "./types";

interface TopBarProps {
  surfaceType: SurfaceType;
  sizes: CanvasSize[];
  activeSizeId: string;
  onSizeChange: (size: CanvasSize) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  onSave: () => void;
  onOrderPrint?: () => void;
  onDownload: () => void;
  readOnly?: boolean;
}

export function TopBar({
  surfaceType,
  sizes,
  activeSizeId,
  onSizeChange,
  zoom,
  onZoomIn,
  onZoomOut,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview,
  onSave,
  onOrderPrint,
  onDownload,
  readOnly,
}: TopBarProps) {
  const [sizeOpen, setSizeOpen] = useState(false);
  const activeSize = sizes.find((s) => s.id === activeSizeId) ?? sizes[0];
  const isPhysical = PHYSICAL_SURFACES.includes(surfaceType);

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4"
      style={{ borderColor: "#E8E4DF", background: "#FDFBF7" }}
    >
      {/* Left — size dropdown */}
      <div className="relative">
        <button
          onClick={() => setSizeOpen((s) => !s)}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-1.5",
            "font-[family-name:'DM_Sans'] text-[12.5px] text-ink",
          )}
          style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
        >
          <span className="tabular-nums text-ink-muted">
            {activeSize ? `${activeSize.width} × ${activeSize.height}` : ""}
          </span>
          <span className="text-ink-faint">·</span>
          <span>{activeSize?.label ?? "Size"}</span>
          <ChevronDown size={13} className="text-ink-faint" />
        </button>
        {sizeOpen && (
          <div
            className="absolute left-0 top-full z-20 mt-1 w-72 overflow-hidden rounded-md border shadow-md"
            style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
          >
            {sizes.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onSizeChange(s);
                  setSizeOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[12.5px] hover:bg-ivory-warm/60",
                  s.id === activeSizeId ? "bg-gold-pale/30" : "",
                )}
              >
                <span className="text-ink">{s.label}</span>
                <span className="font-mono text-[11px] tabular-nums text-ink-faint">
                  {s.width} × {s.height}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center — zoom + undo/redo */}
      <div className="flex items-center gap-1.5">
        <IconButton onClick={onUndo} disabled={!canUndo || readOnly} label="Undo (⌘Z)">
          <Undo2 size={15} />
        </IconButton>
        <IconButton onClick={onRedo} disabled={!canRedo || readOnly} label="Redo (⌘⇧Z)">
          <Redo2 size={15} />
        </IconButton>
        <div className="mx-1 h-5 w-px" style={{ background: "#E8E4DF" }} />
        <IconButton onClick={onZoomOut} label="Zoom out">
          <Minus size={14} />
        </IconButton>
        <span className="w-12 text-center font-[family-name:'DM_Sans'] text-[11.5px] tabular-nums text-ink-muted">
          {Math.round(zoom * 100)}%
        </span>
        <IconButton onClick={onZoomIn} label="Zoom in">
          <Plus size={14} />
        </IconButton>
      </div>

      {/* Right — preview · save · order print / download */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-[family-name:'DM_Sans'] text-[12px] text-ink-muted hover:bg-ivory-warm/60"
          style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
        >
          <Eye size={13} /> Preview
        </button>
        {!readOnly && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-[family-name:'DM_Sans'] text-[12px] text-ink hover:bg-ivory-warm/60"
            style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
          >
            <Save size={13} /> Save draft
          </button>
        )}
        {isPhysical && onOrderPrint && !readOnly && (
          <button
            onClick={onOrderPrint}
            className="flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-[family-name:'DM_Sans'] text-[12px] font-medium text-ivory hover:opacity-90"
            style={{ background: "#1A1A1A" }}
          >
            <Printer size={13} /> Order print
          </button>
        )}
        {!isPhysical && (
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-[family-name:'DM_Sans'] text-[12px] font-medium text-ivory hover:opacity-90"
            style={{ background: "#1A1A1A" }}
          >
            <Download size={13} /> Download PNG
          </button>
        )}
      </div>
    </header>
  );
}

function IconButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:bg-ivory-warm/70 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
