"use client";

// ── Itinerary tab ─────────────────────────────────────────────────────────
// Linear run-of-show. Block types render with distinct styling —
// ★ HIGHLIGHT for the smash, ★ CEREMONY for ritual moments (reverent),
// 🔒 HOST ONLY for setup/cleanup, ⚠️ NAP WINDOW when nap time conflicts.

import {
  Baby,
  CalendarClock,
  Lock,
  Moon,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useFirstBirthdayStore } from "@/stores/first-birthday-store";
import type {
  FirstBirthdayBlockType,
  FirstBirthdayItineraryItem,
  FirstBirthdayPhase,
} from "@/types/first-birthday";
import { Section, TextArea, TextInput } from "../../bachelorette/ui";

const PHASE_LABEL: Record<Exclude<FirstBirthdayPhase, null>, string> = {
  setup: "Setup & Prep",
  ceremony: "Ceremony",
  transition: "Transition",
  party: "Party",
  cleanup: "Cleanup",
};

const BLOCK_META: Record<
  FirstBirthdayBlockType,
  { label: string; cls: string; Icon: typeof Sparkles }
> = {
  standard: {
    label: "Standard",
    cls: "border-border bg-white",
    Icon: Sparkles,
  },
  highlight: {
    label: "★ Highlight",
    cls: "border-saffron/50 bg-saffron-pale/30",
    Icon: Sparkles,
  },
  ceremony: {
    label: "★ Ceremony",
    cls: "border-gold/50 bg-gold-pale/20",
    Icon: Baby,
  },
  optional: {
    label: "Optional",
    cls: "border-border/60 bg-ivory-warm/40",
    Icon: Sparkles,
  },
  host_only: {
    label: "🔒 Host only",
    cls: "border-ink/20 bg-ivory-warm/60",
    Icon: Lock,
  },
  nap_window: {
    label: "⚠ Nap window",
    cls: "border-rose/40 bg-rose-pale/25",
    Icon: Moon,
  },
};

