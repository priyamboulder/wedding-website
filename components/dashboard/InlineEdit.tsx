"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string;
  onSave: (next: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  ariaLabel?: string;
  type?: "text" | "number";
  min?: number;
  max?: number;
}

export function InlineEdit({
  value,
  onSave,
  placeholder = "—",
  className,
  inputClassName,
  ariaLabel,
  type = "text",
  min,
  max,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next !== value.trim()) onSave(next);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        min={min}
        max={max}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        aria-label={ariaLabel}
        className={cn("dash-input", inputClassName)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label={ariaLabel}
      className={cn(
        "dash-editable text-left",
        !value && "italic text-[color:var(--color-ink-faint)]",
        className,
      )}
    >
      {value || placeholder}
    </button>
  );
}
