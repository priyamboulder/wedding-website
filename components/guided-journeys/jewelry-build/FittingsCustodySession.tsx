"use client";

// ── Build Session 4 · Fittings & day-of custody ───────────────────────────
// The closer. Combines fittings appointments with the high-stakes day-of
// custody chain. Pre-builds custody from bridal + groom event assignments.
// Auto-suggests special handoffs for turban pieces and mangalsutra.

import { useEffect, useMemo } from "react";
import { AlertTriangle, Calendar, Plus, Shield, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  APPRAISAL_DEADLINE_DAYS_BEFORE_WEDDING,
  BRIDAL_PIECE_LABEL,
  GROOM_PIECE_LABEL,
  HIGH_VALUE_THRESHOLD,
  JEWELRY_BUILD_CATEGORY,
  JEWELRY_BUILD_JOURNEY_ID,
  TOTAL_VALUE_INSURANCE_TRIGGER,
  TURBAN_MOUNTED_PIECES,
  type BridalInventoryFormData,
  type BridalPiece,
  type CustodyChain,
  type FamilyHeirloomsFormData,
  type FittingAppointment,
  type FittingAppointmentType,
  type FittingsCustodyComputed,
  type FittingsCustodyFormData,
  type GroomInventoryFormData,
  type GroomPiece,
  type InsurancePlan,
  type InsurancePolicyType,
  type PerEventCustody,
  type SpecialHandoff,
  type SpecialHandoffType,
} from "@/lib/guided-journeys/jewelry-build";
import { CustodyChain as CustodyChainView } from "@/components/shared/CustodyChain";
import { useAuthStore } from "@/stores/auth-store";

const EVENT_KEYS = ["haldi", "mehendi", "sangeet", "wedding", "reception"] as const;
type EventKey = (typeof EVENT_KEYS)[number];
const EVENT_LABEL: Record<EventKey, string> = {
  haldi: "Haldi",
  mehendi: "Mehendi",
  sangeet: "Sangeet",
  wedding: "Wedding",
  reception: "Reception",
};

const APPOINTMENT_LABEL: Record<FittingAppointmentType, string> = {
  jeweler_appointment: "Jeweler appointment",
  rental_pickup: "Rental pickup",
  family_heirloom_handoff: "Family heirloom handoff",
  final_pairing_check: "Final pairing check",
  sizing_adjustment: "Sizing adjustment",
};

const POLICY_LABEL: Record<InsurancePolicyType, string> = {
  event_rider: "Event rider",
  homeowner_rider: "Homeowner rider",
  standalone_event: "Standalone event policy",
  tbd: "TBD",
};

function newId(): string {
  return `fc_${Math.random().toString(36).slice(2, 10)}`;
}

function defaultCustody(): CustodyChain {
  return {
    overnight_storage: {
      location: "",
      who_has_access: [],
    },
    per_event_custody: [],
    special_handoffs: [],
  };
}

function defaultInsurance(): InsurancePlan {
  return {
    is_insured: false,
    appraisals_needed_count: 0,
  };
}

function emptyData(): FittingsCustodyFormData {
  return {
    fittings: [],
    custody_chain: defaultCustody(),
    insurance: defaultInsurance(),
  };
}

function compute(
  data: FittingsCustodyFormData,
  totalUninsuredValue: number,
): FittingsCustodyComputed {
  const completed = data.fittings.filter((f) => f.status === "completed").length;
  const upcoming = data.fittings.filter((f) => f.status === "scheduled").length;
  let totalHandoffs = data.custody_chain.special_handoffs.length;
  for (const step of data.custody_chain.per_event_custody) {
    totalHandoffs += 2; // morning + post-event
  }
  return {
    total_fittings: data.fittings.length,
    completed_fittings: completed,
    upcoming_fittings: upcoming,
    total_handoffs: totalHandoffs,
    high_value_handoffs: data.custody_chain.special_handoffs.length,
    insurance_status_label: data.insurance.is_insured
      ? `Insured · $${(data.insurance.coverage_amount ?? 0).toLocaleString()} coverage`
      : `Not yet insured — $${totalUninsuredValue.toLocaleString()} at risk`,
  };
}

