"use client";

// ── Build Session 2 · Trousseau packaging ─────────────────────────────────
// Mirrors Tab 4 of the Gifting workspace. Walks the couple through saree
// trays, jewelry boxes, nagphans, gift trays, pooja thalis, and monogram
// labels. Empty state offers 4–6 typical pieces. Surfaces a Stationery
// coordination prompt for any piece that needs a monogram or label, plus
// a 90-day-lead-time warning for Indian-imported packaging.

import { useEffect, useMemo } from "react";
import { AlertTriangle, Package, Plus, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  GIFTING_BUILD_CATEGORY,
  GIFTING_BUILD_JOURNEY_ID,
  TROUSSEAU_LEAD_TIME_WARNING_DAYS,
  TROUSSEAU_PIECE_TYPE_LABEL,
  TROUSSEAU_SUGGESTED_PIECES,
  type StationeryCoordinationStatus,
  type TrousseauComputed,
  type TrousseauPackagingFormData,
  type TrousseauPiece,
  type TrousseauPieceType,
  type TrousseauSourcingStatus,
} from "@/lib/guided-journeys/gifting-build";
import {
  bandLabel,
  bandTone,
  compareAgainstAnchor,
} from "@/lib/calculators/budget-anchor-comparison";
import { cn } from "@/lib/utils";
import type { WorkspaceCategory } from "@/types/workspace";

const PIECE_TYPE_OPTIONS: TrousseauPieceType[] = [
  "saree_tray",
  "jewelry_box",
  "nagphan",
  "tray_set",
  "pooja_thali",
  "gift_box",
  "monogram_label_set",
  "custom",
];

const SOURCING_OPTIONS: TrousseauSourcingStatus[] = [
  "wishlist",
  "sourcing",
  "ordered",
  "received",
];

const STATIONERY_OPTIONS: StationeryCoordinationStatus[] = [
  "na",
  "pending",
  "designed",
  "printed",
  "delivered",
];

const STATIONERY_LABEL: Record<StationeryCoordinationStatus, string> = {
  na: "N/A",
  pending: "Pending design",
  designed: "Designed",
  printed: "Printed",
  delivered: "Delivered",
};

const EVENT_OPTIONS: TrousseauPiece["used_at_event"][] = [
  "mehendi",
  "haldi",
  "sangeet",
  "wedding",
  "reception",
  "milni",
  "vidaai",
  "other",
];

function newId(): string {
  return `tp_${Math.random().toString(36).slice(2, 10)}`;
}

