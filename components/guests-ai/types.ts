// Shared types for the guest-list AI features. These mirror the API-route
// schemas so the page, components, and routes stay in lockstep.

export type Side = "bride" | "groom" | "mutual";
export type RsvpStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "tentative"
  | "no_response"
  | "waitlist";

export interface AIGuestDigest {
  id: string;
  firstName: string;
  lastName: string;
  householdId: string;
  side: Side;
  branch: string;
  city: string;
  outOfTown: boolean;
  categories: string[];
  invitedEvents: string[];
  rsvp: Record<string, RsvpStatus>;
  dietary: string[];
  vipTier: string;
  relationship: string;
  addressing?: string;
}

export interface AIHouseholdDigest {
  id: string;
  displayName: string;
  addressing: string;
  side: Side;
  branch: string;
  city: string;
  outOfTown: boolean;
  memberIds: string[];
}

export interface AIEventDigest {
  id: string;
  label: string;
  date: string;
  host: string;
}

export interface GuestCommandSnapshot {
  totals: {
    guests: number;
    households: number;
    confirmed: number;
    pending: number;
  };
  events: AIEventDigest[];
  households: AIHouseholdDigest[];
  guests: AIGuestDigest[];
}

export type GuestCommandAction =
  | { kind: "answer"; text: string }
  | { kind: "clarify"; question: string }
  | { kind: "error"; message: string }
  | {
      kind: "add_household";
      summary: string;
      household: {
        displayName: string;
        addressing: string;
        side: Side;
        branch: string;
        city: string;
        country: string;
        outOfTown: boolean;
        invitedEvents: string[];
        members: Array<{
          firstName: string;
          lastName: string;
          salutation?: string;
          role: "primary" | "spouse" | "child" | "plus_one" | "other";
          relationship: string;
        }>;
      };
    }
  | {
      kind: "update_guests";
      summary: string;
      guestIds: string[];
      patch: {
        side?: Side;
        branch?: string;
        city?: string;
        categories?: string[];
        addCategories?: string[];
        removeCategories?: string[];
        outOfTown?: boolean;
      };
    }
  | {
      kind: "set_rsvp";
      summary: string;
      guestIds: string[];
      eventIds: string[];
      status: RsvpStatus;
    }
  | {
      kind: "toggle_invitation";
      summary: string;
      guestIds: string[];
      eventIds: string[];
      add: boolean;
    };

export interface GuestInsight {
  id: string;
  title: string;
  detail: string;
  severity: "blocker" | "warning" | "info";
}

export type DraftTone = "formal" | "warm" | "casual";

export interface DraftRsvpMessage {
  householdId: string;
  message: string;
}
