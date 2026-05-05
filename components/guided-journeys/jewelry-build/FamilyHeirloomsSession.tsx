"use client";

// ── Build Session 3 · Family heirlooms ────────────────────────────────────
// Lender-aware tracking with strict privacy controls. The privacy banner
// at the top is non-negotiable. `flux_note` and `cross_side_dynamics` are
// always planner-only — they exist for planner coordination during
// sensitive family conversations.
//
// Pre-seeds from migrated _legacy_heirloom_pieces (from the original
// jewelry_direction.heirloom_pieces[] field).

import { useEffect, useMemo } from "react";
import { Lock, Plus, ShieldAlert, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  JEWELRY_BUILD_CATEGORY,
  JEWELRY_BUILD_JOURNEY_ID,
  type FamilyHeirloom,
  type FamilyHeirloomsComputed,
  type FamilyHeirloomsFormData,
  type HeirloomCondition,
  type HeirloomPrivacyLevel,
} from "@/lib/guided-journeys/jewelry-build";

const EVENT_KEYS = ["haldi", "mehendi", "sangeet", "wedding", "reception"] as const;
type EventKey = (typeof EVENT_KEYS)[number];
const EVENT_LABEL: Record<EventKey, string> = {
  haldi: "Haldi",
  mehendi: "Mehendi",
  sangeet: "Sangeet",
  wedding: "Wedding",
  reception: "Reception",
};

const CONDITION_LABEL: Record<HeirloomCondition, string> = {
  pristine: "Pristine",
  good: "Good",
  needs_repair: "Needs repair",
  fragile_antique: "Fragile antique",
};

const PRIVACY_LABEL: Record<HeirloomPrivacyLevel, string> = {
  planner_stylist_only: "Planner + stylist",
  planner_only: "Planner only",
  family_only: "Family only",
};

const PRIVACY_HELPER: Record<HeirloomPrivacyLevel, string> = {
  planner_stylist_only:
    "Planner and stylist see this. Hidden from vendor exports.",
  planner_only:
    "Only your planner sees this. Hidden from stylist and vendor surfaces.",
  family_only:
    "Just you two. Even the planner doesn't see it.",
};

interface LegacyHeirloomPiece {
  description?: string;
  events_for?: string[];
  needs_repair?: boolean;
}

function emptyData(): FamilyHeirloomsFormData {
  return { heirlooms: [] };
}

function newId(): string {
  return `hl_${Math.random().toString(36).slice(2, 10)}`;
}

function compute(heirlooms: FamilyHeirloom[]): FamilyHeirloomsComputed {
  return {
    total_heirlooms: heirlooms.length,
    confirmed_count: heirlooms.filter((h) => h.is_confirmed_with_lender).length,
    in_flux_count: heirlooms.filter((h) => Boolean(h.flux_note)).length,
    needs_appraisal_count: heirlooms.filter((h) => h.needs_appraisal).length,
    total_estimated_value: heirlooms.reduce(
      (sum, h) => sum + (h.estimated_value ?? 0),
      0,
    ),
  };
}

