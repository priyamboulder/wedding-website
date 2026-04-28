"use client";

// ── Suite Builder ─────────────────────────────────────────────────────────
// Master inventory of every paper piece in the wedding + the per-piece
// content editor. The couple toggles pieces on/off, edits the quantity,
// and drops in the finalized wording (English + translation, venue, dress
// code) that the designer will drop into the artwork.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  pieceContentFor,
  suggestedQuantity,
  useStationeryStore,
  withBuffer,
} from "@/stores/stationery-store";
import type {
  StationeryItemStatus,
  StationeryPieceContent,
  StationerySuiteItem,
  StationerySuiteKind,
  StationerySuiteSection,
} from "@/types/stationery";
import {
  STATIONERY_EVENT_LABEL,
  STATIONERY_ITEM_STATUS_LABEL,
  STATIONERY_ITEM_STATUS_ORDER,
  STATIONERY_SECTION_LABEL,
} from "@/types/stationery";
import {
  Eyebrow,
  MiniStat,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";

// ── Root ──────────────────────────────────────────────────────────────────

export function SuiteBuilder() {
  const suite = useStationeryStore((s) => s.suite);
  const guestMetrics = useStationeryStore((s) => s.guestMetrics);
  const setGuestMetrics = useStationeryStore((s) => s.setGuestMetrics);
  const resyncAll = useStationeryStore((s) => s.resyncAllSuiteQuantities);

  const [showAdd, setShowAdd] = useState<StationerySuiteSection | null>(null);

  const grouped = useMemo(() => {
    const bySection = {
      pre_wedding: [] as StationerySuiteItem[],
      day_of: [] as StationerySuiteItem[],
      post_wedding: [] as StationerySuiteItem[],
    };
    for (const item of suite) bySection[item.section].push(item);
    return bySection;
  }, [suite]);

  // Totals only count enabled pieces.
  const totals = useMemo(() => {
    let pieces = 0;
    let totalPrint = 0;
    let totalCost = 0;
    let approved = 0;
    let inFlight = 0;
    for (const item of suite) {
      if (!item.enabled) continue;
      pieces += 1;
      const qty = withBuffer(item.quantity, item.buffer_pct);
      totalPrint += qty;
      totalCost += qty * item.cost_unit;
      if (
        item.status === "approved" ||
        item.status === "in_production" ||
        item.status === "printed" ||
        item.status === "shipped"
      ) {
        approved += 1;
      }
      if (item.status === "in_design" || item.status === "proof_review") {
        inFlight += 1;
      }
    }
    return { pieces, totalPrint, totalCost, approved, inFlight };
  }, [suite]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Suite Builder"
        title="Every piece in your suite — and what each one says"
        description="Toggle pieces on or off, edit quantities, and write the copy each piece needs to carry. Quantities recalculate from your guest list when households change."
      />

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <MiniStat
          label="Active pieces"
          value={totals.pieces}
          hint="Enabled across all sections"
        />
        <MiniStat
          label="Total print run"
          value={totals.totalPrint.toLocaleString()}
          hint="Qty + buffer"
          tone="saffron"
        />
        <MiniStat
          label="Subtotal"
          value={`₹${(totals.totalCost / 100_000).toFixed(1)}L`}
          hint="Before addressing + shipping"
        />
        <MiniStat
          label="Approved"
          value={`${totals.approved}/${totals.pieces}`}
          tone="sage"
        />
        <MiniStat
          label="In design / review"
          value={totals.inFlight}
          tone="saffron"
        />
      </div>

      {/* ── Quantity calculator strip ─────────────────────────────────── */}
      <QuantityStrip
        guestCount={guestMetrics.guestCount}
        householdCount={guestMetrics.householdCount}
        onGuestChange={(n) => setGuestMetrics({ guestCount: n })}
        onHouseholdChange={(n) => setGuestMetrics({ householdCount: n })}
        onResyncAll={resyncAll}
      />

      {(["pre_wedding", "day_of", "post_wedding"] as StationerySuiteSection[]).map(
        (section) => (
          <SuiteSectionBlock
            key={section}
            section={section}
            items={grouped[section]}
            onRequestAdd={() => setShowAdd(section)}
            showAddForm={showAdd === section}
            onDismissAdd={() => setShowAdd(null)}
          />
        ),
      )}
    </div>
  );
}

// ── Quantity calculator strip ─────────────────────────────────────────────

function QuantityStrip({
  guestCount,
  householdCount,
  onGuestChange,
  onHouseholdChange,
  onResyncAll,
}: {
  guestCount: number;
  householdCount: number;
  onGuestChange: (n: number) => void;
  onHouseholdChange: (n: number) => void;
  onResyncAll: () => void;
}) {
  return (
    <PanelCard
      icon={<Users size={14} strokeWidth={1.8} />}
      title="Smart quantity calculator"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-4">
          <NumberField
            label="Guests"
            value={guestCount}
            onChange={onGuestChange}
          />
          <NumberField
            label="Households"
            value={householdCount}
            onChange={onHouseholdChange}
          />
          <p className="max-w-sm text-[12px] text-ink-muted">
            Invitations go to households; programs, menus, favors go to each
            guest. Change these to re-suggest every quantity below.
          </p>
        </div>
        <button
          type="button"
          onClick={onResyncAll}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          Re-suggest all quantities
        </button>
      </div>
    </PanelCard>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex flex-col">
      <Eyebrow className="mb-1">{label}</Eyebrow>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-28 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[13px] tabular-nums text-ink focus:border-saffron focus:outline-none"
      />
    </label>
  );
}

// ── Per-section block ─────────────────────────────────────────────────────

const SECTION_DESCRIPTION: Record<StationerySuiteSection, string> = {
  pre_wedding:
    "Everything that arrives in mailboxes. Drives the whole critical path — design here must lock first.",
  day_of:
    "Programs, menus, place cards, signage. Lower volume, higher visibility. Finalize 2–3 weeks before the wedding so seating can still shift.",
  post_wedding:
    "Thank-you cards. Mail within 6 weeks of the last event; the gesture counts more than the card.",
};

function SuiteSectionBlock({
  section,
  items,
  onRequestAdd,
  showAddForm,
  onDismissAdd,
}: {
  section: StationerySuiteSection;
  items: StationerySuiteItem[];
  onRequestAdd: () => void;
  showAddForm: boolean;
  onDismissAdd: () => void;
}) {
  return (
    <section className="space-y-3">
      <header className="flex items-end justify-between gap-3">
        <div>
          <Eyebrow>Section</Eyebrow>
          <h3 className="font-serif text-[22px] font-bold leading-[1.2] text-ink">
            {STATIONERY_SECTION_LABEL[section]}
          </h3>
          <p className="mt-1 max-w-2xl text-[12.5px] text-ink-muted">
            {SECTION_DESCRIPTION[section]}
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory"
        >
          <Plus size={12} strokeWidth={2} />
          Add piece
        </button>
      </header>

      {showAddForm && <AddItemForm section={section} onDone={onDismissAdd} />}

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-ivory-warm/30 p-6 text-center font-serif text-[15px] italic text-ink-muted">
          Nothing added to this section yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <SuiteItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Item card with content builder ────────────────────────────────────────

function SuiteItemCard({ item }: { item: StationerySuiteItem }) {
  const updateItem = useStationeryStore((s) => s.updateSuiteItem);
  const deleteItem = useStationeryStore((s) => s.deleteSuiteItem);
  const setEnabled = useStationeryStore((s) => s.setSuiteItemEnabled);
  const guestMetrics = useStationeryStore((s) => s.guestMetrics);
  const pieceContentList = useStationeryStore((s) => s.pieceContent);
  const updatePieceContent = useStationeryStore((s) => s.updatePieceContent);

  const suggested = suggestedQuantity(item.kind, guestMetrics);
  const outOfDate = suggested !== item.quantity;
  const totalQty = withBuffer(item.quantity, item.buffer_pct);
  const totalCost = totalQty * item.cost_unit;
  const content = pieceContentFor(pieceContentList, item.id);

  const [editing, setEditing] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [draft, setDraft] = useState({
    quantity: item.quantity,
    buffer_pct: item.buffer_pct,
    cost_unit: item.cost_unit,
    delivery_mode: item.delivery_mode ?? "",
    notes: item.notes ?? "",
  });

  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-4 shadow-[0_1px_1px_rgba(26,26,26,0.03)] transition-opacity",
        item.enabled ? "border-border" : "border-border/50 opacity-60",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <ToggleCheck
            checked={item.enabled}
            onChange={(v) => setEnabled(item.id, v)}
            label={`Include ${item.name} in suite`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <StatusDot status={item.status} />
              <h4 className="truncate font-medium text-[13.5px] text-ink">
                {item.name}
              </h4>
              {item.event && (
                <span
                  className="rounded-sm bg-saffron-pale/60 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-saffron"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {STATIONERY_EVENT_LABEL[item.event]}
                </span>
              )}
            </div>
            {item.description && (
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                {item.description}
              </p>
            )}
            {item.delivery_mode && (
              <p className="mt-1 font-serif text-[13px] italic text-ink-muted">
                · {item.delivery_mode}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => deleteItem(item.id)}
          className="text-ink-faint transition-colors hover:text-rose"
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 size={12} strokeWidth={1.8} />
        </button>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCell
          label="Quantity"
          value={item.quantity.toLocaleString()}
          helper={
            outOfDate
              ? `Suggest ${suggested.toLocaleString()}`
              : `+${item.buffer_pct}% buffer`
          }
          alert={outOfDate}
        />
        <StatCell
          label="Print run"
          value={totalQty.toLocaleString()}
          helper="With buffer"
        />
        <StatCell
          label="Unit"
          value={`₹${item.cost_unit.toLocaleString()}`}
        />
        <StatCell
          label="Line total"
          value={`₹${(totalCost / 1000).toFixed(1)}k`}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusSelect
          value={item.status}
          onChange={(status) => updateItem(item.id, { status })}
        />
        {outOfDate && (
          <button
            type="button"
            onClick={() =>
              updateItem(item.id, {
                quantity: suggested,
              })
            }
            className="ml-auto inline-flex items-center gap-1 rounded-sm bg-saffron-pale/60 px-2 py-1 text-[10.5px] font-medium text-saffron"
          >
            <AlertTriangle size={10} strokeWidth={2} />
            Sync to {suggested.toLocaleString()}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setContentOpen((v) => !v)}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {contentOpen ? (
            <ChevronDown size={12} strokeWidth={1.8} />
          ) : (
            <ChevronRight size={12} strokeWidth={1.8} />
          )}
          {contentOpen ? "Close content" : "Edit content"}
        </button>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {editing ? "Close" : "Edit quantity / cost"}
        </button>
      </div>

      {editing && (
        <div className="mt-3 space-y-2 rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <NumberField
              label="Quantity"
              value={draft.quantity}
              onChange={(n) => setDraft((d) => ({ ...d, quantity: n }))}
            />
            <NumberField
              label="Buffer %"
              value={draft.buffer_pct}
              onChange={(n) => setDraft((d) => ({ ...d, buffer_pct: n }))}
            />
            <NumberField
              label="Unit cost"
              value={draft.cost_unit}
              onChange={(n) => setDraft((d) => ({ ...d, cost_unit: n }))}
            />
          </div>
          <label className="flex flex-col">
            <Eyebrow className="mb-1">Delivery mode</Eyebrow>
            <input
              value={draft.delivery_mode}
              onChange={(e) =>
                setDraft((d) => ({ ...d, delivery_mode: e.target.value }))
              }
              placeholder="e.g. Printed + digital"
              className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
            />
          </label>
          <label className="flex flex-col">
            <Eyebrow className="mb-1">Notes</Eyebrow>
            <textarea
              value={draft.notes}
              onChange={(e) =>
                setDraft((d) => ({ ...d, notes: e.target.value }))
              }
              rows={2}
              className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              updateItem(item.id, {
                quantity: draft.quantity,
                buffer_pct: draft.buffer_pct,
                cost_unit: draft.cost_unit,
                delivery_mode: draft.delivery_mode.trim() || undefined,
                notes: draft.notes,
              });
              setEditing(false);
            }}
            className="inline-flex items-center gap-1 rounded-sm bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory"
          >
            Save changes
          </button>
        </div>
      )}

      {contentOpen && (
        <ContentBuilderCard
          item={item}
          content={content}
          onUpdate={(patch) => updatePieceContent(item.id, patch)}
        />
      )}

      {item.notes && !editing && (
        <p className="mt-2 rounded-sm bg-ivory-warm/40 px-2 py-1.5 font-serif text-[13px] italic text-ink-muted">
          {item.notes}
        </p>
      )}
    </article>
  );
}

// ── Content builder ───────────────────────────────────────────────────────

function ContentBuilderCard({
  item,
  content,
  onUpdate,
}: {
  item: StationerySuiteItem;
  content: StationeryPieceContent;
  onUpdate: (patch: Partial<StationeryPieceContent>) => void;
}) {
  // Which fields make sense for each kind — omit noise (RSVP doesn't need
  // a translation line, table numbers don't need a couple line).
  const showCoupleBlock =
    item.kind === "save_the_date" ||
    item.kind === "main_invitation" ||
    item.kind === "details_card" ||
    item.kind === "event_insert" ||
    item.kind === "thank_you_card";

  const showVenueBlock =
    item.kind === "save_the_date" ||
    item.kind === "main_invitation" ||
    item.kind === "event_insert" ||
    item.kind === "ceremony_program" ||
    item.kind === "welcome_bag_insert";

  return (
    <div className="mt-3 rounded-md border border-saffron/30 bg-saffron-pale/20 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
          Content · what this piece says
        </p>
        <button
          type="button"
          onClick={() => onUpdate({})}
          className="inline-flex items-center gap-1 rounded-sm bg-white px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted hover:text-saffron"
        >
          <Sparkles size={10} strokeWidth={1.8} />
          AI draft (coming soon)
        </button>
      </div>

      <div className="space-y-2">
        {showCoupleBlock && (
          <>
            <FieldRow
              label="Couple line"
              value={content.couple_line ?? ""}
              onChange={(v) => onUpdate({ couple_line: v })}
              placeholder="e.g. Priya & Raj"
            />
            <FieldRow
              label="Family line"
              value={content.family_line ?? ""}
              onChange={(v) => onUpdate({ family_line: v })}
              placeholder="e.g. Sharma & Malhotra families"
            />
            <FieldRow
              label="Host line"
              value={content.host_line ?? ""}
              onChange={(v) => onUpdate({ host_line: v })}
              placeholder="Together with their families"
            />
          </>
        )}
        <FieldRow
          label="Main text"
          value={content.main_text ?? ""}
          onChange={(v) => onUpdate({ main_text: v })}
          placeholder="Request the pleasure of your company…"
          multiline
        />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_2fr]">
          <FieldRow
            label="Second language"
            value={content.translation_language ?? ""}
            onChange={(v) => onUpdate({ translation_language: v })}
            placeholder="Hindi"
            compact
          />
          <FieldRow
            label="Translation"
            value={content.translation ?? ""}
            onChange={(v) => onUpdate({ translation: v })}
            placeholder="आपको सादर आमंत्रित करते हैं…"
            multiline
            compact
          />
        </div>
        {showVenueBlock && (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <FieldRow
              label="Date"
              value={content.event_date ?? ""}
              onChange={(v) => onUpdate({ event_date: v })}
              placeholder="Saturday, April 12, 2026"
              compact
            />
            <FieldRow
              label="Dress code"
              value={content.dress_code ?? ""}
              onChange={(v) => onUpdate({ dress_code: v })}
              placeholder="Indian formal"
              compact
            />
            <FieldRow
              label="Venue"
              value={content.venue_name ?? ""}
              onChange={(v) => onUpdate({ venue_name: v })}
              placeholder="The Leela Palace, Dallas"
              compact
            />
            <FieldRow
              label="Venue address"
              value={content.venue_address ?? ""}
              onChange={(v) => onUpdate({ venue_address: v })}
              placeholder="200 N Pearl St, Dallas, TX 75201"
              compact
            />
          </div>
        )}
        <FieldRow
          label="Internal notes"
          value={content.notes ?? ""}
          onChange={(v) => onUpdate({ notes: v })}
          placeholder="Anything the designer should know but won't appear on the card"
          multiline
        />
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  compact?: boolean;
}) {
  return (
    <label className={cn("flex flex-col", compact ? "gap-0.5" : "gap-1")}>
      <Eyebrow>{label}</Eyebrow>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={compact ? 2 : 3}
          className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      )}
    </label>
  );
}

