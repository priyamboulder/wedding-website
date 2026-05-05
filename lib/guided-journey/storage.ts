"use client";

// localStorage-backed state for a single category's guided journey.
// One blob per category so switching between categories doesn't replay
// hydration. Mirrors `usePersistentState` from PhotographyCoupleWorkspace.

import { useCallback, useEffect, useState } from "react";
import type {
  CategoryJourneyState,
  CategoryKey,
  GuidedSessionStatus,
} from "./types";

const STORAGE_PREFIX = "marigold:guided-journey:v1";

// One category can host multiple journeys (e.g. mehendi has both Vision and
// Logistics). The default journey stays at the original key so existing
// localStorage blobs don't get orphaned.
export const DEFAULT_JOURNEY_ID = "default";

function storageKey(category: CategoryKey, journeyId: string): string {
  return journeyId === DEFAULT_JOURNEY_ID
    ? `${STORAGE_PREFIX}:${category}`
    : `${STORAGE_PREFIX}:${category}:${journeyId}`;
}

export function defaultJourneyState(): CategoryJourneyState {
  return {
    mode: "guided",
    formData: {},
    sessionStatus: {},
    sessionCompletedAt: {},
    dismissedNudgeKeys: [],
  };
}

export function useCategoryJourneyState(
  category: CategoryKey,
  journeyId: string = DEFAULT_JOURNEY_ID,
): [
  CategoryJourneyState,
  (
    update:
      | Partial<CategoryJourneyState>
      | ((s: CategoryJourneyState) => Partial<CategoryJourneyState>),
  ) => void,
] {
  const key = storageKey(category, journeyId);
  const [state, setState] = useState<CategoryJourneyState>(() =>
    defaultJourneyState(),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CategoryJourneyState>;
        const migrated = applyCategoryMigrations(category, journeyId, {
          ...defaultJourneyState(),
          ...parsed,
        });
        setState(migrated);
      }
    } catch {
      // Corrupt blob — fall back to defaults silently.
    }
    setHydrated(true);
  }, [key, category, journeyId]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Quota / privacy mode — non-fatal.
    }
  }, [key, state, hydrated]);

  const update = useCallback(
    (
      patch:
        | Partial<CategoryJourneyState>
        | ((s: CategoryJourneyState) => Partial<CategoryJourneyState>),
    ) => {
      setState((prev) => ({
        ...prev,
        ...(typeof patch === "function" ? patch(prev) : patch),
      }));
    },
    [],
  );

  return [state, update];
}

// ─── Category migrations ────────────────────────────────────────────────
// One-time data shape migrations applied on hydrate. Target categories
// whose schema changed shape — fields renamed, dropped, or split — so we
// don't lose user data. Idempotent: a migrated state migrates to itself.

function applyCategoryMigrations(
  category: CategoryKey,
  journeyId: string,
  state: CategoryJourneyState,
): CategoryJourneyState {
  if (category === "priest" && journeyId === DEFAULT_JOURNEY_ID) {
    return migratePriestVision(state);
  }
  if (category === "jewelry" && journeyId === DEFAULT_JOURNEY_ID) {
    return migrateJewelryVision(state);
  }
  if (category === "transportation" && journeyId === DEFAULT_JOURNEY_ID) {
    return migrateTransportationVision(state);
  }
  if (category === "gifting" && journeyId === DEFAULT_JOURNEY_ID) {
    return migrateGiftingVision(state);
  }
  return state;
}

