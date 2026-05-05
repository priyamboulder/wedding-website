"use client";

// ── Build Session 1 · Bridal jewelry inventory ────────────────────────────
// Tracks every bridal piece through the lifecycle (wishlist → sourcing →
// ordered → received). Pre-seeds with the 8 suggested-piece chips, syncs
// per-event assignments with Vision Session 2's outfit_pairing_anchors,
// auto-promotes status from delivery dates, and warns on high total value.

import { useMemo } from "react";
import {
  AlertTriangle,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  BRIDAL_PIECE_LABEL,
  BRIDAL_SUGGESTED_CHIPS,
  HIGH_VALUE_THRESHOLD,
  JEWELRY_BUILD_CATEGORY,
  JEWELRY_BUILD_JOURNEY_ID,
  TOTAL_VALUE_SOFT_WARNING,
  type BridalInventoryComputed,
  type BridalInventoryFormData,
  type BridalPiece,
  type BridalPieceType,
  type LifecycleStatus,
} from "@/lib/guided-journeys/jewelry-build";
import {
  LIFECYCLE_LABEL,
  suggestLifecycleStatus,
  tallyLifecycle,
} from "@/lib/calculators/piece-lifecycle";
import type { OutfitPairingAnchor } from "@/lib/guided-journeys/jewelry-vision";

const EVENT_KEYS = ["haldi", "mehendi", "sangeet", "wedding", "reception"] as const;
type EventKey = (typeof EVENT_KEYS)[number];
const EVENT_LABEL: Record<EventKey, string> = {
  haldi: "Haldi",
  mehendi: "Mehendi",
  sangeet: "Sangeet",
  wedding: "Wedding",
  reception: "Reception",
};

const LIFECYCLE_OPTIONS: LifecycleStatus[] = [
  "wishlist",
  "sourcing",
  "ordered",
  "received",
];

const SOURCE_OPTIONS: BridalPiece["source"][] = [
  "new_purchase",
  "custom_design",
  "rental",
  "family_heirloom",
  "tbd",
];

const SOURCE_LABEL: Record<BridalPiece["source"], string> = {
  new_purchase: "New purchase",
  custom_design: "Custom design",
  rental: "Rental",
  family_heirloom: "Family heirloom",
  tbd: "TBD",
};

function emptyInventory(): BridalInventoryFormData {
  return { pieces: [] };
}

function newId(): string {
  return `bp_${Math.random().toString(36).slice(2, 10)}`;
}

function computeInventory(
  pieces: BridalPiece[],
): BridalInventoryComputed {
  const total_estimated_value = pieces.reduce(
    (sum, p) => sum + (p.estimated_value ?? 0),
    0,
  );
  const high_value_pieces_count = pieces.filter(
    (p) => (p.estimated_value ?? 0) >= HIGH_VALUE_THRESHOLD,
  ).length;
  const pieces_per_event: Record<string, number> = {};
  for (const p of pieces) {
    for (const e of p.events_worn_at) {
      pieces_per_event[e.event] = (pieces_per_event[e.event] ?? 0) + 1;
    }
  }
  return {
    total_pieces: pieces.length,
    pieces_by_status: tallyLifecycle(pieces),
    total_estimated_value,
    high_value_pieces_count,
    pieces_per_event,
  };
}

