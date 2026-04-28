// ── Photography → Shot List onboarding quiz ───────────────────────────────
// 4 questions, ~2 minutes. Seeds coverage shots per selected event,
// adds must-have ritual shots, drops a coverage-hours note, and wires
// a drone crew entry when requested.

import type {
  QuizAnswerMap,
  QuizPreviewItem,
  QuizSchema,
} from "@/types/quiz";
import { usePhotographyStore } from "@/stores/photography-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  PHOTO_EVENT_META,
  type PhotoEventId,
} from "@/types/photography";

// Events the quiz offers. Baraat and pre-wedding intentionally not on
// the default list — they're add-on coverage for many weddings.
const EVENT_CHIPS: { value: PhotoEventId; label: string }[] = [
  { value: "haldi", label: "Haldi" },
  { value: "mehendi", label: "Mehendi" },
  { value: "sangeet", label: "Sangeet" },
  { value: "wedding", label: "Wedding" },
  { value: "reception", label: "Reception" },
];

// Chip → (event, moment) target for the must-have shots.
const RITUAL_CHIP_TARGETS: Record<
  string,
  { event: PhotoEventId; moment?: string; title: string }
> = {
  first_look: { event: "wedding", moment: "First look", title: "First look" },
  varmala: { event: "wedding", moment: "Var mala", title: "Varmala exchange" },
  pheras: {
    event: "wedding",
    moment: "Kanyadaan & pheras",
    title: "Pheras — all four rounds",
  },
  couple_portraits: {
    event: "general",
    moment: "Golden hour portraits",
    title: "Couple portraits (golden hour)",
  },
  family_formals: {
    event: "wedding",
    moment: "Family portraits",
    title: "Family formals",
  },
};

// ── Schema ────────────────────────────────────────────────────────────────

