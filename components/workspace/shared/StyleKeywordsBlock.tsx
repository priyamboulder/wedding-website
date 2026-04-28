"use client";

// ── Style keywords block ──────────────────────────────────────────────────
// Tappable chip list with "+ add your own" free-text entry. Shared across
// workspaces so a vibe chip feels the same in Photography, Events, and
// Mehendi. Chip geometry mirrors the Photography Pill (rounded-full,
// filled=ink/ivory, unfilled=dashed hint) so all surfaces read as one system.

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title?: string;
  hint?: string;
  eyebrow?: string;
  suggestions: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  // "card" (default) renders the internal title/hint header.
  // "flat" drops the header so the caller can render its own SectionHead.
  variant?: "card" | "flat";
}

export function StyleKeywordsBlock({
  title = "Style keywords",
  hint = "Tap the ones that feel right. Add your own.",
  eyebrow = "Style language",
  suggestions,
  selected,
  onChange,
  variant = "card",
}: Props) {
  const [draft, setDraft] = useState("");
  // Defensive — persisted records from pre-migration versions may pass
  // `undefined` here. Keep the primitive safe for every caller.
  const safeSelected = Array.isArray(selected) ? selected : [];

  function toggle(k: string) {
    onChange(
      safeSelected.includes(k) ? safeSelected.filter((s) => s !== k) : [...safeSelected, k],
    );
  }

  function submitDraft(e: React.FormEvent) {
    e.preventDefault();
    const v = draft.trim();
    if (v && !safeSelected.includes(v)) onChange([...safeSelected, v]);
    setDraft("");
  }

  const unpicked = suggestions.filter((s) => !safeSelected.includes(s));

  return (
    <section>
      {variant === "card" && (
        <header className="mb-[18px] border-b border-ink/[0.04] pb-2.5">
          {eyebrow && (
            <p
              className="m-0 text-[10px] font-medium uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {eyebrow}
            </p>
          )}
          <h3
            className="mt-1.5 text-[22px] font-bold leading-[1.15] text-ink"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.005em",
            }}
          >
            {title}
          </h3>
          <p className="mt-1.5 max-w-[52rem] text-[13.5px] leading-[1.5] text-ink-muted">
            {hint}
          </p>
        </header>
      )}

      {safeSelected.length > 0 && (
        <div className="mb-3.5 flex flex-wrap gap-2">
          {safeSelected.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold bg-ink py-1 pl-3 pr-1.5 text-[12px] text-ivory"
            >
              {k}
              <button
                type="button"
                onClick={() => toggle(k)}
                aria-label={`Remove ${k}`}
                className="rounded-full p-0.5 text-gold-pale/80 transition-colors hover:text-ivory"
              >
                <X size={12} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        className={cn(
          "flex flex-wrap gap-2",
          safeSelected.length > 0 && "border-t border-ink/5 pt-3.5",
        )}
      >
        {unpicked.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => toggle(k)}
            className="inline-flex items-center rounded-full border border-border bg-transparent px-3 py-1 text-[12px] text-ink-soft transition-colors hover:border-gold/60 hover:text-ink"
          >
            + {k}
          </button>
        ))}
        <form onSubmit={submitDraft} className="inline-flex">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="+ add your own"
            className="min-w-[140px] rounded-full border border-dashed border-border bg-transparent px-3 py-1 text-[12px] text-ink-soft outline-none transition-colors focus:border-gold/60"
          />
        </form>
      </div>
    </section>
  );
}