// ── Add form ──────────────────────────────────────────────────────────────

const ADD_KINDS: { kind: StationerySuiteKind; label: string }[] = [
  { kind: "save_the_date", label: "Save the Date" },
  { kind: "main_invitation", label: "Main Invitation" },
  { kind: "rsvp_card", label: "RSVP Card" },
  { kind: "details_card", label: "Details Card" },
  { kind: "event_insert", label: "Event Insert" },
  { kind: "map_card", label: "Map / Directions Card" },
  { kind: "accommodation_card", label: "Accommodation Card" },
  { kind: "envelope_outer", label: "Outer Envelope" },
  { kind: "envelope_inner", label: "Inner Envelope" },
  { kind: "enclosure", label: "Enclosure (belly band / wax seal)" },
  { kind: "ceremony_program", label: "Ceremony Program" },
  { kind: "menu_card", label: "Menu Card" },
  { kind: "place_card", label: "Place / Escort Card" },
  { kind: "table_number", label: "Table Number / Name" },
  { kind: "signage", label: "Signage" },
  { kind: "favor_tag", label: "Favor Tag" },
  { kind: "welcome_bag_insert", label: "Welcome Bag Insert" },
  { kind: "seating_chart", label: "Seating Chart Display" },
  { kind: "thank_you_card", label: "Thank You Card" },
  { kind: "custom", label: "Custom piece" },
];

