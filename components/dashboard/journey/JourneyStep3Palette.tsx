"use client";

// ── Journey Step 3 · Find your palette ──────────────────────────────────
//
// Two paths:
//   Mood-first (default) — pick one of 8 curated mood/aesthetic cards;
//                          its 5-color palette becomes the wedding palette.
//   Color-first         — build a custom 5-color palette from swatches.
//
// The selected mood id is stored in the journey store; the colors are
// also written to coupleContext via setHeroPalette so the rest of the
// app picks them up.

import { useState } from "react";
import { Check, Palette as PaletteIcon, Sparkles } from "lucide-react";
import { JOURNEY_MOODS, moodById } from "@/lib/journey/mood-palettes";
import { useDashboardJourneyStore } from "@/stores/dashboard-journey-store";
import { cn } from "@/lib/utils";

interface Step3Props {
  done: boolean;
  active: boolean;
}

type Mode = "mood" | "color";

// A small, friendly palette of swatches the couple can drag into a
// custom 5-color palette. Curated to span the moods.
const SWATCH_LIBRARY: { hex: string; name: string }[] = [
  { hex: "#D4A5A5", name: "Dusty Blush" },
  { hex: "#E8D5D0", name: "Soft Rose" },
  { hex: "#9CAF88", name: "Sage" },
  { hex: "#C67D5B", name: "Terracotta" },
  { hex: "#D4A053", name: "Marigold" },
  { hex: "#5C1A2B", name: "Burgundy" },
  { hex: "#1F4D3F", name: "Emerald" },
  { hex: "#2A3F6E", name: "Sapphire" },
  { hex: "#C9A96E", name: "Gold" },
  { hex: "#FBF9F4", name: "Ivory" },
  { hex: "#1A1A1A", name: "Ink" },
  { hex: "#C8B4DD", name: "Lavender" },
  { hex: "#BFD3E6", name: "Sky" },
  { hex: "#E63573", name: "Hot Pink" },
  { hex: "#1F2A4A", name: "Navy" },
  { hex: "#7A8A6A", name: "Olive" },
];

