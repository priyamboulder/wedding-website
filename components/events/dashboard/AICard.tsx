"use client";

// ── AI card ────────────────────────────────────────────────────────────────
// The reusable card shell for any AI-generated output on the Events
// dashboard. Gold left-border rule (2px) distinguishes AI content from
// couple-entered content, per feature spec. Three-button footer:
// Keep · See alternatives · Refine with a note.

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RefreshCw, Sparkles, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

export type AICardStatus = "pending" | "accepted" | "refined" | "rejected";

export interface AICardProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
  status: AICardStatus;
  onKeep: () => void;
  onRegenerate: () => void;
  onRefine: (note: string) => void;
  // When true, shows a subtle "accepted" chip instead of the action row.
  compact?: boolean;
}

export function AICard({
  eyebrow,
  title,
  children,
  status,
  onKeep,
  onRegenerate,
  onRefine,
  compact,
}: AICardProps) {
  const [refining, setRefining] = useState(false);
  const [note, setNote] = useState("");

  function submitRefine() {
    const trimmed = note.trim();
    if (!trimmed) return;
    onRefine(trimmed);
    setNote("");
    setRefining(false);
  }

  return (
    <article
      className={cn(
        "relative overflow-hidden border border-border bg-white",
        "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-gold",
      )}
    >
      <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles size={11} strokeWidth={2} className="text-gold" />
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {eyebrow}
            </p>
          </div>
          <h3 className="mt-0.5 font-serif text-[18px] leading-tight text-ink">
            {title}
          </h3>
        </div>
        {status === "accepted" && (
          <span
            className="flex shrink-0 items-center gap-1 border border-ink bg-white px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Check size={9} strokeWidth={2.5} />
            Kept
          </span>
        )}
      </div>

      <div className="px-5 pb-4 text-[13.5px] leading-relaxed text-ink">
        {children}
      </div>

      {!compact && (
        <div className="border-t border-border/60 bg-white">
          <AnimatePresence initial={false} mode="wait">
            {refining ? (
              <motion.div
                key="refine"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-2 px-5 py-3">
                  <label
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Refine with a note
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    autoFocus
                    rows={2}
                    placeholder="e.g. same direction but less formal"
                    className="w-full resize-none border border-border bg-white px-3 py-2 font-serif italic text-[14px] leading-relaxed text-ink outline-none transition-colors focus:border-gold/60"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <CardFooterButton tone="ghost" onClick={() => setRefining(false)}>
                      Cancel
                    </CardFooterButton>
                    <CardFooterButton
                      tone="primary"
                      onClick={submitRefine}
                      disabled={!note.trim()}
                    >
                      Regenerate
                    </CardFooterButton>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-end gap-2 px-5 py-2.5"
              >
                <CardFooterButton tone="ghost" onClick={onRegenerate}>
                  <RefreshCw size={11} strokeWidth={1.8} />
                  See alternatives
                </CardFooterButton>
                <CardFooterButton tone="ghost" onClick={() => setRefining(true)}>
                  <MessageSquareText size={11} strokeWidth={1.8} />
                  Refine with a note
                </CardFooterButton>
                <CardFooterButton tone="primary" onClick={onKeep}>
                  <Check size={11} strokeWidth={2.2} />
                  Keep
                </CardFooterButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </article>
  );
}

function CardFooterButton({
  children,
  onClick,
  tone,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  tone: "primary" | "ghost";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40",
        tone === "primary" && "bg-ink text-white hover:opacity-90",
        tone === "ghost" && "text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
