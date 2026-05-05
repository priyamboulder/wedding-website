"use client";

// ── Wardrobe Build · Session 2: Family Coordination ────────────────────────
// Family roster (bride/groom side) + AI palette generator per side per event
// + accepted coordination rules. Reads bride's outfit colours per event from
// Session 1's WorkspaceItems for AI anchors.
//
// Storage:
//   • Family members & per-member outfits = WorkspaceItem (tab=
//     bridal_party_attire, block_type=outfit) — same items the
//     FamilyCoordinationTab Bride/Groom side tables show.
//   • Coordination rules = WorkspaceItem (same tab, meta.kind = "rule").
//   • Accepted side palettes = localStorage at `ananya:wardrobe-ai-palette`
//     (same key the existing AiPaletteSuggestionsPanel writes to, so
//     accepted state round-trips with the full workspace).

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UserPlus,
  Wand2,
  X,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usePanditStore } from "@/stores/pandit-store";
import { useQuizStore } from "@/stores/quiz-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import { WEDDING_EVENTS } from "@/types/workspace";
import {
  generateEventPalettePair,
  suggestCoordinationRules,
  type PaletteSuggestion,
} from "@/lib/calculators/family-palette-generator";
import { C, FONT_MONO, FONT_SANS, FONT_SERIF } from "@/components/workspace/shared/guided-journey/styles";

const ACCEPTED_PALETTES_KEY = "ananya:wardrobe-ai-palette";

type AcceptedPalettes = Record<
  string,
  { bride?: PaletteSuggestion; groom?: PaletteSuggestion }
>;

interface CoordMeta {
  side?: "bride" | "groom";
  person?: string;
  outfit?: string;
  color?: string;
  events?: string[];
  notes?: string;
  photo_forward?: boolean;
  kind?: "rule";
  rule?: string;
  is_ai_suggested?: boolean;
  // Allow extra keys so this type satisfies WorkspaceItem.meta
  // (Record<string, unknown>).
  [key: string]: unknown;
}

// ── Component ──────────────────────────────────────────────────────────────

