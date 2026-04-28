"use client";

// ── Quiz review & confirm ─────────────────────────────────────────────────
// Shown after all questions are answered and any extraction has finished.
// Previews every field the quiz will write, lets the user inline-edit
// editable rows, and blocks the apply() call until they click the
// Apply button in the parent footer.

import { useMemo } from "react";
import { AlertTriangle, Pencil, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizCompletion, QuizPreviewItem, QuizSchema } from "@/types/quiz";

interface Props {
  schema: QuizSchema;
  items: QuizPreviewItem[];
  onChange: (items: QuizPreviewItem[]) => void;
  priorCompletion?: QuizCompletion;
}

export function QuizReview({ items, onChange, priorCompletion }: Props) {
  const editedSet = useMemo(
    () => new Set(priorCompletion?.manually_edited_fields ?? []),
    [priorCompletion],
  );

  function updateItem(index: number, patch: Partial<QuizPreviewItem>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white px-4 py-8 text-center">
        <p className="font-serif text-[14px] text-ink">
          Nothing to apply yet
        </p>
        <p className="mt-1 text-[12px] text-ink-muted">
          All questions were skipped — close this and fill the section in
          manually when you're ready.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] leading-relaxed text-ink-muted">
        We'll write the fields below into your section. Edit any you want to
        tweak — nothing is saved until you click{" "}
        <span className="font-medium text-ink">Apply to section</span>.
      </p>

      {priorCompletion && editedSet.size > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
          <AlertTriangle
            size={13}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0"
          />
          <div>
            <p className="font-medium">Retake — heads up</p>
            <p className="mt-0.5 leading-relaxed">
              You've edited some of these fields in the section since last
              time. Remove any row you want to keep as-is before applying.
            </p>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={item.fieldKey}
            className="group rounded-md border border-border bg-white p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.label}
                  {editedSet.has(item.fieldKey) && (
                    <span className="ml-2 text-amber-700">
                      · edited since last quiz
                    </span>
                  )}
                </p>
                <div className="mt-1.5">
                  <EditableValue
                    value={item.value}
                    editable={item.editable !== false}
                    onChange={(v) => updateItem(i, { value: v })}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                aria-label={`Remove ${item.label}`}
              >
                <X size={12} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Editable value ────────────────────────────────────────────────────────

function EditableValue({
  value,
  editable,
  onChange,
}: {
  value: string | string[];
  editable: boolean;
  onChange: (v: string | string[]) => void;
}) {
  if (Array.isArray(value)) {
    return (
      <ChipList
        values={value}
        editable={editable}
        onChange={onChange}
      />
    );
  }
  if (!editable) {
    return (
      <p className="text-[13px] leading-relaxed text-ink">{value}</p>
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-sm border border-transparent bg-transparent px-0 py-0.5 text-[13px] text-ink outline-none transition-colors hover:border-border focus:border-gold/60 focus:bg-white focus:px-1.5"
    />
  );
}

function ChipList({
  values,
  editable,
  onChange,
}: {
  values: string[];
  editable: boolean;
  onChange: (values: string[]) => void;
}) {
  if (!editable) {
    return (
      <ul className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <li
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 rounded-sm border border-border bg-ivory-warm/40 px-2 py-0.5 text-[11.5px] text-ink-muted"
          >
            {v}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <ul className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <li key={`${i}-${v}`}>
            <ChipEditable
              value={v}
              onChange={(next) => {
                const copy = [...values];
                if (next.trim()) copy[i] = next;
                else copy.splice(i, 1);
                onChange(copy);
              }}
              onRemove={() => {
                const copy = [...values];
                copy.splice(i, 1);
                onChange(copy);
              }}
            />
          </li>
        ))}
        <li>
          <AddChip
            onAdd={(v) => {
              const t = v.trim();
              if (!t) return;
              onChange([...values, t]);
            }}
          />
        </li>
      </ul>
    </div>
  );
}

function ChipEditable({
  value,
  onChange,
  onRemove,
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border border-border bg-ivory-warm/40 py-0.5 pl-2 pr-1 text-[11.5px] text-ink",
        "focus-within:border-gold/60",
      )}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size={Math.max(6, value.length)}
        className="bg-transparent outline-none"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="flex h-4 w-4 items-center justify-center rounded-sm text-ink-faint transition-colors hover:text-rose"
      >
        <X size={10} />
      </button>
    </span>
  );
}

function AddChip({ onAdd }: { onAdd: (v: string) => void }) {
  return (
    <label className="inline-flex items-center gap-1 rounded-sm border border-dashed border-border bg-white py-0.5 pl-1.5 pr-2 text-[11.5px] text-ink-faint transition-colors focus-within:border-gold/50 hover:border-ink-faint/50">
      <Plus size={10} />
      <input
        type="text"
        placeholder="Add"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const v = (e.target as HTMLInputElement).value;
            if (v.trim()) {
              onAdd(v);
              (e.target as HTMLInputElement).value = "";
            }
          }
        }}
        className="w-16 bg-transparent outline-none"
      />
    </label>
  );
}