export function BridalInventorySession() {
  const [state, update] = useCategoryJourneyState(
    JEWELRY_BUILD_CATEGORY,
    JEWELRY_BUILD_JOURNEY_ID,
  );

  const data: BridalInventoryFormData =
    (state.formData["bridal_inventory"] as unknown as
      | BridalInventoryFormData
      | undefined) ?? emptyInventory();

  // Pre-seed event assignments from Vision Session 2's outfit pairing anchors
  // (bride side only) on first hydration.
  const visionAnchors = useMemo<OutfitPairingAnchor[]>(() => {
    const inspiration = state.formData["jewelry_inspiration"] as
      | { outfit_pairing_anchors?: OutfitPairingAnchor[] }
      | undefined;
    return inspiration?.outfit_pairing_anchors ?? [];
  }, [state.formData]);

  // Mutation helpers
  function writePieces(pieces: BridalPiece[]) {
    const computed = computeInventory(pieces);
    update((s) =>
      setSessionFormPath(s, "bridal_inventory", "pieces", pieces),
    );
    update((s) => setSessionFormPath(s, "bridal_inventory", "computed", computed));
  }

  function addPiece(piece_type: BridalPieceType, custom_label?: string) {
    const brideAnchor = visionAnchors.find(
      (a) => a.person === "bride" && a.event === "wedding",
    );
    const newPiece: BridalPiece = {
      id: newId(),
      piece_type,
      custom_label,
      status: "wishlist",
      source: "tbd",
      events_worn_at: brideAnchor
        ? [{ event: brideAnchor.event, pairing_note: brideAnchor.intent_note }]
        : [],
    };
    writePieces([...data.pieces, newPiece]);
  }

  function patchPiece(id: string, patch: Partial<BridalPiece>) {
    const next = data.pieces.map((p) => {
      if (p.id !== id) return p;
      const merged = { ...p, ...patch };
      const suggested = suggestLifecycleStatus(merged.status, merged);
      return suggested ? { ...merged, status: suggested } : merged;
    });
    writePieces(next);
  }

  function removePiece(id: string) {
    writePieces(data.pieces.filter((p) => p.id !== id));
  }

  // High-value warning for pieces above the soft threshold.
  const totalValue = data.computed?.total_estimated_value ?? 0;
  const showHighValueWarning = totalValue > TOTAL_VALUE_SOFT_WARNING;

  // Pre-fill empty inventory with no auto-add — couples should choose.

  return (
    <div className="space-y-6">
      {data.pieces.length === 0 && (
        <SuggestedChipsBlock onAdd={addPiece} />
      )}

      <PieceListBlock
        pieces={data.pieces}
        onPatch={patchPiece}
        onRemove={removePiece}
      />

      <AddCustomBlock onAdd={addPiece} />

      <SummaryBlock
        computed={data.computed}
        showHighValueWarning={showHighValueWarning}
      />
    </div>
  );
}

// ─── Suggested chips ─────────────────────────────────────────────────────

