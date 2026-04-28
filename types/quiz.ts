// ── Quiz onboarding types ─────────────────────────────────────────────────
// A quiz schema describes a short (3–8 question) onboarding flow for one
// vendor subsection. Its purpose is to reduce the cold-start tax: collect
// targeted answers, then pre-fill the section's structured fields.
//
// Schemas live in code (`lib/quiz/schemas/*.ts`) — typed, editable, and
// close to the apply() logic that knows how to write into the right stores.

import type { WorkspaceCategorySlug, WorkspaceRole } from "./workspace";

// ── Inputs ────────────────────────────────────────────────────────────────

export interface ChipOption {
  value: string;
  label: string;
}

export interface ImageOption {
  value: string;
  label: string;
  image_url: string;
}

export type QuizInput =
  | { type: "single_select"; options: ChipOption[] }
  | {
      type: "multi_select";
      options: ChipOption[];
      min?: number;
      max?: number;
    }
  | { type: "short_text"; placeholder?: string }
  | {
      type: "long_text";
      placeholder?: string;
      // When present, the Runner will send the raw text to
      // /api/quiz/extract before the Review step. On failure (or when no
      // API key is set) the raw text is preserved and the extracted
      // result is left undefined — apply() must handle that case.
      extraction?: ExtractionSpec;
    }
  | {
      type: "number_slider";
      min: number;
      max: number;
      step: number;
      minLabel?: string;
      maxLabel?: string;
      defaultValue?: number;
    }
  | {
      type: "image_grid";
      options: ImageOption[];
      min?: number;
      max?: number;
    };

export interface ExtractionSpec {
  // A plain-English description of the target JSON shape. The API route
  // builds a system prompt from this and the question prompt. Keep it
  // small (under ~200 tokens) — Haiku is sensitive to noise.
  targetShape: string;
  // Example of a well-formed response. Helps the model lock onto the
  // format. Optional but recommended.
  example?: unknown;
}

// ── Questions ─────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  prompt: string;
  helper?: string;
  optional?: boolean;
  input: QuizInput;
}

// ── Answers (runner → schema) ─────────────────────────────────────────────
// All inputs collapse into one of these answer shapes. Skipped questions
// store `{ skipped: true }` so apply() can short-circuit rather than
// writing empty strings.

export type QuizAnswer =
  | { kind: "single"; value: string }
  | { kind: "multi"; values: string[] }
  | { kind: "text"; value: string; extracted?: unknown }
  | { kind: "number"; value: number }
  | { kind: "images"; values: string[] }
  | { kind: "skipped" };

export type QuizAnswerMap = Record<string, QuizAnswer>;

// ── Review preview ────────────────────────────────────────────────────────

export interface QuizPreviewItem {
  // Stable key for this preview row — used by the Review screen for
  // inline editing and by the completion record to track which fields
  // were written by the quiz.
  fieldKey: string;
  label: string;
  // Rendered summary of what will be written. Array form is treated as a
  // chip list; string form is rendered as a single block.
  value: string | string[];
  // When false, the Review row is shown read-only (e.g. a status flag
  // that's computed rather than user-editable).
  editable?: boolean;
}

// ── Schema ────────────────────────────────────────────────────────────────

export interface QuizContext {
  // category_id is the per-wedding UUID-ish id used by the workspace
  // stores. Slug is the stable category key.
  categoryId: string;
  categorySlug: WorkspaceCategorySlug;
  subsection: string;
  role: WorkspaceRole;
}

export interface QuizSchema {
  // Stable id — used as the telemetry quiz id and as the key for
  // completion records. Format: "photography:vision_mood:v1".
  id: string;
  version: string;
  category: WorkspaceCategorySlug;
  subsection: string;
  title: string;
  intro: string;
  estimated_minutes: number;
  questions: QuizQuestion[];
  // Resolve raw answers → review rows. Runs after extraction so
  // preview() can assume any long_text answer has its `extracted`
  // slot filled (when available).
  preview: (answers: QuizAnswerMap, ctx: QuizContext) => QuizPreviewItem[];
  // Write the confirmed review rows into the real stores. The second
  // arg is the (possibly-edited) preview items from the Review screen,
  // which may differ from `preview(answers)` if the user inline-edited.
  apply: (
    answers: QuizAnswerMap,
    edited: QuizPreviewItem[],
    ctx: QuizContext,
  ) => void;
}

// ── Completion record (stored in quiz-store) ──────────────────────────────

export interface QuizTakenBy {
  role: WorkspaceRole;
  name: string;
}

export interface QuizCompletion {
  // "{slug}:{subsection}" — one completion per subsection per wedding.
  key: string;
  category: WorkspaceCategorySlug;
  subsection: string;
  quiz_id: string;
  quiz_version: string;
  quiz_answers: QuizAnswerMap;
  quiz_completed_at: string;
  quiz_taken_by: QuizTakenBy;
  // Field keys the user has edited in the section UI after the quiz
  // wrote them. On retake we refuse to overwrite these without a
  // confirm.
  manually_edited_fields: string[];
  // True when a planner took the quiz on the couple's behalf. The
  // section shows a "Planner draft — confirm with couple" badge
  // until a couple role opens the section.
  planner_draft: boolean;
}

// ── Telemetry events ──────────────────────────────────────────────────────

export type QuizTelemetryEvent =
  | "quiz_started"
  | "quiz_abandoned"
  | "quiz_completed"
  | "quiz_applied"
  | "quiz_retaken";
