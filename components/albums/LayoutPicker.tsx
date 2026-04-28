"use client";

// Layout picker shown beneath the editor's top bar. Categories filter the
// grid; the selected category's templates render as aspect-correct thumbnails
// (2:1 to match a spread). Clicking a layout re-applies it to the current
// spread, preserving as many photo assignments as possible.

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LAYOUT_CATEGORIES, LAYOUT_TEMPLATES } from "@/lib/album-layouts";
import type { LayoutCategory } from "@/types/album";

interface LayoutPickerProps {
  currentLayoutId: string;
  onSelect: (layoutId: string) => void;
}

export function LayoutPicker({ currentLayoutId, onSelect }: LayoutPickerProps) {
  const [category, setCategory] = useState<LayoutCategory | "all">("all");
  const templates = LAYOUT_TEMPLATES.filter((t) => category === "all" || t.category === category);

  return (
    <div className="flex items-center gap-4 overflow-x-auto border-b border-border bg-ivory-warm/40 px-4 py-3">
      <div className="flex shrink-0 flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">Layout</span>
        <div className="flex gap-1">
          {LAYOUT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "rounded-full px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider transition-colors",
                category === cat.id
                  ? "bg-ink text-ivory"
                  : "bg-white text-ink-muted hover:bg-ivory-warm",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {templates.map((layout) => {
          const isActive = layout.id === currentLayoutId;
          return (
            <button
              key={layout.id}
              onClick={() => onSelect(layout.id)}
              className="group flex flex-col items-center"
              title={layout.description}
            >
              {/* 2:1 aspect to match a spread — 80×40px */}
              <div
                className={cn(
                  "relative h-10 w-20 overflow-hidden rounded border bg-white transition-all",
                  isActive ? "border-gold ring-1 ring-gold/30" : "border-border hover:border-ink-faint",
                )}
              >
                {layout.frames.map((f, i) => (
                  <div
                    key={`f-${i}`}
                    className="absolute bg-ink/20"
                    style={{
                      left: `${f.x * 100}%`,
                      top: `${f.y * 100}%`,
                      width: `${f.w * 100}%`,
                      height: `${f.h * 100}%`,
                      transform: layout.frameRotations?.[i] ? `rotate(${layout.frameRotations[i]}deg)` : undefined,
                    }}
                  />
                ))}
                {(layout.textFrames ?? []).map((f, i) => (
                  <div
                    key={`t-${i}`}
                    className="absolute bg-saffron/40"
                    style={{
                      left: `${f.x * 100}%`,
                      top: `${f.y * 100}%`,
                      width: `${f.w * 100}%`,
                      height: `${f.h * 100}%`,
                    }}
                  />
                ))}
                {/* Spine marker */}
                <div className="pointer-events-none absolute top-0 h-full w-px bg-ink/15" style={{ left: "50%" }} />
              </div>
              <span
                className={cn(
                  "mt-1 whitespace-nowrap text-[9.5px] leading-tight",
                  isActive ? "text-ink" : "text-ink-muted",
                )}
              >
                {layout.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