// ─── Gifting Vision migration ────────────────────────────────────────────
// Reshape from the original Gifting Vision (favour_style enum, flat
// budget_approach enum, welcome_bag_items[] in Vision Session 1, gift_details
// session) to the revised structure (style_direction[] with reactions,
// budget_anchors per category, gifting_inspiration session with idea
// reactions / moodboard / palette / notes).
//
// Backfill rules per the build prompt:
//   • favour_style enum → style_direction[] entries with reaction = "love":
//       edible              → modern_curated
//       keepsake            → traditional_heritage
//       charitable_donation → eco_friendly_sustainable
//       personalized        → diy_personal
//       not_doing           → no reactions added
//   • budget_approach enum → budget_anchors heuristic backfill:
//       splurge_on_family_simple_for_guests
//         → family_exchanges $750-2000, return_favors $5-15, others tbd
//       equal_for_all
//         → welcome $30-60, favors $15-35, family $300-750, trousseau $1.5K-4K
//       tiered_by_relationship
//         → all categories tbd (couple decides per category)
//   • welcome_bag_items[] → discarded (lifecycle now lives in Build Session 1)
//   • gift_details session → entirely removed; its operational fields move
//     into the Build journey. Drop session_status + form_data.
function migrateGiftingVision(state: CategoryJourneyState): CategoryJourneyState {
  const philosophy = state.formData["gifting_philosophy"];
  if (!philosophy) return state;
  const p = philosophy as Record<string, unknown>;

  // Already migrated — skip. Detected by either of the new-shape fields.
  const alreadyMigrated =
    Array.isArray(p["style_direction"]) ||
    (typeof p["budget_anchors"] === "object" && p["budget_anchors"] !== null);
  if (alreadyMigrated) return state;

  const next: Record<string, unknown> = { ...p };

  // 1. favour_style enum → style_direction[] (loved entries)
  const favourStyle = typeof p["favour_style"] === "string" ? (p["favour_style"] as string) : null;
  const styleDirection: Array<{ style_id: string; reaction: string }> = [];
  if (favourStyle && favourStyle !== "not_doing") {
    const favourMap: Record<string, string> = {
      edible: "modern_curated",
      keepsake: "traditional_heritage",
      charitable_donation: "eco_friendly_sustainable",
      personalized: "diy_personal",
    };
    const styleId = favourMap[favourStyle];
    if (styleId) {
      styleDirection.push({ style_id: styleId, reaction: "love" });
    }
  }
  next["style_direction"] = styleDirection;

  // 2. budget_approach → budget_anchors heuristic
  const approach =
    typeof p["budget_approach"] === "string" ? (p["budget_approach"] as string) : null;
  const anchors = {
    welcome_bags_per_bag: "tbd",
    return_favors_per_guest: "tbd",
    family_exchanges_per_family: "tbd",
    trousseau_packaging_total: "tbd",
  };
  if (approach === "splurge_on_family_simple_for_guests") {
    anchors.family_exchanges_per_family = "$750-2000";
    anchors.return_favors_per_guest = "$5-15";
  } else if (approach === "equal_for_all") {
    anchors.welcome_bags_per_bag = "$30-60";
    anchors.return_favors_per_guest = "$15-35";
    anchors.family_exchanges_per_family = "$300-750";
    anchors.trousseau_packaging_total = "$1.5K-4K";
  }
  // tiered_by_relationship → leave all tbd; couple picks per category.
  next["budget_anchors"] = anchors;

  // 3. Drop deprecated Vision-only fields.
  //    welcome_bag_items[] moved to Build Session 1 (item lifecycle).
  delete next["welcome_bag_items"];
  delete next["favour_style"];
  delete next["budget_approach"];

  // 4. gift_details session is gone — its operational fields move to Build.
  //    Strip its form_data / status / completedAt entries.
  const formData: Record<string, Record<string, unknown>> = {
    ...state.formData,
    gifting_philosophy: next,
  };
  if ("gift_details" in formData) {
    delete formData["gift_details"];
  }

  // 5. Initialise gifting_inspiration if absent so the new Session 2 can
  //    hydrate from a known shape.
  if (!formData["gifting_inspiration"]) {
    formData["gifting_inspiration"] = {
      idea_reactions: [],
      moodboard_pins: [],
      palette: { hexes: [] },
      vision_notes: "",
    };
  }

  const sessionStatus = { ...state.sessionStatus };
  delete sessionStatus["gift_details"];
  const sessionCompletedAt = { ...state.sessionCompletedAt };
  delete sessionCompletedAt["gift_details"];

  return {
    ...state,
    formData,
    sessionStatus,
    sessionCompletedAt,
  };
}

