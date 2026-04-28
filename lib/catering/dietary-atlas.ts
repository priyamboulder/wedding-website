// ── Dietary Atlas aggregations ─────────────────────────────────────────────
// Cross-event roll-ups the Dietary Atlas surface leans on. Menu Studio's
// intelligence.ts handles single-event math; this file handles the
// global view across all events in the wedding.
//
// Once the guests module is lifted into a store, the input to these
// functions will shift from seeded `EventDietaryTotals[]` to live guest
// records with per-event RSVP status. The shape of the output stays the
// same, so callers won't change.

import type {
  DietaryFlag,
  Dish,
  EventDietaryTotals,
  MenuEvent,
  MenuMoment,
} from "@/types/catering";
import { DIETARY_FLAGS } from "@/types/catering";
import { dietaryLabel } from "@/lib/catering/intelligence";

// ── Per-requirement totals across the whole wedding ──────────────────────

export interface RequirementSummary {
  flag: DietaryFlag;
  // Max count across events — the worst-case number of guests the caterer
  // needs to plan for. Safer than a sum (same guest attends multiple
  // events) and safer than an avg (understates).
  peak_count: number;
  // Label for display.
  label: string;
  // Events where this requirement has ≥1 guest.
  present_at_events: string[];
}

export function summarizeRequirements(
  totals: EventDietaryTotals[],
  events: MenuEvent[],
): RequirementSummary[] {
  const byFlag = new Map<DietaryFlag, { peak: number; eventLabels: string[] }>();

  for (const flag of DIETARY_FLAGS) {
    byFlag.set(flag, { peak: 0, eventLabels: [] });
  }

  for (const t of totals) {
    const ev = events.find((e) => e.id === t.event_id);
    if (!ev) continue;
    for (const [flagStr, countRaw] of Object.entries(t.counts)) {
      const flag = flagStr as DietaryFlag;
      const count = countRaw ?? 0;
      if (count <= 0) continue;
      const slot = byFlag.get(flag);
      if (!slot) continue;
      slot.peak = Math.max(slot.peak, count);
      if (!slot.eventLabels.includes(ev.label)) slot.eventLabels.push(ev.label);
    }
  }

  const rows: RequirementSummary[] = [];
  for (const flag of DIETARY_FLAGS) {
    const slot = byFlag.get(flag)!;
    if (slot.peak === 0) continue;
    rows.push({
      flag,
      peak_count: slot.peak,
      label: dietaryLabel(flag),
      present_at_events: slot.eventLabels,
    });
  }

  // Order: most-common requirements first, then others. Vegetarian is
  // always top; everything else by peak count desc.
  return rows.sort((a, b) => {
    if (a.flag === "vegetarian") return -1;
    if (b.flag === "vegetarian") return 1;
    return b.peak_count - a.peak_count;
  });
}

// ── Matrix cell: one (requirement × event) coverage value ────────────────

export interface MatrixCell {
  event_id: string;
  flag: DietaryFlag;
  guest_count: number;       // guests at THIS event with THIS requirement
  coverage: number;          // 0..1 — fraction of moments serving this
  dish_count: number;        // dishes at this event serving this requirement
  dish_ids: string[];        // ids of those dishes (for drawer drilldown)
  severity: "ok" | "thin" | "gap" | "none";
}

// Which dishes serve a requirement — mirrors intelligence.ts's
// FLAG_SERVES_FLAG but returns the dish list, not just a boolean.
function dishServesFlag(dish: Dish, flag: DietaryFlag): boolean {
  const f = dish.dietary_flags;
  switch (flag) {
    case "vegetarian":
      return f.includes("vegetarian") || f.includes("vegan") || f.includes("jain");
    case "vegan":
      return f.includes("vegan");
    case "jain":
      return f.includes("jain");
    case "halal":
      return (
        f.includes("halal") ||
        f.includes("vegetarian") ||
        f.includes("vegan") ||
        f.includes("jain")
      );
    case "kosher":
      return f.includes("kosher");
    case "gluten_free":
      return f.includes("gluten_free");
    case "nut_allergy":
      return f.includes("nut_allergy");
    case "dairy_free":
      return f.includes("dairy_free") || f.includes("vegan");
    case "non_vegetarian":
      return true;
    case "swaminarayan":
      return f.includes("jain") || (f.includes("vegetarian") && !f.includes("non_vegetarian"));
  }
}

