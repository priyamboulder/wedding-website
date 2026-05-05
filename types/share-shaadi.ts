// ── types/share-shaadi.ts ───────────────────────────────────────────────────
// Shared types for the "Share Your Shaadi" submission flow under /share/*.
// Mirrors the wedding_submissions Supabase table (migration 0039).

export type SubmissionPath = "diy" | "ai_interview";

export type StorytellingAngle =
  | "timeline"
  | "people"
  | "details"
  | "unfiltered";

export type EventTag =
  | "ROKA"
  | "ENGAGEMENT"
  | "HALDI"
  | "MEHENDI"
  | "SANGEET"
  | "CEREMONY"
  | "RECEPTION"
  | "AFTER_PARTY"
  | "OTHER";

export const EVENT_TAG_LABEL: Record<EventTag, string> = {
  ROKA: "Roka",
  ENGAGEMENT: "Engagement",
  HALDI: "Haldi",
  MEHENDI: "Mehendi",
  SANGEET: "Sangeet",
  CEREMONY: "Ceremony",
  RECEPTION: "Reception",
  AFTER_PARTY: "After Party",
  OTHER: "Other",
};

export type FamilySide = "bride" | "groom" | "both";

export type BudgetRange =
  | "UNDER_50K"
  | "50_100K"
  | "100_200K"
  | "200_500K"
  | "500K_PLUS";

export const BUDGET_RANGE_LABEL: Record<BudgetRange, string> = {
  UNDER_50K: "Under $50K",
  "50_100K": "$50K – $100K",
  "100_200K": "$100K – $200K",
  "200_500K": "$200K – $500K",
  "500K_PLUS": "$500K+",
};

export type VendorCategory =
  | "PHOTOGRAPHY"
  | "VIDEOGRAPHY"
  | "DECOR"
  | "FLORALS"
  | "CATERING"
  | "MAKEUP"
  | "MEHENDI"
  | "MUSIC_DJ"
  | "VENUE"
  | "ATTIRE"
  | "JEWELRY"
  | "STATIONERY"
  | "PLANNER"
  | "OTHER";

export const VENDOR_CATEGORY_LABEL: Record<VendorCategory, string> = {
  PHOTOGRAPHY: "Photography",
  VIDEOGRAPHY: "Videography",
  DECOR: "Décor",
  FLORALS: "Florals",
  CATERING: "Catering",
  MAKEUP: "Hair & Makeup",
  MEHENDI: "Mehendi Artist",
  MUSIC_DJ: "Music / DJ",
  VENUE: "Venue",
  ATTIRE: "Attire / Designer",
  JEWELRY: "Jewelry",
  STATIONERY: "Stationery",
  PLANNER: "Planner",
  OTHER: "Other",
};

// ── Block types ─────────────────────────────────────────────────────────────

export type BlockType =
  | "photo_gallery"
  | "moment"
  | "vendor_shoutout"
  | "advice"
  | "numbers"
  | "family"
  | "playlist"
  | "outfit"
  | "freewrite"
  | "narrative"; // emitted by AI draft for plain narrative paragraphs

export interface BlockBase {
  id: string;
  type: BlockType;
}

export interface PhotoGalleryBlock extends BlockBase {
  type: "photo_gallery";
  eventTag: EventTag | null;
  photos: { url: string; caption?: string }[];
}

export interface MomentBlock extends BlockBase {
  type: "moment";
  photoUrl?: string;
  body: string;
  eventTag?: EventTag | null;
}

export interface VendorShoutoutBlock extends BlockBase {
  type: "vendor_shoutout";
  vendorName: string;
  category: VendorCategory;
  body: string;
  marketplaceVendorId?: string | null;
}

export interface AdviceBlock extends BlockBase {
  type: "advice";
  body: string;
}

export interface NumbersBlock extends BlockBase {
  type: "numbers";
  budgetRange?: BudgetRange | null;
  planningMonths?: number | null;
  outfitChanges?: number | null;
  vendorCount?: number | null;
}

export interface FamilyBlock extends BlockBase {
  type: "family";
  side: FamilySide;
  body: string;
}

export interface PlaylistBlock extends BlockBase {
  type: "playlist";
  songs: { title: string; artist: string; moment?: string }[];
}

export interface OutfitBlock extends BlockBase {
  type: "outfit";
  eventTag: EventTag | null;
  designer: string;
  description: string;
  photoUrl?: string;
}

export interface FreeWriteBlock extends BlockBase {
  type: "freewrite";
  body: string;
}

export interface NarrativeBlock extends BlockBase {
  type: "narrative";
  eventTag?: EventTag | null;
  body: string;
}

export type StoryBlock =
  | PhotoGalleryBlock
  | MomentBlock
  | VendorShoutoutBlock
  | AdviceBlock
  | NumbersBlock
  | FamilyBlock
  | PlaylistBlock
  | OutfitBlock
  | FreeWriteBlock
  | NarrativeBlock;

// ── Block metadata used by the picker UI ────────────────────────────────────

export interface BlockTypeMeta {
  type: BlockType;
  label: string;
  description: string;
  // Categories the angle picker uses to recommend blocks.
  recommendedFor: StorytellingAngle[];
}

