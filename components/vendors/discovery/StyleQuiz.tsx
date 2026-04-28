"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StyleSignature, StyleAxis } from "@/types/vendor-discovery";
import {
  AXIS_POLES,
  QUIZ_QUESTIONS,
  STYLE_PRESETS,
  STYLE_PRESET_LABEL,
} from "@/lib/vendors/style-matching";

interface StyleQuizProps {
  initial: StyleSignature | null;
  onComplete: (sig: StyleSignature) => void;
  onCancel?: () => void;
}

export function StyleQuiz({ initial, onComplete, onCancel }: StyleQuizProps) {
  const [signature, setSignature] = useState<StyleSignature>(initial ?? {});

  function setAxis(axis: StyleAxis, value: number) {
    setSignature((s) => ({ ...s, [axis]: value }));
  }

  const complete = QUIZ_QUESTIONS.every((q) => q.axis in signature);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-2">
        <Sparkles size={16} strokeWidth={1.8} className="text-gold" />
        <h3 className="font-serif text-[18px] text-ink">Your style signature</h3>
      </header>

      {/* Quick presets */}
      <section className="flex flex-col gap-2">
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Start from a vibe
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(STYLE_PRESETS).map(([key, sig]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSignature(sig)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11.5px] transition-colors",
                isSameSignature(signature, sig)
                  ? "border-gold bg-gold-pale text-gold"
                  : "border-border bg-white text-ink-soft hover:border-gold/40 hover:bg-gold-pale/30",
              )}
            >
              {STYLE_PRESET_LABEL[key as keyof typeof STYLE_PRESET_LABEL]}
            </button>
          ))}
        </div>
      </section>

      {/* Axis sliders */}
      <section className="flex flex-col gap-5">
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Or fine-tune each axis
        </p>
        {QUIZ_QUESTIONS.map((q) => {
          const value = signature[q.axis];
          return (
            <div key={q.axis} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <label className="font-serif text-[14px] text-ink">
                  {q.prompt}
                </label>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-wider",
                    value !== undefined ? "text-gold" : "text-ink-faint",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {value === undefined ? "no pref" : formatValue(value)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-right text-[11px] text-ink-muted">
                  {AXIS_POLES[q.axis].minus}
                </span>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.1}
                  value={value ?? 0}
                  onChange={(e) => setAxis(q.axis, parseFloat(e.target.value))}
                  className="flex-1 accent-gold"
                />
                <span className="w-32 shrink-0 text-[11px] text-ink-muted">
                  {AXIS_POLES[q.axis].plus}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setSignature({})}
          className="flex items-center gap-1 text-[12px] text-ink-muted transition-colors hover:text-ink"
        >
          <RotateCcw size={12} strokeWidth={1.8} />
          Reset
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-[12px] text-ink-muted transition-colors hover:text-ink"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          disabled={!complete}
          onClick={() => onComplete(signature)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-5 py-2 text-[12.5px] transition-all",
            complete
              ? "bg-ink text-ivory hover:bg-ink-soft"
              : "bg-ivory-warm text-ink-faint cursor-not-allowed",
          )}
        >
          Save style
          <ArrowRight size={12} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function formatValue(v: number): string {
  if (Math.abs(v) < 0.1) return "balanced";
  const pct = Math.round(Math.abs(v) * 100);
  return v < 0 ? `${pct}% left` : `${pct}% right`;
}

function isSameSignature(a: StyleSignature, b: StyleSignature): boolean {
  const keys: Array<keyof StyleSignature> = ["tone", "era", "density", "scale", "palette"];
  return keys.every((k) => {
    const av = a[k];
    const bv = b[k];
    if (av === undefined || bv === undefined) return false;
    return Math.abs(av - bv) < 0.05;
  });
}