export function TrousseauPackagingSession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const [state, update] = useCategoryJourneyState(
    GIFTING_BUILD_CATEGORY,
    GIFTING_BUILD_JOURNEY_ID,
  );
  const weddingDate = useAuthStore((s) => s.user?.wedding?.weddingDate ?? null);
  const visionPhilosophy = state.formData["gifting_philosophy"] as
    | {
        budget_anchors?: { trousseau_packaging_total?: string };
        family_gift_traditions?: string[];
        gift_types_planned?: string[];
      }
    | undefined;

  const sessionData =
    (state.formData["trousseau_packaging"] as unknown as
      | TrousseauPackagingFormData
      | undefined) ?? { trousseau_pieces: [] };

  // Suggest empty-state pieces on first hydration when the couple flagged
  // either trousseau_packaging in gift_types_planned or any related family
  // tradition.
  useEffect(() => {
    if (sessionData.trousseau_pieces.length > 0) return;
    const wantsTrousseau =
      (visionPhilosophy?.gift_types_planned ?? []).includes(
        "trousseau_packaging",
      ) ||
      (visionPhilosophy?.family_gift_traditions ?? []).some((t) =>
        ["trousseau", "milni_vevai", "shagun"].includes(t),
      );
    if (!wantsTrousseau) return;
    const seeded: TrousseauPiece[] = TROUSSEAU_SUGGESTED_PIECES.map((s) => ({
      id: newId(),
      piece_type: s.piece_type,
      description: s.description,
      quantity: s.quantity,
      cultural_purpose: s.cultural_purpose,
      used_at_event: s.used_at_event,
      needs_monogram: s.needs_monogram ?? false,
      needs_label: s.needs_label ?? false,
      stationery_coordination_status: (s.needs_monogram || s.needs_label
        ? "pending"
        : "na") as StationeryCoordinationStatus,
      sourcing_status: "wishlist",
      photos: [],
    }));
    update((s) =>
      setSessionFormPath(s, "trousseau_packaging", "trousseau_pieces", seeded),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pieces = sessionData.trousseau_pieces;

  // Compute lead-time warnings + cost band.
  const computed: TrousseauComputed = useMemo(() => {
    const warnings: string[] = [];
    let total = 0;
    let needsStat = 0;
    const wedding = weddingDate ? Date.parse(weddingDate) : null;
    const cutoff =
      wedding == null
        ? null
        : wedding - TROUSSEAU_LEAD_TIME_WARNING_DAYS * 24 * 60 * 60 * 1000;
    for (const p of pieces) {
      total += (p.actual_cost ?? p.cost_estimate ?? 0) * p.quantity;
      if (p.needs_monogram || p.needs_label) needsStat += 1;
      if (cutoff != null && p.order_date) {
        const od = Date.parse(p.order_date);
        if (!Number.isNaN(od) && od > cutoff) {
          warnings.push(
            `${p.description || TROUSSEAU_PIECE_TYPE_LABEL[p.piece_type]} ordered after ${TROUSSEAU_LEAD_TIME_WARNING_DAYS}-day cutoff`,
          );
        }
      }
    }
    const cmp = compareAgainstAnchor(
      total,
      visionPhilosophy?.budget_anchors?.trousseau_packaging_total,
    );
    const band: TrousseauComputed["cost_vs_budget_anchor"] =
      cmp.band === "no_anchor" ? "on_target" : cmp.band;
    return {
      total_pieces: pieces.length,
      total_estimated_cost: total,
      cost_vs_budget_anchor: band,
      pieces_needing_stationery: needsStat,
      sourcing_lead_time_warnings: warnings,
    };
  }, [pieces, weddingDate, visionPhilosophy?.budget_anchors?.trousseau_packaging_total]);

  useEffect(() => {
    update((s) =>
      setSessionFormPath(s, "trousseau_packaging", "computed", computed),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed.total_estimated_cost, computed.total_pieces]);

  const writePieces = (next: TrousseauPiece[]) => {
    update((s) =>
      setSessionFormPath(s, "trousseau_packaging", "trousseau_pieces", next),
    );
  };

  const addPiece = (piece_type: TrousseauPieceType = "custom") => {
    writePieces([
      ...pieces,
      {
        id: newId(),
        piece_type,
        custom_label: piece_type === "custom" ? "Custom piece" : undefined,
        description: "",
        quantity: 1,
        sourcing_status: "wishlist",
        needs_monogram: false,
        needs_label: false,
        stationery_coordination_status: "na",
        photos: [],
        used_at_event: "wedding",
      },
    ]);
  };

  const patchPiece = (id: string, patch: Partial<TrousseauPiece>) => {
    writePieces(
      pieces.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...patch };
        // If needs_monogram or needs_label flipped on, default
        // stationery_coordination_status to pending.
        if (
          (merged.needs_monogram || merged.needs_label) &&
          merged.stationery_coordination_status === "na"
        ) {
          merged.stationery_coordination_status = "pending";
        }
        if (
          !merged.needs_monogram &&
          !merged.needs_label &&
          merged.stationery_coordination_status === "pending"
        ) {
          merged.stationery_coordination_status = "na";
        }
        return merged;
      }),
    );
  };

  const removePiece = (id: string) => {
    writePieces(pieces.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {pieces.length === 0 && (
        <SuggestedChips
          onSeed={(piece_type) => addPiece(piece_type)}
          highlight={
            (visionPhilosophy?.family_gift_traditions ?? []).length > 0
          }
        />
      )}

      <PieceListBlock
        pieces={pieces}
        onPatch={patchPiece}
        onRemove={removePiece}
        onAdd={() => addPiece("custom")}
      />

      <SummaryBlock
        computed={computed}
        anchorChip={visionPhilosophy?.budget_anchors?.trousseau_packaging_total}
      />
    </div>
  );
}

// ─── Suggested chips ─────────────────────────────────────────────────────

function SuggestedChips({
  onSeed,
  highlight,
}: {
  onSeed: (piece_type: TrousseauPieceType) => void;
  highlight: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-md border p-5",
        highlight
          ? "border-rose/30 bg-rose-pale/20"
          : "border-ink/10 bg-paper",
      )}
    >
      <header className="mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Start here
        </p>
        <h3 className="mt-1 font-serif text-xl text-ink">
          Common trousseau pieces
        </h3>
        <p className="mt-1 text-[12.5px] italic text-ink-muted">
          Tap any chip to add it as a wishlist piece. Saree trays, jewelry
          boxes, and nagphans usually arrive in pairs — adjust quantity per
          piece.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {TROUSSEAU_SUGGESTED_PIECES.map((s) => (
          <button
            key={s.piece_type + s.description}
            type="button"
            onClick={() => onSeed(s.piece_type)}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-ivory-soft px-3 py-1.5 text-[12.5px] text-ink hover:border-rose/40 hover:bg-rose-pale/30"
          >
            <Package size={11} className="text-rose" />
            {TROUSSEAU_PIECE_TYPE_LABEL[s.piece_type]}
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Pieces list ─────────────────────────────────────────────────────────

function PieceListBlock({
  pieces,
  onPatch,
  onRemove,
  onAdd,
}: {
  pieces: TrousseauPiece[];
  onPatch: (id: string, patch: Partial<TrousseauPiece>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Pieces
          </p>
          <h3 className="mt-1 font-serif text-xl text-ink">
            Every tray, box, and thali
          </h3>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} />
          Custom piece
        </button>
      </header>
      {pieces.length === 0 ? (
        <p className="py-2 text-[12.5px] italic text-ink-muted">
          No pieces yet — pick from the suggestions above or add a custom
          piece.
        </p>
      ) : (
        <div className="space-y-3">
          {pieces.map((p) => (
            <PieceCard
              key={p.id}
              piece={p}
              onPatch={(patch) => onPatch(p.id, patch)}
              onRemove={() => onRemove(p.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PieceCard({
  piece,
  onPatch,
  onRemove,
}: {
  piece: TrousseauPiece;
  onPatch: (patch: Partial<TrousseauPiece>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-md border border-ink/10 bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <select
            value={piece.piece_type}
            onChange={(e) =>
              onPatch({ piece_type: e.target.value as TrousseauPieceType })
            }
            className="rounded-full border border-ink/15 bg-ivory-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink"
          >
            {PIECE_TYPE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {TROUSSEAU_PIECE_TYPE_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove piece"
          className="rounded-md p-1.5 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <Field label="Description">
          <input
            type="text"
            value={piece.description}
            onChange={(e) => onPatch({ description: e.target.value })}
            placeholder="Hand-painted saree tray with peacock motif"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Quantity">
          <input
            type="number"
            min={1}
            value={piece.quantity}
            onChange={(e) =>
              onPatch({ quantity: Math.max(1, Number(e.target.value) || 1) })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
        <Field label="Used at event">
          <select
            value={piece.used_at_event}
            onChange={(e) =>
              onPatch({
                used_at_event: e.target.value as TrousseauPiece["used_at_event"],
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {EVENT_OPTIONS.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sourcing status">
          <select
            value={piece.sourcing_status}
            onChange={(e) =>
              onPatch({
                sourcing_status: e.target.value as TrousseauSourcingStatus,
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {SOURCING_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vendor">
          <input
            type="text"
            value={piece.vendor ?? ""}
            onChange={(e) => onPatch({ vendor: e.target.value })}
            placeholder="Trousseau vendor name"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Cost estimate (USD)">
          <input
            type="number"
            min={0}
            value={piece.cost_estimate ?? ""}
            onChange={(e) =>
              onPatch({
                cost_estimate: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
        <Field label="Order date">
          <input
            type="date"
            value={piece.order_date ?? ""}
            onChange={(e) =>
              onPatch({ order_date: e.target.value || undefined })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Expected delivery">
          <input
            type="date"
            value={piece.expected_delivery_date ?? ""}
            onChange={(e) =>
              onPatch({
                expected_delivery_date: e.target.value || undefined,
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Cultural purpose">
          <input
            type="text"
            value={piece.cultural_purpose ?? ""}
            onChange={(e) => onPatch({ cultural_purpose: e.target.value })}
            placeholder="Wedding day exchange to groom's family"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Contents">
          <input
            type="text"
            value={piece.contents_description ?? ""}
            onChange={(e) => onPatch({ contents_description: e.target.value })}
            placeholder="Will hold 6 sarees for the in-laws"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <label className="inline-flex items-center gap-2 text-[12.5px] text-ink">
          <input
            type="checkbox"
            checked={piece.needs_monogram}
            onChange={(e) => onPatch({ needs_monogram: e.target.checked })}
          />
          Needs monogram
        </label>
        <label className="inline-flex items-center gap-2 text-[12.5px] text-ink">
          <input
            type="checkbox"
            checked={piece.needs_label}
            onChange={(e) => onPatch({ needs_label: e.target.checked })}
          />
          Needs label
        </label>
      </div>

      {(piece.needs_monogram || piece.needs_label) && (
        <div className="mt-3 rounded-md border border-saffron/30 bg-saffron-pale/30 p-3 text-[12px] text-ink">
          <p className="font-medium">
            Coordinate with Stationery — labels live there.
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <Field label="Label text">
              <input
                type="text"
                value={piece.label_text ?? ""}
                onChange={(e) => onPatch({ label_text: e.target.value })}
                placeholder="Uma & Neal · April 2026"
                className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
              />
            </Field>
            <Field label="Stationery status">
              <select
                value={piece.stationery_coordination_status}
                onChange={(e) =>
                  onPatch({
                    stationery_coordination_status: e.target
                      .value as StationeryCoordinationStatus,
                  })
                }
                className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
              >
                {STATIONERY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATIONERY_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Summary ─────────────────────────────────────────────────────────────

function SummaryBlock({
  computed,
  anchorChip,
}: {
  computed: TrousseauComputed;
  anchorChip?: string;
}) {
  return (
    <section className="space-y-2">
      <div className="rounded-md border border-ink/10 bg-ivory-soft p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Stat label="Total pieces" value={String(computed.total_pieces)} />
          <Stat
            label="Total cost"
            value={`$${computed.total_estimated_cost.toFixed(0)}`}
          />
          <Stat
            label={`Anchor (${anchorChip ?? "—"})`}
            value={bandLabel(computed.cost_vs_budget_anchor)}
            tone={bandTone(computed.cost_vs_budget_anchor)}
          />
          <Stat
            label="Need stationery"
            value={String(computed.pieces_needing_stationery)}
          />
        </div>
      </div>
      {computed.sourcing_lead_time_warnings.length > 0 && (
        <div className="rounded-md border border-rose/40 bg-rose-pale/30 p-3 text-[12.5px] text-ink">
          <p className="inline-flex items-center gap-1.5 font-medium text-rose">
            <AlertTriangle size={13} strokeWidth={1.8} />
            Lead-time warnings ({TROUSSEAU_LEAD_TIME_WARNING_DAYS}+ days
            before wedding)
          </p>
          <ul className="mt-2 list-disc pl-5 text-ink-muted">
            {computed.sourcing_lead_time_warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const color =
    tone === "good"
      ? "text-sage"
      : tone === "warn"
        ? "text-saffron"
        : tone === "bad"
          ? "text-rose"
          : "text-ink";
  return (
    <div>
      <span className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      <span className={cn("mt-0.5 block font-serif text-[16px]", color)}>
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
