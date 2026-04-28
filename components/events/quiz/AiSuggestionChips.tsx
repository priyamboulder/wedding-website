"use client";

// ── AI suggestion chips ────────────────────────────────────────────────────
// 2×2 grid at the top of the per-event canvas. Each card shows a vibe
// direction — 2-word label, evocative event name, one-line theme. Tap to
// select. Below the grid sit three controls: Generate more, Refine with
// a note, Write my own.

import { useState, type ReactNode } from "react";
import { Check, MessageSquareText, Pencil, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VibeOption } from "@/types/events";

interface Props {
  options: VibeOption[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onGenerateMore: () => void;
  onRefine: (note: string) => void;
  // Enters "Write my own" mode: the chips collapse and the couple gets
  // two plain inputs. Values flow back via onCustomSubmit.
  writeMyOwn: { name: string; theme: string } | null;
  onEnterWriteMyOwn: () => void;
  onExitWriteMyOwn: () => void;
  onCustomSubmit: (name: string, theme: string) => void;
  // Loading flag — disables controls while a generation round is running.
  generating?: boolean;
}

export function AiSuggestionChips({
  options,
  selectedIndex,
  onSelect,
  onGenerateMore,
  onRefine,
  writeMyOwn,
  onEnterWriteMyOwn,
  onExitWriteMyOwn,
  onCustomSubmit,
  generating,
}: Props) {
  const [refining, setRefining] = useState(false);
  const [note, setNote] = useState("");

  if (writeMyOwn) {
    return (
      <WriteMyOwn
        value={writeMyOwn}
        onExit={onExitWriteMyOwn}
        onSubmit={onCustomSubmit}
      />
    );
  }

  return (
    <section>
      <Header
        left={
          <>
            <Sparkles size={11} strokeWidth={2} className="text-gold" />
            <span>AI suggests — pick one, or generate more</span>
          </>
        }
      />

      <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {options.map((opt, i) => {
          const on = i === selectedIndex;
          return (
            <li key={`${opt.vibeLabel}-${i}`}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-pressed={on}
                className={cn(
                  "group relative flex w-full flex-col gap-1.5 border-l-2 border-gold bg-white px-4 py-3.5 text-left transition-all",
                  on
                    ? "border-y border-r border-y-ink border-r-ink"
                    : "border-y border-r border-y-border border-r-border hover:border-y-ink/40 hover:border-r-ink/40",
                )}
              >
                <span
                  className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {opt.vibeLabel}
                </span>
                <span className="font-serif text-[20px] leading-tight text-ink">
                  {opt.eventName}
                </span>
                <span className="text-[12.5px] leading-snug text-ink-muted">
                  {opt.theme}
                </span>
                {on && (
                  <span className="absolute right-3 top-3 flex h-3 w-3 items-center justify-center bg-ink text-white">
                    <Check size={8} strokeWidth={3} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {refining ? (
        <div className="mt-4 border border-border bg-white px-4 py-3">
          <label
            className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
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
            className="mt-2 w-full resize-none border border-border bg-white px-3 py-2 font-serif italic text-[14px] leading-relaxed text-ink outline-none transition-colors focus:border-ink/60"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <ChipButton tone="ghost" onClick={() => { setRefining(false); setNote(""); }}>
              Cancel
            </ChipButton>
            <ChipButton
              tone="primary"
              onClick={() => {
                const trimmed = note.trim();
                if (!trimmed) return;
                onRefine(trimmed);
                setNote("");
                setRefining(false);
              }}
              disabled={!note.trim() || generating}
            >
              Regenerate
            </ChipButton>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ChipButton tone="ghost" onClick={onGenerateMore} disabled={generating}>
            <RefreshCw size={11} strokeWidth={1.8} />
            Generate more
          </ChipButton>
          <ChipButton tone="ghost" onClick={() => setRefining(true)} disabled={generating}>
            <MessageSquareText size={11} strokeWidth={1.8} />
            Refine with a note
          </ChipButton>
          <ChipButton tone="ghost" onClick={onEnterWriteMyOwn}>
            <Pencil size={11} strokeWidth={1.8} />
            Write my own
          </ChipButton>
        </div>
      )}
    </section>
  );
}

function WriteMyOwn({
  value,
  onExit,
  onSubmit,
}: {
  value: { name: string; theme: string };
  onExit: () => void;
  onSubmit: (name: string, theme: string) => void;
}) {
  const [name, setName] = useState(value.name);
  const [theme, setTheme] = useState(value.theme);

  return (
    <section>
      <Header
        left={
          <>
            <Pencil size={11} strokeWidth={1.8} className="text-ink-muted" />
            <span>Your own name and theme</span>
          </>
        }
      />
      <div className="mt-3 space-y-3 border border-border bg-white px-4 py-4">
        <div>
          <label
            className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Event name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => onSubmit(name, theme)}
            placeholder="e.g. A Night in Bombay"
            className="mt-1 w-full border border-border bg-white px-3 py-2 font-serif text-[16px] text-ink outline-none transition-colors focus:border-ink/60"
          />
        </div>
        <div>
          <label
            className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Theme
          </label>
          <textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            onBlur={() => onSubmit(name, theme)}
            rows={2}
            placeholder="One sentence — the feeling, the palette direction, the register"
            className="mt-1 w-full resize-none border border-border bg-white px-3 py-2 text-[13.5px] leading-relaxed text-ink outline-none transition-colors focus:border-ink/60"
          />
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1 text-[11.5px] text-ink-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Get AI suggestions again
          </button>
        </div>
      </div>
    </section>
  );
}

function Header({ left }: { left: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {left && (
        <p
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {left}
        </p>
      )}
    </div>
  );
}

function ChipButton({
  children,
  tone,
  onClick,
  disabled,
}: {
  children: ReactNode;
  tone: "primary" | "ghost";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 text-[11.5px] font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40",
        tone === "primary" && "bg-ink text-white hover:opacity-90",
        tone === "ghost" && "border border-border bg-white text-ink-muted hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