export function buildMatrix(
  events: MenuEvent[],
  moments: MenuMoment[],
  dishes: Dish[],
  totals: EventDietaryTotals[],
  requirements: RequirementSummary[],
): MatrixCell[] {
  const cells: MatrixCell[] = [];

  for (const ev of events) {
    const eventMoments = moments.filter((m) => m.event_id === ev.id);
    const eventDishes = dishes.filter((d) =>
      eventMoments.some((m) => m.id === d.moment_id),
    );
    const total = totals.find((t) => t.event_id === ev.id);

    for (const req of requirements) {
      const guestCount = total?.counts?.[req.flag] ?? 0;
      const servingDishes = eventDishes.filter((d) => dishServesFlag(d, req.flag));
      const servingMoments = new Set(servingDishes.map((d) => d.moment_id));
      const coverage =
        eventMoments.length > 0 ? servingMoments.size / eventMoments.length : 0;

      let severity: MatrixCell["severity"];
      if (guestCount === 0) severity = "none";
      else if (servingDishes.length === 0) severity = "gap";
      else if (coverage < 0.34) severity = "thin";
      else severity = "ok";

      cells.push({
        event_id: ev.id,
        flag: req.flag,
        guest_count: guestCount,
        coverage,
        dish_count: servingDishes.length,
        dish_ids: servingDishes.map((d) => d.id),
        severity,
      });
    }
  }

  return cells;
}

// ── Cross-cutting risks ──────────────────────────────────────────────────
// The right-rail feed: gaps big enough to bubble to the top of the Atlas.

export interface AtlasRisk {
  severity: "info" | "warn" | "risk";
  message: string;
  scope?: { event_id?: string; flag?: DietaryFlag };
}

export function buildAtlasRisks(
  events: MenuEvent[],
  cells: MatrixCell[],
  requirements: RequirementSummary[],
): AtlasRisk[] {
  const risks: AtlasRisk[] = [];

  // Hard gaps: guests present, zero coverage.
  for (const cell of cells) {
    if (cell.severity !== "gap") continue;
    const ev = events.find((e) => e.id === cell.event_id);
    const req = requirements.find((r) => r.flag === cell.flag);
    if (!ev || !req) continue;
    risks.push({
      severity: "risk",
      message: `${ev.label} · ${cell.guest_count} ${req.label} guest${cell.guest_count === 1 ? "" : "s"} with no dish that serves them.`,
      scope: { event_id: ev.id, flag: cell.flag },
    });
  }

  // Thin coverage on high-stakes allergens (nut_allergy, dairy_free).
  const highStakesAllergens: DietaryFlag[] = ["nut_allergy", "dairy_free", "gluten_free"];
  for (const cell of cells) {
    if (cell.severity !== "thin") continue;
    if (!highStakesAllergens.includes(cell.flag)) continue;
    if (cell.guest_count < 3) continue;
    const ev = events.find((e) => e.id === cell.event_id);
    const req = requirements.find((r) => r.flag === cell.flag);
    if (!ev || !req) continue;
    risks.push({
      severity: "warn",
      message: `${ev.label} · only ${Math.round(cell.coverage * 100)}% coverage for ${req.label} (${cell.guest_count} guests) — risk at service time.`,
      scope: { event_id: ev.id, flag: cell.flag },
    });
  }

  // Cross-contamination note if nut_allergy guests + tree-nut dishes
  // (kulfi, pesto, etc). Heuristic: presence of any dish mentioning
  // "pistachio", "cashew", "almond", "peanut" in description.
  // Implemented in the component layer since it reads dishes directly —
  // left here as a TODO marker for the caterer briefing generator.

  return risks;
}

