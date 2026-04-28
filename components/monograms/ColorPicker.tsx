"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface ColorSwatch {
  hex: string;
  label: string;
}

export const DEFAULT_MONOGRAM_COLORS: ColorSwatch[] = [
  { hex: "#1A1A1A", label: "Obsidian" },
  { hex: "#B8860B", label: "Burnished Gold" },
  { hex: "#D4A24C", label: "Royal Marigold" },
  { hex: "#C97B63", label: "Dusk Rose" },
  { hex: "#9E2B25", label: "Kumkum Red" },
  { hex: "#2F5D50", label: "Peacock Jade" },
  { hex: "#2B3A67", label: "Neelam Blue" },
  { hex: "#F5F1EA", label: "Ivory" },
];

export interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  swatches?: ColorSwatch[];
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  swatches = DEFAULT_MONOGRAM_COLORS,
  className,
}: ColorPickerProps) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const normalized = value.toLowerCase();
  const activeSwatch = swatches.find((s) => s.hex.toLowerCase() === normalized);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        {swatches.map((s) => {
          const active = s.hex.toLowerCase() === normalized;
          const isLight = s.hex.toLowerCase() === "#f5f1ea";
          return (
            <button
              key={s.hex}
              type="button"
              onClick={() => onChange(s.hex)}
              aria-label={`Use ${s.label}`}
              aria-pressed={active}
              title={s.label}
              className={cn(
                "h-6 w-6 rounded-full transition-all",
                active
                  ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory"
                  : "ring-1 ring-ink/15 hover:ring-ink/40",
                isLight && "border border-ink/10",
              )}
              style={{ background: s.hex }}
            />
          );
        })}
        <button
          type="button"
          onClick={() => pickerRef.current?.click()}
          aria-label="Pick custom color"
          title={activeSwatch ? "Custom color" : `Custom · ${value}`}
          className={cn(
            "relative h-6 w-6 overflow-hidden rounded-full transition-all",
            !activeSwatch
              ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory"
              : "ring-1 ring-ink/15 hover:ring-ink/40",
          )}
          style={{
            background: !activeSwatch
              ? value
              : "conic-gradient(from 0deg, #d4a24c, #c97b63, #9e2b25, #2f5d50, #2b3a67, #b8860b, #d4a24c)",
          }}
        />
        <input
          ref={pickerRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        <span>{activeSwatch?.label ?? "Custom"}</span>
        <span className="text-ink-faint">·</span>
        <span>{value.toUpperCase()}</span>
      </div>
    </div>
  );
}

export default ColorPicker;
