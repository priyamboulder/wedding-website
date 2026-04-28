"use client";

// ── Quick Capture tab ──────────────────────────────────────────────────────
// The junk drawer. One combined input — paste, type, drop — hit save. No
// title, no tag, auto-dated. Recent captures list underneath, each convertible
// to a full Note via "Turn into note".

import { ArrowRight, Image as ImageIcon, Link2, NotebookPen, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNotesIdeasStore } from "@/stores/notes-ideas-store";
import type { QuickCapture } from "@/types/notes-ideas";
import { Section, TextArea, formatRelative } from "../ui";

export function QuickCaptureTab() {
  const captures = useNotesIdeasStore((s) => s.captures);
  const addCapture = useNotesIdeasStore((s) => s.addCapture);
  const deleteCapture = useNotesIdeasStore((s) => s.deleteCapture);
  const promote = useNotesIdeasStore((s) => s.promoteCaptureToNote);

  const [draft, setDraft] = useState("");

  function save() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addCapture({ content: trimmed });
    setDraft("");
  }

  return (
    <div className="space-y-5">
      <Section
        eyebrow="QUICK CAPTURE"
        title="For when you're scrolling at 11 PM and see something"
        description="Paste a link, drop an image, or just type. We'll auto-tag it as an idea and stamp the time for you."
      >
        <div className="space-y-3">
          <TextArea
            value={draft}
            onChange={setDraft}
            placeholder="Paste a link, drop an image, or just type…"
            rows={4}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                save();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Auto-tagged: idea · Auto-dated: now · Cmd/Ctrl+Enter to save
            </p>
            <button
              type="button"
              onClick={save}
              disabled={!draft.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save <ArrowRight size={13} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="RECENT QUICK CAPTURES"
        title="Everything you've caught lately"
        description="Half-formed, unsorted, and that's the point. Turn any of these into a full note when it matters."
        tone="muted"
      >
        {captures.length === 0 ? (
          <p className="py-6 text-center text-[13px] italic text-ink-faint">
            Nothing captured yet. The box above is waiting.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {captures.map((c) => (
              <CaptureRow
                key={c.id}
                capture={c}
                onDelete={() => deleteCapture(c.id)}
                onPromote={() => promote(c.id)}
              />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function CaptureRow({
  capture,
  onDelete,
  onPromote,
}: {
  capture: QuickCapture;
  onDelete: () => void;
  onPromote: () => void;
}) {
  const Icon =
    capture.kind === "link"
      ? Link2
      : capture.kind === "image"
        ? ImageIcon
        : NotebookPen;
  const primary = capture.previewLabel ?? capture.content;

  return (
    <li className="group flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-white text-ink-muted">
        <Icon size={13} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-ink">{primary}</p>
        {capture.previewLabel && capture.content && (
          <p className="truncate text-[11.5px] text-ink-faint">
            {capture.content}
          </p>
        )}
      </div>
      <time
        className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {formatRelative(capture.capturedAt)}
      </time>
      <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onPromote}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Turn into note
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete capture"
          className="text-ink-faint hover:text-rose"
        >
          <Trash2 size={12} strokeWidth={1.8} />
        </button>
      </div>
    </li>
  );
}
