"use client";

// ── Palette workbench (Coolors-style) ──────────────────────────────────────
// Layer 2 of the per-event palette section. Takes the currently-selected
// palette (curated or custom) as input, renders each swatch with per-swatch
// lock / swap / copy controls, and exposes "Regenerate unlocked",
// "+ Add swatch", and "Save palette (rename)" actions.
//
// State ownership lives in the parent — the parent holds the working
// swatch array + locked-position set and persists them through the
// events-store setters. This component is a controlled view.

import { useState } from "react";
import {
  Copy,
  Lock,
  LockOpen,
  Plus,
  RefreshCw,
  Replace,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaletteSwatch } from "@/types/events";
import { SwatchSwapDrawer } from "./SwatchSwapDrawer";

const MAX_SWATCHES = 7;

interface Props {
  paletteName: string;
  swatches: PaletteSwatch[];
  lockedPositions: number[];
  onToggleLock: (position: number) => void;
  onReplaceAt: (position: number, entry: { hex: string; name: string }) => void;
  onRegenerate: () => void;
  onAddSwatch: () => void;
  onRenamePalette: (name: string) => void;
  paletteCustomName: string | null;
  // Rough bias shown to the drawer ("warm"/"cool") — not required but nice
  // to know which role of the library gets featured first.
  regenerating?: boolean;
}

export function PaletteWorkbench({
  paletteName,
  swatches,
  lockedPositions,
  onToggleLock,
  onReplaceAt,
  onRegenerate,
  onAddSwatch,
  onRenamePalette,
  paletteCustomName,
  regenerating,
}: Props) {
  const [swapTarget, setSwapTarget] = useState<number | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(paletteCustomName ?? "");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const lockedSet = new Set(lockedPositions);
  const displayName = paletteCustomName?.trim() || paletteName;

  function handleCopy(hex: string, index: number) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(hex).catch(() => {});
    }
    setCopiedIndex(index);
    window.setTimeout(() => {
      setCopiedIndex((i) => (i === index ? null : i));
    }, 1200);
  }

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Selected palette
        </p>
        {renaming ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRenamePalette(nameDraft.trim());
                  setRenaming(false);
                }
                if (e.key === "Escape") setRenaming(false);
              }}
              className="border border-border bg-white px-2 py-1 font-serif text-[15px] text-ink outline-none focus:border-ink/60"
            />
            <button
              type="button"
              onClick={() => {
                onRenamePalette(nameDraft.trim());
                setRenaming(false);
              }}
              className="bg-ink px-2.5 py-1 text-[11px] font-medium text-white hover:opacity-90"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameDraft(paletteCustomName ?? "");
              setRenaming(true);
            }}
            className="font-serif text-[16px] leading-tight text-ink underline-offset-2 hover:underline"
          >
            {displayName}
          </button>
        )}
      </div>

      <ul
        className="mt-3 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${swatches.length}, minmax(0, 1fr))`,
        }}
      >
        {swatches.map((swatch, index) => {
          const locked = lockedSet.has(index);
          const isCopied = copiedIndex === index;
          return (
            <li key={`${swatch.hex}-${index}`}>
              <div className="group relative flex flex-col border border-border bg-white">
                <div
                  className="relative h-24 w-full"
                  style={{ backgroundColor: swatch.hex }}
                >
                  <div className="absolute inset-x-1 top-1 flex items-start justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleLock(index)}
                      aria-pressed={locked}
                      aria-label={locked ? "Unlock swatch" : "Lock swatch"}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center transition-colors",
                        locked
                          ? "bg-ink text-white"
                          : "bg-white/80 text-ink opacity-0 group-hover:opacity-100 hover:bg-ink hover:text-white",
                      )}
                    >
                      {locked ? (
                        <Lock size={11} strokeWidth={2} />
                      ) : (
                        <LockOpen size={11} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                  <div className="absolute inset-x-1 bottom-1 flex items-end justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setSwapTarget(index)}
                      aria-label="Swap color"
                      className="flex h-6 w-6 items-center justify-center bg-white/90 text-ink hover:bg-ink hover:text-white"
                    >
                      <Replace size={11} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(swatch.hex, index)}
                      aria-label="Copy hex"
                      className="flex h-6 w-6 items-center justify-center bg-white/90 text-ink hover:bg-ink hover:text-white"
                    >
                      <Copy size={11} strokeWidth={2} />
                    </button>
                  </div>
                  {isCopied && (
                    <span
                      className="absolute inset-x-0 bottom-0 bg-ink px-1 py-0.5 text-center font-mono text-[9px] uppercase tracking-widest text-white"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Copied
                    </span>
                  )}
                </div>
                <div className="border-t border-border px-2 py-2">
                  <p
                    className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {swatch.hex}
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-tight text-ink">
                    {swatch.name}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ToolbarButton onClick={onRegenerate} tone="primary" disabled={regenerating}>
          <RefreshCw size={11} strokeWidth={2} />
          Regenerate unlocked
        </ToolbarButton>
        <ToolbarButton
          onClick={onAddSwatch}
          tone="ghost"
          disabled={swatches.length >= MAX_SWATCHES}
        >
          <Plus size={11} strokeWidth={2} />
          Add swatch
        </ToolbarButton>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {lockedPositions.length} / {swatches.length} locked
        </p>
      </div>

      <SwatchSwapDrawer
        open={swapTarget !== null}
        onClose={() => setSwapTarget(null)}
        onPick={(entry) => {
          if (swapTarget !== null) onReplaceAt(swapTarget, entry);
          setSwapTarget(null);
        }}
        usedHexes={swatches.map((s) => s.hex)}
      />
    </section>
  );
}

function ToolbarButton({
  children,
  onClick,
  tone,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: "primary" | "ghost";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 text-[11.5px] font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40",
        tone === "primary" && "bg-ink text-white hover:opacity-90",
        tone === "ghost" && "border border-border bg-white text-ink-muted hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
