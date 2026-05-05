"use client";

// ── Wardrobe Build · Session 1: Outfit Planner ─────────────────────────────
// Sequential walk through the people × events outfit matrix. Bride first,
// then groom, then "+ Add person." Each person gets one card per event with
// progressive fields (outfit_type → colour → designer/silhouette/embroidery).
//
// Storage:
//   • Outfit rows = WorkspaceItem (tab=wardrobe_looks, block_type=outfit) —
//     same store the full-workspace OutfitPlannerGrid reads/writes.
//   • People roster = small localStorage blob — bride/groom seed automatically
//     from the wedding profile; couples add others.
//
// "Switch to grid view" hands off to OutfitPlannerGrid by closing the Build
// shell with the launcher store. The grid already exists at
// `components/workspace/wardrobe/OutfitPlannerGrid.tsx`.

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import { WEDDING_EVENTS } from "@/types/workspace";
import { useWardrobeBuildLauncher } from "@/stores/wardrobe-build-launcher";
import {
  PERSON_ROLE_OPTIONS,
  OUTFIT_STATUS_OPTIONS,
  OUTFIT_TYPE_SUGGESTIONS,
  type OutfitPlannerPerson,
  type OutfitStatus,
  type PersonRole,
} from "@/lib/guided-journeys/wardrobe-build";
import {
  BUILD_STATUS_TO_GRID_STATUS,
  GRID_STATUS_TO_BUILD_STATUS,
} from "@/lib/guided-journeys/wardrobe-build-sync";
import { EVENT_PALETTE_DEFAULTS } from "@/lib/libraries/event-palette-defaults";
import { C, FONT_MONO, FONT_SANS, FONT_SERIF } from "@/components/workspace/shared/guided-journey/styles";
import { cn } from "@/lib/utils";

// ── People roster (localStorage) ───────────────────────────────────────────
// Bride/groom auto-seed; couples add others. Names default to "Bride" /
// "Groom" — the FamilyCoordinationSession reads off the workspace meta.person
// the same way, so changing a name here is visible everywhere.

const PEOPLE_KEY = "ananya:wardrobe-build:people";

interface PersonExt extends OutfitPlannerPerson {
  /** Display tag for the section header. */
  display_name: string;
}

function loadPeople(): PersonExt[] {
  if (typeof window === "undefined") return DEFAULT_PEOPLE;
  try {
    const raw = window.localStorage.getItem(PEOPLE_KEY);
    if (!raw) return DEFAULT_PEOPLE;
    const parsed = JSON.parse(raw) as PersonExt[];
    if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
  } catch {
    // ignore
  }
  return DEFAULT_PEOPLE;
}

