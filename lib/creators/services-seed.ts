// ── Consultation services + bookings + reviews seed ──────────────────────
// Services the three seed creators offer, a couple of past bookings, and
// the reviews those bookings produced. Drives the "Find a Creator" flow
// and the reviews section on creator profiles.

import type {
  AestheticTile,
  ConsultationBooking,
  ConsultationReview,
  CreatorService,
  ServiceTemplate,
} from "@/types/matching";

const iso = (d: string) => new Date(d).toISOString();

// ── Services ──────────────────────────────────────────────────────────────

export const SEED_SERVICES: CreatorService[] = [
  // Priya — 3 services
  {
    id: "svc-priya-quick-ask",
    creatorId: "cr-priya-patel",
    title: "Quick Ask with Priya",
    description:
      "A 15-minute video call to get my eyes on 2–3 outfit options. I'll tell you which one photographs best, what to swap, and what to pair it with.",
    serviceType: "quick_ask",
    durationMinutes: 15,
    price: 40,
    isActive: true,
    maxBookingsPerWeek: 8,
    createdAt: iso("2025-10-01T10:00:00Z"),
    updatedAt: iso("2025-10-01T10:00:00Z"),
  },
  {
    id: "svc-priya-styling-session",
    creatorId: "cr-priya-patel",
    title: "Virtual Styling Session",
    description:
      "A full 45-minute consultation for your bridal look. We'll talk silhouette, jewelry, dupatta drape, and footwear — head-to-toe, with a shortlist you can actually shop.",
    serviceType: "styling_session",
    durationMinutes: 45,
    price: 120,
    isActive: true,
    maxBookingsPerWeek: 4,
    createdAt: iso("2025-10-01T10:00:00Z"),
    updatedAt: iso("2025-10-01T10:00:00Z"),
  },
  {
    id: "svc-priya-full-package",
    creatorId: "cr-priya-patel",
    title: "Full Look Package",
    description:
      "End-to-end bridal styling across 3 sessions: engagement, sangeet, and wedding day. I build the mood, source every piece with you, and sign off on fittings over video.",
    serviceType: "full_package",
    durationMinutes: null,
    price: 450,
    isActive: true,
    maxBookingsPerWeek: 2,
    createdAt: iso("2025-10-01T10:00:00Z"),
    updatedAt: iso("2025-10-01T10:00:00Z"),
  },

  // Meera — 2 services
  {
    id: "svc-meera-styling-session",
    creatorId: "cr-meera-shah",
    title: "Décor Direction Call",
    description:
      "45 minutes on the details — mandap, florals, lighting, and the small ancestral touches that photograph like heirlooms. Come with a venue and a mood; leave with a plan.",
    serviceType: "styling_session",
    durationMinutes: 45,
    price: 100,
    isActive: true,
    maxBookingsPerWeek: 5,
    createdAt: iso("2025-11-12T10:00:00Z"),
    updatedAt: iso("2025-11-12T10:00:00Z"),
  },
  {
    id: "svc-meera-mood-board",
    creatorId: "cr-meera-shah",
    title: "Custom Décor Mood Board",
    description:
      "A delivered PDF mood board for your ceremony — palette, florals, textures, three mandap directions, and a shoppable source list. Ready within 5 business days.",
    serviceType: "mood_board",
    durationMinutes: null,
    price: 175,
    isActive: true,
    maxBookingsPerWeek: 3,
    createdAt: iso("2025-11-12T10:00:00Z"),
    updatedAt: iso("2025-11-12T10:00:00Z"),
  },

  // Anika — 1 service
  {
    id: "svc-anika-mood-board",
    creatorId: "cr-anika-desai",
    title: "Stationery Mood Board",
    description:
      "A custom paper-suite mood board: palette, type pairings, two layout directions, and letterpress vs. foil recommendations for your invitations.",
    serviceType: "mood_board",
    durationMinutes: null,
    price: 125,
    isActive: true,
    maxBookingsPerWeek: 3,
    createdAt: iso("2026-01-08T10:00:00Z"),
    updatedAt: iso("2026-01-08T10:00:00Z"),
  },
];

