// ── Seating AI orchestration ────────────────────────────────────────
// Thin wrapper that drives the full "AI-driven seating chart" flow:
//   1. Calls /api/seating/suggest with the current guests + tables
//   2. Applies guest→table assignments
//   3. Applies zone classifications to tables
//   4. Optionally re-arranges tables into concentric rings by zone
//   5. Writes the Dining Intelligence digest to the assignments store
//
// Used by the top-level "✦ Auto-assign all" button and by per-table
// smart actions (Auto-fill) which only need a subset of the output.

import { useSeatingStore, ringLayoutByZone } from "@/stores/seating-store";
import { useSeatingAssignmentsStore } from "@/stores/seating-assignments-store";
import type { SeatingGuest } from "@/types/seating-guest";
import { guestFullName } from "@/types/seating-guest";
import type {
  AutoStrategyId,
  AutoSuggestMode,
  SuggestRequestBody,
  SuggestResponse,
} from "@/types/seating-assignments";
import type { TableZone } from "@/types/seating";

export interface RunAutoAssignOptions {
  eventId: string;
  eventLabel: string;
  guests: SeatingGuest[];
  strategy?: AutoStrategyId;
  mode?: AutoSuggestMode;
  // When true, after assignments are applied the tables are re-positioned
  // in concentric rings by zone (anchored on the stage).
  repositionRings?: boolean;
  // When true, only empty seats are filled — existing placements stay put.
  // Defaults to false (replace_all for the big "Auto-assign all" button).
  keepCurrent?: boolean;
  // Optional: restrict the guests sent to the model (e.g., Auto-fill for one
  // table calls this with just the unassigned guests).
  restrictGuestsTo?: Set<string>;
}

export interface AutoAssignResult {
  ok: boolean;
  summary: string;
  error?: string;
  newlyAssignedIds: string[];
}

