"use client";

// ── InlineText ──────────────────────────────────────────────────────────────
// Click-to-edit text. No edit button, no modal. Click → cursor appears,
// Enter (or blur) saves, Escape cancels. Optimistic by default: parent
// receives onSave AFTER the UI has already shown the new value.

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface InlineTextProps {
  value: string;
  onSave: (next: string) => void;
  // "line" = single-line input. "block" = multi-line textarea (shift+enter = newline,
  // enter = save, cmd/ctrl+enter also saves).
  variant?: "line" | "block";
  placeholder?: string;
  emptyLabel?: string;          // shown italic when value is empty and not editing
  className?: string;
  readOnlyClassName?: string;   // extra classes for the display span
  editClassName?: string;       // extra classes for the input/textarea
  multilineRows?: number;       // initial rows when variant = block
  allowEmpty?: boolean;         // default false — empty save reverts to prior value
  onCancel?: () => void;
  autoFocus?: boolean;          // start in edit mode
}

export function InlineText({
  value,
  onSave,
  variant = "line",
  placeholder,
  emptyLabel = "Click to add",
  className,
  readOnlyClassName,
  editClassName,
  multilineRows = 2,
  allowEmpty = false,
  onCancel,
  autoFocus = false,
}: InlineTextProps) {
  const [editing, setEditing] = useState(autoFocus);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      const el = variant === "line" ? inputRef.current : textareaRef.current;
      el?.focus();
      el?.select?.();
    }
  }, [editing, variant]);

  function commit() {
    const next = draft.trim();
    if (!allowEmpty && !next) {
      setDraft(value);
      setEditing(false);
      return;
    }
    if (next !== value) onSave(next);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
    onCancel?.();
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    } else if (e.key === "Enter") {
      if (variant === "line") {
        e.preventDefault();
        commit();
      } else if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        commit();
      }
      // plain Enter in block variant = newline
    }
  }

  if (editing) {
    if (variant === "block") {
      return (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          placeholder={placeholder}
          rows={multilineRows}
          className={cn(
            "w-full resize-none rounded-sm border border-saffron/50 bg-white px-2 py-1 text-[13px] leading-relaxed text-ink outline-none focus:border-saffron",
            editClassName,
          )}
        />
      );
    }
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-sm border border-saffron/50 bg-white px-2 py-1 text-[13px] text-ink outline-none focus:border-saffron",
          editClassName,
        )}
      />
    );
  }

  const display = value || emptyLabel;
  const isEmpty = !value;

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        "group inline-block w-full cursor-text rounded-sm border border-transparent px-2 py-1 text-left transition-colors hover:border-border hover:bg-ivory-warm/40",
        variant === "block" ? "whitespace-pre-wrap text-[13px] leading-relaxed" : "text-[13px]",
        isEmpty && "italic text-ink-faint",
        className,
        readOnlyClassName,
      )}
      aria-label={isEmpty ? placeholder ?? emptyLabel : `Edit: ${value}`}
      // InlineText is nearly always fed by a Zustand-persisted store, so
      // the SSR render uses the default/empty value while the client hydrates
      // with the persisted one. The button still reconciles to the correct
      // content after hydration — suppress the warning to avoid a red
      // overlay on every page that uses persisted text.
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>{display}</span>
    </button>
  );
}