// ── Past bookings (drives earnings + reviews) ────────────────────────────

export const SEED_BOOKINGS: ConsultationBooking[] = [
  // Priya — 2 completed
  {
    id: "bk-priya-1",
    serviceId: "svc-priya-styling-session",
    creatorId: "cr-priya-patel",
    coupleUserId: "couple-kavya-m",
    status: "completed",
    scheduledAt: iso("2026-02-18T17:00:00Z"),
    meetingLink: "https://meet.example.com/priya-kavya",
    pricePaid: 120,
    platformFee: 24,
    creatorPayout: 96,
    deliverableUrl: null,
    coupleNote:
      "Trying to decide between an Anarkali and a classic lehenga for the wedding. Would love your eyes on fit and silhouette for my body type.",
    cancellationReason: null,
    createdAt: iso("2026-02-10T10:00:00Z"),
    updatedAt: iso("2026-02-18T18:00:00Z"),
  },
  {
    id: "bk-priya-2",
    serviceId: "svc-priya-full-package",
    creatorId: "cr-priya-patel",
    coupleUserId: "couple-aditi-r",
    status: "completed",
    scheduledAt: iso("2026-01-22T18:00:00Z"),
    meetingLink: "https://meet.example.com/priya-aditi",
    pricePaid: 450,
    platformFee: 90,
    creatorPayout: 360,
    deliverableUrl: null,
    coupleNote:
      "Full bridal styling across three events — sangeet, mehendi, wedding. Working with a $15k attire budget.",
    cancellationReason: null,
    createdAt: iso("2025-12-20T10:00:00Z"),
    updatedAt: iso("2026-03-15T18:00:00Z"),
  },
  // Meera — 1 completed
  {
    id: "bk-meera-1",
    serviceId: "svc-meera-mood-board",
    creatorId: "cr-meera-shah",
    coupleUserId: "couple-neha-b",
    status: "completed",
    scheduledAt: null,
    meetingLink: null,
    pricePaid: 175,
    platformFee: 35,
    creatorPayout: 140,
    deliverableUrl: "https://deliverables.example.com/meera-neha-moodboard.pdf",
    coupleNote:
      "Outdoor ceremony in Udaipur, rose-gold palette, want it to feel heirloom but not heavy.",
    cancellationReason: null,
    createdAt: iso("2026-03-02T10:00:00Z"),
    updatedAt: iso("2026-03-08T14:00:00Z"),
  },
];

// ── Reviews (attached to completed bookings) ─────────────────────────────

export const SEED_REVIEWS: ConsultationReview[] = [
  {
    id: "rv-priya-1",
    bookingId: "bk-priya-1",
    coupleUserId: "couple-kavya-m",
    coupleDisplayInitials: "K.M.",
    creatorId: "cr-priya-patel",
    rating: 5,
    reviewText:
      "Priya saved me from a styling spiral. She looked at my two options, told me exactly why the Anarkali worked better on me, and followed up with a Pinterest board the next day. Worth every dollar.",
    createdAt: iso("2026-02-20T10:00:00Z"),
  },
  {
    id: "rv-priya-2",
    bookingId: "bk-priya-2",
    coupleUserId: "couple-aditi-r",
    coupleDisplayInitials: "A.R.",
    creatorId: "cr-priya-patel",
    rating: 5,
    reviewText:
      "I booked the Full Look Package and it was the single best wedding-planning investment I made. Priya was present, opinionated in the best way, and made me feel like I had a fashion editor in my corner.",
    createdAt: iso("2026-03-16T10:00:00Z"),
  },
  {
    id: "rv-meera-1",
    bookingId: "bk-meera-1",
    coupleUserId: "couple-neha-b",
    coupleDisplayInitials: "N.B.",
    creatorId: "cr-meera-shah",
    rating: 4,
    reviewText:
      "The mood board was gorgeous and the source list was genuinely useful. Would have loved one more mandap direction to compare but I used her first option almost verbatim.",
    createdAt: iso("2026-03-10T10:00:00Z"),
  },
];

// ── Aesthetic inspiration tiles (shown in the matching quiz) ─────────────

