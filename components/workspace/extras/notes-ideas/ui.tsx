"use client";

// ── Shared UI atoms for Notes & Ideas tabs ─────────────────────────────────
// Small local building blocks — kept co-located with the tabs rather than
// promoted globally because they encode Notes & Ideas-specific treatments
// (privacy lock, tag chips, date caps). Section/TextArea/TextInput conventions
// mirror the bachelorette module so the two feel like cousins.

import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { NoteTag } from "@/types/notes-ideas";
import { NOTE_TAGS } from "@/types/notes-ideas";

export function Section({
  eyebrow,
  title,
  description,
  right,
  children,
  tone = "default",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
  tone?: "default" | "muted";
}) {
  const border = tone === "muted" ? "border-border/60" : "border-border";
  const bg = tone === "muted" ? "bg-ivory-warm/40" : "bg-white";
  return (
    <section className={cn("rounded-lg border p-5", border, bg)}>
      {(eyebrow || title || description || right) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {eyebrow && (
              <p
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h3 className="mt-1 font-serif text-[18px] leading-snug text-ink">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
                {description}
              </p>
            )}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={cn(
        "w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none",
        className,
      )}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none",
        className,
      )}
    />
  );
}

export function TagChip({
  tag,
  removable,
  onRemove,
}: {
  tag: NoteTag;
  removable?: boolean;
  onRemove?: () => void;
}) {
  const label = NOTE_TAGS.find((t) => t.id === tag)?.label ?? tag;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm bg-ivory-warm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
      {removable && onRemove && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className="text-ink-faint hover:text-rose"
        >
          ×
        </button>
      )}
    </span>
  );
}

export function TagFilterBar({
  value,
  onChange,
}: {
  value: NoteTag | null;
  onChange: (v: NoteTag | null) => void;
}) {
  const pill = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
      active
        ? "border-ink bg-ink text-ivory"
        : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
    );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className="mr-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Filter —
      </span>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={pill(value === null)}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        All
      </button>
      {NOTE_TAGS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={pill(value === t.id)}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function InlineAdd({
  placeholder,
  onAdd,
  buttonLabel = "Add",
}: {
  placeholder: string;
  onAdd: (value: string) => void;
  buttonLabel?: string;
}) {
  const [draft, setDraft] = useState("");
  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft("");
  }
  return (
    <div className="flex items-center gap-2">
      <TextInput
        value={draft}
        onChange={setDraft}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
      />
      <button
        type="button"
        onClick={commit}
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
      >
        <Plus size={12} strokeWidth={2} />
        {buttonLabel}
      </button>
    </div>
  );
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return formatShortDate(iso);
}

export function formatWeekOf(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `Week of ${d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  })}`;
}
