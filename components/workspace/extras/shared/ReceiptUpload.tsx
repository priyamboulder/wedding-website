"use client";

// ── Receipt upload with AI parsing ────────────────────────────────────────
// Drop a photo of a receipt, hit parse, confirm the AI-extracted fields,
// then the entry lands on the budget as a new Expense with the chosen
// split method. Works off both bachelorette-store and bachelor-store via
// the onAddExpense callback — the component is storeless.

import { useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Receipt,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Label,
  Section,
  TextInput,
} from "@/components/workspace/extras/bachelorette/ui";
import type {
  ParsedReceipt,
  ReceiptParseResponse,
} from "@/app/api/receipt/parse/route";

// ── Structural type contracts ─────────────────────────────────────────────
// Bachelor and Bachelorette both define these locally — structurally
// identical, nominally different. Redeclaring here keeps this component
// decoupled from either store so both pages can wire it up.

type ExpenseSplit =
  | { kind: "equal" }
  | { kind: "individual" }
  | { kind: "organizers" }
  | { kind: "split_among_guests" }
  | { kind: "custom"; byPerson: Record<string, number> };

interface Guest {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  label: string;
  amountCents: number;
  meta?: Record<string, unknown>;
}

const MONO = "var(--font-mono)";

// ── Parse-phase state ─────────────────────────────────────────────────────

type ParseState =
  | { phase: "idle" }
  | { phase: "uploading"; previewUrl: string }
  | { phase: "parsing"; previewUrl: string }
  | {
      phase: "review";
      previewUrl: string;
      draft: Editable;
      confidence: ParsedReceipt["confidence"];
    }
  | { phase: "error"; previewUrl: string; message: string };

interface Editable {
  vendor: string;
  date: string;
  total: number; // USD dollars (not cents)
  paidByGuestId: string | null;
  splitKind: ExpenseSplit["kind"];
  splitAmong: string[]; // guest ids (only used when kind=custom)
}

