// ── Creator-couple matching + consultation marketplace types ─────────────
// Paid consultation services, bookings, reviews, and the couple-side matching
// preferences that drive the "Find a Creator" experience. Persistence is
// localStorage only (see memory note "Persistence: localStorage only").

import type { BudgetRange } from "./creator";

export type ServiceType =
  | "quick_ask"
  | "styling_session"
  | "mood_board"
  | "full_package"
  | "custom";

export interface CreatorService {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  serviceType: ServiceType;
  durationMinutes: number | null; // null for async deliverables
  price: number; // in dollars
  isActive: boolean;
  maxBookingsPerWeek: number | null;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | "requested"
  | "confirmed"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "refunded";

export interface ConsultationBooking {
  id: string;
  serviceId: string;
  creatorId: string;
  coupleUserId: string;
  status: BookingStatus;
  scheduledAt: string | null;
  meetingLink: string | null;
  pricePaid: number;
  platformFee: number; // 20% of pricePaid
  creatorPayout: number;
  deliverableUrl: string | null;
  coupleNote: string;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationReview {
  id: string;
  bookingId: string;
  coupleUserId: string;
  coupleDisplayInitials: string; // "A.D.", "P.K." — anonymized display
  creatorId: string;
  rating: number; // 1..5
  reviewText: string;
  createdAt: string;
}

export interface CouplePreferences {
  id: string;
  userId: string;
  priorityModules: string[]; // phase ids, e.g. ["phase-3", "phase-0"]
  styleTags: string[];
  traditionTags: string[];
  budgetRange: BudgetRange;
  aestheticImageIds: string[]; // ids of selected inspiration tiles
  createdAt: string;
  updatedAt: string;
}

export interface MatchScore {
  creatorId: string;
  score: number; // 0..100
  label: "Great Match" | "Strong Match" | "Good Match";
  breakdown: {
    moduleMatch: number; // 0..30
    styleAlignment: number; // 0..25
    budgetFit: number; // 0..20
    rating: number; // 0..15
    tierBoost: number; // 0..10
  };
}

// Aesthetic inspiration tiles shown in the quiz. Each tile has a gradient
// fallback and a set of style tags it evokes; selections feed into the
// couple's styleTags on save.
export interface AestheticTile {
  id: string;
  label: string;
  gradient: string;
  styleTags: string[];
}

// Preset service templates creators can pick from when adding a new service.
export interface ServiceTemplate {
  type: ServiceType;
  title: string;
  description: string;
  durationMinutes: number | null;
  suggestedPriceRange: [number, number];
}