function migratePriestVision(state: CategoryJourneyState): CategoryJourneyState {
  const traditions = state.formData["ceremony_traditions"];
  if (!traditions) return state;
  const t = traditions as Record<string, unknown>;

  // Already migrated — skip.
  const alreadyHasBroad = typeof t["broad_tradition"] === "string";
  if (alreadyHasBroad) return state;

  const next: Record<string, unknown> = { ...t };

  // traditions[] (old) → broad_tradition (new). First item wins; default to
  // "hindu" when the old list mixed broad and sub-tradition labels.
  if (Array.isArray(t["traditions"]) && t["traditions"].length > 0) {
    const first = t["traditions"][0];
    next["broad_tradition"] =
      typeof first === "string" && BROAD_TRADITION_VALUES.has(first)
        ? first
        : "hindu";
    delete next["traditions"];
  }

  // ceremony_length_preference: traditional_full → 90_min,
  // abbreviated → 45_min, custom → no_time_pressure
  const oldLen = t["ceremony_length_preference"];
  if (typeof oldLen === "string") {
    next["ceremony_length_preference"] =
      oldLen === "traditional_full"
        ? "90_min"
        : oldLen === "abbreviated"
          ? "45_min"
          : oldLen === "custom"
            ? "no_time_pressure"
            : oldLen;
  }

  // language_preference: array → first item, fall back to sanskrit_english
  if (Array.isArray(t["language_preference"])) {
    const first = t["language_preference"][0];
    next["language_preference"] =
      typeof first === "string" ? first : "sanskrit_english";
  }

  // guest_participation: missing → most-common default
  if (next["guest_participation"] == null) {
    next["guest_participation"] = "participate_key_moments";
  }

  // Drop fields that moved to Build / are now redundant.
  delete next["regional_customs"];
  delete next["ceremony_elements"];
  delete next["bilingual_ceremony"];

  // ceremony_roles session has moved to Build entirely. Drop its form_data.
  const formData = { ...state.formData, ceremony_traditions: next };
  if ("ceremony_roles" in formData) {
    delete (formData as Record<string, unknown>)["ceremony_roles"];
  }
  const sessionStatus = { ...state.sessionStatus };
  delete sessionStatus["ceremony_roles"];
  const sessionCompletedAt = { ...state.sessionCompletedAt };
  delete sessionCompletedAt["ceremony_roles"];

  return {
    ...state,
    formData,
    sessionStatus,
    sessionCompletedAt,
  };
}

// ─── Jewelry Vision migration ────────────────────────────────────────────
// Reshape from the original Jewelry Vision (style_preferences,
// metal_preferences, heirloom_pieces, rental_open, per_event_jewelry) to
// the revised structure (style_keywords, direction.{base_metals,
// style_families, weight_vibe}, sourcing_mix, jewelry_inspiration).
//
// Backfill rules per the build prompt:
//   • metal_preferences[] → direction.base_metals[]
//   • style_preferences[] → direction.style_families[] (best-effort) +
//     style_keywords (kept verbatim)
//   • direction.weight_vibe defaults to traditional_modern_twist
//   • sourcing_mix backfills from rental_open + heuristics
//   • heirloom_pieces[] is preserved on the session bag for the Build
//     journey to read on first launch (Build session 3 pre-seeds from
//     this on first hydration).
//   • per_event_jewelry session is removed; data preserved verbatim under
//     `_legacy_per_event_jewelry` for the Build session 1 to optionally
//     pre-seed from.

