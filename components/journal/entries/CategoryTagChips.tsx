"use client";

// ── CategoryTagChips ───────────────────────────────────────────────────────
// Tag pill row for Journal entries. Two variants:
//   editable=false → read-only pills
//   editable=true  → pills with × remove + a "+" button that opens a combobox
//
// Below the pill row, if the entry has `autoTagSuggestions`, render
// ghosted "Accept?" chips with ✓ / × controls.

import { useMemo, useRef, useState } from "react";
import { Plus, X, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_TAG_META,
  CATEGORY_LABEL,
} from "@/lib/journal/category-vocab";
import type { WorkspaceCategoryTag } from "@/types/checklist";

export function CategoryTagChips({
  tags,
  suggestions = [],
  editable = false,
  onAdd,
  onRemove,
  onAcceptSuggestion,
  onDismissSuggestion,
  onDismissAllSuggestions,
  onRunAutoTag,
  autoTagBusy = false,
  size = "md",
}: {
  tags: WorkspaceCategoryTag[];
  suggestions?: WorkspaceCategoryTag[];
  editable?: boolean;
  onAdd?: (tag: WorkspaceCategoryTag) => void;
  onRemove?: (tag: WorkspaceCategoryTag) => void;
  onAcceptSuggestion?: (tag: WorkspaceCategoryTag) => void;
  onDismissSuggestion?: (tag: WorkspaceCategoryTag) => void;
  onDismissAllSuggestions?: () => void;
  onRunAutoTag?: () => void;
  autoTagBusy?: boolean;
  size?: "sm" | "md";
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const available = useMemo(
    () =>
      CATEGORY_TAG_META.filter(
        (c) =>
          !tags.includes(c.slug) &&
          (!query ||
            c.label.toLowerCase().includes(query.toLowerCase()) ||
            c.slug.toLowerCase().includes(query.toLowerCase())),
      ),
    [tags, query],
  );

  const pillBase =
    size === "sm"
      ? "text-[10px] px-2 py-[2px]"
      : "text-[11px] px-2.5 py-[3px]";

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.length === 0 && !editable && (
          <span className="text-[11px] italic text-ink-faint">Untagged</span>
        )}
        {tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-saffron/30 bg-saffron/5 font-mono uppercase tracking-[0.08em] text-saffron",
              pillBase,
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {CATEGORY_LABEL[tag]}
            {editable && onRemove && (
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="rounded-full p-[1px] text-saffron/70 hover:bg-saffron/10 hover:text-saffron"
                aria-label={`Remove ${CATEGORY_LABEL[tag]} tag`}
              >
                <X size={10} strokeWidth={2} />
              </button>
            )}
          </span>
        ))}
        {editable && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setPickerOpen((v) => !v);
                setQuery("");
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-dashed border-gold/40 text-ink-muted hover:border-saffron hover:text-saffron",
                pillBase,
              )}
            >
              <Plus size={10} strokeWidth={2} />
              Add tag
            </button>
            {pickerOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-md border border-gold/20 bg-white p-2 shadow-lg">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter categories…"
                  className="mb-2 w-full rounded border border-gold/20 bg-ivory px-2 py-1 text-[11px] text-ink outline-none focus:border-saffron"
                />
                <div className="max-h-52 overflow-y-auto">
                  {available.length === 0 ? (
                    <p className="px-2 py-1 text-[11px] italic text-ink-faint">
                      No matches
                    </p>
                  ) : (
                    available.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => {
                          onAdd?.(c.slug);
                          setQuery("");
                        }}
                        className="block w-full rounded px-2 py-1 text-left text-[12px] text-ink hover:bg-saffron/10 hover:text-saffron"
                      >
                        {c.label}
                      </button>
                    ))
                  )}
                </div>
                <div className="mt-1.5 flex justify-between border-t border-gold/10 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setPickerOpen(false)}
                    className="text-[10px] text-ink-muted hover:text-ink"
                  >
                    Close
                  </button>
                  {onRunAutoTag && (
                    <button
                      type="button"
                      disabled={autoTagBusy}
                      onClick={() => {
                        onRunAutoTag();
                        setPickerOpen(false);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] text-saffron hover:text-saffron/80 disabled:opacity-50"
                    >
                      <Sparkles size={10} strokeWidth={2} />
                      {autoTagBusy ? "Thinking…" : "Suggest tags"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {editable && onRunAutoTag && !pickerOpen && (
          <button
            type="button"
            disabled={autoTagBusy}
            onClick={onRunAutoTag}
            className="inline-flex items-center gap-1 rounded-full border border-gold/20 px-2 py-[2px] text-[10px] text-ink-muted hover:border-saffron hover:text-saffron disabled:opacity-50"
            title="Suggest categories with AI"
          >
            <Sparkles size={10} strokeWidth={2} />
            {autoTagBusy ? "Thinking…" : "Suggest"}
          </button>
        )}
      </div>

      {suggestions.length > 0 && editable && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Suggested
          </span>
          {suggestions.map((tag) => (
            <span
              key={tag}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-dashed border-saffron/40 bg-saffron/5 font-mono uppercase tracking-[0.08em] text-saffron/80",
                pillBase,
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {CATEGORY_LABEL[tag]}
              {onAcceptSuggestion && (
                <button
                  type="button"
                  onClick={() => onAcceptSuggestion(tag)}
                  className="rounded-full p-[1px] text-saffron hover:bg-saffron/15"
                  aria-label={`Accept ${CATEGORY_LABEL[tag]} suggestion`}
                >
                  <Check size={10} strokeWidth={2.4} />
                </button>
              )}
              {onDismissSuggestion && (
                <button
                  type="button"
                  onClick={() => onDismissSuggestion(tag)}
                  className="rounded-full p-[1px] text-ink-faint hover:bg-ink/5 hover:text-ink-muted"
                  aria-label={`Dismiss ${CATEGORY_LABEL[tag]} suggestion`}
                >
                  <X size={10} strokeWidth={2} />
                </button>
              )}
            </span>
          ))}
          {onDismissAllSuggestions && (
            <button
              type="button"
              onClick={onDismissAllSuggestions}
              className="text-[10px] italic text-ink-faint hover:text-ink-muted"
            >
              Dismiss all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
