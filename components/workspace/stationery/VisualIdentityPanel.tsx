"use client";

// ── Visual Identity Panel ─────────────────────────────────────────────────
// The cohesive brand guide that every piece in the suite must follow —
// palette, typography direction, motif language, and foil/finishing. This
// is stationery-specific: unlike décor, the artifact is a set of
// communication pieces that *must* look like a family.

import { useState } from "react";
import { Palette as PaletteIcon, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStationeryStore } from "@/stores/stationery-store";
import { SEED_STATIONERY_VISUAL_IDENTITY } from "@/lib/stationery-seed";
import {
  STATIONERY_FOIL_LABEL,
  STATIONERY_MOTIF_LABEL,
  STATIONERY_TYPOGRAPHY_LABEL,
  type StationeryFoilOption,
  type StationeryMotifDirection,
  type StationerySwatch,
  type StationeryTypographyDirection,
} from "@/types/stationery";
import { Eyebrow, PanelCard } from "@/components/workspace/blocks/primitives";

const TYPOGRAPHY_OPTIONS: StationeryTypographyDirection[] = [
  "classic_serif",
  "modern_sans",
  "script_calligraphic",
  "mixed",
];

const MOTIF_OPTIONS: StationeryMotifDirection[] = [
  "paisley_traditional",
  "floral_botanical",
  "geometric_modern",
  "illustrated_custom",
  "type_only",
];

const FOIL_OPTIONS: StationeryFoilOption[] = [
  "gold_foil",
  "letterpress",
  "embossing",
  "wax_seal",
  "flat_print",
];

export function VisualIdentityPanel() {
  const identity = useStationeryStore((s) => s.visualIdentity);
  const paletteSource = useStationeryStore((s) => s.paletteSource);
  const setPaletteSource = useStationeryStore((s) => s.setPaletteSource);
  const setPalette = useStationeryStore((s) => s.setIdentityPalette);
  const setTypography = useStationeryStore((s) => s.setIdentityTypography);
  const setMotif = useStationeryStore((s) => s.setIdentityMotif);
  const toggleFinishing = useStationeryStore((s) => s.toggleIdentityFinishing);
  const setBrief = useStationeryStore((s) => s.setIdentityBrief);

  const [briefDraft, setBriefDraft] = useState(identity.brief ?? "");
  const [editingBrief, setEditingBrief] = useState(false);

  return (
    <PanelCard
      icon={<PaletteIcon size={14} strokeWidth={1.8} />}
      title="Your visual identity"
      badge={
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
          Designer sees this as a brand guide
        </span>
      }
    >
      <p className="-mt-1 mb-4 font-serif text-[13px] italic text-ink-muted">
        These choices apply across every piece in your suite — so the
        save-the-date, the main invite, and the day-of signage feel like one
        family.
      </p>

      {/* ── Brief ──────────────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-end justify-between">
          <Eyebrow>The story your paper tells</Eyebrow>
          <button
            type="button"
            onClick={() => {
              if (editingBrief) {
                setBrief(briefDraft.trim());
              }
              setEditingBrief((v) => !v);
            }}
            className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:text-saffron"
          >
            {editingBrief ? "Save brief" : "Edit brief"}
          </button>
        </div>
        {editingBrief ? (
          <textarea
            value={briefDraft}
            onChange={(e) => setBriefDraft(e.target.value)}
            rows={4}
            placeholder="What feeling should your stationery evoke? The weight of the paper, the colour, the first thing they see."
            className="mt-2 w-full rounded-sm border border-border bg-white px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
        ) : identity.brief ? (
          <p className="mt-2 whitespace-pre-wrap rounded-sm border border-border/60 bg-ivory-warm/40 p-3 text-[13px] leading-relaxed text-ink-soft">
            {identity.brief}
          </p>
        ) : (
          <p className="mt-2 rounded-sm border border-dashed border-border bg-ivory-warm/30 p-3 font-serif text-[14px] italic text-ink-muted">
            Write a brief — what feeling should your stationery evoke?
          </p>
        )}
      </section>

      {/* ── Palette ────────────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <Eyebrow>Primary palette</Eyebrow>
            <p className="mt-1 text-[11.5px] text-ink-muted">
              {paletteSource === "wedding"
                ? "Pulled from your Décor colour story. Adjust if stationery should diverge."
                : "Independent palette — not pulled from Décor."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPaletteSource(
                  paletteSource === "wedding" ? "independent" : "wedding",
                )
              }
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:border-saffron/40 hover:text-saffron"
            >
              <Sparkles size={10} strokeWidth={1.8} />
              {paletteSource === "wedding" ? "Diverge" : "Sync to Décor"}
            </button>
            <button
              type="button"
              onClick={() =>
                setPalette([...SEED_STATIONERY_VISUAL_IDENTITY.palette])
              }
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:border-saffron/40 hover:text-saffron"
            >
              <RotateCcw size={10} strokeWidth={1.8} />
              Reset
            </button>
          </div>
        </div>
        <SwatchRow
          palette={identity.palette}
          onChange={(next) => setPalette(next)}
        />
      </section>

      {/* ── Typography ─────────────────────────────────────────────────── */}
      <section className="mb-6">
        <Eyebrow>Typography direction</Eyebrow>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          {TYPOGRAPHY_OPTIONS.map((opt) => (
            <OptionRadio
              key={opt}
              label={STATIONERY_TYPOGRAPHY_LABEL[opt]}
              selected={identity.typography === opt}
              onSelect={() => setTypography(opt)}
            />
          ))}
        </div>
      </section>

      {/* ── Motif ──────────────────────────────────────────────────────── */}
      <section className="mb-6">
        <Eyebrow>Motif direction</Eyebrow>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          {MOTIF_OPTIONS.map((opt) => (
            <OptionRadio
              key={opt}
              label={STATIONERY_MOTIF_LABEL[opt]}
              selected={identity.motif === opt}
              onSelect={() => setMotif(opt)}
            />
          ))}
        </div>
      </section>

      {/* ── Finishing ──────────────────────────────────────────────────── */}
      <section>
        <Eyebrow>Foil / finishing</Eyebrow>
        <p className="mt-1 text-[11.5px] text-ink-muted">
          Pick any combination — cost and turnaround shift accordingly.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FOIL_OPTIONS.map((opt) => {
            const selected = identity.finishing.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleFinishing(opt)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[12px] transition-colors",
                  selected
                    ? "border-saffron/40 bg-saffron-pale/60 text-saffron"
                    : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
                )}
              >
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border",
                    selected
                      ? "border-saffron bg-saffron text-white"
                      : "border-border bg-white",
                  )}
                >
                  {selected && (
                    <span className="text-[9px] leading-none">✓</span>
                  )}
                </span>
                {STATIONERY_FOIL_LABEL[opt]}
              </button>
            );
          })}
        </div>
      </section>
    </PanelCard>
  );
}

