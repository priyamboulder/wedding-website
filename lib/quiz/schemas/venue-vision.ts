// ── Venue → Discovery & Feel quiz ──────────────────────────────────────────
// Not a taste quiz — it's a requirements filter. Five questions build a
// structured venue brief: climate, priority axis, event scope, guest count,
// vibe. Outputs seed style keywords, pin one vibe moodboard image, and drop
// each answer as its own note so the planner can screen venues against them.

import type {
  ChipOption,
  ImageOption,
  QuizPreviewItem,
  QuizSchema,
} from "@/types/quiz";
import { useVisionStore } from "@/stores/vision-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

// ── Option tables ─────────────────────────────────────────────────────────

const CLIMATE_OPTIONS: ChipOption[] = [
  { value: "indoor", label: "Indoor — climate-controlled, reliable" },
  { value: "outdoor", label: "Outdoor — garden, lawn, terrace" },
  { value: "both", label: "Both — ceremony outside, reception inside" },
  { value: "flexible", label: "Flexible — depends on the venue" },
];

const PRIORITY_OPTIONS: ChipOption[] = [
  { value: "beauty", label: "Beauty of the space" },
  { value: "location", label: "Location & accessibility for guests" },
  { value: "capacity", label: "Capacity & flexibility" },
  { value: "amenities", label: "On-site catering & amenities" },
  { value: "cost", label: "Cost" },
];

const SCOPE_OPTIONS: ChipOption[] = [
  { value: "all_events", label: "All events (3–5 days)" },
  { value: "wedding_reception", label: "Just the wedding + reception" },
  { value: "ceremony_only", label: "Ceremony only" },
  { value: "reception_only", label: "Reception only" },
  { value: "multi_venue", label: "We're using multiple venues" },
];

const GUESTS_OPTIONS: ChipOption[] = [
  { value: "under_150", label: "Under 150" },
  { value: "150_300", label: "150–300" },
  { value: "300_500", label: "300–500" },
  { value: "500_plus", label: "500+" },
];

const VIBE_OPTIONS: ImageOption[] = [
  {
    value: "grand_hotel",
    label: "Grand hotel or ballroom",
    image_url:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=640&q=70",
  },
  {
    value: "garden_estate",
    label: "Garden estate or ranch",
    image_url:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=640&q=70",
  },
  {
    value: "modern_loft",
    label: "Modern loft or gallery",
    image_url:
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=640&q=70",
  },
  {
    value: "historic",
    label: "Historic mansion or heritage property",
    image_url:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=640&q=70",
  },
  {
    value: "religious",
    label: "Religious venue (temple, gurdwara)",
    image_url:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=640&q=70",
  },
];

function labelFor(
  options: readonly { value: string; label: string }[],
  v: string,
): string {
  return options.find((o) => o.value === v)?.label ?? v;
}

// ── Schema ────────────────────────────────────────────────────────────────

