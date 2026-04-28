"use client";

// ── One word chip selector ────────────────────────────────────────────────
// Single-select. Grouped visually by sentiment (positive → neutral → negative)
// with a small gap between groups, but no sentiment labels — the grouping
// carries meaning on its own.

import { cn } from "@/lib/utils";
import { ONE_LOOK_WORDS } from "@/lib/one-look/words";
import type { OneLookSentiment } from "@/types/one-look";

const SENTIMENT_CHIP: Record<
  OneLookSentiment,
  { active: string; inactive: string }
> = {
  positive: {
    active: "border-gold bg-gold-pale/70 text-ink",
    inactive: "border-gold/25 bg-white text-ink hover:border-gold/60",
  },
  neutral: {
    active: "border-ink bg-ivory-warm text-ink",
    inactive: "border-border bg-white text-ink-muted hover:border-ink/40",
  },
  negative: {
    active: "border-rose bg-rose/10 text-rose",
    inactive: "border-rose/20 bg-white text-ink-muted hover:border-rose/50",
  },
};

export function OneWordChips({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (word: string) => void;
}) {
  const positive = ONE_LOOK_WORDS.filter((w) => w.sentiment === "positive");
  const neutral = ONE_LOOK_WORDS.filter((w) => w.sentiment === "neutral");
  const negative = ONE_LOOK_WORDS.filter((w) => w.sentiment === "negative");

  return (
    <div className="space-y-3">
      <Group words={positive} value={value} onChange={onChange} />
      <Group words={neutral} value={value} onChange={onChange} />
      <Group words={negative} value={value} onChange={onChange} />
    </div>
  );
}

function Group({
  words,
  value,
  onChange,
}: {
  words: typeof ONE_LOOK_WORDS;
  value: string | null;
  onChange: (w: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {words.map((w) => {
        const selected = value === w.word;
        const tone = SENTIMENT_CHIP[w.sentiment];
        return (
          <button
            key={w.id}
            type="button"
            onClick={() => onChange(w.word)}
            aria-pressed={selected}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
              selected ? tone.active : tone.inactive,
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {w.word}
          </button>
        );
      })}
    </div>
  );
}
