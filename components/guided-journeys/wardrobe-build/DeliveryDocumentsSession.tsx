"use client";

// ── Wardrobe Build · Session 3: Delivery & Documents ───────────────────────
// Auto-seed delivery slots from "purchased / further" outfits in Session 1.
// Inline FilesPanel for receipts / fabric swatches / outfit photos.
// Alterations buffer + vendor handoff toggles (one-way write to Photography
// & HMUA).
//
// Storage:
//   • Delivery slots = WorkspaceItem (tab=delivery, block_type=delivery_slot)
//     — same items the DocumentsTab CategoryItemList shows.
//   • Files = files-store via FilesPanel.
//   • Alterations buffer + vendor_handoff toggles = small localStorage blobs.

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import {
  DEFAULT_ALTERATIONS_BUFFER,
  type AlterationsBuffer,
  type VendorHandoff,
} from "@/lib/guided-journeys/wardrobe-build";
import { FilesPanel } from "@/components/workspace/shared/FilesPanel";
import { C, FONT_MONO, FONT_SANS, FONT_SERIF } from "@/components/workspace/shared/guided-journey/styles";

const ALTERATIONS_KEY = "ananya:wardrobe-build:alterations-buffer";
const HANDOFF_KEY = "ananya:wardrobe-build:vendor-handoff";

interface SlotMeta {
  target_date?: string;
  is_must_flag?: boolean;
  status?: "pending" | "in_transit" | "delivered" | "late";
  linked_outfit_ids?: string[];
  notes?: string;
  // Allow extra keys so this type satisfies WorkspaceItem.meta
  // (Record<string, unknown>).
  [key: string]: unknown;
}

interface OutfitMeta {
  person?: string;
  event?: string;
  color?: string;
  status?: "shopping" | "ordered" | "fittings" | "ready";
  build_status?:
    | "not_decided"
    | "shortlisted"
    | "purchased"
    | "alterations"
    | "ready";
  outfit_type?: string;
  [key: string]: unknown;
}

const STATUS_COPY: Record<NonNullable<SlotMeta["status"]>, string> = {
  pending: "Pending",
  in_transit: "In transit",
  delivered: "Delivered",
  late: "Late",
};

// ── Component ──────────────────────────────────────────────────────────────