export async function runAutoAssignAll(
  opts: RunAutoAssignOptions,
): Promise<AutoAssignResult> {
  const strategy = opts.strategy ?? "family_first";
  const mode: AutoSuggestMode = opts.keepCurrent ? "fill_empty" : "replace_all";

  const seating = useSeatingStore.getState();
  const assignments = useSeatingAssignmentsStore.getState();
  const currentAssignments = assignments.assignments[opts.eventId] ?? [];

  const alreadySeated = new Set(
    mode === "fill_empty" ? currentAssignments.map((a) => a.guestId) : [],
  );
  let guestsForPrompt = opts.guests;
  if (mode === "fill_empty") {
    guestsForPrompt = guestsForPrompt.filter((g) => !alreadySeated.has(g.id));
  }
  if (opts.restrictGuestsTo) {
    guestsForPrompt = guestsForPrompt.filter((g) =>
      opts.restrictGuestsTo!.has(g.id),
    );
  }

  const cfg = assignments.getAutoConfig();

  const body: SuggestRequestBody = {
    eventId: opts.eventId,
    eventLabel: opts.eventLabel,
    strategy,
    config: {
      ...cfg,
      strategy,
      mode,
      // Enable the soft prefs that matter for the one-click flow.
      balanceDietary: true,
      keepHouseholdsTogether: true,
      vipNearStage: true,
      kidsNearParents: true,
    },
    guests: guestsForPrompt.map((g) => ({
      id: g.id,
      name: guestFullName(g),
      side: g.side,
      householdId: g.householdId,
      categories: g.categories,
      dietary: g.dietary,
      ageCategory: g.ageCategory,
      vipTier: g.vipTier,
      preferredLanguage: g.preferredLanguage,
      needsAssistance: g.needsAssistance,
      relationship: g.relationship,
      plusOneOf: g.plusOneOf,
    })),
    tables: seating.tables.map((t) => ({
      id: t.id,
      label: t.label?.trim() || `T${t.number}`,
      seats: t.seats,
      shape: t.shape,
    })),
    alreadyAssigned:
      mode === "fill_empty"
        ? currentAssignments.map((a) => ({
            guestId: a.guestId,
            tableId: a.tableId,
          }))
        : undefined,
  };

  let data: SuggestResponse;
  try {
    const res = await fetch("/api/seating/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    data = (await res.json()) as SuggestResponse;
  } catch (err) {
    return {
      ok: false,
      summary: "",
      error: err instanceof Error ? err.message : "Network error.",
      newlyAssignedIds: [],
    };
  }

  if (!data.ok || !data.assignments) {
    return {
      ok: false,
      summary: "",
      error: data.error ?? "AI did not return a plan.",
      newlyAssignedIds: [],
    };
  }

  // Apply assignments.
  const pairs = data.assignments.map((a) => ({
    guestId: a.guestId,
    tableId: a.tableId,
  }));
  const newlyAssignedIds = pairs.map((p) => p.guestId);
  if (mode === "replace_all") {
    useSeatingAssignmentsStore.getState().replaceEventAssignments(pairs);
  } else {
    for (const p of pairs) {
      if (alreadySeated.has(p.guestId)) continue;
      useSeatingAssignmentsStore.getState().assignGuest(p.guestId, p.tableId);
    }
  }

  // Apply zones.
  if (data.tableZones?.length) {
    const zoneMap: Record<string, TableZone> = {};
    for (const z of data.tableZones) {
      zoneMap[z.tableId] = z.zone as TableZone;
    }
    useSeatingStore.getState().setTableZones(zoneMap);

    // Re-position tables into concentric rings if requested.
    if (opts.repositionRings) {
      useSeatingStore.getState().autoLayoutByZone();
    }
  }

  // Persist Dining Intelligence.
  if (data.dining) {
    useSeatingAssignmentsStore
      .getState()
      .setDining(data.dining, opts.eventId);
  }

  return {
    ok: true,
    summary:
      data.summary ??
      `Assigned ${pairs.length} of ${opts.guests.length} guests across ${seating.tables.length} tables.`,
    newlyAssignedIds,
  };
}

// ── Per-table smart actions ──────────────────────────────────────────

// Auto-fill: top up the empty seats at one table with best-fit unassigned
// guests. Uses the same AI endpoint but restricts the guest pool.
export async function runAutoFillTable(
  opts: RunAutoAssignOptions & { tableId: string },
): Promise<AutoAssignResult> {
  const assignments = useSeatingAssignmentsStore.getState();
  const current = assignments.assignments[opts.eventId] ?? [];
  const seated = new Set(current.map((a) => a.guestId));

  // Only send unassigned guests; model picks the best to fill the table.
  const unassigned = opts.guests.filter((g) => !seated.has(g.id));
  const restrict = new Set(unassigned.map((g) => g.id));

  const result = await runAutoAssignAll({
    ...opts,
    keepCurrent: true,
    restrictGuestsTo: restrict,
    repositionRings: false,
  });
  return result;
}

// Heuristic: reunite split households at a target table. For each guest
// currently at `tableId`, find any household-mates seated elsewhere and
// pull them onto this table while capacity allows. No AI call — fast and
// predictable for a per-table action.
export function groupFamilyAtTable(
  tableId: string,
  eventId: string,
  guests: SeatingGuest[],
): { moved: string[]; skipped: string[] } {
  const seating = useSeatingStore.getState();
  const table = seating.tables.find((t) => t.id === tableId);
  if (!table) return { moved: [], skipped: [] };

  const store = useSeatingAssignmentsStore.getState();
  const list = store.assignments[eventId] ?? [];
  const atTable = list.filter((a) => a.tableId === tableId);
  let free = table.seats - atTable.length;

  const guestById = new Map(guests.map((g) => [g.id, g] as const));
  const householdsHere = new Set<string>();
  for (const a of atTable) {
    const g = guestById.get(a.guestId);
    if (g?.householdId) householdsHere.add(g.householdId);
  }
  if (householdsHere.size === 0) return { moved: [], skipped: [] };

  // Candidates: guests in those households who are seated elsewhere.
  const seatedElsewhere = list.filter(
    (a) =>
      a.tableId !== tableId &&
      guestById.get(a.guestId) &&
      householdsHere.has(guestById.get(a.guestId)!.householdId),
  );

  const moved: string[] = [];
  const skipped: string[] = [];
  for (const a of seatedElsewhere) {
    if (free <= 0) {
      skipped.push(a.guestId);
      continue;
    }
    useSeatingAssignmentsStore.getState().assignGuest(a.guestId, tableId);
    moved.push(a.guestId);
    free -= 1;
  }
  return { moved, skipped };
}

// Heuristic: re-balance a table's dietary mix. If the table is heavily
// skewed (e.g., 8 veg + 1 non-veg), propose moving the minority guests to
// other tables where their dietary type has support. Returns suggested
// moves for the caller to confirm — does NOT mutate state.
export interface BalanceSuggestion {
  guestId: string;
  fromTableId: string;
  toTableId: string;
  reason: string;
}

export function proposeDietaryBalance(
  tableId: string,
  eventId: string,
  guests: SeatingGuest[],
): BalanceSuggestion[] {
  const seating = useSeatingStore.getState();
  const store = useSeatingAssignmentsStore.getState();
  const list = store.assignments[eventId] ?? [];
  const guestById = new Map(guests.map((g) => [g.id, g] as const));

  // Counts of each dietary tag at each table.
  const dietByTable = new Map<string, Map<string, number>>();
  const occByTable = new Map<string, number>();
  for (const a of list) {
    const g = guestById.get(a.guestId);
    if (!g) continue;
    occByTable.set(a.tableId, (occByTable.get(a.tableId) ?? 0) + 1);
    const m = dietByTable.get(a.tableId) ?? new Map<string, number>();
    for (const d of g.dietary) m.set(d, (m.get(d) ?? 0) + 1);
    dietByTable.set(a.tableId, m);
  }

  const hereGuests = list.filter((a) => a.tableId === tableId);
  const hereTotal = hereGuests.length;
  if (hereTotal < 3) return [];
  const hereDiet = dietByTable.get(tableId) ?? new Map<string, number>();

  const suggestions: BalanceSuggestion[] = [];
  for (const [diet, count] of hereDiet) {
    const ratio = count / hereTotal;
    if (count >= 1 && ratio <= 0.25) {
      // This is a minority dietary at the current table. Find the minority
      // guests and look for a better-fit destination.
      const minorityGuests = hereGuests
        .map((a) => guestById.get(a.guestId))
        .filter((g): g is SeatingGuest => !!g && g.dietary.includes(diet));
      for (const g of minorityGuests) {
        // Find a table that has more of this dietary and has capacity.
        const candidates = seating.tables
          .filter((t) => t.id !== tableId)
          .map((t) => {
            const m = dietByTable.get(t.id) ?? new Map<string, number>();
            const cnt = m.get(diet) ?? 0;
            const occ = occByTable.get(t.id) ?? 0;
            return { table: t, cnt, free: t.seats - occ };
          })
          .filter((c) => c.free > 0 && c.cnt > 0)
          .sort((a, b) => b.cnt - a.cnt);
        if (candidates.length) {
          suggestions.push({
            guestId: g.id,
            fromTableId: tableId,
            toTableId: candidates[0].table.id,
            reason: `Join ${candidates[0].cnt} other ${diet} guest${candidates[0].cnt === 1 ? "" : "s"} at ${candidates[0].table.label?.trim() || `T${candidates[0].table.number}`}.`,
          });
        }
      }
    }
  }
  return suggestions;
}
