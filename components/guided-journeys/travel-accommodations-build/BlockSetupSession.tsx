"use client";

// ── Travel & Accommodations Build · Session 1: Block Setup ────────────────
// Walks the couple through Tab 2 (Room Block Manager). Reads + writes
// directly through useTravelStore — every edit round-trips with the full
// workspace. Surfaces:
//
//   • Cutoff-date warnings at the top (gap_to_floor + days remaining).
//   • Per-block negotiation card: hotel info, rates, attrition floor,
//     amenities (breakfast/parking/resort fee), suite assignments.
//   • Live "minimum to meet" + "gap to floor" totals updating as rooms
//     blocked/booked change.
//   • The loud red banner when a block hits the critical risk tier
//     (gap > 5 with days_to_cutoff < 30).

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Hotel,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTravelStore } from "@/stores/travel-store";
import type {
  RoomBlockAmenity,
  TravelRoomBlock,
} from "@/types/travel";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  BLOCK_TYPE_OPTIONS,
  DEFAULT_ATTRITION_PERCENTAGE,
  DEFAULT_CUTOFF_DAYS_BEFORE_EVENT,
  SUITE_ROLE_OPTIONS,
  defaultCutoffDate,
  seedBlocksFromStrategy,
  type BlockType,
  type SuiteAssignment,
  type SuiteRole,
} from "@/lib/guided-journeys/travel-accommodations-build";
import {
  classifyAttritionRisk,
  classifyPortfolioAttrition,
} from "@/lib/calculators/attrition-risk";
import {
  C,
  FONT_MONO,
  FONT_SANS,
  FONT_SERIF,
} from "@/components/workspace/shared/guided-journey/styles";

const SUITE_ASSIGNMENTS_KEY = "ananya:travel-build:suite-assignments";
const RATE_AMENITY_BREAKFAST = "Breakfast included";
const RATE_AMENITY_PARKING = "Parking included";
const RATE_AMENITY_RESORT_FEE = "Resort fee waived";

// ── Suite assignments (build-only, localStorage by block id) ───────────────

function loadSuiteAssignments(): Record<string, SuiteAssignment[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SUITE_ASSIGNMENTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SuiteAssignment[]>;
  } catch {
    return {};
  }
}

