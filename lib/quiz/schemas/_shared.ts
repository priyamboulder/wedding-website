// ── Shared helpers for vision-mood quizzes ─────────────────────────────────
// Every non-Photography Vision tab quiz follows the same three-beat shape:
//   1. Pick style words (multi-select chips)   → style_keywords
//   2. Pick moodboard tiles (image grid)       → seeded moodboard pins
//   3. Position on a scale (number slider)     → tone note (workspace note)
//   4. Optional: free-form "avoid" long_text   → extracted list → note
//
// Instead of duplicating preview/apply across a dozen schemas, this file
// exposes a `createVisionMoodQuiz` factory that returns a fully-formed
// QuizSchema. Each category declares its content (prompts, options, tone
// labels) and gets a consistent apply() that writes into the vision +
// workspace stores.

import type {
  QuizAnswerMap,
  QuizPreviewItem,
  QuizSchema,
  QuizQuestion,
  ImageOption,
  ChipOption,
} from "@/types/quiz";
import type { WorkspaceCategorySlug } from "@/types/workspace";
import { useVisionStore } from "@/stores/vision-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export interface VisionMoodQuizConfig {
  // Category + id
  category: WorkspaceCategorySlug;
  id: string;
  version: string;
  // Headline copy
  title: string;
  intro: string;
  estimatedMinutes: number;
  // Question content
  stylePrompt: string;
  styleHelper?: string;
  styleOptions: ChipOption[];
  stylePickMin?: number;
  stylePickMax?: number;
  // Moodboard
  moodPrompt: string;
  moodHelper?: string;
  moodOptions: ImageOption[];
  moodPickMin?: number;
  moodPickMax?: number;
  // Scale slider
  scalePrompt: string;
  scaleHelper?: string;
  scaleMin: number;
  scaleMax: number;
  scaleStep: number;
  scaleDefault: number;
  scaleMinLabel: string;
  scaleMaxLabel: string;
  // Map snapped scale positions (0..100 or whatever) → tone-descriptor.
  // Keys must be numeric milestones (e.g. 0, 25, 50, 75, 100).
  scaleDescriptors: Record<number, string>;
  // Prefix used when a scale position becomes a note, e.g. "Tone direction"
  scaleNoteLabel: string;
  // Optional avoid question (long_text). When omitted, the 4th question is
  // skipped entirely.
  avoidPrompt?: string;
  avoidHelper?: string;
  avoidPlaceholder?: string;
  avoidNoteLabel?: string; // defaults to "Must avoid"
  // Subject heading for the moodboard preview row: "Moodboard pins (2)" →
  // this is the "Moodboard pins" part.
  moodboardPreviewLabel?: string;
}

