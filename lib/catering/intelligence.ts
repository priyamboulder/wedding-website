// ── Menu intelligence calculations ─────────────────────────────────────────
// Pure functions the Intelligence panel and the API route's prompt both
// lean on. Everything here is derived from MenuEvent + MenuMoment + Dish
// + EventDietaryTotals — no side effects, no persistence.

import type {
  Dish,
  DietaryFlag,
  EventDietaryTotals,
  MenuEvent,
  MenuFlag,
  MenuIntelligence,
  MenuMoment,
  SpiceLevel,
} from "@/types/catering";

// Which dietary requirements a dish actually serves. The enum conflates
// "can safely eat this" (allergens) with "prefers this" (vegetarian/jain).
// For coverage math: a dish serves a requirement if it positively carries
// the flag. Non-veg dishes do not serve vegetarian/jain/swami; nut-allergy
// counts serve ONLY dishes explicitly tagged nut_allergy (= nut-free).
const FLAG_SERVES_FLAG: Record<DietaryFlag, (flags: DietaryFlag[]) => boolean> = {
  vegetarian: (f) => f.includes("vegetarian") || f.includes("vegan") || f.includes("jain"),
  vegan: (f) => f.includes("vegan"),
  jain: (f) => f.includes("jain"),
  halal: (f) =>
    f.includes("halal") || f.includes("vegetarian") || f.includes("vegan") || f.includes("jain"),
  kosher: (f) => f.includes("kosher"),
  gluten_free: (f) => f.includes("gluten_free"),
  nut_allergy: (f) => f.includes("nut_allergy"),
  dairy_free: (f) => f.includes("dairy_free") || f.includes("vegan"),
  non_vegetarian: (f) => true, // all guests can eat — no coverage gap risk
  swaminarayan: (f) =>
    f.includes("jain") || (f.includes("vegetarian") && !f.includes("non_vegetarian")),
};

// Coverage ratio: fraction of moments that serve at least one dish for
// this requirement. Weighted by moments rather than dish count so a
// moment with ten options doesn't drown out a moment with none.
function coverageFor(
  flag: DietaryFlag,
  moments: MenuMoment[],
  dishes: Dish[],
): number {
  if (moments.length === 0) return 0;
  const served = moments.filter((m) => {
    const momentDishes = dishes.filter((d) => d.moment_id === m.id);
    return momentDishes.some((d) => FLAG_SERVES_FLAG[flag](d.dietary_flags));
  });
  return served.length / moments.length;
}

// ── Repeats across events ─────────────────────────────────────────────────
// Scan every dish across every event. Report dish names that appear at
// 2+ events — a signal to the couple, not a judgment.

export function findRepeatedDishes(
  currentEventId: string,
  currentDishes: Dish[],
  otherEvents: Array<{ event_id: string; label: string; dish_names: string[] }>,
): Array<{ dish_name: string; event_labels: string[] }> {
  const byName = new Map<string, Set<string>>();
  for (const d of currentDishes) {
    const key = d.name.toLowerCase();
    if (!byName.has(key)) byName.set(key, new Set());
    byName.get(key)!.add("this event");
  }
  for (const e of otherEvents) {
    for (const name of e.dish_names) {
      const key = name.toLowerCase();
      if (!byName.has(key)) byName.set(key, new Set());
      byName.get(key)!.add(e.label);
    }
  }
  const out: Array<{ dish_name: string; event_labels: string[] }> = [];
  byName.forEach((events, key) => {
    if (events.size >= 2 && events.has("this event")) {
      out.push({
        dish_name: titleCase(key),
        event_labels: [...events].filter((e) => e !== "this event"),
      });
    }
  });
  return out;
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w.length > 2 ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// ── Core calc ─────────────────────────────────────────────────────────────

export function computeIntelligence(
  event: MenuEvent,
  moments: MenuMoment[],
  dishes: Dish[],
  dietary?: EventDietaryTotals,
  otherEvents: Array<{ event_id: string; label: string; dish_names: string[] }> = [],
): MenuIntelligence {
  const dishCount = dishes.length;
  const vegDishes = dishes.filter(
    (d) =>
      d.dietary_flags.includes("vegetarian") ||
      d.dietary_flags.includes("vegan") ||
      d.dietary_flags.includes("jain"),
  ).length;
  const nonVegDishes = dishes.filter((d) =>
    d.dietary_flags.includes("non_vegetarian"),
  ).length;
  const vegRatio =
    dishCount === 0 ? 0 : vegDishes / Math.max(vegDishes + nonVegDishes, 1);

  const dietaryCoverage: Record<DietaryFlag, number> = {
    vegetarian: coverageFor("vegetarian", moments, dishes),
    vegan: coverageFor("vegan", moments, dishes),
    jain: coverageFor("jain", moments, dishes),
    halal: coverageFor("halal", moments, dishes),
    kosher: coverageFor("kosher", moments, dishes),
    gluten_free: coverageFor("gluten_free", moments, dishes),
    nut_allergy: coverageFor("nut_allergy", moments, dishes),
    dairy_free: coverageFor("dairy_free", moments, dishes),
    non_vegetarian: coverageFor("non_vegetarian", moments, dishes),
    swaminarayan: coverageFor("swaminarayan", moments, dishes),
  };

  const spiceDistribution: Record<SpiceLevel, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };
  for (const d of dishes) spiceDistribution[d.spice_level]++;

  const repeatedDishes = findRepeatedDishes(event.id, dishes, otherEvents);
  const flags = buildFlags(event, moments, dishes, dietary, dietaryCoverage);

  return {
    event_id: event.id,
    dish_count: dishCount,
    moment_count: moments.length,
    veg_ratio: vegRatio,
    dietary_coverage: dietaryCoverage,
    spice_distribution: spiceDistribution,
    repeated_dishes: repeatedDishes,
    flags,
  };
}