export function JourneyStep3Palette({ done, active }: Step3Props) {
  const selectedMoodId = useDashboardJourneyStore((s) => s.selectedMoodId);
  const customPalette = useDashboardJourneyStore((s) => s.customPalette);
  const setSelectedMood = useDashboardJourneyStore((s) => s.setSelectedMood);
  const setCustomPalette = useDashboardJourneyStore((s) => s.setCustomPalette);

  const [mode, setMode] = useState<Mode>("mood");

  const mood = moodById(selectedMoodId);

  // Done collapsed — show the chosen palette as a row of swatches
  if (done && !active) {
    const colors = mood?.colors.map((c) => c.hex) ?? customPalette ?? [];
    return (
      <div className="flex items-center gap-3">
        <div className="flex">
          {colors.map((hex) => (
            <span
              key={hex}
              aria-hidden
              style={{ backgroundColor: hex }}
              className="-ml-1 h-6 w-6 rounded-full border-2 border-[color:var(--dash-canvas)] shadow-[0_1px_2px_rgba(212,165,165,0.18)] first:ml-0"
            />
          ))}
        </div>
        <p className="text-[13.5px] text-[color:var(--dash-text)]">
          {mood?.name ?? "Custom palette"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p
        className="font-serif text-[15px] italic leading-relaxed text-[color:var(--dash-text-muted)]"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      >
        What does your wedding look like? Start with a feeling — we&apos;ll
        find the colors. Or build your own.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("mood")}
          className={cn(
            "rounded-[4px] px-3 py-1.5 text-[12px] font-medium transition-colors",
            mode === "mood"
              ? "bg-[color:var(--dash-blush)] text-white"
              : "bg-[color:var(--dash-canvas)] text-[color:var(--dash-text)] border border-[color:var(--dash-blush-soft)] hover:border-[color:var(--dash-blush)]",
          )}
        >
          <Sparkles size={11} className="mr-1 inline" strokeWidth={1.8} />
          Mood-first
        </button>
        <button
          type="button"
          onClick={() => setMode("color")}
          className={cn(
            "rounded-[4px] px-3 py-1.5 text-[12px] font-medium transition-colors",
            mode === "color"
              ? "bg-[color:var(--dash-blush)] text-white"
              : "bg-[color:var(--dash-canvas)] text-[color:var(--dash-text)] border border-[color:var(--dash-blush-soft)] hover:border-[color:var(--dash-blush)]",
          )}
        >
          <PaletteIcon size={11} className="mr-1 inline" strokeWidth={1.8} />
          Build your own
        </button>
      </div>

      {mode === "mood" ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {JOURNEY_MOODS.map((m) => {
              const isSelected = selectedMoodId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMood(m.id)}
                  title={m.blurb}
                  className={cn(
                    "group flex flex-col gap-1.5 rounded-[5px] border p-2 text-left transition-colors",
                    isSelected
                      ? "border-[color:var(--dash-blush)] bg-[color:var(--dash-blush-light)]"
                      : "border-[color:var(--dash-blush-soft)] bg-[color:var(--dash-canvas)] hover:border-[color:var(--dash-blush)]",
                  )}
                >
                  <div className="flex h-7 overflow-hidden rounded-[2px]">
                    {m.colors.map((c) => (
                      <span
                        key={c.hex}
                        aria-hidden
                        style={{ backgroundColor: c.hex }}
                        className="flex-1"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className="truncate font-serif text-[12.5px] leading-tight text-[color:var(--dash-text)]"
                      style={{
                        fontFamily:
                          "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                        fontWeight: 500,
                      }}
                    >
                      {m.name}
                    </h4>
                    {isSelected && (
                      <Check
                        size={11}
                        strokeWidth={2.4}
                        className="shrink-0 text-[color:var(--dash-blush-deep)]"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {mood && (
            <p className="-mt-2 text-[11.5px] italic text-[color:var(--dash-text-muted)]">
              {mood.blurb}
            </p>
          )}
        </>
      ) : (
        <ColorBuilder
          colors={customPalette ?? []}
          onChange={(next) =>
            setCustomPalette(next.length > 0 ? next : null)
          }
        />
      )}
    </div>
  );
}

function ColorBuilder({
  colors,
  onChange,
}: {
  colors: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (hex: string) => {
    if (colors.includes(hex)) onChange(colors.filter((c) => c !== hex));
    else if (colors.length < 5) onChange([...colors, hex]);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-[4px] border border-dashed border-[color:var(--dash-blush-soft)] bg-[color:var(--dash-blush-light)] p-3">
        <p
          className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-blush-deep)]"
          style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
        >
          Your palette ({colors.length} / 5)
        </p>
        {colors.length === 0 ? (
          <p className="mt-2 text-[12.5px] italic text-[color:var(--dash-text-muted)]">
            Tap up to 5 swatches below.
          </p>
        ) : (
          <div className="mt-2 flex">
            {colors.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => toggle(hex)}
                aria-label={`Remove ${hex}`}
                style={{ backgroundColor: hex }}
                className="-ml-1 h-9 w-9 rounded-full border-2 border-[color:var(--dash-canvas)] shadow-[0_1px_2px_rgba(212,165,165,0.2)] first:ml-0"
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <p
          className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
          style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
        >
          Swatches
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SWATCH_LIBRARY.map((s) => {
            const active = colors.includes(s.hex);
            return (
              <button
                key={s.hex}
                type="button"
                onClick={() => toggle(s.hex)}
                title={s.name}
                aria-label={s.name}
                style={{ backgroundColor: s.hex }}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition-transform",
                  active
                    ? "border-[color:var(--dash-blush-deep)] scale-110"
                    : "border-[color:var(--dash-canvas)] hover:scale-105",
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
