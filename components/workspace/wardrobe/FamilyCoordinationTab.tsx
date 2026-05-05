"use client";

// ── Wardrobe & Styling → Family Coordination tab ──────────────────────────
// Two tables — Bride Side / Groom Side — that capture who is wearing what
// across events. Below, a free-form list of coordination rules (no red
// except bride, no matching mothers, etc.). The "Share colour guide" action
// generates plain text the couple can paste into a family chat; it doesn't
// publish anywhere automatically.

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Trash2,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuizStore } from "@/stores/quiz-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import { WEDDING_EVENTS } from "@/types/workspace";
import {
  Eyebrow,
  EmptyRow,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import { WardrobeBuildDualCTA } from "@/components/guided-journeys/wardrobe-build/BuildJourneyDualCTA";
import {
  generateEventPalettePair as sharedGenerateEventPalettePair,
  type PaletteSuggestion as SharedPaletteSuggestion,
} from "@/lib/calculators/family-palette-generator";

type Side = "bride" | "groom";

interface CoordMeta {
  side?: Side;
  person?: string;
  outfit?: string;
  color?: string;
  events?: string[];
  notes?: string;
  // Special row type — coordination rule, not a person's outfit.
  kind?: "rule";
  rule?: string;
}

const EVENT_LABELS = WEDDING_EVENTS.map((e) => e.label);

const DEFAULT_RULES = [
  "Bride side: dusty rose / blush / ivory across all events",
  "Groom side: navy / gold / burgundy across all events",
  "No one wears red except the bride",
  "No one wears the exact same shade as the mothers",
];

export function WardrobeFamilyCoordinationTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  const scoped = useMemo(
    () =>
      items.filter(
        (i) =>
          i.category_id === category.id &&
          i.tab === "bridal_party_attire" &&
          i.block_type === "outfit",
      ),
    [items, category.id],
  );

  const brideSide = useMemo(
    () =>
      scoped
        .filter(
          (i) => (i.meta as CoordMeta).side === "bride" && !(i.meta as CoordMeta).kind,
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [scoped],
  );

  const groomSide = useMemo(
    () =>
      scoped
        .filter(
          (i) => (i.meta as CoordMeta).side === "groom" && !(i.meta as CoordMeta).kind,
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [scoped],
  );

  const rules = useMemo(
    () =>
      scoped
        .filter((i) => (i.meta as CoordMeta).kind === "rule")
        .sort((a, b) => a.sort_order - b.sort_order),
    [scoped],
  );

  function addRow(side: Side) {
    if (!canEdit) return;
    addItem({
      category_id: category.id,
      tab: "bridal_party_attire",
      block_type: "outfit",
      title: "",
      meta: { side, events: [] } satisfies CoordMeta,
      sort_order: items.length + 1,
    });
  }

  function addRule(rule?: string) {
    if (!canEdit) return;
    addItem({
      category_id: category.id,
      tab: "bridal_party_attire",
      block_type: "outfit",
      title: rule ?? "",
      meta: { kind: "rule", rule: rule ?? "" } satisfies CoordMeta,
      sort_order: items.length + 1,
    });
  }

  function patchMeta(id: string, patch: Partial<CoordMeta>) {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    updateItem(id, { meta: { ...(item.meta ?? {}), ...patch } });
  }

  function toggleEvent(id: string, event: string) {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    const meta = (item.meta ?? {}) as CoordMeta;
    const events = new Set(meta.events ?? []);
    if (events.has(event)) events.delete(event);
    else events.add(event);
    patchMeta(id, { events: Array.from(events) });
  }

  function shareGuide() {
    const lines: string[] = [];
    lines.push("Wedding wardrobe colour guide");
    lines.push("");
    lines.push("Bride side");
    for (const it of brideSide) {
      const m = it.meta as CoordMeta;
      const parts = [m.person, it.title, m.color, (m.events ?? []).join(", ")]
        .filter(Boolean);
      if (parts.length) lines.push(`— ${parts.join(" · ")}`);
    }
    lines.push("");
    lines.push("Groom side");
    for (const it of groomSide) {
      const m = it.meta as CoordMeta;
      const parts = [m.person, it.title, m.color, (m.events ?? []).join(", ")]
        .filter(Boolean);
      if (parts.length) lines.push(`— ${parts.join(" · ")}`);
    }
    if (rules.length) {
      lines.push("");
      lines.push("Coordination rules");
      for (const it of rules) {
        const m = it.meta as CoordMeta;
        if (m.rule?.trim()) lines.push(`— ${m.rule.trim()}`);
      }
    }
    const text = lines.join("\n");

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {
        // ignore — user can still manually select
      });
    }
    // Also drop into a new tab for download/share.
    if (typeof window !== "undefined") {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "wardrobe-colour-guide.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  return (
    <div className="space-y-6">
      <WardrobeBuildDualCTA
        category={category}
        startAtSession="family_coordination"
        guidedHeading="Plan with us — coordinate the family with AI palettes"
      />

      <SectionHeader
        title="Family wardrobe coordination"
        description="So everyone looks intentional in photos, not accidental."
        right={
          <button
            type="button"
            onClick={shareGuide}
            disabled={brideSide.length + groomSide.length + rules.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-saffron/40 bg-saffron-pale/30 px-3 py-1.5 text-[11.5px] text-saffron transition-colors hover:border-saffron hover:bg-saffron-pale/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Share2 size={12} strokeWidth={1.8} /> Share colour guide
          </button>
        }
      />

      <AiPaletteSuggestionsPanel category={category} />

      <SideTable
        label="Bride side"
        side="bride"
        rows={brideSide}
        canEdit={canEdit}
        onAdd={() => addRow("bride")}
        onTitle={(id, v) => updateItem(id, { title: v })}
        onPatch={patchMeta}
        onToggleEvent={toggleEvent}
        onDelete={(id) => deleteItem(id)}
      />

      <SideTable
        label="Groom side"
        side="groom"
        rows={groomSide}
        canEdit={canEdit}
        onAdd={() => addRow("groom")}
        onTitle={(id, v) => updateItem(id, { title: v })}
        onPatch={patchMeta}
        onToggleEvent={toggleEvent}
        onDelete={(id) => deleteItem(id)}
      />

      <RulesPanel
        rules={rules}
        canEdit={canEdit}
        onAdd={addRule}
        onRename={(id, rule) => {
          updateItem(id, { title: rule });
          patchMeta(id, { rule });
        }}
        onDelete={(id) => deleteItem(id)}
      />
    </div>
  );
}

// ── Side table ──────────────────────────────────────────────────────────

function SideTable({
  label,
  side,
  rows,
  canEdit,
  onAdd,
  onTitle,
  onPatch,
  onToggleEvent,
  onDelete,
}: {
  label: string;
  side: Side;
  rows: WorkspaceItem[];
  canEdit: boolean;
  onAdd: () => void;
  onTitle: (id: string, value: string) => void;
  onPatch: (id: string, patch: Partial<CoordMeta>) => void;
  onToggleEvent: (id: string, event: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <PanelCard
      icon={<Users size={14} strokeWidth={1.8} />}
      title={label}
      badge={
        canEdit && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
          >
            <Plus size={11} strokeWidth={1.8} />
            Add person
          </button>
        )
      }
    >
      {rows.length === 0 ? (
        <EmptyRow>
          No {side === "bride" ? "bride-side" : "groom-side"} outfits yet.
          Add the mother, siblings, grandparents — anyone photo-forward.
        </EmptyRow>
      ) : (
        <ul className="divide-y divide-border/60">
          {rows.map((row) => {
            const meta = (row.meta ?? {}) as CoordMeta;
            return (
              <li key={row.id} className="grid grid-cols-12 gap-2 py-3">
                <input
                  value={meta.person ?? ""}
                  onChange={(e) => onPatch(row.id, { person: e.target.value })}
                  placeholder="Person (e.g. Mother of Bride)"
                  disabled={!canEdit}
                  className="col-span-3 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                />
                <input
                  value={row.title}
                  onChange={(e) => onTitle(row.id, e.target.value)}
                  placeholder="Outfit (e.g. Ivory silk saree)"
                  disabled={!canEdit}
                  className="col-span-4 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                />
                <div className="col-span-2 flex items-center gap-1.5 rounded-sm border border-border bg-white px-1.5 py-1">
                  <input
                    type="color"
                    value={meta.color ?? "#CCCCCC"}
                    onChange={(e) => onPatch(row.id, { color: e.target.value })}
                    disabled={!canEdit}
                    aria-label="Outfit colour"
                    className="h-5 w-5 cursor-pointer rounded-sm border-0 bg-transparent disabled:cursor-not-allowed"
                  />
                  <input
                    value={meta.color ?? ""}
                    onChange={(e) => onPatch(row.id, { color: e.target.value })}
                    placeholder="#hex"
                    disabled={!canEdit}
                    className="min-w-0 flex-1 border-0 bg-transparent font-mono text-[10.5px] uppercase tracking-[0.04em] text-ink-muted focus:outline-none disabled:opacity-60"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>
                <div className="col-span-2 flex flex-wrap items-center gap-1">
                  {EVENT_LABELS.map((e) => {
                    const active = (meta.events ?? []).includes(e);
                    return (
                      <button
                        key={e}
                        type="button"
                        onClick={() => onToggleEvent(row.id, e)}
                        disabled={!canEdit}
                        className={cn(
                          "rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                          active
                            ? "border-saffron bg-saffron-pale/60 text-saffron"
                            : "border-border bg-white text-ink-muted hover:border-saffron/40",
                        )}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {e.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onDelete(row.id)}
                    aria-label="Remove person"
                    className="col-span-1 mt-1 text-ink-faint hover:text-rose"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}

// ── Rules panel ─────────────────────────────────────────────────────────

function RulesPanel({
  rules,
  canEdit,
  onAdd,
  onRename,
  onDelete,
}: {
  rules: WorkspaceItem[];
  canEdit: boolean;
  onAdd: (rule?: string) => void;
  onRename: (id: string, rule: string) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const existingRuleTexts = new Set(
    rules.map((r) => ((r.meta as CoordMeta).rule ?? r.title).trim()),
  );

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="Coordination rules"
      badge={
        canEdit && (
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="inline-flex items-center gap-1.5 rounded-full border border-saffron/40 bg-saffron-pale/30 px-2.5 py-1 text-[10.5px] text-saffron transition-colors hover:border-saffron hover:bg-saffron-pale/60"
          >
            <Sparkles size={10} strokeWidth={1.8} /> Suggest rules
          </button>
        )
      }
    >
      {showSuggestions && (
        <div className="mb-3 rounded-md border border-saffron/30 bg-saffron-pale/20 p-3">
          <Eyebrow className="mb-2">Tap to add</Eyebrow>
          <ul className="space-y-1.5">
            {DEFAULT_RULES.filter((r) => !existingRuleTexts.has(r)).map(
              (r) => (
                <li key={r}>
                  <button
                    type="button"
                    onClick={() => onAdd(r)}
                    className="flex w-full items-center gap-2 rounded-sm border border-dashed border-saffron/40 bg-white px-2.5 py-1.5 text-left text-[12.5px] text-ink-muted transition-colors hover:border-saffron hover:text-ink"
                  >
                    <Plus size={11} className="shrink-0 text-saffron" />
                    {r}
                  </button>
                </li>
              ),
            )}
            {DEFAULT_RULES.every((r) => existingRuleTexts.has(r)) && (
              <li>
                <p className="text-[12px] italic text-ink-faint">
                  All suggestions added. Keep writing your own below.
                </p>
              </li>
            )}
          </ul>
        </div>
      )}

      {rules.length === 0 ? (
        <EmptyRow>
          Add rules families can follow: palette windows, who avoids red,
          whether the mothers match each other.
        </EmptyRow>
      ) : (
        <ul className="mb-3 space-y-1.5">
          {rules.map((r) => {
            const meta = (r.meta ?? {}) as CoordMeta;
            const value = meta.rule ?? r.title ?? "";
            return (
              <li
                key={r.id}
                className="group flex items-start gap-2 rounded-md border border-border bg-ivory-warm/40 px-3 py-2"
              >
                <span className="mt-1 text-[18px] leading-none text-marigold">
                  •
                </span>
                <input
                  value={value}
                  onChange={(e) => onRename(r.id, e.target.value)}
                  disabled={!canEdit}
                  placeholder="Write a coordination rule…"
                  className="flex-1 border-0 bg-transparent text-[13px] text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
                />
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
                    className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                    aria-label="Remove rule"
                  >
                    <X size={12} strokeWidth={1.8} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {canEdit && (
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                onAdd(draft.trim());
                setDraft("");
              }
            }}
            placeholder="e.g. Nobody wears fuchsia except the bride on Sangeet"
            className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (draft.trim()) {
                onAdd(draft.trim());
                setDraft("");
              }
            }}
            className="rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
          >
            Add
          </button>
        </div>
      )}
    </PanelCard>
  );
}

// ── AI palette suggestions ──────────────────────────────────────────────
// Reads the bride's outfit colour for each event from the Event Looks grid
// and the style direction from the wardrobe-vision quiz, then generates
// harmonic palette suggestions for each side. Accepted palettes persist
// to localStorage and can be surfaced alongside the family guide.

const AI_PALETTE_KEY = "ananya:wardrobe-ai-palette";

interface PaletteSuggestion {
  swatches: string[];
  description: string;
}

interface EventPalettePair {
  seed: number;
  bride: PaletteSuggestion;
  groom: PaletteSuggestion;
}

type AcceptedPalettes = Record<string, { bride?: PaletteSuggestion; groom?: PaletteSuggestion }>;

function AiPaletteSuggestionsPanel({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const quizCompletion = useQuizStore((s) =>
    s.getCompletion("wardrobe", "vision"),
  );

  const styleDirection = useMemo(() => {
    const answers = quizCompletion?.quiz_answers ?? {};
    const value = answers["style_direction"] ?? answers["vibe"] ?? "";
    return typeof value === "string" ? value : "";
  }, [quizCompletion]);

  const brideLooks = useMemo(() => {
    const out: Record<string, { color?: string; title?: string }> = {};
    for (const it of items) {
      if (it.category_id !== category.id) continue;
      if (it.tab !== "wardrobe_looks") continue;
      if (it.block_type !== "outfit") continue;
      const meta = it.meta as { person?: string; event?: string; color?: string };
      if (meta.person === "Bride" && meta.event) {
        out[meta.event] = { color: meta.color?.trim(), title: it.title };
      }
    }
    return out;
  }, [items, category.id]);

  const [seeds, setSeeds] = useState<Record<string, number>>({});
  const [accepted, setAccepted] = useState<AcceptedPalettes>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(AI_PALETTE_KEY);
      if (raw) setAccepted(JSON.parse(raw) as AcceptedPalettes);
    } catch {
      // ignore
    }
  }, []);

  function persistAccepted(next: AcceptedPalettes) {
    setAccepted(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(AI_PALETTE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function regenerate(event: string) {
    setSeeds((prev) => ({ ...prev, [event]: (prev[event] ?? 0) + 1 }));
  }

  function accept(event: string, side: "bride" | "groom", p: PaletteSuggestion) {
    persistAccepted({
      ...accepted,
      [event]: { ...(accepted[event] ?? {}), [side]: p },
    });
  }

  function clearAccepted(event: string, side: "bride" | "groom") {
    const slot = { ...(accepted[event] ?? {}) };
    delete slot[side];
    persistAccepted({ ...accepted, [event]: slot });
  }

  const eventsWithLooks = WEDDING_EVENTS.filter(
    (ev) => brideLooks[ev.label]?.color,
  );

  return (
    <PanelCard
      icon={<Wand2 size={14} strokeWidth={1.8} />}
      title="AI colour themes for family sides"
      badge={
        styleDirection ? (
          <span
            className="rounded-full border border-border bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {humaniseStyle(styleDirection)}
          </span>
        ) : null
      }
    >
      <p className="mb-4 text-[12.5px] leading-relaxed text-ink-muted">
        Based on the bride's outfit on Event Looks and your style direction,
        here are palette ideas for each side — complementary, not competing.
        Regenerate to explore, accept to save the guidance.
      </p>

      {eventsWithLooks.length === 0 ? (
        <EmptyRow>
          Pick a colour for the bride's outfit on Event Looks for any event —
          suggestions appear here automatically.
        </EmptyRow>
      ) : (
        <ul className="space-y-4">
          {eventsWithLooks.map((ev) => {
            const bride = brideLooks[ev.label];
            const seed = seeds[ev.label] ?? 0;
            // Shared generator — same code path as Wardrobe Build Session 2.
            const pair = sharedGenerateEventPalettePair({
              brideHex: bride.color ?? "#B91C1C",
              style: styleDirection,
              event: ev.label,
              seed,
            });
            const acceptedForEvent = accepted[ev.label] ?? {};
            return (
              <li
                key={ev.id}
                className="rounded-lg border border-border bg-ivory-warm/30 p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Eyebrow>{ev.label}</Eyebrow>
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-border"
                      style={{ backgroundColor: bride.color }}
                      aria-hidden
                    />
                    <span className="text-[11.5px] italic text-ink-muted">
                      bride in{" "}
                      <span className="not-italic text-ink">
                        {bride.title?.trim() || bride.color}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => regenerate(ev.label)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-[11px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
                  >
                    <RefreshCw size={10} strokeWidth={1.8} /> Regenerate
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <PaletteCard
                    label="Bride's side"
                    tone="rose"
                    suggestion={pair.bride}
                    accepted={acceptedForEvent.bride}
                    onAccept={() => accept(ev.label, "bride", pair.bride)}
                    onClear={() => clearAccepted(ev.label, "bride")}
                  />
                  <PaletteCard
                    label="Groom's side"
                    tone="ink"
                    suggestion={pair.groom}
                    accepted={acceptedForEvent.groom}
                    onAccept={() => accept(ev.label, "groom", pair.groom)}
                    onClear={() => clearAccepted(ev.label, "groom")}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}

function PaletteCard({
  label,
  tone,
  suggestion,
  accepted,
  onAccept,
  onClear,
}: {
  label: string;
  tone: "rose" | "ink";
  suggestion: PaletteSuggestion;
  accepted?: PaletteSuggestion;
  onAccept: () => void;
  onClear: () => void;
}) {
  const isAccepted =
    accepted &&
    accepted.swatches.join("|") === suggestion.swatches.join("|");
  const displayed = accepted ?? suggestion;
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.1em]",
            tone === "rose" ? "text-rose" : "text-ink",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
        {accepted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-sage-pale/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-sage">
            <Check size={9} strokeWidth={2} /> Accepted
          </span>
        ) : null}
      </div>
      <div className="flex h-8 w-full overflow-hidden rounded-md ring-1 ring-border">
        {displayed.swatches.map((hex, idx) => (
          <span
            key={`${hex}-${idx}`}
            className="block h-full flex-1"
            style={{ backgroundColor: hex }}
            title={hex}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {displayed.swatches.map((hex, idx) => (
          <span
            key={`lbl-${hex}-${idx}`}
            className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {hex}
          </span>
        ))}
      </div>
      <p className="text-[12px] leading-relaxed text-ink">
        {displayed.description}
      </p>
      <div className="mt-auto flex justify-end gap-1.5 pt-1">
        {accepted ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-ink-faint hover:text-ink"
          >
            Clear
          </button>
        ) : (
          <button
            type="button"
            onClick={onAccept}
            className={cn(
              "inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 text-[11px] transition-colors",
              isAccepted
                ? "border-sage bg-sage-pale/60 text-sage"
                : "border-border bg-white text-ink-muted hover:border-saffron hover:text-saffron",
            )}
          >
            <Check size={10} strokeWidth={2} /> Accept
          </button>
        )}
      </div>
    </div>
  );
}

// ── Colour helpers ─────────────────────────────────────────────────────

function humaniseStyle(value: string): string {
  return value.replace(/[-_]/g, " ");
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.min(1, Math.max(0, s));
  const lig = Math.min(1, Math.max(0, l));
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function styleAdjustments(style: string): {
  saturationScale: number;
  lightnessBoost: number;
  tone: string;
} {
  const s = style.toLowerCase();
  if (s.includes("minimal") || s.includes("modern"))
    return { saturationScale: 0.55, lightnessBoost: 0.18, tone: "muted and modern" };
  if (s.includes("fusion"))
    return { saturationScale: 0.8, lightnessBoost: 0.08, tone: "fusion-contemporary" };
  if (s.includes("vintage") || s.includes("heirloom"))
    return { saturationScale: 0.7, lightnessBoost: 0.1, tone: "heirloom and warm" };
  if (s.includes("bold") || s.includes("forward"))
    return { saturationScale: 1.05, lightnessBoost: -0.05, tone: "editorial and bold" };
  if (s.includes("romantic") || s.includes("soft"))
    return { saturationScale: 0.65, lightnessBoost: 0.2, tone: "romantic and soft" };
  if (s.includes("traditional") || s.includes("regal"))
    return { saturationScale: 0.95, lightnessBoost: 0, tone: "traditional and regal" };
  return { saturationScale: 0.75, lightnessBoost: 0.1, tone: "balanced" };
}

function generateEventPalettePair(
  brideHex: string,
  style: string,
  event: string,
  seed: number,
): EventPalettePair {
  const { h, s, l } = hexToHsl(brideHex);
  const adj = styleAdjustments(style);
  const jitter = (seed * 17) % 30; // 0, 17, 4, 21, 8, … per seed

  // Bride's side — analogous, softer, photographs with the bride.
  const brideBaseHue = h + 28 + jitter;
  const brideSwatches = [
    hslToHex(brideBaseHue, 0.18 * adj.saturationScale, 0.82 + adj.lightnessBoost / 2),
    hslToHex(brideBaseHue + 18, 0.28 * adj.saturationScale, 0.72 + adj.lightnessBoost / 2),
    hslToHex(brideBaseHue - 14, 0.38 * adj.saturationScale, 0.58 + adj.lightnessBoost / 3),
    hslToHex(brideBaseHue + 4, 0.12, 0.92),
  ];

  // Groom's side — complementary but deeper, with a metallic/neutral anchor.
  const groomBaseHue = h + 180 - jitter;
  const groomSwatches = [
    hslToHex(groomBaseHue, 0.48 * adj.saturationScale, 0.32 - adj.lightnessBoost / 4),
    hslToHex(groomBaseHue + 22, 0.42 * adj.saturationScale, 0.46),
    hslToHex(groomBaseHue - 18, 0.3 * adj.saturationScale, 0.62 + adj.lightnessBoost / 3),
    hslToHex(42, 0.55, 0.52), // warm gold anchor, same for both sides
  ];

  // Distance from bride's hue keeps rivalry low and photograph harmony high.
  const distance = Math.min(
    Math.abs(brideBaseHue - h),
    360 - Math.abs(brideBaseHue - h),
  );

  const hueName = nameHue(brideBaseHue);
  const groomName = nameHue(groomBaseHue);

  const brideDescription =
    l < 0.45
      ? `Soft ${hueName} and ivory for the bride's side — ${adj.tone}, a quiet frame around the ${describeColor(brideHex)} lehenga.`
      : `${capitalize(hueName)} and champagne on the bride's side — ${adj.tone}, echoing the ${describeColor(brideHex)} look without competing.`;

  const groomDescription =
    distance > 120
      ? `Deep ${groomName} with a warm gold anchor for the groom's side — ${adj.tone}, sits opposite the bride's palette in photos.`
      : `${capitalize(groomName)} and ink, lifted with a gold anchor on the groom's side — ${adj.tone}, a harmonious counterpoint for group photos at ${event.toLowerCase()}.`;

  return {
    seed,
    bride: { swatches: brideSwatches, description: brideDescription },
    groom: { swatches: groomSwatches, description: groomDescription },
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function describeColor(hex: string): string {
  const { h, l } = hexToHsl(hex);
  const name = nameHue(h);
  if (l < 0.35) return `deep ${name}`;
  if (l > 0.75) return `pale ${name}`;
  return name;
}

function nameHue(h: number): string {
  const hue = ((h % 360) + 360) % 360;
  if (hue < 15 || hue >= 345) return "crimson";
  if (hue < 35) return "coral";
  if (hue < 55) return "marigold";
  if (hue < 75) return "saffron";
  if (hue < 95) return "chartreuse";
  if (hue < 150) return "sage";
  if (hue < 190) return "teal";
  if (hue < 230) return "slate blue";
  if (hue < 270) return "indigo";
  if (hue < 300) return "plum";
  if (hue < 335) return "dusty rose";
  return "magenta";
}