function SuggestedChipsBlock({
  onAdd,
}: {
  onAdd: (piece_type: BridalPieceType) => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Start here
        </p>
        <h3 className="mt-1 font-serif text-xl text-ink">
          Suggested bridal pieces
        </h3>
        <p className="mt-1 text-[13px] italic text-ink-muted">
          Tap any chip to add it as a wishlist piece. You can rename, edit, or
          remove anytime.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {BRIDAL_SUGGESTED_CHIPS.map((chip) => (
          <button
            key={chip.piece_type}
            type="button"
            onClick={() => onAdd(chip.piece_type)}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-ivory-soft px-3 py-1.5 text-[12.5px] text-ink hover:border-rose/40 hover:bg-rose-pale/30"
          >
            <Sparkles size={11} className="text-rose" />
            {chip.label}
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Piece list ──────────────────────────────────────────────────────────

function PieceListBlock({
  pieces,
  onPatch,
  onRemove,
}: {
  pieces: BridalPiece[];
  onPatch: (id: string, patch: Partial<BridalPiece>) => void;
  onRemove: (id: string) => void;
}) {
  if (pieces.length === 0) return null;
  return (
    <section className="space-y-3">
      {pieces.map((piece) => (
        <PieceCard
          key={piece.id}
          piece={piece}
          onPatch={(patch) => onPatch(piece.id, patch)}
          onRemove={() => onRemove(piece.id)}
        />
      ))}
    </section>
  );
}

function PieceCard({
  piece,
  onPatch,
  onRemove,
}: {
  piece: BridalPiece;
  onPatch: (patch: Partial<BridalPiece>) => void;
  onRemove: () => void;
}) {
  const label =
    piece.piece_type === "custom"
      ? piece.custom_label ?? "Custom piece"
      : BRIDAL_PIECE_LABEL[piece.piece_type];

  function toggleEvent(event: EventKey) {
    const has = piece.events_worn_at.some((e) => e.event === event);
    onPatch({
      events_worn_at: has
        ? piece.events_worn_at.filter((e) => e.event !== event)
        : [...piece.events_worn_at, { event }],
    });
  }

  return (
    <div className="rounded-md border border-ink/10 bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-serif text-[17px] text-ink">{label}</h4>
          {piece.description && (
            <p className="mt-0.5 text-[13px] italic text-ink-muted">
              {piece.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusPill
            status={piece.status}
            onChange={(status) => onPatch({ status })}
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove piece"
            className="rounded-md p-1.5 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <Field label="Description">
          <input
            type="text"
            value={piece.description ?? ""}
            onChange={(e) => onPatch({ description: e.target.value })}
            placeholder="Heritage polki rani haar with emerald drops"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Estimated value (USD)">
          <input
            type="number"
            min={0}
            value={piece.estimated_value ?? ""}
            onChange={(e) =>
              onPatch({
                estimated_value: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            placeholder="0"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
        <Field label="Source">
          <select
            value={piece.source}
            onChange={(e) =>
              onPatch({ source: e.target.value as BridalPiece["source"] })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vendor / lender">
          <input
            type="text"
            value={piece.vendor_name ?? ""}
            onChange={(e) => onPatch({ vendor_name: e.target.value })}
            placeholder="Tanishq / Sabyasachi / Mom"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Order date">
          <input
            type="date"
            value={piece.order_date ?? ""}
            onChange={(e) => onPatch({ order_date: e.target.value || undefined })}
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Expected delivery">
          <input
            type="date"
            value={piece.expected_delivery_date ?? ""}
            onChange={(e) =>
              onPatch({ expected_delivery_date: e.target.value || undefined })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
      </div>

      <div className="mt-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          Events worn at
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {EVENT_KEYS.map((event) => {
            const active = piece.events_worn_at.some((e) => e.event === event);
            return (
              <button
                key={event}
                type="button"
                onClick={() => toggleEvent(event)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11.5px]",
                  active
                    ? "border-rose bg-rose-pale/40 text-ink"
                    : "border-ink/15 bg-ivory-soft text-ink-muted hover:border-rose/40",
                )}
              >
                {EVENT_LABEL[event]}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Care notes" className="mt-3">
        <input
          type="text"
          value={piece.care_notes ?? ""}
          onChange={(e) => onPatch({ care_notes: e.target.value })}
          placeholder="Polki — clean with soft brush only, no ultrasonic"
          className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
        />
      </Field>
    </div>
  );
}

function StatusPill({
  status,
  onChange,
}: {
  status: LifecycleStatus;
  onChange: (s: LifecycleStatus) => void;
}) {
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as LifecycleStatus)}
      className="rounded-full border border-ink/15 bg-ivory-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink"
    >
      {LIFECYCLE_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {LIFECYCLE_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

// ─── Add custom ──────────────────────────────────────────────────────────

function AddCustomBlock({
  onAdd,
}: {
  onAdd: (piece_type: BridalPieceType, custom_label?: string) => void;
}) {
  return (
    <section className="rounded-md border border-dashed border-ink/15 bg-ivory-soft p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        Add another piece
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const label = prompt("Name the piece");
            if (label) onAdd("custom", label);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} />
          Custom piece
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          or pick from common bridal pieces:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              "necklace",
              "bangles",
              "rings",
              "anklets",
              "kamarbandh",
              "mangalsutra",
              "matha_patti",
              "chooda",
              "earrings",
            ] as BridalPieceType[]
          ).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onAdd(p)}
              className="rounded-full border border-ink/15 bg-paper px-2.5 py-1 text-[11.5px] text-ink-muted hover:border-rose/40 hover:text-ink"
            >
              {BRIDAL_PIECE_LABEL[p]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Summary ─────────────────────────────────────────────────────────────

function SummaryBlock({
  computed,
  showHighValueWarning,
}: {
  computed?: BridalInventoryComputed;
  showHighValueWarning: boolean;
}) {
  if (!computed || computed.total_pieces === 0) return null;
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        At a glance
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Stat label="Pieces" value={`${computed.total_pieces}`} />
        <Stat
          label="Total est. value"
          value={`$${computed.total_estimated_value.toLocaleString()}`}
        />
        <Stat
          label="High-value (>$5k)"
          value={`${computed.high_value_pieces_count}`}
        />
        <Stat
          label="Received"
          value={`${computed.pieces_by_status.received} of ${computed.total_pieces}`}
        />
      </div>
      {showHighValueWarning && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber/40 bg-amber/10 p-3 text-[13px] text-ink">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber" />
          <p className="leading-snug">
            Total bridal value is significant. Insurance decision matters —
            you'll handle that in your jewelry brief and in Session 4.
          </p>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </p>
      <p className="mt-0.5 font-serif text-[18px] tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}