export function ReceiptUpload({
  guests,
  expenses,
  onAddExpense,
  personLabel = "guest",
}: {
  guests: Guest[];
  expenses: Expense[];
  onAddExpense: (
    label: string,
    amountCents: number,
    split: ExpenseSplit,
    paidByGuestId: string | null,
  ) => void;
  personLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ParseState>({ phase: "idle" });

  const recentReceipts = expenses.filter((e) => (e.meta as { fromReceipt?: boolean })?.fromReceipt);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setState({
        phase: "error",
        previewUrl: "",
        message: "Receipt must be an image (JPG, PNG, HEIC).",
      });
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setState({ phase: "uploading", previewUrl });

    const dataUrl = await readAsDataURL(file);
    setState({ phase: "parsing", previewUrl });

    try {
      const res = await fetch("/api/receipt/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const body = (await res.json()) as ReceiptParseResponse;
      if (!body.ok || !body.data) {
        setState({
          phase: "error",
          previewUrl,
          message: body.error ?? "Could not parse the receipt.",
        });
        return;
      }
      setState({
        phase: "review",
        previewUrl,
        confidence: body.data.confidence,
        draft: {
          vendor: body.data.vendor,
          date: body.data.date || new Date().toISOString().slice(0, 10),
          total: body.data.total,
          paidByGuestId: null,
          splitKind: "equal",
          splitAmong: guests.map((g) => g.id),
        },
      });
    } catch (err) {
      setState({
        phase: "error",
        previewUrl,
        message: err instanceof Error ? err.message : "Network error.",
      });
    }
  }

  function reset() {
    if (state.phase !== "idle" && "previewUrl" in state && state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ phase: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  function commit() {
    if (state.phase !== "review") return;
    const { draft } = state;
    const cents = Math.round(draft.total * 100);
    if (!draft.vendor.trim() || cents <= 0) return;
    const split = buildSplit(draft, guests);
    const label = draft.date
      ? `${draft.vendor.trim()} · ${draft.date}`
      : draft.vendor.trim();
    onAddExpense(label, cents, split, draft.paidByGuestId);
    reset();
  }

  return (
    <Section
      eyebrow="RECEIPT UPLOAD"
      title="Snap a receipt, split it in seconds"
      description="Take a photo of the receipt — our AI pulls vendor, date, and total. You confirm who paid, pick the split, and it lands on the budget."
    >
      {state.phase === "idle" && (
        <DropZone
          onFile={onFile}
          inputRef={inputRef}
          recentCount={recentReceipts.length}
        />
      )}

      {state.phase === "uploading" && (
        <StatusCard
          previewUrl={state.previewUrl}
          icon={<Upload size={14} strokeWidth={1.8} />}
          label="Reading image…"
        />
      )}

      {state.phase === "parsing" && (
        <StatusCard
          previewUrl={state.previewUrl}
          icon={
            <Loader2
              size={14}
              strokeWidth={1.8}
              className="animate-spin"
            />
          }
          label="AI extracting vendor, date, and total…"
        />
      )}

      {state.phase === "error" && (
        <div className="flex items-start gap-4 rounded-md border border-rose/30 bg-rose-pale/30 p-4">
          {state.previewUrl && (
            <img
              src={state.previewUrl}
              alt="Receipt"
              className="h-24 w-20 rounded-sm border border-border object-cover"
            />
          )}
          <div className="flex-1">
            <p className="text-[13px] font-medium text-rose">Couldn't parse</p>
            <p className="mt-1 text-[12px] text-ink-muted">{state.message}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-3 inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
            >
              <Upload size={12} strokeWidth={1.8} /> Try another
            </button>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label="Dismiss"
            className="shrink-0 text-ink-faint hover:text-rose"
          >
            <X size={13} strokeWidth={1.8} />
          </button>
        </div>
      )}

      {state.phase === "review" && (
        <ReviewCard
          state={state}
          guests={guests}
          personLabel={personLabel}
          onChange={(patch) =>
            setState({
              ...state,
              draft: { ...state.draft, ...patch },
            })
          }
          onCancel={reset}
          onCommit={commit}
        />
      )}
    </Section>
  );
}

// ── Drop zone ─────────────────────────────────────────────────────────────

function DropZone({
  onFile,
  inputRef,
  recentCount,
}: {
  onFile: (file: File) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  recentCount: number;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <label
      className={cn(
        "block cursor-pointer rounded-md border-2 border-dashed bg-white px-6 py-10 text-center transition-colors",
        dragging
          ? "border-saffron bg-saffron-pale/30"
          : "border-border hover:border-saffron/50",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
    >
      <Receipt
        size={22}
        strokeWidth={1.5}
        className="mx-auto mb-3 text-ink-faint"
      />
      <p className="text-[13.5px] font-medium text-ink">
        Drop a receipt photo or click to browse
      </p>
      <p className="mt-1 text-[12px] text-ink-muted">
        JPG, PNG, or HEIC. We'll extract the vendor, date, and total for you.
      </p>
      {recentCount > 0 && (
        <p
          className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: MONO }}
        >
          {recentCount} {recentCount === 1 ? "receipt" : "receipts"} logged so far
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

// ── Status card ───────────────────────────────────────────────────────────

function StatusCard({
  previewUrl,
  icon,
  label,
}: {
  previewUrl: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-md border border-border bg-white p-4">
      <img
        src={previewUrl}
        alt="Receipt preview"
        className="h-24 w-20 rounded-sm border border-border object-cover"
      />
      <div className="flex items-center gap-2 text-[13px] text-ink">
        {icon}
        {label}
      </div>
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────

function ReviewCard({
  state,
  guests,
  personLabel,
  onChange,
  onCancel,
  onCommit,
}: {
  state: Extract<ParseState, { phase: "review" }>;
  guests: Guest[];
  personLabel: string;
  onChange: (patch: Partial<Editable>) => void;
  onCancel: () => void;
  onCommit: () => void;
}) {
  const { draft, confidence, previewUrl } = state;
  const confidenceTone =
    confidence === "high"
      ? "text-sage"
      : confidence === "medium"
        ? "text-saffron"
        : "text-rose";
  const canCommit = draft.vendor.trim().length > 0 && draft.total > 0;
  const splitPreview = previewSplitPerPerson(draft, guests);

  return (
    <div className="grid gap-4 md:grid-cols-[140px_1fr]">
      <img
        src={previewUrl}
        alt="Receipt"
        className="h-auto max-h-[260px] w-full rounded-sm border border-border object-cover md:sticky md:top-4"
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-saffron"
              style={{ fontFamily: MONO }}
            >
              PARSED — REVIEW & CONFIRM
            </p>
            <p className={cn("mt-1 text-[12px] font-medium", confidenceTone)}>
              Confidence: {confidence}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-ink-faint hover:text-rose"
            aria-label="Cancel"
          >
            <X size={13} strokeWidth={1.8} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Vendor</Label>
            <TextInput
              value={draft.vendor}
              onChange={(v) => onChange({ vendor: v })}
              placeholder="Restaurant / merchant"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Date</Label>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => onChange({ date: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
            />
          </div>
          <div>
            <Label>Total</Label>
            <div className="mt-1 flex items-center gap-1 rounded-md border border-border bg-white pl-3">
              <span className="text-ink-faint">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.total || ""}
                onChange={(e) =>
                  onChange({ total: Math.max(0, Number(e.target.value) || 0) })
                }
                placeholder="0.00"
                className="w-full border-0 bg-transparent px-1 py-1.5 text-[13px] text-ink focus:outline-none"
              />
            </div>
          </div>
          <div>
            <Label>Who paid?</Label>
            <select
              value={draft.paidByGuestId ?? ""}
              onChange={(e) =>
                onChange({ paidByGuestId: e.target.value || null })
              }
              className="mt-1 w-full rounded-md border border-border bg-white px-2 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
            >
              <option value="">Unassigned</option>
              {guests.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>Split</Label>
          <div className="mt-1 grid grid-cols-1 gap-1.5">
            {(
              [
                { id: "equal", label: "Split evenly among everyone" },
                {
                  id: "custom",
                  label: "Split among specific people",
                },
                { id: "individual", label: "One person covers it" },
              ] as const
            ).map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12.5px] transition-colors",
                  draft.splitKind === opt.id
                    ? "border-ink bg-ink/5 text-ink"
                    : "border-border bg-white text-ink-muted hover:border-saffron/40",
                )}
              >
                <input
                  type="radio"
                  name="receipt-split"
                  checked={draft.splitKind === opt.id}
                  onChange={() => onChange({ splitKind: opt.id })}
                  className="accent-ink"
                />
                {opt.label}
              </label>
            ))}
          </div>

          {draft.splitKind === "custom" && (
            <div className="mt-2 rounded-md border border-border bg-ivory-warm/30 p-3">
              <Label>Include these {personLabel}s</Label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {guests.map((g) => {
                  const included = draft.splitAmong.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          splitAmong: included
                            ? draft.splitAmong.filter((id) => id !== g.id)
                            : [...draft.splitAmong, g.id],
                        })
                      }
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11.5px] transition-colors",
                        included
                          ? "border-ink bg-ink text-ivory"
                          : "border-border bg-white text-ink-muted hover:border-saffron/40",
                      )}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {splitPreview !== null && (
            <p
              className="mt-2 font-mono text-[11px] text-ink-muted"
              style={{ fontFamily: MONO }}
            >
              ≈ ${splitPreview.toFixed(2)} per person
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-rose/40 hover:text-rose"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onCommit}
            disabled={!canCommit}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
              canCommit
                ? "bg-ink text-ivory hover:bg-ink-soft"
                : "bg-ivory-warm text-ink-faint",
            )}
          >
            <CheckCircle2 size={12} strokeWidth={1.8} />
            Add to budget
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function buildSplit(draft: Editable, guests: Guest[]): ExpenseSplit {
  if (draft.splitKind === "individual") return { kind: "individual" };
  if (draft.splitKind === "equal") return { kind: "equal" };
  if (draft.splitKind === "custom") {
    const cents = Math.round(draft.total * 100);
    const among = draft.splitAmong.length > 0 ? draft.splitAmong : guests.map((g) => g.id);
    const perPerson = Math.floor(cents / among.length);
    const byPerson: Record<string, number> = {};
    for (const id of among) byPerson[id] = perPerson;
    // Any leftover cents land on the first person so the sum matches the total
    const assigned = perPerson * among.length;
    if (among.length > 0 && assigned !== cents) {
      byPerson[among[0]] += cents - assigned;
    }
    return { kind: "custom", byPerson };
  }
  return { kind: "equal" };
}

function previewSplitPerPerson(draft: Editable, guests: Guest[]): number | null {
  if (draft.splitKind === "individual") return draft.total;
  const count =
    draft.splitKind === "custom"
      ? draft.splitAmong.length || guests.length
      : guests.length;
  if (count === 0) return null;
  return draft.total / count;
}
