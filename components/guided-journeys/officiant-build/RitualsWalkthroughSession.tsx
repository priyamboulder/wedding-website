"use client";

// ── Build Session 1 · Rituals walkthrough ────────────────────────────────
// Reads & writes through `usePanditStore` so this session is in permanent
// two-way sync with Tab 1 §5 of the full workspace. Each ritual is a
// three-state decision (including / discuss / skipping). The "discuss"
// state is the safety valve — couples shouldn't feel forced to decide on
// Kanyadaan or Vidaai right now; flagged rituals surface in their pandit
// conversation. Personal additions (vows, custom moments) live alongside.

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { computeCeremonySnapshot, usePanditStore } from "@/stores/pandit-store";
import {
  Eyebrow,
  MiniStat,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import type { RitualInclusion } from "@/types/pandit";

const DECISION_STATES: Array<{
  value: RitualInclusion;
  label: string;
  blurb: string;
  tone: "sage" | "saffron" | "ink";
}> = [
  {
    value: "yes",
    label: "Including",
    blurb: "Locked into the ceremony.",
    tone: "sage",
  },
  {
    value: "discuss",
    label: "Discuss with pandit",
    blurb: "Not sure yet — we'll surface this in your pandit chat.",
    tone: "saffron",
  },
  {
    value: "no",
    label: "Skipping",
    blurb: "Not part of this ceremony.",
    tone: "ink",
  },
];

export function RitualsWalkthroughSession() {
  const brief = usePanditStore((s) => s.brief);
  const rituals = usePanditStore((s) => s.rituals);
  const additions = usePanditStore((s) => s.additions);
  const setRitualInclusion = usePanditStore((s) => s.setRitualInclusion);
  const updateRitual = usePanditStore((s) => s.updateRitual);
  const addAddition = usePanditStore((s) => s.addAddition);
  const updateAddition = usePanditStore((s) => s.updateAddition);
  const deleteAddition = usePanditStore((s) => s.deleteAddition);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [newAddition, setNewAddition] = useState("");

  const snapshot = useMemo(
    () => computeCeremonySnapshot(rituals, brief, additions),
    [rituals, brief, additions],
  );
  const skipping = rituals.length - snapshot.included_rituals - snapshot.discussed_rituals;

  const sortedRituals = useMemo(
    () => [...rituals].sort((a, b) => a.sort_order - b.sort_order),
    [rituals],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-saffron/40 bg-saffron-pale/30 px-4 py-3 text-[12.5px] leading-relaxed text-ink">
        <div className="flex items-start gap-2">
          <MessageCircle
            size={14}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-saffron"
          />
          <div>
            <span className="font-medium">Not sure?</span> Mark anything for
            "Discuss with pandit" — we'll surface every flagged ritual in
            your officiant conversation, no decisions forced.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat
          label="Including"
          value={snapshot.included_rituals}
          hint="Locked in"
          tone="sage"
        />
        <MiniStat
          label="To discuss"
          value={snapshot.discussed_rituals}
          hint={
            snapshot.discussed_rituals > 0
              ? "Carries to pandit chat"
              : "All decided"
          }
          tone={snapshot.discussed_rituals > 0 ? "saffron" : "ink"}
        />
        <MiniStat
          label="Skipping"
          value={skipping}
          hint="Not in this ceremony"
        />
        <MiniStat
          label="Estimated runtime"
          value={`${snapshot.estimated_duration_min} min`}
          hint={`Target: ${
            brief.duration_target_min >= 180
              ? "open"
              : `${brief.duration_target_min} min`
          }`}
          tone={
            brief.duration_target_min >= 180 ||
            snapshot.estimated_duration_min <= brief.duration_target_min + 10
              ? "ink"
              : "saffron"
          }
        />
      </div>

      {/* ── Rituals list ─────────────────────────────────────────────── */}
      <PanelCard
        icon={<Sparkles size={14} strokeWidth={1.6} />}
        title="Decide on each ritual"
      >
        <div className="space-y-2">
          {sortedRituals.map((r) => {
            const open = expanded === r.id;
            return (
              <div
                key={r.id}
                className={cn(
                  "rounded-md border transition-colors",
                  r.inclusion === "yes"
                    ? "border-sage/40 bg-sage-pale/15"
                    : r.inclusion === "discuss"
                      ? "border-amber-400/60 bg-amber-50/60"
                      : "border-border bg-ivory-warm/30",
                )}
              >
                <div className="flex items-start gap-3 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : r.id)}
                    aria-expanded={open}
                    className="flex flex-1 items-start gap-2 text-left"
                  >
                    {open ? (
                      <ChevronDown
                        size={13}
                        strokeWidth={1.8}
                        className="mt-1 shrink-0 text-ink-muted"
                      />
                    ) : (
                      <ChevronRight
                        size={13}
                        strokeWidth={1.8}
                        className="mt-1 shrink-0 text-ink-muted"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-serif text-[15px] leading-tight text-ink">
                        {r.name_english}
                        {r.name_sanskrit && (
                          <span
                            className="ml-2 font-mono text-[10px] text-ink-muted"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {r.name_sanskrit}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
                        {r.short_description}
                      </div>
                    </div>
                  </button>
                  <span
                    className="shrink-0 font-mono text-[10px] tabular-nums text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {r.included_duration_min} min
                  </span>
                </div>

                {/* Three-state decision row */}
                <div className="flex flex-wrap gap-1.5 border-t border-border/40 px-3 py-2">
                  {DECISION_STATES.map((state) => {
                    const active = r.inclusion === state.value;
                    return (
                      <button
                        key={state.value}
                        type="button"
                        onClick={() => setRitualInclusion(r.id, state.value)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
                          active
                            ? state.tone === "sage"
                              ? "border-sage bg-sage-pale/50 text-sage"
                              : state.tone === "saffron"
                                ? "border-saffron bg-saffron-pale/40 text-saffron"
                                : "border-border bg-ivory-warm/60 text-ink-muted"
                            : "border-border bg-white text-ink-muted hover:border-saffron/40",
                        )}
                      >
                        {state.label}
                      </button>
                    );
                  })}
                </div>

                {open && (
                  <div className="space-y-3 border-t border-border/40 px-3 py-3">
                    {r.meaning && (
                      <div>
                        <Eyebrow className="mb-1">Meaning</Eyebrow>
                        <p className="text-[12px] leading-relaxed text-ink-muted">
                          {r.meaning}
                        </p>
                      </div>
                    )}
                    <div>
                      <Eyebrow className="mb-1">Your notes</Eyebrow>
                      <textarea
                        value={r.couple_notes}
                        onChange={(e) =>
                          updateRitual(r.id, { couple_notes: e.target.value })
                        }
                        rows={2}
                        placeholder="Family notes, abbreviations to discuss with the pandit, sensitivities…"
                        className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PanelCard>

      {/* ── Personal additions ──────────────────────────────────────── */}
      <PanelCard
        icon={<Plus size={14} strokeWidth={1.6} />}
        title="Personal additions"
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          Anything outside the traditional library — your own English vows,
          a poem, a moment for an absent grandparent. These get woven into
          your ceremony script in Tab 3.
        </p>
        {additions.length > 0 && (
          <ul className="mb-3 space-y-2">
            {additions
              .slice()
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((a) => (
                <li
                  key={a.id}
                  className="group flex items-start gap-2 rounded-md border border-border bg-white px-3 py-2"
                >
                  <textarea
                    value={a.body}
                    onChange={(e) => updateAddition(a.id, e.target.value)}
                    rows={2}
                    className="flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-[12.5px] text-ink hover:border-border focus:border-saffron focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => deleteAddition(a.id)}
                    aria-label="Remove"
                    className="rounded p-1 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-ivory-warm/70 hover:text-rose"
                  >
                    <Trash2 size={12} strokeWidth={1.8} />
                  </button>
                </li>
              ))}
          </ul>
        )}
        <div className="flex flex-wrap items-start gap-2">
          <textarea
            value={newAddition}
            onChange={(e) => setNewAddition(e.target.value)}
            placeholder="e.g. We'd like our own vows in English right after saptapadi"
            rows={2}
            className="flex-1 min-w-[200px] rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              const v = newAddition.trim();
              if (!v) return;
              addAddition(v);
              setNewAddition("");
            }}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-2 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Plus size={12} strokeWidth={2} /> Add
          </button>
        </div>
      </PanelCard>

      {/* Sticky footer recap */}
      <div className="sticky bottom-0 -mx-2 mt-2 rounded-md border border-saffron/40 bg-ivory px-3 py-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink">
          <span className="font-medium">{snapshot.included_rituals} including</span>
          <span className="text-ink-muted">·</span>
          <span className="text-saffron">{snapshot.discussed_rituals} to discuss</span>
          <span className="text-ink-muted">·</span>
          <span className="text-ink-muted">
            ~{snapshot.estimated_duration_min} min runtime
          </span>
          {snapshot.estimated_duration_min >
            brief.duration_target_min + 10 &&
            brief.duration_target_min < 180 && (
              <span className="ml-auto inline-flex items-center gap-1 text-saffron">
                <AlertCircle size={11} strokeWidth={1.8} />
                Over your {brief.duration_target_min} min target
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
