"use client";

// ── Swatch swap drawer ─────────────────────────────────────────────────────
// Right-side drawer that opens when the couple clicks "Swap" on a workbench
// swatch. Shows the curated wedding color library grouped by family, with
// a warmth filter and optional hex input for precise control.

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COLOR_FAMILY_ORDER,
  COLOR_LIBRARY,
  type ColorFamily,
  type ColorLibraryEntry,
  type ColorWarmth,
} from "@/lib/events/color-library";

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (entry: { hex: string; name: string }) => void;
  // Hex values already used in the palette — shown as "in use" badges to
  // prevent accidental duplicates.
  usedHexes?: string[];
}

const WARMTH_FILTERS: { id: ColorWarmth | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
  { id: "neutral", label: "Neutral" },
];

export function SwatchSwapDrawer({ open, onClose, onPick, usedHexes = [] }: Props) {
  const [warmth, setWarmth] = useState<ColorWarmth | "all">("all");
  const [family, setFamily] = useState<ColorFamily | "all">("all");
  const [hexInput, setHexInput] = useState("");

  const usedSet = useMemo(
    () => new Set(usedHexes.map((h) => h.toLowerCase())),
    [usedHexes],
  );

  const grouped = useMemo(() => {
    const byFamily = new Map<ColorFamily, ColorLibraryEntry[]>();
    for (const entry of COLOR_LIBRARY) {
      if (warmth !== "all" && entry.warmth !== warmth) continue;
      if (family !== "all" && entry.family !== family) continue;
      const bucket = byFamily.get(entry.family) ?? [];
      bucket.push(entry);
      byFamily.set(entry.family, bucket);
    }
    return COLOR_FAMILY_ORDER.map((f) => ({
      family: f,
      entries: byFamily.get(f.id) ?? [],
    })).filter((g) => g.entries.length > 0);
  }, [warmth, family]);

  function submitHex() {
    const trimmed = hexInput.trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(trimmed)) return;
    onPick({ hex: `#${trimmed.toUpperCase()}`, name: "Custom" });
    setHexInput("");
  }

  if (!open) return null;

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/20"
      />
      <aside
        role="dialog"
        aria-label="Swap color"
        className="fixed right-0 top-0 z-50 flex h-full w-[380px] max-w-[90vw] flex-col border-l border-border bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Swap color
            </p>
            <h3 className="mt-0.5 font-serif text-[18px] leading-tight text-ink">
              Wedding color library
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border border-border bg-white p-1.5 text-ink-muted hover:border-ink hover:text-ink"
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </header>

        <div className="border-b border-border px-5 py-3">
          <div
            className="flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {WARMTH_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setWarmth(f.id)}
                className={cn(
                  "border px-2.5 py-1 transition-colors",
                  warmth === f.id
                    ? "border-ink bg-ink text-white"
                    : "border-border bg-white text-ink-muted hover:border-ink/40",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div
            className="mt-2 flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <button
              type="button"
              onClick={() => setFamily("all")}
              className={cn(
                "border px-2.5 py-1 transition-colors",
                family === "all"
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-white text-ink-muted hover:border-ink/40",
              )}
            >
              Any family
            </button>
            {COLOR_FAMILY_ORDER.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFamily(f.id)}
                className={cn(
                  "border px-2.5 py-1 transition-colors",
                  family === f.id
                    ? "border-ink bg-ink text-white"
                    : "border-border bg-white text-ink-muted hover:border-ink/40",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="space-y-5">
            {grouped.map((group) => (
              <li key={group.family.id}>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {group.family.label}
                </p>
                <ul className="mt-2 grid grid-cols-4 gap-2">
                  {group.entries.map((entry) => {
                    const used = usedSet.has(entry.hex.toLowerCase());
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          onClick={() =>
                            onPick({ hex: entry.hex, name: entry.name })
                          }
                          className="group relative flex w-full flex-col items-stretch border border-border bg-white text-left transition-all hover:border-ink"
                          aria-label={`Use ${entry.name}`}
                        >
                          <span
                            aria-hidden
                            className="block h-10 w-full"
                            style={{ backgroundColor: entry.hex }}
                          />
                          <span className="px-1.5 py-1 text-[10px] leading-tight text-ink">
                            {entry.name}
                          </span>
                          {used && (
                            <span
                              className="absolute inset-x-1 top-1 bg-ink px-1 py-px text-center font-mono text-[8px] uppercase tracking-widest text-white"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              In use
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <footer className="border-t border-border px-5 py-3">
          <label
            className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Or enter a hex
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitHex();
                }
              }}
              placeholder="#8A1A2B"
              className="flex-1 border border-border bg-white px-2.5 py-1.5 font-mono text-[12px] text-ink outline-none transition-colors focus:border-ink/60"
              style={{ fontFamily: "var(--font-mono)" }}
            />
            <button
              type="button"
              onClick={submitHex}
              className="bg-ink px-3 py-1.5 text-[11.5px] font-medium text-white hover:opacity-90"
            >
              Use
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
