// ── Seating-guest interface ──────────────────────────────────────────
// The seating builder receives a stripped-down guest shape from the
// parent page (app/guests/page.tsx owns the full Guest model, so rather
// than import the page module here we define the subset we need).

export type SeatingGuestSide = "bride" | "groom" | "mutual";

export interface SeatingGuest {
  id: string;
  firstName: string;
  lastName: string;
  householdId: string;
  side: SeatingGuestSide;
  ageCategory: string; // "infant" | "child" | "teen" | "adult" | "senior"
  vipTier: string;
  categories: string[];
  dietary: string[];
  preferredLanguage?: string;
  needsAssistance?: boolean;
  relationship?: string;
  plusOneOf?: string;
  outOfTown?: boolean;
  // eventId → RSVP status ("confirmed", "declined", "pending", ...)
  rsvp: Record<string, string>;
}

export interface SeatingEventOption {
  id: string;
  label: string;
  date?: string;
}

export const DEFAULT_SEATING_EVENT: SeatingEventOption = {
  id: "reception",
  label: "Reception",
};

// Category → badge color (kept in-line with the guest module palette).
export const CATEGORY_COLOR_MAP: Record<string, string> = {
  Bridesmaids: "bg-rose-light",
  Groomsmen: "bg-sage-light",
  Cousins: "bg-gold-light",
  "College Friends": "bg-blue-200",
  "Work Colleagues": "bg-purple-200",
  VIP: "bg-saffron/70",
  Elders: "bg-ivory-deep",
  Kids: "bg-sage-pale",
  "Out of Town": "bg-gold-pale",
  Family: "bg-rose-pale",
  Plus_One: "bg-ivory",
};

export function categoryColor(cat: string): string {
  return CATEGORY_COLOR_MAP[cat] ?? "bg-ivory-deep";
}

export function guestFullName(g: SeatingGuest): string {
  return `${g.firstName} ${g.lastName}`.trim();
}

export function guestInitials(g: SeatingGuest): string {
  const a = g.firstName.charAt(0).toUpperCase();
  const b = g.lastName.charAt(0).toUpperCase();
  return `${a}${b}` || "?";
}

export function sideDotClass(side: SeatingGuestSide): string {
  return side === "bride"
    ? "bg-rose-light"
    : side === "groom"
      ? "bg-sage-light"
      : "bg-gold-light";
}

export function dietaryIcon(dietary: string[]): string {
  if (!dietary.length) return "";
  if (dietary.includes("jain")) return "J";
  if (dietary.includes("vegan")) return "V";
  if (dietary.includes("vegetarian")) return "V";
  if (dietary.includes("halal")) return "H";
  if (dietary.includes("kosher")) return "K";
  if (dietary.includes("non_vegetarian")) return "N";
  if (dietary.includes("gluten_free")) return "GF";
  return "•";
}
