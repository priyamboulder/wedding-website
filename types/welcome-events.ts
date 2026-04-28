// ── Welcome Events module types ────────────────────────────────────────────
// Memories & Keepsakes section — not a vendor workspace. Welcome events are
// casual gatherings for out-of-town guests before the formal wedding events
// begin (welcome dinner, meet & greet, hotel mixer, pre-wedding garba night).
//
// Five tabs: Plan & Details, Guest List, Menu & Setup, Communications,
// Documents. All state persists via stores/welcome-events-store.ts.

export type HostingFamily =
  | "bride_family"
  | "groom_family"
  | "both_families"
  | "wedding_couple";

export type EventPurpose =
  | "families_meet"
  | "welcome_oot"
  | "casual_kickoff"
  | "pre_wedding_garba"
  | "custom";

export type DressCodeLevel =
  | "casual"
  | "smart_casual"
  | "indian_casual"
  | "festive"
  | "cocktail";

export type ServiceStyle =
  | "passed_apps_bar"
  | "light_buffet"
  | "sit_down"
  | "chai_snacks"
  | "restaurant_private";

export type BarStyle =
  | "dry"
  | "cash_bar"
  | "open_bar"
  | "beer_wine"
  | "signature_cocktails";

export type InvitationChannel =
  | "printed_card"
  | "digital"
  | "verbal_text"
  | "wedding_website";

export type InviteScope =
  | "oot_only"
  | "all_guests"
  | "close_family_party"
  | "custom";

export type RsvpStatus = "yes" | "no" | "pending";

export type DocumentCategory =
  | "reservation"
  | "catering_order"
  | "invoice"
  | "guest_list"
  | "other";

// ── Tab 1 — Plan & Details ─────────────────────────────────────────────────

export interface EventBasics {
  name: string;
  date: string; // free text, e.g. "Thursday, April 9, 2026"
  timeStart: string; // "6:00 PM"
  timeEnd: string; // "9:00 PM"
  location: string;
  guestCount: number;
  host: HostingFamily;
  purposes: EventPurpose[];
  customPurpose: string;
}

export interface VibeSettings {
  formality: number; // 0-100 slider, 0 = very casual, 100 = formal dinner
  formalityNote: string;
  dressCode: DressCodeLevel;
  activities: string[]; // short labels ("Family introductions", "Garba")
  customActivities: string[];
}

// ── Tab 2 — Guest List ─────────────────────────────────────────────────────

export interface WelcomeGuest {
  id: string;
  name: string;
  group: string; // "Bride family", "Groom family", "Friends", custom
  rsvp: RsvpStatus;
  hotel: string;
  notes?: string;
}

// ── Tab 3 — Menu & Setup ───────────────────────────────────────────────────

export interface MenuItem {
  id: string;
  label: string;
  source: string; // "Caterer", "Hotel", "Self"
  notes?: string;
}

export interface SetupNeeds {
  soundSystem: boolean;
  projector: boolean;
  garbaSticks: boolean;
  nameTags: boolean;
  photoDisplay: boolean;
  welcomeSignage: boolean;
  custom: string[];
}

// ── Tab 4 — Communications ─────────────────────────────────────────────────

export interface MessageStats {
  sent: number;
  opened: number;
  rsvpd: number;
}

export interface CommunicationsState {
  channel: InvitationChannel;
  subject: string;
  body: string;
  stats: MessageStats;
}

// ── Tab 5 — Documents ──────────────────────────────────────────────────────

export interface WelcomeDocument {
  id: string;
  label: string;
  category: DocumentCategory;
  url?: string;
  notes?: string;
  addedAt: string; // ISO
}

// ── Store root ─────────────────────────────────────────────────────────────

export interface WelcomeEventsState {
  basics: EventBasics;
  vibe: VibeSettings;
  inviteScope: InviteScope;
  guests: WelcomeGuest[];
  serviceStyle: ServiceStyle;
  menu: MenuItem[];
  bar: BarStyle;
  setup: SetupNeeds;
  comms: CommunicationsState;
  documents: WelcomeDocument[];
}
