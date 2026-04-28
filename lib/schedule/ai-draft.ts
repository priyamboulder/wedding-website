// ── AI auto-draft for the Schedule module ──────────────────────────────────
// Reads an event's metadata (type, tradition, date, venue, guest count,
// anchor start time) and stitches together one or more templates into a
// complete ScheduleItem[] with dependency links intact.
//
// This is deterministic — not an LLM call. A future "refine with AI" action
// would layer an LLM pass on top that can reword labels / suggest deletions
// / inject cultural blocks based on the couple's storyText; that belongs in
// lib/schedule/ai-refine.ts when it arrives.

import type {
  EventRecord,
  Tradition,
} from "@/types/events";
import type {
  ScheduleDependency,
  ScheduleItem,
  ScheduleTemplate,
  ScheduleTemplateItem,
} from "@/types/schedule";
import { hhmmToMinutes, minutesToHhmm } from "@/lib/schedule/data";
import { resolveTimelineTimes } from "@/lib/schedule/resolver";
import { SCHEDULE_TEMPLATES, templateFor } from "@/lib/schedule/templates";

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Map the event's type (from the Events store) onto the schedule template
// eventType vocabulary. Most are one-to-one; "pithi" maps to "haldi".
function scheduleEventTypeFor(
  eventType: string,
): string {
  switch (eventType) {
    case "pithi":
      return "haldi";
    case "welcome_dinner":
    case "farewell_brunch":
      return "reception";
    case "after_party":
      return "reception";
    default:
      return eventType;
  }
}

// Which templates to concatenate for a given event. Some event types imply
// a stack (e.g. "ceremony" for a Hindu wedding = baraat + ceremony). The
// returned list is ordered — items from earlier templates appear first and
// later templates depend on the last item of the previous template.
function templateStackFor(
  eventType: string,
  traditions: Tradition[],
): ScheduleTemplate[] {
  const mapped = scheduleEventTypeFor(eventType);
  const isSouthAsian = traditions.some((t) =>
    [
      "gujarati",
      "punjabi",
      "tamil",
      "telugu",
      "bengali",
      "marwari",
      "marathi",
      "sindhi",
      "malayali",
      "kashmiri",
    ].includes(t),
  );
  const isHindu =
    isSouthAsian ||
    traditions.includes("jain") ||
    traditions.includes("inter_faith");

  if (mapped === "ceremony") {
    const stack: ScheduleTemplate[] = [];
    if (isHindu) {
      const baraat = SCHEDULE_TEMPLATES.find(
        (t) => t.id === "south-asian-hindu-baraat",
      );
      const ceremony = SCHEDULE_TEMPLATES.find(
        (t) => t.id === "south-asian-hindu-ceremony",
      );
      if (baraat) stack.push(baraat);
      if (ceremony) stack.push(ceremony);
    } else {
      const western = SCHEDULE_TEMPLATES.find(
        (t) => t.id === "western-ceremony",
      );
      if (western) stack.push(western);
    }
    return stack;
  }

  if (mapped === "reception") {
    const cocktail = SCHEDULE_TEMPLATES.find((t) => t.id === "shared-cocktail");
    const reception = SCHEDULE_TEMPLATES.find(
      (t) => t.id === "shared-reception",
    );
    const stack: ScheduleTemplate[] = [];
    if (cocktail) stack.push(cocktail);
    if (reception) stack.push(reception);
    return stack;
  }

  const single = templateFor(
    mapped,
    traditions as unknown as string[],
  );
  return single ? [single] : [];
}

// Guest-count-sensitive adjustment to transition durations. Rough heuristic:
// every 100 guests over 100 adds 5 minutes to "transition" category items.
function transitionPaddingFor(guestCount: number): number {
  if (guestCount <= 100) return 0;
  return Math.min(20, Math.floor((guestCount - 100) / 100) * 5);
}

// Convert one template item into a concrete ScheduleItem. `keyToId` maps
// the template's scoped local key (`${templateIdx}:${item.key}`, used for
// dependency.referenceKey) to the new ScheduleItem.id so downstream items
// link correctly. Callers pass the already-scoped `localKey` explicitly —
// looking it up via templateItem.key alone is not sufficient when multiple
// templates are stacked and could share the same local key.
function materialiseItem(
  templateItem: ScheduleTemplateItem,
  localKey: string,
  eventId: string,
  sortOrder: number,
  keyToId: Map<string, string>,
  transitionPadding: number,
): ScheduleItem {
  const resolvedId = keyToId.get(localKey);
  // Fallback to a fresh uid rather than `undefined` — having every item
  // share an undefined id collapses them into a single entry inside the
  // resolver's memo map, which is the bug that produced duplicate rows.
  const id = resolvedId ?? uid();

  const durationMinutes =
    templateItem.category === "transitions"
      ? templateItem.defaultDurationMinutes + transitionPadding
      : templateItem.defaultDurationMinutes;

  let dependency: ScheduleDependency | null = null;
  if (templateItem.dependency) {
    const refId =
      templateItem.dependency.referenceKey &&
      keyToId.get(templateItem.dependency.referenceKey);
    dependency = {
      type: templateItem.dependency.type,
      referenceId: refId ?? null,
      gapMinutes: templateItem.dependency.gapMinutes,
      isHard: templateItem.dependency.isHard,
    };
  }

  return {
    id,
    eventId,
    label: templateItem.label,
    description: templateItem.notes ?? null,
    startTime: "00:00",
    durationMinutes,
    endTime: "00:00",
    category: templateItem.category,
    isFixed: false,
    dependency,
    assignedTo: [...templateItem.defaultAssignedTo],
    vendorIds: [],
    track: "main",
    location: templateItem.defaultLocation ?? null,
    notesForVendor: null,
    internalNotes: null,
    sortOrder,
    color: null,
    isAiDraft: true,
    templateRefKey: templateItem.key,
    isPhotoMoment: templateItem.category === "photography",
    musicCue: null,
    status: "draft",
    actualStartTime: null,
    actualEndTime: null,
  };
}

