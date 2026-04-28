"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChecklistItem, Phase } from "@/types/checklist";
import { useShoppingLinks } from "@/contexts/ShoppingLinksContext";

function splitUrls(raw: string): string[] {
  return raw
    .split(/[\n,]+|\s{2,}/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s) || /^[\w-]+\.[\w.-]+/.test(s));
}

export function AddItemModal({
  open,
  onClose,
  phases,
  items,
  defaultModule,
}: {
  open: boolean;
  onClose: () => void;
  phases: Phase[];
  items: ChecklistItem[];
  defaultModule?: string | null;
}) {
  const { addStandaloneLink } = useShoppingLinks();
  const [urls, setUrls] = useState("");
  const [moduleId, setModuleId] = useState<string | null>(
    defaultModule ?? null,
  );
  const [taskId, setTaskId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setUrls("");
    setModuleId(defaultModule ?? null);
    setTaskId(null);
    setNote("");
    setQuantity(1);
    setError(null);
    setBusy(false);
    // Defer focus so the modal fade-in has started
    setTimeout(() => textareaRef.current?.focus(), 80);
  }, [open, defaultModule]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, busy]);

  const tasksForModule = useMemo(() => {
    if (!moduleId) return [];
    return items.filter((it) => it.phase_id === moduleId);
  }, [items, moduleId]);

  const parsedUrls = useMemo(() => splitUrls(urls), [urls]);
  const canSubmit = parsedUrls.length > 0 && !busy;

  async function handleSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);

    // If a task is chosen without a module, auto-infer
    let finalModule = moduleId;
    if (taskId) {
      const it = items.find((i) => i.id === taskId);
      if (it) finalModule = it.phase_id;
    }

    try {
      await Promise.all(
        parsedUrls.map((u) =>
          addStandaloneLink(u, {
            module: finalModule,
            taskId,
            note: note.trim() || undefined,
            quantity,
          }).catch((err) => {
            console.error("[add-item] failed:", err);
          }),
        ),
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add items");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={busy ? undefined : onClose}
            className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-[1px]"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Add shopping item"
            className="fixed left-1/2 top-1/2 z-50 w-[min(520px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-white shadow-[0_12px_40px_rgba(26,26,26,0.16)]"
          >
            <div className="flex items-center justify-between border-b border-gold/15 px-5 py-3">
              <div className="flex items-center gap-2">
                <Plus size={14} strokeWidth={1.8} className="text-gold" />
                <h2 className="font-serif text-[16px] text-ink">Add shopping item</h2>
              </div>
              <button
                onClick={onClose}
                disabled={busy}
                aria-label="Close"
                className="rounded-md p-1 text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink disabled:opacity-40"
              >
                <X size={14} strokeWidth={1.6} />
              </button>
            </div>

            <div className="flex flex-col gap-4 px-5 py-4">
              {/* URL input */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Product links
                </span>
                <div className="flex items-start gap-2 rounded-lg border border-border bg-white px-3 py-2 focus-within:border-gold/50">
                  {busy ? (
                    <Loader2
                      size={13}
                      strokeWidth={1.6}
                      className="mt-0.5 shrink-0 animate-spin text-ink-faint"
                    />
                  ) : (
                    <LinkIcon
                      size={13}
                      strokeWidth={1.6}
                      className="mt-1 shrink-0 text-ink-faint"
                    />
                  )}
                  <textarea
                    ref={textareaRef}
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                    placeholder="Paste product link… (one per line for multiple)"
                    disabled={busy}
                    rows={2}
                    className="min-h-[44px] flex-1 resize-y bg-transparent text-[13px] text-ink-soft outline-none placeholder:text-ink-faint/60 disabled:opacity-60"
                  />
                </div>
                {parsedUrls.length > 1 && (
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider text-saffron"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {parsedUrls.length} links detected
                  </span>
                )}
              </div>

              {/* Module + task */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Module{" "}
                    <span className="ml-0.5 font-normal normal-case tracking-normal text-ink-faint/70">
                      (optional)
                    </span>
                  </span>
                  <select
                    value={moduleId ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setModuleId(v === "" ? null : v);
                      setTaskId(null);
                    }}
                    disabled={busy}
                    className="rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink outline-none focus:border-gold disabled:opacity-60"
                  >
                    <option value="">— Unassigned —</option>
                    {phases.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  className={cn(
                    "flex flex-col gap-1.5 transition-opacity",
                    moduleId ? "opacity-100" : "opacity-40",
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Task{" "}
                    <span className="ml-0.5 font-normal normal-case tracking-normal text-ink-faint/70">
                      (optional)
                    </span>
                  </span>
                  <select
                    value={taskId ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTaskId(v === "" ? null : v);
                    }}
                    disabled={!moduleId || busy}
                    className="rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink outline-none focus:border-gold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">— No specific task —</option>
                    {tasksForModule.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note + quantity */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Note{" "}
                  <span className="ml-0.5 font-normal normal-case tracking-normal text-ink-faint/70">
                    (optional)
                  </span>
                </span>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={busy}
                  placeholder="e.g. sangeet — back row"
                  className="rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink-soft outline-none placeholder:text-ink-faint/60 focus:border-gold disabled:opacity-60"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Quantity
                </span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (Number.isFinite(n) && n > 0) setQuantity(n);
                  }}
                  disabled={busy}
                  className="w-16 rounded-md border border-border bg-white px-2 py-1 text-right font-mono text-[12px] text-ink outline-none focus:border-gold disabled:opacity-60"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
                <span className="text-[11px] text-ink-faint">
                  Status defaults to <em className="not-italic text-ink-soft">Considering</em>
                </span>
              </div>

              {error && (
                <div className="rounded-md border border-rose/30 bg-rose-pale/40 px-3 py-1.5 text-[11.5px] text-rose">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-ivory/40 px-5 py-3">
              <button
                onClick={onClose}
                disabled={busy}
                className="rounded-md px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 size={12} strokeWidth={1.8} className="animate-spin" />
                ) : (
                  <Plus size={12} strokeWidth={1.8} />
                )}
                {parsedUrls.length > 1
                  ? `Add ${parsedUrls.length} items`
                  : "Add item"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