export const BLOCK_TYPES: BlockTypeMeta[] = [
  {
    type: "photo_gallery",
    label: "Photo Gallery",
    description: "3–8 photos for one event or moment.",
    recommendedFor: ["timeline", "details"],
  },
  {
    type: "moment",
    label: "The Moment",
    description: "One hero photo + one paragraph.",
    recommendedFor: ["timeline", "details", "unfiltered"],
  },
  {
    type: "vendor_shoutout",
    label: "Vendor Shoutout",
    description: "The vendor who became a friend.",
    recommendedFor: ["people"],
  },
  {
    type: "advice",
    label: "What We'd Tell You",
    description: "A pull-quote of advice for future couples.",
    recommendedFor: ["unfiltered"],
  },
  {
    type: "numbers",
    label: "The Numbers",
    description: "Stats strip — budget, guests, outfit changes.",
    recommendedFor: ["details", "unfiltered"],
  },
  {
    type: "family",
    label: "Family",
    description: "How your families showed up.",
    recommendedFor: ["people"],
  },
  {
    type: "playlist",
    label: "Playlist",
    description: "What was playing across the events.",
    recommendedFor: ["people", "details"],
  },
  {
    type: "outfit",
    label: "The Outfit",
    description: "Designer, look, and the why.",
    recommendedFor: ["details"],
  },
  {
    type: "freewrite",
    label: "Free Write",
    description: "Open canvas — write whatever you want.",
    recommendedFor: ["unfiltered"],
  },
];

// ── Submission shape ────────────────────────────────────────────────────────

export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "revision_requested"
  | "published"
  | "archived";

export interface ShareSubmission {
  id: string;
  brideName: string;
  groomName: string;
  // Contact email is required at submit time so editors can follow up. Pre-
  // filled from the auth store when a user is signed in, but the /share flow
  // is fully public — anonymous couples enter their own email here.
  contactEmail: string;
  weddingMonth: string | null; // YYYY-MM
  venue: string;
  city: string;
  guestCount: number | null;
  events: EventTag[];
  hashtag: string;
  angle: StorytellingAngle | null;
  path: SubmissionPath;
  blocks: StoryBlock[];
  // AI interview state
  interviewTranscript: InterviewMessage[];
  aiDraft?: AIDraft | null;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewMessage {
  role: "assistant" | "user";
  content: string;
  // The assistant message that signals end-of-interview.
  isFinal?: boolean;
}

export interface AIDraft {
  headline: string;
  pullQuote: string;
  blocks: StoryBlock[];
}

// ── Angle metadata ──────────────────────────────────────────────────────────

export interface AngleMeta {
  id: StorytellingAngle;
  label: string;
  badge: string;
  subtitle: string;
  description: string;
  prompts: string[];
}

export const ANGLES: AngleMeta[] = [
  {
    id: "timeline",
    label: "The Timeline",
    badge: "CHRONOLOGICAL",
    subtitle: "Walk us through it — from the proposal to the last dance.",
    description:
      "Best for couples with a dramatic planning journey, a multi-day destination wedding, or a story that unfolds in sequence.",
    prompts: [
      "How did you meet?",
      "What was the proposal like?",
      "Walk us through each event day.",
    ],
  },
  {
    id: "people",
    label: "The People",
    badge: "RELATIONSHIP-DRIVEN",
    subtitle: "Tell it through the humans who made it happen.",
    description:
      "Best for couples whose wedding was about bringing two families, two cities, two cultures together. The vendors who became friends. The aunty who surprised everyone.",
    prompts: [
      "Who flew the farthest?",
      "Which vendor became a friend?",
      "What did your families think?",
    ],
  },
  {
    id: "details",
    label: "The Details",
    badge: "DESIGN-FORWARD",
    subtitle: "Lead with the look. Every color, every fold, every flame.",
    description:
      "Best for the aesthetically obsessed. Photographers, décor lovers, and anyone whose Pinterest board was 400 pins deep.",
    prompts: [
      "What was the one design element you were obsessed with?",
      "Describe each event's look in one sentence.",
      "What surprised you visually?",
    ],
  },
  {
    id: "unfiltered",
    label: "The Unfiltered Version",
    badge: "REAL TALK",
    subtitle: "The honest take. What went right, what went sideways, what nobody tells you.",
    description:
      "Best for couples who want to actually help the next bride. The confessional version. What you'd text your best friend the week after.",
    prompts: [
      "What would you do differently?",
      "What went wrong that turned out fine?",
      "What's the one thing you wish someone had told you?",
    ],
  },
];

export function makeBlockId(): string {
  return `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function defaultBlock(type: BlockType): StoryBlock {
  const id = makeBlockId();
  switch (type) {
    case "photo_gallery":
      return { id, type, eventTag: null, photos: [] };
    case "moment":
      return { id, type, body: "", eventTag: null };
    case "vendor_shoutout":
      return { id, type, vendorName: "", category: "PHOTOGRAPHY", body: "" };
    case "advice":
      return { id, type, body: "" };
    case "numbers":
      return {
        id,
        type,
        budgetRange: null,
        planningMonths: null,
        outfitChanges: null,
        vendorCount: null,
      };
    case "family":
      return { id, type, side: "both", body: "" };
    case "playlist":
      return { id, type, songs: [] };
    case "outfit":
      return { id, type, eventTag: null, designer: "", description: "" };
    case "freewrite":
      return { id, type, body: "" };
    case "narrative":
      return { id, type, body: "", eventTag: null };
  }
}