export interface DraftInput {
  event: Pick<
    EventRecord,
    "id" | "type" | "eventDate" | "venueName" | "guestCount"
  >;
  traditions: Tradition[];
  // HH:MM, 24h. Defaults to the event's conventional start if not provided:
  //   getting_ready / haldi → 09:00
  //   mehndi → 14:00
  //   sangeet / garba → 18:00
  //   ceremony → 16:00
  //   reception → 19:00
  anchorStartTime?: string;
  includeOptional?: boolean;
  // Optional sunset time for the event's date (HH:MM). Used to anchor the
  // couple-portrait window around golden hour when present.
  sunsetTime?: string | null;
}

function defaultAnchor(eventType: string): string {
  switch (scheduleEventTypeFor(eventType)) {
    case "haldi":
    case "getting_ready":
      return "09:00";
    case "mehndi":
      return "14:00";
    case "sangeet":
    case "garba":
      return "18:00";
    case "ceremony":
      return "16:00";
    case "reception":
      return "19:00";
    default:
      return "12:00";
  }
}

// Build a fresh ScheduleItem[] for an event. Does NOT persist — callers
// typically pass the result to replaceScheduleForEvent() from data.ts.
export function draftScheduleForEvent(input: DraftInput): ScheduleItem[] {
  const { event, traditions, includeOptional = true } = input;
  const templates = templateStackFor(event.type, traditions);
  if (templates.length === 0) return [];

  const anchor = input.anchorStartTime ?? defaultAnchor(event.type);
  const transitionPadding = transitionPaddingFor(event.guestCount ?? 100);

  // Step 1: assign a fresh id to every template item across every template
  // in the stack. Template-internal dependency keys are local to a single
  // template; to chain templates we add an extra dependency from the first
  // item of template N to the last item of template N-1.
  const flatItems: Array<{
    templateItem: ScheduleTemplateItem;
    localKey: string;
    sortOrder: number;
  }> = [];
  const keyToId = new Map<string, string>();
  let sortCursor = 0;
  for (let ti = 0; ti < templates.length; ti++) {
    const tpl = templates[ti];
    for (const item of tpl.items) {
      if (!includeOptional && item.isOptional) continue;
      // Scope the template key with the template index so two templates
      // using the same local key don't collide in keyToId.
      const localKey = `${ti}:${item.key}`;
      keyToId.set(localKey, uid());
      flatItems.push({ templateItem: item, localKey, sortOrder: sortCursor++ });
    }
  }

  // Step 2: materialise each item. Patch template-local dependency refs to
  // the scoped keys we built in step 1.
  const materialised: ScheduleItem[] = flatItems.map(
    ({ templateItem, localKey, sortOrder }, idx) => {
      const scopedIdx = Number(localKey.split(":")[0]);
      const scopedTemplate = templates[scopedIdx];
      const scopedDep = templateItem.dependency;

      const patched: ScheduleTemplateItem = {
        ...templateItem,
        // Re-key dependency.referenceKey to the scoped key so the
        // materialise helper can look up the correct id.
        dependency: scopedDep
          ? {
              ...scopedDep,
              referenceKey: scopedDep.referenceKey
                ? `${scopedIdx}:${scopedDep.referenceKey}`
                : null,
            }
          : null,
      };

      const item = materialiseItem(
        patched,
        localKey,
        event.id,
        sortOrder,
        keyToId,
        transitionPadding,
      );

      // Step 3 (inline): link the first item of each non-first template to
      // the last item of the previous template with a 5-minute cushion.
      if (idx > 0) {
        const prev = flatItems[idx - 1];
        const scopedPrevIdx = Number(prev.localKey.split(":")[0]);
        const isFirstOfNewTemplate =
          scopedPrevIdx !== scopedIdx &&
          scopedTemplate.items[0]?.key === templateItem.key;
        if (isFirstOfNewTemplate && !item.dependency) {
          item.dependency = {
            type: "after",
            referenceId: keyToId.get(prev.localKey) ?? null,
            gapMinutes: 5,
            isHard: false,
          };
        }
      }

      return item;
    },
  );

  if (materialised.length === 0) return [];

  // Step 4: anchor the timeline. The first item gets the anchor startTime
  // and is marked isFixed so the resolver doesn't drift it. Everything
  // downstream cascades from there.
  materialised[0] = {
    ...materialised[0],
    startTime: anchor,
    isFixed: true,
  };

  // Step 5: sunset-sensitive couple-portrait tweak. If we have a sunset
  // time and a "couple portraits" photography item, shift its gap so it
  // lands ~30 min before sunset.
  if (input.sunsetTime) {
    const portraitIdx = materialised.findIndex(
      (i) => i.category === "photography" && /portrait/i.test(i.label),
    );
    if (portraitIdx > 0) {
      const sunsetMin = hhmmToMinutes(input.sunsetTime);
      const targetStart = minutesToHhmm(sunsetMin - 30);
      materialised[portraitIdx] = {
        ...materialised[portraitIdx],
        isFixed: true,
        startTime: targetStart,
      };
    }
  }

  // Step 6: resolve times through the dependency graph.
  return resolveTimelineTimes(materialised);
}