// ── Caterer briefing generator ───────────────────────────────────────────
// Produces a markdown doc the couple can copy-paste or email to the
// caterer's kitchen. Per-event: total guests, dietary counts, dishes by
// requirement, allergen flags. No PDF generation for V1 — markdown is
// easier to edit and pastes cleanly into most email clients.

export function buildCatererBriefing(
  events: MenuEvent[],
  moments: MenuMoment[],
  dishes: Dish[],
  totals: EventDietaryTotals[],
  requirements: RequirementSummary[],
): string {
  const lines: string[] = [];
  lines.push("# Catering dietary briefing");
  lines.push("");
  lines.push(
    "Generated from the Ananya Dietary Atlas. Counts are peak — use them for over-prep planning.",
  );
  lines.push("");

  // Global summary
  lines.push("## Peak requirement counts (across all events)");
  for (const r of requirements) {
    lines.push(
      `- **${r.label}** — ${r.peak_count} guest${r.peak_count === 1 ? "" : "s"} (present at: ${r.present_at_events.join(", ")})`,
    );
  }
  lines.push("");

  // Per-event
  for (const ev of events) {
    const total = totals.find((t) => t.event_id === ev.id);
    const eventMoments = moments
      .filter((m) => m.event_id === ev.id)
      .sort((a, b) => a.order - b.order);
    const eventDishes = dishes.filter((d) =>
      eventMoments.some((m) => m.id === d.moment_id),
    );

    lines.push(`## ${ev.label} — ${formatDate(ev.date)}`);
    lines.push(
      `Service: ${ev.service_style.replace("_", " ")} · Guests: ${ev.guest_count} · ${ev.cuisine_direction}${ev.venue ? ` · ${ev.venue}` : ""}`,
    );
    lines.push("");

    if (total) {
      const counts = Object.entries(total.counts)
        .filter(([, n]) => n && n > 0)
        .map(([k, n]) => `${dietaryLabel(k as DietaryFlag)}: ${n}`);
      if (counts.length) {
        lines.push(`**Counts:** ${counts.join(" · ")}`);
        lines.push("");
      }
    }

    // Per requirement: dishes that serve it
    lines.push("**Dishes by requirement:**");
    for (const req of requirements) {
      const guestCount = total?.counts?.[req.flag] ?? 0;
      if (guestCount === 0) continue;
      const serving = eventDishes.filter((d) => dishServesFlag(d, req.flag));
      if (serving.length === 0) {
        lines.push(`- ${req.label} (${guestCount}): **NO DISH SERVES THIS** — gap to close before service.`);
      } else {
        lines.push(
          `- ${req.label} (${guestCount}): ${serving.map((d) => d.name).join(", ")}`,
        );
      }
    }
    lines.push("");

    // Allergen flags: dishes that mention common tree-nut keywords
    const nutAllergyCount = total?.counts?.nut_allergy ?? 0;
    if (nutAllergyCount > 0) {
      const nutMentioning = eventDishes.filter((d) =>
        /pistachio|cashew|almond|walnut|peanut|nut/i.test(
          `${d.name} ${d.description}`,
        ),
      );
      if (nutMentioning.length > 0) {
        lines.push(
          `**Nut-allergy cross-contamination risk (${nutAllergyCount} guest${nutAllergyCount === 1 ? "" : "s"}):** dishes with tree-nut content — ${nutMentioning.map((d) => d.name).join(", ")}. Label at station and isolate prep surfaces.`,
        );
        lines.push("");
      }
    }
  }

  lines.push("---");
  lines.push(
    "_Kitchen labeling:_ use the per-event dish names above at buffet/station cards. Allergen flags must be visible within 2 feet of each serving surface.",
  );

  return lines.join("\n");
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
