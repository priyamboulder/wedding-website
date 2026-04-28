"use client";

// ── Element Library Panel ──────────────────────────────────────────────
// Categorized "Add Element" flyout. Think Figma's components panel —
// click any element to place it on the canvas at room center (user
// repositions after).

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_META,
  ELEMENT_LIBRARY,
  type ElementCategory,
  type ElementDefinition,
} from "@/lib/floor-plan-library";
import { useSeatingStore } from "@/stores/seating-store";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ElementLibraryPanel({ open, onClose }: Props) {
  const addFixedElement = useSeatingStore((s) => s.addFixedElement);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<ElementCategory>("stage_performance");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return ELEMENT_LIBRARY.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        CATEGORY_META[e.category].label.toLowerCase().includes(q) ||
        (e.hint ?? "").toLowerCase().includes(q),
    );
  }, [query]);

  if (!open) return null;

  const handlePlace = (def: ElementDefinition) => {
    addFixedElement(def.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-ink/25 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mt-16 w-[760px] max-h-[78vh] overflow-hidden rounded-xl border border-border bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border bg-ivory/40 px-5 py-3">
          <div>
            <div className="font-serif text-[17px] text-ink">Add element</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Click any element to drop it at room center
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded text-ink-muted hover:bg-white hover:text-ink"
            title="Close"
          >
            <X size={14} strokeWidth={1.6} />
          </button>
        </header>

        {/* Search */}
        <div className="border-b border-border bg-white px-5 py-2.5">
          <div className="flex items-center gap-2 rounded-md border border-border bg-ivory/30 px-2.5 py-1.5">
            <Search size={12} strokeWidth={1.7} className="text-ink-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search elements — e.g. chaat, photo booth, dance floor"
              className="flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-faint"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-ink-faint hover:text-ink"
              >
                <X size={11} strokeWidth={1.7} />
              </button>
            )}
          </div>
        </div>

        <div className="flex max-h-[60vh]">
          {/* Category rail */}
          {!filtered && (
            <div className="w-[200px] flex-shrink-0 overflow-y-auto border-r border-border bg-ivory/20 py-3">
              {(Object.keys(CATEGORY_META) as ElementCategory[]).map((cat) => {
                const meta = CATEGORY_META[cat];
                const count = ELEMENT_LIBRARY.filter((e) => e.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActive(cat)}
                    className={cn(
                      "block w-full px-4 py-2 text-left transition",
                      active === cat
                        ? "bg-white text-ink shadow-sm"
                        : "text-ink-muted hover:bg-white/60 hover:text-ink",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: meta.tone }}
                      />
                      <span className="text-[12px]">{meta.label}</span>
                    </div>
                    <div className="mt-0.5 pl-4 font-mono text-[9.5px] text-ink-faint">
                      {count} elements
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Elements grid */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {filtered ? (
              filtered.length === 0 ? (
                <div className="py-10 text-center text-[12px] italic text-ink-faint">
                  No elements match &ldquo;{query}&rdquo;.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filtered.map((def) => (
                    <ElementCard key={def.id} def={def} onClick={() => handlePlace(def)} />
                  ))}
                </div>
              )
            ) : (
              <>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  {CATEGORY_META[active].label} — {CATEGORY_META[active].description}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ELEMENT_LIBRARY.filter((e) => e.category === active).map((def) => (
                    <ElementCard key={def.id} def={def} onClick={() => handlePlace(def)} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ElementCard({
  def,
  onClick,
}: {
  def: ElementDefinition;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-1.5 rounded-md border border-border bg-white px-3 py-2.5 text-left transition hover:border-ink/25 hover:shadow-sm"
    >
      <div
        className="h-8 w-full rounded"
        style={{
          backgroundColor: def.fill,
          border: `1px solid ${def.stroke}`,
        }}
      />
      <div className="text-[11.5px] font-medium text-ink">{def.name}</div>
      <div className="font-mono text-[9.5px] text-ink-faint">
        {def.defaultWidth} × {def.defaultHeight} ft
      </div>
      {def.hint && (
        <div className="line-clamp-2 text-[10px] leading-snug text-ink-muted">
          {def.hint}
        </div>
      )}
    </button>
  );
}
