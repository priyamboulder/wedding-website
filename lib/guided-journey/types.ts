// Shared types for the guided journey framework.
// One framework powers every vendor category. Each category declares its
// sessions + fields declaratively; the renderer turns the schema into
// keyword pickers, sliders, brief textareas, etc.

export type GuidedSessionStatus = "not_started" | "in_progress" | "completed";

export type GuidedMode = "guided" | "manual";

export type CategoryKey =
  | "photography"
  | "videography"
  | "catering"
  | "decor"
  | "music"
  | "hmua"
  | "mehendi"
  | "priest"
  | "stationery"
  | "venue"
  | "wardrobe"
  | "jewelry"
  | "cake_sweets"
  | "transportation"
  | "travel"
  | "gifting"
  | "guest_experiences";

// ─── Field schema (declarative form definition) ──────────────────────────
// Each session body is a list of fields. Field kind drives which input
// renderer is used and how the value is shaped inside form_data.

export type FieldKind =
  | "keyword_chips"
  | "intensity_slider"
  | "single_select"
  | "multi_select"
  | "color_palette"
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "image_list"
  | "list_text"
  | "list_object"
  | "brief";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldBase {
  // Path inside form_data this field reads/writes. Dot notation: "colour_palette.primary".
  path: string;
  label: string;
  // Italic helper line shown under the label.
  helper?: string;
}

export interface KeywordChipsField extends FieldBase {
  kind: "keyword_chips";
  suggestions: string[];
  // Allow typing custom keywords (saved into a sibling path: `${path}_custom`).
  allowCustom?: boolean;
}

export interface IntensitySliderField extends FieldBase {
  kind: "intensity_slider";
  lowLabel: string;
  highLabel: string;
  // Rendered above the slider as a derived word (e.g. "Warm Documentary").
  toneWords?: string[]; // 3 words: low / mid / high
  default?: number;
}

export interface SingleSelectField extends FieldBase {
  kind: "single_select";
  options: SelectOption[];
}

export interface MultiSelectField extends FieldBase {
  kind: "multi_select";
  options: SelectOption[];
}

export interface ColorPaletteField extends FieldBase {
  kind: "color_palette";
  // Sub-buckets: each rendered as its own row of swatches.
  buckets: Array<{ key: string; label: string }>;
}

export interface TextField extends FieldBase {
  kind: "text";
  placeholder?: string;
}

export interface TextareaField extends FieldBase {
  kind: "textarea";
  placeholder?: string;
  rows?: number;
}

export interface NumberField extends FieldBase {
  kind: "number";
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface BooleanField extends FieldBase {
  kind: "boolean";
}

export interface ImageListField extends FieldBase {
  kind: "image_list";
  // Optional categorical tags surfaced as a tag picker per item.
  tagOptions?: string[];
  // Allow per-item event tagging (uses category-wide event roster).
  perEventTag?: boolean;
}

export interface ListTextField extends FieldBase {
  kind: "list_text";
  placeholder?: string;
  // When true, items get a priority pill toggle (must_have | nice_to_have).
  priorityToggle?: boolean;
}

export interface ListObjectField extends FieldBase {
  kind: "list_object";
  // Each item edits a small subform of these subfields.
  // Subfield path is RELATIVE to the item.
  itemFields: Array<
    | KeywordChipsField
    | SingleSelectField
    | MultiSelectField
    | TextField
    | TextareaField
    | NumberField
    | BooleanField
    | ListTextField
  >;
  // Field path on each item that becomes the row label.
  titleField?: string;
  // Optional preset rows (e.g., one row per event) seeded on first render.
  presetRows?: Array<Record<string, unknown>>;
}

export interface BriefField extends FieldBase {
  kind: "brief";
  // Paths to read for the auto-draft helper. The first one in the list with
  // text content is used; the rest are summarised as bullet cues.
  draftCues?: string[];
}

export type Field =
  | KeywordChipsField
  | IntensitySliderField
  | SingleSelectField
  | MultiSelectField
  | ColorPaletteField
  | TextField
  | TextareaField
  | NumberField
  | BooleanField
  | ImageListField
  | ListTextField
  | ListObjectField
  | BriefField;

// ─── Session schema ──────────────────────────────────────────────────────
export interface SessionSchema {
  key: string;
  index: number; // 1-based within its category
  fields: Field[];
}

export interface CategorySchema {
  category: CategoryKey;
  sessions: SessionSchema[];
}

// ─── Runtime session shape ──────────────────────────────────────────────
export interface RuntimeSession {
  key: string;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  status: GuidedSessionStatus;
  hasData: boolean;
  summary: string | null;
  fields: Field[];
  isBrief: boolean;
}

// ─── Persisted state shape ──────────────────────────────────────────────
// One blob per category, keyed in localStorage by `marigold:guided:<category>`.
export interface CategoryJourneyState {
  mode: GuidedMode;
  // Map of session_key → form_data (any shape, defined by schema).
  formData: Record<string, Record<string, unknown>>;
  sessionStatus: Record<string, GuidedSessionStatus>;
  sessionCompletedAt: Record<string, number>;
  dismissedNudgeKeys: string[];
}
