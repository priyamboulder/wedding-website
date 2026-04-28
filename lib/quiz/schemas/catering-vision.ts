// ── Catering → Vision & Mood quiz ─────────────────────────────────────────
// Catering sits outside the standard 3-question shared factory because food
// planning has 5 non-overlapping axes: service philosophy, cuisine mix,
// dietary landscape, bar posture, and memory target. Each seeds a different
// slice of the menu brief. This schema keeps them as separate questions so
// the quiz review can show them as five distinct preview rows.

import type {
  ChipOption,
  ImageOption,
  QuizPreviewItem,
  QuizSchema,
} from "@/types/quiz";
import { useVisionStore } from "@/stores/vision-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

// ── Option tables (single source of labels) ───────────────────────────────

const PHILOSOPHY_OPTIONS: ImageOption[] = [
  {
    value: "buffet-grand",
    label: "Grand buffet — abundance is love",
    image_url:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=640&q=70",
  },
  {
    value: "plated-curated",
    label: "Curated plated dinner",
    image_url:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=640&q=70",
  },
  {
    value: "family-style",
    label: "Family-style sharing",
    image_url:
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=640&q=70",
  },
  {
    value: "stations-interactive",
    label: "Live stations & street food",
    image_url:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=70",
  },
  {
    value: "mixed",
    label: "Mix — different style per event",
    image_url:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=640&q=70",
  },
];

const CUISINE_OPTIONS: ChipOption[] = [
  { value: "north-indian", label: "North Indian" },
  { value: "south-indian", label: "South Indian" },
  { value: "gujarati-rajasthani", label: "Gujarati / Rajasthani" },
  { value: "bengali", label: "Bengali" },
  { value: "indo-chinese", label: "Indo-Chinese / Fusion" },
  { value: "global-stations", label: "Global (Italian / Japanese / Mexican)" },
  { value: "street-food", label: "Regional street food" },
  { value: "continental", label: "Continental / Western" },
];

const DIET_OPTIONS: ChipOption[] = [
  { value: "diet-veg-dominant", label: "Mostly vegetarian guest list" },
  { value: "diet-mixed", label: "About 50/50 veg & non-veg" },
  {
    value: "diet-nonveg-dominant",
    label: "Mostly non-veg with some veg options",
  },
  {
    value: "diet-complex",
    label: "Significant Jain, vegan, or allergy needs",
  },
];

const BAR_OPTIONS: ChipOption[] = [
  { value: "bar-open-full", label: "Full open bar" },
  { value: "bar-beer-wine", label: "Beer & wine only" },
  { value: "bar-signature", label: "Signature cocktails + beer & wine" },
  { value: "bar-dry", label: "Dry wedding — no alcohol" },
  { value: "bar-selective", label: "Selective — some events only" },
  { value: "bar-byob", label: "BYOB" },
];

const MEMORY_OPTIONS: ChipOption[] = [
  {
    value: "memory-abundance",
    label: "\"I can't believe how much food there was\"",
  },
  {
    value: "memory-standout",
    label: "\"That dish was the best I've ever had\"",
  },
  {
    value: "memory-presentation",
    label: "\"The presentation was as beautiful as the taste\"",
  },
  {
    value: "memory-personal",
    label: "\"It felt personal — like their family made it\"",
  },
  {
    value: "memory-experience",
    label: "\"The live stations were an experience\"",
  },
];

// ── Label resolvers ───────────────────────────────────────────────────────

function labelFor(options: readonly { value: string; label: string }[], v: string): string {
  return options.find((o) => o.value === v)?.label ?? v;
}

// ── Schema ────────────────────────────────────────────────────────────────