function persistSuiteAssignments(next: Record<string, SuiteAssignment[]>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SUITE_ASSIGNMENTS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

// ── Helpers — read amenity flags from the freeform amenities[] list ───────

function findAmenityByLabel(
  amenities: RoomBlockAmenity[],
  label: string,
): RoomBlockAmenity | undefined {
  return amenities.find(
    (a) => a.label.trim().toLowerCase() === label.toLowerCase(),
  );
}

function isAmenityNegotiated(
  amenities: RoomBlockAmenity[],
  label: string,
): boolean {
  return findAmenityByLabel(amenities, label)?.status === "negotiated";
}

// ── Helpers — read Vision strategy + wedding date for seeding ──────────────

function useVisionStrategy(categoryId: string): {
  blockStrategy: "single" | "two_tier" | "multiple_hotels" | undefined;
} {
  const stored = useTravelStore((s) =>
    s.strategies.find((x) => x.category_id === categoryId),
  );
  const fromStore = stored?.block_strategy;
  // Tab 1 stores `multiple` while the Vision schema uses `multiple_hotels`.
  // Project to the Build vocabulary.
  if (fromStore === "multiple") return { blockStrategy: "multiple_hotels" };
  if (fromStore === "single" || fromStore === "two_tier") {
    return { blockStrategy: fromStore };
  }
  return { blockStrategy: undefined };
}

function useEventDateIso(): string | null {
  return useAuthStore((s) => s.user?.wedding?.weddingDate ?? null);
}

// ── Component ──────────────────────────────────────────────────────────────

export function BlockSetupSession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const all = useTravelStore((s) => s.blocks);
  const addBlock = useTravelStore((s) => s.addBlock);
  const updateBlock = useTravelStore((s) => s.updateBlock);
  const deleteBlock = useTravelStore((s) => s.deleteBlock);
  const addAmenity = useTravelStore((s) => s.addBlockAmenity);
  const updateAmenity = useTravelStore((s) => s.updateBlockAmenity);
  const deleteAmenity = useTravelStore((s) => s.deleteBlockAmenity);

  const blocks = useMemo(
    () =>
      all
        .filter((b) => b.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [all, category.id],
  );

  const eventDateIso = useEventDateIso();
  const cutoffDefault = defaultCutoffDate(eventDateIso);
  const { blockStrategy } = useVisionStrategy(category.id);

  // Seed blocks on first render when none exist. Honours the Vision
  // block_strategy decision: single → 1 row, two_tier → 2, multiple → 3.
  useEffect(() => {
    if (blocks.length > 0) return;
    const seeds = seedBlocksFromStrategy(blockStrategy, cutoffDefault);
    for (const seed of seeds) {
      addBlock({
        category_id: category.id,
        name: "",
        role: seed.is_primary ? "primary" : "overflow",
        group_rate: "",
        retail_rate: "",
        rooms_blocked: 0,
        rooms_booked: 0,
        cutoff_date: seed.cutoff_date,
        attrition_percent: DEFAULT_ATTRITION_PERCENTAGE,
        booking_link: "",
      });
    }
    // Only seed once — rerun guarded by blocks.length === 0.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Portfolio risk view for the cutoff warnings + totals row.
  const portfolio = useMemo(() => {
    return classifyPortfolioAttrition(
      blocks.map((b) => ({
        id: b.id,
        rooms_blocked: b.rooms_blocked,
        rooms_booked: b.rooms_booked,
        attrition_floor_percentage: b.attrition_percent,
        cutoff_date: b.cutoff_date,
      })),
    );
  }, [blocks]);

  const cutoffWarnings = useMemo(() => {
    return blocks
      .map((b) => {
        const risk = classifyAttritionRisk({
          rooms_blocked: b.rooms_blocked,
          rooms_booked: b.rooms_booked,
          attrition_floor_percentage: b.attrition_percent,
          cutoff_date: b.cutoff_date,
        });
        return { block: b, risk };
      })
      .filter(
        ({ risk }) =>
          risk.tier === "critical" ||
          risk.tier === "elevated" ||
          risk.tier === "cutoff_passed",
      )
      .sort(
        (a, b) =>
          (a.risk.days_to_cutoff ?? Infinity) -
          (b.risk.days_to_cutoff ?? Infinity),
      );
  }, [blocks]);

  function handleAddBlock() {
    const isFirst = blocks.length === 0;
    addBlock({
      category_id: category.id,
      name: "",
      role: isFirst ? "primary" : "overflow",
      group_rate: "",
      retail_rate: "",
      rooms_blocked: 0,
      rooms_booked: 0,
      cutoff_date: cutoffDefault,
      attrition_percent: DEFAULT_ATTRITION_PERCENTAGE,
      booking_link: "",
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Cutoff warnings — surfaced loudest when blocks are at risk */}
      {cutoffWarnings.length > 0 && (
        <CutoffWarnings warnings={cutoffWarnings} />
      )}

      {/* Portfolio totals strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <Stat
          label="Rooms blocked"
          value={portfolio.total_rooms_blocked}
        />
        <Stat
          label="Rooms booked"
          value={portfolio.total_rooms_booked}
          hint={`${portfolio.overall_utilization}% utilization`}
        />
        <Stat
          label="Minimum to meet"
          value={portfolio.minimum_to_meet}
          hint="sum of attrition floors"
        />
        <Stat
          label="Gap to floor"
          value={portfolio.gap_to_floor}
          tone={portfolio.gap_to_floor === 0 ? "ok" : "alert"}
          hint={
            portfolio.gap_to_floor === 0
              ? "on track"
              : `${portfolio.critical_block_ids.length} critical · ${portfolio.elevated_block_ids.length} elevated`
          }
        />
      </div>

      {blocks.length === 0 ? (
        <EmptyBlockHint onAdd={handleAddBlock} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {blocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              onUpdate={(patch) => updateBlock(block.id, patch)}
              onDelete={() => deleteBlock(block.id)}
              onAddAmenity={(label, status) =>
                addAmenity(block.id, { label, status })
              }
              onUpdateAmenity={(amenityId, patch) =>
                updateAmenity(block.id, amenityId, patch)
              }
              onDeleteAmenity={(amenityId) =>
                deleteAmenity(block.id, amenityId)
              }
            />
          ))}

          <button
            type="button"
            onClick={handleAddBlock}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 4,
              border: `1px dashed ${C.line}`,
              background: "transparent",
              color: C.muted,
              fontFamily: FONT_SANS,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            <Plus size={12} strokeWidth={2} /> Add another block
          </button>
        </div>
      )}

      <p
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 13,
          color: C.muted,
          margin: 0,
        }}
      >
        Cutoff defaults to event date minus {DEFAULT_CUTOFF_DAYS_BEFORE_EVENT}{" "}
        days. Attrition floor defaults to {DEFAULT_ATTRITION_PERCENTAGE}% of
        rooms blocked. Edit either when your contract says otherwise.
      </p>
    </div>
  );
}

// ── Cutoff warnings banner ─────────────────────────────────────────────────

function CutoffWarnings({
  warnings,
}: {
  warnings: Array<{
    block: TravelRoomBlock;
    risk: ReturnType<typeof classifyAttritionRisk>;
  }>;
}) {
  const critical = warnings.filter(
    (w) => w.risk.tier === "critical" || w.risk.tier === "cutoff_passed",
  );
  const isCritical = critical.length > 0;
  return (
    <section
      style={{
        backgroundColor: isCritical ? "#FBEFE9" : "#FAF3E8",
        border: `1px solid ${isCritical ? C.rose : "#E0C97C"}`,
        borderRadius: 6,
        padding: "14px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <AlertTriangle
          size={14}
          strokeWidth={1.8}
          color={isCritical ? C.rose : "#A87000"}
        />
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: isCritical ? C.rose : "#A87000",
          }}
        >
          {isCritical ? "Attrition risk" : "Cutoff watch"}
        </span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {warnings.map(({ block, risk }) => (
          <li
            key={block.id}
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 14.5,
              color: C.ink,
              lineHeight: 1.5,
              marginBottom: 4,
            }}
          >
            <strong style={{ fontWeight: 600 }}>
              {block.name || "Unnamed block"}
            </strong>{" "}
            — {risk.message}{" "}
            <span
              style={{
                color: C.muted,
                fontStyle: "italic",
                fontSize: 13,
              }}
            >
              ({block.rooms_booked}/{block.rooms_blocked} booked, floor{" "}
              {risk.floor})
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Stat tile ──────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "ok" | "alert";
}) {
  const accent =
    tone === "alert" ? C.rose : tone === "ok" ? C.sage : C.inkSoft;
  return (
    <div
      style={{
        backgroundColor: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: 6,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 9.5,
          letterSpacing: "0.14em",
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
          color: accent,
          fontWeight: 600,
          lineHeight: 1.1,
          marginTop: 2,
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            color: C.muted,
            marginTop: 2,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyBlockHint({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      style={{
        backgroundColor: C.paper,
        border: `1px dashed ${C.line}`,
        borderRadius: 6,
        padding: "26px 18px",
        textAlign: "center",
      }}
    >
      <Hotel
        size={18}
        strokeWidth={1.6}
        color={C.faint}
        style={{ marginBottom: 8 }}
      />
      <p
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 14,
          color: C.muted,
          margin: "0 0 12px",
        }}
      >
        Add the primary block first — the one most of your family will stay
        at.
      </p>
      <button
        type="button"
        onClick={onAdd}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 18px",
          borderRadius: 4,
          border: "none",
          background: C.ink,
          color: C.ivory,
          fontFamily: FONT_SANS,
          fontSize: 12.5,
          cursor: "pointer",
        }}
      >
        <Plus size={12} strokeWidth={2} /> Add primary block
      </button>
    </div>
  );
}

// ── Block card ─────────────────────────────────────────────────────────────

function BlockCard({
  block,
  onUpdate,
  onDelete,
  onAddAmenity,
  onUpdateAmenity,
  onDeleteAmenity,
}: {
  block: TravelRoomBlock;
  onUpdate: (patch: Partial<TravelRoomBlock>) => void;
  onDelete: () => void;
  onAddAmenity: (label: string, status: RoomBlockAmenity["status"]) => void;
  onUpdateAmenity: (
    amenityId: string,
    patch: Partial<RoomBlockAmenity>,
  ) => void;
  onDeleteAmenity: (amenityId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [suiteAssignments, setSuiteAssignmentsState] = useState<
    SuiteAssignment[]
  >([]);

  useEffect(() => {
    const all = loadSuiteAssignments();
    setSuiteAssignmentsState(all[block.id] ?? []);
  }, [block.id]);

  function persistSuites(next: SuiteAssignment[]) {
    setSuiteAssignmentsState(next);
    const all = loadSuiteAssignments();
    if (next.length === 0) {
      delete all[block.id];
    } else {
      all[block.id] = next;
    }
    persistSuiteAssignments(all);
  }

  const risk = useMemo(
    () =>
      classifyAttritionRisk({
        rooms_blocked: block.rooms_blocked,
        rooms_booked: block.rooms_booked,
        attrition_floor_percentage: block.attrition_percent,
        cutoff_date: block.cutoff_date,
      }),
    [block.rooms_blocked, block.rooms_booked, block.attrition_percent, block.cutoff_date],
  );

  const isPrimary = block.role === "primary";
  const blockType: BlockType = ((): BlockType => {
    // No first-class enum on TravelRoomBlock; project from role + amenities.
    if (block.role === "courtesy") return "premium";
    if (block.role === "overflow") return "standard";
    return "standard";
  })();

  function setBlockType(next: BlockType) {
    const role: TravelRoomBlock["role"] =
      next === "premium"
        ? "courtesy"
        : isPrimary
          ? "primary"
          : "overflow";
    onUpdate({ role });
  }

  function toggleAmenity(label: string, on: boolean) {
    const existing = findAmenityByLabel(block.amenities, label);
    if (on) {
      if (existing) {
        onUpdateAmenity(existing.id, { status: "negotiated" });
      } else {
        onAddAmenity(label, "negotiated");
      }
    } else {
      if (existing) {
        onUpdateAmenity(existing.id, { status: "requested" });
      }
    }
  }

  // Computed attrition floor count from the percentage stored on the block.
  const attritionCount = risk.floor;

  function setAttritionCount(next: number) {
    if (block.rooms_blocked <= 0) {
      onUpdate({ attrition_percent: 0 });
      return;
    }
    const pct = Math.min(
      100,
      Math.max(0, Math.round((next / block.rooms_blocked) * 100)),
    );
    onUpdate({ attrition_percent: pct });
  }

  function parseRate(s: string): number {
    const m = s.match(/[\d.]+/);
    return m ? Number(m[0]) || 0 : 0;
  }

  const negotiatedRate = parseRate(block.group_rate);

  return (
    <article
      style={{
        backgroundColor: C.paper,
        border: `1px solid ${
          risk.tier === "critical" || risk.tier === "cutoff_passed"
            ? C.rose
            : C.line
        }`,
        borderLeft: `3px solid ${
          risk.tier === "critical" || risk.tier === "cutoff_passed"
            ? C.rose
            : isPrimary
              ? C.gold
              : C.faint
        }`,
        borderRadius: 6,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          borderBottom: expanded ? `1px solid ${C.lineSoft}` : "none",
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: C.muted,
            padding: 0,
          }}
        >
          {expanded ? (
            <ChevronUp size={14} strokeWidth={1.8} />
          ) : (
            <ChevronDown size={14} strokeWidth={1.8} />
          )}
        </button>
        <input
          value={block.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Hotel name (e.g. Marriott Legacy Town Center)"
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: FONT_SERIF,
            fontSize: 17,
            color: C.ink,
          }}
        />
        <PrimaryBadge isPrimary={isPrimary} onToggle={(p) => onUpdate({ role: p ? "primary" : "overflow" })} />
        <RiskBadge tier={risk.tier} days={risk.days_to_cutoff} />
        <button
          type="button"
          aria-label="Delete block"
          onClick={onDelete}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: C.faint,
            padding: 4,
          }}
        >
          <Trash2 size={12} strokeWidth={1.8} />
        </button>
      </header>

      {expanded && (
        <div style={{ padding: "16px 18px", display: "grid", gap: 14 }}>
          {/* Hotel details */}
          <Section label="Hotel details">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <FieldText
                label="Address"
                value={block.amenities.find((a) => a.label === "__address")?.label ?? ""}
                onChange={() => {}}
                placeholder="Address (optional)"
                disabled
                helper="Tracked on Tab 2"
              />
              <FieldSelect<BlockType>
                label="Block type"
                value={blockType}
                onChange={setBlockType}
                options={BLOCK_TYPE_OPTIONS}
              />
            </div>
          </Section>

          {/* Block structure */}
          <Section label="Rooms & rate">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <FieldNumber
                label="Rooms blocked"
                value={block.rooms_blocked}
                onChange={(v) => onUpdate({ rooms_blocked: v })}
              />
              <FieldNumber
                label="Rooms booked"
                value={block.rooms_booked}
                onChange={(v) => onUpdate({ rooms_booked: v })}
              />
              <FieldNumber
                label="Negotiated rate / night ($)"
                value={negotiatedRate}
                onChange={(v) => onUpdate({ group_rate: v ? `$${v}/night` : "" })}
              />
              <FieldNumber
                label="Retail rate / night ($)"
                value={parseRate(block.retail_rate)}
                onChange={(v) => onUpdate({ retail_rate: v ? `$${v}` : "" })}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              <Toggle
                label="Includes breakfast"
                checked={isAmenityNegotiated(block.amenities, RATE_AMENITY_BREAKFAST)}
                onChange={(v) => toggleAmenity(RATE_AMENITY_BREAKFAST, v)}
              />
              <Toggle
                label="Includes parking"
                checked={isAmenityNegotiated(block.amenities, RATE_AMENITY_PARKING)}
                onChange={(v) => toggleAmenity(RATE_AMENITY_PARKING, v)}
              />
              <Toggle
                label="Resort fee waived"
                checked={isAmenityNegotiated(block.amenities, RATE_AMENITY_RESORT_FEE)}
                onChange={(v) => toggleAmenity(RATE_AMENITY_RESORT_FEE, v)}
              />
            </div>
          </Section>

          {/* Attrition — the floor visible */}
          <Section label="Attrition floor & cutoff">
            <p
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: 13,
                color: C.muted,
                margin: "0 0 10px",
              }}
            >
              The floor is the minimum rooms that must be filled before the
              cutoff. Default is {DEFAULT_ATTRITION_PERCENTAGE}% — edit when
              your contract says otherwise.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <FieldNumber
                label={`Attrition floor (rooms)`}
                value={attritionCount}
                onChange={setAttritionCount}
                helper={
                  block.rooms_blocked > 0
                    ? `${block.attrition_percent}% of ${block.rooms_blocked}`
                    : "set rooms blocked first"
                }
              />
              <FieldNumber
                label="Floor (%)"
                value={block.attrition_percent}
                onChange={(v) =>
                  onUpdate({ attrition_percent: Math.min(100, Math.max(0, v)) })
                }
              />
              <FieldText
                label="Cutoff date"
                type="date"
                value={block.cutoff_date}
                onChange={(v) => onUpdate({ cutoff_date: v })}
                helper={
                  risk.days_to_cutoff != null
                    ? risk.days_to_cutoff < 0
                      ? "cutoff passed"
                      : `${risk.days_to_cutoff}d remaining`
                    : ""
                }
              />
            </div>
            <p
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                color:
                  risk.tier === "critical" || risk.tier === "cutoff_passed"
                    ? C.rose
                    : risk.tier === "elevated"
                      ? C.amber
                      : C.muted,
                margin: "10px 0 0",
              }}
            >
              {risk.message}
            </p>
          </Section>

          {/* Suites */}
          <Section label="Suites">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                gap: 8,
              }}
            >
              <FieldNumber
                label="Suites available in this block"
                value={
                  // suites_available isn't on TravelRoomBlock in the legacy
                  // store; project from suiteAssignments length.
                  suiteAssignments.length
                }
                onChange={(v) => {
                  // Allow shrinking by truncating, expanding by pushing
                  // empty suite rows.
                  if (v < suiteAssignments.length) {
                    persistSuites(suiteAssignments.slice(0, Math.max(0, v)));
                  } else {
                    const additions: SuiteAssignment[] = [];
                    for (let i = suiteAssignments.length; i < v; i += 1) {
                      additions.push({
                        suite_label: `Suite ${i + 1}`,
                        assigned_to_role: "family",
                      });
                    }
                    persistSuites([...suiteAssignments, ...additions]);
                  }
                }}
              />
              {suiteAssignments.map((s, i) => (
                <SuiteRow
                  key={i}
                  suite={s}
                  onChange={(patch) => {
                    const next = [...suiteAssignments];
                    next[i] = { ...s, ...patch };
                    persistSuites(next);
                  }}
                  onRemove={() => {
                    persistSuites(suiteAssignments.filter((_, j) => j !== i));
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() =>
                  persistSuites([
                    ...suiteAssignments,
                    {
                      suite_label: `Suite ${suiteAssignments.length + 1}`,
                      assigned_to_role: "family",
                    },
                  ])
                }
                style={{
                  alignSelf: "flex-start",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 10px",
                  borderRadius: 4,
                  border: `1px dashed ${C.line}`,
                  background: "transparent",
                  color: C.muted,
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <Plus size={11} strokeWidth={2} /> Add suite
              </button>
            </div>
          </Section>

          {/* Booking link */}
          <Section label="Booking link">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) 1fr",
                gap: 10,
              }}
            >
              <FieldText
                label="URL"
                value={block.booking_link}
                onChange={(v) => onUpdate({ booking_link: v })}
                placeholder="https://book.hotel.com/..."
              />
              <FieldText
                label="Booking code (optional)"
                value=""
                onChange={() => {}}
                placeholder="e.g. PATEL-WED"
                disabled
                helper="Stored alongside the URL"
              />
            </div>
          </Section>
        </div>
      )}
    </article>
  );
}