function migrateJewelryVision(state: CategoryJourneyState): CategoryJourneyState {
  const direction = state.formData["jewelry_direction"];
  if (!direction) return state;
  const dir = direction as Record<string, unknown>;

  // Already migrated — skip. Detected by the new-shape key set.
  const alreadyMigrated =
    typeof dir["direction"] === "object" || Array.isArray(dir["style_keywords"]);
  if (alreadyMigrated) return state;

  const next: Record<string, unknown> = { ...dir };

  // 1. style_preferences[] → style_keywords[] (verbatim) + direction.style_families[]
  const stylePrefs = Array.isArray(dir["style_preferences"])
    ? (dir["style_preferences"] as string[])
    : [];
  if (!Array.isArray(next["style_keywords"])) {
    next["style_keywords"] = stylePrefs;
  }

  const styleFamilyMap: Record<string, string> = {
    traditional_kundan: "traditional_kundan_polki",
    polki: "traditional_kundan_polki",
    kundan: "traditional_kundan_polki",
    temple: "temple",
    jadau: "jadau_meenakari",
    meenakari: "jadau_meenakari",
    diamond: "modern_diamond",
    contemporary: "modern_diamond",
    minimalist: "minimalist_delicate",
    statement: "heirloom_revival",
    pearl: "minimalist_delicate",
  };
  const styleFamilies = Array.from(
    new Set(
      stylePrefs
        .map((p) => styleFamilyMap[p])
        .filter((p): p is string => Boolean(p)),
    ),
  );

  // 2. metal_preferences[] → direction.base_metals[]
  const metalPrefs = Array.isArray(dir["metal_preferences"])
    ? (dir["metal_preferences"] as string[])
    : [];
  const metalMap: Record<string, string> = {
    gold: "gold",
    silver: "silver",
    platinum: "platinum_white_gold",
    rose_gold: "gold",
  };
  const baseMetals = Array.from(
    new Set(
      metalPrefs
        .map((m) => metalMap[m])
        .filter((m): m is string => Boolean(m)),
    ),
  );

  next["direction"] = {
    base_metals: baseMetals,
    style_families: styleFamilies,
    weight_vibe: "traditional_modern_twist",
  };

  // 3. sourcing_mix from rental_open + heirloom_pieces presence + heuristic
  const rentalOpen = Boolean(dir["rental_open"]);
  const hasHeirlooms =
    Array.isArray(dir["heirloom_pieces"]) &&
    (dir["heirloom_pieces"] as unknown[]).length > 0;
  next["sourcing_mix"] = {
    new_purchases: true, // safe default — most couples buy at least some new
    family_heirlooms: hasHeirlooms,
    rentals: rentalOpen,
    custom_designed: false,
  };

  // 4. Preserve old shape under _legacy_* keys so the Build journey can
  //    read it on first hydration (Build Session 3 pre-seeds from
  //    _legacy_heirloom_pieces; Session 1 from _legacy_per_event_jewelry).
  if (Array.isArray(dir["heirloom_pieces"])) {
    next["_legacy_heirloom_pieces"] = dir["heirloom_pieces"];
  }
  delete next["style_preferences"];
  delete next["metal_preferences"];
  delete next["heirloom_pieces"];
  delete next["rental_open"];

  // 5. per_event_jewelry is gone — preserve under jewelry_direction blob
  //    for Build Session 1 to consume.
  const formData: Record<string, Record<string, unknown>> = {
    ...state.formData,
    jewelry_direction: next,
  };
  if ("per_event_jewelry" in formData) {
    const legacy = formData["per_event_jewelry"];
    formData["jewelry_direction"] = {
      ...formData["jewelry_direction"],
      _legacy_per_event_jewelry: legacy,
    };
    delete formData["per_event_jewelry"];
  }

  // 6. Initialise jewelry_inspiration if absent so the session can hydrate.
  if (!formData["jewelry_inspiration"]) {
    formData["jewelry_inspiration"] = {
      moodboard_pins: [],
      per_event_references: [],
      celebrity_inspiration: [],
      expression_wishlist: [],
      outfit_pairing_anchors: [],
    };
  }

  // 7. Drop the old per_event_jewelry session status (it no longer exists).
  const sessionStatus = { ...state.sessionStatus };
  delete sessionStatus["per_event_jewelry"];
  const sessionCompletedAt = { ...state.sessionCompletedAt };
  delete sessionCompletedAt["per_event_jewelry"];

  return {
    ...state,
    formData,
    sessionStatus,
    sessionCompletedAt,
  };
}

