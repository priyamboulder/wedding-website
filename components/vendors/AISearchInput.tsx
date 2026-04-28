"use client";

import { useEffect, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_SEARCH_EXAMPLES } from "@/lib/vendors/ai-search";

interface AISearchInputProps {
  value: string;
  onChange: (value: string) => void;
  aiMode: boolean;
  onToggleAiMode: () => void;
  resultCount: number;
  totalCount: number;
}

// Inline search field that mirrors Shopping's ControlsBar search, with a
// small, subtle AI toggle tucked inside. The active state uses a pale
// saffron wash — never a filled saffron pill.
export function AISearchInput({
  value,
  onChange,
  aiMode,
  onToggleAiMode,
  resultCount,
  totalCount,
}: AISearchInputProps) {
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    if (!aiMode) return;
    const id = window.setInterval(() => {
      setExampleIndex((i) => (i + 1) % AI_SEARCH_EXAMPLES.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [aiMode]);

  const placeholder = aiMode
    ? AI_SEARCH_EXAMPLES[exampleIndex]
    : "Search vendors, styles, locations…";

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex flex-1 items-center md:w-80 md:flex-none">
        {aiMode ? (
          <Sparkles
            size={13}
            strokeWidth={1.6}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-saffron"
          />
        ) : (
          <Search
            size={13}
            strokeWidth={1.6}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-md border py-1.5 pl-8 pr-20 text-[12.5px] text-ink outline-none focus:border-gold",
            aiMode
              ? "border-saffron/30 bg-saffron-pale/20 placeholder:italic placeholder:text-ink-faint/80"
              : "border-border bg-white placeholder:text-ink-faint",
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-14 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
          >
            <X size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={onToggleAiMode}
          aria-pressed={aiMode}
          title={aiMode ? "AI search on" : "Translate natural language into filters"}
          className={cn(
            "absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider transition-colors",
            aiMode
              ? "text-saffron"
              : "text-ink-faint hover:text-ink",
          )}
        >
          <Sparkles
            size={10}
            strokeWidth={1.8}
            fill={aiMode ? "currentColor" : "none"}
          />
          AI
        </button>
      </div>
      <span
        className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {resultCount} of {totalCount}
      </span>
    </div>
  );
}
