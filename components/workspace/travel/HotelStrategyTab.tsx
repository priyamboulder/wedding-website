"use client";

// ── Hotel Strategy tab ────────────────────────────────────────────────────
// Planning-first surface. No quiz — this tab asks the couple to think
// through the shape of the problem: how many out-of-town guests, how many
// nights, which block strategy, and who's paying. Rooms-needed is an
// autocalc from guests (≈1.9 guests/room) and can be overridden.

import { BedDouble, ClipboardList, Compass, Sparkles } from "lucide-react";
import {
  BLOCK_STRATEGY_LABEL,
  BUDGET_APPROACH_LABEL,
  type BlockStrategy,
  type BudgetApproach,
  type OnSiteRoomsOption,
} from "@/types/travel";
import {
  defaultStrategy,
  estimateRooms,
  useTravelStore,
} from "@/stores/travel-store";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  MiniStat,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";

export function HotelStrategyTab({ category }: { category: WorkspaceCategory }) {
  const stored = useTravelStore((s) =>
    s.strategies.find((x) => x.category_id === category.id),
  );
  const update = useTravelStore((s) => s.updateStrategy);
  const plan = stored ?? defaultStrategy(category.id);
  const autoRooms = estimateRooms(plan.out_of_town_guests);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Accommodation strategy"
        title="Your guest accommodation plan"
        description="Before comparing hotels, decide the shape of the problem. Guest count, nights, block strategy, and who's paying — these answers steer every negotiation that follows."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat
          label="Out-of-town guests"
          value={plan.out_of_town_guests || "—"}
          hint="from Guest workspace"
        />
        <MiniStat
          label="Nights needed"
          value={plan.nights_needed || "—"}
          hint={plan.dates_window || "set dates below"}
        />
        <MiniStat
          label="Rooms needed"
          value={plan.rooms_needed || autoRooms || "—"}
          tone="saffron"
          hint={
            plan.rooms_needed === 0 && autoRooms > 0
              ? `auto ≈ ${autoRooms}`
              : "at 1.9 guests/room"
          }
        />
        <MiniStat
          label="Block strategy"
          value={
            plan.block_strategy === "single"
              ? "Single"
              : plan.block_strategy === "two_tier"
                ? "Two-tier"
                : "Multiple"
          }
          hint={BLOCK_STRATEGY_LABEL[plan.block_strategy]
            .split(" — ")[1]
            ?.toLowerCase()}
        />
      </div>

      <PanelCard
        icon={<ClipboardList size={14} strokeWidth={1.8} />}
        title="Guest math"
      >
        <p className="mb-4 text-[12.5px] text-ink-muted">
          Lock the numbers before you send booking links. Rooms-needed
          defaults to a 1.9 guests/room estimate — override if families are
          doubling up or taking suites.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <FieldNumber
            label="Out-of-town guests"
            value={plan.out_of_town_guests}
            onChange={(v) =>
              update(category.id, { out_of_town_guests: v })
            }
          />
          <FieldNumber
            label="Nights needed"
            value={plan.nights_needed}
            onChange={(v) => update(category.id, { nights_needed: v })}
          />
          <FieldText
            label="Dates window"
            placeholder="e.g. Apr 10–12, 2026"
            value={plan.dates_window}
            onChange={(v) => update(category.id, { dates_window: v })}
          />
          <FieldNumber
            label={`Rooms needed${autoRooms ? ` (auto ≈ ${autoRooms})` : ""}`}
            value={plan.rooms_needed}
            onChange={(v) => update(category.id, { rooms_needed: v })}
          />
        </div>
      </PanelCard>

      <PanelCard
        icon={<Compass size={14} strokeWidth={1.8} />}
        title="Proximity"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>On-site rooms at venue?</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["yes", "no", "unknown"] as OnSiteRoomsOption[]).map(
                (opt) => (
                  <RadioPill
                    key={opt}
                    active={plan.on_site_rooms === opt}
                    onClick={() => update(category.id, { on_site_rooms: opt })}
                  >
                    {opt === "unknown" ? "Not sure yet" : opt === "yes" ? "Yes" : "No"}
                  </RadioPill>
                ),
              )}
            </div>
            <textarea
              value={plan.on_site_detail}
              onChange={(e) =>
                update(category.id, { on_site_detail: e.target.value })
              }
              placeholder="How many rooms on-site, any suites, who gets priority…"
              className="mt-3 w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] leading-relaxed focus:border-saffron/50 focus:outline-none"
              rows={2}
            />
          </div>

          <div>
            <Label>Nearby hotels (within ~10 min)</Label>
            <textarea
              value={plan.nearby_hotels}
              onChange={(e) =>
                update(category.id, { nearby_hotels: e.target.value })
              }
              placeholder="List options you're considering. One per line."
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] leading-relaxed focus:border-saffron/50 focus:outline-none"
              rows={4}
            />
            <label className="mt-3 flex items-center gap-2 text-[12.5px] text-ink-muted">
              <input
                type="checkbox"
                checked={plan.shuttle_needed}
                onChange={(e) =>
                  update(category.id, { shuttle_needed: e.target.checked })
                }
                className="h-3.5 w-3.5 accent-saffron"
              />
              Shuttle needed between hotel and venue
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                → Transportation
              </span>
            </label>
          </div>
        </div>
      </PanelCard>

      <PanelCard
        icon={<BedDouble size={14} strokeWidth={1.8} />}
        title="Block strategy"
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          Pick the shape of your offer to guests. Single-block is simplest;
          two-tier lets you hold a premium floor for family.
        </p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {(Object.keys(BLOCK_STRATEGY_LABEL) as BlockStrategy[]).map((opt) => {
            const active = plan.block_strategy === opt;
            const [short, rest] = BLOCK_STRATEGY_LABEL[opt].split(" — ");
            return (
              <button
                key={opt}
                type="button"
                onClick={() => update(category.id, { block_strategy: opt })}
                className={
                  active
                    ? "rounded-md border border-saffron/50 bg-saffron-pale/50 p-3 text-left"
                    : "rounded-md border border-border bg-white p-3 text-left hover:border-saffron/40"
                }
              >
                <p className="text-[13px] font-medium text-ink">{short}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">{rest}</p>
              </button>
            );
          })}
        </div>
      </PanelCard>

      <PanelCard
        icon={<Sparkles size={14} strokeWidth={1.8} />}
        title="Budget approach"
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          Set this early — it changes how you negotiate (group rate vs paid
          coverage) and what guests see in their invite.
        </p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {(Object.keys(BUDGET_APPROACH_LABEL) as BudgetApproach[]).map(
            (opt) => {
              const active = plan.budget_approach === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    update(category.id, { budget_approach: opt })
                  }
                  className={
                    active
                      ? "rounded-md border border-saffron/50 bg-saffron-pale/50 px-3 py-2 text-left text-[12.5px]"
                      : "rounded-md border border-border bg-white px-3 py-2 text-left text-[12.5px] hover:border-saffron/40"
                  }
                >
                  {BUDGET_APPROACH_LABEL[opt]}
                </button>
              );
            },
          )}
        </div>
        <textarea
          value={plan.budget_notes}
          onChange={(e) =>
            update(category.id, { budget_notes: e.target.value })
          }
          placeholder="Notes — e.g. covering Nani and Nana fully, group rate for cousins, $200/night cap…"
          className="mt-3 w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] leading-relaxed focus:border-saffron/50 focus:outline-none"
          rows={2}
        />
      </PanelCard>
    </div>
  );
}

// ── Local field primitives ────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

function FieldText({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron/50 focus:outline-none"
      />
    </label>
  );
}

function FieldNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] tabular-nums focus:border-saffron/50 focus:outline-none"
      />
    </label>
  );
}

function RadioPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-saffron/50 bg-saffron-pale/60 px-3 py-1 text-[11.5px] text-saffron"
          : "rounded-full border border-border bg-white px-3 py-1 text-[11.5px] text-ink-muted hover:border-saffron/40"
      }
    >
      {children}
    </button>
  );
}