export const cateringVisionQuiz: QuizSchema = {
  id: "catering:vision:v1",
  version: "1",
  category: "catering",
  subsection: "vision",
  title: "Food philosophy in 5 quick picks",
  intro:
    "Food is the thing your guests will remember most. Tell us how you want to feed them across every event and we'll seed your menu brief, moodboard, and dietary guardrails.",
  estimated_minutes: 3,
  questions: [
    {
      id: "food_philosophy",
      prompt: "What's the food philosophy of your wedding?",
      helper: "Pick the one that's closest — we can tune per event later.",
      input: {
        type: "image_grid",
        min: 1,
        max: 1,
        options: PHILOSOPHY_OPTIONS,
      },
    },
    {
      id: "cuisine",
      prompt: "Cuisine direction",
      helper:
        "Indian weddings often span multiple cuisines across events. Pick every cuisine you want on the table.",
      input: {
        type: "multi_select",
        min: 1,
        max: 6,
        options: CUISINE_OPTIONS,
      },
    },
    {
      id: "diet",
      prompt: "What's your dietary landscape?",
      helper:
        "The single most important question for menu design. We'll use it to check menu coverage and flag gaps.",
      input: {
        type: "single_select",
        options: DIET_OPTIONS,
      },
    },
    {
      id: "bar",
      prompt: "Bar & beverages",
      helper: "Often bundled with catering — set the posture now.",
      input: {
        type: "single_select",
        options: BAR_OPTIONS,
      },
    },
    {
      id: "memory",
      prompt: "What should guests remember about the food?",
      helper: "The emotional target — shapes whether we push abundance, craft, or theatre.",
      input: {
        type: "single_select",
        options: MEMORY_OPTIONS,
      },
    },
  ],

  preview: (answers) => {
    const items: QuizPreviewItem[] = [];

    const philoA = answers.food_philosophy;
    if (philoA && philoA.kind === "images" && philoA.values.length > 0) {
      items.push({
        fieldKey: "food_philosophy",
        label: "Food philosophy",
        value: labelFor(PHILOSOPHY_OPTIONS, philoA.values[0]!),
        editable: true,
      });
      items.push({
        fieldKey: "moodboard_pins",
        label: "Moodboard pin",
        value: [labelFor(PHILOSOPHY_OPTIONS, philoA.values[0]!)],
        editable: false,
      });
    }

    const cuisineA = answers.cuisine;
    if (cuisineA && cuisineA.kind === "multi" && cuisineA.values.length > 0) {
      items.push({
        fieldKey: "cuisine",
        label: "Cuisine direction",
        value: cuisineA.values.map((v) => labelFor(CUISINE_OPTIONS, v)),
        editable: true,
      });
    }

    const dietA = answers.diet;
    if (dietA && dietA.kind === "single") {
      items.push({
        fieldKey: "diet",
        label: "Dietary landscape",
        value: labelFor(DIET_OPTIONS, dietA.value),
        editable: true,
      });
    }

    const barA = answers.bar;
    if (barA && barA.kind === "single") {
      items.push({
        fieldKey: "bar",
        label: "Bar & beverages",
        value: labelFor(BAR_OPTIONS, barA.value),
        editable: true,
      });
    }

    const memoryA = answers.memory;
    if (memoryA && memoryA.kind === "single") {
      items.push({
        fieldKey: "memory",
        label: "Memory target",
        value: labelFor(MEMORY_OPTIONS, memoryA.value),
        editable: true,
      });
    }

    return items;
  },

  apply: (answers, edited, ctx) => {
    const vision = useVisionStore.getState();
    const workspace = useWorkspaceStore.getState();
    const byKey = new Map(edited.map((e) => [e.fieldKey, e]));

    // Style keywords = food philosophy + cuisine picks, stored as raw
    // option values so other surfaces can match tokens instead of labels.
    const keywords: string[] = [];
    const philoA = answers.food_philosophy;
    if (philoA && philoA.kind === "images") keywords.push(...philoA.values);
    const cuisineA = answers.cuisine;
    if (cuisineA && cuisineA.kind === "multi") keywords.push(...cuisineA.values);
    if (keywords.length > 0) {
      vision.setKeywords(ctx.categorySlug, keywords);
    }

    // Moodboard seed: pin the single food-philosophy hero image.
    if (byKey.has("moodboard_pins") && philoA && philoA.kind === "images") {
      for (const value of philoA.values) {
        const opt = PHILOSOPHY_OPTIONS.find((o) => o.value === value);
        if (!opt) continue;
        workspace.addMoodboardItem(ctx.categoryId, opt.image_url, opt.label);
      }
    }

    // Write each categorical answer as its own note so the menu team has
    // discrete brief lines rather than one paragraph blob.
    const writeNote = (fieldKey: string, label: string) => {
      const edit = byKey.get(fieldKey);
      if (!edit) return;
      const value = Array.isArray(edit.value)
        ? edit.value.join(", ")
        : edit.value;
      if (!value) return;
      workspace.addNote(ctx.categoryId, `${label}: ${value}`);
    };

    writeNote("food_philosophy", "Food philosophy");
    writeNote("cuisine", "Cuisine direction");
    writeNote("diet", "Dietary landscape");
    writeNote("bar", "Bar & beverages");
    writeNote("memory", "Memory target");
  },
};
