// ── Creator / Influencer data model ───────────────────────────────────────
// Mirrors the schema described in the creator-integration spec, but typed
// for localStorage persistence (no DB migrations — see memory note
// "Persistence: localStorage only").

export type CreatorTier = "standard" | "rising" | "top_creator" | "partner";

export type CollectionStatus = "draft" | "active" | "archived";

export type BudgetRange =
  | "under_50k"
  | "50k_100k"
  | "100k_250k"
  | "250k_500k"
  | "500k_plus";

export type ReferralType =
  | "tab_click"
  | "exhibition"
  | "styled_by"
  | "direct_link"
  | "profile_click"
  | "guide";

export interface Creator {
  id: string;
  displayName: string;
  handle: string; // e.g. "@priyapatel"
  bio: string;
  avatarUrl: string | null;
  avatarGradient: string; // fallback when avatarUrl fails
  coverGradient: string;
  isVerified: boolean;
  followerCount: number;
  tier: CreatorTier;
  commissionRate: number; // 0..1 (e.g. 0.08 for 8%)
  specialties: string[]; // ["Bridal stylist", "Fashion editor"]
  totalEarnings: number;
  pendingPayout: number;
  createdAt: string;

  // Tier program metadata
  tierUpdatedAt: string;
  tierGracePeriodEnds: string | null;

  // Consultation marketplace metadata
  targetBudgetRanges: BudgetRange[];
  consultationRating: number; // 0..5
  totalConsultations: number;
  moduleExpertise: string[]; // phase ids this creator serves, e.g. ["phase-3", "phase-0"]
  styleTags: string[]; // style alignment tags, e.g. ["grand", "traditional", "minimalist"]
  traditionTags: string[]; // e.g. ["hindu", "sikh", "muslim", "christian", "secular"]
}

export interface CreatorPick {
  id: string;
  collectionId: string;
  // The Ananya store product this pick maps to. Using existing StoreProduct
  // ids keeps product cards, carts, and referrals working with zero new
  // product infrastructure.
  productId: string;
  creatorNote: string | null;
  sortOrder: number;
  addedAt: string;
}

export interface CreatorCollection {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  coverGradient: string;
  // Modules are checklist phase ids ("foundation-vision", "attire-styling", …)
  // so Creator Picks group natively into the same buckets as Shopping.
  module: string;
  // Exhibition-style collections get a countdown banner on the Shopping page.
  isExhibition: boolean;
  exhibitionStart: string | null;
  exhibitionEnd: string | null;
  status: CollectionStatus;
  sortOrder: number;
  createdAt: string;
}

export interface CreatorFollow {
  creatorId: string;
  followedAt: string;
}

export interface ReferralEvent {
  id: string;
  creatorId: string;
  productId: string | null;
  collectionId: string | null;
  referralType: ReferralType;
  clickedAt: string;
  convertedAt: string | null;
  orderId: string | null;
  commissionAmount: number;
}