export function createVisionMoodQuiz(cfg: VisionMoodQuizConfig): QuizSchema {
  const moodboardPreviewLabel = cfg.moodboardPreviewLabel ?? "Moodboard pins";
  const avoidNoteLabel = cfg.avoidNoteLabel ?? "Must avoid";

  const questions: QuizQuestion[] = [
    {
      id: "style_words",
      prompt: cfg.stylePrompt,
      helper: cfg.styleHelper ?? "Pick a few — we'll save them as style keywords.",
      input: {
        type: "multi_select",
        min: cfg.stylePickMin ?? 1,
        max: cfg.stylePickMax ?? 3,
        options: cfg.styleOptions,
      },
    },
    {
      id: "moodboard",
      prompt: cfg.moodPrompt,
      helper:
        cfg.moodHelper ?? "Pick a few — we'll pin them to your moodboard as starters.",
      input: {
        type: "image_grid",
        min: cfg.moodPickMin ?? 1,
        max: cfg.moodPickMax ?? 4,
        options: cfg.moodOptions,
      },
    },
    {
      id: "scale",
      prompt: cfg.scalePrompt,
      helper: cfg.scaleHelper,
      input: {
        type: "number_slider",
        min: cfg.scaleMin,
        max: cfg.scaleMax,
        step: cfg.scaleStep,
        defaultValue: cfg.scaleDefault,
        minLabel: cfg.scaleMinLabel,
        maxLabel: cfg.scaleMaxLabel,
      },
    },
  ];

  if (cfg.avoidPrompt) {
    questions.push({
      id: "avoid",
      prompt: cfg.avoidPrompt,
      helper: cfg.avoidHelper,
      optional: true,
      input: {
        type: "long_text",
        placeholder: cfg.avoidPlaceholder,
        extraction: {
          targetShape:
            "An object with one field: `avoid_list` — an array of 1–5 short phrases (under 8 words each) naming specific things the couple wants to avoid.",
          example: {
            avoid_list: ["item one", "item two", "item three"],
          },
        },
      },
    });
  }

  function snappedDescriptor(v: number): string {
    const milestones = Object.keys(cfg.scaleDescriptors)
      .map(Number)
      .sort((a, b) => a - b);
    if (milestones.length === 0) return `${v}`;
    let best = milestones[0]!;
    for (const m of milestones) {
      if (Math.abs(m - v) < Math.abs(best - v)) best = m;
    }
    return `${v}/${cfg.scaleMax} — ${cfg.scaleDescriptors[best]}`;
  }

  return {
    id: cfg.id,
    version: cfg.version,
    category: cfg.category,
    subsection: "vision",
    title: cfg.title,
    intro: cfg.intro,
    estimated_minutes: cfg.estimatedMinutes,
    questions,

    preview: (answers) => {
      const items: QuizPreviewItem[] = [];

      const styleA = answers.style_words;
      if (styleA && styleA.kind === "multi" && styleA.values.length > 0) {
        const labelFor = (v: string) =>
          cfg.styleOptions.find((o) => o.value === v)?.label ?? v;
        items.push({
          fieldKey: "style_keywords",
          label: "Style keywords",
          value: styleA.values.map(labelFor),
          editable: true,
        });
      }

      const moodA = answers.moodboard;
      if (moodA && moodA.kind === "images" && moodA.values.length > 0) {
        const labels = moodA.values
          .map((v) => cfg.moodOptions.find((o) => o.value === v)?.label ?? v)
          .filter(Boolean);
        items.push({
          fieldKey: "moodboard_pins",
          label: `${moodboardPreviewLabel} (${moodA.values.length})`,
          value: labels,
          editable: false,
        });
      }

      const scaleA = answers.scale;
      if (scaleA && scaleA.kind === "number") {
        items.push({
          fieldKey: "scale_note",
          label: cfg.scaleNoteLabel,
          value: snappedDescriptor(scaleA.value),
          editable: true,
        });
      }

      const avoidA = answers.avoid;
      if (avoidA && avoidA.kind === "text" && avoidA.value.trim()) {
        const extracted = avoidA.extracted as
          | { avoid_list?: unknown }
          | undefined;
        const list =
          extracted && Array.isArray(extracted.avoid_list)
            ? (extracted.avoid_list.filter(
                (x): x is string => typeof x === "string",
              ) as string[])
            : null;
        items.push({
          fieldKey: "avoid_note",
          label: avoidNoteLabel,
          value: list && list.length > 0 ? list : avoidA.value.trim(),
          editable: true,
        });
      }

      return items;
    },

    apply: (answers, edited, ctx) => {
      const vision = useVisionStore.getState();
      const workspace = useWorkspaceStore.getState();
      const byKey = new Map(edited.map((e) => [e.fieldKey, e]));

      // Style keywords → vision-store (stored as option values so the
      // chips match what the Studio surfaces, not the human label).
      const styleA = answers.style_words;
      if (byKey.has("style_keywords") && styleA && styleA.kind === "multi") {
        vision.setKeywords(ctx.categorySlug, styleA.values);
      }

      // Moodboard pins → workspace-store (one pin per chosen image).
      const moodA = answers.moodboard;
      if (byKey.has("moodboard_pins") && moodA && moodA.kind === "images") {
        for (const value of moodA.values) {
          const opt = cfg.moodOptions.find((o) => o.value === value);
          if (!opt) continue;
          workspace.addMoodboardItem(ctx.categoryId, opt.image_url, opt.label);
        }
      }

      // Scale note → workspace note tagged with the scale label.
      const scaleEdit = byKey.get("scale_note");
      if (scaleEdit && typeof scaleEdit.value === "string") {
        workspace.addNote(
          ctx.categoryId,
          `${cfg.scaleNoteLabel}: ${scaleEdit.value}`,
        );
      }

      // Must-avoid → one note in workspace Notes.
      const avoidEdit = byKey.get("avoid_note");
      if (avoidEdit) {
        const body = Array.isArray(avoidEdit.value)
          ? `${avoidNoteLabel}: ${avoidEdit.value.join(", ")}`
          : `${avoidNoteLabel}: ${String(avoidEdit.value)}`;
        workspace.addNote(ctx.categoryId, body);
      }
    },
  };
}
