// ── Guest Experiences → Discover quiz ─────────────────────────────────────
// Custom 5-question quiz that captures the couple's guest-experience vision.
// Unlike the shared vision-mood factory, we don't seed a moodboard from
// images here — this workspace's moodboard lives on the Inspiration tab and
// is populated by loved reference-gallery pins.
//
// Apply writes to:
//   • useGuestExperiencesStore — brief text drafted from answers
//   • useVisionStore            — style keywords (for cross-tab chips)
//   • useWorkspaceStore         — a narrative Vision note

import type {
  QuizPreviewItem,
  QuizQuestion,
  QuizSchema,
} from "@/types/quiz";
import { useVisionStore } from "@/stores/vision-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useGuestExperiencesStore } from "@/stores/guest-experiences-store";

type FeelValue =
  | "most-fun-ever"
  | "elegant-tasteful"
  | "thought-of-everything"
  | "never-seen-anything-like-it"
  | "personal-intimate";

type InteractivityValue =
  | "immersive"
  | "curated"
  | "subtle"
  | "classic";

type MomentValue =
  | "arrival"
  | "cocktail"
  | "between_events"
  | "send_off"
  | "after_party"
  | "ceremony";

type TakeawayValue = "works" | "one-meaningful" | "memories-only";

const FEEL_OPTIONS: { value: FeelValue; label: string }[] = [
  { value: "most-fun-ever", label: "That was the most fun I've ever had" },
  { value: "elegant-tasteful", label: "It was so elegant and tasteful" },
  { value: "thought-of-everything", label: "They thought of everything" },
  {
    value: "never-seen-anything-like-it",
    label: "I've never seen anything like that before",
  },
  { value: "personal-intimate", label: "It felt so personal and intimate" },
];

const INTERACTIVITY_OPTIONS: { value: InteractivityValue; label: string }[] = [
  {
    value: "immersive",
    label: "Guests are part of the show — games, booths, stations everywhere",
  },
  { value: "curated", label: "A few curated surprises at key moments" },
  { value: "subtle", label: "Subtle touches they'll notice and appreciate" },
  { value: "classic", label: "We'd rather keep it classic — no extras needed" },
];

const MOMENT_OPTIONS: { value: MomentValue; label: string }[] = [
  { value: "arrival", label: "Arrival / entrance" },
  { value: "cocktail", label: "Cocktail hour" },
  { value: "between_events", label: "Between events" },
  { value: "send_off", label: "Send-off / exit" },
  { value: "after_party", label: "Late-night after-party" },
  { value: "ceremony", label: "During the ceremony itself" },
];

const TAKEAWAY_OPTIONS: { value: TakeawayValue; label: string }[] = [
  {
    value: "works",
    label: "Yes — personalized keepsakes, bags, prints, the works",
  },
  { value: "one-meaningful", label: "Maybe one meaningful thing" },
  { value: "memories-only", label: "The memories are enough" },
];