function SuiteRow({
  suite,
  onChange,
  onRemove,
}: {
  suite: SuiteAssignment;
  onChange: (patch: Partial<SuiteAssignment>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr auto",
        gap: 8,
        alignItems: "end",
      }}
    >
      <FieldText
        label="Suite label"
        value={suite.suite_label}
        onChange={(v) => onChange({ suite_label: v })}
      />
      <FieldSelect<SuiteRole>
        label="Assigned to"
        value={suite.assigned_to_role}
        onChange={(v) => onChange({ assigned_to_role: v })}
        options={SUITE_ROLE_OPTIONS}
      />
      <FieldText
        label="Person / family"
        value={suite.assigned_to_name ?? ""}
        onChange={(v) => onChange({ assigned_to_name: v })}
        placeholder="Bride's parents"
      />
      <button
        type="button"
        aria-label="Remove suite"
        onClick={onRemove}
        style={{
          background: "transparent",
          border: `1px solid ${C.line}`,
          borderRadius: 4,
          color: C.faint,
          padding: 6,
          cursor: "pointer",
          height: 32,
        }}
      >
        <Trash2 size={11} strokeWidth={1.8} />
      </button>
    </div>
  );
}

// ── Inline primitives ──────────────────────────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: C.faint,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function FieldText({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "date";
  disabled?: boolean;
  helper?: string;
}) {
  return (
    <label style={{ display: "block" }}>
      <FieldLabel label={label} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%",
          marginTop: 4,
          padding: "6px 9px",
          borderRadius: 4,
          border: `1px solid ${C.line}`,
          background: disabled ? C.ivorySoft : C.paper,
          color: C.ink,
          fontFamily: FONT_SANS,
          fontSize: 12.5,
          outline: "none",
        }}
      />
      {helper && <FieldHelper text={helper} />}
    </label>
  );
}

