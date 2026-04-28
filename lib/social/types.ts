// Social Media Content Generator — type definitions.
// All IDs are strings (UUIDs generated client-side via crypto.randomUUID()).
// Timestamps are ISO 8601 strings.

export type Platform =
  | "instagram_post"
  | "instagram_reel"
  | "instagram_story"
  | "facebook"
  | "linkedin"
  | "pinterest"
  | "twitter";

export type ContentType =
  | "wedding"
  | "engagement"
  | "behind_the_scenes"
  | "testimonial"
  | "portfolio_highlight"
  | "tip_or_advice"
  | "promotion"
  | "announcement"
  | "festival_or_seasonal";

export type PostStatus = "draft" | "approved" | "scheduled" | "published";

export type Tone =
  | "romantic"
  | "professional"
  | "playful"
  | "cinematic"
  | "minimal"
  | "storytelling"
  | "bold";

export type ReelTemplateCategory =
  | "showcase"
  | "testimonial"
  | "behind_the_scenes"
  | "announcement"
  | "tips"
  | "intro";

export type SlideTransition =
  | "fade"
  | "slide_left"
  | "slide_right"
  | "zoom"
  | "dissolve"
  | "none";

export type TextAnimation =
  | "fade_up"
  | "fade_in"
  | "slide_in_left"
  | "slide_in_right"
  | "typewriter"
  | "none";

export type TextPosition =
  | "top_center"
  | "center"
  | "bottom_center"
  | "bottom_left"
  | "bottom_right";

export type TextStyle =
  | "elegant_serif"
  | "modern_sans"
  | "bold_impact"
  | "handwritten"
  | "minimal";

export type ReelStatus =
  | "draft"
  | "preview_ready"
  | "rendering"
  | "rendered"
  | "published";

export type BrandColors = {
  primary: string;
  secondary: string;
  accent: string;
};

export type VendorSocialProfile = {
  id: string;
  vendor_id: string;
  brand_voice: string;
  target_audience: string;
  default_hashtags: string[];
  instagram_handle: string;
  preferred_platforms: Platform[];
  brand_colors: BrandColors;
  logo_url: string;
  created_at: string;
  updated_at: string;
};

export type SocialContentItem = {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  content_type: ContentType;
  media_urls: string[];
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type GeneratedPost = {
  id: string;
  vendor_id: string;
  content_item_id: string;
  platform: Platform;
  caption: string;
  hashtags: string[];
  call_to_action: string;
  tone: Tone;
  status: PostStatus;
  scheduled_for: string | null;
  generation_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type TextOverlay = {
  content_key: string;
  position: TextPosition;
  style: TextStyle;
  animation: TextAnimation;
};

export type KenBurns = {
  direction: "zoom_in" | "zoom_out" | "pan_left" | "pan_right";
  intensity: number;
};

export type SlideConfig = {
  id: string;
  type: "image" | "text" | "video";
  label: string;
  duration_ms: number;
  transition_in: SlideTransition;
  transition_out: SlideTransition;
  text_overlay?: TextOverlay;
  ken_burns?: KenBurns;
};

export type TemplateConfig = {
  aspect_ratio: "9:16";
  duration_ms: number;
  fps: number;
  music_mood: string;
  slides: SlideConfig[];
  color_scheme: "auto_from_brand" | "light" | "dark" | "custom";
  watermark_position: "bottom_right" | "bottom_left" | "top_right" | "none";
};

export type ReelTemplate = {
  id: string;
  name: string;
  description: string;
  category: ReelTemplateCategory;
  thumbnail_url: string;
  template_config: TemplateConfig;
  vendor_types: string[];
  is_premium: boolean;
  sort_order: number;
  created_at: string;
};

export type GeneratedReel = {
  id: string;
  vendor_id: string;
  content_item_id: string | null;
  template_id: string;
  reel_config: Record<string, any>;
  caption: string;
  hashtags: string[];
  status: ReelStatus;
  preview_url: string;
  render_url: string;
  created_at: string;
  updated_at: string;
};

export type PostStats = {
  total: number;
  drafts: number;
  approved: number;
  scheduled: number;
  published: number;
};