export const venueVisionQuiz: QuizSchema = {
  id: "venue:vision:v1",
  version: "1",
  category: "venue",
  subsection: "vision",
  title: "Your perfect venue in 5 questions",
  intro:
    "This is the biggest decision that affects everything else. Let's figure out what matters most to you — we'll turn your answers into a screening checklist for every venue you consider.",
  estimated_minutes: 3,
  questions: [
    {
      id: "climate",
      prompt: "Indoor, outdoor, or both?",
      helper: "Climate sets the tone — and the backup plan.",
      input: {
        type: "single_select",
        options: CLIMATE_OPTIONS,
      },
    },
    {
      id: "priority",
      prompt: "What matters most in a venue?",
      helper: "The tiebreaker when you have to choose between options.",
      input: {
        type: "single_select",
        options: PRIORITY_OPTIONS,
      },
    },
    {
      id: "scope",
      prompt: "How many events are you hosting at this venue?",
      helper:
        "Indian weddings often span 3–5 days. Scope determines the spaces the venue needs to offer.",
      input: {
        type: "single_select",
        options: SCOPE_OPTIONS,
      },
    },
    {
      id: "guests",
      prompt: "Guest count for your largest event?",
      helper: "Used as the venue's minimum capacity requirement.",
      input: {
        type: "single_select",
        options: GUESTS_OPTIONS,
      },
    },
    {
      id: "vibe",
      prompt: "What's the vibe?",
      helper: "Pick one — we'll pin it to your moodboard as a starting point.",
      input: {
        type: "image_grid",
        min: 1,
        max: 1,
        options: VIBE_OPTIONS,
      },
    },
  ],

  preview: (answers) => {
    const items: QuizPreviewItem[] = [];

    const climateA = answers.climate;
    if (climateA && climateA.kind === "single") {
      items.push({
        fieldKey: "climate",
        label: "Indoor / outdoor",
        value: labelFor(CLIMATE_OPTIONS, climateA.value),
        editable: true,
      });
    }

    const priorityA = answers.priority;
    if (priorityA && priorityA.kind === "single") {
      items.push({
        fieldKey: "priority",
        label: "What matters most",
        value: labelFor(PRIORITY_OPTIONS, priorityA.value),
        editable: true,
      });
    }

    const scopeA = answers.scope;
    if (scopeA && scopeA.kind === "single") {
      items.push({
        fieldKey: "scope",
        label: "Event scope",
        value: labelFor(SCOPE_OPTIONS, scopeA.value),
        editable: true,
      });
    }

    const guestsA = answers.guests;
    if (guestsA && guestsA.kind === "single") {
      items.push({
        fieldKey: "guests",
        label: "Guest count (largest event)",
        value: labelFor(GUESTS_OPTIONS, guestsA.value),
        editable: true,
      });
    }

    const vibeA = answers.vibe;
    if (vibeA && vibeA.kind === "images" && vibeA.values.length > 0) {
      const v = vibeA.values[0]!;
      items.push({
        fieldKey: "vibe",
        label: "Venue vibe",
        value: labelFor(VIBE_OPTIONS, v),
        editable: true,
      });
      items.push({
        fieldKey: "moodboard_pins",
        label: "Moodboard pin",
        value: [labelFor(VIBE_OPTIONS, v)],
        editable: false,
      });
    }

    return items;
  },

  apply: (answers, edited, ctx) => {
    const vision = useVisionStore.getState();
    const workspace = useWorkspaceStore.getState();
    const byKey = new Map(edited.map((e) => [e.fieldKey, e]));

    // Style keywords: climate + priority + vibe (raw option values so other
    // surfaces can match by token rather than label).
    const keywords: string[] = [];
    const climateA = answers.climate;
    if (climateA && climateA.kind === "single") keywords.push(climateA.value);
    const priorityA = answers.priority;
    if (priorityA && priorityA.kind === "single") keywords.push(priorityA.value);
    const vibeA = answers.vibe;
    if (vibeA && vibeA.kind === "images") keywords.push(...vibeA.values);
    if (keywords.length > 0) {
      vision.setKeywords(ctx.categorySlug, keywords);
    }

    // Moodboard pin: the single selected vibe image.
    if (byKey.has("moodboard_pins") && vibeA && vibeA.kind === "images") {
      for (const value of vibeA.values) {
        const opt = VIBE_OPTIONS.find((o) => o.value === value);
        if (!opt) continue;
        workspace.addMoodboardItem(ctx.categoryId, opt.image_url, opt.label);
      }
    }

    // Write each categorical answer as its own note so the screening
    // checklist has discrete brief lines.
    const writeNote = (fieldKey: string, label: string) => {
      const edit = byKey.get(fieldKey);
      if (!edit) return;
      const value = Array.isArray(edit.value) ? edit.value.join(", ") : edit.value;
      if (!value) return;
      workspace.addNote(ctx.categoryId, `${label}: ${value}`);
    };

    writeNote("climate", "Climate");
    writeNote("priority", "Top priority");
    writeNote("scope", "Event scope");
    writeNote("guests", "Guest count (largest)");
    writeNote("vibe", "Venue vibe");
  },
};