export function FamilyHeirloomsSession() {
  const [state, update] = useCategoryJourneyState(
    JEWELRY_BUILD_CATEGORY,
    JEWELRY_BUILD_JOURNEY_ID,
  );

  const data: FamilyHeirloomsFormData =
    (state.formData["family_heirlooms"] as unknown as
      | FamilyHeirloomsFormData
      | undefined) ?? emptyData();

  // Pre-seed from migrated _legacy_heirloom_pieces (from old Vision schema).
  const legacy = useMemo<LegacyHeirloomPiece[]>(() => {
    const direction = state.formData["jewelry_direction"] as
      | { _legacy_heirloom_pieces?: LegacyHeirloomPiece[] }
      | undefined;
    return direction?._legacy_heirloom_pieces ?? [];
  }, [state.formData]);

  useEffect(() => {
    if (data.heirlooms.length > 0) return;
    if (legacy.length === 0) return;
    const seeded: FamilyHeirloom[] = legacy.map((l) => ({
      id: newId(),
      piece_type: "Heirloom piece",
      description: l.description ?? "",
      lender: {
        name: "TBD — confirm with family",
        relationship: "",
        side: "bride",
      },
      condition: l.needs_repair ? "needs_repair" : "good",
      needs_appraisal: false,
      events_worn_at: (l.events_for ?? []).map((e) => ({
        event: (EVENT_KEYS.find((k) => k === e) ?? "wedding") as EventKey,
      })),
      is_confirmed_with_lender: false,
      privacy_level: "planner_stylist_only",
    }));
    writeAll(seeded, data.cross_side_dynamics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legacy.length]);

  function writeAll(
    heirlooms: FamilyHeirloom[],
    cross_side_dynamics?: string,
  ) {
    update((s) =>
      setSessionFormPath(s, "family_heirlooms", "heirlooms", heirlooms),
    );
    if (cross_side_dynamics !== undefined) {
      update((s) =>
        setSessionFormPath(
          s,
          "family_heirlooms",
          "cross_side_dynamics",
          cross_side_dynamics,
        ),
      );
    }
    update((s) =>
      setSessionFormPath(
        s,
        "family_heirlooms",
        "computed",
        compute(heirlooms),
      ),
    );
  }

  function addHeirloom() {
    const fresh: FamilyHeirloom = {
      id: newId(),
      piece_type: "",
      description: "",
      lender: {
        name: "",
        relationship: "",
        side: "bride",
      },
      condition: "good",
      needs_appraisal: false,
      events_worn_at: [],
      is_confirmed_with_lender: false,
      privacy_level: "planner_stylist_only",
    };
    writeAll([...data.heirlooms, fresh], data.cross_side_dynamics);
  }

  function patchHeirloom(id: string, patch: Partial<FamilyHeirloom>) {
    const next = data.heirlooms.map((h) =>
      h.id === id ? { ...h, ...patch } : h,
    );
    writeAll(next, data.cross_side_dynamics);
  }

  function patchLender(id: string, patch: Partial<FamilyHeirloom["lender"]>) {
    const next = data.heirlooms.map((h) =>
      h.id === id ? { ...h, lender: { ...h.lender, ...patch } } : h,
    );
    writeAll(next, data.cross_side_dynamics);
  }

  function removeHeirloom(id: string) {
    writeAll(
      data.heirlooms.filter((h) => h.id !== id),
      data.cross_side_dynamics,
    );
  }

  function setCrossSideDynamics(value: string) {
    update((s) =>
      setSessionFormPath(s, "family_heirlooms", "cross_side_dynamics", value),
    );
  }

  return (
    <div className="space-y-6">
      <PrivacyBanner />

      {data.heirlooms.length === 0 && (
        <EmptyStateBlock onAdd={addHeirloom} />
      )}

      <div className="space-y-3">
        {data.heirlooms.map((heirloom) => (
          <HeirloomCard
            key={heirloom.id}
            heirloom={heirloom}
            onPatch={(patch) => patchHeirloom(heirloom.id, patch)}
            onPatchLender={(patch) => patchLender(heirloom.id, patch)}
            onRemove={() => removeHeirloom(heirloom.id)}
          />
        ))}
      </div>

      {data.heirlooms.length > 0 && (
        <button
          type="button"
          onClick={addHeirloom}
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-ink/20 px-3 py-2 text-[13px] text-ink-muted hover:border-rose/40 hover:text-ink"
        >
          <Plus size={13} />
          Add another heirloom
        </button>
      )}

      <CrossSideDynamicsBlock
        value={data.cross_side_dynamics ?? ""}
        onChange={setCrossSideDynamics}
      />

      <SummaryBlock computed={data.computed} />
    </div>
  );
}

// ─── Privacy banner ──────────────────────────────────────────────────────

function PrivacyBanner() {
  return (
    <section className="rounded-md border border-rose/30 bg-rose-pale/30 p-4">
      <div className="flex items-start gap-2">
        <Lock size={14} className="mt-0.5 shrink-0 text-rose" />
        <div>
          <p className="font-serif text-[15px] text-ink">
            These pieces don't go to vendors.
          </p>
          <p className="mt-1 text-[12.5px] italic text-ink-muted">
            Your planner and stylist see them. Family conversations live here.
            "In flux" notes and cross-side dynamics are planner-only — never
            in any couple-facing or vendor export.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────

function EmptyStateBlock({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="rounded-md border border-dashed border-ink/15 bg-ivory-soft p-6 text-center">
      <p className="font-serif text-[16px] text-ink">
        No heirlooms yet.
      </p>
      <p className="mt-1 text-[13px] italic text-ink-muted">
        These are the pieces that come with stories — Nani's choker, MIL's
        polki set, that one bracelet that's been at every wedding since 1962.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[13px] text-ivory hover:bg-ink-soft"
      >
        <Plus size={13} />
        Add an heirloom
      </button>
    </section>
  );
}

// ─── Heirloom card ───────────────────────────────────────────────────────

function HeirloomCard({
  heirloom,
  onPatch,
  onPatchLender,
  onRemove,
}: {
  heirloom: FamilyHeirloom;
  onPatch: (patch: Partial<FamilyHeirloom>) => void;
  onPatchLender: (patch: Partial<FamilyHeirloom["lender"]>) => void;
  onRemove: () => void;
}) {
  const inFlux = !heirloom.is_confirmed_with_lender;
  return (
    <article
      className={cn(
        "rounded-md border p-4",
        inFlux ? "border-ink/10 bg-ivory-soft/60" : "border-ink/10 bg-paper",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                "font-serif text-[17px]",
                inFlux ? "italic text-ink-muted" : "text-ink",
              )}
            >
              {heirloom.piece_type || "New heirloom"}
            </h4>
            {inFlux && (
              <span className="rounded-full bg-amber/15 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-amber">
                Not yet confirmed
              </span>
            )}
          </div>
          {heirloom.description && (
            <p className="mt-0.5 text-[13px] italic text-ink-muted">
              {heirloom.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove heirloom"
          className="rounded-md p-1.5 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <Field label="Piece type">
          <input
            type="text"
            value={heirloom.piece_type}
            onChange={(e) => onPatch({ piece_type: e.target.value })}
            placeholder="Choker / polki set / watch / brooch"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Description">
          <input
            type="text"
            value={heirloom.description}
            onChange={(e) => onPatch({ description: e.target.value })}
            placeholder="Nani's polki choker with emerald drops, made in 1962"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
      </div>

      <fieldset className="mt-3 rounded-md border border-ink/10 bg-ivory-soft/50 p-3">
        <legend className="px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          Lender
        </legend>
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Name">
            <input
              type="text"
              value={heirloom.lender.name}
              onChange={(e) => onPatchLender({ name: e.target.value })}
              placeholder="Nani (Sushila Patel)"
              className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
            />
          </Field>
          <Field label="Relationship">
            <input
              type="text"
              value={heirloom.lender.relationship}
              onChange={(e) =>
                onPatchLender({ relationship: e.target.value })
              }
              placeholder="Bride's grandmother"
              className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
            />
          </Field>
          <Field label="Side">
            <select
              value={heirloom.lender.side}
              onChange={(e) =>
                onPatchLender({
                  side: e.target.value as "bride" | "groom",
                })
              }
              className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
            >
              <option value="bride">Bride side</option>
              <option value="groom">Groom side</option>
            </select>
          </Field>
          <Field label="Contact (optional)">
            <input
              type="text"
              value={heirloom.lender.contact ?? ""}
              onChange={(e) => onPatchLender({ contact: e.target.value })}
              placeholder="Phone or email"
              className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
            />
          </Field>
        </div>
      </fieldset>

      <Field label="Story (optional, but matters)" className="mt-3">
        <textarea
          value={heirloom.story ?? ""}
          onChange={(e) => onPatch({ story: e.target.value })}
          placeholder="Worn at Mom's wedding in 1989, Mausi's wedding in 1995. Nani wants to keep the tradition going."
          rows={2}
          className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] leading-snug"
        />
        <p className="mt-1 text-[11.5px] italic text-ink-muted">
          Stylists and photographers tell the story differently when they know
          it.
        </p>
      </Field>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <Field label="Condition">
          <select
            value={heirloom.condition}
            onChange={(e) =>
              onPatch({ condition: e.target.value as HeirloomCondition })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {(Object.keys(CONDITION_LABEL) as HeirloomCondition[]).map((c) => (
              <option key={c} value={c}>
                {CONDITION_LABEL[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estimated value (USD)">
          <input
            type="number"
            min={0}
            value={heirloom.estimated_value ?? ""}
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
        <Field label="Needs appraisal">
          <label className="flex items-center gap-2 rounded-md border border-ink/15 bg-paper px-2.5 py-1.5">
            <input
              type="checkbox"
              checked={heirloom.needs_appraisal}
              onChange={(e) => onPatch({ needs_appraisal: e.target.checked })}
            />
            <span className="text-[12.5px] text-ink-muted">For insurance</span>
          </label>
        </Field>
      </div>

      <Field label="Care notes" className="mt-3">
        <input
          type="text"
          value={heirloom.care_notes ?? ""}
          onChange={(e) => onPatch({ care_notes: e.target.value })}
          placeholder="Don't clean. Don't resize. Wear as-is."
          className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
        />
      </Field>

      <div className="mt-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          Worn at
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {EVENT_KEYS.map((event) => {
            const active = heirloom.events_worn_at.some(
              (e) => e.event === event,
            );
            return (
              <button
                key={event}
                type="button"
                onClick={() =>
                  onPatch({
                    events_worn_at: active
                      ? heirloom.events_worn_at.filter((e) => e.event !== event)
                      : [...heirloom.events_worn_at, { event }],
                  })
                }
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11.5px]",
                  active
                    ? "border-leaf bg-sage-soft text-ink"
                    : "border-ink/15 bg-ivory-soft text-ink-muted hover:border-leaf/40",
                )}
              >
                {EVENT_LABEL[event]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <Field label="Handoff plan">
          <input
            type="text"
            value={heirloom.handoff_plan ?? ""}
            onChange={(e) => onPatch({ handoff_plan: e.target.value })}
            placeholder="Nani brings it to the hotel suite morning of"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Return plan">
          <input
            type="text"
            value={heirloom.return_plan ?? ""}
            onChange={(e) => onPatch({ return_plan: e.target.value })}
            placeholder="Returned to Nani at the brunch the next day"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
      </div>

      <fieldset className="mt-3 rounded-md border border-rose/30 bg-rose-pale/15 p-3">
        <legend className="px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-rose">
          Privacy & state
        </legend>
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Confirmed with lender">
            <label className="flex items-center gap-2 rounded-md border border-ink/15 bg-paper px-2.5 py-1.5">
              <input
                type="checkbox"
                checked={heirloom.is_confirmed_with_lender}
                onChange={(e) =>
                  onPatch({ is_confirmed_with_lender: e.target.checked })
                }
              />
              <span className="text-[12.5px] text-ink-muted">
                {heirloom.is_confirmed_with_lender
                  ? "Confirmed"
                  : "Conversation pending"}
              </span>
            </label>
          </Field>
          <Field label="Privacy level">
            <select
              value={heirloom.privacy_level}
              onChange={(e) =>
                onPatch({
                  privacy_level: e.target.value as HeirloomPrivacyLevel,
                })
              }
              className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
            >
              {(Object.keys(PRIVACY_LABEL) as HeirloomPrivacyLevel[]).map(
                (p) => (
                  <option key={p} value={p}>
                    {PRIVACY_LABEL[p]}
                  </option>
                ),
              )}
            </select>
            <p className="mt-1 text-[11px] italic text-ink-muted">
              {PRIVACY_HELPER[heirloom.privacy_level]}
            </p>
          </Field>
        </div>
        <Field label="In-flux note (planner-only, never exported)" className="mt-2">
          <input
            type="text"
            value={heirloom.flux_note ?? ""}
            onChange={(e) => onPatch({ flux_note: e.target.value })}
            placeholder="Nani still deciding — don't share with vendors yet"
            className="w-full rounded-md border border-amber/40 bg-amber/5 px-2.5 py-1.5 text-[13px]"
          />
          <p className="mt-1 flex items-center gap-1 text-[11px] italic text-amber">
            <EyeOff size={11} />
            Always planner-only. Never appears in any couple-facing or
            vendor-facing surface.
          </p>
        </Field>
      </fieldset>
    </article>
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

// ─── Cross-side dynamics ────────────────────────────────────────────────

function CrossSideDynamicsBlock({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <section className="rounded-md border border-amber/40 bg-amber/5 p-4">
      <header className="flex items-start gap-2">
        <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber" />
        <div className="flex-1">
          <p className="font-serif text-[15px] text-ink">
            Cross-side dynamics (planner-only)
          </p>
          <p className="mt-0.5 text-[12.5px] italic text-ink-muted">
            Anything sensitive about who's offering what across families.
            This stays planner-only — never appears in couple-facing exports
            or vendor surfaces.
          </p>
        </div>
      </header>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="MIL is offering her wedding choker. Conversation with mom is still pending — don't surface yet."
        className="mt-3 w-full rounded-md border border-amber/40 bg-paper px-2.5 py-1.5 text-[13px] leading-snug"
      />
    </section>
  );
}

// ─── Summary ────────────────────────────────────────────────────────────

function SummaryBlock({
  computed,
}: {
  computed?: FamilyHeirloomsComputed;
}) {
  if (!computed || computed.total_heirlooms === 0) return null;
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        Heirloom state
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Stat label="Total" value={`${computed.total_heirlooms}`} />
        <Stat
          label="Confirmed"
          value={`${computed.confirmed_count}`}
        />
        <Stat label="In flux" value={`${computed.in_flux_count}`} />
        <Stat
          label="Needs appraisal"
          value={`${computed.needs_appraisal_count}`}
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