export const photographyShotListQuiz: QuizSchema = {
  id: "photography:shot_list:v1",
  version: "1",
  category: "photography",
  subsection: "shot_list",
  title: "Shot List in 4 questions",
  intro:
    "Tell us what needs covering — we'll seed your list with the right events, must-have moments, and a note on hours.",
  estimated_minutes: 2,
  questions: [
    {
      id: "events",
      prompt: "Which events need photography coverage?",
      helper: "Pick everything your photographer will be on — we'll add a placeholder shot per event.",
      input: {
        type: "multi_select",
        min: 1,
        options: EVENT_CHIPS.map((e) => ({
          value: e.value,
          label: e.label,
        })),
      },
    },
    {
      id: "hours_per_event",
      prompt: "Roughly how many hours per event?",
      helper: "A ballpark is fine — you can refine per-event later.",
      input: {
        type: "number_slider",
        min: 2,
        max: 14,
        step: 1,
        defaultValue: 8,
        minLabel: "2h",
        maxLabel: "14h",
      },
    },
    {
      id: "must_haves",
      prompt: "Any non-negotiable shots?",
      helper: "Pick the presets that apply, or add your own in the next question.",
      optional: true,
      input: {
        type: "multi_select",
        options: [
          { value: "first_look", label: "First look" },
          { value: "varmala", label: "Varmala" },
          { value: "pheras", label: "Pheras" },
          { value: "couple_portraits", label: "Couple portraits" },
          { value: "family_formals", label: "Family formals" },
        ],
      },
    },
    {
      id: "extra_shots",
      prompt: "Anything else you'd be heartbroken to miss?",
      helper: "Free-form — we'll turn each into a shot on the general list.",
      optional: true,
      input: {
        type: "long_text",
        placeholder:
          "e.g. grandmother's first look at my lehenga, my brother's speech, the baraat drummer…",
        extraction: {
          targetShape:
            "An object with one field: `shots` — an array of 1–6 short shot titles (under 10 words each). Each title should describe a specific photographable moment or subject the couple called out. Strip filler words; keep nouns and verbs concrete.",
          example: {
            shots: [
              "Grandmother's first reaction to the lehenga",
              "Brother's speech at the sangeet",
              "Baraat drummer close-up",
            ],
          },
        },
      },
    },
    {
      id: "drone",
      prompt: "Do you want drone coverage?",
      input: {
        type: "single_select",
        options: [
          { value: "yes", label: "Yes — book a drone op" },
          { value: "no", label: "No" },
          { value: "unsure", label: "Not sure yet" },
        ],
      },
    },
  ],

  preview: (answers, _ctx) => {
    const items: QuizPreviewItem[] = [];

    const evA = answers.events;
    if (evA && evA.kind === "multi" && evA.values.length > 0) {
      const labels = evA.values
        .map((v) => EVENT_CHIPS.find((e) => e.value === v)?.label ?? v)
        .filter(Boolean);
      items.push({
        fieldKey: "coverage_events",
        label: `Placeholder shots per event (${labels.length})`,
        value: labels,
        editable: false,
      });
    }

    const hoursA = answers.hours_per_event;
    const eventsCount =
      evA && evA.kind === "multi" ? evA.values.length : 0;
    if (hoursA && hoursA.kind === "number") {
      items.push({
        fieldKey: "coverage_hours_note",
        label: "Coverage hours note",
        value:
          eventsCount > 0
            ? `${hoursA.value} hours × ${eventsCount} event${eventsCount === 1 ? "" : "s"}`
            : `${hoursA.value} hours per event`,
        editable: true,
      });
    }

    const mustA = answers.must_haves;
    if (mustA && mustA.kind === "multi" && mustA.values.length > 0) {
      const titles = mustA.values
        .map((v) => RITUAL_CHIP_TARGETS[v]?.title ?? v)
        .filter(Boolean);
      items.push({
        fieldKey: "must_have_shots",
        label: `Must-have shots (${titles.length})`,
        value: titles,
        editable: false,
      });
    }

    const extraA = answers.extra_shots;
    if (extraA && extraA.kind === "text" && extraA.value.trim()) {
      const extracted = extraA.extracted as
        | { shots?: unknown }
        | undefined;
      const list =
        extracted && Array.isArray(extracted.shots)
          ? (extracted.shots.filter(
              (x): x is string => typeof x === "string",
            ) as string[])
          : null;
      items.push({
        fieldKey: "extra_shots_list",
        label: list
          ? `Extra shots (${list.length})`
          : "Extra shots (raw note)",
        value: list && list.length > 0 ? list : extraA.value.trim(),
        editable: true,
      });
    }

    const droneA = answers.drone;
    if (droneA && droneA.kind === "single") {
      const label =
        droneA.value === "yes"
          ? "Yes — add drone operator to crew"
          : droneA.value === "no"
            ? "No drone coverage"
            : "Unsure — we'll drop a note to decide";
      items.push({
        fieldKey: "drone_decision",
        label: "Drone",
        value: label,
        editable: false,
      });
    }

    return items;
  },

  apply: (answers, edited, ctx) => {
    const photo = usePhotographyStore.getState();
    const workspace = useWorkspaceStore.getState();
    const byKey = new Map(edited.map((e) => [e.fieldKey, e]));

    // Coverage shots — one "Full-event coverage" shot per picked event.
    const evA = answers.events;
    if (byKey.has("coverage_events") && evA && evA.kind === "multi") {
      for (const ev of evA.values) {
        const eventId = ev as PhotoEventId;
        const firstMoment =
          PHOTO_EVENT_META[eventId]?.moments?.[0] ?? undefined;
        photo.addShot({
          category_id: ctx.categoryId,
          event: eventId,
          priority: "must",
          title: "Full-event coverage",
          moment: firstMoment,
          vip_ids: [],
        });
      }
    }

    // Coverage hours — one note on the workspace.
    const hoursEdit = byKey.get("coverage_hours_note");
    if (hoursEdit && typeof hoursEdit.value === "string") {
      workspace.addNote(
        ctx.categoryId,
        `Coverage hours: ${hoursEdit.value}`,
      );
    }

    // Must-have shots from chips.
    const mustA = answers.must_haves;
    if (byKey.has("must_have_shots") && mustA && mustA.kind === "multi") {
      for (const chip of mustA.values) {
        const target = RITUAL_CHIP_TARGETS[chip];
        if (!target) continue;
        photo.addShot({
          category_id: ctx.categoryId,
          event: target.event,
          priority: "must",
          title: target.title,
          moment: target.moment,
          vip_ids: [],
        });
      }
    }

    // Extra shots from free text — add each as preferred on the general event.
    const extraEdit = byKey.get("extra_shots_list");
    if (extraEdit) {
      const list = Array.isArray(extraEdit.value)
        ? extraEdit.value
        : [String(extraEdit.value)];
      for (const title of list) {
        const t = title.trim();
        if (!t) continue;
        photo.addShot({
          category_id: ctx.categoryId,
          event: "general",
          priority: "preferred",
          title: t,
          vip_ids: [],
        });
      }
    }

    // Drone — crew member on yes, note on unsure.
    const droneA = answers.drone;
    if (droneA && droneA.kind === "single") {
      if (droneA.value === "yes") {
        photo.addCrew({
          category_id: ctx.categoryId,
          role: "drone",
          handoff_note: "Requested via onboarding quiz — not yet assigned.",
        });
      } else if (droneA.value === "unsure") {
        workspace.addNote(
          ctx.categoryId,
          "Drone coverage: undecided — revisit before locking the shot list.",
        );
      }
    }
  },
};
