"use client";

// ── Plan & Logistics ───────────────────────────────────────────────────────
// Transportation starts with a single question: *what needs to move, and
// when?* This tab walks through it in the same order a coordinator thinks
// about it — couple first (who the event is about), then guests (who needs
// wrangling), then vendors (who brings gear), then baraat (the big
// choreographed moment).
//
// Every answer here is referenced by later tabs: counts flow to shuttle
// sizing, baraat vehicle type pre-fills the Baraat tab, vendor parking
// surfaces on the day-of checklist.
//
// Persistence:
//   • one `kind: "assessment"` item holding all typed answers
//   • many `fleet_vehicle` items for the family / couple fleet

import { useMemo } from "react";
import {
  Car,
  Footprints,
  Plus,
  Trash2,
  UsersRound,
  Wrench,
  Heart,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  PanelCard,
  Eyebrow,
  MiniStat,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { cn } from "@/lib/utils";

// ── Assessment meta shape ──────────────────────────────────────────────────

interface AssessmentMeta {
  kind?: "assessment";
  // Couple
  bride_arrival?: "" | "bridal_car" | "family_drives" | "hotel_shuttle" | "other";
  bride_arrival_note?: string;
  groom_arrival?: "" | "baraat" | "car" | "horse_and_car" | "walking" | "other";
  groom_arrival_note?: string;
  between_events?: "" | "same_venue" | "shuttle" | "private_car";
  send_off?: "" | "decorated_car" | "vintage_car" | "uber" | "none" | "other";
  send_off_note?: string;
  // Guests
  hotel_shuttle?: boolean;
  hotel_shuttle_count?: number;
  airport_pickup?: boolean;
  airport_pickup_count?: number;
  mobility_transport?: boolean;
  mobility_transport_count?: number;
  post_event_shuttle?: boolean;
  // Vendors
  dhol_transport?: boolean;
  vendor_parking?: boolean;
  vendor_parking_list?: string;
  // Baraat
  baraat_happening?: boolean;
  baraat_vehicle?: "" | "horse" | "car" | "walking" | "elephant";
  baraat_route?: string;
}

interface VehicleMeta {
  count?: number;
  priority?: "must" | "preferred" | "nice";
  role?: string;
  notes?: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export function PlanLogisticsTab({
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
        (i) => i.category_id === category.id && i.tab === "plan_logistics",
      ),
    [items, category.id],
  );

  const assessment = scoped.find(
    (i) => (i.meta as AssessmentMeta).kind === "assessment",
  );
  const a = (assessment?.meta ?? {}) as AssessmentMeta;

  const vehicles = useMemo(
    () =>
      scoped
        .filter((i) => i.block_type === "fleet_vehicle")
        .sort((x, y) => x.sort_order - y.sort_order),
    [scoped],
  );

  // ── Mutators ────────────────────────────────────────────────────────────

  const patch = (p: Partial<AssessmentMeta>) => {
    if (!canEdit) return;
    if (!assessment) {
      addItem({
        category_id: category.id,
        tab: "plan_logistics",
        block_type: "note",
        title: "Transportation assessment",
        meta: { kind: "assessment", ...p } satisfies AssessmentMeta,
        sort_order: 0,
      });
      return;
    }
    updateItem(assessment.id, {
      meta: { ...(assessment.meta ?? {}), ...p },
    });
  };

  const addVehicle = () =>
    addItem({
      category_id: category.id,
      tab: "plan_logistics",
      block_type: "fleet_vehicle",
      title: "New vehicle",
      meta: { role: "couple" } satisfies VehicleMeta,
      sort_order: items.length + 500,
    });

  const patchVehicle = (id: string, p: Partial<VehicleMeta>) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    updateItem(id, { meta: { ...(it.meta ?? {}), ...p } });
  };

  // ── Answered-question counter for progress stat ────────────────────────

  const totalQuestions = 13;
  const answered = [
    a.bride_arrival,
    a.groom_arrival,
    a.between_events,
    a.send_off,
    a.hotel_shuttle !== undefined,
    a.airport_pickup !== undefined,
    a.mobility_transport !== undefined,
    a.post_event_shuttle !== undefined,
    a.dhol_transport !== undefined,
    a.vendor_parking !== undefined,
    a.baraat_happening !== undefined,
    a.baraat_vehicle,
    a.baraat_route,
  ].filter(Boolean).length;

  const peopleMoving =
    (a.hotel_shuttle ? a.hotel_shuttle_count ?? 0 : 0) +
    (a.mobility_transport ? a.mobility_transport_count ?? 0 : 0);

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
        Transportation is pure logistics — but the answers here ripple
        everywhere. Guest counts size the shuttles. Baraat vehicle pre-fills
        the next tab. Vendor parking lands on the day-of sheet.
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat
          label="Answered"
          value={`${answered}/${totalQuestions}`}
          tone={answered === totalQuestions ? "sage" : "ink"}
        />
        <MiniStat
          label="Guests needing shuttle"
          value={a.hotel_shuttle ? a.hotel_shuttle_count ?? 0 : "—"}
          tone="saffron"
        />
        <MiniStat
          label="Airport pickups"
          value={a.airport_pickup ? a.airport_pickup_count ?? 0 : "—"}
          tone="saffron"
        />
        <MiniStat
          label="Peak people moving"
          value={peopleMoving || "—"}
          hint={peopleMoving >= 50 ? "Coach-sized" : undefined}
        />
      </div>

      {/* ── COUPLE ──────────────────────────────────────────────── */}
      <PanelCard
        icon={<Heart size={14} strokeWidth={1.8} />}
        title="The couple"
        badge={<Tag>Who the day is about</Tag>}
      >
        <Questions>
          <ChoiceRow
            question="Bride arrival — how?"
            value={a.bride_arrival ?? ""}
            onChange={(v) => patch({ bride_arrival: v as AssessmentMeta["bride_arrival"] })}
            options={[
              { value: "", label: "Pick one" },
              { value: "bridal_car", label: "Bridal car" },
              { value: "family_drives", label: "Family drives" },
              { value: "hotel_shuttle", label: "Hotel shuttle" },
              { value: "other", label: "Other" },
            ]}
            note={a.bride_arrival === "other" ? a.bride_arrival_note : undefined}
            onNote={(v) => patch({ bride_arrival_note: v })}
            disabled={!canEdit}
          />
          <ChoiceRow
            question="Groom arrival — how?"
            value={a.groom_arrival ?? ""}
            onChange={(v) => patch({ groom_arrival: v as AssessmentMeta["groom_arrival"] })}
            options={[
              { value: "", label: "Pick one" },
              { value: "baraat", label: "Baraat procession" },
              { value: "car", label: "Car only" },
              { value: "horse_and_car", label: "Horse + car" },
              { value: "walking", label: "Walking" },
              { value: "other", label: "Other" },
            ]}
            note={a.groom_arrival === "other" ? a.groom_arrival_note : undefined}
            onNote={(v) => patch({ groom_arrival_note: v })}
            disabled={!canEdit}
          />
          <ChoiceRow
            question="Between events"
            value={a.between_events ?? ""}
            onChange={(v) => patch({ between_events: v as AssessmentMeta["between_events"] })}
            options={[
              { value: "", label: "Pick one" },
              { value: "same_venue", label: "Same venue — walk" },
              { value: "shuttle", label: "Shuttle between venues" },
              { value: "private_car", label: "Private car" },
            ]}
            disabled={!canEdit}
          />
          <ChoiceRow
            question="Send-off / exit"
            value={a.send_off ?? ""}
            onChange={(v) => patch({ send_off: v as AssessmentMeta["send_off"] })}
            options={[
              { value: "", label: "Pick one" },
              { value: "decorated_car", label: "Decorated car" },
              { value: "vintage_car", label: "Vintage car" },
              { value: "uber", label: "Rideshare / Uber" },
              { value: "none", label: "Not doing an exit" },
              { value: "other", label: "Other" },
            ]}
            note={a.send_off === "other" ? a.send_off_note : undefined}
            onNote={(v) => patch({ send_off_note: v })}
            disabled={!canEdit}
          />
        </Questions>
      </PanelCard>

      {/* ── GUESTS ──────────────────────────────────────────────── */}
      <PanelCard
        icon={<UsersRound size={14} strokeWidth={1.8} />}
        title="Guests"
        badge={<Tag>Who needs wrangling</Tag>}
      >
        <Questions>
          <YesNoCount
            question="Hotel-to-venue shuttle needed?"
            countLabel="guests at hotel"
            active={a.hotel_shuttle}
            count={a.hotel_shuttle_count}
            onToggle={(v) => patch({ hotel_shuttle: v })}
            onCount={(v) => patch({ hotel_shuttle_count: v })}
            disabled={!canEdit}
          />
          <YesNoCount
            question="Airport pickup coordination?"
            countLabel="guests flying in"
            active={a.airport_pickup}
            count={a.airport_pickup_count}
            onToggle={(v) => patch({ airport_pickup: v })}
            onCount={(v) => patch({ airport_pickup_count: v })}
            disabled={!canEdit}
          />
          <YesNoCount
            question="Elderly / mobility-impaired transport?"
            countLabel="guests need accessible transport"
            active={a.mobility_transport}
            count={a.mobility_transport_count}
            onToggle={(v) => patch({ mobility_transport: v })}
            onCount={(v) => patch({ mobility_transport_count: v })}
            disabled={!canEdit}
          />
          <YesNoRow
            question="Post-event shuttle back to hotel?"
            active={a.post_event_shuttle}
            onToggle={(v) => patch({ post_event_shuttle: v })}
            disabled={!canEdit}
          />
        </Questions>
      </PanelCard>

      {/* ── VENDORS ─────────────────────────────────────────────── */}
      <PanelCard
        icon={<Wrench size={14} strokeWidth={1.8} />}
        title="Vendors"
        badge={<Tag>Who brings gear</Tag>}
      >
        <Questions>
          <YesNoRow
            question="Dhol players need transport?"
            active={a.dhol_transport}
            onToggle={(v) => patch({ dhol_transport: v })}
            disabled={!canEdit}
          />
          <YesNoText
            question="Any vendors need parking reserved?"
            textLabel="List vendors"
            active={a.vendor_parking}
            text={a.vendor_parking_list ?? ""}
            onToggle={(v) => patch({ vendor_parking: v })}
            onText={(v) => patch({ vendor_parking_list: v })}
            disabled={!canEdit}
          />
        </Questions>
      </PanelCard>

      {/* ── BARAAT ──────────────────────────────────────────────── */}
      <PanelCard
        icon={<Footprints size={14} strokeWidth={1.8} />}
        title="Baraat"
        badge={<Tag tone="saffron">Pre-fills next tab</Tag>}
      >
        <Questions>
          <YesNoRow
            question="Baraat happening?"
            active={a.baraat_happening}
            onToggle={(v) => patch({ baraat_happening: v })}
            disabled={!canEdit}
          />
          {a.baraat_happening && (
            <>
              <ChoiceRow
                question="Horse, vintage car, walking, or elephant?"
                value={a.baraat_vehicle ?? ""}
                onChange={(v) => patch({ baraat_vehicle: v as AssessmentMeta["baraat_vehicle"] })}
                options={[
                  { value: "", label: "Pick one" },
                  { value: "horse", label: "Horse" },
                  { value: "car", label: "Vintage / decorated car" },
                  { value: "walking", label: "Walking" },
                  { value: "elephant", label: "Elephant (rare)" },
                ]}
                disabled={!canEdit}
              />
              <TextRow
                question="Route"
                value={a.baraat_route ?? ""}
                placeholder="From hotel lobby to venue entrance"
                onChange={(v) => patch({ baraat_route: v })}
                disabled={!canEdit}
              />
            </>
          )}
        </Questions>
      </PanelCard>

      {/* ── Family fleet ───────────────────────────────────────── */}
      <PanelCard
        icon={<Car size={14} strokeWidth={1.8} />}
        title="Family & couple fleet"
        badge={
          canEdit ? (
            <button
              type="button"
              onClick={addVehicle}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
            >
              <Plus size={12} strokeWidth={1.8} />
              Add vehicle
            </button>
          ) : undefined
        }
      >
        {vehicles.length === 0 ? (
          <p className="py-2 text-[12px] italic text-ink-faint">
            Capture the vehicles tied to the family — bridal car, groom's
            horse/car, reception exit. Guest shuttles live in the next tab.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-border/60">
            <div
              className="grid border-b border-border/60 bg-ivory-warm/30 px-3 py-2"
              style={{
                gridTemplateColumns: "100px minmax(0, 2fr) minmax(0, 1.2fr) 70px 24px",
              }}
            >
              <Eyebrow>Priority</Eyebrow>
              <Eyebrow>Vehicle</Eyebrow>
              <Eyebrow>Role</Eyebrow>
              <Eyebrow>Qty</Eyebrow>
              <span />
            </div>
            <ul className="divide-y divide-border/60">
              {vehicles.map((v) => {
                const meta = (v.meta ?? {}) as VehicleMeta;
                return (
                  <li
                    key={v.id}
                    className="group grid items-center gap-2 px-3 py-2"
                    style={{
                      gridTemplateColumns: "100px minmax(0, 2fr) minmax(0, 1.2fr) 70px 24px",
                    }}
                  >
                    <select
                      value={meta.priority ?? ""}
                      onChange={(e) =>
                        patchVehicle(v.id, {
                          priority: (e.target.value || undefined) as VehicleMeta["priority"],
                        })
                      }
                      disabled={!canEdit}
                      className="w-full rounded-sm border border-border bg-white px-1.5 py-1 text-[11px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                    >
                      <option value="">—</option>
                      <option value="must">Must</option>
                      <option value="preferred">Preferred</option>
                      <option value="nice">Nice</option>
                    </select>
                    <input
                      value={v.title}
                      onChange={(e) => updateItem(v.id, { title: e.target.value })}
                      disabled={!canEdit}
                      placeholder="Vintage Rolls Royce"
                      className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                    />
                    <input
                      value={meta.role ?? ""}
                      onChange={(e) => patchVehicle(v.id, { role: e.target.value })}
                      disabled={!canEdit}
                      placeholder="Bridal · family · exit"
                      className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                    />
                    <input
                      type="number"
                      min={0}
                      value={meta.count ?? ""}
                      onChange={(e) =>
                        patchVehicle(v.id, {
                          count: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      disabled={!canEdit}
                      className="w-full rounded-sm border border-border bg-white px-2 py-1 font-mono text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                    <div className="flex justify-end">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => deleteItem(v.id)}
                          className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                          aria-label="Remove vehicle"
                        >
                          <Trash2 size={12} strokeWidth={1.8} />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </PanelCard>
    </div>
  );
}

// ── Question row primitives ────────────────────────────────────────────────

function Questions({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-border/60">{children}</div>;
}

function QuestionRow({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 items-center gap-3 py-2.5">
      <p className="col-span-12 text-[12.5px] text-ink md:col-span-5">{question}</p>
      <div className="col-span-12 md:col-span-7">{children}</div>
    </div>
  );
}

function ChoiceRow({
  question,
  value,
  onChange,
  options,
  disabled,
  note,
  onNote,
}: {
  question: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  note?: string;
  onNote?: (v: string) => void;
}) {
  return (
    <QuestionRow question={question}>
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60",
            onNote ? "md:w-56" : "w-full",
          )}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {onNote && note !== undefined && (
          <input
            value={note}
            onChange={(e) => onNote(e.target.value)}
            disabled={disabled}
            placeholder="Describe"
            className="flex-1 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
          />
        )}
      </div>
    </QuestionRow>
  );
}

function YesNoRow({
  question,
  active,
  onToggle,
  disabled,
}: {
  question: string;
  active: boolean | undefined;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <QuestionRow question={question}>
      <YesNoPill value={active} onChange={onToggle} disabled={disabled} />
    </QuestionRow>
  );
}

function YesNoCount({
  question,
  countLabel,
  active,
  count,
  onToggle,
  onCount,
  disabled,
}: {
  question: string;
  countLabel: string;
  active: boolean | undefined;
  count: number | undefined;
  onToggle: (v: boolean) => void;
  onCount: (v: number | undefined) => void;
  disabled?: boolean;
}) {
  return (
    <QuestionRow question={question}>
      <div className="flex flex-wrap items-center gap-2">
        <YesNoPill value={active} onChange={onToggle} disabled={disabled} />
        {active && (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              value={count ?? ""}
              onChange={(e) => onCount(e.target.value ? Number(e.target.value) : undefined)}
              disabled={disabled}
              className="w-20 rounded-sm border border-border bg-white px-2 py-1 font-mono text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
              style={{ fontFamily: "var(--font-mono)" }}
            />
            <span className="text-[11.5px] text-ink-muted">{countLabel}</span>
          </div>
        )}
      </div>
    </QuestionRow>
  );
}

function YesNoText({
  question,
  textLabel,
  active,
  text,
  onToggle,
  onText,
  disabled,
}: {
  question: string;
  textLabel: string;
  active: boolean | undefined;
  text: string;
  onToggle: (v: boolean) => void;
  onText: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <QuestionRow question={question}>
      <div className="flex flex-wrap items-center gap-2">
        <YesNoPill value={active} onChange={onToggle} disabled={disabled} />
        {active && (
          <input
            value={text}
            onChange={(e) => onText(e.target.value)}
            disabled={disabled}
            placeholder={textLabel}
            className="min-w-[200px] flex-1 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
          />
        )}
      </div>
    </QuestionRow>
  );
}

function TextRow({
  question,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  question: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <QuestionRow question={question}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
      />
    </QuestionRow>
  );
}

function YesNoPill({
  value,
  onChange,
  disabled,
}: {
  value: boolean | undefined;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex rounded-sm border border-border bg-white p-0.5">
      {[
        { label: "Yes", v: true },
        { label: "No", v: false },
      ].map((opt) => {
        const active = value === opt.v;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => !disabled && onChange(opt.v)}
            disabled={disabled}
            className={cn(
              "rounded-sm px-3 py-0.5 text-[11.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              active
                ? opt.v
                  ? "bg-sage/15 text-sage"
                  : "bg-ink-muted/10 text-ink-muted"
                : "text-ink-faint hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
