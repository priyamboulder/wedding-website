"use client";

// ── Tweet-length text hot take ────────────────────────────────────────────
// Fallback for brides who don't want to record. 280 char cap, inline counter.

const MAX = 280;

export function TextHotTake({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const remaining = MAX - value.length;
  const warn = remaining < 40;
  const over = remaining < 0;
  return (
    <div className="space-y-1.5">
      <textarea
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          if (next.length <= MAX) onChange(next);
          else onChange(next.slice(0, MAX));
        }}
        placeholder="What's your one-line take?"
        rows={3}
        className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13.5px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none"
      />
      <p
        className="text-right font-mono text-[10px] uppercase tracking-[0.14em]"
        style={{
          fontFamily: "var(--font-mono)",
          color: over ? "var(--color-rose)" : warn ? "var(--color-saffron)" : "var(--color-ink-faint)",
        }}
      >
        {remaining} / {MAX}
      </p>
    </div>
  );
}