function AddItemForm({
  section,
  onDone,
}: {
  section: StationerySuiteSection;
  onDone: () => void;
}) {
  const addItem = useStationeryStore((s) => s.addSuiteItem);
  const metrics = useStationeryStore((s) => s.guestMetrics);

  const [kind, setKind] = useState<StationerySuiteKind>(() =>
    section === "pre_wedding"
      ? "event_insert"
      : section === "day_of"
        ? "signage"
        : "thank_you_card",
  );
  const [name, setName] = useState("");
  const suggested = suggestedQuantity(kind, metrics);

  return (
    <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[2fr_3fr_auto] md:items-end">
        <label className="flex flex-col">
          <Eyebrow className="mb-1">Kind</Eyebrow>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as StationerySuiteKind)}
            className="rounded-sm border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
          >
            {ADD_KINDS.map((k) => (
              <option key={k.kind} value={k.kind}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col">
          <Eyebrow className="mb-1">Name on the card</Eyebrow>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Welcome Dinner Insert"
            className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
          />
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => {
              addItem({
                section,
                kind,
                name: name.trim(),
                enabled: true,
                quantity: suggested,
                buffer_pct: 10,
                cost_unit: 0,
                status: "not_started",
                custom: kind === "custom",
              });
              onDone();
            }}
            className={cn(
              "rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors",
              name.trim()
                ? "bg-ink text-ivory"
                : "bg-ivory-warm text-ink-faint",
            )}
          >
            Add to suite
          </button>
          <button
            type="button"
            onClick={onDone}
            className="text-[11.5px] text-ink-muted hover:text-saffron"
          >
            Cancel
          </button>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-ink-muted">
        Suggested quantity for this kind: {suggested.toLocaleString()}.
      </p>
    </div>
  );
}

