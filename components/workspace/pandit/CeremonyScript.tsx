"use client";

// ── Ceremony Script ───────────────────────────────────────────────────────
// The collaborative document between couple and pandit. Expandable cards for
// each included ritual — what happens, music, photography, guest
// instruction, couple's notes. Reorderable and abbreviable so duration is
// tunable in the open.

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Camera,
  ChevronDown,
  ChevronRight,
  FileDown,
  Music2,
  PenLine,
  Printer,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { computeCeremonySnapshot, usePanditStore } from "@/stores/pandit-store";
import type { CeremonyRitual } from "@/types/pandit";
import {
  Eyebrow,
  MiniStat,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import { SaptapadiVows } from "@/components/workspace/pandit/SaptapadiVows";

// Rituals that trigger the Saptapadi personal vows composer. Both pheras
// (the seven circles around the fire) and saptapadi (the seven steps) carry
// the same seven-round structure in Vedic ceremonies.
const SAPTAPADI_RITUAL_IDS = new Set(["rit-pheras", "rit-saptapadi"]);

export function CeremonyScript() {
  const rituals = usePanditStore((s) => s.rituals);
  const additions = usePanditStore((s) => s.additions);
  const brief = usePanditStore((s) => s.brief);
  const updateRitual = usePanditStore((s) => s.updateRitual);
  const moveRitual = usePanditStore((s) => s.moveRitual);
  const snapshot = useMemo(
    () => computeCeremonySnapshot(rituals, brief, additions),
    [rituals, brief, additions],
  );

  const [showSkipped, setShowSkipped] = useState(false);

  const ordered = useMemo(
    () =>
      [...rituals]
        .filter((r) => showSkipped || r.inclusion !== "no")
        .sort((a, b) => a.sort_order - b.sort_order),
    [rituals, showSkipped],
  );

  const skippedCount = useMemo(
    () => rituals.filter((r) => r.inclusion === "no").length,
    [rituals],
  );

  const [expanded, setExpanded] = useState<string | null>(ordered[0]?.id ?? null);

  const scriptRuntime = ordered
    .filter((r) => r.inclusion === "yes")
    .reduce(
      (acc, r) =>
        acc + (r.abbreviated ? Math.round(r.included_duration_min / 2) : r.included_duration_min),
      0,
    );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Ceremony Script"
        title="Your play-by-play — the document you'll share with your officiant"
        description="This is the execution document — ordering, timing, cues, and coordination. Ritual selection lives in Vision & Ceremony Brief; whatever you include there flows here automatically. Reorder to match your order-of-service. Abbreviate to cut duration without dropping a ritual."
        right={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
            onClick={() => window.print()}
          >
            <FileDown size={12} strokeWidth={1.8} />
            Export run-of-show
          </button>
        }
      />

      {/* ── One-way data-flow banner ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-gold/40 bg-ivory-warm/40 px-3 py-2.5 text-[12px]">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-saffron/15 text-saffron">
          <BookOpen size={12} strokeWidth={1.6} />
        </span>
        <div className="flex-1 min-w-[220px] text-ink-muted">
          Ritual inclusion is set in{" "}
          <span className="font-medium text-ink">
            Vision & Ceremony Brief
          </span>
          . This tab focuses on running the ceremony — ordering, timing,
          cues, and the per-ritual notes you'll share with your officiant.
        </div>
        {skippedCount > 0 && (
          <label className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
            <input
              type="checkbox"
              checked={showSkipped}
              onChange={(e) => setShowSkipped(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
            />
            Show {skippedCount} skipped ritual{skippedCount === 1 ? "" : "s"}
          </label>
        )}
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat
          label="Rituals in script"
          value={snapshot.included_rituals}
          hint={
            snapshot.discussed_rituals > 0
              ? `${snapshot.discussed_rituals} flagged`
              : "All decided"
          }
        />
        <MiniStat
          label="Script runtime"
          value={`${scriptRuntime} min`}
          hint="Sum of ritual durations"
          tone="saffron"
        />
        <MiniStat
          label="Personal additions"
          value={additions.length}
          hint="Woven between rituals"
        />
        <MiniStat
          label="Order"
          value="Drag to reorder"
          hint="Use ↑↓ per card"
        />
      </div>

      {/* ── Personal additions callout ────────────────────────────────── */}
      {additions.length > 0 && (
        <PanelCard
          icon={<PenLine size={14} strokeWidth={1.6} />}
          title="Your personal moments"
        >
          <p className="mb-2 text-[12px] text-ink-muted">
            These aren't traditional rituals — they're yours. Discuss
            placement with your officiant during the pre-ceremony meeting.
          </p>
          <ul className="space-y-1.5">
            {additions.map((a) => (
              <li
                key={a.id}
                className="flex gap-2 rounded-sm bg-saffron-pale/20 px-3 py-2 text-[12.5px] italic text-ink"
              >
                <span className="text-saffron">·</span>
                {a.body}
              </li>
            ))}
          </ul>
        </PanelCard>
      )}

      {/* ── Ritual cards ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        {ordered.map((r, idx) => {
          const skipped = r.inclusion === "no";
          const open = expanded === r.id;
          return (
            <article
              key={r.id}
              className={cn(
                "rounded-lg border transition-all",
                skipped
                  ? "border-dashed border-stone-300 bg-ivory-warm/20 opacity-60"
                  : r.inclusion === "discuss"
                    ? "border-amber-400/60 bg-amber-50/40"
                    : "border-border bg-white",
              )}
            >
              <header className="flex items-center gap-3 px-4 py-3">
                <span
                  className="font-mono text-[10px] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : r.id)}
                  className="flex flex-1 items-center gap-2 text-left"
                  aria-expanded={open}
                >
                  {open ? (
                    <ChevronDown size={14} strokeWidth={1.8} />
                  ) : (
                    <ChevronRight size={14} strokeWidth={1.8} />
                  )}
                  <div>
                    <h4 className="font-serif text-[17px] leading-tight text-ink">
                      {r.name_english}
                      <span
                        className="ml-2.5 font-mono text-[10.5px] text-ink-muted"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {r.name_sanskrit}
                      </span>
                    </h4>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {r.short_description}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  {r.inclusion === "discuss" && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                      <AlertCircle size={10} strokeWidth={2} />
                      discuss
                    </span>
                  )}
                  {r.abbreviated && (
                    <span
                      className="rounded-sm bg-ink-soft/80 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ivory"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      abbreviated
                    </span>
                  )}
                  <span
                    className="font-mono text-[10.5px] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {r.abbreviated
                      ? Math.round(r.included_duration_min / 2)
                      : r.included_duration_min}{" "}
                    min
                  </span>
                  <div className="flex overflow-hidden rounded-sm border border-border">
                    <button
                      type="button"
                      onClick={() => moveRitual(r.id, "up")}
                      disabled={idx === 0}
                      className="p-1 text-ink-muted hover:bg-ivory-warm hover:text-ink disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp size={11} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRitual(r.id, "down")}
                      disabled={idx === ordered.length - 1}
                      className="p-1 text-ink-muted hover:bg-ivory-warm hover:text-ink disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown size={11} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </header>

              {open && !skipped && (
                <div className="space-y-3 border-t border-border/60 px-4 py-4">
                  <ScriptField
                    label="Meaning"
                    value={r.meaning}
                    onChange={(v) => updateRitual(r.id, { meaning: v })}
                    rows={3}
                  />
                  <ScriptField
                    label="What happens (physical description)"
                    value={r.what_happens}
                    onChange={(v) => updateRitual(r.id, { what_happens: v })}
                    rows={3}
                  />
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <ScriptField
                      icon={<Users2 size={11} strokeWidth={1.8} />}
                      label="Traditional participants"
                      value={r.traditional_participants}
                      onChange={(v) =>
                        updateRitual(r.id, { traditional_participants: v })
                      }
                      rows={2}
                    />
                    <ScriptField
                      icon={<AlertCircle size={11} strokeWidth={1.8} />}
                      label="Guest instruction"
                      value={r.guest_instruction}
                      onChange={(v) =>
                        updateRitual(r.id, { guest_instruction: v })
                      }
                      rows={2}
                    />
                    <ScriptField
                      icon={<Music2 size={11} strokeWidth={1.8} />}
                      label="Music / audio"
                      value={r.music_note}
                      onChange={(v) => updateRitual(r.id, { music_note: v })}
                      rows={2}
                    />
                    <ScriptField
                      icon={<Camera size={11} strokeWidth={1.8} />}
                      label="Photography note"
                      value={r.photography_note}
                      onChange={(v) =>
                        updateRitual(r.id, { photography_note: v })
                      }
                      rows={2}
                    />
                  </div>
                  <ScriptField
                    icon={<PenLine size={11} strokeWidth={1.8} />}
                    label="Our notes (for the officiant)"
                    value={r.couple_notes}
                    onChange={(v) => updateRitual(r.id, { couple_notes: v })}
                    rows={2}
                  />
                  <div className="flex items-center justify-between rounded-md bg-ivory-warm/50 px-3 py-2">
                    <label className="flex items-center gap-2 text-[12px] text-ink">
                      <input
                        type="checkbox"
                        checked={r.abbreviated}
                        onChange={(e) =>
                          updateRitual(r.id, { abbreviated: e.target.checked })
                        }
                        className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
                      />
                      Abbreviate — officiant performs the mantra but doesn't
                      explain.
                    </label>
                    <span
                      className="font-mono text-[10.5px] text-ink-muted"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {r.abbreviated ? "saves" : "full"}{" "}
                      {r.abbreviated
                        ? Math.round(r.included_duration_min / 2)
                        : 0}{" "}
                      min
                    </span>
                  </div>
                  {SAPTAPADI_RITUAL_IDS.has(r.id) && <SaptapadiVows />}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* ── Footer — export CTA ───────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-md border border-dashed border-gold/40 bg-ivory-warm/30 px-4 py-3">
        <div>
          <Eyebrow>Run-of-show export</Eyebrow>
          <p className="mt-1 text-[12px] text-ink-muted">
            A clean document for your officiant, your photographer, and your
            emcee. Currently prints the page — PDF generator coming soon.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Printer size={12} strokeWidth={1.8} />
          Print / save as PDF
        </button>
      </div>
    </div>
  );
}

// ── Inline editable field ────────────────────────────────────────────────

function ScriptField({
  label,
  value,
  onChange,
  rows = 2,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        {icon && <span className="text-ink-muted">{icon}</span>}
        <Eyebrow>{label}</Eyebrow>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[12.5px] leading-relaxed text-ink focus:border-saffron focus:outline-none"
      />
    </div>
  );
}