export function FamilyCoordinationSession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const panditRoles = usePanditStore((s) => s.roles);
  const quizCompletion = useQuizStore((s) =>
    s.getCompletion("wardrobe", "vision"),
  );

  const styleDirection = useMemo(() => {
    const answers = quizCompletion?.quiz_answers ?? {};
    const value = answers["style_direction"] ?? answers["vibe"] ?? "";
    return typeof value === "string" ? value : "";
  }, [quizCompletion]);

  // Bride's outfit colour per event — anchor for AI palettes.
  const brideAnchorByEvent = useMemo(() => {
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

  // Family members (excluding rule rows) split by side.
  const familyItems = useMemo(
    () =>
      items.filter(
        (i) =>
          i.category_id === category.id &&
          i.tab === "bridal_party_attire" &&
          i.block_type === "outfit",
      ),
    [items, category.id],
  );

  const brideSide = familyItems.filter(
    (i) => (i.meta as CoordMeta).side === "bride" && !(i.meta as CoordMeta).kind,
  );
  const groomSide = familyItems.filter(
    (i) => (i.meta as CoordMeta).side === "groom" && !(i.meta as CoordMeta).kind,
  );
  const rules = familyItems.filter(
    (i) => (i.meta as CoordMeta).kind === "rule",
  );

  // Accepted palettes (localStorage round-trip with full workspace).
  const [seeds, setSeeds] = useState<Record<string, number>>({});
  const [accepted, setAccepted] = useState<AcceptedPalettes>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(ACCEPTED_PALETTES_KEY);
      if (raw) setAccepted(JSON.parse(raw) as AcceptedPalettes);
    } catch {
      // ignore
    }
  }, []);

  function persistAccepted(next: AcceptedPalettes) {
    setAccepted(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        ACCEPTED_PALETTES_KEY,
        JSON.stringify(next),
      );
    } catch {
      // ignore
    }
  }

  function regenerate(event: string) {
    setSeeds((prev) => ({ ...prev, [event]: (prev[event] ?? 0) + 1 }));
  }

  function acceptPalette(
    event: string,
    side: "bride" | "groom",
    p: PaletteSuggestion,
  ) {
    persistAccepted({
      ...accepted,
      [event]: { ...(accepted[event] ?? {}), [side]: p },
    });
  }

  function clearPalette(event: string, side: "bride" | "groom") {
    const slot = { ...(accepted[event] ?? {}) };
    delete slot[side];
    persistAccepted({ ...accepted, [event]: slot });
  }

  // Family member CRUD via workspace store.
  function addFamilyMember(side: "bride" | "groom") {
    addItem({
      category_id: category.id,
      tab: "bridal_party_attire",
      block_type: "outfit",
      title: "",
      meta: { side, events: [], photo_forward: false } as CoordMeta,
      sort_order: items.length + 1,
    });
  }

  function patchMember(id: string, patch: Partial<CoordMeta>) {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    updateItem(id, { meta: { ...(item.meta ?? {}), ...patch } });
  }

  function patchTitle(id: string, title: string) {
    updateItem(id, { title });
  }

  function toggleEvent(id: string, event: string) {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    const meta = (item.meta ?? {}) as CoordMeta;
    const evs = new Set(meta.events ?? []);
    if (evs.has(event)) evs.delete(event);
    else evs.add(event);
    updateItem(id, { meta: { ...meta, events: Array.from(evs) } });
  }

  // Officiant family-roles pre-fill: surface a one-time "Pull from officiant"
  // CTA when the wardrobe family roster is empty but officiant family roles
  // exist.
  const canPrefillFromOfficiant =
    familyItems.filter((i) => !(i.meta as CoordMeta).kind).length === 0 &&
    panditRoles.length > 0;

  function prefillFromOfficiant() {
    const seen = new Set<string>();
    for (const role of panditRoles) {
      const inferred =
        role.side === "grooms" ? "groom" : role.side === "brides" ? "bride" : null;
      if (!inferred) continue;
      const personName = role.primary_name?.trim() || role.role_name;
      if (!personName) continue;
      const dedupKey = `${inferred}:${personName.toLowerCase()}`;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);
      addItem({
        category_id: category.id,
        tab: "bridal_party_attire",
        block_type: "outfit",
        title: "",
        meta: {
          side: inferred,
          person: personName,
          events: [],
          photo_forward: true,
        } as CoordMeta,
        sort_order: items.length + 1,
      });
    }
  }

  // Coordination rules — manual + AI-suggested.
  function addRule(text: string, fromAI: boolean = false, event?: string) {
    if (!text.trim()) return;
    addItem({
      category_id: category.id,
      tab: "bridal_party_attire",
      block_type: "outfit",
      title: text.trim(),
      meta: {
        kind: "rule",
        rule: text.trim(),
        is_ai_suggested: fromAI,
        ...(event ? { events: [event] } : {}),
      } as CoordMeta,
      sort_order: items.length + 1,
    });
  }

  function suggestRules() {
    const acceptedFlat: Array<{
      event: string;
      side: "bride" | "groom";
      swatches: string[];
    }> = [];
    for (const [event, sides] of Object.entries(accepted)) {
      if (sides.bride) {
        acceptedFlat.push({
          event,
          side: "bride",
          swatches: sides.bride.swatches,
        });
      }
      if (sides.groom) {
        acceptedFlat.push({
          event,
          side: "groom",
          swatches: sides.groom.swatches,
        });
      }
    }
    const anchors: Record<string, string> = {};
    for (const [event, info] of Object.entries(brideAnchorByEvent)) {
      if (info.color) anchors[event] = info.color;
    }
    const suggestions = suggestCoordinationRules({
      brideAnchorByEvent: anchors,
      acceptedPalettes: acceptedFlat,
    });
    const existingRuleTexts = new Set(
      rules.map((r) => ((r.meta as CoordMeta).rule ?? r.title).trim()),
    );
    for (const s of suggestions) {
      if (!existingRuleTexts.has(s.rule_text)) {
        addRule(s.rule_text, true, s.applies_to_event);
      }
    }
  }

  const eventsWithBride = WEDDING_EVENTS.filter(
    (ev) => brideAnchorByEvent[ev.label]?.color,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <p
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          color: C.muted,
          fontSize: 14,
          margin: 0,
          lineHeight: 1.55,
        }}
      >
        Bride and groom outfits set the anchors. Below, AI proposes
        complementary palettes per side per event — regenerate to explore,
        accept to save. Edits round-trip with the full workspace.
      </p>

      {/* Officiant pre-fill nudge */}
      {canPrefillFromOfficiant && (
        <div
          style={{
            padding: 12,
            background: C.rosePale,
            border: `1px solid ${C.line}`,
            borderRadius: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12.5,
                color: C.ink,
                fontWeight: 500,
              }}
            >
              We see {panditRoles.length} family role
              {panditRoles.length === 1 ? "" : "s"} in your ceremony.
            </div>
            <div
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: 12.5,
                color: C.muted,
                marginTop: 2,
              }}
            >
              Pre-fill the wardrobe family roster from there?
            </div>
          </div>
          <button
            type="button"
            onClick={prefillFromOfficiant}
            style={{
              padding: "8px 14px",
              fontFamily: FONT_SANS,
              fontSize: 12.5,
              border: "none",
              background: C.ink,
              color: C.ivory,
              borderRadius: 4,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <UserPlus size={11} strokeWidth={2} /> Pull from Officiant
          </button>
        </div>
      )}

      {/* AI palette generator */}
      <section>
        <SectionHeader
          icon={<Wand2 size={13} strokeWidth={1.8} />}
          eyebrow="AI palettes per side"
          title="Family palettes by event"
        />
        {eventsWithBride.length === 0 ? (
          <EmptyHint>
            Pick a colour for the bride's outfit on any event in Session 1 —
            suggestions appear here automatically.
          </EmptyHint>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {eventsWithBride.map((ev) => {
              const bride = brideAnchorByEvent[ev.label];
              const seed = seeds[ev.label] ?? 0;
              const pair = generateEventPalettePair({
                brideHex: bride.color ?? "#B91C1C",
                style: styleDirection,
                event: ev.label,
                seed,
              });
              const acceptedForEvent = accepted[ev.label] ?? {};
              return (
                <PalettePairCard
                  key={ev.id}
                  eventLabel={ev.label}
                  brideAnchor={bride.color ?? "#B91C1C"}
                  brideTitle={bride.title?.trim() || bride.color}
                  bridePalette={pair.bride}
                  groomPalette={pair.groom}
                  acceptedBride={acceptedForEvent.bride}
                  acceptedGroom={acceptedForEvent.groom}
                  onRegenerate={() => regenerate(ev.label)}
                  onAcceptBride={() => acceptPalette(ev.label, "bride", pair.bride)}
                  onAcceptGroom={() => acceptPalette(ev.label, "groom", pair.groom)}
                  onClearBride={() => clearPalette(ev.label, "bride")}
                  onClearGroom={() => clearPalette(ev.label, "groom")}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Bride side */}
      <SideTable
        title="Bride side"
        rows={brideSide}
        onAdd={() => addFamilyMember("bride")}
        onPatch={patchMember}
        onTitle={patchTitle}
        onToggleEvent={toggleEvent}
        onDelete={deleteItem}
      />

      {/* Groom side */}
      <SideTable
        title="Groom side"
        rows={groomSide}
        onAdd={() => addFamilyMember("groom")}
        onPatch={patchMember}
        onTitle={patchTitle}
        onToggleEvent={toggleEvent}
        onDelete={deleteItem}
      />

      {/* Coordination rules */}
      <RulesPanel
        rules={rules}
        onAdd={(text) => addRule(text, false)}
        onSuggest={suggestRules}
        onDelete={deleteItem}
      />
    </div>
  );
}

// ── Palette pair card ──────────────────────────────────────────────────────

function PalettePairCard({
  eventLabel,
  brideAnchor,
  brideTitle,
  bridePalette,
  groomPalette,
  acceptedBride,
  acceptedGroom,
  onRegenerate,
  onAcceptBride,
  onAcceptGroom,
  onClearBride,
  onClearGroom,
}: {
  eventLabel: string;
  brideAnchor: string;
  brideTitle?: string;
  bridePalette: PaletteSuggestion;
  groomPalette: PaletteSuggestion;
  acceptedBride?: PaletteSuggestion;
  acceptedGroom?: PaletteSuggestion;
  onRegenerate: () => void;
  onAcceptBride: () => void;
  onAcceptGroom: () => void;
  onClearBride: () => void;
  onClearGroom: () => void;
}) {
  return (
    <div
      style={{
        padding: 14,
        background: C.ivory,
        border: `1px solid ${C.line}`,
        borderRadius: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9.5,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.muted,
            }}
          >
            {eventLabel}
          </span>
          <span
            aria-hidden
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: brideAnchor,
              border: `1px solid ${C.line}`,
            }}
          />
          <span
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: 12.5,
              color: C.muted,
            }}
          >
            bride in <span style={{ color: C.ink }}>{brideTitle}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          style={{
            padding: "5px 12px",
            fontFamily: FONT_SANS,
            fontSize: 11.5,
            border: `1px solid ${C.line}`,
            borderRadius: 999,
            background: C.paper,
            color: C.muted,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <RefreshCw size={10} strokeWidth={1.8} /> Regenerate
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <PaletteCard
          label="Bride's side"
          tone="rose"
          palette={bridePalette}
          accepted={acceptedBride}
          onAccept={onAcceptBride}
          onClear={onClearBride}
        />
        <PaletteCard
          label="Groom's side"
          tone="ink"
          palette={groomPalette}
          accepted={acceptedGroom}
          onAccept={onAcceptGroom}
          onClear={onClearGroom}
        />
      </div>
    </div>
  );
}

function PaletteCard({
  label,
  tone,
  palette,
  accepted,
  onAccept,
  onClear,
}: {
  label: string;
  tone: "rose" | "ink";
  palette: PaletteSuggestion;
  accepted?: PaletteSuggestion;
  onAccept: () => void;
  onClear: () => void;
}) {
  const displayed = accepted ?? palette;
  const isAccepted =
    accepted &&
    accepted.swatches.join("|") === palette.swatches.join("|");
  return (
    <div
      style={{
        padding: 10,
        background: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 9.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: tone === "rose" ? C.rose : C.ink,
          }}
        >
          {label}
        </span>
        {accepted && (
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: C.sage,
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Check size={9} strokeWidth={2} /> Accepted
          </span>
        )}
      </div>
      <div
        style={{
          height: 28,
          display: "flex",
          overflow: "hidden",
          borderRadius: 3,
          border: `1px solid ${C.line}`,
        }}
      >
        {displayed.swatches.map((hex, idx) => (
          <span
            key={`${hex}-${idx}`}
            title={hex}
            style={{ flex: 1, background: hex }}
          />
        ))}
      </div>
      <p
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 12.5,
          color: C.inkSoft,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {displayed.description}
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        {accepted ? (
          <button
            type="button"
            onClick={onClear}
            style={{
              padding: "4px 10px",
              fontFamily: FONT_SANS,
              fontSize: 11,
              border: "none",
              background: "transparent",
              color: C.faint,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        ) : (
          <button
            type="button"
            onClick={onAccept}
            style={{
              padding: "5px 12px",
              fontFamily: FONT_SANS,
              fontSize: 11.5,
              border: `1px solid ${isAccepted ? C.sage : C.line}`,
              background: isAccepted ? C.sageSoft : C.paper,
              color: isAccepted ? C.sage : C.ink,
              borderRadius: 4,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Check size={10} strokeWidth={2} /> Accept
          </button>
        )}
      </div>
    </div>
  );
}

// ── Side table ─────────────────────────────────────────────────────────────

function SideTable({
  title,
  rows,
  onAdd,
  onPatch,
  onTitle,
  onToggleEvent,
  onDelete,
}: {
  title: string;
  rows: WorkspaceItem[];
  onAdd: () => void;
  onPatch: (id: string, patch: Partial<CoordMeta>) => void;
  onTitle: (id: string, title: string) => void;
  onToggleEvent: (id: string, event: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow={`${rows.length} ${rows.length === 1 ? "person" : "people"}`}
        title={title}
        right={
          <button
            type="button"
            onClick={onAdd}
            style={{
              padding: "4px 12px",
              fontFamily: FONT_SANS,
              fontSize: 11.5,
              border: `1px solid ${C.line}`,
              borderRadius: 999,
              background: C.paper,
              color: C.inkSoft,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Plus size={10} strokeWidth={2} /> Add
          </button>
        }
      />
      {rows.length === 0 ? (
        <EmptyHint>
          No one added yet. Mothers, siblings, grandparents — anyone
          photo-forward goes here.
        </EmptyHint>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          {rows.map((row) => {
            const meta = (row.meta ?? {}) as CoordMeta;
            return (
              <div
                key={row.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(120px, 1.2fr) minmax(160px, 2fr) auto auto auto auto",
                  gap: 6,
                  padding: "8px 10px",
                  background: C.paper,
                  border: `1px solid ${C.line}`,
                  borderRadius: 4,
                  alignItems: "center",
                }}
              >
                <input
                  value={meta.person ?? ""}
                  onChange={(e) => onPatch(row.id, { person: e.target.value })}
                  placeholder="Person (e.g. Mother of Bride)"
                  style={inputCompactStyle}
                />
                <input
                  value={row.title}
                  onChange={(e) => onTitle(row.id, e.target.value)}
                  placeholder="Outfit (e.g. Ivory silk saree)"
                  style={inputCompactStyle}
                />
                <input
                  type="color"
                  value={meta.color ?? "#cccccc"}
                  onChange={(e) => onPatch(row.id, { color: e.target.value })}
                  aria-label="Colour"
                  style={{
                    width: 26,
                    height: 26,
                    padding: 0,
                    border: `1px solid ${C.line}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    background: C.paper,
                  }}
                />
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {WEDDING_EVENTS.map((e) => {
                    const active = (meta.events ?? []).includes(e.label);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => onToggleEvent(row.id, e.label)}
                        title={e.label}
                        style={{
                          padding: "2px 6px",
                          fontFamily: FONT_MONO,
                          fontSize: 8.5,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          border: `1px solid ${active ? C.gold : C.line}`,
                          borderRadius: 999,
                          background: active ? C.goldSoft : C.paper,
                          color: active ? C.goldDeep : C.muted,
                          cursor: "pointer",
                        }}
                      >
                        {e.label.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => onPatch(row.id, { photo_forward: !meta.photo_forward })}
                  title="Photo-forward (priority for coordination)"
                  style={{
                    width: 26,
                    height: 26,
                    border: `1px solid ${meta.photo_forward ? C.amber : C.line}`,
                    background: meta.photo_forward ? C.goldSoft : C.paper,
                    color: meta.photo_forward ? C.amber : C.faint,
                    borderRadius: 4,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <Sparkles size={11} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  aria-label={`Remove ${meta.person ?? "person"}`}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: C.faint,
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <Trash2 size={11} strokeWidth={1.8} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Rules panel ────────────────────────────────────────────────────────────

function RulesPanel({
  rules,
  onAdd,
  onSuggest,
  onDelete,
}: {
  rules: WorkspaceItem[];
  onAdd: (text: string) => void;
  onSuggest: () => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <section>
      <SectionHeader
        icon={<Sparkles size={13} strokeWidth={1.8} />}
        eyebrow="Coordination rules"
        title="Family-wide ground rules"
        right={
          <button
            type="button"
            onClick={onSuggest}
            style={{
              padding: "4px 12px",
              fontFamily: FONT_SANS,
              fontSize: 11.5,
              border: `1px solid ${C.gold}`,
              borderRadius: 999,
              background: C.goldSoft,
              color: C.goldDeep,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Wand2 size={10} strokeWidth={1.8} /> Suggest rules
          </button>
        }
      />
      {rules.length === 0 ? (
        <EmptyHint>
          Add ground rules: who avoids the bride's anchor colour, whether
          mothers should match, palette windows by event.
        </EmptyHint>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          {rules.map((r) => {
            const meta = (r.meta ?? {}) as CoordMeta;
            const value = meta.rule ?? r.title ?? "";
            return (
              <div
                key={r.id}
                style={{
                  padding: "8px 12px",
                  background: meta.is_ai_suggested ? C.goldSoft : C.paper,
                  border: `1px solid ${meta.is_ai_suggested ? C.gold : C.line}`,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {meta.is_ai_suggested && (
                  <Sparkles
                    size={11}
                    strokeWidth={1.8}
                    style={{ color: C.amber, flexShrink: 0 }}
                  />
                )}
                <span
                  style={{
                    flex: 1,
                    fontFamily: FONT_SERIF,
                    fontSize: 13.5,
                    color: C.ink,
                    lineHeight: 1.5,
                  }}
                >
                  {value}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: C.faint,
                    cursor: "pointer",
                    padding: 2,
                  }}
                  aria-label="Remove rule"
                >
                  <X size={11} strokeWidth={1.8} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 8,
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onAdd(draft);
              setDraft("");
            }
          }}
          placeholder="e.g. Nobody wears fuchsia except the bride on Sangeet"
          style={{ ...inputCompactStyle, flex: 1 }}
        />
        <button
          type="button"
          onClick={() => {
            if (draft.trim()) {
              onAdd(draft);
              setDraft("");
            }
          }}
          style={{
            padding: "6px 14px",
            fontFamily: FONT_SANS,
            fontSize: 12,
            border: `1px solid ${C.line}`,
            background: C.paper,
            color: C.inkSoft,
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>
    </section>
  );
}

// ── Layout primitives ──────────────────────────────────────────────────────

function SectionHeader({
  icon,
  eyebrow,
  title,
  right,
}: {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 4,
      }}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.faint,
              marginBottom: 3,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {icon}
            {eyebrow}
          </div>
        )}
        <h4
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 19,
            margin: 0,
            color: C.ink,
            fontWeight: 600,
            letterSpacing: "-0.005em",
          }}
        >
          {title}
        </h4>
      </div>
      {right}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 12,
        background: C.ivory,
        border: `1px dashed ${C.line}`,
        borderRadius: 6,
        fontFamily: FONT_SERIF,
        fontStyle: "italic",
        fontSize: 13,
        color: C.muted,
        marginTop: 6,
      }}
    >
      {children}
    </div>
  );
}

const inputCompactStyle: React.CSSProperties = {
  padding: "5px 8px",
  fontSize: 12.5,
  border: `1px solid ${C.line}`,
  borderRadius: 4,
  background: C.paper,
  color: C.ink,
  fontFamily: FONT_SANS,
  width: "100%",
};
