// ── Creator application data model ────────────────────────────────────────
// Gating layer for the creator program. Anyone who wants to become a
// creator must submit an application here and be reviewed by a platform
// admin before the existing creator tools (collections, guides, drops,
// consultations) become available to them.
//
// Persistence is localStorage — see memory note "Persistence: localStorage
// only". The shape is designed to match the spec's table layout closely
// so a future backend migration stays mechanical.

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "waitlisted"
  | "more_info_requested";

export type ExpertiseArea =
  | "bridal_styling"
  | "wedding_planning"
  | "decor_design"
  | "stationery"
  | "beauty_makeup"
  | "photography_videography"
  | "cultural_traditions"
  | "other";

export type YearsExperience =
  | "less_than_1"
  | "1_to_3"
  | "3_to_5"
  | "5_to_10"
  | "10_plus";

export type FollowingRange =
  | "under_1k"
  | "1k_10k"
  | "10k_50k"
  | "50k_100k"
  | "100k_500k"
  | "500k_plus";

export type RejectionReasonCategory =
  | "insufficient_portfolio"
  | "not_wedding_related"
  | "audience_too_small"
  | "incomplete_application"
  | "other";

export type AdminAction = "status_change" | "note_added" | "info_requested";

export interface CreatorApplication {
  id: string;
  userId: string | null;

  // Step 1 — about you
  fullName: string;
  email: string;
  locationCity: string;
  locationCountry: string;
  avatarUrl: string | null;
  bio: string;

  // Step 2 — expertise
  primaryExpertise: ExpertiseArea;
  secondaryExpertise: ExpertiseArea[];
  yearsExperience: YearsExperience;
  isIndustryProfessional: boolean;
  professionalRole: string | null;

  // Step 3 — audience & portfolio
  instagramHandle: string | null;
  youtubeChannel: string | null;
  tiktokHandle: string | null;
  blogUrl: string | null;
  otherSocialLinks: string | null;
  combinedFollowingRange: FollowingRange;
  portfolioUrls: string[];
  contentPlan: string;

  // Step 4 — agreements
  agreedToTerms: boolean;

  // Review lifecycle
  status: ApplicationStatus;
  rejectionReasonCategory: RejectionReasonCategory | null;
  rejectionReasonText: string | null;
  waitlistNote: string | null;
  moreInfoRequest: string | null;
  moreInfoResponse: string | null;
  adminInternalNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reapplyEligibleAt: string | null;

  // Approval bridge — set when the application is approved and a creator
  // profile is auto-created. Links back to the Creator in creators-store.
  linkedCreatorId: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ApplicationAdminLog {
  id: string;
  applicationId: string;
  adminUserId: string | null;
  action: AdminAction;
  oldStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus | null;
  note: string | null;
  createdAt: string;
}

export const EXPERTISE_LABELS: Record<ExpertiseArea, string> = {
  bridal_styling: "Bridal Styling",
  wedding_planning: "Wedding Planning",
  decor_design: "Decor & Design",
  stationery: "Stationery & Invitations",
  beauty_makeup: "Beauty & Makeup",
  photography_videography: "Photography & Videography",
  cultural_traditions: "Cultural Traditions",
  other: "Other",
};

export const YEARS_LABELS: Record<YearsExperience, string> = {
  less_than_1: "Less than 1 year",
  "1_to_3": "1–3 years",
  "3_to_5": "3–5 years",
  "5_to_10": "5–10 years",
  "10_plus": "10+ years",
};

export const FOLLOWING_LABELS: Record<FollowingRange, string> = {
  under_1k: "Under 1K",
  "1k_10k": "1K–10K",
  "10k_50k": "10K–50K",
  "50k_100k": "50K–100K",
  "100k_500k": "100K–500K",
  "500k_plus": "500K+",
};

export const REJECTION_LABELS: Record<RejectionReasonCategory, string> = {
  insufficient_portfolio: "Insufficient portfolio",
  not_wedding_related: "Not wedding-related",
  audience_too_small: "Audience too small for current cohort",
  incomplete_application: "Incomplete application",
  other: "Other",
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  waitlisted: "Waitlisted",
  more_info_requested: "More Info Requested",
};