// ── Small presentational bits ─────────────────────────────────────────────

function ToggleCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "mt-0.5 flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors",
        checked
          ? "border-saffron bg-saffron text-white"
          : "border-border bg-white text-transparent hover:border-saffron/50",
      )}
    >
      <span className="text-[10px] leading-none">✓</span>
    </button>
  );
}

function StatCell({
  label,
  value,
  helper,
  alert = false,
}: {
  label: string;
  value: string;
  helper?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-sm border px-2 py-1.5",
        alert ? "border-saffron/40 bg-saffron-pale/30" : "border-border bg-white",
      )}
    >
      <Eyebrow>{label}</Eyebrow>
      <p className="mt-0.5 font-mono text-[12px] tabular-nums text-ink">
        {value}
      </p>
      {helper && (
        <p
          className={cn(
            "text-[10px]",
            alert ? "text-saffron" : "text-ink-faint",
          )}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: StationeryItemStatus }) {
  const tone = statusTone(status);
  return <span className={cn("h-2 w-2 rounded-full", tone)} aria-hidden />;
}

function statusTone(status: StationeryItemStatus): string {
  switch (status) {
    case "approved":
    case "printed":
    case "shipped":
      return "bg-sage";
    case "in_design":
    case "proof_review":
    case "in_production":
      return "bg-saffron";
    case "not_started":
    default:
      return "bg-ink-faint";
  }
}

function StatusSelect({
  value,
  onChange,
}: {
  value: StationeryItemStatus;
  onChange: (v: StationeryItemStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as StationeryItemStatus)}
      className="rounded-sm border border-border bg-white px-2 py-1 text-[11.5px] text-ink focus:border-saffron focus:outline-none"
    >
      {STATIONERY_ITEM_STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {STATIONERY_ITEM_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