export function FittingsCustodySession() {
  const [state, update] = useCategoryJourneyState(
    JEWELRY_BUILD_CATEGORY,
    JEWELRY_BUILD_JOURNEY_ID,
  );

  const data: FittingsCustodyFormData =
    (state.formData["fittings_custody"] as unknown as
      | FittingsCustodyFormData
      | undefined) ?? emptyData();

  const bridal: BridalInventoryFormData =
    (state.formData["bridal_inventory"] as unknown as
      | BridalInventoryFormData
      | undefined) ?? { pieces: [] };
  const groom: GroomInventoryFormData =
    (state.formData["groom_inventory"] as unknown as
      | GroomInventoryFormData
      | undefined) ?? { pieces: [] };
  const heirlooms: FamilyHeirloomsFormData =
    (state.formData["family_heirlooms"] as unknown as
      | FamilyHeirloomsFormData
      | undefined) ?? { heirlooms: [] };

  const direction = state.formData["jewelry_direction"] as
    | { sourcing_mix?: { new_purchases?: boolean; rentals?: boolean } }
    | undefined;
  const visionSourcing = direction?.sourcing_mix ?? {};

  const weddingDate = useAuthStore(
    (s) => s.user?.wedding?.weddingDate,
  );

  // Total estimated value across all sources for insurance math.
  const totalValue = useMemo(() => {
    let sum = 0;
    for (const p of bridal.pieces) sum += p.estimated_value ?? 0;
    for (const p of groom.pieces) sum += p.estimated_value ?? 0;
    for (const h of heirlooms.heirlooms) sum += h.estimated_value ?? 0;
    return sum;
  }, [bridal.pieces, groom.pieces, heirlooms.heirlooms]);

  const appraisalsNeeded = useMemo(() => {
    let n = bridal.pieces.filter(
      (p) => (p.estimated_value ?? 0) >= HIGH_VALUE_THRESHOLD,
    ).length;
    n += heirlooms.heirlooms.filter((h) => h.needs_appraisal).length;
    return n;
  }, [bridal.pieces, heirlooms.heirlooms]);

  // Pre-seed fittings on first hydration.
  useEffect(() => {
    if (data.fittings.length > 0) return;
    const seeded: FittingAppointment[] = [];
    if (visionSourcing.new_purchases) {
      seeded.push({
        id: newId(),
        appointment_type: "jeweler_appointment",
        pieces_involved: [],
        status: "scheduled",
      });
    }
    if (visionSourcing.rentals) {
      seeded.push({
        id: newId(),
        appointment_type: "rental_pickup",
        pieces_involved: [],
        status: "scheduled",
      });
    }
    if (heirlooms.heirlooms.length > 0) {
      seeded.push({
        id: newId(),
        appointment_type: "family_heirloom_handoff",
        pieces_involved: heirlooms.heirlooms.map((h) => h.id),
        status: "scheduled",
      });
    }
    if (seeded.length > 0) {
      update((s) =>
        setSessionFormPath(s, "fittings_custody", "fittings", seeded),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-seed per_event_custody from inventory event assignments.
  useEffect(() => {
    if (data.custody_chain.per_event_custody.length > 0) return;
    const eventsSeen = new Set<EventKey>();
    for (const p of bridal.pieces) {
      for (const e of p.events_worn_at) eventsSeen.add(e.event as EventKey);
    }
    for (const p of groom.pieces) {
      for (const e of p.events_worn_at) eventsSeen.add(e.event as EventKey);
    }
    if (eventsSeen.size === 0) return;
    const events = EVENT_KEYS.filter((k) => eventsSeen.has(k));
    const seeded: PerEventCustody[] = events.map((event) => {
      const piecesAtEvent = [
        ...bridal.pieces
          .filter((p) => p.events_worn_at.some((e) => e.event === event))
          .map((p) => p.id),
        ...groom.pieces
          .filter((p) => p.events_worn_at.some((e) => e.event === event))
          .map((p) => p.id),
      ];
      return {
        event,
        pieces_at_event: piecesAtEvent,
        morning_handoff: {
          from: "Hotel safe",
          to: "Stylist",
          time: "Morning",
          carrier_role: "Stylist transports in locked case",
        },
        post_event_handoff: {
          from: "Stylist",
          to: "Hotel safe",
          time: "End of event",
        },
      };
    });
    update((s) =>
      setSessionFormPath(
        s,
        "fittings_custody",
        "custody_chain.per_event_custody",
        seeded,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-suggest special handoffs for turban pieces, mangalsutra, ceremonial mala.
  useEffect(() => {
    if (data.custody_chain.special_handoffs.length > 0) return;
    const seeded: SpecialHandoff[] = [];
    for (const p of groom.pieces) {
      if (TURBAN_MOUNTED_PIECES.has(p.piece_type)) {
        seeded.push({
          id: newId(),
          piece_id: p.id,
          handoff_type: "turban_piece",
          who_carries: "Family elder tying the turban",
          timing: "Just before baraat",
          notes: p.turban_placement
            ? `Placement: ${p.turban_placement}`
            : "Placement to confirm before baraat",
        });
      }
      if (p.piece_type === "mala_ceremonial") {
        seeded.push({
          id: newId(),
          piece_id: p.id,
          handoff_type: "ceremonial_mala",
          who_carries: "Pandit / officiant",
          timing: "During mala ceremony",
        });
      }
    }
    for (const p of bridal.pieces) {
      if (p.piece_type === "mangalsutra") {
        seeded.push({
          id: newId(),
          piece_id: p.id,
          handoff_type: "mangalsutra",
          who_carries: "Groom",
          timing: "During mangalsutra ceremony",
          notes: "Photographer must be in position — non-negotiable shot.",
        });
      }
    }
    if (seeded.length > 0) {
      update((s) =>
        setSessionFormPath(
          s,
          "fittings_custody",
          "custody_chain.special_handoffs",
          seeded,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute insurance.appraisals_needed_count + appraisal deadline + summary.
  useEffect(() => {
    update((s) =>
      setSessionFormPath(
        s,
        "fittings_custody",
        "insurance.appraisals_needed_count",
        appraisalsNeeded,
      ),
    );
    if (weddingDate && !data.insurance.appraisal_deadline) {
      const t = new Date(weddingDate);
      if (!Number.isNaN(t.getTime())) {
        t.setDate(t.getDate() - APPRAISAL_DEADLINE_DAYS_BEFORE_WEDDING);
        update((s) =>
          setSessionFormPath(
            s,
            "fittings_custody",
            "insurance.appraisal_deadline",
            t.toISOString().slice(0, 10),
          ),
        );
      }
    }
    update((s) =>
      setSessionFormPath(
        s,
        "fittings_custody",
        "computed",
        compute(data, totalValue),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appraisalsNeeded, weddingDate, totalValue]);

  // Mutation helpers
  function addFitting() {
    const next = [
      ...data.fittings,
      {
        id: newId(),
        appointment_type: "jeweler_appointment",
        pieces_involved: [],
        status: "scheduled",
      } as FittingAppointment,
    ];
    update((s) => setSessionFormPath(s, "fittings_custody", "fittings", next));
  }

  function patchFitting(id: string, patch: Partial<FittingAppointment>) {
    const next = data.fittings.map((f) => (f.id === id ? { ...f, ...patch } : f));
    update((s) => setSessionFormPath(s, "fittings_custody", "fittings", next));
  }

  function removeFitting(id: string) {
    update((s) =>
      setSessionFormPath(
        s,
        "fittings_custody",
        "fittings",
        data.fittings.filter((f) => f.id !== id),
      ),
    );
  }

  function patchOvernightStorage(
    patch: Partial<CustodyChain["overnight_storage"]>,
  ) {
    update((s) =>
      setSessionFormPath(s, "fittings_custody", "custody_chain.overnight_storage", {
        ...data.custody_chain.overnight_storage,
        ...patch,
      }),
    );
  }

  function patchInsurance(patch: Partial<InsurancePlan>) {
    update((s) =>
      setSessionFormPath(s, "fittings_custody", "insurance", {
        ...data.insurance,
        ...patch,
      }),
    );
  }

  // Resolve piece labels for the custody view
  const pieceLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of bridal.pieces) {
      map.set(p.id, formatBridalLabel(p));
    }
    for (const p of groom.pieces) {
      map.set(p.id, formatGroomLabel(p));
    }
    for (const h of heirlooms.heirlooms) {
      map.set(h.id, h.piece_type || "Heirloom");
    }
    return map;
  }, [bridal.pieces, groom.pieces, heirlooms.heirlooms]);

  const insuranceWarning =
    !data.insurance.is_insured && totalValue > TOTAL_VALUE_INSURANCE_TRIGGER
      ? `$${totalValue.toLocaleString()} in uninsured jewelry. Add insurance before the wedding.`
      : undefined;

  const custodySteps = data.custody_chain.per_event_custody.map((step) => ({
    id: step.event,
    event_label: EVENT_LABEL[step.event as EventKey] ?? step.event,
    pieces_at_event: step.pieces_at_event.map(
      (id) => pieceLabel.get(id) ?? "Unknown piece",
    ),
    morning_handoff: step.morning_handoff,
    between_events_storage: step.between_events_storage,
    post_event_handoff: step.post_event_handoff,
  }));

  const specialHandoffsView = data.custody_chain.special_handoffs.map((sh) => ({
    id: sh.id,
    label: pieceLabel.get(sh.piece_id) ?? sh.handoff_type,
    handoff: {
      time: sh.timing,
      from: "Storage",
      to: sh.who_carries,
      notes: sh.notes,
      high_stakes: true,
    },
  }));

  return (
    <div className="space-y-6">
      <FittingsBlock
        fittings={data.fittings}
        onAdd={addFitting}
        onPatch={patchFitting}
        onRemove={removeFitting}
      />

      <OvernightStorageBlock
        storage={data.custody_chain.overnight_storage}
        onPatch={patchOvernightStorage}
      />

      <CustodyChainView
        eyebrow="Day-of custody chain"
        heading="Plan the chain so nothing's improvised."
        warning={insuranceWarning}
        steps={custodySteps}
        special_handoffs={specialHandoffsView}
      />

      <InsuranceBlock
        insurance={data.insurance}
        totalValue={totalValue}
        appraisalsNeeded={appraisalsNeeded}
        onPatch={patchInsurance}
      />

      <SummaryBlock computed={data.computed} />
    </div>
  );
}

function formatBridalLabel(p: BridalPiece): string {
  if (p.piece_type === "custom") return p.custom_label ?? "Custom piece";
  return BRIDAL_PIECE_LABEL[p.piece_type];
}

function formatGroomLabel(p: GroomPiece): string {
  if (p.piece_type === "custom") return p.custom_label ?? "Custom piece";
  return GROOM_PIECE_LABEL[p.piece_type];
}

// ─── Fittings ────────────────────────────────────────────────────────────

function FittingsBlock({
  fittings,
  onAdd,
  onPatch,
  onRemove,
}: {
  fittings: FittingAppointment[];
  onAdd: () => void;
  onPatch: (id: string, patch: Partial<FittingAppointment>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Fittings & try-ons
          </p>
          <h3 className="mt-1 font-serif text-xl text-ink">
            Appointments leading up to the wedding
          </h3>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[12px] hover:border-rose/40"
        >
          <Plus size={12} />
          Add
        </button>
      </header>

      {fittings.length === 0 ? (
        <p className="text-[13px] italic text-ink-muted">
          No fittings yet. Add jeweler appointments, rental pickups, or family
          heirloom handoffs.
        </p>
      ) : (
        <ul className="space-y-2">
          {fittings.map((f) => (
            <li
              key={f.id}
              className="rounded-md border border-ink/10 bg-ivory-soft p-3"
            >
              <div className="flex items-start gap-2">
                <Calendar size={13} className="mt-0.5 shrink-0 text-ink-muted" />
                <div className="flex-1">
                  <div className="grid gap-2 md:grid-cols-3">
                    <select
                      value={f.appointment_type}
                      onChange={(e) =>
                        onPatch(f.id, {
                          appointment_type: e.target
                            .value as FittingAppointmentType,
                        })
                      }
                      className="rounded-md border border-ink/15 bg-paper px-2 py-1 text-[12.5px]"
                    >
                      {(
                        Object.keys(APPOINTMENT_LABEL) as FittingAppointmentType[]
                      ).map((a) => (
                        <option key={a} value={a}>
                          {APPOINTMENT_LABEL[a]}
                        </option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={f.date_time ?? ""}
                      onChange={(e) =>
                        onPatch(f.id, { date_time: e.target.value || undefined })
                      }
                      className="rounded-md border border-ink/15 bg-paper px-2 py-1 text-[12.5px]"
                    />
                    <input
                      type="text"
                      value={f.location ?? ""}
                      onChange={(e) =>
                        onPatch(f.id, { location: e.target.value })
                      }
                      placeholder="Location"
                      className="rounded-md border border-ink/15 bg-paper px-2 py-1 text-[12.5px]"
                    />
                    <input
                      type="text"
                      value={f.contact_person ?? ""}
                      onChange={(e) =>
                        onPatch(f.id, { contact_person: e.target.value })
                      }
                      placeholder="Contact person"
                      className="rounded-md border border-ink/15 bg-paper px-2 py-1 text-[12.5px]"
                    />
                    <select
                      value={f.status}
                      onChange={(e) =>
                        onPatch(f.id, {
                          status: e.target.value as FittingAppointment["status"],
                        })
                      }
                      className="rounded-md border border-ink/15 bg-paper px-2 py-1 text-[12.5px]"
                    >
                      {(["scheduled", "completed", "rescheduled", "cancelled"] as const).map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={f.notes ?? ""}
                      onChange={(e) => onPatch(f.id, { notes: e.target.value })}
                      placeholder="Notes"
                      className="rounded-md border border-ink/15 bg-paper px-2 py-1 text-[12.5px]"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(f.id)}
                  aria-label="Remove appointment"
                  className="rounded-md p-1.5 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Overnight storage ──────────────────────────────────────────────────

function OvernightStorageBlock({
  storage,
  onPatch,
}: {
  storage: CustodyChain["overnight_storage"];
  onPatch: (patch: Partial<CustodyChain["overnight_storage"]>) => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        Overnight storage
      </p>
      <p className="mt-1 text-[12.5px] italic text-ink-muted">
        Where everything sleeps the night before the wedding. Indian wedding
        jewelry can total $50K+. Plan it now.
      </p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <Field label="Location">
          <input
            type="text"
            value={storage.location}
            onChange={(e) => onPatch({ location: e.target.value })}
            placeholder="Hotel room safe — bride's suite"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Combination shared with">
          <input
            type="text"
            value={storage.lock_combination_shared_with ?? ""}
            onChange={(e) =>
              onPatch({ lock_combination_shared_with: e.target.value })
            }
            placeholder="Mom only"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Who has access (comma-separated)" className="md:col-span-2">
          <input
            type="text"
            value={storage.who_has_access.join(", ")}
            onChange={(e) =>
              onPatch({
                who_has_access: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Bride, Mom, Stylist"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
      </div>
    </section>
  );
}

// ─── Insurance ──────────────────────────────────────────────────────────

function InsuranceBlock({
  insurance,
  totalValue,
  appraisalsNeeded,
  onPatch,
}: {
  insurance: InsurancePlan;
  totalValue: number;
  appraisalsNeeded: number;
  onPatch: (patch: Partial<InsurancePlan>) => void;
}) {
  const hardWarning =
    !insurance.is_insured && totalValue > TOTAL_VALUE_INSURANCE_TRIGGER;

  return (
    <section
      className={cn(
        "rounded-md border p-5",
        hardWarning ? "border-rose/40 bg-rose-pale/20" : "border-ink/10 bg-paper",
      )}
    >
      <header className="mb-3 flex items-start gap-2">
        <Shield size={14} className="mt-0.5 shrink-0 text-rose" />
        <div>
          <p className="font-serif text-xl text-ink">Insurance & security</p>
          <p className="mt-0.5 text-[12.5px] italic text-ink-muted">
            Total estimated value across all sources: $
            {totalValue.toLocaleString()} · {appraisalsNeeded} pieces need
            appraisal.
          </p>
        </div>
      </header>

      {hardWarning && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-rose/40 bg-rose-pale/40 p-3 text-sm text-ink">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose" />
          <p className="leading-snug">
            ${totalValue.toLocaleString()} in uninsured jewelry. Add insurance
            before the wedding.
          </p>
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-2">
        <Field label="Insured">
          <label className="flex items-center gap-2 rounded-md border border-ink/15 bg-paper px-2.5 py-1.5">
            <input
              type="checkbox"
              checked={insurance.is_insured}
              onChange={(e) => onPatch({ is_insured: e.target.checked })}
            />
            <span className="text-[12.5px] text-ink-muted">
              {insurance.is_insured ? "Yes" : "Not yet"}
            </span>
          </label>
        </Field>
        <Field label="Policy type">
          <select
            value={insurance.policy_type ?? "tbd"}
            onChange={(e) =>
              onPatch({
                policy_type: e.target.value as InsurancePolicyType,
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {(Object.keys(POLICY_LABEL) as InsurancePolicyType[]).map((p) => (
              <option key={p} value={p}>
                {POLICY_LABEL[p]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Coverage amount (USD)">
          <input
            type="number"
            min={0}
            value={insurance.coverage_amount ?? ""}
            onChange={(e) =>
              onPatch({
                coverage_amount: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            placeholder="0"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
        <Field label="Policy number">
          <input
            type="text"
            value={insurance.policy_number ?? ""}
            onChange={(e) => onPatch({ policy_number: e.target.value })}
            placeholder="(optional)"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Insurer contact">
          <input
            type="text"
            value={insurance.insurer_contact ?? ""}
            onChange={(e) => onPatch({ insurer_contact: e.target.value })}
            placeholder="Agent name / phone"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Appraisal deadline">
          <input
            type="date"
            value={insurance.appraisal_deadline ?? ""}
            onChange={(e) =>
              onPatch({ appraisal_deadline: e.target.value || undefined })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
          <p className="mt-1 text-[11.5px] italic text-ink-muted">
            Default: wedding date − 60 days.
          </p>
        </Field>
      </div>
    </section>
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

// ─── Summary ────────────────────────────────────────────────────────────

function SummaryBlock({
  computed,
}: {
  computed?: FittingsCustodyComputed;
}) {
  if (!computed) return null;
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        At a glance
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
        <Stat
          label="Fittings"
          value={`${computed.completed_fittings} done · ${computed.upcoming_fittings} upcoming`}
        />
        <Stat
          label="Handoffs planned"
          value={`${computed.total_handoffs}`}
        />
        <Stat label="Insurance" value={computed.insurance_status_label} />
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
      <p className="mt-0.5 font-serif text-[15px] tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}
