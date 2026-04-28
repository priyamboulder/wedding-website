"use client";

// ── Want / Avoid lists ────────────────────────────────────────────────────
// Paired free-text lists — "I definitely want…" and "Not for us…". Each
// item is a short line (press enter to add), removable with a close icon.
// Used across Events workspace tabs and intended for future reuse.

import { useState } from "react";
import { Check, Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListProps {
  title: string;
  placeholder: string;
  items: string[];
  onChange: (next: string[]) => void;
  tone: "want" | "avoid";
  variant?: "card" | "flat";
}

function FreeTextList({
  title,
  placeholder,
  items,
  onChange,
  tone,
  variant = "card",
}: ListProps) {
  const [draft, setDraft] = useState("");
  // Defensive — pre-migration event records may feed undefined here.
  const safeItems = Array.isArray(items) ? items : [];

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (safeItems.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...safeItems, v]);
    setDraft("");
  }

  function remove(i: number) {
    onChange(safeItems.filter((_, idx) => idx !== i));
  }

  const Icon = tone === "want" ? Heart : X;
  const accent =
    tone === "want"
      ? "text-saffron border-saffron/30 bg-saffron-pale/30"
      : "text-ink-muted border-border bg-ivory-warm";

  return (
    <section
      className={cn(
        variant === "card" && "rounded-lg border border-border bg-white p-5",
      )}
    >
      <header className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border",
            accent,
          )}
        >
          <Icon size={11} strokeWidth={2} />
        </span>
        <h4 className="font-serif text-[17px] text-ink">{title}</h4>
      </header>

      {safeItems.length > 0 && (
        <ul className="mb-3 space-y-1.5" role="list">
          {safeItems.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="group flex items-start gap-2 rounded-md border border-border/70 bg-ivory-warm/30 px-2.5 py-1.5 text-[13px] text-ink"
            >
              <Check
                size={12}
                strokeWidth={1.8}
                className={cn(
                  "mt-0.5 shrink-0",
                  tone === "want" ? "text-saffron" : "text-ink-faint",
                )}
              />
              <span className="flex-1">{item}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${item}`}
                className="shrink-0 rounded p-0.5 text-ink-faint opacity-0 transition-opacity hover:bg-white hover:text-ink group-hover:opacity-100"
              >
                <X size={12} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[13px] text-ink outline-none transition-colors focus:border-gold/60"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-gold/60 hover:text-ink disabled:opacity-40"
        >
          Add
        </button>
      </form>
    </section>
  );
}

export function WantAvoidLists({
  wants,
  avoids,
  onChangeWants,
  onChangeAvoids,
  wantTitle = "I definitely want…",
  avoidTitle = "Not for us…",
  wantPlaceholder = "e.g. candid mehendi ritual shots",
  avoidPlaceholder = "e.g. no staged group poses",
  variant = "card",
}: {
  wants: string[];
  avoids: string[];
  onChangeWants: (next: string[]) => void;
  onChangeAvoids: (next: string[]) => void;
  wantTitle?: string;
  avoidTitle?: string;
  wantPlaceholder?: string;
  avoidPlaceholder?: string;
  variant?: "card" | "flat";
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FreeTextList
        title={wantTitle}
        placeholder={wantPlaceholder}
        items={wants}
        onChange={onChangeWants}
        tone="want"
        variant={variant}
      />
      <FreeTextList
        title={avoidTitle}
        placeholder={avoidPlaceholder}
        items={avoids}
        onChange={onChangeAvoids}
        tone="avoid"
        variant={variant}
      />
    </div>
  );
}