// ─── Transportation Vision migration ─────────────────────────────────────
// Reshape the original transport_needs form_data (baraat_details,
// guest_shuttle, getaway_car flat shape) to the revised structure that
// matches the full Vision tab on the Transportation workspace:
//   • couple_arrivals.{bride_arrival, groom_arrival, between_events,
//     send_off_exit}        (NEW — matches Tab 1 "The couple")
//   • baraat_intent.{happening, style, dhol_with_baraat, dream_note}
//     (was baraat_details.*)
//   • guest_shuttle_intent.{needed, return_service, late_night_service,
//     rough_guest_count}    (was guest_shuttle.* — concrete counts move
//     to Build session 2)
//   • getaway_car.*         (unchanged)
//   • vendor_transport_flags.{dhol_players_need_transport,
//     other_vendors_need_transport, notes}     (NEW)

function migrateTransportationVision(
  state: CategoryJourneyState,
): CategoryJourneyState {
  const needs = state.formData["transport_needs"];
  if (!needs) return state;
  const n = needs as Record<string, unknown>;

  const alreadyMigrated =
    typeof n["baraat_intent"] === "object" ||
    typeof n["couple_arrivals"] === "object";
  if (alreadyMigrated) return state;

  const next: Record<string, unknown> = { ...n };

  // 1. couple_arrivals — start with TBD across the board, then backfill
  //    send_off_exit from the legacy getaway_car.style_preference if it
  //    looks like a vehicle keyword.
  const legacyGetaway =
    typeof n["getaway_car"] === "object" && n["getaway_car"] !== null
      ? (n["getaway_car"] as Record<string, unknown>)
      : {};
  const sendOffFromGetaway = inferSendOffStyle(
    typeof legacyGetaway["style_preference"] === "string"
      ? (legacyGetaway["style_preference"] as string)
      : "",
    Boolean(legacyGetaway["wanted"]),
  );
  next["couple_arrivals"] = {
    bride_arrival: "tbd",
    groom_arrival: "tbd",
    between_events: "tbd",
    send_off_exit: sendOffFromGetaway,
  };

  // 2. baraat_intent — backfill from legacy baraat_details
  const legacyBaraat =
    typeof n["baraat_details"] === "object" && n["baraat_details"] !== null
      ? (n["baraat_details"] as Record<string, unknown>)
      : {};
  const legacyStyle =
    typeof legacyBaraat["style"] === "string"
      ? (legacyBaraat["style"] as string)
      : "tbd";
  const happening = legacyStyle && legacyStyle !== "none";
  next["baraat_intent"] = {
    happening: Boolean(happening),
    style: legacyStyle || "tbd",
    dhol_with_baraat: Boolean(legacyBaraat["dhol_with_baraat"]),
    dream_note:
      typeof legacyBaraat["route_notes"] === "string"
        ? (legacyBaraat["route_notes"] as string)
        : undefined,
  };

  // 3. guest_shuttle_intent — backfill from legacy guest_shuttle
  const legacyShuttle =
    typeof n["guest_shuttle"] === "object" && n["guest_shuttle"] !== null
      ? (n["guest_shuttle"] as Record<string, unknown>)
      : {};
  next["guest_shuttle_intent"] = {
    needed: Boolean(legacyShuttle["needed"]),
    return_service: Boolean(legacyShuttle["return_service"]),
    late_night_service: Boolean(legacyShuttle["late_night_service"]),
    rough_guest_count:
      typeof legacyShuttle["hotel_to_venue_count"] === "number"
        ? (legacyShuttle["hotel_to_venue_count"] as number)
        : undefined,
  };

  // 4. vendor_transport_flags — initialize empty; couples answer in revised UI
  if (!next["vendor_transport_flags"]) {
    next["vendor_transport_flags"] = {
      dhol_players_need_transport: false,
      other_vendors_need_transport: false,
    };
  }

  // 5. Drop the legacy keys (kept under `_legacy_*` to be safe).
  if (n["baraat_details"] !== undefined) {
    next["_legacy_baraat_details"] = n["baraat_details"];
    delete next["baraat_details"];
  }
  if (n["guest_shuttle"] !== undefined) {
    next["_legacy_guest_shuttle"] = n["guest_shuttle"];
    delete next["guest_shuttle"];
  }

  return {
    ...state,
    formData: { ...state.formData, transport_needs: next },
  };
}