// ── Flag synthesis ────────────────────────────────────────────────────────
// Human-readable risks / gaps. Keep these short and concrete — the couple
// sees them as a live feed in the Intelligence panel.

function buildFlags(
  event: MenuEvent,
  moments: MenuMoment[],
  dishes: Dish[],
  dietary: EventDietaryTotals | undefined,
  coverage: Record<DietaryFlag, number>,
): MenuFlag[] {
  const flags: MenuFlag[] = [];

  // Empty moments
  for (const m of moments) {
    const ds = dishes.filter((d) => d.moment_id === m.id);
    if (ds.length === 0) {
      flags.push({
        severity: "warn",
        message: `${m.name} has no dishes yet.`,
        scope: { moment_id: m.id },
      });
    }
  }

  // Zero dishes
  if (dishes.length === 0) {
    flags.push({
      severity: "risk",
      message: "This event has no menu yet. Describe the vibe in the chat to draft a starting menu.",
    });
  }

  // Dietary gaps — any guests with requirement but zero coverage
  if (dietary) {
    for (const [flag, countRaw] of Object.entries(dietary.counts)) {
      const count = countRaw ?? 0;
      if (count <= 0) continue;
      const key = flag as DietaryFlag;
      const cov = coverage[key] ?? 0;
      if (cov === 0) {
        flags.push({
          severity: "risk",
          message: `${count} ${dietaryLabel(key)} guest${count === 1 ? "" : "s"} — no dishes serve this requirement.`,
          scope: { dietary: key },
        });
      } else if (cov < 0.34 && count >= 5) {
        flags.push({
          severity: "warn",
          message: `Only ${Math.round(cov * 100)}% moment coverage for ${dietaryLabel(key)} (${count} guests).`,
          scope: { dietary: key },
        });
      }
    }
  }

  // Heat concentration — 3+ fiery (level ≥3) dishes in a single moment.
  for (const m of moments) {
    const hot = dishes.filter(
      (d) => d.moment_id === m.id && d.spice_level >= 3,
    );
    if (hot.length >= 3) {
      flags.push({
        severity: "warn",
        message: `${m.name} stacks ${hot.length} fiery dishes — consider cooling one down.`,
        scope: { moment_id: m.id },
      });
    }
  }

  // Dessert-only moments with no non-veg event-wide — usually fine, but
  // passed apps with zero non-veg at a 300+ event is worth calling out.
  if (event.guest_count >= 250) {
    const passed = moments.find((m) => /passed|app|cocktail/i.test(m.name));
    if (passed) {
      const hasNonVeg = dishes.some(
        (d) =>
          d.moment_id === passed.id && d.dietary_flags.includes("non_vegetarian"),
      );
      const hasVeg = dishes.some(
        (d) => d.moment_id === passed.id && !d.dietary_flags.includes("non_vegetarian"),
      );
      if (hasVeg && !hasNonVeg && event.cuisine_direction.toLowerCase().includes("fusion")) {
        flags.push({
          severity: "info",
          message: `${passed.name} is all vegetarian — consider one non-veg canapé for scale.`,
          scope: { moment_id: passed.id },
        });
      }
    }
  }

  return flags;
}

export function dietaryLabel(f: DietaryFlag): string {
  return (
    {
      vegetarian: "vegetarian",
      vegan: "vegan",
      jain: "Jain",
      halal: "halal",
      kosher: "kosher",
      gluten_free: "gluten-free",
      nut_allergy: "nut-free",
      dairy_free: "dairy-free",
      non_vegetarian: "non-vegetarian",
      swaminarayan: "Swaminarayan",
    } satisfies Record<DietaryFlag, string>
  )[f];
}

// ── Other-events projection for the API route ────────────────────────────
// Builds the `other_events` payload the menu-design prompt needs from
// the current store slice.

export function projectOtherEvents(
  currentEventId: string,
  events: MenuEvent[],
  moments: MenuMoment[],
  dishes: Dish[],
): Array<{
  event_id: string;
  label: string;
  cuisine_direction: string;
  dish_names: string[];
}> {
  return events
    .filter((e) => e.id !== currentEventId)
    .map((e) => {
      const momentIds = new Set(
        moments.filter((m) => m.event_id === e.id).map((m) => m.id),
      );
      const dish_names = dishes
        .filter((d) => momentIds.has(d.moment_id))
        .map((d) => d.name);
      return {
        event_id: e.id,
        label: e.label,
        cuisine_direction: e.cuisine_direction,
        dish_names,
      };
    });
}