export function DeliveryDocumentsSession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const weddingDate = useAuthStore(
    (s) => s.user?.wedding?.weddingDate ?? null,
  );

  // Delivery slots scoped to this category.
  const slots = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.category_id === category.id &&
            i.tab === "delivery" &&
            i.block_type === "delivery_slot",
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, category.id],
  );

  // Outfits for auto-seed.
  const outfitsToSlot = useMemo(
    () =>
      items.filter((i) => {
        if (i.category_id !== category.id) return false;
        if (i.tab !== "wardrobe_looks") return false;
        if (i.block_type !== "outfit") return false;
        const meta = (i.meta ?? {}) as OutfitMeta;
        const buildStatus = meta.build_status;
        // Build's "purchased" or "alterations" → seed a slot.
        if (buildStatus === "purchased" || buildStatus === "alterations") {
          return true;
        }
        // Fall back to the grid's coarser status.
        return meta.status === "ordered" || meta.status === "fittings";
      }),
    [items, category.id],
  );

  // Identify outfits that already have a slot.
  const outfitsWithSlot = useMemo(() => {
    const set = new Set<string>();
    for (const slot of slots) {
      const meta = (slot.meta ?? {}) as SlotMeta;
      for (const id of meta.linked_outfit_ids ?? []) set.add(id);
    }
    return set;
  }, [slots]);

  function autoSeedFromPurchased() {
    for (const outfit of outfitsToSlot) {
      if (outfitsWithSlot.has(outfit.id)) continue;
      const meta = (outfit.meta ?? {}) as OutfitMeta;
      const isBrideWedding =
        meta.person === "Bride" &&
        (meta.event?.toLowerCase() === "wedding" ||
          meta.event?.toLowerCase() === "wedding ceremony");
      const labelParts = [meta.person, meta.event, outfit.title?.trim()]
        .filter(Boolean)
        .join(" · ");
      addItem({
        category_id: category.id,
        tab: "delivery",
        block_type: "delivery_slot",
        title: labelParts || `${meta.person ?? "Outfit"} delivery`,
        meta: {
          status: "pending",
          is_must_flag: isBrideWedding,
          linked_outfit_ids: [outfit.id],
        } as SlotMeta,
        sort_order: items.length + 1,
      });
    }
  }

  function patchSlotMeta(id: string, patch: Partial<SlotMeta>) {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    updateItem(id, { meta: { ...(item.meta ?? {}), ...patch } });
  }

  function patchSlotTitle(id: string, title: string) {
    updateItem(id, { title });
  }

  function addEmptySlot() {
    addItem({
      category_id: category.id,
      tab: "delivery",
      block_type: "delivery_slot",
      title: "",
      meta: { status: "pending", is_must_flag: false } as SlotMeta,
      sort_order: items.length + 1,
    });
  }

  // Alterations buffer state.
  const [buffer, setBuffer] = useState<AlterationsBuffer>(
    DEFAULT_ALTERATIONS_BUFFER,
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(ALTERATIONS_KEY);
      if (raw) setBuffer(JSON.parse(raw) as AlterationsBuffer);
    } catch {
      // ignore
    }
  }, []);
  function persistBuffer(next: AlterationsBuffer) {
    setBuffer(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ALTERATIONS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  // Vendor handoff toggles.
  const [handoff, setHandoff] = useState<VendorHandoff>({
    photographer_swatches_shared: false,
    hmua_outfit_photos_shared: false,
    notes: "",
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(HANDOFF_KEY);
      if (raw) setHandoff(JSON.parse(raw) as VendorHandoff);
    } catch {
      // ignore
    }
  }, []);
  function persistHandoff(next: VendorHandoff) {
    setHandoff(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HANDOFF_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  // Soft-warning surfaced when any pending delivery is within buffer days
  // of the wedding date.
  const warning = useMemo(() => {
    if (!weddingDate || !buffer.enabled) return null;
    const wedding = new Date(weddingDate);
    if (Number.isNaN(wedding.getTime())) return null;
    const threshold = new Date(wedding);
    threshold.setDate(threshold.getDate() - buffer.buffer_days);
    const tight: WorkspaceItem[] = [];
    for (const slot of slots) {
      const meta = (slot.meta ?? {}) as SlotMeta;
      if (!meta.target_date) continue;
      const target = new Date(meta.target_date);
      if (Number.isNaN(target.getTime())) continue;
      if (meta.status === "delivered") continue;
      if (target >= threshold && target <= wedding) tight.push(slot);
    }
    return tight.length > 0 ? tight : null;
  }, [slots, weddingDate, buffer]);

  const seedable = outfitsToSlot.filter((o) => !outfitsWithSlot.has(o.id));

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
        Bride's wedding lehenga arrives first, bridesmaids in bulk later.
        Build in a 5-day alterations buffer.
      </p>

      {/* Auto-seed CTA */}
      {seedable.length > 0 && (
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
            flexWrap: "wrap",
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
              {seedable.length} purchased outfit
              {seedable.length === 1 ? "" : "s"} need delivery slots.
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
              Auto-seed slots from Session 1's outfits — bride's wedding outfit
              flagged as must.
            </div>
          </div>
          <button
            type="button"
            onClick={autoSeedFromPurchased}
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
            <Sparkles size={11} strokeWidth={2} /> Auto-seed slots
          </button>
        </div>
      )}

      {/* Delivery slots */}
      <section>
        <SectionHeader
          icon={<Truck size={13} strokeWidth={1.8} />}
          eyebrow={`${slots.length} ${slots.length === 1 ? "slot" : "slots"}`}
          title="Delivery windows"
          right={
            <button
              type="button"
              onClick={addEmptySlot}
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
              <Plus size={10} strokeWidth={2} /> Add slot
            </button>
          }
        />
        {slots.length === 0 ? (
          <EmptyHint>
            No delivery plan yet. Auto-seed from purchased outfits or add a
            slot manually.
          </EmptyHint>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 6,
            }}
          >
            {slots.map((slot) => {
              const meta = (slot.meta ?? {}) as SlotMeta;
              return (
                <div
                  key={slot.id}
                  style={{
                    padding: "10px 12px",
                    background: meta.is_must_flag ? C.goldSoft : C.paper,
                    border: `1px solid ${meta.is_must_flag ? C.gold : C.line}`,
                    borderRadius: 4,
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(200px, 2fr) 130px 130px auto auto",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    value={slot.title}
                    onChange={(e) => patchSlotTitle(slot.id, e.target.value)}
                    placeholder="e.g. Bride's wedding lehenga delivery"
                    style={{ ...inputCompactStyle }}
                  />
                  <input
                    type="date"
                    value={meta.target_date ?? ""}
                    onChange={(e) =>
                      patchSlotMeta(slot.id, { target_date: e.target.value })
                    }
                    style={{ ...inputCompactStyle }}
                  />
                  <select
                    value={meta.status ?? "pending"}
                    onChange={(e) =>
                      patchSlotMeta(slot.id, {
                        status: e.target.value as SlotMeta["status"],
                      })
                    }
                    style={{ ...inputCompactStyle }}
                  >
                    {Object.entries(STATUS_COPY).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      patchSlotMeta(slot.id, {
                        is_must_flag: !meta.is_must_flag,
                      })
                    }
                    title={
                      meta.is_must_flag ? "Unflag as must" : "Flag as must"
                    }
                    style={{
                      width: 28,
                      height: 28,
                      border: `1px solid ${
                        meta.is_must_flag ? C.amber : C.line
                      }`,
                      background: meta.is_must_flag ? C.goldSoft : C.paper,
                      color: meta.is_must_flag ? C.amber : C.faint,
                      borderRadius: 4,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    <AlertTriangle size={12} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(slot.id)}
                    aria-label="Remove slot"
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

      {/* Buffer warning */}
      {warning && warning.length > 0 && (
        <div
          style={{
            padding: 12,
            background: C.goldSoft,
            border: `1px solid ${C.amber}`,
            borderRadius: 6,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle
            size={14}
            strokeWidth={1.8}
            style={{ color: C.amber, flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12.5,
                color: C.ink,
                fontWeight: 500,
              }}
            >
              {warning.length} delivery
              {warning.length === 1 ? "" : "s"} land within your{" "}
              {buffer.buffer_days}-day buffer.
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
              Heavy embroidery on bridesmaids needs extra time — push these
              earlier if you can.
            </div>
          </div>
        </div>
      )}

      {/* Alterations buffer */}
      <section>
        <SectionHeader
          icon={<CheckCircle2 size={13} strokeWidth={1.8} />}
          eyebrow="Buffer"
          title="Alterations buffer"
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: 12,
            background: C.paper,
            border: `1px solid ${C.line}`,
            borderRadius: 6,
            flexWrap: "wrap",
          }}
        >
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: FONT_SANS,
              fontSize: 12.5,
              color: C.ink,
            }}
          >
            <input
              type="checkbox"
              checked={buffer.enabled}
              onChange={(e) =>
                persistBuffer({ ...buffer, enabled: e.target.checked })
              }
            />
            Warn me if anything lands within
          </label>
          <input
            type="number"
            min={1}
            max={45}
            value={buffer.buffer_days}
            onChange={(e) =>
              persistBuffer({
                ...buffer,
                buffer_days: Number(e.target.value) || 5,
              })
            }
            style={{
              ...inputCompactStyle,
              width: 60,
            }}
          />
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12.5,
              color: C.muted,
            }}
          >
            days of the wedding
          </span>
          <input
            value={buffer.notes ?? ""}
            onChange={(e) =>
              persistBuffer({ ...buffer, notes: e.target.value })
            }
            placeholder="Notes (e.g. Heavy embroidery on bridesmaids needs extra time)"
            style={{ ...inputCompactStyle, flex: 1, minWidth: 240 }}
          />
        </div>
      </section>

      {/* Files */}
      <section>
        <SectionHeader
          icon={<Camera size={13} strokeWidth={1.8} />}
          eyebrow="Files"
          title="Receipts, swatches, outfit photos"
        />
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 13,
            color: C.muted,
            margin: "4px 0 8px",
          }}
        >
          Upload receipts, fabric swatch photos, outfit shots, alteration
          instructions. Tag each file so it shows up where vendors expect.
        </p>
        <div
          style={{
            background: C.paper,
            border: `1px solid ${C.line}`,
            borderRadius: 6,
          }}
        >
          <FilesPanel category="wardrobe" tab="delivery" />
        </div>
      </section>

      {/* Vendor handoff */}
      <section>
        <SectionHeader
          icon={<Send size={13} strokeWidth={1.8} />}
          eyebrow="Vendor handoff"
          title="Send swatches & photos onward"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 12,
            background: C.paper,
            border: `1px solid ${C.line}`,
            borderRadius: 6,
          }}
        >
          <ToggleRow
            label="Share fabric swatches with Photography"
            description="Surfaces fabric swatch photos on the photographer's day-of coordination block."
            checked={handoff.photographer_swatches_shared}
            onChange={(v) =>
              persistHandoff({ ...handoff, photographer_swatches_shared: v })
            }
          />
          <ToggleRow
            label="Share outfit photos with HMUA"
            description="Pre-visualisation for the makeup trial."
            checked={handoff.hmua_outfit_photos_shared}
            onChange={(v) =>
              persistHandoff({ ...handoff, hmua_outfit_photos_shared: v })
            }
          />
          <textarea
            value={handoff.notes ?? ""}
            onChange={(e) =>
              persistHandoff({ ...handoff, notes: e.target.value })
            }
            placeholder="Anything else the vendors should know."
            rows={2}
            style={{
              ...inputCompactStyle,
              fontFamily: FONT_SERIF,
              fontSize: 13,
              resize: "vertical",
            }}
          />
        </div>
      </section>
    </div>
  );
}

// ── UI helpers ─────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 4 }}
      />
      <div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 12.5,
            color: C.ink,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: 12.5,
              color: C.muted,
              marginTop: 2,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </label>
  );
}

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
