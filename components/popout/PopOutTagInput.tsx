"use client";

import { useCallback, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PopOutTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** Auto-complete suggestions */
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

export function PopOutTagInput({
  tags,
  onChange,
  suggestions = [],
  placeholder = "Add tag…",
  className,
}: PopOutTagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !tags.includes(s),
  );

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed || tags.includes(trimmed)) return;
      onChange([...tags, trimmed]);
      setInput("");
      setShowSuggestions(false);
      setHighlightIdx(-1);
    },
    [tags, onChange],
  );

  const removeTag = useCallback(
    (tag: string) => {
      onChange(tags.filter((t) => t !== tag));
    },
    [tags, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (highlightIdx >= 0 && filtered[highlightIdx]) {
          addTag(filtered[highlightIdx]);
        } else {
          addTag(input);
        }
        return;
      }
      if (e.key === "Backspace" && !input && tags.length > 0) {
        removeTag(tags[tags.length - 1]);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setHighlightIdx(-1);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
        return;
      }
    },
    [input, tags, filtered, highlightIdx, addTag, removeTag],
  );

  return (
    <div className={cn("relative", className)}>
      {/* Tag container + input */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-lg border border-border px-2.5 py-2",
          "bg-ivory-warm/50 transition-colors",
          "focus-within:border-gold/40",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5",
              "bg-gold-pale/60 text-[12px] font-medium text-ink-soft",
              "border border-gold/15",
            )}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="text-ink-faint hover:text-ink-muted transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
            setHighlightIdx(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow suggestion click
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className={cn(
            "flex-1 min-w-[80px] bg-transparent text-sm text-ink",
            "placeholder:text-ink-faint focus:outline-none font-sans",
          )}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && input && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-white py-1 shadow-lg popover-enter">
          {filtered.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className={cn(
                "w-full px-3 py-1.5 text-left text-sm text-ink-soft transition-colors",
                i === highlightIdx
                  ? "bg-gold-pale/40 text-ink"
                  : "hover:bg-ivory-warm",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