// ── Swatch row with inline edit ──────────────────────────────────────────

function SwatchRow({
  palette,
  onChange,
}: {
  palette: StationerySwatch[];
  onChange: (next: StationerySwatch[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draftHex, setDraftHex] = useState("#F5ECD8");
  const [draftName, setDraftName] = useState("");

  function addSwatch() {
    const hex = draftHex.trim();
    if (!hex) return;
    onChange([...palette, { hex, name: draftName.trim() || hex }]);
    setDraftHex("#F5ECD8");
    setDraftName("");
    setAdding(false);
  }

  function remove(idx: number) {
    onChange(palette.filter((_, i) => i !== idx));
  }

  return (
    <div className="mt-3 flex flex-wrap items-start gap-3">
      {palette.map((sw, idx) => (
        <div key={`${sw.hex}-${idx}`} className="group flex flex-col items-center gap-1">
          <div
            className="relative h-16 w-16 rounded-md shadow-sm ring-1 ring-border"
            style={{ backgroundColor: sw.hex }}
          >
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-ink-muted opacity-0 shadow ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
              aria-label={`Remove ${sw.name}`}
            >
              <Trash2 size={10} strokeWidth={1.8} />
            </button>
          </div>
          <span className="max-w-[64px] truncate text-[10.5px] text-ink-muted">
            {sw.name}
          </span>
          <span
            className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {sw.hex}
          </span>
        </div>
      ))}
      {adding ? (
        <div className="flex flex-col gap-1 rounded-md border border-dashed border-border bg-ivory-warm/30 p-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={draftHex}
              onChange={(e) => setDraftHex(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-sm border border-border"
            />
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Name"
              className="w-24 rounded-sm border border-border bg-white px-2 py-1 text-[11px] focus:border-saffron focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addSwatch}
              className="flex-1 rounded-sm bg-ink px-2 py-1 text-[10.5px] font-medium text-ivory"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-[10.5px] text-ink-muted hover:text-saffron"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-border text-ink-muted hover:border-saffron/40 hover:text-saffron"
          aria-label="Add swatch"
        >
          +
        </button>
      )}
    </div>
  );
}

// ── Small option radio ──────────────────────────────────────────────────

function OptionRadio({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-sm border px-3 py-2 text-left text-[12.5px] transition-colors",
        selected
          ? "border-saffron/40 bg-saffron-pale/40 text-ink"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
      )}
    >
      <span
        className={cn(
          "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
          selected ? "border-saffron bg-saffron" : "border-border bg-white",
        )}
      >
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      {label}
    </button>
  );
}
