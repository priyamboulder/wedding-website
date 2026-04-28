// ── Post-Wedding module types ──────────────────────────────────────────────
// Five tabs: Thank-Yous, Deliveries, Reviews, Name Change, Archive. Persists
// to localStorage via Zustand (see stores/post-wedding-store.ts).

// ── Thank-You Tracker ──────────────────────────────────────────────────────

export type GiftType =
  | "cash"
  | "check"
  | "bank_transfer"
  | "registry_item"
  | "physical_gift"
  | "gift_card"
  | "other";

export type ThankYouStatus = "pending" | "drafted" | "sent" | "not_needed";

export type ThankYouMethod =
  | "handwritten_card"
  | "email"
  | "text"
  | "phone_call"
  | "in_person";

export interface Gift {
  id: string;
  guestName: string;
  guestId: string | null;
  relationship: string;
  giftType: GiftType;
  giftDescription: string;
  amountRupees: number | null;
  eventName: string;
  thankYouStatus: ThankYouStatus;
  thankYouMethod: ThankYouMethod | null;
  thankYouSentAt: string | null;
  thankYouNote: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Photo & Video Delivery Tracker ────────────────────────────────────────

export type DeliverableType =
  | "edited_photos"
  | "highlight_reel"
  | "full_film"
  | "ceremony_film"
  | "album_design"
  | "printed_album"
  | "raw_files"
  | "engagement_photos"
  | "photo_prints"
  | "save_the_date_video"
  | "other";

export type DeliveryStatus =
  | "waiting"
  | "due_soon"
  | "overdue"
  | "delivered"
  | "in_review"
  | "complete";

export interface Delivery {
  id: string;
  vendorName: string;
  vendorContact: string;
  vendorRole: string;
  coordinationVendorId: string | null;
  deliverableType: DeliverableType;
  deliverableDescription: string;
  promisedDate: string | null;
  actualDeliveryDate: string | null;
  status: DeliveryStatus;
  deliveryLink: string;
  deliveryPassword: string;
  fileCount: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Vendor Reviews ────────────────────────────────────────────────────────

export type ReviewStatus = "draft" | "published" | "private";

export type ReviewHighlight =
  | "exceeded_expectations"
  | "great_with_family"
  | "handled_chaos"
  | "amazing_detail"
  | "flexible"
  | "captured_emotions"
  | "above_and_beyond"
  | "on_time_prepared"
  | "great_with_kids"
  | "made_us_comfortable"
  | "stunning_editing"
  | "fast_delivery";

export const REVIEW_HIGHLIGHT_LABEL: Record<ReviewHighlight, string> = {
  exceeded_expectations: "Exceeded expectations",
  great_with_family: "Great with family",
  handled_chaos: "Handled chaos beautifully",
  amazing_detail: "Amazing attention to detail",
  flexible: "Flexible and accommodating",
  captured_emotions: "Captured real emotions",
  above_and_beyond: "Went above and beyond",
  on_time_prepared: "On time and prepared",
  great_with_kids: "Great with kids",
  made_us_comfortable: "Made us feel comfortable",
  stunning_editing: "Stunning editing",
  fast_delivery: "Fast delivery",
};

export interface Review {
  id: string;
  vendorName: string;
  vendorRole: string;
  coordinationVendorId: string | null;
  platformVendorId: string | null;
  overallRating: number;
  qualityRating: number | null;
  communicationRating: number | null;
  valueRating: number | null;
  professionalismRating: number | null;
  title: string;
  body: string;
  highlights: ReviewHighlight[];
  wouldRecommend: boolean;
  aiDrafted: boolean;
  aiDraftOriginal: string;
  status: ReviewStatus;
  approximateSpend: string | null;
  eventTypes: string[];
  createdAt: string;
  updatedAt: string;
}

// The interview answers used to seed the AI draft.
export interface ReviewInterviewAnswers {
  overall: "amazing" | "great" | "good" | "mixed" | "poor";
  highlights: ReviewHighlight[];
  specificMoment: string;
  improvement: string;
  oneSentence: string;
}

// ── Name Change Checklist ─────────────────────────────────────────────────

export type NameChangeCategory =
  | "government"
  | "financial"
  | "employment"
  | "personal";

export const NAME_CHANGE_CATEGORY_LABEL: Record<NameChangeCategory, string> = {
  government: "Government & Legal",
  financial: "Financial",
  employment: "Employment",
  personal: "Personal & Digital",
};

export type NameChangeStatus =
  | "not_started"
  | "in_progress"
  | "done"
  | "not_applicable";

export interface NameChangeItem {
  id: string;
  category: NameChangeCategory;
  label: string;
  description: string;
  status: NameChangeStatus;
  notes: string;
  completedAt: string | null;
  sortOrder: number;
}

// ── Store shape ───────────────────────────────────────────────────────────

export interface PostWeddingState {
  gifts: Gift[];
  deliveries: Delivery[];
  reviews: Review[];
  nameChange: NameChangeItem[];
  /** If true, module is shown even before the wedding date has passed. */
  manualUnlock: boolean;
  /** Has the user dismissed the "congratulations" banner. */
  bannerDismissed: boolean;
  /** Has the name change seed been inserted yet. */
  nameChangeSeeded: boolean;
}
