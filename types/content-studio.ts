// Content Studio types — Studio > Content Studio feature.
//
// A post-wedding content tool: uploaded photos are analysed (heuristically,
// for the localStorage-only build), grouped by event, and auto-assembled
// into share-ready packages (IG carousels, stories, FB albums, WhatsApp
// status sets, a public lookbook). Everything persists through
// `stores/content-studio-store.ts` against localStorage.
//
// When a backend is wired up the shape maps 1:1 to the Supabase tables
// sketched in the spec; for now `wedding_id` is omitted / nullable.

export type ContentEvent =
  | "getting_ready"
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "baraat"
  | "ceremony"
  | "reception"
  | "portraits"
  | "details"
  | "other";

export type ContentMoment =
  | "first_look"
  | "vows"
  | "pheras"
  | "dance"
  | "cake_cut"
  | "vidaai"
  | "candid"
  | "group_shot"
  | "detail_shot"
  | "entrance"
  | "speech"
  | "couple_portrait"
  | "family_portrait"
  | "bridal_party"
  | "getting_ready"
  | "food"
  | "decor"
  | "jewelry"
  | "outfit"
  | "other";

export type ContentEmotion =
  | "joyful"
  | "tender"
  | "dramatic"
  | "playful"
  | "emotional"
  | "serene"
  | "celebratory";

export type ContentSubject =
  | "bride"
  | "groom"
  | "couple"
  | "family"
  | "friends"
  | "bridal_party"
  | "details"
  | "venue"
  | "food";

export type ContentSource = "upload" | "gallery_import" | "engagement";

export interface ContentPhoto {
  id: string;
  // Thumbnail as data URI (resized client-side so it survives localStorage).
  // For the real build, `photo_url` would point to Supabase Storage.
  thumbnail_url: string;
  // Full-size URL lives only in memory during the session (object URL); it's
  // intentionally not persisted, since localStorage would blow up. After a
  // reload we fall back to the thumbnail.
  photo_url: string;
  width: number;
  height: number;
  file_name: string;
  file_size: number;

  // AI-generated metadata (populated by the analyser).
  ai_event: ContentEvent | null;
  ai_moment: ContentMoment | null;
  ai_quality_score: number;          // 0..1
  ai_emotion: ContentEmotion | null;
  ai_subjects: ContentSubject[];
  ai_description: string;
  ai_colors: string[];

  // Manual overrides.
  is_favorite: boolean;
  is_excluded: boolean;
  custom_caption: string;

  source: ContentSource;
  sort_order: number;
  created_at: string;
  analyzed_at: string | null;
}

export type PackageType =
  | "instagram_carousel"
  | "instagram_single"
  | "instagram_story_set"
  | "facebook_album"
  | "whatsapp_status"
  | "digital_lookbook"
  | "highlight_grid"
  | "announcement"
  | "thank_you_post"
  | "custom";

export type PackageAspect = "1:1" | "4:5" | "9:16" | "16:9" | "original";

export type PackageTheme =
  | "chronological"
  | "best_moments"
  | "emotional"
  | "detail_focused"
  | "family"
  | "couple_portraits"
  | "comprehensive"
  | "highlights"
  | "gratitude"
  | "announcement"
  | "custom";

export type PackageStatus = "draft" | "edited" | "exported" | "posted";

export type CaptionTone = "romantic" | "minimal" | "fun" | "cultural" | "emotional" | "custom";

export interface CaptionOptions {
  romantic: string;
  minimal: string;
  fun: string;
}

export interface ContentPackage {
  id: string;
  title: string;
  package_type: PackageType;
  photo_ids: string[];

  // Caption: the couple picks a tone or writes their own. When `tone ===
  // "custom"` we use `caption` verbatim; otherwise we render the matching
  // option from `caption_options` so changing tone doesn't wipe edits.
  caption: string;
  caption_tone: CaptionTone;
  caption_options: CaptionOptions;
  hashtags: string[];

  aspect_ratio: PackageAspect;
  ai_generated: boolean;
  ai_theme: PackageTheme;

  status: PackageStatus;
  max_photos: number;                // hard cap for this package's format

  created_at: string;
  updated_at: string;
}

export interface CaptionTemplate {
  slug: string;
  label: string;
  tone: Exclude<CaptionTone, "custom">;
  template_text: string;
  package_types: PackageType[];
  sort_order: number;
}

// Recipes describe how a package auto-assembles itself from the photo pool.
export interface PackageRecipe {
  type: PackageType;
  title: string;
  theme: PackageTheme;
  description: string;                // human-readable logic ("top 10 by quality")
  aspect_ratio: PackageAspect;
  max_photos: number;
  pickerSlug: string;                 // key into the picker registry
}

// Lookbook share token — stored on the wedding's studio root, not per-package.
export interface LookbookShare {
  token: string;
  title: string;
  subtitle: string;
  generated_at: string;
  // ordered event sections; each has an ordered list of photo ids
  sections: { event: ContentEvent; label: string; photo_ids: string[] }[];
}
