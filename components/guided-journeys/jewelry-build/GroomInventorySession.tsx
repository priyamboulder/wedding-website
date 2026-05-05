"use client";

// ── Build Session 2 · Groom's jewelry ─────────────────────────────────────
// Sherwani-specific vocabulary — safa brooch, kalgi, mala (ceremonial),
// sherwani buttons, cufflinks, ring, bracelet/kada. Same lifecycle states
// as bridal. Surfaces turban_placement only for kalgi & safa_brooch.

import { useMemo } from "react";
import { Plus, Sparkles, Trash2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  GROOM_PIECE_LABEL,
  GROOM_SUGGESTED_CHIPS,
  JEWELRY_BUILD_CATEGORY,
  JEWELRY_BUILD_JOURNEY_ID,
  TURBAN_MOUNTED_PIECES,
  type GroomInventoryComputed,
  type GroomInventoryFormData,
  type GroomPiece,
  type GroomPieceType,
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

const SOURCE_LABEL: Record<GroomPiece["source"], string> = {
  new_purchase: "New purchase",
  custom_design: "Custom design",
  rental: "Rental",
  family_heirloom: "Family heirloom",
  tbd: "TBD",
};

function emptyInventory(): GroomInventoryFormData {
  return { pieces: [] };
}

function newId(): string {
  return `gp_${Math.random().toString(36).slice(2, 10)}`;
}

function computeInventory(pieces: GroomPiece[]): GroomInventoryComputed {
  const total_estimated_value = pieces.reduce(
    (sum, p) => sum + (p.estimated_value ?? 0),
    0,
  );
  const has_turban_pieces = pieces.some((p) =>
    TURBAN_MOUNTED_PIECES.has(p.piece_type),
  );
  return {
    total_pieces: pieces.length,
    pieces_by_status: tallyLifecycle(pieces),
    total_estimated_value,
    has_turban_pieces,
  };
}

export function GroomInventorySession() {
  const [state, update] = useCategoryJourneyState(
    JEWELRY_BUILD_CATEGORY,
    JEWELRY_BUILD_JOURNEY_ID,
  );

  const data: GroomInventoryFormData =
    (state.formData["groom_inventory"] as unknown as
      | GroomInventoryFormData
      | undefined) ?? emptyInventory();

  const visionAnchors = useMemo<OutfitPairingAnchor[]>(() => {
    const inspiration = state.formData["jewelry_inspiration"] as
      | { outfit_pairing_anchors?: OutfitPairingAnchor[] }
      | undefined;
    return inspiration?.outfit_pairing_anchors ?? [];
  }, [state.formData]);

  function writePieces(pieces: GroomPiece[]) {
    const computed = computeInventory(pieces);
    update((s) =>
      setSessionFormPath(s, "groom_inventory", "pieces", pieces),
    );
    update((s) => setSessionFormPath(s, "groom_inventory", "computed", computed));
  }

  function addPiece(piece_type: GroomPieceType, custom_label?: string) {
    const groomAnchor = visionAnchors.find(
      (a) => a.person === "groom" && a.event === "wedding",
    );
    const newPiece: GroomPiece = {
      id: newId(),
      piece_type,
      custom_label,
      status: "wishlist",
      source: "tbd",
      events_worn_at: groomAnchor
        ? [{ event: groomAnchor.event, pairing_note: groomAnchor.intent_note }]
        : [],
    };
    writePieces([...data.pieces, newPiece]);
  }

  function patchPiece(id: string, patch: Partial<GroomPiece>) {
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

  const hasTurbanPieces = data.computed?.has_turban_pieces ?? false;

  return (
    <div className="space-y-6">
      {data.pieces.length === 0 && <SuggestedChipsBlock onAdd={addPiece} />}

      <PieceListBlock
        pieces={data.pieces}
        onPatch={patchPiece}
        onRemove={removePiece}
      />

      <AddCustomBlock onAdd={addPiece} />

      {hasTurbanPieces && <TurbanCoordinationNote />}

      <SummaryBlock computed={data.computed} />
    </div>
  );
}

// ─── Suggested chips ─────────────────────────────────────────────────────

function SuggestedChipsBlock({
  onAdd,
}: {
  onAdd: (piece_type: GroomPieceType) => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Sherwani jewelry — its own language
        </p>
        <h3 className="mt-1 font-serif text-xl text-ink">
          Suggested groom pieces
        </h3>
        <p className="mt-1 text-[13px] italic text-ink-muted">
          Tap any chip to add it as a wishlist piece. Turban-mounted pieces
          (kalgi, safa brooch) get a placement note for whoever's tying the
          turban.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {GROOM_SUGGESTED_CHIPS.map((chip) => (
          <button
            key={chip.piece_type}
            type="button"
            onClick={() => onAdd(chip.piece_type)}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-ivory-soft px-3 py-1.5 text-[12.5px] text-ink hover:border-saffron/40 hover:bg-saffron-pale/30"
          >
            <Sparkles size={11} className="text-saffron" />
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
  pieces: GroomPiece[];
  onPatch: (id: string, patch: Partial<GroomPiece>) => void;
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
  piece: GroomPiece;
  onPatch: (patch: Partial<GroomPiece>) => void;
  onRemove: () => void;
}) {
  const label =
    piece.piece_type === "custom"
      ? piece.custom_label ?? "Custom piece"
      : GROOM_PIECE_LABEL[piece.piece_type];

  const showsTurbanField = TURBAN_MOUNTED_PIECES.has(piece.piece_type);

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
          <select
            value={piece.status}
            onChange={(e) =>
              onPatch({ status: e.target.value as LifecycleStatus })
            }
            className="rounded-full border border-ink/15 bg-ivory-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink"
          >
            {LIFECYCLE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {LIFECYCLE_LABEL[s]}
              </option>
            ))}
          </select>
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
            placeholder="Sabyasachi gold safa brooch with emeralds"
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
              onPatch({ source: e.target.value as GroomPiece["source"] })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {(
              ["new_purchase", "custom_design", "rental", "family_heirloom", "tbd"] as GroomPiece["source"][]
            ).map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vendor / source">
          <input
            type="text"
            value={piece.vendor_name ?? ""}
            onChange={(e) => onPatch({ vendor_name: e.target.value })}
            placeholder="Sabyasachi / Tarun Tahiliani / Nani"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
      </div>

      {showsTurbanField && (
        <Field label="Turban placement" className="mt-3">
          <input
            type="text"
            value={piece.turban_placement ?? ""}
            onChange={(e) => onPatch({ turban_placement: e.target.value })}
            placeholder="Front center, slight angle right — visible above the safa knot"
            className="w-full rounded-md border border-saffron/40 bg-saffron-pale/15 px-2.5 py-1.5 text-[13px]"
          />
          <p className="mt-1 text-[11.5px] italic text-ink-muted">
            <Crown size={11} className="inline align-text-top text-saffron" />{" "}
            This is the placement note your turban-tying elder and photographer
            need.
          </p>
        </Field>
      )}

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
                    ? "border-saffron bg-saffron-pale/40 text-ink"
                    : "border-ink/15 bg-ivory-soft text-ink-muted hover:border-saffron/40",
                )}
              >
                {EVENT_LABEL[event]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
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
  onAdd: (piece_type: GroomPieceType, custom_label?: string) => void;
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
          or pick from extras:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(
            ["pocket_square_pin", "turban_chain"] as GroomPieceType[]
          ).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onAdd(p)}
              className="rounded-full border border-ink/15 bg-paper px-2.5 py-1 text-[11.5px] text-ink-muted hover:border-saffron/40 hover:text-ink"
            >
              {GROOM_PIECE_LABEL[p]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Turban coordination note ────────────────────────────────────────────

function TurbanCoordinationNote() {
  return (
    <section className="rounded-md border border-saffron/40 bg-saffron-pale/15 p-4">
      <div className="flex items-start gap-2">
        <Crown size={14} className="mt-0.5 shrink-0 text-saffron" />
        <div>
          <p className="font-serif text-[15px] text-ink">
            Turban-mounted pieces need coordination.
          </p>
          <p className="mt-1 text-[12.5px] italic text-ink-muted">
            Whoever's tying the turban (and your photographer) need to know
            when these go on. Add a special handoff in Session 4 — Day-of
            custody.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Summary ─────────────────────────────────────────────────────────────

function SummaryBlock({
  computed,
}: {
  computed?: GroomInventoryComputed;
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
          label="Turban-mounted"
          value={computed.has_turban_pieces ? "Yes" : "No"}
        />
        <Stat
          label="Received"
          value={`${computed.pieces_by_status.received} of ${computed.total_pieces}`}
        />
      </div>
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