function persistPeople(next: PersonExt[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PEOPLE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

const DEFAULT_PEOPLE: PersonExt[] = [
  {
    id: "bride",
    name: "Bride",
    display_name: "Bride",
    role: "bride",
    side: "bride",
  },
  {
    id: "groom",
    name: "Groom",
    display_name: "Groom",
    role: "groom",
    side: "groom",
  },
];

// ── Outfit cell helpers (workspace store backed) ───────────────────────────

interface OutfitMeta {
  person?: string;
  event?: string;
  outfit_type?: string;
  color?: string;
  designer?: string;
  silhouette?: string;
  embroidery?: string;
  status?: "shopping" | "ordered" | "fittings" | "ready";
  /** Build's richer status. Optional — derive from meta.status when absent. */
  build_status?: OutfitStatus;
  notes?: string;
  jewelry_notes?: string;
  inspiration_image_url?: string;
  images?: string[];
  // Allow extra keys so this type satisfies WorkspaceItem.meta
  // (Record<string, unknown>).
  [key: string]: unknown;
}

function deriveBuildStatus(meta: OutfitMeta): OutfitStatus {
  if (meta.build_status) return meta.build_status;
  return GRID_STATUS_TO_BUILD_STATUS[meta.status ?? "shopping"];
}

// ── Component ──────────────────────────────────────────────────────────────

export function OutfitPlannerSession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const close = useWardrobeBuildLauncher((s) => s.close);

  const [people, setPeople] = useState<PersonExt[]>(DEFAULT_PEOPLE);
  const [activePersonId, setActivePersonId] = useState<string>("bride");
  const [showAddPerson, setShowAddPerson] = useState(false);

  useEffect(() => {
    setPeople(loadPeople());
  }, []);

  function setPersonAndPersist(next: PersonExt[]) {
    setPeople(next);
    persistPeople(next);
  }

  // Index workspace items by (person, event) for fast cell lookup.
  const cells = useMemo(() => {
    const map = new Map<string, WorkspaceItem>();
    for (const item of items) {
      if (item.category_id !== category.id) continue;
      if (item.tab !== "wardrobe_looks") continue;
      if (item.block_type !== "outfit") continue;
      const meta = (item.meta ?? {}) as OutfitMeta;
      if (!meta.person || !meta.event) continue;
      map.set(`${meta.person}|${meta.event}`, item);
    }
    return map;
  }, [items, category.id]);

  // Computed counters surfaced in the in-line stats.
  const stats = useMemo(() => {
    let plannedTotal = 0;
    const byStatus: Record<OutfitStatus, number> = {
      not_decided: 0,
      shortlisted: 0,
      purchased: 0,
      alterations: 0,
      ready: 0,
    };
    let coupleTotal = 0;
    let coupleAtLeastShortlisted = 0;
    for (const item of items) {
      if (item.category_id !== category.id) continue;
      if (item.tab !== "wardrobe_looks") continue;
      if (item.block_type !== "outfit") continue;
      const meta = (item.meta ?? {}) as OutfitMeta;
      if (!meta.person || !meta.event) continue;
      plannedTotal += 1;
      const status = deriveBuildStatus(meta);
      byStatus[status] += 1;
      if (meta.person === "Bride" || meta.person === "Groom") {
        coupleTotal += 1;
        if (status !== "not_decided") coupleAtLeastShortlisted += 1;
      }
    }
    const completionPct =
      coupleTotal > 0
        ? Math.round((coupleAtLeastShortlisted / coupleTotal) * 100)
        : 0;
    return { plannedTotal, byStatus, completionPct };
  }, [items, category.id]);

  function ensureCell(personName: string, eventLabel: string): WorkspaceItem {
    const existing = cells.get(`${personName}|${eventLabel}`);
    if (existing) return existing;
    addItem({
      category_id: category.id,
      tab: "wardrobe_looks",
      block_type: "outfit",
      title: "",
      meta: {
        person: personName,
        event: eventLabel,
        status: "shopping",
        build_status: "not_decided",
      } satisfies OutfitMeta,
      sort_order: items.length + 1,
    });
    // The item is in-flight; the next render picks it up. Caller passes a
    // patch via meta-only path which stays a no-op until the row exists.
    return {
      id: "",
      category_id: category.id,
      tab: "wardrobe_looks",
      block_type: "outfit",
      title: "",
      meta: { person: personName, event: eventLabel, status: "shopping" },
      sort_order: items.length + 1,
    };
  }

  function patchMeta(itemId: string, patch: Partial<OutfitMeta>) {
    const item = items.find((x) => x.id === itemId);
    if (!item) return;
    const merged: OutfitMeta = { ...(item.meta ?? {}), ...patch };
    // Keep the grid's coarser status mirror in sync when Build's status changes.
    if (patch.build_status) {
      merged.status = BUILD_STATUS_TO_GRID_STATUS[patch.build_status];
    }
    updateItem(itemId, { meta: merged });
  }

  function patchTitle(itemId: string, title: string) {
    updateItem(itemId, { title });
  }

  function removePerson(id: string) {
    if (id === "bride" || id === "groom") return; // bride/groom stay
    const target = people.find((p) => p.id === id);
    if (!target) return;
    // Remove their workspace items too, so the canonical store is clean.
    const matchingNames = items.filter((i) => {
      if (i.category_id !== category.id) return false;
      if (i.tab !== "wardrobe_looks") return false;
      if (i.block_type !== "outfit") return false;
      return (i.meta as OutfitMeta).person === target.name;
    });
    for (const m of matchingNames) deleteItem(m.id);

    const next = people.filter((p) => p.id !== id);
    setPersonAndPersist(next);
    if (activePersonId === id) setActivePersonId("bride");
  }

  function addPerson(name: string, role: PersonRole) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `person-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const side =
      role.includes("bride") || role === "bridesmaid"
        ? "bride"
        : role.includes("groom") || role === "groomsman"
          ? "groom"
          : "shared";
    const next: PersonExt[] = [
      ...people,
      { id, name: trimmed, display_name: trimmed, role, side },
    ];
    setPersonAndPersist(next);
    setActivePersonId(id);
    setShowAddPerson(false);
  }

  const activePerson = people.find((p) => p.id === activePersonId) ?? people[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Stats row */}
      <MiniStats
        plannedTotal={stats.plannedTotal}
        coupleCompletionPct={stats.completionPct}
        purchasedCount={stats.byStatus.purchased + stats.byStatus.alterations + stats.byStatus.ready}
      />

      {/* People rail — sequential walk */}
      <PeopleRail
        people={people}
        activePersonId={activePersonId}
        onSelect={setActivePersonId}
        onRequestAdd={() => setShowAddPerson(true)}
        onRemove={removePerson}
      />

      {showAddPerson && (
        <AddPersonForm
          onCancel={() => setShowAddPerson(false)}
          onAdd={addPerson}
        />
      )}

      {/* Active person — one card per event */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h4
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 22,
            margin: 0,
            color: C.ink,
            fontWeight: 600,
            letterSpacing: "-0.005em",
          }}
        >
          {activePerson.display_name}'s looks
        </h4>
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            color: C.muted,
            fontSize: 14,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          One card per event. Skip any that don't apply — every cell saves as
          you go.
        </p>

        {WEDDING_EVENTS.map((ev) => (
          <EventOutfitCard
            key={`${activePerson.id}-${ev.id}`}
            person={activePerson}
            eventLabel={ev.label}
            existingItem={cells.get(`${activePerson.name}|${ev.label}`)}
            onCreate={() => ensureCell(activePerson.name, ev.label)}
            onPatchMeta={patchMeta}
            onPatchTitle={patchTitle}
            onSkip={(itemId) => {
              if (itemId) deleteItem(itemId);
            }}
          />
        ))}
      </div>

      {/* Grid view handoff */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          paddingTop: 14,
          borderTop: `1px dashed ${C.lineSoft}`,
        }}
      >
        <span
          style={{
            fontSize: 12.5,
            fontStyle: "italic",
            color: C.muted,
            fontFamily: FONT_SERIF,
          }}
        >
          Want to see all people × events at once?
        </span>
        <button
          type="button"
          onClick={close}
          style={{
            background: "transparent",
            border: `1px solid ${C.line}`,
            borderRadius: 4,
            padding: "8px 16px",
            fontFamily: FONT_SANS,
            fontSize: 12.5,
            color: C.inkSoft,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          Switch to grid view →
        </button>
      </div>
    </div>
  );
}

// ── People rail ────────────────────────────────────────────────────────────

function PeopleRail({
  people,
  activePersonId,
  onSelect,
  onRequestAdd,
  onRemove,
}: {
  people: PersonExt[];
  activePersonId: string;
  onSelect: (id: string) => void;
  onRequestAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
    >
      {people.map((p) => (
        <div
          key={p.id}
          style={{ position: "relative", display: "inline-flex" }}
        >
          <button
            type="button"
            onClick={() => onSelect(p.id)}
            style={{
              padding: "6px 14px",
              fontFamily: FONT_SANS,
              fontSize: 12.5,
              border: `1px solid ${activePersonId === p.id ? C.ink : C.line}`,
              borderRadius: 999,
              background:
                activePersonId === p.id ? C.ink : C.paper,
              color: activePersonId === p.id ? C.ivory : C.inkSoft,
              cursor: "pointer",
              transition: "all 0.15s",
              letterSpacing: "0.01em",
            }}
          >
            {p.display_name}
          </button>
          {p.id !== "bride" && p.id !== "groom" && (
            <button
              type="button"
              onClick={() => onRemove(p.id)}
              aria-label={`Remove ${p.display_name}`}
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: `1px solid ${C.line}`,
                background: C.paper,
                color: C.muted,
                cursor: "pointer",
                fontSize: 9,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <X size={9} strokeWidth={2} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onRequestAdd}
        style={{
          padding: "6px 14px",
          fontFamily: FONT_SANS,
          fontSize: 12.5,
          border: `1px dashed ${C.line}`,
          borderRadius: 999,
          background: "transparent",
          color: C.muted,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Plus size={11} strokeWidth={2} /> Add person
      </button>
    </div>
  );
}

function AddPersonForm({
  onCancel,
  onAdd,
}: {
  onCancel: () => void;
  onAdd: (name: string, role: PersonRole) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<PersonRole>("mother_of_bride");

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        padding: 12,
        background: C.champagnePale,
        border: `1px solid ${C.line}`,
        borderRadius: 6,
        flexWrap: "wrap",
      }}
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) onAdd(name, role);
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Name (e.g. Mother of Bride)"
        style={{
          flex: 1,
          minWidth: 200,
          padding: "6px 10px",
          fontSize: 12.5,
          border: `1px solid ${C.line}`,
          borderRadius: 4,
          background: C.paper,
          color: C.ink,
          fontFamily: FONT_SANS,
        }}
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as PersonRole)}
        style={{
          padding: "6px 10px",
          fontSize: 12.5,
          border: `1px solid ${C.line}`,
          borderRadius: 4,
          background: C.paper,
          color: C.inkSoft,
          fontFamily: FONT_SANS,
        }}
      >
        {PERSON_ROLE_OPTIONS.filter(
          (o) => o.value !== "bride" && o.value !== "groom",
        ).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => name.trim() && onAdd(name, role)}
        disabled={!name.trim()}
        style={{
          padding: "6px 14px",
          fontFamily: FONT_SANS,
          fontSize: 12.5,
          border: "none",
          borderRadius: 4,
          background: C.ink,
          color: C.ivory,
          cursor: name.trim() ? "pointer" : "not-allowed",
          opacity: name.trim() ? 1 : 0.6,
        }}
      >
        Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        style={{
          padding: "6px 10px",
          fontFamily: FONT_SANS,
          fontSize: 12,
          border: "none",
          background: "transparent",
          color: C.muted,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

// ── Event outfit card ──────────────────────────────────────────────────────

function EventOutfitCard({
  person,
  eventLabel,
  existingItem,
  onCreate,
  onPatchMeta,
  onPatchTitle,
  onSkip,
}: {
  person: PersonExt;
  eventLabel: string;
  existingItem?: WorkspaceItem;
  onCreate: () => void;
  onPatchMeta: (id: string, patch: Partial<OutfitMeta>) => void;
  onPatchTitle: (id: string, title: string) => void;
  onSkip: (itemId: string | undefined) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const meta: OutfitMeta = (existingItem?.meta ?? {}) as OutfitMeta;
  const status = deriveBuildStatus(meta);
  // Quick-pick swatches per event from cultural defaults.
  const eventKey = eventLabel.toLowerCase() as keyof typeof EVENT_PALETTE_DEFAULTS;
  const defaults = EVENT_PALETTE_DEFAULTS[eventKey] ?? [];

  if (!existingItem) {
    return (
      <div
        style={{
          padding: 14,
          border: `1px dashed ${C.line}`,
          borderRadius: 6,
          background: C.ivory,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.faint,
            }}
          >
            {eventLabel}
          </div>
          <div
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              color: C.muted,
              fontSize: 13.5,
              marginTop: 2,
            }}
          >
            What is {person.display_name} wearing for {eventLabel}?
          </div>
        </div>
        <button
          type="button"
          onClick={onCreate}
          style={{
            padding: "8px 16px",
            fontFamily: FONT_SANS,
            fontSize: 12.5,
            border: `1px solid ${C.line}`,
            background: C.paper,
            color: C.ink,
            borderRadius: 4,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={11} strokeWidth={2} /> Plan this look
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        border: `1px solid ${C.line}`,
        borderRadius: 6,
        background: C.paper,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 9.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.faint,
          }}
        >
          {eventLabel}
        </div>
        <button
          type="button"
          onClick={() => onSkip(existingItem.id)}
          style={{
            background: "transparent",
            border: "none",
            color: C.faint,
            fontSize: 11,
            cursor: "pointer",
            fontFamily: FONT_SANS,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Trash2 size={10} strokeWidth={1.8} /> Skip
        </button>
      </div>

      {/* Outfit type — primary, always visible */}
      <Field label="Outfit type">
        <input
          list={`outfit-types-${existingItem.id}`}
          value={meta.outfit_type ?? existingItem.title ?? ""}
          onChange={(e) => {
            onPatchTitle(existingItem.id, e.target.value);
            onPatchMeta(existingItem.id, { outfit_type: e.target.value });
          }}
          placeholder="Lehenga, sherwani, saree…"
          style={inputStyle}
        />
        <datalist id={`outfit-types-${existingItem.id}`}>
          {OUTFIT_TYPE_SUGGESTIONS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </Field>

      {/* Colour picker with event default chips */}
      <Field label="Colour">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <input
            type="color"
            value={meta.color ?? "#cccccc"}
            onChange={(e) => onPatchMeta(existingItem.id, { color: e.target.value })}
            aria-label="Colour"
            style={{
              width: 32,
              height: 32,
              padding: 0,
              border: `1px solid ${C.line}`,
              borderRadius: 4,
              cursor: "pointer",
              background: C.paper,
            }}
          />
          <input
            value={meta.color ?? ""}
            onChange={(e) => onPatchMeta(existingItem.id, { color: e.target.value })}
            placeholder="#B91C1C"
            style={{
              ...inputStyle,
              flex: "0 1 110px",
              fontFamily: FONT_MONO,
              fontSize: 11.5,
              textTransform: "uppercase",
            }}
          />
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.faint,
            }}
          >
            quick-picks:
          </span>
          {defaults.map((s) => (
            <button
              key={s.hex}
              type="button"
              title={s.label ?? s.hex}
              onClick={() => onPatchMeta(existingItem.id, { color: s.hex })}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border:
                  meta.color?.toUpperCase() === s.hex.toUpperCase()
                    ? `2px solid ${C.ink}`
                    : `1px solid ${C.line}`,
                background: s.hex,
                cursor: "pointer",
                padding: 0,
              }}
              aria-label={`Pick ${s.label ?? s.hex}`}
            />
          ))}
        </div>
      </Field>

      {/* Status */}
      <Field label="Status">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {OUTFIT_STATUS_OPTIONS.map((o) => {
            const active = status === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() =>
                  onPatchMeta(existingItem.id, { build_status: o.value })
                }
                className={cn(
                  "rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                )}
                style={{
                  fontFamily: FONT_MONO,
                  border: `1px solid ${active ? C.ink : C.line}`,
                  background: active ? C.ink : C.paper,
                  color: active ? C.ivory : C.muted,
                  cursor: "pointer",
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </Field>

      {/* Progressive disclosure */}
      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        style={{
          marginTop: 10,
          background: "transparent",
          border: "none",
          padding: 0,
          color: C.muted,
          fontFamily: FONT_SANS,
          fontSize: 12,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {showDetails ? "Hide details" : "Add details"}
      </button>

      {showDetails && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <Field label="Designer">
            <input
              value={meta.designer ?? ""}
              onChange={(e) => onPatchMeta(existingItem.id, { designer: e.target.value })}
              placeholder="Sabyasachi · heirloom from Nani · open to suggestions…"
              style={inputStyle}
            />
          </Field>
          <Field label="Silhouette">
            <input
              value={meta.silhouette ?? ""}
              onChange={(e) => onPatchMeta(existingItem.id, { silhouette: e.target.value })}
              placeholder="A-line, mermaid, straight…"
              style={inputStyle}
            />
          </Field>
          <Field label="Embroidery / details">
            <input
              value={meta.embroidery ?? ""}
              onChange={(e) => onPatchMeta(existingItem.id, { embroidery: e.target.value })}
              placeholder="Zardozi, mirror work, minimal…"
              style={inputStyle}
            />
          </Field>
          <Field label="Jewelry notes">
            <textarea
              value={meta.jewelry_notes ?? ""}
              onChange={(e) => onPatchMeta(existingItem.id, { jewelry_notes: e.target.value })}
              placeholder="Polki choker, no earrings — too heavy with the dupatta."
              rows={2}
              style={textareaStyle}
            />
          </Field>
          <Field label="Inspiration image URL">
            <input
              value={meta.inspiration_image_url ?? ""}
              onChange={(e) => onPatchMeta(existingItem.id, { inspiration_image_url: e.target.value })}
              placeholder="Paste an image URL or Vision reference…"
              style={inputStyle}
            />
          </Field>
          <Field label="Couple notes">
            <textarea
              value={meta.notes ?? ""}
              onChange={(e) => onPatchMeta(existingItem.id, { notes: e.target.value })}
              placeholder="Anything else worth remembering."
              rows={2}
              style={textareaStyle}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

// ── Mini stats ─────────────────────────────────────────────────────────────

function MiniStats({
  plannedTotal,
  coupleCompletionPct,
  purchasedCount,
}: {
  plannedTotal: number;
  coupleCompletionPct: number;
  purchasedCount: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        padding: "12px 16px",
        background: C.champagnePale,
        border: `1px solid ${C.lineSoft}`,
        borderRadius: 6,
        flexWrap: "wrap",
      }}
    >
      <Stat label="Outfits planned" value={`${plannedTotal}`} />
      <Stat label="Bride + groom progress" value={`${coupleCompletionPct}%`} />
      <Stat label="Purchased / further" value={`${purchasedCount}`} />
      <span
        style={{
          marginLeft: "auto",
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          color: C.muted,
          fontSize: 13,
          alignSelf: "center",
        }}
      >
        <Sparkles size={11} style={{ display: "inline", marginRight: 4 }} />
        Saved as you type — no submit button.
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 9.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.faint,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 22,
          color: C.ink,
          marginTop: 2,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ── Field primitives ───────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 9.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.faint,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  fontSize: 13,
  border: `1px solid ${C.line}`,
  borderRadius: 4,
  background: C.paper,
  color: C.ink,
  fontFamily: FONT_SANS,
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  fontFamily: FONT_SERIF,
  fontSize: 13.5,
  lineHeight: 1.5,
};
