"use client";

import type { SlideConfig } from "@/lib/social/types";

type Props = {
  slides: SlideConfig[];
  currentIndex: number;
  elapsedMs: number;
  totalMs: number;
  onJump: (slideIndex: number) => void;
};

export default function ReelTimeline({
  slides,
  currentIndex,
  elapsedMs,
  totalMs,
  onJump,
}: Props) {
  // Per-slide progress: how far into the current slide we are (0-1).
  let cumulative = 0;
  return (
    <div className="flex h-14 gap-1">
      {slides.map((slide, idx) => {
        const start = cumulative;
        const end = start + slide.duration_ms;
        cumulative = end;
        const isCurrent = idx === currentIndex;
        const isPast = elapsedMs >= end;
        const localProgress = isCurrent
          ? Math.min(1, Math.max(0, (elapsedMs - start) / slide.duration_ms))
          : isPast
            ? 1
            : 0;
        const widthPct = (slide.duration_ms / totalMs) * 100;
        return (
          <button
            key={slide.id}
            type="button"
            onClick={() => onJump(idx)}
            style={{ flexBasis: `${widthPct}%` }}
            className={`relative flex min-w-0 flex-col overflow-hidden rounded border text-left transition-colors ${
              isCurrent
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
            }`}
            title={`${slide.label} · ${(slide.duration_ms / 1000).toFixed(1)}s`}
          >
            <div
              className={`absolute inset-y-0 left-0 ${
                isCurrent ? "bg-white/20" : "bg-neutral-200"
              }`}
              style={{ width: `${localProgress * 100}%` }}
            />
            <div className="relative flex flex-1 flex-col justify-center px-2">
              <span className="truncate text-[10px] font-medium uppercase tracking-wider">
                {idx + 1}. {slide.label}
              </span>
              <span
                className={`truncate text-[10px] ${isCurrent ? "text-white/70" : "text-neutral-500"}`}
              >
                {(slide.duration_ms / 1000).toFixed(1)}s
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