function inferSendOffStyle(
  style: string,
  wanted: boolean,
):
  | "vintage_car"
  | "decorated_car"
  | "limo"
  | "getaway_car"
  | "fireworks_only"
  | "none"
  | "tbd" {
  if (!wanted) return "tbd";
  const s = style.toLowerCase();
  if (/vintage|rolls|royce|classic/.test(s)) return "vintage_car";
  if (/limo/.test(s)) return "limo";
  if (/firework/.test(s)) return "fireworks_only";
  if (/decorated|suv/.test(s)) return "decorated_car";
  if (s.length > 0) return "getaway_car";
  return "tbd";
}

const BROAD_TRADITION_VALUES = new Set([
  "hindu",
  "sikh",
  "jain",
  "buddhist",
  "muslim",
  "parsi",
  "christian",
  "interfaith",
  "non_religious",
]);

// ─── Path helpers ────────────────────────────────────────────────────────
// Sessions store form data keyed by their session_key. Fields write to
// nested paths inside that bag (dot notation: "colour_palette.primary").

export function readPath(
  bag: Record<string, unknown> | undefined,
  path: string,
): unknown {
  if (!bag) return undefined;
  const segments = path.split(".");
  let cur: unknown = bag;
  for (const seg of segments) {
    if (cur && typeof cur === "object" && seg in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[seg];
    } else {
      return undefined;
    }
  }
  return cur;
}

export function writePath(
  bag: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const segments = path.split(".");
  const next: Record<string, unknown> = { ...bag };
  let cursor: Record<string, unknown> = next;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const seg = segments[i];
    const existing = cursor[seg];
    const child =
      existing && typeof existing === "object" && !Array.isArray(existing)
        ? { ...(existing as Record<string, unknown>) }
        : {};
    cursor[seg] = child;
    cursor = child;
  }
  cursor[segments[segments.length - 1]] = value;
  return next;
}

// ─── Session-level helpers ──────────────────────────────────────────────

export function setSessionFormPath(
  state: CategoryJourneyState,
  sessionKey: string,
  path: string,
  value: unknown,
): Partial<CategoryJourneyState> {
  const currentBag = state.formData[sessionKey] ?? {};
  const nextBag = writePath(currentBag, path, value);
  const currentStatus = state.sessionStatus[sessionKey];
  return {
    formData: { ...state.formData, [sessionKey]: nextBag },
    // Auto-promote to "in_progress" on first interaction. Keep "completed"
    // sessions in their state — the explicit "Edit this section" button
    // flips them back when needed.
    sessionStatus:
      currentStatus === "in_progress" || currentStatus === "completed"
        ? state.sessionStatus
        : { ...state.sessionStatus, [sessionKey]: "in_progress" },
  };
}

export function setSessionStatus(
  state: CategoryJourneyState,
  sessionKey: string,
  status: GuidedSessionStatus,
): Partial<CategoryJourneyState> {
  const nextCompletedAt = { ...state.sessionCompletedAt };
  if (status === "completed") {
    nextCompletedAt[sessionKey] = Date.now();
  } else {
    delete nextCompletedAt[sessionKey];
  }
  return {
    sessionStatus: { ...state.sessionStatus, [sessionKey]: status },
    sessionCompletedAt: nextCompletedAt,
  };
}
