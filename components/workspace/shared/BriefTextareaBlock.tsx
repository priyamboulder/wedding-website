"use client";

// ── Brief textarea block ───────────────────────────────────────────────────
// Intro brief primitive used across workspaces.
//
// variant="card" (default) — keeps the rounded Photography-QuizCard-style
// chrome. Used by Mehndi, Decor, Stationery, and other callers that rely
// on the card look.
//
// variant="flat" — drops the outer card and internal header so the caller
// can render its own SectionHead above. Used by Events tabs to conform to
// Photography's flat SectionShell pattern.

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  onRefine?: () => void;
  placeholder?: string;
  minHeight?: number;
  variant?: "card" | "flat";
}

export function BriefTextareaBlock({
  eyebrow,
  title,
  hint,
  value,
  onChange,
  onRefine,
  placeholder,
  minHeight = 150,
  variant = "card",
}: Props) {
  const textarea = (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ minHeight }}
      className={cn(
        "w-full resize-y rounded-md border border-border bg-white px-3.5 py-2.5 text-[14px] leading-relaxed text-ink outline-none transition-colors",
        "focus:border-gold/60 focus:ring-2 focus:ring-gold/15",
      )}
    />
  );

  if (variant === "flat") {
    // Caller owns the SectionHead. We render only the textarea and, if
    // onRefine was passed, a right-aligned refine button above it.
    if (!onRefine) return textarea;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-end">
          <RefineButton onClick={onRefine} />
        </div>
        {textarea}
      </div>
    );
  }

  // Editorial variant: no card chrome. Gold eyebrow → Cormorant title →
  // muted description → thin divider → textarea. Matches Décor reference.
  return (
    <section className="editorial-section">
      <header className="mb-[18px] flex items-start justify-between gap-4 border-b border-ink/[0.04] pb-2.5">
        <div className="min-w-0 flex-1">
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
          {hint && (
            <p className="mt-1.5 max-w-[52rem] text-[13.5px] leading-[1.5] text-ink-muted">
              {hint}
            </p>
          )}
        </div>
        {onRefine && <RefineButton onClick={onRefine} />}
      </header>
      {textarea}
    </section>
  );
}

function RefineButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
        "border-gold/40 bg-ivory-warm text-ink-soft hover:border-gold hover:text-saffron",
      )}
    >
      <Sparkles size={12} strokeWidth={1.8} />
      Refine with AI
    </button>
  );
}