export const AESTHETIC_TILES: AestheticTile[] = [
  {
    id: "aes-regal-traditional",
    label: "Regal & Traditional",
    gradient:
      "linear-gradient(135deg, #8B2E2A 0%, #C97B63 45%, #D4A843 100%)",
    styleTags: ["grand", "traditional", "heirloom", "maximalist"],
  },
  {
    id: "aes-modern-minimal",
    label: "Modern Minimal",
    gradient:
      "linear-gradient(135deg, #2D2D2D 0%, #6C6C6C 50%, #E8E4DD 100%)",
    styleTags: ["minimalist", "modern", "considered"],
  },
  {
    id: "aes-garden-romance",
    label: "Garden Romance",
    gradient:
      "linear-gradient(135deg, #6B8E4E 0%, #B8C9A8 50%, #F0E4C8 100%)",
    styleTags: ["romantic", "garden", "soft", "pastel"],
  },
  {
    id: "aes-desert-sunset",
    label: "Desert Sunset",
    gradient:
      "linear-gradient(135deg, #D4A843 0%, #C97B63 55%, #8B2E2A 100%)",
    styleTags: ["grand", "warm", "earthy", "dramatic"],
  },
  {
    id: "aes-heritage-blue",
    label: "Heritage Blue",
    gradient:
      "linear-gradient(135deg, #2A4F4D 0%, #5B8E8A 50%, #DCE9E7 100%)",
    styleTags: ["traditional", "heirloom", "grand"],
  },
  {
    id: "aes-ivory-gold",
    label: "Ivory & Gold",
    gradient:
      "linear-gradient(135deg, #F0E4C8 0%, #D4A843 60%, #8B6E2A 100%)",
    styleTags: ["couture", "grand", "heirloom", "traditional"],
  },
  {
    id: "aes-paper-letterpress",
    label: "Paper & Letterpress",
    gradient:
      "linear-gradient(135deg, #FBF9F4 0%, #E8E4DD 50%, #9CAF88 100%)",
    styleTags: ["minimalist", "considered", "intentional"],
  },
  {
    id: "aes-rose-champagne",
    label: "Rose & Champagne",
    gradient:
      "linear-gradient(135deg, #E8C4B8 0%, #F0E4C8 50%, #D4A843 100%)",
    styleTags: ["romantic", "soft", "modern", "pastel"],
  },
];

// ── Service templates (used in creator dashboard when adding a service) ─

export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    type: "quick_ask",
    title: "Quick Ask",
    description: "15-minute video call for quick feedback on 2–3 options.",
    durationMinutes: 15,
    suggestedPriceRange: [25, 50],
  },
  {
    type: "styling_session",
    title: "Virtual Styling Session",
    description: "45-minute video consultation for a full look.",
    durationMinutes: 45,
    suggestedPriceRange: [75, 150],
  },
  {
    type: "mood_board",
    title: "Custom Mood Board",
    description: "Async deliverable — personalized mood board.",
    durationMinutes: null,
    suggestedPriceRange: [100, 200],
  },
  {
    type: "full_package",
    title: "Full Look Package",
    description: "End-to-end multi-session styling or planning.",
    durationMinutes: null,
    suggestedPriceRange: [300, 500],
  },
  {
    type: "custom",
    title: "Custom Service",
    description: "Define your own — set the format, duration, and price.",
    durationMinutes: null,
    suggestedPriceRange: [50, 500],
  },
];

// ── Lookups ──────────────────────────────────────────────────────────────

export function getServicesByCreator(creatorId: string): CreatorService[] {
  return SEED_SERVICES.filter((s) => s.creatorId === creatorId && s.isActive);
}

export function getService(serviceId: string): CreatorService | undefined {
  return SEED_SERVICES.find((s) => s.id === serviceId);
}

export function getReviewsByCreator(creatorId: string): ConsultationReview[] {
  return SEED_REVIEWS.filter((r) => r.creatorId === creatorId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getAestheticTile(id: string): AestheticTile | undefined {
  return AESTHETIC_TILES.find((t) => t.id === id);
}
