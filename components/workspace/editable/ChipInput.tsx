"use client";

// ── ChipInput ───────────────────────────────────────────────────────────────
// Free-form tag input: type + Enter to add a chip, click chip to edit,
// X on hover to remove. Used for style keywords, free-form tags, etc.

import { useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineText } from "./InlineText";

export interface ChipInputProps {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
  // Optional transform (e.g. toLowerCase)
  normalize?: (v: string) => string;
  // Reject duplicates. Default true.
  dedupe?: boolean;
  // Dedupe comparison is case-insensitive by default; pass false to keep case-sensitive.
  dedupeCaseInsensitive?: boolean;
  // Tone class on chips. Default ink.
  tone?: "ink" | "saffron" | "sage";
}

export function ChipInput({
  values,
  onChange,
  placeholder = "Add tag…",
  className,
  normalize,
  dedupe = true,
  dedupeCaseInsensitive = true,
  tone = "ink",
}: ChipInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function add(raw: string) {
    const v = (normalize ? normalize(raw) : raw).trim();
    if (!v) return;
    if (dedupe) {
      const existing = dedupeCaseInsensitive
        ? values.map((x) => x.toLowerCase())
        : values;
      const cmp = dedupeCaseInsensitive ? v.toLowerCase() : v;
      if (existing.includes(cmp)) return;
    }
    onChange([...values, v]);
    setDraft("");
  }

  function removeAt(idx: number) {
    onChange(values.filter((_, i) => i !== idx));
  }

  function updateAt(idx: number, next: string) {
    const v = (normalize ? normalize(next) : next).trim();
    if (!v) {
      removeAt(idx);
      return;
    }
    onChange(values.map((x, i) => (i === idx ? v : x)));
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && values.length > 0) {
      removeAt(values.length - 1);
    }
  }

  const chipTone = {
    ink: "border-border bg-white text-ink-muted",
    saffron: "border-saffron/40 bg-saffron-pale/30 text-saffron",
    sage: "border-sage/40 bg-sage-pale/30 text-sage",
  }[tone];

  return (
    <div
      className={cn(
        "flex min-h-[34px] flex-wrap items-center gap-1.5 rounded-md border border-border bg-white px-2 py-1.5 focus-within:border-saffron/60",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {values.map((v, idx) => (
        <span
          key={`${v}-${idx}`}
          className={cn(
            "group flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]",
            chipTone,
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <InlineText
            value={v}
            onSave={(n) => updateAt(idx, n)}
            className="m-0 p-0 text-inherit"
            readOnlyClassName="!px-0 !py-0 hover:!bg-transparent hover:!border-transparent"
            editClassName="!px-1 !py-0 text-[10px]"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeAt(idx);
            }}
            className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
            aria-label={`Remove ${v}`}
          >
            <X size={9} strokeWidth={2} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => {
          if (draft.trim()) add(draft);
        }}
        placeholder={values.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint outline-none"
      />
    </div>
  );
}