const QUESTIONS: QuizQuestion[] = [
  {
    id: "feel",
    prompt:
      "When guests walk away from your wedding, what do you want them to say?",
    helper: "Pick the one that rings truest.",
    input: { type: "single_select", options: FEEL_OPTIONS },
  },
  {
    id: "interactivity",
    prompt: "How interactive do you want the experience to be?",
    input: { type: "single_select", options: INTERACTIVITY_OPTIONS },
  },
  {
    id: "moments",
    prompt: "Which transition moments do you want to make special?",
    helper: "Pick any that matter to you.",
    input: {
      type: "multi_select",
      options: MOMENT_OPTIONS,
      min: 0,
      max: MOMENT_OPTIONS.length,
    },
  },
  {
    id: "takeaway",
    prompt: "Should guests leave with something in their hands?",
    input: { type: "single_select", options: TAKEAWAY_OPTIONS },
  },
  {
    id: "wow",
    prompt:
      "Is there a 'moment' you've seen at another wedding or on social media that you can't stop thinking about?",
    helper: "Free-form — we'll use it to suggest experiences that fit.",
    optional: true,
    input: {
      type: "long_text",
      placeholder:
        "e.g. the 360° booth at my cousin's sangeet, a chaat cart on the terrace at cocktail hour…",
    },
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function styleKeywordsFor(
  feel: FeelValue | undefined,
  interactivity: InteractivityValue | undefined,
  takeaway: TakeawayValue | undefined,
): string[] {
  const out: string[] = [];
  if (feel === "most-fun-ever") out.push("high-energy", "playful");
  if (feel === "elegant-tasteful") out.push("elegant", "refined");
  if (feel === "thought-of-everything") out.push("considered", "hospitable");
  if (feel === "never-seen-anything-like-it") out.push("cinematic", "inventive");
  if (feel === "personal-intimate") out.push("personal", "intimate");
  if (interactivity === "immersive") out.push("immersive");
  if (interactivity === "curated") out.push("curated");
  if (interactivity === "subtle") out.push("understated");
  if (takeaway === "works") out.push("generous-gifting");
  return Array.from(new Set(out));
}

function briefFor(
  feel: FeelValue | undefined,
  interactivity: InteractivityValue | undefined,
  moments: MomentValue[],
  takeaway: TakeawayValue | undefined,
  wow: string,
): string {
  const feelSentence: Record<FeelValue, string> = {
    "most-fun-ever":
      "We want guests leaving saying this was the most fun they've ever had.",
    "elegant-tasteful":
      "Elegance and taste are the watchwords — every touch should feel refined.",
    "thought-of-everything":
      "Hospitality is the north star — guests should feel we thought of everything.",
    "never-seen-anything-like-it":
      "We want moments people have genuinely never seen before.",
    "personal-intimate":
      "The tone is personal and intimate — small, surprising touches over spectacle.",
  };
  const interactivitySentence: Record<InteractivityValue, string> = {
    immersive:
      "Guests should be part of the show — interactive stations and booths throughout.",
    curated:
      "A few curated surprises land at key moments rather than being everywhere.",
    subtle:
      "Extras stay subtle — the kind of thing guests notice only if they're looking.",
    classic:
      "We'd rather keep it classic — not many extras needed beyond the core events.",
  };
  const takeawaySentence: Record<TakeawayValue, string> = {
    works:
      "Guests leave with something in their hands — keepsakes, bags, prints.",
    "one-meaningful": "One meaningful keepsake is enough.",
    "memories-only": "The memories are the takeaway — no favors needed.",
  };
  const momentLabels = moments
    .map((m) => MOMENT_OPTIONS.find((o) => o.value === m)?.label ?? m)
    .join(", ");
  const momentSentence = momentLabels
    ? `We're especially focused on making these moments special: ${momentLabels.toLowerCase()}.`
    : "";
  const wowSentence = wow.trim()
    ? `Something we can't stop thinking about: ${wow.trim()}`
    : "";

  return [
    feel && feelSentence[feel],
    interactivity && interactivitySentence[interactivity],
    momentSentence,
    takeaway && takeawaySentence[takeaway],
    wowSentence,
  ]
    .filter(Boolean)
    .join(" ");
}

// ── Schema ─────────────────────────────────────────────────────────────────

export const guestExperiencesVisionQuiz: QuizSchema = {
  id: "guest_experiences:vision:v1",
  version: "1",
  category: "guest_experiences",
  subsection: "vision",
  title: "What kind of experience do you want to create?",
  intro:
    "Five short questions about how the wedding should *feel* for guests. We'll draft your experience brief and seed ideas worth exploring.",
  estimated_minutes: 3,
  questions: QUESTIONS,

  preview: (answers) => {
    const items: QuizPreviewItem[] = [];

    const feel = answers.feel;
    if (feel && feel.kind === "single") {
      const opt = FEEL_OPTIONS.find((o) => o.value === feel.value);
      items.push({
        fieldKey: "feel",
        label: "The headline feeling",
        value: opt?.label ?? feel.value,
        editable: false,
      });
    }

    const inter = answers.interactivity;
    if (inter && inter.kind === "single") {
      const opt = INTERACTIVITY_OPTIONS.find((o) => o.value === inter.value);
      items.push({
        fieldKey: "interactivity",
        label: "Interaction level",
        value: opt?.label ?? inter.value,
        editable: false,
      });
    }

    const moments = answers.moments;
    if (moments && moments.kind === "multi" && moments.values.length > 0) {
      const labels = moments.values.map(
        (v) => MOMENT_OPTIONS.find((o) => o.value === v)?.label ?? v,
      );
      items.push({
        fieldKey: "moments",
        label: "Moments that matter",
        value: labels,
        editable: true,
      });
    }

    const takeaway = answers.takeaway;
    if (takeaway && takeaway.kind === "single") {
      const opt = TAKEAWAY_OPTIONS.find((o) => o.value === takeaway.value);
      items.push({
        fieldKey: "takeaway",
        label: "Takeaway factor",
        value: opt?.label ?? takeaway.value,
        editable: false,
      });
    }

    const wow = answers.wow;
    if (wow && wow.kind === "text" && wow.value.trim()) {
      items.push({
        fieldKey: "wow",
        label: "Can't stop thinking about",
        value: wow.value.trim(),
        editable: true,
      });
    }

    // Derived brief row — editable so couples can tweak before it's saved.
    const feelV = feel && feel.kind === "single" ? (feel.value as FeelValue) : undefined;
    const interV =
      inter && inter.kind === "single"
        ? (inter.value as InteractivityValue)
        : undefined;
    const momV =
      moments && moments.kind === "multi"
        ? (moments.values as MomentValue[])
        : [];
    const takeV =
      takeaway && takeaway.kind === "single"
        ? (takeaway.value as TakeawayValue)
        : undefined;
    const wowV = wow && wow.kind === "text" ? wow.value : "";
    items.push({
      fieldKey: "brief",
      label: "Your Experience Brief",
      value: briefFor(feelV, interV, momV, takeV, wowV),
      editable: true,
    });

    return items;
  },

  apply: (answers, edited, ctx) => {
    const workspace = useWorkspaceStore.getState();
    const vision = useVisionStore.getState();
    const guest = useGuestExperiencesStore.getState();

    const byKey = new Map(edited.map((e) => [e.fieldKey, e]));

    const feelA = answers.feel;
    const interA = answers.interactivity;
    const takeA = answers.takeaway;

    const feelV =
      feelA && feelA.kind === "single" ? (feelA.value as FeelValue) : undefined;
    const interV =
      interA && interA.kind === "single"
        ? (interA.value as InteractivityValue)
        : undefined;
    const takeV =
      takeA && takeA.kind === "single"
        ? (takeA.value as TakeawayValue)
        : undefined;

    // Style keywords inferred from the vibe answers.
    const keywords = styleKeywordsFor(feelV, interV, takeV);
    if (keywords.length > 0) {
      vision.setKeywords(ctx.categorySlug, keywords);
    }

    // Brief → store (couples edit it on the Shortlist tab). Fall back to the
    // generated narrative if they didn't edit it in the review step.
    const briefEdit = byKey.get("brief");
    const briefText =
      briefEdit && typeof briefEdit.value === "string"
        ? briefEdit.value
        : "";
    if (briefText.trim()) {
      guest.setBrief(briefText.trim());
    }

    // Drop a workspace Vision note so the generic Vision tab (if anyone
    // ever renders it) picks it up too.
    if (briefText.trim()) {
      workspace.addNote(ctx.categoryId, `Experience brief: ${briefText.trim()}`);
    }
  },
};