export function ItineraryTab() {
  const itinerary = useFirstBirthdayStore((s) => s.itinerary);
  const addItem = useFirstBirthdayStore((s) => s.addItineraryItem);

  const ordered = useMemo(
    () => [...itinerary].sort((a, b) => a.sortOrder - b.sortOrder),
    [itinerary],
  );

  if (ordered.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-5">
      <HeaderCard count={ordered.length} />
      <div className="space-y-2">
        {ordered.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          addItem({
            dayNumber: 1,
            phase: "party",
            startTime: "",
            durationMinutes: 30,
            activityName: "",
            description: "",
            blockType: "standard",
            kidSafetyNote: "",
            sortOrder: ordered.length,
            sourceRecId: null,
          })
        }
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-2 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
      >
        <Plus size={12} strokeWidth={2} /> Add block
      </button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Section
      eyebrow="YOUR CELEBRATION FLOW"
      title="Your itinerary starts in Discover"
      description="Pick a theme, ceremony, or activity in Discover and it'll land here — or add blocks manually below."
    >
      <div className="flex items-center justify-center rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-12 text-center">
        <div className="max-w-md">
          <CalendarClock
            size={28}
            strokeWidth={1.3}
            className="mx-auto mb-3 text-ink-faint"
          />
          <p className="font-serif text-[17px] leading-snug text-ink">
            Browse ideas first
          </p>
          <p className="mt-1.5 text-[12.5px] text-ink-muted">
            The Discover tab suggests ceremony guides, themes, and activities
            scored to your vibe — one click drops them here.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ── Header ────────────────────────────────────────────────────────────────

function HeaderCard({ count }: { count: number }) {
  const plan = useFirstBirthdayStore((s) => s.plan);
  return (
    <Section
      eyebrow="YOUR CELEBRATION FLOW"
      title={`${count} block${count === 1 ? "" : "s"} · ${plan.partyDate || "Date TBD"}`}
      description="Edit inline. Nap windows are flagged based on the time you set in Plan & Vibe — avoid scheduling the smash cake during nap."
    >
      {plan.napTime && (
        <p className="inline-flex items-center gap-1.5 rounded-md border border-rose/30 bg-rose-pale/20 px-3 py-1.5 text-[12px] text-ink">
          <Moon size={12} strokeWidth={1.8} className="text-rose" />
          Nap time on file: <span className="font-medium">{plan.napTime}</span>
        </p>
      )}
    </Section>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────

function ItemRow({ item }: { item: FirstBirthdayItineraryItem }) {
  const updateItem = useFirstBirthdayStore((s) => s.updateItineraryItem);
  const removeItem = useFirstBirthdayStore((s) => s.removeItineraryItem);
  const meta = BLOCK_META[item.blockType];
  const Icon = meta.Icon;

  return (
    <article className={cn("rounded-md border p-4 transition-colors", meta.cls)}>
      <div className="flex items-start gap-3">
        <div className="flex w-16 shrink-0 flex-col items-start gap-1">
          <input
            type="time"
            value={item.startTime}
            onChange={(e) => updateItem(item.id, { startTime: e.target.value })}
            className="w-full rounded-md border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
            aria-label={`${item.activityName || "Item"} start time`}
          />
          <div className="flex items-center gap-1 text-[11px] text-ink-muted">
            <input
              type="number"
              value={item.durationMinutes}
              onChange={(e) =>
                updateItem(item.id, {
                  durationMinutes: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-12 rounded-md border border-border bg-white px-1.5 py-0.5 text-center text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
              aria-label="Duration in minutes"
            />
            <span>min</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
                item.blockType === "ceremony"
                  ? "border-gold/50 bg-gold-pale/40 text-gold"
                  : item.blockType === "highlight"
                    ? "border-saffron/40 bg-saffron-pale/40 text-saffron"
                    : item.blockType === "nap_window"
                      ? "border-rose/40 bg-rose-pale/40 text-rose"
                      : item.blockType === "host_only"
                        ? "border-ink/30 bg-ink/5 text-ink"
                        : "border-border bg-white text-ink-muted",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Icon size={10} strokeWidth={2} /> {meta.label}
            </span>
            {item.phase && (
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                {PHASE_LABEL[item.phase]}
              </span>
            )}
            <select
              value={item.blockType}
              onChange={(e) =>
                updateItem(item.id, {
                  blockType: e.target.value as FirstBirthdayBlockType,
                })
              }
              className="ml-auto rounded-md border border-border bg-white px-2 py-0.5 text-[11.5px] text-ink focus:border-saffron/60 focus:outline-none"
              aria-label="Block type"
            >
              <option value="standard">Standard</option>
              <option value="highlight">Highlight</option>
              <option value="ceremony">Ceremony</option>
              <option value="optional">Optional</option>
              <option value="host_only">Host only</option>
              <option value="nap_window">Nap window</option>
            </select>
            <select
              value={item.phase ?? ""}
              onChange={(e) =>
                updateItem(item.id, {
                  phase: (e.target.value || null) as FirstBirthdayPhase | null,
                })
              }
              className="rounded-md border border-border bg-white px-2 py-0.5 text-[11.5px] text-ink focus:border-saffron/60 focus:outline-none"
              aria-label="Phase"
            >
              <option value="">—</option>
              <option value="setup">Setup</option>
              <option value="ceremony">Ceremony</option>
              <option value="transition">Transition</option>
              <option value="party">Party</option>
              <option value="cleanup">Cleanup</option>
            </select>
          </div>

          <TextInput
            value={item.activityName}
            onChange={(v) => updateItem(item.id, { activityName: v })}
            placeholder="What's happening?"
          />
          <TextArea
            value={item.description}
            onChange={(v) => updateItem(item.id, { description: v })}
            placeholder="A short description"
            rows={2}
          />

          {item.kidSafetyNote && (
            <div className="rounded-md border border-rose/30 bg-rose-pale/20 px-3 py-2 text-[12px] text-ink">
              <span
                className="mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-rose"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Kid safety
              </span>
              {item.kidSafetyNote}
            </div>
          )}
          {!item.kidSafetyNote && (
            <button
              type="button"
              onClick={() =>
                updateItem(item.id, {
                  kidSafetyNote: "Add a kid-safety note…",
                })
              }
              className="text-[11.5px] font-medium text-ink-faint hover:text-saffron"
            >
              + Add kid-safety note
            </button>
          )}
        </div>

        <button
          type="button"
          aria-label="Remove block"
          onClick={() => removeItem(item.id)}
          className="shrink-0 text-ink-faint hover:text-rose"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </div>
    </article>
  );
}
