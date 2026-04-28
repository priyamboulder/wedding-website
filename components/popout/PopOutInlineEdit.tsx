"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

type EditType = "text" | "number" | "date" | "textarea";

interface PopOutInlineEditProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: EditType;
  /** Display formatter — transforms value for static display */
  format?: (value: string) => string;
  className?: string;
}

export function PopOutInlineEdit({
  value,
  onChange,
  placeholder = "Click to edit…",
  type = "text",
  format,
  className,
}: PopOutInlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync draft when value changes externally
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  // Auto-focus on edit
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed !== value) onChange(trimmed);
    setEditing(false);
  }, [draft, value, onChange]);

  const cancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && type !== "textarea") {
        e.preventDefault();
        commit();
      }
      if (e.key === "Enter" && type === "textarea" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        commit();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    },
    [commit, cancel, type],
  );

  const displayValue = value
    ? format
      ? format(value)
      : value
    : placeholder;

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          "group inline-flex items-center gap-1.5 text-left rounded-md px-1.5 py-0.5 -mx-1.5",
          "transition-colors hover:bg-ivory-warm",
          value ? "text-sm text-ink-soft" : "text-sm text-ink-faint italic",
          className,
        )}
      >
        <span className="leading-relaxed">{displayValue}</span>
        <Pencil
          size={12}
          className="text-ink-faint/0 group-hover:text-ink-faint transition-colors flex-shrink-0"
        />
      </button>
    );
  }

  const inputClasses = cn(
    "w-full rounded-md border border-gold/40 bg-ivory-warm/50 px-2 py-1.5",
    "text-sm text-ink font-sans leading-relaxed",
    "placeholder:text-ink-faint focus:outline-none focus:border-gold/60",
    "transition-colors",
  );

  return (
    <div className={cn("flex items-start gap-1.5", className)}>
      {type === "textarea" ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={placeholder}
          rows={3}
          className={cn(inputClasses, "resize-none")}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
      <button
        type="button"
        onClick={commit}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-sage hover:bg-sage-pale transition-colors"
        aria-label="Confirm"
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={cancel}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-ink-faint hover:bg-ivory-warm transition-colors"
        aria-label="Cancel"
      >
        <X size={14} />
      </button>
    </div>
  );
}
