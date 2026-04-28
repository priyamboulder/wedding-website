"use client";

// ── Contract checklist (shared) ───────────────────────────────────────────
// Clean, minimal checklist: each item is a single row (checkbox + label +
// chevron). Notes, attachments, and the confirmation timestamp live in a
// slide-out drawer that opens when a row is clicked. Confirmed items stay
// in the list — they get a muted green accent rather than disappearing.
//
// State persists via contract-checklist-store, keyed by category_id +
// item_id, so each workspace's confirmations are independent. This block
// is shared across Photography, Videography, Catering, Pandit, Mehendi
// (extends), etc.

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, FileSignature, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelCard } from "@/components/workspace/blocks/primitives";
import { useContractChecklistStore } from "@/stores/contract-checklist-store";
import { contractChecklistFor } from "@/lib/workspace/contract-checklists";
import type { WorkspaceCategory } from "@/types/workspace";

export function ContractChecklistBlock({
  category,
  intro,
}: {
  category: WorkspaceCategory;
  intro?: string;
}) {
  const items = contractChecklistFor(category.slug);
  const rows = useContractChecklistStore((s) => s.rows);
  const toggle = useContractChecklistStore((s) => s.toggle);
  const updateNote = useContractChecklistStore((s) => s.updateNote);
  const setAttachment = useContractChecklistStore((s) => s.setAttachment);

  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const byId = useMemo(() => {
    const map = new Map<
      string,
      {
        checked: boolean;
        notes: string;
        confirmed_at?: string;
        attachment_name?: string;
      }
    >();
    for (const row of rows) {
      if (row.category_id !== category.id) continue;
      map.set(row.item_id, {
        checked: row.checked,
        notes: row.notes,
        confirmed_at: row.confirmed_at,
        attachment_name: row.attachment_name,
      });
    }
    return map;
  }, [rows, category.id]);

  if (items.length === 0) {
    return null;
  }

  const checkedCount = items.reduce(
    (acc, item) => (byId.get(item.id)?.checked ? acc + 1 : acc),
    0,
  );

  const openItem = openItemId
    ? items.find((i) => i.id === openItemId)
    : undefined;
  const openState = openItem ? byId.get(openItem.id) : undefined;

  return (
    <>
      <PanelCard
        icon={<FileSignature size={14} strokeWidth={1.8} />}
        title="contract checklist"
        badge={
          <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
            {checkedCount} / {items.length} confirmed
          </span>
        }
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          {intro ??
            "Before you sign — check each item with your vendor. Tap a row to add notes or attach a confirmation."}
        </p>

        <ul className="space-y-1">
          {items.map((item) => {
            const state = byId.get(item.id);
            const checked = state?.checked ?? false;
            const hasNotes = Boolean(state?.notes?.trim());
            const hasAttachment = Boolean(state?.attachment_name);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenItemId(item.id)}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors",
                    checked
                      ? "border-sage/30 bg-sage-pale/20 hover:bg-sage-pale/40"
                      : "border-border bg-white hover:border-saffron/40",
                  )}
                >
                  {/* The checkbox is a controlled visual; clicking it
                      toggles confirmation without opening the drawer. */}
                  <span
                    role="checkbox"
                    aria-checked={checked}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(category.id, item.id);
                    }}
                    className={cn(
                      "flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border transition-colors",
                      checked
                        ? "border-sage bg-sage text-white"
                        : "border-ink/30 bg-white hover:border-sage",
                    )}
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-[13px]",
                      checked ? "text-ink-muted" : "text-ink",
                    )}
                  >
                    {item.label}
                  </span>
                  {(hasNotes || hasAttachment) && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-ink-faint">
                      {hasNotes && <span>note</span>}
                      {hasAttachment && (
                        <Paperclip size={10} strokeWidth={1.8} />
                      )}
                    </span>
                  )}
                  <ChevronRight
                    size={14}
                    strokeWidth={1.6}
                    className="text-ink-faint transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </PanelCard>

      <AnimatePresence>
        {openItem && (
          <ChecklistDrawer
            key={openItem.id}
            label={openItem.label}
            hint={openItem.hint}
            checked={openState?.checked ?? false}
            notes={openState?.notes ?? ""}
            confirmedAt={openState?.confirmed_at}
            attachmentName={openState?.attachment_name}
            onToggleConfirmed={() => toggle(category.id, openItem.id)}
            onChangeNotes={(v) => updateNote(category.id, openItem.id, v)}
            onSetAttachment={(name) =>
              setAttachment(category.id, openItem.id, name)
            }
            onClose={() => setOpenItemId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────
// Right-side slide-out drawer used by the contract checklist. Exported so
// future shared checklists (tasting prep, decor approvals, etc.) can mount
// the same UI.

export function ChecklistDrawer({
  label,
  hint,
  checked,
  notes,
  confirmedAt,
  attachmentName,
  onToggleConfirmed,
  onChangeNotes,
  onSetAttachment,
  onClose,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  notes: string;
  confirmedAt?: string;
  attachmentName?: string;
  onToggleConfirmed: () => void;
  onChangeNotes: (notes: string) => void;
  onSetAttachment: (name: string | undefined) => void;
  onClose: () => void;
}) {
  // Escape closes the drawer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const confirmedDate = confirmedAt
    ? new Date(confirmedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        role="dialog"
        aria-label={label}
        className="fixed right-0 top-0 z-50 flex h-full w-[min(440px,92vw)] flex-col overflow-hidden border-l border-border bg-white shadow-[0_24px_60px_-20px_rgba(26,26,26,0.35)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 pb-4 pt-5">
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Contract item
            </p>
            <h3 className="mt-1 font-serif text-[18px] leading-tight text-ink">
              {label}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-ink-faint transition-colors hover:text-ink"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {hint && (
            <div>
              <p
                className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                What this means
              </p>
              <p className="text-[13px] leading-relaxed text-ink-muted">
                {hint}
              </p>
            </div>
          )}

          <div>
            <p
              className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Your notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => onChangeNotes(e.target.value)}
              placeholder="Anything to remember — questions, who you spoke to, page references…"
              className="min-h-[120px] w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] leading-relaxed text-ink outline-none focus:border-saffron/50"
            />
          </div>

          <div>
            <p
              className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Attachment
            </p>
            {attachmentName ? (
              <div className="flex items-center justify-between gap-2 rounded-md border border-sage/30 bg-sage-pale/20 px-3 py-2 text-[12.5px] text-ink">
                <span className="flex items-center gap-2 truncate">
                  <Paperclip size={12} strokeWidth={1.8} className="text-sage" />
                  <span className="truncate">{attachmentName}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onSetAttachment(undefined)}
                  className="text-[11px] text-ink-faint transition-colors hover:text-ink"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-ivory-warm/40 px-3 py-3 text-[12.5px] text-ink-muted transition-colors hover:border-saffron/40 hover:text-ink">
                <Paperclip size={12} strokeWidth={1.8} />
                <span>Attach a signed page or email confirmation</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onSetAttachment(file.name);
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Footer — confirm toggle + timestamp */}
        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-ivory-warm/40 px-5 py-3">
          <div className="min-w-0 flex-1">
            {checked && confirmedDate ? (
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-sage">
                Confirmed {confirmedDate}
              </p>
            ) : (
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                Not yet confirmed
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleConfirmed}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
              checked
                ? "border-border bg-white text-ink-muted hover:text-ink"
                : "border-sage bg-sage text-white hover:bg-sage/90",
            )}
          >
            {checked ? (
              "Mark unconfirmed"
            ) : (
              <>
                <Check size={12} strokeWidth={2.4} />
                Mark confirmed
              </>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