function FieldNumber({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  helper?: string;
}) {
  return (
    <label style={{ display: "block" }}>
      <FieldLabel label={label} />
      <input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{
          width: "100%",
          marginTop: 4,
          padding: "6px 9px",
          borderRadius: 4,
          border: `1px solid ${C.line}`,
          background: C.paper,
          color: C.ink,
          fontFamily: FONT_MONO,
          fontSize: 12.5,
          outline: "none",
        }}
      />
      {helper && <FieldHelper text={helper} />}
    </label>
  );
}

function FieldSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
}) {
  return (
    <label style={{ display: "block" }}>
      <FieldLabel label={label} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        style={{
          width: "100%",
          marginTop: 4,
          padding: "6px 9px",
          borderRadius: 4,
          border: `1px solid ${C.line}`,
          background: C.paper,
          color: C.ink,
          fontFamily: FONT_SANS,
          fontSize: 12.5,
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: FONT_MONO,
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: C.faint,
      }}
    >
      {label}
    </span>
  );
}

function FieldHelper({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "block",
        marginTop: 4,
        fontFamily: FONT_SANS,
        fontSize: 11,
        color: C.muted,
        fontStyle: "italic",
      }}
    >
      {text}
    </span>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
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
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function PrimaryBadge({
  isPrimary,
  onToggle,
}: {
  isPrimary: boolean;
  onToggle: (p: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!isPrimary)}
      style={{
        background: isPrimary ? "#F0E4C8" : "transparent",
        border: `1px solid ${isPrimary ? "#B8860B" : C.line}`,
        borderRadius: 999,
        padding: "2px 10px",
        fontFamily: FONT_MONO,
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: isPrimary ? "#8B6508" : C.muted,
        cursor: "pointer",
      }}
    >
      {isPrimary ? "Primary" : "Make primary"}
    </button>
  );
}

function RiskBadge({
  tier,
  days,
}: {
  tier: ReturnType<typeof classifyAttritionRisk>["tier"];
  days: number | null;
}) {
  const config: Record<
    ReturnType<typeof classifyAttritionRisk>["tier"],
    { bg: string; fg: string; label: string }
  > = {
    no_risk: { bg: "#DFE5D8", fg: "#3F5536", label: "On track" },
    watch: { bg: "#F0E4C8", fg: "#8B6508", label: "Watch" },
    elevated: { bg: "#FAE5C7", fg: "#A87000", label: "Elevated" },
    critical: { bg: "#FBEFE9", fg: "#A03B1E", label: "Critical" },
    cutoff_passed: { bg: "#FBEFE9", fg: "#A03B1E", label: "Cutoff passed" },
  };
  const c = config[tier];
  return (
    <span
      style={{
        backgroundColor: c.bg,
        color: c.fg,
        borderRadius: 999,
        padding: "2px 10px",
        fontFamily: FONT_MONO,
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
      {days != null && tier !== "no_risk" && tier !== "cutoff_passed" && (
        <span style={{ marginLeft: 6 }}>· {days}d</span>
      )}
    </span>
  );
}
