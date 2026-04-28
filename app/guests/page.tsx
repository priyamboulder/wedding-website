"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Users,
  UserCircle2,
  Home as HomeIcon,
  CalendarDays,
  ClipboardCheck,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Armchair,
  Gift,
  MessageSquare,
  Upload,
  Plus,
  Download,
  Search,
  SlidersHorizontal,
  BarChart3,
  ChevronDown,
  ChevronRight,
  X,
  MoreHorizontal,
  MapPin,
  Phone,
  Mail,
  Leaf,
  Edit3,
  Send,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Activity,
  Accessibility,
  Check,
  LayoutGrid,
  LayoutList,
  Square,
  CheckSquare,
  MinusSquare,
  Tag,
  Tags,
  GripVertical,
  Trash2,
  Pencil,
  Music,
  Hotel,
  Car,
  Clock,
  RefreshCw,
  Scissors,
  Combine,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import {
  HOTEL_ROOM_BLOCKS,
  type HotelBlockId,
} from "@/lib/travel-accommodations-seed";
import {
  useGuestCategoriesStore,
  type GuestCategory,
} from "@/stores/guest-categories-store";
import {
  GUEST_CATEGORY_COLORS,
  swatchFor,
  type GuestCategoryColor,
} from "@/lib/guest-categories-seed";
import {
  GuestPerformancesSection,
  useGuestPerformsAtEvent,
  type PerformancesEvent,
} from "@/components/performances/PerformancesView";
import { usePerformancesStore } from "@/stores/performances-store";
import { SeatingBuilder } from "@/components/seating/SeatingBuilder";
import { AICommandBar } from "@/components/guests-ai/AICommandBar";
import { AIInsightsPanel } from "@/components/guests-ai/AIInsightsPanel";
import { RsvpDraftsModal, type DraftHousehold } from "@/components/guests-ai/RsvpDraftsModal";
import type {
  GuestCommandAction,
  GuestCommandSnapshot,
} from "@/components/guests-ai/types";

// ═══════════════════════════════════════════════════════════════════════════
//   Types
// ═══════════════════════════════════════════════════════════════════════════

type Side = "bride" | "groom" | "mutual";
type RsvpStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "tentative"
  | "no_response"
  | "waitlist";
type VipTier =
  | "immediate_family"
  | "close_family"
  | "honored"
  | "standard"
  | "plus_one";
type Dietary =
  | "vegetarian"
  | "vegan"
  | "jain"
  | "halal"
  | "kosher"
  | "gluten_free"
  | "nut_allergy"
  | "dairy_free"
  | "non_vegetarian"
  | "swaminarayan";
type AgeCategory = "infant" | "child" | "teen" | "adult" | "senior";
type HouseholdRole = "primary" | "spouse" | "child" | "plus_one" | "other";
type InvitationDelivery = "pending" | "sent" | "delivered" | "returned";
type GuestView =
  | "all"
  | "households"
  | "by_side"
  | "by_event"
  | "categories"
  | "rsvp"
  | "travel"
  | "seating"
  | "gifts"
  | "communications"
  | "imports";

interface FilterChip {
  id: string;
  label: string;
  predicate: (g: Guest) => boolean;
}

interface WeddingEvent {
  id: string;
  label: string;
  date: string; // display string
  host: "Bride" | "Groom" | "Joint";
  icon: string; // emoji for quick glance
}

// ── Structured flight + ground transport ──────────────────────────────────
// The flat `arrivalFlight` / `departureFlight` fields below are preserved
// for back-compat with existing copy. The new `flights` array + `ground`
// object are the canonical source for the Flights + Pickups tabs, and get
// derived on page load from the legacy flat fields (see applyTravelEnrichments).
type FlightDirection = "arrival" | "departure";
type FlightStatus =
  | "scheduled"
  | "on_time"
  | "delayed"
  | "landed"
  | "departed"
  | "cancelled";

interface GuestFlight {
  id: string;
  flightNumber: string; // e.g. "AI 101", "EK 500"
  direction: FlightDirection;
  airline: string;
  origin: string; // city or IATA code
  destination: string;
  scheduledDatetime: string; // ISO
  terminal?: string;
  gate?: string;
  status: FlightStatus;
  delayMinutes?: number;
  notes?: string;
  lastCheckedAt?: string; // ISO; set by /api/flights/refresh
}

interface GroundTransport {
  pickupAssigned: boolean;
  driverName?: string;
  driverPhone?: string;
  vehicleInfo?: string;
  pickupLocation?: string;
  pickupTime?: string; // ISO
}

interface Guest {
  id: string;
  householdId: string;
  householdRole: HouseholdRole;
  firstName: string;
  lastName: string;
  nickname?: string;
  salutation?: string;
  pronouns?: string;
  ageCategory: AgeCategory;
  side: Side;
  familyBranch: string;
  relationship: string;
  relationshipNotes?: string;
  vipTier: VipTier;
  email?: string;
  email2?: string;
  phone?: string;
  phone2?: string;
  whatsappNumber?: string;
  whatsappPreferred?: boolean;
  preferredContact?: "email" | "whatsapp" | "phone" | "text";
  street1?: string;
  street2?: string;
  state?: string;
  postalCode?: string;
  altStreet1?: string;
  altStreet2?: string;
  altCity?: string;
  altState?: string;
  altPostalCode?: string;
  altCountry?: string;
  city: string;
  country: string;
  preferredLanguage?: string;
  dietary: Dietary[];
  allergyNotes?: string;
  drinks?: boolean;
  outOfTown: boolean;
  arrivingFrom?: string;
  needsPickup?: boolean;
  // Foreign key into the Travel & Accommodations vendor workspace
  // (HOTEL_ROOM_BLOCKS in lib/travel-accommodations-seed.ts). The vendor
  // workspace owns the contracted inventory and rate; the guest module
  // owns the per-guest assignment detail below (room number, roommate,
  // check-in/out, requests).
  hotelId?: HotelBlockId;
  roomType?: string;
  roomNumber?: string;
  roommate?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  arrivalAirline?: string;
  arrivalFlight?: string;
  arrivalAirport?: string;
  arrivalTerminal?: string;
  arrivalConfirmation?: string;
  pickupAssigned?: string;
  pickupVehicle?: string;
  // New structured flight + transport data — used by the Flights + Pickups
  // tabs. Derived from the flat arrival/departure fields during enrichment,
  // and persisted as the user adds/edits flights through the UI.
  flights?: GuestFlight[];
  ground?: GroundTransport;
  departureDate?: string;
  departureTime?: string;
  departureAirline?: string;
  departureFlight?: string;
  departureAirport?: string;
  departureTerminal?: string;
  dropoffAssigned?: string;
  checkInDate?: string;
  checkOutDate?: string;
  nightsCovered?: "yes" | "no" | "partial";
  transportBetweenEvents?: string;
  accessibilityNotes?: string;
  weddingPartyRole?: string;
  performingAtSangeet?: boolean;
  rsvp: Record<string, RsvpStatus>; // eventId -> status
  mealSelection?: Record<string, string>;
  invitationSent: boolean;
  invitationDelivery: InvitationDelivery;
  giftReceived?: boolean;
  thankYouSent?: boolean;
  tags: string[];
  priorityTier: "A" | "B" | "C";
  source: string;
  addedBy: string;
  notes?: string;
  flagged?: boolean;
  // Richer profile fields (2026-04-22)
  categories: string[];
  relationshipToBride?: string;
  relationshipToGroom?: string;
  plusOne?: boolean;
  plusOneOf?: string; // guest id of the person who brought this plus-one
  needsAssistance?: boolean;
  // Waitlist: candidate guests not yet invited. Held in a separate pool from
  // the 5 RSVP columns. Their `rsvp` record stays empty until promoted to
  // pending (at which point all main events are seeded).
  onWaitlist?: boolean;
  activityLog: { action: string; timestamp: string }[];
}

interface Household {
  id: string;
  displayName: string;
  primaryLastName: string;
  side: Side;
  branch: string;
  invitationAddressing: string;
  mailingAddress: string;
  city: string;
  country: string;
  outOfTown: boolean;
  notes?: string;
}

// Re-exported from the shared seed so the guest module and the Travel &
// Accommodations vendor workspace agree on room block ids. Per-guest
// assignments (room number, roommate, check-in/out, special requests) are
// owned here; the vendor workspace only reads count-level utilization.
type HotelBlock = {
  id: HotelBlockId;
  name: string;
  rate: string;
  rooms: number;
  distance: string;
  bookingCutoff: string;
};

// ═══════════════════════════════════════════════════════════════════════════
//   Constants
// ═══════════════════════════════════════════════════════════════════════════


const EVENTS: WeddingEvent[] = [
  { id: "welcome", label: "Welcome Dinner", date: "Jun 7", host: "Joint", icon: "🍽" },
  { id: "pithi", label: "Pithi", date: "Jun 8", host: "Groom", icon: "🌿" },
  { id: "mehndi", label: "Mehndi", date: "Jun 8", host: "Bride", icon: "🌺" },
  { id: "haldi", label: "Haldi", date: "Jun 9", host: "Joint", icon: "✨" },
  { id: "sangeet", label: "Sangeet", date: "Jun 9", host: "Joint", icon: "🎶" },
  { id: "baraat", label: "Baraat", date: "Jun 10", host: "Groom", icon: "🐎" },
  { id: "ceremony", label: "Ceremony", date: "Jun 10", host: "Joint", icon: "🔥" },
  { id: "reception", label: "Reception", date: "Jun 10", host: "Joint", icon: "🥂" },
  { id: "brunch", label: "Farewell Brunch", date: "Jun 11", host: "Joint", icon: "☕" },
];

// Shared with the Travel & Accommodations vendor workspace. The vendor
// side owns the contract/relationship fields (attrition, contact, status);
// this module only uses the booking-facing subset.
const HOTELS: HotelBlock[] = HOTEL_ROOM_BLOCKS.map(
  ({ id, name, rate, rooms, distance, bookingCutoff }) => ({
    id,
    name,
    rate,
    rooms,
    distance,
    bookingCutoff,
  }),
);

const SIDE_LABEL: Record<Side, string> = {
  bride: "Bride's Side",
  groom: "Groom's Side",
  mutual: "Mutual",
};

const SIDE_DOT: Record<Side, string> = {
  bride: "bg-rose-light",
  groom: "bg-sage-light",
  mutual: "bg-gold-light",
};

const VIP_LABEL: Record<VipTier, string> = {
  immediate_family: "Immediate Family",
  close_family: "Close Family",
  honored: "Honored Guest",
  standard: "Standard",
  plus_one: "Plus One",
};

const RSVP_LABEL: Record<RsvpStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  declined: "Declined",
  tentative: "Tentative",
  no_response: "No response",
  waitlist: "Waitlist",
};

const RSVP_TONE: Record<RsvpStatus, string> = {
  pending: "bg-ivory-deep text-ink-muted",
  confirmed: "bg-sage-pale text-sage",
  declined: "bg-rose-pale/60 text-rose",
  tentative: "bg-gold-pale/60 text-saffron",
  no_response: "bg-ivory/50 text-ink-faint",
  waitlist: "bg-ink/5 text-ink-faint",
};

const DIETARY_LABEL: Record<Dietary, string> = {
  vegetarian: "Veg",
  vegan: "Vegan",
  jain: "Jain",
  halal: "Halal",
  kosher: "Kosher",
  gluten_free: "GF",
  nut_allergy: "Nut allergy",
  dairy_free: "Dairy-free",
  non_vegetarian: "Non-veg",
  swaminarayan: "Swaminarayan",
};

const AGE_LABEL: Record<AgeCategory, string> = {
  infant: "Infant",
  child: "Child",
  teen: "Teen",
  adult: "Adult",
  senior: "Senior",
};

// ═══════════════════════════════════════════════════════════════════════════
//   Mock data — 50 households / ~150 guests across both sides
// ═══════════════════════════════════════════════════════════════════════════

type MemberSeed = {
  first: string;
  last?: string; // defaults to household last
  salutation?: string;
  role: HouseholdRole;
  age: AgeCategory;
  vip: VipTier;
  relationship: string;
  email?: string;
  phone?: string;
  whatsapp?: boolean;
  dietary: Dietary[];
  drinks?: boolean;
  allergy?: string;
  weddingPartyRole?: string;
  performing?: boolean;
  language?: string;
  pronouns?: string;
  notes?: string;
  flagged?: boolean;
};

type HouseholdSeed = {
  name: string; // e.g. "The Shah Family" — display name
  lastName: string;
  side: Side;
  branch: string;
  address: string;
  city: string;
  country: string;
  outOfTown: boolean;
  addressing: string;
  priority: "A" | "B" | "C";
  source: string;
  tags: string[];
  notes?: string;
  hotel?: string;
  roomType?: string;
  arriving?: string;
  pickup?: boolean;
  events: string[]; // eventIds invited to (everyone in household invited to these)
  rsvpOverride?: Partial<Record<string, RsvpStatus>>; // default confirmed if not set
  members: MemberSeed[];
};

const HOUSEHOLD_SEEDS: HouseholdSeed[] = [
  // ─── BRIDE'S SIDE — Shah (paternal) ─────────────────────────────────
  {
    name: "Mr. & Mrs. Rakesh Shah",
    lastName: "Shah",
    side: "bride",
    branch: "Bride's Paternal",
    address: "14, Malabar Hill",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Shri & Smt. Rakesh Shah",
    priority: "A",
    source: "Bride's list",
    tags: ["Immediate", "Mumbai"],
    events: EVENTS.map((e) => e.id),
    rsvpOverride: {},
    members: [
      { first: "Rakesh", salutation: "Shri", role: "primary", age: "senior", vip: "immediate_family", relationship: "Father of the Bride", email: "rakesh.shah@email.com", phone: "+91 98200 11212", whatsapp: true, dietary: ["vegetarian"], drinks: false, language: "Gujarati" },
      { first: "Meera", salutation: "Smt", role: "spouse", age: "senior", vip: "immediate_family", relationship: "Mother of the Bride", phone: "+91 98200 11213", whatsapp: true, dietary: ["vegetarian", "jain"], drinks: false, language: "Gujarati" },
    ],
  },
  {
    name: "Ishaan Shah",
    lastName: "Shah",
    side: "bride",
    branch: "Bride's Paternal",
    address: "14, Malabar Hill",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Mr. Ishaan Shah",
    priority: "A",
    source: "Bride's list",
    tags: ["Wedding party", "Mumbai"],
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Ishaan", salutation: "Mr", role: "primary", age: "adult", vip: "immediate_family", relationship: "Brother of the Bride", email: "ishaan.shah@email.com", phone: "+91 98200 44551", whatsapp: true, dietary: ["vegetarian"], drinks: true, weddingPartyRole: "Best Man (Bride's side)", performing: true },
    ],
  },
  {
    name: "The Shah Family (Ahmedabad)",
    lastName: "Shah",
    side: "bride",
    branch: "Bride's Paternal",
    address: "Plot 27, Bodakdev",
    city: "Ahmedabad",
    country: "India",
    outOfTown: true,
    addressing: "Mr. & Mrs. Dinesh Shah and Family",
    priority: "A",
    source: "Bride's list",
    tags: ["Cousins", "Ahmedabad"],
    hotel: "trident",
    roomType: "Family Suite",
    arriving: "Ahmedabad",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Dinesh", salutation: "Shri", role: "primary", age: "senior", vip: "close_family", relationship: "Uncle (father's brother)", phone: "+91 98250 34411", whatsapp: true, dietary: ["vegetarian", "jain"], drinks: false, language: "Gujarati" },
      { first: "Nisha", salutation: "Smt", role: "spouse", age: "senior", vip: "close_family", relationship: "Aunt", dietary: ["vegetarian", "jain"], drinks: false, language: "Gujarati" },
      { first: "Aarav", role: "child", age: "adult", vip: "standard", relationship: "Cousin", email: "aarav.s@email.com", dietary: ["vegetarian"], drinks: true, performing: true },
      { first: "Kavya", role: "child", age: "teen", vip: "standard", relationship: "Cousin", dietary: ["vegetarian"] },
    ],
  },
  {
    name: "Mr. & Mrs. Vimal Shah",
    lastName: "Shah",
    side: "bride",
    branch: "Bride's Paternal",
    address: "Prabhadevi",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Mr. & Mrs. Vimal Shah",
    priority: "B",
    source: "Bride's list",
    tags: ["Extended"],
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Vimal", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Second cousin", dietary: ["vegetarian"], drinks: true },
      { first: "Pooja", salutation: "Mrs", role: "spouse", age: "adult", vip: "standard", relationship: "Second cousin-in-law", dietary: ["vegetarian"], drinks: false },
    ],
  },
  // ─── BRIDE'S SIDE — Iyer (maternal, Tamil) ──────────────────────────
  {
    name: "The Iyer Family (Chennai)",
    lastName: "Iyer",
    side: "bride",
    branch: "Bride's Maternal",
    address: "Abhiramapuram",
    city: "Chennai",
    country: "India",
    outOfTown: true,
    addressing: "Shri & Smt. Krishnan Iyer",
    priority: "A",
    source: "Bride's list",
    tags: ["Immediate", "Chennai", "Grandparents"],
    hotel: "taj",
    roomType: "Suite",
    arriving: "Chennai",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Krishnan", salutation: "Shri", role: "primary", age: "senior", vip: "immediate_family", relationship: "Maternal Grandfather (Thatha)", phone: "+91 90030 22211", dietary: ["vegetarian"], drinks: false, language: "Tamil", notes: "Requires ground floor room; knee mobility" },
      { first: "Lakshmi", salutation: "Smt", role: "spouse", age: "senior", vip: "immediate_family", relationship: "Maternal Grandmother (Paatti)", dietary: ["vegetarian"], drinks: false, language: "Tamil", notes: "Prefers hearing aid seating" },
    ],
  },
  {
    name: "Dr. Karthik Iyer",
    lastName: "Iyer",
    side: "bride",
    branch: "Bride's Maternal",
    address: "Chamiers Road",
    city: "Chennai",
    country: "India",
    outOfTown: true,
    addressing: "Dr. & Mrs. Karthik Iyer and Family",
    priority: "A",
    source: "Bride's list",
    tags: ["Cousins", "Chennai"],
    hotel: "taj",
    roomType: "King",
    arriving: "Chennai",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Karthik", salutation: "Dr", role: "primary", age: "adult", vip: "close_family", relationship: "Maternal Uncle (Mama)", email: "dr.karthik.iyer@email.com", phone: "+91 90030 55621", whatsapp: true, dietary: ["vegetarian"], drinks: true, language: "Tamil" },
      { first: "Anjali", salutation: "Mrs", role: "spouse", age: "adult", vip: "close_family", relationship: "Aunt (Mami)", dietary: ["vegetarian"], drinks: false },
      { first: "Shreya", role: "child", age: "teen", vip: "standard", relationship: "Cousin", dietary: ["vegetarian"] },
      { first: "Vivaan", role: "child", age: "child", vip: "standard", relationship: "Cousin", dietary: ["vegetarian"], allergy: "Peanuts" },
    ],
  },
  {
    name: "Ms. Divya Iyer",
    lastName: "Iyer",
    side: "bride",
    branch: "Bride's Maternal",
    address: "Indiranagar",
    city: "Bengaluru",
    country: "India",
    outOfTown: true,
    addressing: "Ms. Divya Iyer",
    priority: "A",
    source: "Bride's list",
    tags: ["Wedding party", "Bangalore"],
    hotel: "trident",
    roomType: "Double",
    arriving: "Bengaluru",
    pickup: false,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Divya", salutation: "Ms", role: "primary", age: "adult", vip: "close_family", relationship: "Cousin (Maid of Honor)", email: "divya.iyer@email.com", phone: "+91 80470 33321", whatsapp: true, pronouns: "she/her", dietary: ["non_vegetarian"], drinks: true, weddingPartyRole: "Maid of Honor", performing: true },
    ],
  },
  // ─── BRIDE'S SIDE — Friends ──────────────────────────────────────────
  {
    name: "Ms. Aisha Menon",
    lastName: "Menon",
    side: "bride",
    branch: "Bride's Friends",
    address: "Bandra West",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Ms. Aisha Menon",
    priority: "A",
    source: "Bride's list",
    tags: ["Bridesmaid", "College crew"],
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Aisha", salutation: "Ms", role: "primary", age: "adult", vip: "honored", relationship: "Best Friend (College)", email: "aisha.menon@email.com", phone: "+91 98199 12344", whatsapp: true, dietary: ["non_vegetarian"], drinks: true, weddingPartyRole: "Bridesmaid", performing: true },
    ],
  },
  {
    name: "Mr. & Mrs. Rohan Kapoor",
    lastName: "Kapoor",
    side: "bride",
    branch: "Bride's Friends",
    address: "Khar",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Mr. & Mrs. Rohan Kapoor",
    priority: "B",
    source: "Bride's list",
    tags: ["Work"],
    events: ["sangeet", "reception"],
    members: [
      { first: "Rohan", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Work colleague", dietary: ["non_vegetarian"], drinks: true },
      { first: "Tanvi", salutation: "Mrs", role: "spouse", age: "adult", vip: "plus_one", relationship: "Plus-one (spouse)", dietary: ["vegetarian"], drinks: true },
    ],
  },
  {
    name: "Ms. Priyanka Reddy",
    lastName: "Reddy",
    side: "bride",
    branch: "Bride's Friends",
    address: "Jubilee Hills",
    city: "Hyderabad",
    country: "India",
    outOfTown: true,
    addressing: "Ms. Priyanka Reddy",
    priority: "A",
    source: "Bride's list",
    tags: ["Bridesmaid", "Hyderabad"],
    hotel: "trident",
    roomType: "Double",
    arriving: "Hyderabad",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Priyanka", salutation: "Ms", role: "primary", age: "adult", vip: "honored", relationship: "College roommate", email: "priyanka.reddy@email.com", phone: "+91 99120 44412", whatsapp: true, dietary: ["non_vegetarian"], drinks: true, weddingPartyRole: "Bridesmaid", performing: true },
    ],
  },
  {
    name: "Ms. Zara Ahmed",
    lastName: "Ahmed",
    side: "bride",
    branch: "Bride's Friends",
    address: "Hauz Khas",
    city: "Delhi",
    country: "India",
    outOfTown: true,
    addressing: "Ms. Zara Ahmed",
    priority: "A",
    source: "Bride's list",
    tags: ["Bridesmaid", "Delhi"],
    hotel: "oberoi",
    roomType: "King",
    arriving: "Delhi",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Zara", salutation: "Ms", role: "primary", age: "adult", vip: "honored", relationship: "MBA classmate", email: "zara.ahmed@email.com", phone: "+91 98110 66723", whatsapp: true, dietary: ["halal"], drinks: false, weddingPartyRole: "Bridesmaid" },
    ],
  },
  {
    name: "The D'Souza Family",
    lastName: "D'Souza",
    side: "bride",
    branch: "Bride's Friends",
    address: "Bandra",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Mr. & Mrs. Anthony D'Souza",
    priority: "B",
    source: "Bride's list",
    tags: ["Family Friends"],
    events: ["welcome", "sangeet", "ceremony", "reception"],
    members: [
      { first: "Anthony", salutation: "Mr", role: "primary", age: "senior", vip: "standard", relationship: "Family friend", dietary: ["non_vegetarian"], drinks: true },
      { first: "Monica", salutation: "Mrs", role: "spouse", age: "senior", vip: "standard", relationship: "Family friend", dietary: ["non_vegetarian"], drinks: true },
      { first: "Rebecca", role: "child", age: "teen", vip: "standard", relationship: "Family friend's daughter", dietary: ["non_vegetarian"] },
    ],
  },
  // ─── BRIDE'S SIDE — International ───────────────────────────────────
  {
    name: "The Desai Family (London)",
    lastName: "Desai",
    side: "bride",
    branch: "Bride's Maternal",
    address: "42 Wimpole St",
    city: "London",
    country: "UK",
    outOfTown: true,
    addressing: "Dr. & Mrs. Nirav Desai and Family",
    priority: "A",
    source: "Bride's list",
    tags: ["International", "Cousins"],
    hotel: "taj",
    roomType: "Suite",
    arriving: "London Heathrow",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Nirav", salutation: "Dr", role: "primary", age: "adult", vip: "close_family", relationship: "Cousin", email: "nirav.desai@email.com", phone: "+44 7700 900123", whatsapp: true, dietary: ["vegetarian"], drinks: true, language: "English" },
      { first: "Sunita", salutation: "Mrs", role: "spouse", age: "adult", vip: "close_family", relationship: "Cousin-in-law", dietary: ["vegetarian"] },
      { first: "Arjun", last: "Desai", role: "child", age: "child", vip: "standard", relationship: "First cousin once removed", dietary: ["vegetarian"], allergy: "Dairy" },
    ],
  },
  {
    name: "Ms. Neha Patel-Shah",
    lastName: "Patel-Shah",
    side: "bride",
    branch: "Bride's Friends",
    address: "201 W 79th St",
    city: "New York",
    country: "USA",
    outOfTown: true,
    addressing: "Ms. Neha Patel-Shah",
    priority: "A",
    source: "Bride's list",
    tags: ["International", "College crew"],
    hotel: "oberoi",
    roomType: "King",
    arriving: "JFK New York",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Neha", salutation: "Ms", role: "primary", age: "adult", vip: "honored", relationship: "College roommate", email: "neha.patelshah@email.com", whatsapp: false, dietary: ["vegan"], drinks: false, weddingPartyRole: "Bridesmaid", language: "English" },
    ],
  },
  // ─── GROOM'S SIDE — Mehta (paternal) ────────────────────────────────
  {
    name: "Mr. & Mrs. Ajay Mehta",
    lastName: "Mehta",
    side: "groom",
    branch: "Groom's Paternal",
    address: "2 Kensington Ct",
    city: "London",
    country: "UK",
    outOfTown: true,
    addressing: "Mr. & Mrs. Ajay Mehta",
    priority: "A",
    source: "Groom's list",
    tags: ["Immediate", "International"],
    hotel: "taj",
    roomType: "Suite",
    arriving: "London Heathrow",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Ajay", salutation: "Mr", role: "primary", age: "senior", vip: "immediate_family", relationship: "Father of the Groom", email: "ajay.mehta@email.com", phone: "+44 7700 900456", whatsapp: true, dietary: ["vegetarian"], drinks: true, language: "Gujarati" },
      { first: "Shilpa", salutation: "Mrs", role: "spouse", age: "senior", vip: "immediate_family", relationship: "Mother of the Groom", phone: "+44 7700 900457", whatsapp: true, dietary: ["vegetarian"], drinks: false, language: "Gujarati" },
    ],
  },
  {
    name: "Ms. Kavya Mehta",
    lastName: "Mehta",
    side: "groom",
    branch: "Groom's Paternal",
    address: "2 Kensington Ct",
    city: "London",
    country: "UK",
    outOfTown: true,
    addressing: "Ms. Kavya Mehta",
    priority: "A",
    source: "Groom's list",
    tags: ["Wedding party", "International"],
    hotel: "taj",
    roomType: "King",
    arriving: "London Heathrow",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Kavya", salutation: "Ms", role: "primary", age: "adult", vip: "immediate_family", relationship: "Sister of the Groom", email: "kavya.m@email.com", whatsapp: true, pronouns: "she/her", dietary: ["vegetarian"], drinks: true, weddingPartyRole: "Sister of the Groom", performing: true },
    ],
  },
  {
    name: "The Mehta Family (Vadodara)",
    lastName: "Mehta",
    side: "groom",
    branch: "Groom's Paternal",
    address: "Alkapuri",
    city: "Vadodara",
    country: "India",
    outOfTown: true,
    addressing: "Shri & Smt. Bharat Mehta and Family",
    priority: "A",
    source: "Groom's list",
    tags: ["Cousins", "Vadodara"],
    hotel: "trident",
    roomType: "Family Suite",
    arriving: "Vadodara",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Bharat", salutation: "Shri", role: "primary", age: "senior", vip: "close_family", relationship: "Uncle (father's brother)", dietary: ["vegetarian", "swaminarayan"], drinks: false, language: "Gujarati", notes: "Swaminarayan diet — no onion/garlic" },
      { first: "Jyoti", salutation: "Smt", role: "spouse", age: "senior", vip: "close_family", relationship: "Aunt", dietary: ["vegetarian", "swaminarayan"], drinks: false, language: "Gujarati" },
      { first: "Dhruv", role: "child", age: "adult", vip: "standard", relationship: "Cousin", dietary: ["vegetarian"], drinks: true, performing: true },
      { first: "Riya", role: "child", age: "teen", vip: "standard", relationship: "Cousin", dietary: ["vegetarian"] },
    ],
  },
  {
    name: "Mr. & Mrs. Sanjay Mehta",
    lastName: "Mehta",
    side: "groom",
    branch: "Groom's Paternal",
    address: "Thaltej",
    city: "Ahmedabad",
    country: "India",
    outOfTown: true,
    addressing: "Mr. & Mrs. Sanjay Mehta",
    priority: "B",
    source: "Groom's list",
    tags: ["Extended"],
    hotel: "trident",
    roomType: "King",
    arriving: "Ahmedabad",
    pickup: false,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Sanjay", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Father's cousin", dietary: ["vegetarian"], drinks: true },
      { first: "Hemal", salutation: "Mrs", role: "spouse", age: "adult", vip: "standard", relationship: "Father's cousin-in-law", dietary: ["vegetarian"] },
    ],
  },
  // ─── GROOM'S SIDE — Kapoor (maternal, Punjabi) ──────────────────────
  {
    name: "Mr. & Mrs. Inder Kapoor",
    lastName: "Kapoor",
    side: "groom",
    branch: "Groom's Maternal",
    address: "Vasant Vihar",
    city: "Delhi",
    country: "India",
    outOfTown: true,
    addressing: "Shri & Smt. Inder Kapoor",
    priority: "A",
    source: "Groom's list",
    tags: ["Grandparents", "Delhi"],
    hotel: "taj",
    roomType: "Suite",
    arriving: "Delhi",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Inder", salutation: "Shri", role: "primary", age: "senior", vip: "immediate_family", relationship: "Maternal Grandfather (Nana)", dietary: ["non_vegetarian"], drinks: false, language: "Punjabi", notes: "Diabetic — sugar-free options" },
      { first: "Gurmeet", salutation: "Smt", role: "spouse", age: "senior", vip: "immediate_family", relationship: "Maternal Grandmother (Nani)", dietary: ["vegetarian"], drinks: false, language: "Punjabi", notes: "Wheelchair access required" },
    ],
  },
  {
    name: "Col. & Mrs. Manpreet Kapoor",
    lastName: "Kapoor",
    side: "groom",
    branch: "Groom's Maternal",
    address: "Greater Kailash II",
    city: "Delhi",
    country: "India",
    outOfTown: true,
    addressing: "Col. & Mrs. Manpreet Kapoor",
    priority: "A",
    source: "Groom's list",
    tags: ["Uncle", "Delhi"],
    hotel: "taj",
    roomType: "King",
    arriving: "Delhi",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Manpreet", salutation: "Col", role: "primary", age: "senior", vip: "close_family", relationship: "Maternal Uncle (Mama)", dietary: ["non_vegetarian"], drinks: true, language: "Punjabi" },
      { first: "Simran", salutation: "Mrs", role: "spouse", age: "adult", vip: "close_family", relationship: "Aunt (Mami)", dietary: ["non_vegetarian"], drinks: true },
    ],
  },
  {
    name: "The Kapoor Family (Amritsar)",
    lastName: "Kapoor",
    side: "groom",
    branch: "Groom's Maternal",
    address: "Ranjit Avenue",
    city: "Amritsar",
    country: "India",
    outOfTown: true,
    addressing: "Mr. & Mrs. Harkirat Kapoor and Family",
    priority: "B",
    source: "Groom's list",
    tags: ["Cousins", "Amritsar"],
    hotel: "trident",
    roomType: "Family Suite",
    arriving: "Amritsar",
    pickup: true,
    events: ["sangeet", "baraat", "ceremony", "reception"],
    members: [
      { first: "Harkirat", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Cousin", dietary: ["non_vegetarian"], drinks: true, language: "Punjabi" },
      { first: "Harleen", salutation: "Mrs", role: "spouse", age: "adult", vip: "standard", relationship: "Cousin-in-law", dietary: ["non_vegetarian"], drinks: true },
      { first: "Aditya", last: "Kapoor", role: "child", age: "child", vip: "standard", relationship: "Nephew", dietary: ["vegetarian"] },
      { first: "Myra", last: "Kapoor", role: "child", age: "infant", vip: "standard", relationship: "Niece", dietary: ["vegetarian"], notes: "Requires high chair; kids' meal" },
    ],
  },
  // ─── GROOM'S SIDE — Friends ─────────────────────────────────────────
  {
    name: "Mr. Vikram Singh",
    lastName: "Singh",
    side: "groom",
    branch: "Groom's Friends",
    address: "Defence Colony",
    city: "Delhi",
    country: "India",
    outOfTown: true,
    addressing: "Mr. Vikram Singh",
    priority: "A",
    source: "Groom's list",
    tags: ["Best Man", "School"],
    hotel: "oberoi",
    roomType: "King",
    arriving: "Delhi",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Vikram", salutation: "Mr", role: "primary", age: "adult", vip: "honored", relationship: "Best friend since school", email: "vikram.singh@email.com", phone: "+91 98115 33322", whatsapp: true, dietary: ["non_vegetarian"], drinks: true, weddingPartyRole: "Best Man", performing: true },
    ],
  },
  {
    name: "Mr. Rohit & Dr. Priya Malhotra",
    lastName: "Malhotra",
    side: "groom",
    branch: "Groom's Friends",
    address: "Koregaon Park",
    city: "Pune",
    country: "India",
    outOfTown: true,
    addressing: "Mr. & Dr. Malhotra",
    priority: "A",
    source: "Groom's list",
    tags: ["Groomsman", "College"],
    hotel: "oberoi",
    roomType: "King",
    arriving: "Pune",
    pickup: false,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Rohit", salutation: "Mr", role: "primary", age: "adult", vip: "honored", relationship: "College best friend", email: "rohit.malhotra@email.com", whatsapp: true, dietary: ["non_vegetarian"], drinks: true, weddingPartyRole: "Groomsman" },
      { first: "Priya", last: "Malhotra", salutation: "Dr", role: "spouse", age: "adult", vip: "plus_one", relationship: "Plus-one (spouse)", dietary: ["vegetarian"], drinks: false },
    ],
  },
  {
    name: "Mr. Daniel Chen",
    lastName: "Chen",
    side: "groom",
    branch: "Groom's Friends",
    address: "1455 Market St",
    city: "San Francisco",
    country: "USA",
    outOfTown: true,
    addressing: "Mr. Daniel Chen",
    priority: "A",
    source: "Groom's list",
    tags: ["Work", "International"],
    hotel: "oberoi",
    roomType: "King",
    arriving: "San Francisco SFO",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Daniel", salutation: "Mr", role: "primary", age: "adult", vip: "honored", relationship: "Work colleague — London office", email: "daniel.chen@email.com", whatsapp: false, dietary: ["non_vegetarian", "gluten_free"], drinks: true, language: "English", notes: "First trip to India — prefers tour briefing" },
    ],
  },
  {
    name: "Mr. & Mrs. Sameer Joshi",
    lastName: "Joshi",
    side: "groom",
    branch: "Groom's Friends",
    address: "Powai",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Mr. & Mrs. Sameer Joshi",
    priority: "B",
    source: "Groom's list",
    tags: ["Work"],
    events: ["sangeet", "reception"],
    members: [
      { first: "Sameer", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Work friend", dietary: ["non_vegetarian"], drinks: true },
      { first: "Neeta", salutation: "Mrs", role: "spouse", age: "adult", vip: "plus_one", relationship: "Plus-one (spouse)", dietary: ["vegetarian"], drinks: false },
    ],
  },
  // ─── MUTUAL / JOINT ──────────────────────────────────────────────────
  {
    name: "Ms. Aditi Rao (Officiant)",
    lastName: "Rao",
    side: "mutual",
    branch: "Officiant / Wedding Party",
    address: "Worli",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Ms. Aditi Rao",
    priority: "A",
    source: "Joint",
    tags: ["Officiant"],
    events: ["haldi", "ceremony", "reception"],
    members: [
      { first: "Aditi", salutation: "Ms", role: "primary", age: "adult", vip: "honored", relationship: "Officiant (Pandit's assistant / reader)", email: "aditi.rao@email.com", phone: "+91 98201 99977", whatsapp: true, dietary: ["vegetarian"], drinks: false, weddingPartyRole: "Reader" },
    ],
  },
  {
    name: "Pandit Shashank Sharma",
    lastName: "Sharma",
    side: "mutual",
    branch: "Officiant / Wedding Party",
    address: "Matunga",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Pandit Shashank Sharma ji",
    priority: "A",
    source: "Joint",
    tags: ["Officiant", "Pandit"],
    events: ["pithi", "haldi", "ceremony"],
    members: [
      { first: "Shashank", salutation: "Pandit", role: "primary", age: "senior", vip: "honored", relationship: "Officiating Pandit", phone: "+91 98191 12312", dietary: ["vegetarian"], drinks: false, language: "Hindi", notes: "Sattvic meals only" },
    ],
  },
  {
    name: "The Agarwals (Family friends)",
    lastName: "Agarwal",
    side: "mutual",
    branch: "Mutual Family Friends",
    address: "Juhu",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Mr. & Mrs. Pankaj Agarwal and Family",
    priority: "B",
    source: "Joint",
    tags: ["Family Friends"],
    events: ["welcome", "sangeet", "ceremony", "reception"],
    members: [
      { first: "Pankaj", salutation: "Mr", role: "primary", age: "senior", vip: "standard", relationship: "Family friend (both sides)", dietary: ["vegetarian"], drinks: true },
      { first: "Sonal", salutation: "Mrs", role: "spouse", age: "senior", vip: "standard", relationship: "Family friend", dietary: ["vegetarian"] },
      { first: "Tara", role: "child", age: "teen", vip: "standard", relationship: "Family friend", dietary: ["vegetarian"] },
    ],
  },
  // ─── MORE BRIDE'S SIDE (fill out to 150) ────────────────────────────
  {
    name: "Mr. & Mrs. Ramesh Shah",
    lastName: "Shah",
    side: "bride",
    branch: "Bride's Paternal",
    address: "Bhavnagar",
    city: "Bhavnagar",
    country: "India",
    outOfTown: true,
    addressing: "Mr. & Mrs. Ramesh Shah",
    priority: "B",
    source: "Bride's list",
    tags: ["Extended", "Gujarat"],
    hotel: "trident",
    roomType: "Double",
    arriving: "Bhavnagar",
    pickup: true,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Ramesh", salutation: "Mr", role: "primary", age: "senior", vip: "standard", relationship: "Grandfather's brother", dietary: ["vegetarian", "jain"], drinks: false, language: "Gujarati" },
      { first: "Hansa", salutation: "Mrs", role: "spouse", age: "senior", vip: "standard", relationship: "Grand-aunt", dietary: ["vegetarian", "jain"], drinks: false },
    ],
  },
  {
    name: "Dr. Anita Sharma",
    lastName: "Sharma",
    side: "bride",
    branch: "Bride's Maternal",
    address: "Jor Bagh",
    city: "Delhi",
    country: "India",
    outOfTown: true,
    addressing: "Dr. Anita Sharma",
    priority: "B",
    source: "Mom's list",
    tags: ["Mom's friend"],
    hotel: "oberoi",
    roomType: "King",
    arriving: "Delhi",
    pickup: false,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Anita", salutation: "Dr", role: "primary", age: "senior", vip: "standard", relationship: "Mom's childhood friend", email: "dr.anita.sharma@email.com", dietary: ["vegetarian"], drinks: false },
    ],
  },
  {
    name: "The Banerjee Family",
    lastName: "Banerjee",
    side: "bride",
    branch: "Bride's Friends",
    address: "Salt Lake",
    city: "Kolkata",
    country: "India",
    outOfTown: true,
    addressing: "Mr. & Mrs. Arindam Banerjee",
    priority: "B",
    source: "Bride's list",
    tags: ["Kolkata"],
    hotel: "trident",
    roomType: "King",
    arriving: "Kolkata",
    pickup: true,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Arindam", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Family friend", dietary: ["non_vegetarian"], drinks: true, language: "Bengali" },
      { first: "Ruchira", salutation: "Mrs", role: "spouse", age: "adult", vip: "standard", relationship: "Family friend", dietary: ["non_vegetarian"], drinks: true },
    ],
  },
  {
    name: "Ms. Sneha Nair",
    lastName: "Nair",
    side: "bride",
    branch: "Bride's Friends",
    address: "Kochi",
    city: "Kochi",
    country: "India",
    outOfTown: true,
    addressing: "Ms. Sneha Nair",
    priority: "B",
    source: "Bride's list",
    tags: ["College crew", "Kerala"],
    hotel: "trident",
    roomType: "Double",
    arriving: "Kochi",
    pickup: true,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Sneha", salutation: "Ms", role: "primary", age: "adult", vip: "standard", relationship: "College friend", dietary: ["non_vegetarian"], drinks: false, language: "Malayalam", performing: true },
    ],
  },
  {
    name: "Mr. & Mrs. Anand Shetty",
    lastName: "Shetty",
    side: "bride",
    branch: "Bride's Paternal",
    address: "Mangalore",
    city: "Mangalore",
    country: "India",
    outOfTown: true,
    addressing: "Mr. & Mrs. Anand Shetty",
    priority: "B",
    source: "Dad's list",
    tags: ["Dad's college"],
    hotel: "trident",
    roomType: "King",
    arriving: "Mangalore",
    pickup: false,
    events: ["sangeet", "ceremony", "reception"],
    rsvpOverride: { sangeet: "declined", ceremony: "declined", reception: "declined" },
    members: [
      { first: "Anand", salutation: "Mr", role: "primary", age: "senior", vip: "standard", relationship: "Dad's college roommate", dietary: ["non_vegetarian"], drinks: true },
      { first: "Sunita", last: "Shetty", salutation: "Mrs", role: "spouse", age: "senior", vip: "standard", relationship: "Dad's college roommate's wife", dietary: ["vegetarian"], drinks: false },
    ],
  },
  {
    name: "Mr. & Mrs. Jayesh Thakkar",
    lastName: "Thakkar",
    side: "bride",
    branch: "Bride's Paternal",
    address: "Surat",
    city: "Surat",
    country: "India",
    outOfTown: true,
    addressing: "Mr. & Mrs. Jayesh Thakkar",
    priority: "B",
    source: "Dad's list",
    tags: ["Business", "Gujarat"],
    hotel: "trident",
    roomType: "Double",
    arriving: "Surat",
    pickup: false,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Jayesh", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Business acquaintance", dietary: ["vegetarian", "jain"], drinks: false },
      { first: "Falguni", salutation: "Mrs", role: "spouse", age: "adult", vip: "standard", relationship: "Business acquaintance", dietary: ["vegetarian", "jain"], drinks: false },
    ],
  },
  {
    name: "Ms. Maya Krishnan",
    lastName: "Krishnan",
    side: "bride",
    branch: "Bride's Friends",
    address: "Indiranagar",
    city: "Bengaluru",
    country: "India",
    outOfTown: true,
    addressing: "Ms. Maya Krishnan",
    priority: "B",
    source: "Bride's list",
    tags: ["Work"],
    hotel: "oberoi",
    roomType: "Double",
    arriving: "Bengaluru",
    pickup: false,
    events: ["sangeet", "reception"],
    members: [
      { first: "Maya", salutation: "Ms", role: "primary", age: "adult", vip: "standard", relationship: "Work friend", dietary: ["vegetarian"], drinks: true },
    ],
  },
  {
    name: "Mr. Arjun Pillai",
    lastName: "Pillai",
    side: "bride",
    branch: "Bride's Friends",
    address: "Thiruvananthapuram",
    city: "Thiruvananthapuram",
    country: "India",
    outOfTown: true,
    addressing: "Mr. Arjun Pillai",
    priority: "C",
    source: "Bride's list",
    tags: ["Childhood", "Kerala"],
    events: ["sangeet", "reception"],
    rsvpOverride: { sangeet: "pending", reception: "pending" },
    members: [
      { first: "Arjun", last: "Pillai", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Childhood neighbor", dietary: ["non_vegetarian"], drinks: true },
    ],
  },
  // ─── MORE GROOM'S SIDE ──────────────────────────────────────────────
  {
    name: "Mr. & Mrs. Suresh Mehta",
    lastName: "Mehta",
    side: "groom",
    branch: "Groom's Paternal",
    address: "Rajkot",
    city: "Rajkot",
    country: "India",
    outOfTown: true,
    addressing: "Mr. & Mrs. Suresh Mehta",
    priority: "B",
    source: "Groom's list",
    tags: ["Extended", "Gujarat"],
    hotel: "trident",
    roomType: "King",
    arriving: "Rajkot",
    pickup: false,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Suresh", salutation: "Mr", role: "primary", age: "senior", vip: "standard", relationship: "Grand-uncle", dietary: ["vegetarian", "swaminarayan"], drinks: false, language: "Gujarati" },
      { first: "Bhavana", salutation: "Mrs", role: "spouse", age: "senior", vip: "standard", relationship: "Grand-aunt", dietary: ["vegetarian", "swaminarayan"], drinks: false },
    ],
  },
  {
    name: "Mrs. Rekha Chopra",
    lastName: "Chopra",
    side: "groom",
    branch: "Groom's Maternal",
    address: "Panchkula",
    city: "Chandigarh",
    country: "India",
    outOfTown: true,
    addressing: "Mrs. Rekha Chopra",
    priority: "B",
    source: "Mom's list",
    tags: ["Mom's friend"],
    hotel: "trident",
    roomType: "Double",
    arriving: "Chandigarh",
    pickup: true,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Rekha", salutation: "Mrs", role: "primary", age: "senior", vip: "standard", relationship: "Mom's best friend", dietary: ["non_vegetarian"], drinks: false, language: "Punjabi", notes: "Widow — include in family photos per mom's request", flagged: true },
    ],
  },
  {
    name: "The Gill Family",
    lastName: "Gill",
    side: "groom",
    branch: "Groom's Maternal",
    address: "Ludhiana",
    city: "Ludhiana",
    country: "India",
    outOfTown: true,
    addressing: "S. & Sdn. Gurpreet Gill and Family",
    priority: "B",
    source: "Groom's list",
    tags: ["Cousins", "Punjab"],
    hotel: "trident",
    roomType: "Family Suite",
    arriving: "Ludhiana",
    pickup: true,
    events: ["sangeet", "baraat", "ceremony", "reception"],
    members: [
      { first: "Gurpreet", salutation: "S.", role: "primary", age: "adult", vip: "standard", relationship: "Second cousin", dietary: ["non_vegetarian"], drinks: true, language: "Punjabi" },
      { first: "Manreet", salutation: "Sdn.", role: "spouse", age: "adult", vip: "standard", relationship: "Second cousin-in-law", dietary: ["non_vegetarian"] },
      { first: "Arav", last: "Gill", role: "child", age: "child", vip: "standard", relationship: "Nephew", dietary: ["vegetarian"] },
    ],
  },
  {
    name: "Mr. & Mrs. Ketan Trivedi",
    lastName: "Trivedi",
    side: "groom",
    branch: "Groom's Paternal",
    address: "Belgravia",
    city: "London",
    country: "UK",
    outOfTown: true,
    addressing: "Mr. & Mrs. Ketan Trivedi",
    priority: "A",
    source: "Groom's list",
    tags: ["International", "Cousins"],
    hotel: "taj",
    roomType: "King",
    arriving: "London Heathrow",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Ketan", salutation: "Mr", role: "primary", age: "adult", vip: "close_family", relationship: "Cousin (Groom's side)", email: "ketan.trivedi@email.com", whatsapp: true, dietary: ["vegetarian"], drinks: true },
      { first: "Amisha", salutation: "Mrs", role: "spouse", age: "adult", vip: "close_family", relationship: "Cousin-in-law", dietary: ["vegetarian"], drinks: false },
    ],
  },
  {
    name: "Mr. James Williams",
    lastName: "Williams",
    side: "groom",
    branch: "Groom's Friends",
    address: "1 Baker Street",
    city: "London",
    country: "UK",
    outOfTown: true,
    addressing: "Mr. James Williams",
    priority: "A",
    source: "Groom's list",
    tags: ["University", "International"],
    hotel: "oberoi",
    roomType: "King",
    arriving: "London Heathrow",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "James", salutation: "Mr", role: "primary", age: "adult", vip: "honored", relationship: "University mate", email: "james.williams@email.com", dietary: ["non_vegetarian", "nut_allergy"], drinks: true, weddingPartyRole: "Groomsman", language: "English", notes: "Severe peanut allergy" },
    ],
  },
  {
    name: "The O'Brien Family",
    lastName: "O'Brien",
    side: "groom",
    branch: "Groom's Friends",
    address: "Dublin 4",
    city: "Dublin",
    country: "Ireland",
    outOfTown: true,
    addressing: "Mr. & Mrs. Conor O'Brien",
    priority: "B",
    source: "Groom's list",
    tags: ["International"],
    hotel: "oberoi",
    roomType: "King",
    arriving: "Dublin",
    pickup: true,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Conor", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "University friend", dietary: ["non_vegetarian"], drinks: true, language: "English" },
      { first: "Siobhan", salutation: "Mrs", role: "spouse", age: "adult", vip: "plus_one", relationship: "Plus-one (spouse)", dietary: ["non_vegetarian", "gluten_free"], drinks: true },
    ],
  },
  {
    name: "Ms. Anika Bhatia",
    lastName: "Bhatia",
    side: "groom",
    branch: "Groom's Friends",
    address: "Worli",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Ms. Anika Bhatia",
    priority: "B",
    source: "Groom's list",
    tags: ["School"],
    events: ["sangeet", "reception"],
    members: [
      { first: "Anika", salutation: "Ms", role: "primary", age: "adult", vip: "standard", relationship: "School friend", dietary: ["non_vegetarian"], drinks: true, performing: true },
    ],
  },
  {
    name: "Mr. Rahul Dev",
    lastName: "Dev",
    side: "groom",
    branch: "Groom's Friends",
    address: "Gurgaon",
    city: "Gurgaon",
    country: "India",
    outOfTown: true,
    addressing: "Mr. Rahul Dev",
    priority: "B",
    source: "Groom's list",
    tags: ["Work", "Delhi"],
    hotel: "oberoi",
    roomType: "Double",
    arriving: "Delhi",
    pickup: false,
    events: ["sangeet", "reception"],
    members: [
      { first: "Rahul", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Work friend", dietary: ["non_vegetarian"], drinks: true },
    ],
  },
  {
    name: "Dr. & Dr. Ravi Subramanian",
    lastName: "Subramanian",
    side: "groom",
    branch: "Groom's Paternal",
    address: "Mylapore",
    city: "Chennai",
    country: "India",
    outOfTown: true,
    addressing: "Dr. & Dr. Ravi Subramanian",
    priority: "A",
    source: "Dad's list",
    tags: ["Dad's mentor"],
    hotel: "taj",
    roomType: "King",
    arriving: "Chennai",
    pickup: true,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Ravi", salutation: "Dr", role: "primary", age: "senior", vip: "honored", relationship: "Father's mentor", dietary: ["vegetarian"], drinks: false, language: "Tamil" },
      { first: "Uma", last: "Subramanian", salutation: "Dr", role: "spouse", age: "senior", vip: "honored", relationship: "Mentor's spouse", dietary: ["vegetarian"], drinks: false },
    ],
  },
  {
    name: "Mr. & Mrs. Nikhil Bhatt",
    lastName: "Bhatt",
    side: "groom",
    branch: "Groom's Paternal",
    address: "Juhu",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Mr. & Mrs. Nikhil Bhatt",
    priority: "B",
    source: "Groom's list",
    tags: ["Family Friends", "Mumbai"],
    events: ["welcome", "sangeet", "ceremony", "reception"],
    members: [
      { first: "Nikhil", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Family friend", dietary: ["vegetarian"], drinks: true },
      { first: "Shweta", salutation: "Mrs", role: "spouse", age: "adult", vip: "standard", relationship: "Family friend", dietary: ["vegetarian"] },
    ],
  },
  {
    name: "Ms. Meghna Pandey",
    lastName: "Pandey",
    side: "bride",
    branch: "Bride's Friends",
    address: "South Ex",
    city: "Delhi",
    country: "India",
    outOfTown: true,
    addressing: "Ms. Meghna Pandey",
    priority: "B",
    source: "Bride's list",
    tags: ["College crew", "Delhi"],
    hotel: "oberoi",
    roomType: "Double",
    arriving: "Delhi",
    pickup: false,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Meghna", salutation: "Ms", role: "primary", age: "adult", vip: "standard", relationship: "College roommate (years 2-4)", dietary: ["non_vegetarian"], drinks: true, performing: true },
    ],
  },
  {
    name: "Mr. & Mrs. Tejas Sheth",
    lastName: "Sheth",
    side: "bride",
    branch: "Bride's Paternal",
    address: "Hiranandani",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Mr. & Mrs. Tejas Sheth",
    priority: "B",
    source: "Dad's list",
    tags: ["Business", "Mumbai"],
    events: ["sangeet", "reception"],
    members: [
      { first: "Tejas", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Father's business partner", dietary: ["vegetarian", "jain"], drinks: false },
      { first: "Rupal", salutation: "Mrs", role: "spouse", age: "adult", vip: "standard", relationship: "Business partner's spouse", dietary: ["vegetarian", "jain"], drinks: false },
    ],
  },
  {
    name: "The Malhotras (Singapore)",
    lastName: "Malhotra",
    side: "groom",
    branch: "Groom's Maternal",
    address: "Orchard Road",
    city: "Singapore",
    country: "Singapore",
    outOfTown: true,
    addressing: "Mr. & Mrs. Deepak Malhotra and Family",
    priority: "A",
    source: "Mom's list",
    tags: ["International", "Cousins"],
    hotel: "taj",
    roomType: "Family Suite",
    arriving: "Singapore Changi",
    pickup: true,
    events: EVENTS.map((e) => e.id),
    members: [
      { first: "Deepak", salutation: "Mr", role: "primary", age: "adult", vip: "close_family", relationship: "Maternal Cousin", email: "deepak.m@email.com", dietary: ["non_vegetarian"], drinks: true, language: "English" },
      { first: "Pooja", last: "Malhotra", salutation: "Mrs", role: "spouse", age: "adult", vip: "close_family", relationship: "Cousin-in-law", dietary: ["vegetarian"] },
      { first: "Zain", last: "Malhotra", role: "child", age: "teen", vip: "standard", relationship: "First cousin once removed", dietary: ["non_vegetarian"] },
      { first: "Aria", last: "Malhotra", role: "child", age: "child", vip: "standard", relationship: "First cousin once removed", dietary: ["vegetarian"], notes: "Gluten-free for digestive reasons" },
    ],
  },
  {
    name: "Mr. Aarav Khanna",
    lastName: "Khanna",
    side: "bride",
    branch: "Bride's Friends",
    address: "Santacruz",
    city: "Mumbai",
    country: "India",
    outOfTown: false,
    addressing: "Mr. Aarav Khanna",
    priority: "C",
    source: "Bride's list",
    tags: ["Extended"],
    events: ["reception"],
    rsvpOverride: { reception: "no_response" },
    members: [
      { first: "Aarav", last: "Khanna", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Friend of friend", dietary: ["non_vegetarian"], drinks: true },
    ],
  },
  {
    name: "Ms. Tanvi Raghunathan",
    lastName: "Raghunathan",
    side: "bride",
    branch: "Bride's Maternal",
    address: "T. Nagar",
    city: "Chennai",
    country: "India",
    outOfTown: true,
    addressing: "Ms. Tanvi Raghunathan",
    priority: "B",
    source: "Bride's list",
    tags: ["Cousins", "Chennai"],
    hotel: "trident",
    roomType: "Double",
    arriving: "Chennai",
    pickup: true,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Tanvi", last: "Raghunathan", salutation: "Ms", role: "primary", age: "adult", vip: "standard", relationship: "Second cousin", dietary: ["vegetarian"], drinks: false, language: "Tamil", performing: true },
    ],
  },
  {
    name: "Col. (Retd) Bikram Bajwa",
    lastName: "Bajwa",
    side: "groom",
    branch: "Groom's Maternal",
    address: "Sector 9",
    city: "Chandigarh",
    country: "India",
    outOfTown: true,
    addressing: "Col. (Retd) Bikram Bajwa",
    priority: "A",
    source: "Groom's list",
    tags: ["Grandparents' generation"],
    hotel: "taj",
    roomType: "King",
    arriving: "Chandigarh",
    pickup: true,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Bikram", salutation: "Col", role: "primary", age: "senior", vip: "honored", relationship: "Nana's cousin", dietary: ["non_vegetarian"], drinks: true, language: "Punjabi", notes: "Ground floor room; cane user" },
    ],
  },
  {
    name: "The Nairs (Singapore)",
    lastName: "Nair",
    side: "bride",
    branch: "Bride's Friends",
    address: "Holland Village",
    city: "Singapore",
    country: "Singapore",
    outOfTown: true,
    addressing: "Mr. & Mrs. Arun Nair",
    priority: "B",
    source: "Bride's list",
    tags: ["International", "Work"],
    hotel: "oberoi",
    roomType: "King",
    arriving: "Singapore Changi",
    pickup: true,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Arun", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "Work friend (expat circle)", dietary: ["non_vegetarian"], drinks: true, language: "Malayalam" },
      { first: "Divya", last: "Nair", salutation: "Mrs", role: "spouse", age: "adult", vip: "plus_one", relationship: "Plus-one (spouse)", dietary: ["vegetarian"] },
    ],
  },
  {
    name: "Ms. Radhika Bose",
    lastName: "Bose",
    side: "bride",
    branch: "Bride's Friends",
    address: "Park Street",
    city: "Kolkata",
    country: "India",
    outOfTown: true,
    addressing: "Ms. Radhika Bose",
    priority: "B",
    source: "Bride's list",
    tags: ["Work"],
    hotel: "trident",
    roomType: "Double",
    arriving: "Kolkata",
    pickup: false,
    events: ["sangeet", "reception"],
    members: [
      { first: "Radhika", salutation: "Ms", role: "primary", age: "adult", vip: "standard", relationship: "Former colleague", dietary: ["non_vegetarian"], drinks: true, language: "Bengali" },
    ],
  },
  {
    name: "Mr. Kabir Khanna",
    lastName: "Khanna",
    side: "groom",
    branch: "Groom's Friends",
    address: "Nungambakkam",
    city: "Chennai",
    country: "India",
    outOfTown: true,
    addressing: "Mr. Kabir Khanna",
    priority: "B",
    source: "Groom's list",
    tags: ["School"],
    hotel: "oberoi",
    roomType: "Double",
    arriving: "Chennai",
    pickup: false,
    events: ["sangeet", "ceremony", "reception"],
    members: [
      { first: "Kabir", salutation: "Mr", role: "primary", age: "adult", vip: "standard", relationship: "High school friend", dietary: ["non_vegetarian"], drinks: true },
    ],
  },
];

// Default RSVP generator — create a realistic mix
function defaultRsvp(
  seedIndex: number,
  eventIds: string[],
  override: Partial<Record<string, RsvpStatus>> | undefined,
): Record<string, RsvpStatus> {
  const rsvp: Record<string, RsvpStatus> = {};
  for (const e of EVENTS) {
    if (!eventIds.includes(e.id)) continue;
    if (override && override[e.id]) {
      rsvp[e.id] = override[e.id]!;
      continue;
    }
    // Deterministic mix based on seed index
    const hash = (seedIndex * 31 + e.id.charCodeAt(0)) % 10;
    if (hash < 6) rsvp[e.id] = "confirmed";
    else if (hash < 8) rsvp[e.id] = "pending";
    else if (hash < 9) rsvp[e.id] = "no_response";
    else rsvp[e.id] = "tentative";
  }
  return rsvp;
}

function deriveCategories(
  seed: HouseholdSeed,
  m: MemberSeed,
): string[] {
  const cats = new Set<string>();
  const rel = m.relationship.toLowerCase();
  const tags = seed.tags.map((t) => t.toLowerCase());

  if (rel.includes("cousin")) cats.add("Cousins");
  if (rel.includes("uncle") || rel.includes("aunt") || rel.includes("mama") || rel.includes("mami"))
    cats.add("Aunts & Uncles");
  if (rel.includes("grand") || rel.includes("thatha") || rel.includes("paatti") || rel.includes("ba") || rel.includes("dada") || rel.includes("dadi") || rel.includes("nana") || rel.includes("nani"))
    cats.add("Grandparents");
  if (rel.includes("father") || rel.includes("mother")) cats.add("Parents");
  if (rel.includes("brother") || rel.includes("sister") || rel.includes("sibling"))
    cats.add("Siblings");

  if (tags.some((t) => t.includes("bridesmaid"))) cats.add("Bridesmaids");
  if (tags.some((t) => t.includes("groomsmen") || t === "groomsman")) cats.add("Groomsmen");
  if (tags.some((t) => t.includes("college") || t.includes("mba"))) cats.add("College Friends");
  if (tags.some((t) => t === "school" || t.includes("school"))) cats.add("School Friends");
  if (tags.some((t) => t.includes("work") || t.includes("office"))) cats.add("Work");
  if (tags.some((t) => t.includes("family friend"))) cats.add("Family Friends");
  if (tags.some((t) => t === "international")) cats.add("International");
  if (tags.some((t) => t === "immediate")) cats.add("Immediate Family");
  if (tags.some((t) => t.includes("cousins"))) cats.add("Cousins");
  if (tags.some((t) => t === "wedding party")) cats.add("Wedding Party");

  if (m.weddingPartyRole) cats.add("Wedding Party");
  if (m.vip === "immediate_family") cats.add("VIP");
  if (m.vip === "honored") cats.add("VIP");

  // Always ensure at least one category
  if (cats.size === 0) cats.add("Extended");
  return Array.from(cats);
}

function deriveRelationshipLabels(
  seed: HouseholdSeed,
  m: MemberSeed,
): { toBride?: string; toGroom?: string } {
  if (seed.side === "bride") {
    return { toBride: m.relationship };
  }
  if (seed.side === "groom") {
    return { toGroom: m.relationship };
  }
  // Mutual — attribute to both
  return { toBride: m.relationship, toGroom: m.relationship };
}

function deriveNeedsAssistance(m: MemberSeed): boolean {
  const n = (m.notes ?? "").toLowerCase();
  if (!n) return false;
  return (
    n.includes("mobility") ||
    n.includes("wheelchair") ||
    n.includes("hearing") ||
    n.includes("knee") ||
    n.includes("ground floor")
  );
}

// Deterministic day-offsets from the "Apr 15" guest-list kickoff, used so
// the seeded activity log feels plausible without hitting Date.now() at
// build time (which would drift with every render).
const KICKOFF_DAYS = ["Apr 15", "Apr 18", "Apr 22", "May 2", "May 10", "May 18", "May 24"];

function seedActivityLog(
  seed: HouseholdSeed,
  m: MemberSeed,
  hIdx: number,
  mIdx: number,
  rsvp: Record<string, RsvpStatus>,
): { action: string; timestamp: string }[] {
  const log: { action: string; timestamp: string }[] = [];
  log.push({ action: "Added to guest list", timestamp: KICKOFF_DAYS[0] });

  if (Object.values(rsvp).some((s) => s === "confirmed")) {
    const ev = Object.entries(rsvp).find(([, s]) => s === "confirmed");
    if (ev) {
      const evLabel = EVENTS.find((e) => e.id === ev[0])?.label ?? ev[0];
      log.push({
        action: `RSVP confirmed for ${evLabel}`,
        timestamp: KICKOFF_DAYS[3],
      });
    }
  }
  if (seed.hotel) {
    const hotelName = HOTELS.find((h) => h.id === seed.hotel)?.name ?? seed.hotel;
    log.push({
      action: `Hotel assigned: ${hotelName}`,
      timestamp: KICKOFF_DAYS[4],
    });
  }
  if (m.weddingPartyRole) {
    log.push({
      action: `Added to wedding party as ${m.weddingPartyRole}`,
      timestamp: KICKOFF_DAYS[(hIdx + mIdx) % KICKOFF_DAYS.length],
    });
  }
  return log;
}

function buildMockData(): { guests: Guest[]; households: Household[] } {
  const households: Household[] = [];
  const guests: Guest[] = [];

  HOUSEHOLD_SEEDS.forEach((seed, hIdx) => {
    const hid = `h${hIdx + 1}`;
    households.push({
      id: hid,
      displayName: seed.name,
      primaryLastName: seed.lastName,
      side: seed.side,
      branch: seed.branch,
      invitationAddressing: seed.addressing,
      mailingAddress: seed.address,
      city: seed.city,
      country: seed.country,
      outOfTown: seed.outOfTown,
      notes: seed.notes,
    });

    seed.members.forEach((m, mIdx) => {
      const gid = `${hid}-g${mIdx + 1}`;
      const rsvp = defaultRsvp(hIdx + mIdx, seed.events, seed.rsvpOverride);
      const isPlusOne = m.role === "plus_one" || m.vip === "plus_one";
      const rel = deriveRelationshipLabels(seed, m);
      guests.push({
        id: gid,
        householdId: hid,
        householdRole: m.role,
        firstName: m.first,
        lastName: m.last ?? seed.lastName,
        salutation: m.salutation,
        ageCategory: m.age,
        side: seed.side,
        familyBranch: seed.branch,
        relationship: m.relationship,
        vipTier: m.vip,
        email: m.email,
        phone: m.phone,
        whatsappPreferred: m.whatsapp,
        city: seed.city,
        country: seed.country,
        preferredLanguage: m.language,
        pronouns: m.pronouns,
        dietary: m.dietary,
        allergyNotes: m.allergy,
        drinks: m.drinks,
        outOfTown: seed.outOfTown,
        arrivingFrom: seed.arriving,
        needsPickup: seed.pickup,
        hotelId: seed.hotel,
        roomType: seed.roomType,
        weddingPartyRole: m.weddingPartyRole,
        performingAtSangeet: m.performing,
        rsvp,
        invitationSent: true,
        invitationDelivery: "delivered",
        giftReceived: hIdx % 7 === 0,
        thankYouSent: hIdx % 14 === 0,
        tags: seed.tags,
        priorityTier: seed.priority,
        source: seed.source,
        addedBy: seed.source.includes("Bride") ? "Priya" : seed.source.includes("Groom") ? "Arjun" : "Joint",
        notes: m.notes,
        flagged: m.flagged,
        categories: deriveCategories(seed, m),
        relationshipToBride: rel.toBride,
        relationshipToGroom: rel.toGroom,
        plusOne: isPlusOne,
        plusOneOf: isPlusOne && mIdx > 0 ? `${hid}-g1` : undefined,
        needsAssistance: deriveNeedsAssistance(m),
        activityLog: seedActivityLog(seed, m, hIdx, mIdx, rsvp),
      });
    });
  });

  return { guests, households };
}

// ═══════════════════════════════════════════════════════════════════════════
//   Helpers
// ═══════════════════════════════════════════════════════════════════════════

function formatToday(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function avatarInitials(firstName: string, lastName: string): string {
  const a = firstName.charAt(0).toUpperCase();
  const b = lastName.charAt(0).toUpperCase();
  return `${a}${b}`;
}

function rsvpSummary(g: Guest): { confirmed: number; pending: number; declined: number; total: number } {
  const counts = { confirmed: 0, pending: 0, declined: 0, total: 0 };
  for (const status of Object.values(g.rsvp)) {
    counts.total++;
    if (status === "confirmed") counts.confirmed++;
    else if (status === "declined") counts.declined++;
    else counts.pending++;
  }
  return counts;
}

function householdHeadcount(guests: Guest[], householdId: string): number {
  return guests.filter((g) => g.householdId === householdId).length;
}

function householdRsvpForEvent(
  guests: Guest[],
  householdId: string,
  eventId: string,
): { confirmed: number; pending: number; declined: number; invited: number } {
  const r = { confirmed: 0, pending: 0, declined: 0, invited: 0 };
  for (const g of guests) {
    if (g.householdId !== householdId) continue;
    const s = g.rsvp[eventId];
    if (!s) continue;
    r.invited++;
    if (s === "confirmed") r.confirmed++;
    else if (s === "declined") r.declined++;
    else r.pending++;
  }
  return r;
}

// ═══════════════════════════════════════════════════════════════════════════
//   Main page
// ═══════════════════════════════════════════════════════════════════════════

const TRAVEL_ENRICHMENTS: Record<string, Partial<Guest>> = {
  // Mehta family — Groom's parents from London
  "h16-g1": {
    street1: "2 Kensington Court", postalCode: "W8 5DL", state: "London",
    arrivalDate: "Jun 5", arrivalTime: "04:25", arrivalAirline: "British Airways",
    arrivalFlight: "BA 139", arrivalAirport: "BOM (T2)", arrivalTerminal: "Terminal 2",
    arrivalConfirmation: "BA8K2P7", pickupAssigned: "Venkat (driver)",
    pickupVehicle: "Innova Crysta (MH 01 AB 1234)",
    departureDate: "Jun 13", departureTime: "01:40", departureAirline: "British Airways",
    departureFlight: "BA 138", departureAirport: "BOM (T2)", departureTerminal: "Terminal 2",
    dropoffAssigned: "Venkat (driver)",
    checkInDate: "Jun 5", checkOutDate: "Jun 13", nightsCovered: "yes",
    transportBetweenEvents: "Private car (dedicated)",
  },
  "h16-g2": {
    street1: "2 Kensington Court", postalCode: "W8 5DL", state: "London",
    arrivalDate: "Jun 5", arrivalTime: "04:25", arrivalAirline: "British Airways",
    arrivalFlight: "BA 139", arrivalAirport: "BOM (T2)",
    departureDate: "Jun 13", departureTime: "01:40", departureAirline: "British Airways",
    departureFlight: "BA 138",
    checkInDate: "Jun 5", checkOutDate: "Jun 13", nightsCovered: "yes",
  },
  // Iyer family — Bride's grandparents from Chennai
  "h5-g1": {
    street1: "12 1st Cross Street", street2: "Abhiramapuram",
    state: "Tamil Nadu", postalCode: "600018",
    arrivalDate: "Jun 6", arrivalTime: "11:30", arrivalAirline: "IndiGo",
    arrivalFlight: "6E 514", arrivalAirport: "BOM (T1)",
    pickupAssigned: "Ramesh (driver)", pickupVehicle: "Toyota Camry",
    checkInDate: "Jun 6", checkOutDate: "Jun 12", nightsCovered: "yes",
    transportBetweenEvents: "Assigned driver (wheelchair accessible)",
  },
  // Desai family — London cousins
  "h14-g1": {
    street1: "42 Wimpole Street", postalCode: "W1G 8SA", state: "London",
    email2: "nirav.desai.work@firm.co.uk",
    phone2: "+44 20 7946 0123",
    arrivalDate: "Jun 6", arrivalTime: "13:15", arrivalAirline: "Virgin Atlantic",
    arrivalFlight: "VS 356", arrivalAirport: "BOM (T2)",
    pickupAssigned: "Airport shuttle",
    checkInDate: "Jun 6", checkOutDate: "Jun 12", nightsCovered: "partial",
  },
  // Malhotras Singapore
  "h33-g1": {
    street1: "181 Orchard Road", street2: "#12-04",
    postalCode: "238896", state: "Singapore",
    arrivalDate: "Jun 7", arrivalTime: "22:45", arrivalAirline: "Singapore Airlines",
    arrivalFlight: "SQ 422", arrivalAirport: "BOM (T2)",
    pickupAssigned: "Sanjay (driver)", pickupVehicle: "Honda Odyssey",
    checkInDate: "Jun 7", checkOutDate: "Jun 11", nightsCovered: "yes",
  },
  // Daniel Chen — SF
  "h23-g1": {
    street1: "1455 Market Street", street2: "Apt 2201",
    city: "San Francisco", state: "CA", postalCode: "94103", country: "USA",
    arrivalDate: "Jun 7", arrivalTime: "23:55", arrivalAirline: "United",
    arrivalFlight: "UA 867", arrivalAirport: "BOM (T2)",
    pickupAssigned: "Airport shuttle",
    checkInDate: "Jun 7", checkOutDate: "Jun 11", nightsCovered: "no",
    transportBetweenEvents: "Uber",
  },
  // Shah Ahmedabad
  "h3-g1": {
    street1: "Plot 27, Bodakdev", state: "Gujarat", postalCode: "380015",
    arrivalDate: "Jun 7", arrivalTime: "09:10", arrivalAirline: "IndiGo",
    arrivalFlight: "6E 342", arrivalAirport: "BOM (T1)",
    pickupAssigned: "Jignesh (driver)",
    checkInDate: "Jun 7", checkOutDate: "Jun 11",
  },
};

function applyTravelEnrichments(guests: Guest[]): Guest[] {
  return guests.map((g) => {
    const base = TRAVEL_ENRICHMENTS[g.id] ? { ...g, ...TRAVEL_ENRICHMENTS[g.id] } : g;
    const derived = deriveTravelFromFlatFields(base);
    return derived;
  });
}

// Backfill the structured `flights` + `ground` objects from the legacy flat
// arrival/departure/pickup fields. The Flights + Pickups tabs treat these
// structured fields as source of truth; writes through the UI replace them
// atomically. Only runs when `flights` is absent, so user edits aren't
// overwritten on re-enrichment.
const FLIGHT_ARRIVAL_DATES_2026: Record<string, string> = {
  "Jun 5": "2026-06-05",
  "Jun 6": "2026-06-06",
  "Jun 7": "2026-06-07",
  "Jun 8": "2026-06-08",
  "Jun 9": "2026-06-09",
  "Jun 10": "2026-06-10",
  "Jun 11": "2026-06-11",
  "Jun 12": "2026-06-12",
  "Jun 13": "2026-06-13",
};

function toIsoDatetime(displayDate: string | undefined, time: string | undefined): string {
  if (!displayDate) return "";
  const iso = FLIGHT_ARRIVAL_DATES_2026[displayDate];
  if (!iso) return "";
  const t = time && /^\d{1,2}:\d{2}$/.test(time) ? time.padStart(5, "0") : "12:00";
  return `${iso}T${t}:00+05:30`;
}

function deriveTravelFromFlatFields(g: Guest): Guest {
  if (g.flights || g.ground) return g;
  const flights: GuestFlight[] = [];
  if (g.arrivalFlight) {
    flights.push({
      id: `fl-arr-${g.id}`,
      flightNumber: g.arrivalFlight,
      direction: "arrival",
      airline: g.arrivalAirline ?? detectAirline(g.arrivalFlight),
      origin: g.arrivingFrom ?? g.city,
      destination: g.arrivalAirport ?? "BOM",
      scheduledDatetime: toIsoDatetime(g.arrivalDate, g.arrivalTime),
      terminal: g.arrivalTerminal,
      status: "scheduled",
      notes: g.arrivalConfirmation ? `Conf: ${g.arrivalConfirmation}` : "",
    });
  }
  if (g.departureFlight) {
    flights.push({
      id: `fl-dep-${g.id}`,
      flightNumber: g.departureFlight,
      direction: "departure",
      airline: g.departureAirline ?? detectAirline(g.departureFlight),
      origin: g.departureAirport ?? "BOM",
      destination: g.arrivingFrom ?? g.city,
      scheduledDatetime: toIsoDatetime(g.departureDate, g.departureTime),
      terminal: g.departureTerminal,
      status: "scheduled",
    });
  }

  let ground: GroundTransport | undefined;
  if (g.pickupAssigned || g.needsPickup) {
    const driverMatch = g.pickupAssigned?.match(/^([^(]+)\s*\(([^)]+)\)/);
    ground = {
      pickupAssigned: Boolean(g.pickupAssigned),
      driverName: driverMatch ? driverMatch[1].trim() : g.pickupAssigned,
      vehicleInfo: g.pickupVehicle,
      pickupLocation: g.arrivalAirport
        ? `${g.arrivalAirport} arrivals`
        : "Airport arrivals",
      pickupTime: toIsoDatetime(g.arrivalDate, g.arrivalTime),
    };
  }

  return {
    ...g,
    flights: flights.length ? flights : undefined,
    ground,
  };
}

// IATA prefix → airline name. Covers the common carriers for Mumbai-bound
// international + domestic traffic. Returns empty string when unrecognized.
const AIRLINE_PREFIXES: Record<string, string> = {
  AI: "Air India",
  "6E": "IndiGo",
  UK: "Vistara",
  SG: "SpiceJet",
  BA: "British Airways",
  VS: "Virgin Atlantic",
  EK: "Emirates",
  EY: "Etihad",
  QR: "Qatar Airways",
  SQ: "Singapore Airlines",
  CX: "Cathay Pacific",
  UA: "United",
  AA: "American",
  DL: "Delta",
  LH: "Lufthansa",
  AF: "Air France",
  KL: "KLM",
  TK: "Turkish Airlines",
  TG: "Thai Airways",
  CA: "Air China",
  JL: "JAL",
  NH: "ANA",
  QF: "Qantas",
  EI: "Aer Lingus",
};

function detectAirline(flightNumber: string): string {
  const trimmed = (flightNumber ?? "").trim().toUpperCase();
  const match = trimmed.match(/^([A-Z0-9]{2,3})\s?\d+/);
  if (!match) return "";
  return AIRLINE_PREFIXES[match[1]] ?? "";
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function GuestsPage() {
  const [{ guests: initialGuests, households: initialHouseholds }] = useState(() => {
    const built = buildMockData();
    return { ...built, guests: applyTravelEnrichments(built.guests) };
  });
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [households, setHouseholds] = useState<Household[]>(initialHouseholds);
  const [activeView, setActiveView] = useState<GuestView>("all");
  const [selectedSide, setSelectedSide] = useState<"all" | Side>("all");
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const addChip = useCallback((chip: FilterChip) => {
    setFilterChips((prev) =>
      prev.some((c) => c.id === chip.id) ? prev : [...prev, chip],
    );
  }, []);

  const removeChip = useCallback(
    (id: string) => setFilterChips((prev) => prev.filter((c) => c.id !== id)),
    [],
  );

  const clearChips = useCallback(() => setFilterChips([]), []);

  const updateGuestRsvp = useCallback(
    (guestId: string, eventId: string, status: RsvpStatus) => {
      setGuests((all) =>
        all.map((g) => {
          if (g.id !== guestId) return g;
          const evLabel = EVENTS.find((e) => e.id === eventId)?.label ?? eventId;
          const logEntry = {
            action: `RSVP ${RSVP_LABEL[status].toLowerCase()} for ${evLabel}`,
            timestamp: formatToday(),
          };
          return {
            ...g,
            rsvp: { ...g.rsvp, [eventId]: status },
            activityLog: [...g.activityLog, logEntry],
          };
        }),
      );
    },
    [],
  );

  const updateGuest = useCallback(
    (guestId: string, patch: Partial<Guest>, activityNote?: string) => {
      setGuests((all) =>
        all.map((g) => {
          if (g.id !== guestId) return g;
          const log = activityNote
            ? [...g.activityLog, { action: activityNote, timestamp: formatToday() }]
            : g.activityLog;
          return { ...g, ...patch, activityLog: log };
        }),
      );
    },
    [],
  );

  // ── Category migrations ───────────────────────────────────────────
  // When a category is renamed or deleted in the manager, we mirror the
  // change onto every guest record that carries the old name. Doing this
  // at the page layer (rather than inside the category store) keeps the
  // store free of guest-model coupling and lets us attach an activity log
  // entry in the same pass.
  const renameCategoryOnGuests = useCallback(
    (oldName: string, newName: string) => {
      if (oldName === newName) return;
      setGuests((all) =>
        all.map((g) => {
          if (!g.categories.includes(oldName)) return g;
          const next = g.categories.map((c) => (c === oldName ? newName : c));
          return {
            ...g,
            categories: Array.from(new Set(next)),
            activityLog: [
              ...g.activityLog,
              {
                action: `Circle renamed: ${oldName} → ${newName}`,
                timestamp: formatToday(),
              },
            ],
          };
        }),
      );
    },
    [],
  );

  const deleteCategoryFromGuests = useCallback((removedName: string) => {
    setGuests((all) =>
      all.map((g) => {
        if (!g.categories.includes(removedName)) return g;
        return {
          ...g,
          categories: g.categories.filter((c) => c !== removedName),
          activityLog: [
            ...g.activityLog,
            {
              action: `Circle removed: ${removedName}`,
              timestamp: formatToday(),
            },
          ],
        };
      }),
    );
  }, []);

  // Rewrite every guest that carried an absorbed category name so they now
  // carry the surviving name. Dedupes in case a guest was already tagged
  // with both the surviving and an absorbed category.
  const mergeCategoriesOnGuests = useCallback(
    (absorbedNames: string[], survivingName: string) => {
      if (!absorbedNames.length) return;
      const absorbedSet = new Set(absorbedNames);
      setGuests((all) =>
        all.map((g) => {
          if (!g.categories.some((c) => absorbedSet.has(c))) return g;
          const next = g.categories.map((c) =>
            absorbedSet.has(c) ? survivingName : c,
          );
          return {
            ...g,
            categories: Array.from(new Set(next)),
            activityLog: [
              ...g.activityLog,
              {
                action: `Circles merged: ${absorbedNames.join(", ")} → ${survivingName}`,
                timestamp: formatToday(),
              },
            ],
          };
        }),
      );
    },
    [],
  );

  // Apply a split operation to guest records: each guest that carried the
  // old category name now carries the target name picked in the split
  // dialog instead. Any guest not in `assignments` is left alone (defensive
  // — the dialog should require an assignment for every guest).
  const splitCategoryOnGuests = useCallback(
    (oldName: string, assignments: Record<string, string>) => {
      setGuests((all) =>
        all.map((g) => {
          if (!g.categories.includes(oldName)) return g;
          const target = assignments[g.id];
          if (!target) return g;
          const next = g.categories.map((c) => (c === oldName ? target : c));
          return {
            ...g,
            categories: Array.from(new Set(next)),
            activityLog: [
              ...g.activityLog,
              {
                action: `Circle split: ${oldName} → ${target}`,
                timestamp: formatToday(),
              },
            ],
          };
        }),
      );
    },
    [],
  );

  // Wholesale restore used by the Undo toast after a merge or split. Given
  // a previously snapshot guests array, overwrite state without appending
  // any activity log (the undo is a reversal, not a new change).
  const restoreGuests = useCallback((snapshot: Guest[]) => {
    setGuests(snapshot);
  }, []);

  // Add a candidate to the waitlist pool. Waitlisted guests are held outside
  // the invited set — `rsvp` stays empty until they're promoted, at which
  // point `promoteWaitlistGuest` seeds the main events as "pending".
  const addWaitlistGuest = useCallback(
    (input: { firstName: string; lastName: string; householdId?: string }) => {
      let targetHouseholdId = input.householdId;
      if (!targetHouseholdId) {
        const hid = `h-waitlist-${Date.now().toString(36)}`;
        const newHousehold: Household = {
          id: hid,
          displayName:
            `${input.firstName} ${input.lastName}`.trim() || "Waitlist household",
          primaryLastName: input.lastName || input.firstName,
          side: "mutual",
          branch: "",
          invitationAddressing: "",
          mailingAddress: "",
          city: "",
          country: "India",
          outOfTown: false,
        };
        setHouseholds((prev) => [...prev, newHousehold]);
        targetHouseholdId = hid;
      }
      const host =
        households.find((h) => h.id === targetHouseholdId) ?? null;
      const newGuest: Guest = {
        id: `g-waitlist-${Date.now().toString(36)}`,
        householdId: targetHouseholdId,
        householdRole: "primary",
        firstName: input.firstName,
        lastName: input.lastName,
        ageCategory: "adult",
        side: host?.side ?? "mutual",
        familyBranch: host?.branch ?? "",
        relationship: "Waitlist candidate",
        vipTier: "standard",
        city: host?.city ?? "",
        country: host?.country ?? "India",
        dietary: [],
        outOfTown: host?.outOfTown ?? false,
        rsvp: {},
        invitationSent: false,
        invitationDelivery: "pending",
        tags: [],
        priorityTier: "C",
        source: "Waitlist quick-add",
        addedBy: "Host",
        categories: [],
        onWaitlist: true,
        activityLog: [
          { action: "Added to waitlist", timestamp: formatToday() },
        ],
      };
      setGuests((prev) => [...prev, newGuest]);
    },
    [households],
  );

  // Promote every waitlisted member of a household at once. Keeps couples
  // and families from getting split when a spot opens up.
  const promoteWaitlistHousehold = useCallback((householdId: string) => {
    const seededRsvp = EVENTS.reduce(
      (acc, ev) => ({ ...acc, [ev.id]: "pending" as RsvpStatus }),
      {} as Record<string, RsvpStatus>,
    );
    setGuests((all) =>
      all.map((g) => {
        if (g.householdId !== householdId || !g.onWaitlist) return g;
        return {
          ...g,
          onWaitlist: false,
          rsvp: { ...seededRsvp },
          activityLog: [
            ...g.activityLog,
            {
              action: "Promoted from waitlist to pending (household)",
              timestamp: formatToday(),
            },
          ],
        };
      }),
    );
  }, []);

  const toggleEventInvitation = useCallback(
    (guestId: string, eventId: string) => {
      setGuests((all) =>
        all.map((g) => {
          if (g.id !== guestId) return g;
          const next = { ...g.rsvp };
          const evLabel = EVENTS.find((e) => e.id === eventId)?.label ?? eventId;
          let note: string;
          if (next[eventId] != null) {
            delete next[eventId];
            note = `Removed from ${evLabel} invitation`;
          } else {
            next[eventId] = "pending";
            note = `Invited to ${evLabel}`;
          }
          return {
            ...g,
            rsvp: next,
            activityLog: [...g.activityLog, { action: note, timestamp: formatToday() }],
          };
        }),
      );
    },
    [],
  );

  // ── AI: add a new household + members ──────────────────────────────
  // Used by the AI Command Bar's `add_household` action. The AI provides
  // side/branch/city/members; we generate the ids, seed default RSVP state
  // (pending across all invited events), and append to both the household
  // and guest arrays in a single pass.
  const addHouseholdWithMembers = useCallback(
    (input: Extract<GuestCommandAction, { kind: "add_household" }>["household"]) => {
      const hid = `h-ai-${Date.now().toString(36)}`;
      const validEvents = input.invitedEvents.filter((id) =>
        EVENTS.some((e) => e.id === id),
      );
      const rsvp: Record<string, RsvpStatus> = {};
      for (const eid of validEvents) rsvp[eid] = "pending";

      const newHousehold: Household = {
        id: hid,
        displayName: input.displayName,
        primaryLastName: input.members[0]?.lastName ?? input.displayName,
        side: input.side,
        branch: input.branch,
        invitationAddressing: input.addressing,
        mailingAddress: "",
        city: input.city,
        country: input.country || "India",
        outOfTown: input.outOfTown,
      };

      const newGuests: Guest[] = input.members.map((m, idx) => ({
        id: `${hid}-g${idx + 1}`,
        householdId: hid,
        householdRole: m.role,
        firstName: m.firstName,
        lastName: m.lastName,
        salutation: m.salutation,
        ageCategory: "adult",
        side: input.side,
        familyBranch: input.branch,
        relationship: m.relationship,
        vipTier: idx === 0 ? "standard" : "plus_one",
        city: input.city,
        country: input.country || "India",
        dietary: [],
        outOfTown: input.outOfTown,
        rsvp: { ...rsvp },
        invitationSent: false,
        invitationDelivery: "pending",
        tags: [],
        priorityTier: "B",
        source: "AI command",
        addedBy: "AI",
        categories: [],
        activityLog: [
          { action: "Added via AI command", timestamp: formatToday() },
        ],
      }));

      setHouseholds((prev) => [...prev, newHousehold]);
      setGuests((prev) => [...prev, ...newGuests]);
    },
    [],
  );

  const updateHousehold = useCallback(
    (householdId: string, patch: Partial<Household>) => {
      setHouseholds((all) =>
        all.map((h) => (h.id === householdId ? { ...h, ...patch } : h)),
      );
    },
    [],
  );

  const assignGuestToHousehold = useCallback(
    (guestId: string, householdId: string) => {
      const household = households.find((h) => h.id === householdId);
      if (!household) return;
      setGuests((all) =>
        all.map((g) => {
          if (g.id !== guestId) return g;
          return {
            ...g,
            householdId,
            side: household.side,
            familyBranch: household.branch,
            activityLog: [
              ...g.activityLog,
              {
                action: `Assigned to household: ${household.displayName}`,
                timestamp: formatToday(),
              },
            ],
          };
        }),
      );
    },
    [households],
  );

  const createHouseholdForGuest = useCallback(
    (
      guestId: string,
      input: {
        displayName: string;
        invitationAddressing: string;
        branch?: string;
        city?: string;
        country?: string;
        outOfTown?: boolean;
      },
    ) => {
      const guest = guests.find((g) => g.id === guestId);
      if (!guest) return;
      const hid = `h-manual-${Date.now().toString(36)}`;
      const newHousehold: Household = {
        id: hid,
        displayName: input.displayName,
        primaryLastName: guest.lastName,
        side: guest.side,
        branch: input.branch ?? guest.familyBranch,
        invitationAddressing: input.invitationAddressing,
        mailingAddress: "",
        city: input.city ?? guest.city,
        country: input.country ?? guest.country,
        outOfTown: input.outOfTown ?? guest.outOfTown,
      };
      setHouseholds((prev) => [...prev, newHousehold]);
      setGuests((all) =>
        all.map((g) =>
          g.id === guestId
            ? {
                ...g,
                householdId: hid,
                familyBranch: newHousehold.branch,
                activityLog: [
                  ...g.activityLog,
                  {
                    action: `Assigned to new household: ${newHousehold.displayName}`,
                    timestamp: formatToday(),
                  },
                ],
              }
            : g,
        ),
      );
    },
    [guests],
  );

  // Dispatcher called by AICommandBar after the user confirms an action.
  const applyAIAction = useCallback(
    (action: GuestCommandAction) => {
      switch (action.kind) {
        case "add_household":
          addHouseholdWithMembers(action.household);
          break;
        case "update_guests":
          for (const id of action.guestIds) {
            const g = guests.find((x) => x.id === id);
            if (!g) continue;
            const patch: Partial<Guest> = {};
            if (action.patch.side) patch.side = action.patch.side;
            if (action.patch.branch) patch.familyBranch = action.patch.branch;
            if (action.patch.city) patch.city = action.patch.city;
            if (action.patch.outOfTown != null) patch.outOfTown = action.patch.outOfTown;
            if (action.patch.categories) patch.categories = action.patch.categories;
            if (action.patch.addCategories) {
              patch.categories = Array.from(
                new Set([...g.categories, ...action.patch.addCategories]),
              );
            }
            if (action.patch.removeCategories) {
              const toRemove = new Set(action.patch.removeCategories);
              patch.categories = (patch.categories ?? g.categories).filter(
                (c) => !toRemove.has(c),
              );
            }
            updateGuest(id, patch, "Updated via AI command");
          }
          break;
        case "set_rsvp":
          for (const gid of action.guestIds) {
            const g = guests.find((x) => x.id === gid);
            if (!g) continue;
            const eventIds =
              action.eventIds.length > 0
                ? action.eventIds
                : Object.keys(g.rsvp);
            for (const eid of eventIds) {
              if (g.rsvp[eid] == null) continue;
              updateGuestRsvp(gid, eid, action.status);
            }
          }
          break;
        case "toggle_invitation":
          for (const gid of action.guestIds) {
            const g = guests.find((x) => x.id === gid);
            if (!g) continue;
            for (const eid of action.eventIds) {
              const has = g.rsvp[eid] != null;
              if (action.add && !has) toggleEventInvitation(gid, eid);
              else if (!action.add && has) toggleEventInvitation(gid, eid);
            }
          }
          break;
        // answer / clarify / error kinds are handled inline by the command bar.
        default:
          break;
      }
    },
    [addHouseholdWithMembers, guests, toggleEventInvitation, updateGuest, updateGuestRsvp],
  );

  const sideFilteredGuests = useMemo(
    () =>
      selectedSide === "all"
        ? guests
        : guests.filter((g) => g.side === selectedSide),
    [guests, selectedSide],
  );

  const chipFilteredGuests = useMemo(() => {
    if (filterChips.length === 0) return sideFilteredGuests;
    return sideFilteredGuests.filter((g) =>
      filterChips.every((c) => c.predicate(g)),
    );
  }, [sideFilteredGuests, filterChips]);

  const selectedGuest = useMemo(
    () => guests.find((g) => g.id === selectedGuestId) ?? null,
    [guests, selectedGuestId],
  );

  const changeView = useCallback(
    (v: GuestView) => {
      setActiveView(v);
      clearChips();
      setSelectedSide("all");
    },
    [clearChips],
  );

  // Seed the category store on first-ever load. `ensureSeed()` is a no-op
  // once `hasSeeded` is true, so re-renders (and re-mounts after a full
  // wipe) don't re-add the defaults.
  const ensureCategorySeed = useGuestCategoriesStore((s) => s.ensureSeed);
  useEffect(() => {
    ensureCategorySeed();
  }, [ensureCategorySeed]);

  const exportGuestsCSV = useCallback(() => {
    const headers = [
      "First Name", "Last Name", "Side", "Relationship", "City", "Country",
      "Email", "Phone", "Dietary", "RSVP (Ceremony)", "VIP Tier",
    ];
    const rows = guests
      .filter((g) => !g.onWaitlist)
      .map((g) => [
        g.firstName,
        g.lastName,
        g.side,
        g.relationship,
        g.city,
        g.country,
        g.email ?? "",
        g.phone ?? "",
        g.dietary.join("; "),
        g.rsvp["ceremony"] ?? "not_invited",
        g.vipTier,
      ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guests.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [guests]);

  const handleCSVImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) return;
        const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim().toLowerCase());
        const firstNameIdx = header.findIndex((h) => h.includes("first"));
        const lastNameIdx = header.findIndex((h) => h.includes("last"));
        const sideIdx = header.findIndex((h) => h === "side");
        const relIdx = header.findIndex((h) => h.includes("relation"));
        const emailIdx = header.findIndex((h) => h.includes("email"));
        const cityIdx = header.findIndex((h) => h === "city");
        const countryIdx = header.findIndex((h) => h === "country");

        const parseCell = (row: string[], idx: number) => {
          if (idx < 0) return "";
          return (row[idx] ?? "").replace(/^"|"$/g, "").trim();
        };

        const newHouseholds: Household[] = [];
        const newGuests: Guest[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(",");
          const firstName = parseCell(row, firstNameIdx) || "Guest";
          const lastName = parseCell(row, lastNameIdx);
          const side = (["bride", "groom", "mutual"].includes(parseCell(row, sideIdx))
            ? parseCell(row, sideIdx)
            : "mutual") as Side;
          const hid = `h-csv-${Date.now().toString(36)}-${i}`;
          newHouseholds.push({
            id: hid,
            displayName: `${firstName} ${lastName}`.trim(),
            primaryLastName: lastName || firstName,
            side,
            branch: "",
            invitationAddressing: "",
            mailingAddress: "",
            city: parseCell(row, cityIdx),
            country: parseCell(row, countryIdx) || "India",
            outOfTown: false,
          });
          const rsvp: Record<string, RsvpStatus> = {};
          for (const ev of EVENTS) rsvp[ev.id] = "pending";
          newGuests.push({
            id: `${hid}-g1`,
            householdId: hid,
            householdRole: "primary",
            firstName,
            lastName,
            ageCategory: "adult",
            side,
            familyBranch: "",
            relationship: parseCell(row, relIdx) || "Guest",
            vipTier: "standard",
            email: parseCell(row, emailIdx) || undefined,
            city: parseCell(row, cityIdx),
            country: parseCell(row, countryIdx) || "India",
            dietary: [],
            outOfTown: false,
            rsvp,
            invitationSent: false,
            invitationDelivery: "pending",
            tags: [],
            priorityTier: "B",
            source: "csv",
            addedBy: "import",
            categories: [],
            activityLog: [{ action: "Imported from CSV", timestamp: formatToday() }],
          });
        }

        setHouseholds((prev) => [...prev, ...newHouseholds]);
        setGuests((prev) => [...prev, ...newGuests]);
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [],
  );

  return (
    <div className="flex h-screen flex-col bg-white">
      <TopNav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddGuest(true)}
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add Guest
          </button>
          <button
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-md border border-gold/25 bg-gold-pale/30 px-3 py-1.5 text-[12px] font-medium text-saffron transition-colors hover:border-gold/40 hover:bg-gold-pale/50"
          >
            <Upload size={13} strokeWidth={1.6} />
            Import CSV
          </button>
          <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSVImport} />
          <button
            onClick={exportGuestsCSV}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-ink/20 hover:text-ink"
          >
            <Download size={13} strokeWidth={1.6} />
            Export
          </button>
        </div>
      </TopNav>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          onView={changeView}
          guests={guests}
          households={households}
        />
        <main className="flex-1 overflow-y-auto">
          {activeView === "all" && (
            <AllGuestsView
              allGuests={guests}
              households={households}
              guests={chipFilteredGuests}
              sideFilteredGuests={sideFilteredGuests}
              selectedSide={selectedSide}
              onSelectSide={setSelectedSide}
              onSelectGuest={setSelectedGuestId}
              chips={filterChips}
              onAddChip={addChip}
              onRemoveChip={removeChip}
              onClearChips={clearChips}
              onToggleInvitation={toggleEventInvitation}
              onUpdateRsvp={updateGuestRsvp}
              onUpdateGuest={updateGuest}
              onAIAction={applyAIAction}
            />
          )}
          {activeView === "households" && (
            <HouseholdsView
              guests={chipFilteredGuests}
              allGuests={guests}
              households={households}
              onSelectGuest={setSelectedGuestId}
              onUpdateHousehold={updateHousehold}
              onAssignGuestToHousehold={assignGuestToHousehold}
              onCreateHouseholdForGuest={createHouseholdForGuest}
              hideSummary
            />
          )}
          {activeView === "by_event" && (
            <ByEventView
              guests={chipFilteredGuests}
              households={households}
              onUpdateRsvp={updateGuestRsvp}
              onSelectGuest={setSelectedGuestId}
              hideSummary
            />
          )}
          {activeView === "categories" && (
            <CategoryManagerView
              guests={guests}
              onSelectGuest={setSelectedGuestId}
              onRenameMigrate={renameCategoryOnGuests}
              onDeleteMigrate={deleteCategoryFromGuests}
              onMergeMigrate={mergeCategoriesOnGuests}
              onSplitMigrate={splitCategoryOnGuests}
              onRestoreGuests={restoreGuests}
              onUpdateGuest={updateGuest}
            />
          )}
          {activeView === "rsvp" && (
            <RsvpTrackerView
              guests={chipFilteredGuests}
              allGuests={guests}
              households={households}
              selectedSide={selectedSide}
              onSelectSide={setSelectedSide}
              onSelectGuest={setSelectedGuestId}
              onUpdateGuest={updateGuest}
              onAddWaitlistGuest={addWaitlistGuest}
              onPromoteWaitlistHousehold={promoteWaitlistHousehold}
            />
          )}
          {activeView === "travel" && (
            <TravelView
              guests={chipFilteredGuests}
              households={households}
              onUpdateGuest={updateGuest}
              onSelectGuest={setSelectedGuestId}
            />
          )}
          {activeView === "seating" && <SeatingView guests={chipFilteredGuests} />}
          {activeView === "gifts" && <GiftsView guests={chipFilteredGuests} />}
          {activeView === "communications" && (
            <CommunicationsView guests={chipFilteredGuests} />
          )}
          {activeView === "imports" && <ImportsView guests={chipFilteredGuests} />}
        </main>
      </div>

      {selectedGuest && (
        <GuestDrawer
          guest={selectedGuest}
          household={households.find((h) => h.id === selectedGuest.householdId)}
          allGuests={guests}
          onClose={() => setSelectedGuestId(null)}
          onUpdateRsvp={updateGuestRsvp}
          onToggleInvitation={toggleEventInvitation}
          onUpdateGuest={updateGuest}
        />
      )}

      {showAddGuest && (
        <AddGuestModal
          onClose={() => setShowAddGuest(false)}
          onAdd={(input) => {
            addHouseholdWithMembers(input);
            setShowAddGuest(false);
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Sidebar — left rail with views
// ═══════════════════════════════════════════════════════════════════════════

const SIDEBAR_PRIMARY: { id: GuestView; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All Guests", icon: UserCircle2 },
  { id: "households", label: "Households", icon: HomeIcon },
  { id: "by_event", label: "By Event", icon: CalendarDays },
  { id: "categories", label: "Circles", icon: Tags },
  { id: "rsvp", label: "RSVP Tracker", icon: ClipboardCheck },
  { id: "travel", label: "Travel & Lodging", icon: Plane },
  { id: "seating", label: "Floor Plan", icon: Armchair },
  { id: "gifts", label: "Gifts & Thank Yous", icon: Gift },
];

const SIDEBAR_MORE: { id: GuestView; label: string; icon: React.ElementType }[] = [
  { id: "communications", label: "Communications", icon: MessageSquare },
  { id: "imports", label: "Imports", icon: Upload },
];

function Sidebar({
  activeView,
  onView,
  guests,
  households,
}: {
  activeView: GuestView;
  onView: (v: GuestView) => void;
  guests: Guest[];
  households: Household[];
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const categoryCount = useGuestCategoriesStore((s) => s.categories.length);

  const counts = useMemo(() => {
    const pending = guests.filter((g) =>
      Object.values(g.rsvp).some(
        (s) => s === "pending" || s === "no_response" || s === "tentative",
      ),
    ).length;
    const outOfTown = guests.filter((g) => g.outOfTown).length;
    return {
      all: guests.length,
      households: households.length,
      by_event: EVENTS.length,
      rsvp: pending,
      travel: outOfTown,
      categories: categoryCount,
    };
  }, [guests, households, categoryCount]);

  function countLabel(id: GuestView): string | null {
    if (id === "all") return `${counts.all}`;
    if (id === "households") return `${counts.households}`;
    if (id === "by_event") return `${counts.by_event} events`;
    if (id === "categories") return `${counts.categories}`;
    if (id === "rsvp") return `${counts.rsvp}`;
    if (id === "travel") return `${counts.travel}`;
    return null;
  }

  const moreActive = SIDEBAR_MORE.some((m) => m.id === activeView);

  return (
    <aside
      className="relative hidden w-16 shrink-0 lg:block"
      role="navigation"
      aria-label="Guests navigation"
    >
      <div
        className="group/rail absolute inset-y-0 left-0 z-20 flex w-16 flex-col overflow-hidden border-r border-border bg-white transition-[width,box-shadow] duration-200 ease-out delay-0 hover:w-60 hover:delay-150 hover:shadow-[4px_0_14px_rgba(0,0,0,0.05)]"
      >
        <div className="border-b border-border px-3 pb-3 pt-6">
          <div className="mb-3 px-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100">
            Guest Management
          </div>
          {SIDEBAR_PRIMARY.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            const count = countLabel(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onView(item.id)}
                title={item.label}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg py-2.5 pr-3 text-left transition-all duration-200 border-l-2",
                  active
                    ? "bg-gold-pale/20 text-ink border-gold pl-2.5"
                    : "border-transparent pl-2.5 text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  size={16}
                  strokeWidth={1.5}
                  className={cn(
                    "shrink-0 transition-colors",
                    active ? "text-gold" : "text-ink-faint group-hover:text-ink-muted",
                  )}
                />
                <span className="flex-1 whitespace-nowrap text-[13px] font-medium opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100">{item.label}</span>
                {count != null && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100",
                      active ? "bg-gold/10 text-gold" : "bg-ivory-warm text-ink-faint",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-3 py-3">
          <button
            onClick={() => setMoreOpen((v) => !v)}
            title="More"
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg py-2.5 pr-3 text-left transition-all duration-200 border-l-2",
              moreActive
                ? "bg-gold-pale/20 text-ink border-gold pl-2.5"
                : "border-transparent pl-2.5 text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft",
            )}
            aria-expanded={moreOpen}
          >
            <MoreHorizontal
              size={16}
              strokeWidth={1.5}
              className={cn(
                "shrink-0 transition-colors",
                moreActive ? "text-gold" : "text-ink-faint group-hover:text-ink-muted",
              )}
            />
            <span className="flex-1 whitespace-nowrap text-[13px] font-medium opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100">More</span>
            <ChevronDown
              size={13}
              strokeWidth={1.6}
              className={cn("transition-all duration-150 opacity-0 group-hover/rail:opacity-100", moreOpen ? "rotate-180" : "")}
            />
          </button>

          {moreOpen && (
            <div className="mt-1 hidden flex-col gap-0.5 pl-7 group-hover/rail:flex">
              {SIDEBAR_MORE.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onView(item.id);
                      setMoreOpen(false);
                    }}
                    title={item.label}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition-colors",
                      active
                        ? "bg-gold-pale/20 text-ink"
                        : "text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft",
                    )}
                  >
                    <Icon size={13} strokeWidth={1.6} className="shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Dashboard summary strip
// ═══════════════════════════════════════════════════════════════════════════

function SummaryStrip({ guests }: { guests: Guest[] }) {
  const stats = useMemo(() => {
    const total = guests.length;
    let confirmed = 0;
    let declined = 0;
    let pending = 0;
    const dietaryCounts: Record<string, number> = {};
    let outOfTown = 0;
    let travelPending = 0;

    for (const g of guests) {
      const values = Object.values(g.rsvp);
      if (values.some((s) => s === "confirmed")) confirmed++;
      else if (values.every((s) => s === "declined")) declined++;
      else pending++;

      if (g.outOfTown) {
        outOfTown++;
        if (!g.hotelId) travelPending++;
      }

      for (const d of g.dietary) {
        dietaryCounts[d] = (dietaryCounts[d] ?? 0) + 1;
      }
    }

    const rsvpPct = total ? Math.round(((confirmed + declined) / total) * 100) : 0;
    const projectedHeadcount = confirmed + Math.round(pending * 0.6);

    // RSVP deadline = 2026-05-15, today is 2026-04-17 per system context
    const today = new Date("2026-04-17");
    const deadline = new Date("2026-05-15");
    const daysToDeadline = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    const brideCount = guests.filter((g) => g.side === "bride").length;
    const groomCount = guests.filter((g) => g.side === "groom").length;
    const mutualCount = guests.filter((g) => g.side === "mutual").length;

    return {
      total,
      confirmed,
      declined,
      pending,
      rsvpPct,
      projectedHeadcount,
      outOfTown,
      travelPending,
      dietaryCounts,
      daysToDeadline,
      brideCount,
      groomCount,
      mutualCount,
    };
  }, [guests]);

  return (
    <div
      className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-gold/15 bg-white px-8 py-4 md:grid-cols-6"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <SummaryMetric
        label="Total invited"
        value={stats.total.toString()}
        sublabel={`${stats.brideCount} bride · ${stats.groomCount} groom · ${stats.mutualCount} mutual`}
        accent
      />
      <SummaryMetric
        label="RSVP progress"
        value={`${stats.rsvpPct}%`}
        sublabel={`${stats.confirmed} confirmed · ${stats.pending} pending`}
        progress={stats.rsvpPct}
      />
      <SummaryMetric
        label="Expected"
        value={stats.projectedHeadcount.toString()}
        sublabel="Confirmed + 60% of pending"
        accent
      />
      <SummaryMetric
        label="Out of town"
        value={stats.outOfTown.toString()}
        sublabel={`${stats.travelPending} need lodging`}
      />
      <SummaryMetric
        label="RSVP deadline"
        value={`${stats.daysToDeadline}d`}
        sublabel="May 15, 2026"
      />
      <DietaryMiniChart counts={stats.dietaryCounts} total={stats.total} />
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  sublabel,
  progress,
  accent,
  onClick,
}: {
  label: string;
  value: string;
  sublabel: string;
  progress?: number;
  accent?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <div className="flex flex-col gap-1 text-left">
      <span className="text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-semibold leading-none",
            accent ? "text-saffron" : "text-ink",
          )}
          style={{ fontFamily: "var(--font-sans)", fontSize: "19px" }}
        >
          {value}
        </span>
      </div>
      {progress != null && (
        <div className="mt-0.5 h-[2px] w-full overflow-hidden rounded-full bg-gold/10">
          <div className="h-full bg-saffron" style={{ width: `${progress}%` }} />
        </div>
      )}
      <span className="mt-0.5 text-[10.5px] normal-case tracking-normal text-ink-muted">
        {sublabel}
      </span>
    </div>
  );
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="rounded transition-colors hover:bg-ivory/40"
      >
        {body}
      </button>
    );
  }
  return body;
}

function DietaryMiniChart({ counts, total }: { counts: Record<string, number>; total: number }) {
  const veg = (counts["vegetarian"] ?? 0) + (counts["jain"] ?? 0) + (counts["swaminarayan"] ?? 0) + (counts["vegan"] ?? 0);
  const nonveg = counts["non_vegetarian"] ?? 0;
  const jain = counts["jain"] ?? 0;
  const allergy = (counts["nut_allergy"] ?? 0) + (counts["gluten_free"] ?? 0) + (counts["dairy_free"] ?? 0);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        Dietary mix
      </span>
      <div className="mt-0.5 flex h-[10px] w-full overflow-hidden rounded-full bg-gold/10">
        <div
          className="bg-sage-light"
          style={{ width: `${(veg / Math.max(1, total)) * 100}%` }}
          title={`Vegetarian: ${veg}`}
        />
        <div
          className="bg-rose-light"
          style={{ width: `${(nonveg / Math.max(1, total)) * 100}%` }}
          title={`Non-veg: ${nonveg}`}
        />
        <div
          className="bg-saffron"
          style={{ width: `${(jain / Math.max(1, total)) * 100}%` }}
          title={`Jain/Swaminarayan: ${jain}`}
        />
      </div>
      <span className="text-[10.5px] normal-case tracking-normal text-ink-muted">
        {veg} veg · {nonveg} non-veg · {allergy} allergies
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   All Guests view — calm editorial list
// ═══════════════════════════════════════════════════════════════════════════

type SortKey = "name" | "city" | "rsvp_pct" | "events_invited";
type MissingInfo = "all" | "phone" | "email" | "address";

interface AllFilters {
  query: string;
  side: "all" | Side;
  vip: "all" | VipTier;
  tier: "all" | "A" | "B" | "C";
  outOfTown: "all" | "yes" | "no";
  dietary: "all" | Dietary;
  event: "all" | string;
  rsvp: "all" | RsvpStatus;
  performing: "all" | "yes" | "no" | string; // "all" | "yes" | "no" | eventId
  categories: string[];
  cities: string[];
  missingInfo: MissingInfo;
  sort: SortKey;
}

const EMPTY_FILTERS: AllFilters = {
  query: "",
  side: "all",
  vip: "all",
  tier: "all",
  outOfTown: "all",
  dietary: "all",
  event: "all",
  rsvp: "all",
  performing: "all",
  categories: [],
  cities: [],
  missingInfo: "all",
  sort: "name",
};

function applyGuestFilters(
  guests: Guest[],
  filters: AllFilters,
  performingGuestIds: { all: Set<string>; byEvent: Map<string, Set<string>> },
): Guest[] {
  const q = filters.query.trim().toLowerCase();
  return guests.filter((g) => {
    if (q) {
      const hay = `${g.firstName} ${g.lastName} ${g.email ?? ""} ${g.phone ?? ""} ${g.relationship} ${g.tags.join(" ")} ${g.categories.join(" ")} ${g.city}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.vip !== "all" && g.vipTier !== filters.vip) return false;
    if (filters.tier !== "all" && g.priorityTier !== filters.tier) return false;
    if (filters.outOfTown === "yes" && !g.outOfTown) return false;
    if (filters.outOfTown === "no" && g.outOfTown) return false;
    if (filters.dietary !== "all" && !g.dietary.includes(filters.dietary)) return false;
    if (filters.rsvp === "waitlist") {
      // Waitlist is a guest-level pool, not a per-event status.
      if (!g.onWaitlist) return false;
    } else if (filters.event !== "all") {
      const status = g.rsvp[filters.event];
      if (!status) return false;
      if (filters.rsvp !== "all" && status !== filters.rsvp) return false;
    } else if (filters.rsvp !== "all") {
      if (g.onWaitlist) return false;
      if (!Object.values(g.rsvp).some((s) => s === filters.rsvp)) return false;
    }
    if (filters.performing !== "all") {
      if (filters.performing === "yes") {
        if (!performingGuestIds.all.has(g.id)) return false;
      } else if (filters.performing === "no") {
        if (performingGuestIds.all.has(g.id)) return false;
      } else {
        const bucket = performingGuestIds.byEvent.get(filters.performing);
        if (!bucket || !bucket.has(g.id)) return false;
      }
    }
    if (filters.categories.length > 0) {
      if (!filters.categories.some((c) => g.categories.includes(c))) return false;
    }
    if (filters.cities.length > 0) {
      if (!filters.cities.includes(g.city)) return false;
    }
    if (filters.missingInfo !== "all") {
      if (filters.missingInfo === "phone" && g.phone) return false;
      if (filters.missingInfo === "email" && g.email) return false;
      if (filters.missingInfo === "address" && (g.street1 || g.city)) {
        if (g.street1) return false;
      }
    }
    return true;
  });
}

function countActiveFilters(filters: AllFilters): number {
  let n = 0;
  if (filters.vip !== "all") n++;
  if (filters.tier !== "all") n++;
  if (filters.outOfTown !== "all") n++;
  if (filters.dietary !== "all") n++;
  if (filters.event !== "all") n++;
  if (filters.rsvp !== "all") n++;
  if (filters.performing !== "all") n++;
  if (filters.missingInfo !== "all") n++;
  if (filters.sort !== "name") n++;
  if (filters.categories.length > 0) n++;
  if (filters.cities.length > 0) n++;
  return n;
}

function AllGuestsView({
  allGuests,
  households,
  guests,
  sideFilteredGuests,
  selectedSide,
  onSelectSide,
  onSelectGuest,
  chips,
  onAddChip,
  onRemoveChip,
  onClearChips,
  onToggleInvitation,
  onUpdateRsvp,
  onUpdateGuest,
  onAIAction,
}: {
  allGuests: Guest[];
  households: Household[];
  guests: Guest[];
  sideFilteredGuests: Guest[];
  selectedSide: "all" | Side;
  onSelectSide: (s: "all" | Side) => void;
  onSelectGuest: (id: string) => void;
  chips: FilterChip[];
  onAddChip: (c: FilterChip) => void;
  onRemoveChip: (id: string) => void;
  onClearChips: () => void;
  onToggleInvitation: (guestId: string, eventId: string) => void;
  onUpdateRsvp: (guestId: string, eventId: string, status: RsvpStatus) => void;
  onUpdateGuest: (
    guestId: string,
    patch: Partial<Guest>,
    activityNote?: string,
  ) => void;
  onAIAction: (action: GuestCommandAction) => void;
}) {
  const [filters, setFilters] = useState<AllFilters>(EMPTY_FILTERS);
  const [showSummary, setShowSummary] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Derived option lists for the filter drawer (from the current side-filtered set)
  const categoryOptions = useMemo(() => {
    const s = new Set<string>();
    for (const g of sideFilteredGuests) g.categories.forEach((c) => s.add(c));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [sideFilteredGuests]);

  const cityOptions = useMemo(() => {
    const s = new Set<string>();
    for (const g of sideFilteredGuests) if (g.city) s.add(g.city);
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [sideFilteredGuests]);

  const performances = usePerformancesStore((s) => s.performances);
  const performingGuestIds = useMemo(() => {
    const all = new Set<string>();
    const byEvent = new Map<string, Set<string>>();
    for (const p of performances) {
      let bucket = byEvent.get(p.eventId);
      if (!bucket) {
        bucket = new Set<string>();
        byEvent.set(p.eventId, bucket);
      }
      for (const pt of p.participants) {
        all.add(pt.guestId);
        bucket.add(pt.guestId);
      }
    }
    return { all, byEvent };
  }, [performances]);

  const filtered = useMemo(
    () => applyGuestFilters(guests, filters, performingGuestIds),
    [guests, filters, performingGuestIds],
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (filters.sort) {
      case "city":
        copy.sort((a, b) =>
          (a.city || "zz").localeCompare(b.city || "zz") ||
          (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
        );
        break;
      case "rsvp_pct": {
        const pct = (g: Guest) => {
          const values = Object.values(g.rsvp);
          if (values.length === 0) return 0;
          const done = values.filter(
            (s) => s === "confirmed" || s === "declined",
          ).length;
          return done / values.length;
        };
        copy.sort((a, b) => pct(b) - pct(a));
        break;
      }
      case "events_invited":
        copy.sort(
          (a, b) => Object.keys(b.rsvp).length - Object.keys(a.rsvp).length,
        );
        break;
      case "name":
      default:
        copy.sort((a, b) =>
          (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
        );
    }
    return copy;
  }, [filtered, filters.sort]);

  // Prune selection to whatever is currently visible
  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const visible = new Set(sorted.map((g) => g.id));
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (visible.has(id)) next.add(id);
        else changed = true;
      }
      return changed ? next : prev;
    });
  }, [sorted]);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(
    (on: boolean) => {
      setSelectedIds(on ? new Set(sorted.map((g) => g.id)) : new Set());
    },
    [sorted],
  );

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const headline = useMemo(() => {
    const total = sideFilteredGuests.length;
    const confirmed = sideFilteredGuests.filter((g) =>
      Object.values(g.rsvp).some((s) => s === "confirmed"),
    ).length;
    const rsvpComplete = sideFilteredGuests.filter((g) =>
      Object.values(g.rsvp).every((s) => s === "confirmed" || s === "declined"),
    ).length;
    const rsvpPct = total ? Math.round((rsvpComplete / total) * 100) : 0;
    return { total, confirmed, rsvpPct };
  }, [sideFilteredGuests]);

  const sideCounts = useMemo(
    () => ({
      all: allGuests.length,
      bride: allGuests.filter((g) => g.side === "bride").length,
      groom: allGuests.filter((g) => g.side === "groom").length,
      mutual: allGuests.filter((g) => g.side === "mutual").length,
    }),
    [allGuests],
  );

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const gridContainerClass =
    viewMode === "grid"
      ? "mx-auto max-w-[1400px] px-6 py-10"
      : "mx-auto max-w-4xl px-8 py-10";

  // ── Snapshot for the AI command bar ─────────────────────────────────
  // We ship a compact digest of the list (not the full guest objects) so
  // the model can resolve "the Iyers" or "Nana's cousins" without us
  // shipping 300KB. For very long lists, we'd sample — but 99 guests is
  // fine to send in full.
  const aiSnapshot: GuestCommandSnapshot = useMemo(() => {
    const confirmed = allGuests.filter((g) =>
      Object.values(g.rsvp).some((s) => s === "confirmed"),
    ).length;
    const pending = allGuests.filter((g) =>
      Object.values(g.rsvp).some((s) => s === "pending" || s === "no_response"),
    ).length;
    return {
      totals: {
        guests: allGuests.length,
        households: households.length,
        confirmed,
        pending,
      },
      events: EVENTS.map((e) => ({
        id: e.id,
        label: e.label,
        date: e.date,
        host: e.host,
      })),
      households: households.map((h) => ({
        id: h.id,
        displayName: h.displayName,
        addressing: h.invitationAddressing,
        side: h.side,
        branch: h.branch,
        city: h.city,
        outOfTown: h.outOfTown,
        memberIds: allGuests.filter((g) => g.householdId === h.id).map((g) => g.id),
      })),
      guests: allGuests.map((g) => ({
        id: g.id,
        firstName: g.firstName,
        lastName: g.lastName,
        householdId: g.householdId,
        side: g.side,
        branch: g.familyBranch,
        city: g.city,
        outOfTown: g.outOfTown,
        categories: g.categories,
        invitedEvents: Object.keys(g.rsvp),
        rsvp: g.rsvp,
        dietary: g.dietary,
        vipTier: g.vipTier,
        relationship: g.relationship,
      })),
    };
  }, [allGuests, households]);

  // ── Data for the AI Insights panel ──────────────────────────────────
  const insightsData = useMemo(() => {
    const set = sideFilteredGuests;
    const confirmed = set.filter((g) =>
      Object.values(g.rsvp).some((s) => s === "confirmed"),
    ).length;
    const declined = set.filter((g) =>
      Object.values(g.rsvp).every((s) => s === "declined"),
    ).length;
    const pending = set.length - confirmed - declined;
    const outOfTown = set.filter((g) => g.outOfTown).length;
    const travelPending = set.filter((g) => g.outOfTown && !g.hotelId).length;

    const sidesCount = {
      bride: set.filter((g) => g.side === "bride").length,
      groom: set.filter((g) => g.side === "groom").length,
      mutual: set.filter((g) => g.side === "mutual").length,
    };
    const pendingBySide = {
      bride: set.filter(
        (g) =>
          g.side === "bride" &&
          Object.values(g.rsvp).some((s) => s === "pending" || s === "no_response"),
      ).length,
      groom: set.filter(
        (g) =>
          g.side === "groom" &&
          Object.values(g.rsvp).some((s) => s === "pending" || s === "no_response"),
      ).length,
      mutual: set.filter(
        (g) =>
          g.side === "mutual" &&
          Object.values(g.rsvp).some((s) => s === "pending" || s === "no_response"),
      ).length,
    };

    const eventsSummary = EVENTS.map((ev) => {
      const invited = set.filter((g) => g.rsvp[ev.id] != null);
      return {
        id: ev.id,
        label: ev.label,
        date: ev.date,
        invitedCount: invited.length,
        confirmedCount: invited.filter((g) => g.rsvp[ev.id] === "confirmed").length,
        pendingCount: invited.filter(
          (g) =>
            g.rsvp[ev.id] === "pending" || g.rsvp[ev.id] === "no_response",
        ).length,
      };
    });

    const householdsSummary = households.map((h) => {
      const members = allGuests.filter((g) => g.householdId === h.id);
      const allConfirmed =
        members.length > 0 &&
        members.every((g) => Object.values(g.rsvp).some((s) => s === "confirmed"));
      const allPending =
        members.length > 0 &&
        members.every((g) =>
          Object.values(g.rsvp).every(
            (s) => s === "pending" || s === "no_response",
          ),
        );
      return {
        id: h.id,
        displayName: h.displayName,
        side: h.side,
        city: h.city,
        outOfTown: h.outOfTown,
        hasHotel: members.some((g) => Boolean(g.hotelId)),
        memberCount: members.length,
        lastName: h.primaryLastName,
        allConfirmed,
        allPending,
      };
    });

    const dietary: Record<string, number> = {};
    for (const g of set) {
      for (const d of g.dietary) dietary[d] = (dietary[d] ?? 0) + 1;
    }

    const today = new Date("2026-04-17");
    const deadline = new Date("2026-05-15");
    const deadlineDaysAway = Math.max(
      0,
      Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const estimatedAttendance = confirmed + Math.round(pending * 0.6);

    return {
      totals: {
        guests: set.length,
        households: new Set(set.map((g) => g.householdId)).size,
        confirmed,
        pending,
        declined,
        outOfTown,
        travelPending,
      },
      sides: sidesCount,
      pendingBySide,
      events: eventsSummary,
      households: householdsSummary,
      dietary,
      deadlineDaysAway,
      estimatedAttendance,
    };
  }, [sideFilteredGuests, households, allGuests]);

  // ── Pending households for RSVP drafts ───────────────────────────────
  const pendingDraftHouseholds: DraftHousehold[] = useMemo(() => {
    const out: DraftHousehold[] = [];
    for (const h of households) {
      const members = allGuests.filter((g) => g.householdId === h.id);
      const anyPending = members.some((g) =>
        Object.values(g.rsvp).some(
          (s) => s === "pending" || s === "no_response",
        ),
      );
      if (!anyPending) continue;
      const primary = members[0];
      const invitedIds = new Set<string>();
      for (const m of members) {
        for (const eid of Object.keys(m.rsvp)) invitedIds.add(eid);
      }
      out.push({
        id: h.id,
        addressing: h.invitationAddressing,
        displayName: h.displayName,
        side: h.side,
        city: h.city,
        primaryRelationship: primary?.relationship,
        events: EVENTS.filter((e) => invitedIds.has(e.id)).map((e) => ({
          id: e.id,
          label: e.label,
          date: e.date,
        })),
      });
    }
    return out;
  }, [households, allGuests]);

  return (
    <>
      <div className={gridContainerClass}>
        {/* Editorial header */}
        <div className="mb-6">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
            Guest List
          </p>
          <div className="flex items-baseline gap-3">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-ink">
              {sideHeading(selectedSide)}
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              {headline.total} invited · {headline.confirmed} confirmed
            </span>
          </div>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Everyone on the list. Click a name for the full picture, or use the pills to focus on one side.
          </p>
          <div className="mt-5 h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />
          <div className="mt-5 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-border">
              <div
                className="h-full rounded-full bg-sage transition-all duration-500"
                style={{ width: `${headline.rsvpPct}%` }}
              />
            </div>
            <span className="font-mono text-xs tabular-nums text-ink-muted">
              {headline.rsvpPct}%
            </span>
          </div>
        </div>

        {/* AI command bar — sits above the pills, below the description */}
        <AICommandBar
          snapshot={aiSnapshot}
          onApply={onAIAction}
          onOpenDrafts={() => setShowDrafts(true)}
        />

        {/* Control row */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SidePills value={selectedSide} onChange={onSelectSide} counts={sideCounts} />
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <div className="relative ml-auto min-w-[220px] max-w-sm flex-1">
            <Search
              size={13}
              strokeWidth={1.7}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              placeholder="Search guests…"
              className="w-full rounded-md border border-border bg-white py-1.5 pl-8 pr-3 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
              activeFilterCount > 0
                ? "border-gold/40 bg-gold-pale/40 text-gold"
                : "border-border text-ink-muted hover:border-ink/20 hover:text-ink",
            )}
          >
            <SlidersHorizontal size={12} strokeWidth={1.7} />
            Filter
            {activeFilterCount > 0 && (
              <span className="font-mono text-[10px] tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowInsights((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
              showInsights
                ? "border-gold/40 bg-gold-pale/40 text-saffron"
                : "border-border bg-white text-ink-muted hover:border-ink/20 hover:text-ink",
            )}
          >
            <BarChart3 size={12} strokeWidth={1.7} />
            Summary
          </button>
        </div>

        {showInsights && (
          <AIInsightsPanel
            {...insightsData}
            onDraftRsvp={() => setShowDrafts(true)}
            onClose={() => setShowInsights(false)}
          />
        )}

        {/* Drill-through chips */}
        {chips.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Showing
            </span>
            {chips.map((chip) => (
              <span
                key={chip.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-white px-2.5 py-0.5 text-[11.5px] text-ink"
              >
                {chip.label}
                <button
                  onClick={() => onRemoveChip(chip.id)}
                  className="text-ink-faint hover:text-ink"
                  aria-label={`Remove ${chip.label}`}
                >
                  <X size={11} strokeWidth={1.8} />
                </button>
              </span>
            ))}
            {chips.length > 1 && (
              <button
                onClick={onClearChips}
                className="ml-1 text-[11px] text-ink-muted hover:text-ink"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Body — list or grid */}
        {viewMode === "list" ? (
          <>
            <div className="flex flex-col gap-0.5">
              {sorted.length === 0 ? (
                <div className="py-16 text-center text-[13px] text-ink-faint">
                  No guests match these filters.
                </div>
              ) : (
                sorted.map((g) => (
                  <GuestRow
                    key={g.id}
                    guest={g}
                    onSelect={() => onSelectGuest(g.id)}
                    selected={selectedIds.has(g.id)}
                    anySelected={selectedIds.size > 0}
                    onToggleSelect={() => toggleSelected(g.id)}
                  />
                ))
              )}
            </div>
            <div className="mt-6 border-t border-border pt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
              {sorted.length} of {allGuests.length} guests
              {selectedIds.size > 0 && (
                <span className="ml-3 text-ink-muted">
                  · {selectedIds.size} selected
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Mobile: grid hidden; show a friendly note */}
            <div className="md:hidden rounded-md border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-ink-muted">
              Event grid is easier to use on a wider screen. Switch to{" "}
              <button
                onClick={() => setViewMode("list")}
                className="underline underline-offset-2 hover:text-ink"
              >
                List view
              </button>{" "}
              or rotate your device.
            </div>
            <div className="hidden md:block">
              <EventGrid
                guests={sorted}
                selectedIds={selectedIds}
                onToggleSelected={toggleSelected}
                onSelectAllVisible={selectAllVisible}
                onSelectGuest={onSelectGuest}
                onToggleInvitation={onToggleInvitation}
                onUpdateRsvp={onUpdateRsvp}
              />
              <div className="mt-6 border-t border-border pt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                {sorted.length} of {allGuests.length} guests
                {selectedIds.size > 0 && (
                  <span className="ml-3 text-ink-muted">
                    · {selectedIds.size} selected
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          onClear={clearSelection}
          onInviteToEvents={(eventIds) => {
            for (const id of selectedIds) {
              const g = sorted.find((x) => x.id === id);
              if (!g) continue;
              for (const eid of eventIds) {
                if (g.rsvp[eid] == null) onToggleInvitation(id, eid);
              }
            }
          }}
          onSetRsvp={(eventId, status) => {
            for (const id of selectedIds) {
              const g = sorted.find((x) => x.id === id);
              if (!g) continue;
              if (g.rsvp[eventId] == null) onToggleInvitation(id, eventId);
              onUpdateRsvp(id, eventId, status);
            }
          }}
          onAddCategories={(names) => {
            const clean = names.map((n) => n.trim()).filter(Boolean);
            if (clean.length === 0) return;
            for (const id of selectedIds) {
              const g = sorted.find((x) => x.id === id);
              if (!g) continue;
              const toAdd = clean.filter((n) => !g.categories.includes(n));
              if (toAdd.length === 0) continue;
              onUpdateGuest(
                id,
                { categories: [...g.categories, ...toAdd] },
                toAdd.length === 1
                  ? `Added to circle "${toAdd[0]}"`
                  : `Added to ${toAdd.length} circles`,
              );
            }
          }}
        />
      )}

      {showSummary && (
        <SummaryPanel
          guests={sideFilteredGuests}
          onClose={() => setShowSummary(false)}
          onDrill={(chip) => {
            onAddChip(chip);
            setShowSummary(false);
          }}
        />
      )}
      {showDrafts && (
        <RsvpDraftsModal
          households={pendingDraftHouseholds}
          coupleNames="Ananya & Arjun"
          rsvpDeadline="May 15, 2026"
          onClose={() => setShowDrafts(false)}
        />
      )}
      {showFilters && (
        <FilterDrawer
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
          onClear={() => setFilters(EMPTY_FILTERS)}
          categoryOptions={categoryOptions}
          cityOptions={cityOptions}
        />
      )}
    </>
  );
}

function sideHeading(side: "all" | Side): string {
  if (side === "bride") return "Bride's Side";
  if (side === "groom") return "Groom's Side";
  if (side === "mutual") return "Mutual Guests";
  return "All Guests";
}

// ═══════════════════════════════════════════════════════════════════════════
//   Side pills — the always-visible filter
// ═══════════════════════════════════════════════════════════════════════════

function SidePills({
  value,
  onChange,
  counts,
}: {
  value: "all" | Side;
  onChange: (v: "all" | Side) => void;
  counts: { all: number; bride: number; groom: number; mutual: number };
}) {
  const options: { key: "all" | Side; label: string; dot?: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "bride", label: "Bride", dot: "bg-rose-light", count: counts.bride },
    { key: "groom", label: "Groom", dot: "bg-sage-light", count: counts.groom },
    { key: "mutual", label: "Mutual", dot: "bg-gold-light", count: counts.mutual },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border bg-white p-0.5">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
              active ? "bg-ink text-ivory" : "text-ink-muted hover:text-ink",
            )}
          >
            {o.dot && <span className={cn("h-1.5 w-1.5 rounded-full", o.dot)} />}
            {o.label}
            <span
              className={cn(
                "font-mono text-[10px] tabular-nums",
                active ? "text-ivory/70" : "text-ink-faint",
              )}
            >
              {o.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   View toggle — [ List | Grid ]
// ═══════════════════════════════════════════════════════════════════════════

function ViewToggle({
  value,
  onChange,
}: {
  value: "list" | "grid";
  onChange: (v: "list" | "grid") => void;
}) {
  const options: { key: "list" | "grid"; label: string; Icon: React.ElementType }[] = [
    { key: "list", label: "List", Icon: LayoutList },
    { key: "grid", label: "Grid", Icon: LayoutGrid },
  ];
  return (
    <div
      className="hidden items-center gap-0.5 rounded-full border border-border bg-white p-0.5 md:flex"
      role="tablist"
      aria-label="View mode"
    >
      {options.map((o) => {
        const active = value === o.key;
        const Icon = o.Icon;
        return (
          <button
            key={o.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
              active ? "bg-ink text-ivory" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon size={12} strokeWidth={1.7} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Event Grid — spreadsheet of guests × events
// ═══════════════════════════════════════════════════════════════════════════

function EventGrid({
  guests,
  selectedIds,
  onToggleSelected,
  onSelectAllVisible,
  onSelectGuest,
  onToggleInvitation,
  onUpdateRsvp,
}: {
  guests: Guest[];
  selectedIds: Set<string>;
  onToggleSelected: (id: string) => void;
  onSelectAllVisible: (on: boolean) => void;
  onSelectGuest: (id: string) => void;
  onToggleInvitation: (guestId: string, eventId: string) => void;
  onUpdateRsvp: (guestId: string, eventId: string, status: RsvpStatus) => void;
}) {
  const eventInviteCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of EVENTS) c[e.id] = 0;
    for (const g of guests) {
      for (const eid of Object.keys(g.rsvp)) {
        if (c[eid] != null) c[eid]++;
      }
    }
    return c;
  }, [guests]);

  const allSelected = guests.length > 0 && selectedIds.size === guests.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const inviteAllToEvent = useCallback(
    (eventId: string) => {
      for (const g of guests) {
        if (g.rsvp[eventId] == null) onToggleInvitation(g.id, eventId);
      }
    },
    [guests, onToggleInvitation],
  );

  if (guests.length === 0) {
    return (
      <div className="py-16 text-center text-[13px] text-ink-faint">
        No guests match these filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-white">
      <table className="min-w-full border-separate border-spacing-0 text-[12.5px]">
        <thead>
          <tr className="bg-ivory-warm/40">
            <th
              className="sticky left-0 z-20 w-[40px] border-b border-border bg-ivory-warm/40 px-3 py-2 text-left align-middle"
              scope="col"
            >
              <SelectBox
                state={allSelected ? "checked" : someSelected ? "indeterminate" : "unchecked"}
                onClick={() => onSelectAllVisible(!allSelected)}
                ariaLabel="Select all visible guests"
              />
            </th>
            <th
              className="sticky left-[40px] z-20 min-w-[220px] border-b border-r border-border bg-ivory-warm/40 px-3 py-2 text-left align-middle font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              scope="col"
            >
              Guest
            </th>
            {EVENTS.map((e) => (
              <th
                key={e.id}
                className="min-w-[112px] border-b border-border px-2 py-2 align-middle"
                scope="col"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[12px] font-medium leading-tight text-ink">
                    {e.label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    {e.date} · {eventInviteCounts[e.id]} invited
                  </span>
                  <button
                    onClick={() => inviteAllToEvent(e.id)}
                    className="mt-0.5 rounded px-1.5 py-0.5 text-[10px] text-ink-muted hover:bg-ivory-warm hover:text-ink"
                    title={`Invite all ${guests.length} visible to ${e.label}`}
                  >
                    Invite all
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => {
            const selected = selectedIds.has(g.id);
            return (
              <tr
                key={g.id}
                className={cn(
                  "group transition-colors",
                  selected ? "bg-gold-pale/20" : "hover:bg-ivory-warm/40",
                )}
                style={{ contentVisibility: "auto", containIntrinsicSize: "44px" }}
              >
                <td
                  className={cn(
                    "sticky left-0 z-10 border-b border-border px-3 py-2 align-middle",
                    selected ? "bg-gold-pale/20" : "bg-white group-hover:bg-ivory-warm/40",
                  )}
                >
                  <SelectBox
                    state={selected ? "checked" : "unchecked"}
                    onClick={() => onToggleSelected(g.id)}
                    ariaLabel={`Select ${g.firstName} ${g.lastName}`}
                  />
                </td>
                <td
                  className={cn(
                    "sticky left-[40px] z-10 border-b border-r border-border px-3 py-2 align-middle",
                    selected ? "bg-gold-pale/20" : "bg-white group-hover:bg-ivory-warm/40",
                  )}
                >
                  <button
                    onClick={() => onSelectGuest(g.id)}
                    className="flex items-center gap-2 text-left"
                  >
                    <GuestAvatar guest={g} size={26} />
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium text-ink hover:underline">
                        {g.firstName} {g.lastName}
                      </span>
                      <span className="block truncate text-[10.5px] text-ink-faint">
                        {g.city}
                      </span>
                    </span>
                  </button>
                </td>
                {EVENTS.map((e) => (
                  <td
                    key={e.id}
                    className="border-b border-border px-2 py-2 text-center align-middle"
                  >
                    <RsvpCell
                      guest={g}
                      eventId={e.id}
                      onToggleInvitation={onToggleInvitation}
                      onUpdateRsvp={onUpdateRsvp}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SelectBox({
  state,
  onClick,
  ariaLabel,
}: {
  state: "checked" | "unchecked" | "indeterminate";
  onClick: () => void;
  ariaLabel: string;
}) {
  const Icon =
    state === "checked" ? CheckSquare : state === "indeterminate" ? MinusSquare : Square;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={ariaLabel}
      aria-checked={state === "checked"}
      role="checkbox"
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-sm transition-colors",
        state === "unchecked"
          ? "text-ink-faint hover:text-ink"
          : "text-ink",
      )}
    >
      <Icon size={15} strokeWidth={1.6} />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   RsvpCell — click to invite / open mini-menu for status or uninvite
// ═══════════════════════════════════════════════════════════════════════════

const RSVP_CELL_STYLES: Record<
  RsvpStatus | "not_invited" | "invited",
  { glyph: string; bg: string; ring: string; text: string; title: string }
> = {
  not_invited: {
    glyph: "",
    bg: "bg-transparent",
    ring: "border border-dashed border-border",
    text: "text-ink-faint",
    title: "Not invited — click to invite",
  },
  invited: {
    glyph: "✓",
    bg: "bg-ivory-deep",
    ring: "border border-border",
    text: "text-ink-muted",
    title: "Invited · no response",
  },
  no_response: {
    glyph: "✓",
    bg: "bg-ivory-deep",
    ring: "border border-border",
    text: "text-ink-muted",
    title: "Invited · no response",
  },
  confirmed: {
    glyph: "✓",
    bg: "bg-sage-pale",
    ring: "border border-sage/40",
    text: "text-sage",
    title: "Confirmed",
  },
  pending: {
    glyph: "⏳",
    bg: "bg-gold-pale/60",
    ring: "border border-gold/30",
    text: "text-saffron",
    title: "Pending",
  },
  declined: {
    glyph: "✕",
    bg: "bg-rose-pale/60",
    ring: "border border-rose-light/40",
    text: "text-rose",
    title: "Declined",
  },
  tentative: {
    glyph: "~",
    bg: "bg-gold-pale/30",
    ring: "border border-gold/20",
    text: "text-saffron/80",
    title: "Tentative",
  },
  // Waitlist is a guest-level pool — the per-event cell never renders this
  // value — but the Record<RsvpStatus, …> constraint requires it.
  waitlist: {
    glyph: "·",
    bg: "bg-ink/[0.03]",
    ring: "border border-dashed border-ink/20",
    text: "text-ink-faint",
    title: "On waitlist",
  },
};

function RsvpCell({
  guest,
  eventId,
  onToggleInvitation,
  onUpdateRsvp,
}: {
  guest: Guest;
  eventId: string;
  onToggleInvitation: (guestId: string, eventId: string) => void;
  onUpdateRsvp: (guestId: string, eventId: string, status: RsvpStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const status = guest.rsvp[eventId];
  const invited = status != null;
  const performing = useGuestPerformsAtEvent(guest.id, eventId);

  const styleKey: RsvpStatus | "not_invited" = invited
    ? (status as RsvpStatus)
    : "not_invited";
  const style = RSVP_CELL_STYLES[styleKey];

  const handleClick = () => {
    if (!invited) {
      onToggleInvitation(guest.id, eventId);
      return;
    }
    setOpen((v) => !v);
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        aria-label={`${guest.firstName} ${guest.lastName} — ${style.title}`}
        title={style.title}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded text-[12px] leading-none transition-all hover:ring-1 hover:ring-ink/20",
          style.bg,
          style.ring,
          style.text,
        )}
      >
        {style.glyph}
      </button>
      {performing && (
        <span
          className="text-[11px] leading-none"
          title={`Performing at this event`}
          aria-label="Performing at this event"
        >
          🎭
        </span>
      )}
      {open && invited && (
        <>
          <button
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
            aria-label="Close menu"
            tabIndex={-1}
          />
          <div
            className="absolute left-1/2 top-[calc(100%+4px)] z-40 w-44 -translate-x-1/2 rounded-md border border-border bg-white py-1 text-left shadow-[0_8px_24px_rgba(26,26,26,0.08)]"
            role="menu"
          >
            <div className="border-b border-border px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
              Set RSVP
            </div>
            {(
              [
                "confirmed",
                "pending",
                "declined",
                "tentative",
                "no_response",
              ] as RsvpStatus[]
            ).map((s) => (
              <button
                key={s}
                onClick={() => {
                  onUpdateRsvp(guest.id, eventId, s);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-1.5 text-[12px] hover:bg-ivory-warm/50",
                  status === s ? "text-ink" : "text-ink-muted",
                )}
                role="menuitem"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-3.5 w-3.5 items-center justify-center rounded text-[10px]",
                      RSVP_CELL_STYLES[s].bg,
                      RSVP_CELL_STYLES[s].ring,
                      RSVP_CELL_STYLES[s].text,
                    )}
                  >
                    {RSVP_CELL_STYLES[s].glyph}
                  </span>
                  {RSVP_LABEL[s]}
                </span>
                {status === s && <Check size={12} strokeWidth={1.8} />}
              </button>
            ))}
            <div className="border-t border-border pt-1">
              <button
                onClick={() => {
                  onToggleInvitation(guest.id, eventId);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-rose hover:bg-rose-pale/30"
                role="menuitem"
              >
                <X size={12} strokeWidth={1.7} />
                Uninvite
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Bulk action bar — floats at the bottom when guests are selected
// ═══════════════════════════════════════════════════════════════════════════

function BulkActionBar({
  count,
  onClear,
  onInviteToEvents,
  onSetRsvp,
  onAddCategories,
}: {
  count: number;
  onClear: () => void;
  onInviteToEvents: (eventIds: string[]) => void;
  onSetRsvp: (eventId: string, status: RsvpStatus) => void;
  onAddCategories: (categoryNames: string[]) => void;
}) {
  const [openMenu, setOpenMenu] = useState<"invite" | "rsvp" | "category" | null>(null);
  const [pickedEvents, setPickedEvents] = useState<Set<string>>(new Set());
  const [rsvpEvent, setRsvpEvent] = useState<string>(EVENTS[0].id);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>("confirmed");
  const [pickedCategoryIds, setPickedCategoryIds] = useState<Set<string>>(
    new Set(),
  );
  const [categoryQuery, setCategoryQuery] = useState("");

  const rawCategories = useGuestCategoriesStore((s) => s.categories);
  const categories = useMemo(
    () => orderedCategories(rawCategories),
    [rawCategories],
  );

  const close = () => {
    setOpenMenu(null);
    setPickedEvents(new Set());
    setPickedCategoryIds(new Set());
    setCategoryQuery("");
  };

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-border bg-white px-4 py-2 shadow-[0_12px_32px_rgba(26,26,26,0.12)]">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
          {count} selected
        </span>
        <span className="h-4 w-px bg-border" />

        {/* Invite to... */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === "invite" ? null : "invite")}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium text-ink-muted hover:bg-ivory-warm hover:text-ink"
          >
            Invite to…
            <ChevronDown size={12} strokeWidth={1.7} />
          </button>
          {openMenu === "invite" && (
            <BulkPopover onClose={close}>
              <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Pick events
              </div>
              <div className="max-h-72 overflow-y-auto px-2">
                {EVENTS.map((e) => {
                  const checked = pickedEvents.has(e.id);
                  return (
                    <label
                      key={e.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[12.5px] hover:bg-ivory-warm/50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setPickedEvents((prev) => {
                            const next = new Set(prev);
                            if (next.has(e.id)) next.delete(e.id);
                            else next.add(e.id);
                            return next;
                          })
                        }
                        className="h-3.5 w-3.5 accent-ink"
                      />
                      <span className="flex-1 text-ink">{e.label}</span>
                      <span className="font-mono text-[10px] text-ink-faint">
                        {e.date}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
                <button
                  onClick={close}
                  className="text-[12px] text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  disabled={pickedEvents.size === 0}
                  onClick={() => {
                    onInviteToEvents([...pickedEvents]);
                    close();
                  }}
                  className={cn(
                    "rounded-md px-3 py-1 text-[12px] font-medium",
                    pickedEvents.size === 0
                      ? "bg-ivory-deep text-ink-faint"
                      : "bg-ink text-ivory hover:opacity-90",
                  )}
                >
                  Apply
                </button>
              </div>
            </BulkPopover>
          )}
        </div>

        {/* Set RSVP... */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === "rsvp" ? null : "rsvp")}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium text-ink-muted hover:bg-ivory-warm hover:text-ink"
          >
            Set RSVP…
            <ChevronDown size={12} strokeWidth={1.7} />
          </button>
          {openMenu === "rsvp" && (
            <BulkPopover onClose={close}>
              <div className="flex flex-col gap-3 px-3 py-3">
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    Event
                  </span>
                  <select
                    value={rsvpEvent}
                    onChange={(e) => setRsvpEvent(e.target.value)}
                    className="rounded-md border border-border bg-white py-1.5 pl-2 pr-8 text-[12.5px] text-ink outline-none focus:border-gold"
                  >
                    {EVENTS.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.label} · {e.date}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    Status
                  </span>
                  <select
                    value={rsvpStatus}
                    onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                    className="rounded-md border border-border bg-white py-1.5 pl-2 pr-8 text-[12.5px] text-ink outline-none focus:border-gold"
                  >
                    {(
                      [
                        "confirmed",
                        "pending",
                        "declined",
                        "tentative",
                        "no_response",
                      ] as RsvpStatus[]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {RSVP_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={close}
                    className="text-[12px] text-ink-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onSetRsvp(rsvpEvent, rsvpStatus);
                      close();
                    }}
                    className="rounded-md bg-ink px-3 py-1 text-[12px] font-medium text-ivory hover:opacity-90"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </BulkPopover>
          )}
        </div>

        {/* Add Category... */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === "category" ? null : "category")}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium text-ink-muted hover:bg-ivory-warm hover:text-ink"
          >
            <Tag size={11} strokeWidth={1.7} />
            Add to Circle…
          </button>
          {openMenu === "category" && (
            <BulkPopover onClose={close}>
              <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Pick circles
              </div>
              <div className="px-2 pb-2">
                <div className="relative">
                  <Search
                    size={11}
                    strokeWidth={1.7}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-faint"
                  />
                  <input
                    autoFocus
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    placeholder="Search…"
                    className="w-full rounded border border-border bg-white py-1 pl-6 pr-2 text-[12px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto px-2">
                {categories.length === 0 ? (
                  <div className="px-2 py-3 text-[11.5px] italic text-ink-faint">
                    No circles yet — create one in the Circles tab.
                  </div>
                ) : (
                  categories
                    .filter((c) =>
                      c.name
                        .toLowerCase()
                        .includes(categoryQuery.trim().toLowerCase()),
                    )
                    .map((c) => {
                      const checked = pickedCategoryIds.has(c.id);
                      const sw = swatchFor(c.color);
                      return (
                        <label
                          key={c.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[12.5px] hover:bg-ivory-warm/50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setPickedCategoryIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(c.id)) next.delete(c.id);
                                else next.add(c.id);
                                return next;
                              })
                            }
                            className="h-3.5 w-3.5 accent-ink"
                          />
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: sw.dot }}
                          />
                          <span className="min-w-0 flex-1 truncate text-ink">
                            {c.name}
                          </span>
                        </label>
                      );
                    })
                )}
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
                <button
                  onClick={close}
                  className="text-[12px] text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  disabled={pickedCategoryIds.size === 0}
                  onClick={() => {
                    const names: string[] = [];
                    for (const id of pickedCategoryIds) {
                      const c = categories.find((x) => x.id === id);
                      if (c) names.push(c.name);
                    }
                    onAddCategories(names);
                    close();
                  }}
                  className={cn(
                    "rounded-md px-3 py-1 text-[12px] font-medium",
                    pickedCategoryIds.size === 0
                      ? "bg-ivory-deep text-ink-faint"
                      : "bg-ink text-ivory hover:opacity-90",
                  )}
                >
                  Apply
                </button>
              </div>
            </BulkPopover>
          )}
        </div>

        <span className="h-4 w-px bg-border" />
        <button
          onClick={onClear}
          className="rounded-full px-2 py-1 text-[11.5px] text-ink-faint hover:text-ink"
          aria-label="Clear selection"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function BulkPopover({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      <button
        className="fixed inset-0 z-30 cursor-default"
        onClick={onClose}
        aria-label="Close menu"
        tabIndex={-1}
      />
      <div className="absolute bottom-[calc(100%+10px)] left-1/2 z-40 w-64 -translate-x-1/2 rounded-lg border border-border bg-white shadow-[0_12px_32px_rgba(26,26,26,0.12)]">
        {children}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Guest row — 5 elements: avatar+name, side dot, events, RSVP, chevron
// ═══════════════════════════════════════════════════════════════════════════

function GuestRow({
  guest,
  onSelect,
  selected,
  onToggleSelect,
  anySelected,
}: {
  guest: Guest;
  onSelect: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
  anySelected?: boolean;
}) {
  const eventsText = describeInvitedEvents(guest);
  const rsvpState = describeRsvpState(guest);
  const isChecked = selected ?? false;
  // Show the checkbox inline when: the row is selected, OR any row in the
  // list is currently selected (affordance cue), OR the user is hovering.
  // When nothing is selected, the avatar carries the left slot and the
  // checkbox only appears on hover.
  const showCheckbox = onToggleSelect != null;

  return (
    <div
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-md px-4 py-3.5 text-left transition-colors",
        isChecked ? "bg-gold-pale/20" : "hover:bg-ivory-warm/40",
      )}
    >
      {showCheckbox && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.();
          }}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
            isChecked
              ? "border-ink bg-ink text-ivory"
              : cn(
                  "border-ink/25 bg-white text-ink-faint hover:border-ink/50",
                  anySelected
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 focus:opacity-100",
                ),
          )}
          aria-label={isChecked ? "Deselect guest" : "Select guest"}
          aria-pressed={isChecked}
        >
          {isChecked && <Check size={12} strokeWidth={2.4} />}
        </button>
      )}
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <GuestAvatar guest={guest} size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "truncate text-[13.5px] font-medium leading-tight",
                guest.onWaitlist ? "text-ink-muted" : "text-ink",
              )}
            >
              {guest.salutation ? `${guest.salutation}. ` : ""}
              {guest.firstName} {guest.lastName}
            </span>
            {guest.onWaitlist && (
              <span
                className="shrink-0 rounded border border-dashed border-ink/25 bg-ink/[0.03] px-1.5 py-[1px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink-muted"
                title="On the waitlist — not invited yet"
              >
                Waitlist
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-[11.5px] text-ink-faint">
            {guest.relationship} · {guest.city}
          </div>
        </div>

        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", SIDE_DOT[guest.side])}
          aria-label={SIDE_LABEL[guest.side]}
          title={SIDE_LABEL[guest.side]}
        />

        <GuestTravelIcons guest={guest} />

        <span
          className="hidden shrink-0 truncate text-[12px] text-ink-muted md:block md:w-[150px] md:text-right"
          title={eventsText.full}
        >
          {eventsText.label}
        </span>

        <span
          className={cn(
            "hidden shrink-0 text-[12px] font-medium md:block md:w-[96px] md:text-right",
            rsvpState.tone,
          )}
        >
          {rsvpState.label}
        </span>

        <ChevronRight
          size={15}
          strokeWidth={1.6}
          className="shrink-0 text-ink-faint transition-colors group-hover:text-ink"
        />
      </button>
    </div>
  );
}

// Out-of-town guests get subtle travel-state icons in the list: flight
// logged (✈), hotel assigned (🏨), or warning when neither. In-town guests
// get no icons — keeps the list calm for the 70% case.
function GuestTravelIcons({ guest }: { guest: Guest }) {
  if (!guest.outOfTown) return null;
  const hasFlight = (guest.flights?.length ?? 0) > 0;
  const hasHotel = Boolean(guest.hotelId);
  const missing = !hasFlight && !hasHotel;
  return (
    <span className="hidden shrink-0 items-center gap-1 md:inline-flex">
      {hasFlight && (
        <span title="Flight info on file" aria-label="Flight info on file">
          <Plane size={12} strokeWidth={1.8} className="text-sage" />
        </span>
      )}
      {hasHotel && (
        <span title="Hotel assigned" aria-label="Hotel assigned">
          <Hotel size={12} strokeWidth={1.8} className="text-saffron" />
        </span>
      )}
      {missing && (
        <span
          title="Out of town — no flight or hotel on file"
          aria-label="Out of town, no flight or hotel on file"
        >
          <AlertTriangle size={12} strokeWidth={1.8} className="text-rose" />
        </span>
      )}
    </span>
  );
}

function describeInvitedEvents(guest: Guest): { label: string; full: string } {
  const invited = EVENTS.filter((e) => guest.rsvp[e.id] != null);
  if (invited.length === 0) return { label: "Not invited", full: "Not invited" };
  if (invited.length === EVENTS.length)
    return { label: "All events", full: "All events" };
  const full = invited.map((e) => e.label).join(" · ");
  if (invited.length === 1) return { label: invited[0].label, full };
  if (invited.length === 2)
    return { label: `${invited[0].label} + ${invited[1].label}`, full };
  return { label: `${invited.length} events`, full };
}

function describeRsvpState(guest: Guest): { label: string; tone: string } {
  if (guest.onWaitlist) return { label: "Waitlist", tone: "text-ink-faint" };
  const values = Object.values(guest.rsvp);
  if (values.length === 0) return { label: "—", tone: "text-ink-faint" };
  const confirmed = values.filter((s) => s === "confirmed").length;
  const declined = values.filter((s) => s === "declined").length;
  if (confirmed === values.length) return { label: "Confirmed", tone: "text-sage" };
  if (declined === values.length) return { label: "Declined", tone: "text-rose" };
  if (confirmed === 0 && declined === 0)
    return { label: "Pending", tone: "text-saffron" };
  return { label: `Partial · ${confirmed}/${values.length}`, tone: "text-ink-muted" };
}

// ═══════════════════════════════════════════════════════════════════════════
//   Summary panel — behind the Summary button, drill-through chips
// ═══════════════════════════════════════════════════════════════════════════

function SummaryPanel({
  guests,
  onDrill,
  onClose,
}: {
  guests: Guest[];
  onDrill: (chip: FilterChip) => void;
  onClose: () => void;
}) {
  const stats = useMemo(() => {
    const total = guests.length;
    let confirmed = 0;
    let declined = 0;
    let pending = 0;
    let outOfTown = 0;
    let travelPending = 0;
    const dietaryCounts: Record<string, number> = {};
    for (const g of guests) {
      const values = Object.values(g.rsvp);
      if (values.some((s) => s === "confirmed")) confirmed++;
      else if (values.every((s) => s === "declined")) declined++;
      else pending++;
      if (g.outOfTown) {
        outOfTown++;
        if (!g.hotelId) travelPending++;
      }
      for (const d of g.dietary) dietaryCounts[d] = (dietaryCounts[d] ?? 0) + 1;
    }
    const rsvpPct = total ? Math.round(((confirmed + declined) / total) * 100) : 0;
    const projected = confirmed + Math.round(pending * 0.6);
    const today = new Date("2026-04-17");
    const deadline = new Date("2026-05-15");
    const daysToDeadline = Math.max(
      0,
      Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const brideCount = guests.filter((g) => g.side === "bride").length;
    const groomCount = guests.filter((g) => g.side === "groom").length;
    const mutualCount = guests.filter((g) => g.side === "mutual").length;
    return {
      total,
      confirmed,
      declined,
      pending,
      rsvpPct,
      projected,
      outOfTown,
      travelPending,
      dietaryCounts,
      daysToDeadline,
      brideCount,
      groomCount,
      mutualCount,
    };
  }, [guests]);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[1px]"
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col border-l border-border bg-white shadow-[-8px_0_32px_rgba(26,26,26,0.06)]">
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
              Guest summary
            </p>
            <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
              {stats.total} in view
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-faint hover:bg-ivory-warm hover:text-ink"
            aria-label="Close summary"
          >
            <X size={16} strokeWidth={1.7} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            <SummaryMetric
              label="Total invited"
              value={stats.total.toString()}
              sublabel={`${stats.brideCount} bride · ${stats.groomCount} groom · ${stats.mutualCount} mutual`}
              accent
            />
            <SummaryMetric
              label="RSVP progress"
              value={`${stats.rsvpPct}%`}
              sublabel={`${stats.confirmed} confirmed · ${stats.pending} pending`}
              progress={stats.rsvpPct}
              onClick={() =>
                onDrill({
                  id: "rsvp-incomplete",
                  label: "Incomplete RSVPs",
                  predicate: (g) =>
                    Object.values(g.rsvp).some(
                      (s) => s === "pending" || s === "no_response" || s === "tentative",
                    ),
                })
              }
            />
            <SummaryMetric
              label="Expected"
              value={stats.projected.toString()}
              sublabel="Confirmed + 60% of pending"
              accent
            />
            <SummaryMetric
              label="Out of town"
              value={stats.outOfTown.toString()}
              sublabel={`${stats.travelPending} need lodging`}
              onClick={() =>
                onDrill({
                  id: "out-of-town",
                  label: "Out-of-town guests",
                  predicate: (g) => g.outOfTown,
                })
              }
            />
            <SummaryMetric
              label="RSVP deadline"
              value={`${stats.daysToDeadline}d`}
              sublabel="May 15, 2026"
              onClick={() =>
                onDrill({
                  id: "no-response",
                  label: "Haven't RSVP'd",
                  predicate: (g) =>
                    Object.values(g.rsvp).every(
                      (s) => s === "no_response" || s === "pending",
                    ),
                })
              }
            />
            <div className="col-span-2">
              <DietaryMiniChart counts={stats.dietaryCounts} total={stats.total} />
            </div>
          </div>
          <p className="mt-6 text-[11.5px] leading-relaxed text-ink-faint">
            Tap any metric to filter the list. Filters stack as chips above the list.
          </p>
        </div>
      </aside>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Filter drawer — power filters behind the Filter button
// ═══════════════════════════════════════════════════════════════════════════

function FilterDrawer({
  filters,
  onChange,
  onClose,
  onClear,
  categoryOptions,
  cityOptions,
}: {
  filters: AllFilters;
  onChange: (f: AllFilters) => void;
  onClose: () => void;
  onClear: () => void;
  categoryOptions: string[];
  cityOptions: string[];
}) {
  const toggleList = (key: "categories" | "cities", value: string) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[1px]"
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[380px] flex-col border-l border-border bg-white shadow-[-8px_0_32px_rgba(26,26,26,0.06)]">
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
              Refine
            </p>
            <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
              Filters
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-faint hover:bg-ivory-warm hover:text-ink"
            aria-label="Close filters"
          >
            <X size={16} strokeWidth={1.7} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-5">
            <FilterField
              label="Sort by"
              value={filters.sort}
              onChange={(v) => onChange({ ...filters, sort: v as SortKey })}
              options={[
                { value: "name", label: "Name (default)" },
                { value: "city", label: "City" },
                { value: "rsvp_pct", label: "RSVP completion %" },
                { value: "events_invited", label: "Number of events invited to" },
              ]}
            />
            <FilterField
              label="VIP tier"
              value={filters.vip}
              onChange={(v) => onChange({ ...filters, vip: v as AllFilters["vip"] })}
              options={[
                { value: "all", label: "All tiers" },
                { value: "immediate_family", label: "Immediate family" },
                { value: "close_family", label: "Close family" },
                { value: "honored", label: "Honored guest" },
                { value: "standard", label: "Standard" },
                { value: "plus_one", label: "Plus-one" },
              ]}
            />
            <FilterField
              label="Priority"
              value={filters.tier}
              onChange={(v) => onChange({ ...filters, tier: v as AllFilters["tier"] })}
              options={[
                { value: "all", label: "All priorities" },
                { value: "A", label: "A-list" },
                { value: "B", label: "B-list" },
                { value: "C", label: "C-list" },
              ]}
            />
            <FilterField
              label="Travel"
              value={filters.outOfTown}
              onChange={(v) =>
                onChange({ ...filters, outOfTown: v as AllFilters["outOfTown"] })
              }
              options={[
                { value: "all", label: "Everywhere" },
                { value: "yes", label: "Out of town" },
                { value: "no", label: "Local" },
              ]}
            />
            <FilterField
              label="Event invited"
              value={filters.event}
              onChange={(v) => onChange({ ...filters, event: v })}
              options={[
                { value: "all", label: "Any event" },
                ...EVENTS.map((e) => ({ value: e.id, label: e.label })),
              ]}
            />
            <FilterField
              label={
                filters.event === "all"
                  ? "RSVP status (any event)"
                  : `RSVP status · ${EVENTS.find((e) => e.id === filters.event)?.label ?? ""}`
              }
              value={filters.rsvp}
              onChange={(v) => onChange({ ...filters, rsvp: v as AllFilters["rsvp"] })}
              options={[
                { value: "all", label: "Any" },
                { value: "confirmed", label: "Confirmed" },
                { value: "pending", label: "Pending" },
                { value: "declined", label: "Declined" },
                { value: "tentative", label: "Tentative" },
                { value: "no_response", label: "No response" },
                { value: "waitlist", label: "Waitlist" },
              ]}
            />
            <FilterField
              label="Dietary"
              value={filters.dietary}
              onChange={(v) =>
                onChange({ ...filters, dietary: v as AllFilters["dietary"] })
              }
              options={[
                { value: "all", label: "Any dietary" },
                ...Object.entries(DIETARY_LABEL).map(([value, label]) => ({ value, label })),
              ]}
            />
            <FilterField
              label="Performing"
              value={filters.performing}
              onChange={(v) => onChange({ ...filters, performing: v })}
              options={[
                { value: "all", label: "Any" },
                { value: "yes", label: "Performing at any event" },
                { value: "no", label: "Not performing" },
                ...EVENTS.map((e) => ({
                  value: e.id,
                  label: `Performing at ${e.label}`,
                })),
              ]}
            />
            <FilterField
              label="Missing info"
              value={filters.missingInfo}
              onChange={(v) =>
                onChange({ ...filters, missingInfo: v as MissingInfo })
              }
              options={[
                { value: "all", label: "No filter" },
                { value: "phone", label: "Missing phone" },
                { value: "email", label: "Missing email" },
                { value: "address", label: "Missing address" },
              ]}
            />
            <MultiSelectField
              label={`Circle${filters.categories.length ? ` · ${filters.categories.length}` : ""}`}
              selected={filters.categories}
              options={categoryOptions}
              emptyText="No circles on any guest yet."
              onToggle={(v) => toggleList("categories", v)}
              onClear={() => onChange({ ...filters, categories: [] })}
            />
            <MultiSelectField
              label={`City${filters.cities.length ? ` · ${filters.cities.length}` : ""}`}
              selected={filters.cities}
              options={cityOptions}
              emptyText="No cities recorded."
              onToggle={(v) => toggleList("cities", v)}
              onClear={() => onChange({ ...filters, cities: [] })}
            />
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-border px-6 py-4">
          <button onClick={onClear} className="text-[12px] text-ink-muted hover:text-ink">
            Clear filters
          </button>
          <button
            onClick={onClose}
            className="rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory hover:opacity-90"
          >
            Apply
          </button>
        </footer>
      </aside>
    </>
  );
}

function FilterField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-white py-2 pl-3 pr-8 text-[13px] text-ink outline-none focus:border-gold"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MultiSelectField({
  label,
  selected,
  options,
  emptyText,
  onToggle,
  onClear,
}: {
  label: string;
  selected: string[];
  options: string[];
  emptyText: string;
  onToggle: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </span>
        {selected.length > 0 && (
          <button
            onClick={onClear}
            className="text-[10.5px] text-ink-faint hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>
      {options.length === 0 ? (
        <p className="text-[12px] text-ink-faint">{emptyText}</p>
      ) : (
        <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-white">
          {options.map((o) => {
            const checked = selected.includes(o);
            return (
              <label
                key={o}
                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[12.5px] hover:bg-ivory-warm/50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(o)}
                  className="h-3.5 w-3.5 accent-ink"
                />
                <span className="flex-1 truncate text-ink">{o}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-white py-1 pl-2 pr-6 text-[11.5px] text-ink outline-none focus:border-gold"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BulkButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="flex items-center gap-1.5 rounded border border-ink/15 bg-white px-2.5 py-1 text-[11.5px] text-ink hover:border-ink/30">
      <Icon size={12} strokeWidth={1.6} />
      {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Shared row pieces
// ═══════════════════════════════════════════════════════════════════════════

function GuestAvatar({ guest, size = 32 }: { guest: Guest; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-gold-pale font-serif text-saffron"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
      }}
      title={`${guest.firstName} ${guest.lastName}`}
    >
      {avatarInitials(guest.firstName, guest.lastName)}
    </div>
  );
}

function VipBadge({ tier }: { tier: VipTier }) {
  const tones: Record<VipTier, string> = {
    immediate_family: "border-gold/40 bg-gold-pale/50 text-saffron",
    close_family: "border-sage/30 bg-sage-pale/60 text-sage",
    honored: "border-rose-light/40 bg-rose-pale/50 text-rose",
    standard: "border-ink/10 bg-ivory/50 text-ink-muted",
    plus_one: "border-ink/10 bg-ivory/50 text-ink-faint italic",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10.5px] font-medium",
        tones[tier],
      )}
    >
      {VIP_LABEL[tier]}
    </span>
  );
}

function RsvpMiniBar({ r }: { r: { confirmed: number; pending: number; declined: number; total: number } }) {
  if (r.total === 0) {
    return <span className="font-mono text-[10.5px] text-ink-faint">—</span>;
  }
  const confirmPct = (r.confirmed / r.total) * 100;
  const pendPct = (r.pending / r.total) * 100;
  const declPct = (r.declined / r.total) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 w-20 overflow-hidden rounded-full bg-ivory-deep">
        <div className="bg-sage" style={{ width: `${confirmPct}%` }} />
        <div className="bg-gold-light" style={{ width: `${pendPct}%` }} />
        <div className="bg-rose" style={{ width: `${declPct}%` }} />
      </div>
      <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
        {r.confirmed}/{r.total}
      </span>
    </div>
  );
}

function DietaryBadges({ dietary }: { dietary: Dietary[] }) {
  if (dietary.length === 0)
    return <span className="font-mono text-[10.5px] text-ink-faint">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {dietary.slice(0, 2).map((d) => (
        <span
          key={d}
          className="inline-flex items-center gap-1 rounded border border-sage/30 bg-sage-pale/40 px-1.5 py-0.5 font-mono text-[10px] text-sage"
        >
          <Leaf size={9} strokeWidth={1.6} />
          {DIETARY_LABEL[d]}
        </span>
      ))}
      {dietary.length > 2 && (
        <span className="font-mono text-[10px] text-ink-faint">+{dietary.length - 2}</span>
      )}
    </div>
  );
}

function TagPills({ tags, more }: { tags: string[]; more: number }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex rounded border border-border bg-ivory/50 px-1.5 py-0.5 text-[10.5px] text-ink-muted"
        >
          {t}
        </span>
      ))}
      {more > 0 && <span className="font-mono text-[10px] text-ink-faint">+{more}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Households view — grouped cards
// ═══════════════════════════════════════════════════════════════════════════

function HouseholdsView({
  guests,
  allGuests,
  households,
  onSelectGuest,
  onUpdateHousehold,
  onAssignGuestToHousehold,
  onCreateHouseholdForGuest,
  hideSummary,
}: {
  guests: Guest[];
  allGuests: Guest[];
  households: Household[];
  onSelectGuest: (id: string) => void;
  onUpdateHousehold: (householdId: string, patch: Partial<Household>) => void;
  onAssignGuestToHousehold: (guestId: string, householdId: string) => void;
  onCreateHouseholdForGuest: (
    guestId: string,
    input: {
      displayName: string;
      invitationAddressing: string;
      branch?: string;
      city?: string;
      country?: string;
      outOfTown?: boolean;
    },
  ) => void;
  hideSummary?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sideFilter, setSideFilter] = useState<"all" | Side>("all");
  const [eventFilter, setEventFilter] = useState<"all" | string>("all");
  const [showUnassigned, setShowUnassigned] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState("");
  const [assigningGuestId, setAssigningGuestId] = useState<string | null>(null);

  const householdIdSet = useMemo(
    () => new Set(households.map((h) => h.id)),
    [households],
  );

  const guestsByHouseholdId = useMemo(() => {
    const m = new Map<string, Guest[]>();
    for (const g of guests) {
      if (!m.has(g.householdId)) m.set(g.householdId, []);
      m.get(g.householdId)!.push(g);
    }
    return m;
  }, [guests]);

  const unassignedGuests = useMemo(
    () => allGuests.filter((g) => !householdIdSet.has(g.householdId)),
    [allGuests, householdIdSet],
  );

  const sideCounts = useMemo(
    () => ({
      all: households.length,
      bride: households.filter((h) => h.side === "bride").length,
      groom: households.filter((h) => h.side === "groom").length,
      mutual: households.filter((h) => h.side === "mutual").length,
    }),
    [households],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return households.filter((h) => {
      if (sideFilter !== "all" && h.side !== sideFilter) return false;
      if (eventFilter !== "all") {
        const r = householdRsvpForEvent(allGuests, h.id, eventFilter);
        if (r.confirmed === 0) return false;
      }
      if (q) {
        const members = guestsByHouseholdId.get(h.id) ?? [];
        const hay = `${h.displayName} ${h.city} ${h.branch} ${members
          .map((m) => `${m.firstName} ${m.lastName}`)
          .join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [households, query, sideFilter, eventFilter, guestsByHouseholdId, allGuests]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const beginEditAddress = (h: Household) => {
    setEditingAddressId(h.id);
    setAddressDraft(h.invitationAddressing);
  };

  const commitEditAddress = () => {
    if (editingAddressId) {
      const trimmed = addressDraft.trim();
      if (trimmed.length > 0) {
        onUpdateHousehold(editingAddressId, { invitationAddressing: trimmed });
      }
    }
    setEditingAddressId(null);
    setAddressDraft("");
  };

  return (
    <div>
      {!hideSummary && <SummaryStrip guests={guests} />}

      <div className="px-8 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SidePills
            value={sideFilter}
            onChange={(v) => setSideFilter(v)}
            counts={sideCounts}
          />
          <FilterSelect
            label="Event"
            value={eventFilter}
            onChange={(v) => setEventFilter(v)}
            options={[
              { value: "all", label: "All events" },
              ...EVENTS.map((e) => ({ value: e.id, label: e.label })),
            ]}
          />
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search
              size={14}
              strokeWidth={1.7}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search households or family names…"
              className="w-full rounded-md border border-border bg-white py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
          </div>
          {unassignedGuests.length > 0 && (
            <button
              type="button"
              onClick={() => setShowUnassigned((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
                showUnassigned
                  ? "border-saffron/50 bg-saffron/10 text-saffron"
                  : "border-rose/40 bg-rose-pale/40 text-rose hover:border-rose/60",
              )}
            >
              <AlertCircle size={12} strokeWidth={1.8} />
              {unassignedGuests.length} unassigned
              <span className="font-mono text-[10px] tabular-nums">
                {showUnassigned ? "▾" : "▸"}
              </span>
            </button>
          )}
          <div className="ml-auto font-mono text-[11px] text-ink-faint">
            {filtered.length} of {households.length} households · {guests.length} guests
          </div>
        </div>

        {showUnassigned && unassignedGuests.length > 0 && (
          <UnassignedGuestsPanel
            guests={unassignedGuests}
            households={households}
            assigningGuestId={assigningGuestId}
            onRequestAssign={(id) => setAssigningGuestId(id)}
            onCancelAssign={() => setAssigningGuestId(null)}
            onAssignToExisting={(guestId, householdId) => {
              onAssignGuestToHousehold(guestId, householdId);
              setAssigningGuestId(null);
            }}
            onCreateAndAssign={(guestId, input) => {
              onCreateHouseholdForGuest(guestId, input);
              setAssigningGuestId(null);
            }}
            onSelectGuest={onSelectGuest}
          />
        )}

        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((h) => {
            const members = guestsByHouseholdId.get(h.id) ?? [];
            const isOpen = expanded.has(h.id);

            let totalInvited = 0;
            let totalConfirmed = 0;
            for (const e of EVENTS) {
              const r = householdRsvpForEvent(guests, h.id, e.id);
              totalInvited += r.invited;
              totalConfirmed += r.confirmed;
            }
            const rsvpDotClass =
              totalInvited === 0
                ? "bg-border"
                : totalConfirmed === totalInvited
                  ? "bg-sage"
                  : totalConfirmed === 0
                    ? "bg-border"
                    : "bg-saffron";
            const rsvpLabel =
              totalInvited === 0
                ? "—"
                : totalConfirmed === totalInvited
                  ? "All confirmed"
                  : `${totalConfirmed}/${totalInvited} confirmed`;

            const isEditingThis = editingAddressId === h.id;

            return (
              <article
                key={h.id}
                className="overflow-hidden rounded-md border border-border bg-white transition-colors hover:border-gold/30"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(h.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span
                    className={cn("h-2.5 w-2.5 shrink-0 rounded-full", SIDE_DOT[h.side])}
                    title={SIDE_LABEL[h.side]}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                      {h.branch}
                    </div>
                    <div className="truncate text-[13.5px] font-medium text-ink">
                      {h.displayName}
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                    <span className={cn("h-1.5 w-1.5 rounded-full", rsvpDotClass)} />
                    <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
                      {rsvpLabel}
                    </span>
                  </div>
                  <div className="shrink-0 pl-3 font-mono text-[10.5px] uppercase tracking-[0.12em] tabular-nums text-ink-muted">
                    {members.length} {members.length === 1 ? "member" : "members"}
                  </div>
                  <ChevronRight
                    size={13}
                    strokeWidth={1.7}
                    className={cn(
                      "shrink-0 text-ink-faint transition-transform",
                      isOpen && "rotate-90",
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-border/60 bg-ivory/20">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 text-[11.5px] text-ink-muted">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} strokeWidth={1.6} />
                          {h.city}, {h.country}
                        </span>
                        {h.outOfTown && (
                          <span className="flex items-center gap-1 text-saffron">
                            <Plane size={11} strokeWidth={1.6} />
                            Out of town
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 border-t border-border/60 px-5 py-2.5 text-[11px]">
                        <span className="font-mono uppercase tracking-[0.12em] text-ink-faint">
                          Addressed
                        </span>
                        {isEditingThis ? (
                          <input
                            autoFocus
                            value={addressDraft}
                            onChange={(e) => setAddressDraft(e.target.value)}
                            onBlur={commitEditAddress}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitEditAddress();
                              } else if (e.key === "Escape") {
                                e.preventDefault();
                                setEditingAddressId(null);
                                setAddressDraft("");
                              }
                            }}
                            className="flex-1 rounded border border-gold/50 bg-white px-2 py-1 text-[11.5px] italic text-ink focus:border-gold focus:outline-none"
                          />
                        ) : (
                          <>
                            <span className="flex-1 italic text-ink-muted">
                              "{h.invitationAddressing}"
                            </span>
                            <button
                              type="button"
                              onClick={() => beginEditAddress(h)}
                              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] text-ink-faint hover:bg-ivory hover:text-ink"
                              title="Edit addressee"
                            >
                              <Pencil size={10} strokeWidth={1.8} />
                              Edit
                            </button>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 border-t border-border/60 px-5 py-2.5">
                        {EVENTS.map((e) => {
                          const r = householdRsvpForEvent(guests, h.id, e.id);
                          if (r.invited === 0) return null;
                          const allConfirmed = r.confirmed === r.invited;
                          const allDeclined = r.declined === r.invited;
                          return (
                            <span
                              key={e.id}
                              title={`${e.label}: ${r.confirmed} confirmed of ${r.invited} invited`}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px]",
                                allConfirmed
                                  ? "border-sage/40 bg-sage-pale/60 text-sage"
                                  : allDeclined
                                    ? "border-rose/40 bg-rose-pale/40 text-rose"
                                    : r.confirmed > 0
                                      ? "border-saffron/40 bg-gold-pale/40 text-saffron"
                                      : "border-border bg-white text-ink-muted",
                              )}
                            >
                              <span className="font-medium">{e.label}</span>
                              <span className="font-mono tabular-nums text-[10px] opacity-80">
                                {r.confirmed}/{r.invited}
                              </span>
                            </span>
                          );
                        })}
                        {EVENTS.every(
                          (e) =>
                            householdRsvpForEvent(guests, h.id, e.id).invited === 0,
                        ) && (
                          <span className="text-[11px] italic text-ink-faint">
                            Not invited to any events yet
                          </span>
                        )}
                      </div>

                      <div className="border-t border-border/60 bg-white">
                        {members.map((m) => {
                          const r = rsvpSummary(m);
                          return (
                            <button
                              key={m.id}
                              onClick={() => onSelectGuest(m.id)}
                              className="flex w-full items-center gap-3 border-b border-border/50 px-5 py-2.5 text-left text-[12.5px] last:border-b-0 hover:bg-ivory/40"
                            >
                              <GuestAvatar guest={m} size={28} />
                              <div className="flex-1">
                                <div className="font-medium text-ink">
                                  {m.salutation ? `${m.salutation}. ` : ""}
                                  {m.firstName} {m.lastName}
                                </div>
                                <div className="font-mono text-[10px] text-ink-faint">
                                  {m.relationship} · {AGE_LABEL[m.ageCategory]}
                                </div>
                              </div>
                              <DietaryBadges dietary={m.dietary} />
                              <RsvpMiniBar r={r} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-ink-faint">
            No households match your search.
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Unassigned guests panel — inline assignment / new household creation
// ═══════════════════════════════════════════════════════════════════════════

function UnassignedGuestsPanel({
  guests,
  households,
  assigningGuestId,
  onRequestAssign,
  onCancelAssign,
  onAssignToExisting,
  onCreateAndAssign,
  onSelectGuest,
}: {
  guests: Guest[];
  households: Household[];
  assigningGuestId: string | null;
  onRequestAssign: (guestId: string) => void;
  onCancelAssign: () => void;
  onAssignToExisting: (guestId: string, householdId: string) => void;
  onCreateAndAssign: (
    guestId: string,
    input: {
      displayName: string;
      invitationAddressing: string;
      branch?: string;
      city?: string;
      country?: string;
      outOfTown?: boolean;
    },
  ) => void;
  onSelectGuest: (id: string) => void;
}) {
  return (
    <section className="mb-5 overflow-hidden rounded-md border border-rose/30 bg-rose-pale/20">
      <header className="flex items-center gap-2 border-b border-rose/20 bg-rose-pale/30 px-5 py-2.5">
        <AlertCircle size={13} strokeWidth={1.8} className="text-rose" />
        <h3 className="font-serif text-[14px] text-ink">Unassigned guests</h3>
        <span className="font-mono text-[10.5px] text-ink-faint">
          Not yet placed in any household
        </span>
      </header>
      <div className="divide-y divide-border/50 bg-white">
        {guests.map((g) => (
          <UnassignedGuestRow
            key={g.id}
            guest={g}
            households={households}
            isAssigning={assigningGuestId === g.id}
            onRequestAssign={() => onRequestAssign(g.id)}
            onCancelAssign={onCancelAssign}
            onAssignToExisting={(householdId) =>
              onAssignToExisting(g.id, householdId)
            }
            onCreateAndAssign={(input) => onCreateAndAssign(g.id, input)}
            onSelectGuest={() => onSelectGuest(g.id)}
          />
        ))}
      </div>
    </section>
  );
}

function UnassignedGuestRow({
  guest,
  households,
  isAssigning,
  onRequestAssign,
  onCancelAssign,
  onAssignToExisting,
  onCreateAndAssign,
  onSelectGuest,
}: {
  guest: Guest;
  households: Household[];
  isAssigning: boolean;
  onRequestAssign: () => void;
  onCancelAssign: () => void;
  onAssignToExisting: (householdId: string) => void;
  onCreateAndAssign: (input: {
    displayName: string;
    invitationAddressing: string;
    branch?: string;
    city?: string;
    country?: string;
    outOfTown?: boolean;
  }) => void;
  onSelectGuest: () => void;
}) {
  const [mode, setMode] = useState<"pick" | "new">("pick");
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>("");
  const [newHouseholdName, setNewHouseholdName] = useState(
    `The ${guest.lastName} Family`,
  );
  const [newAddressing, setNewAddressing] = useState(
    `${guest.salutation ? `${guest.salutation}. ` : ""}${guest.firstName} ${guest.lastName}`,
  );

  const eligibleHouseholds = useMemo(
    () => households.filter((h) => h.side === guest.side),
    [households, guest.side],
  );

  return (
    <div className="px-5 py-2.5 text-[12.5px]">
      <div className="flex items-center gap-3">
        <GuestAvatar guest={guest} size={28} />
        <button
          type="button"
          onClick={onSelectGuest}
          className="min-w-0 flex-1 text-left"
        >
          <div className="truncate font-medium text-ink hover:text-saffron">
            {guest.salutation ? `${guest.salutation}. ` : ""}
            {guest.firstName} {guest.lastName}
          </div>
          <div className="font-mono text-[10px] text-ink-faint">
            {guest.relationship} · {SIDE_LABEL[guest.side]}
          </div>
        </button>
        {!isAssigning && (
          <button
            type="button"
            onClick={onRequestAssign}
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1 text-[11.5px] font-medium text-ivory hover:opacity-90"
          >
            <HomeIcon size={11} strokeWidth={1.8} />
            Assign household
          </button>
        )}
      </div>

      {isAssigning && (
        <div className="mt-3 rounded-md border border-border bg-ivory/30 p-3">
          <div className="mb-2 flex items-center gap-0.5 rounded-full border border-border bg-white p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setMode("pick")}
              className={cn(
                "rounded-full px-3 py-1 font-medium transition-colors",
                mode === "pick"
                  ? "bg-ink text-ivory"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              Assign to existing
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              className={cn(
                "rounded-full px-3 py-1 font-medium transition-colors",
                mode === "new"
                  ? "bg-ink text-ivory"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              Create new
            </button>
          </div>

          {mode === "pick" ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedHouseholdId}
                onChange={(e) => setSelectedHouseholdId(e.target.value)}
                className="flex-1 rounded border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-gold focus:outline-none"
              >
                <option value="">Select a household…</option>
                {eligibleHouseholds.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.displayName} · {h.branch} · {h.city}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedHouseholdId}
                onClick={() => onAssignToExisting(selectedHouseholdId)}
                className="rounded bg-sage px-3 py-1.5 text-[11.5px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Assign
              </button>
              <button
                type="button"
                onClick={onCancelAssign}
                className="rounded border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted hover:border-ink/20 hover:text-ink"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
                    Display name
                  </span>
                  <input
                    value={newHouseholdName}
                    onChange={(e) => setNewHouseholdName(e.target.value)}
                    className="w-full rounded border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-gold focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
                    Invitation addressing
                  </span>
                  <input
                    value={newAddressing}
                    onChange={(e) => setNewAddressing(e.target.value)}
                    className="w-full rounded border border-border bg-white px-2 py-1.5 text-[12px] italic text-ink focus:border-gold focus:outline-none"
                  />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    newHouseholdName.trim().length === 0 ||
                    newAddressing.trim().length === 0
                  }
                  onClick={() =>
                    onCreateAndAssign({
                      displayName: newHouseholdName.trim(),
                      invitationAddressing: newAddressing.trim(),
                    })
                  }
                  className="rounded bg-sage px-3 py-1.5 text-[11.5px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Create & assign
                </button>
                <button
                  type="button"
                  onClick={onCancelAssign}
                  className="rounded border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted hover:border-ink/20 hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   By Side view
// ═══════════════════════════════════════════════════════════════════════════

function BySideView({
  guests,
  households,
  onSelectGuest,
}: {
  guests: Guest[];
  households: Household[];
  onSelectGuest: (id: string) => void;
}) {
  const sides: { id: Side; label: string; accent: string }[] = [
    { id: "bride", label: "Bride's Side", accent: "rose" },
    { id: "groom", label: "Groom's Side", accent: "sage" },
    { id: "mutual", label: "Mutual", accent: "gold" },
  ];

  return (
    <div>
      <SummaryStrip guests={guests} />
      <div className="px-8 py-6">
        <div className="grid gap-5 lg:grid-cols-3">
          {sides.map((s) => {
            const sideGuests = guests.filter((g) => g.side === s.id);
            const branches = Array.from(
              new Set(sideGuests.map((g) => g.familyBranch)),
            ).sort();
            return (
              <section key={s.id} className="rounded-lg border border-border bg-white">
                <header
                  className={cn(
                    "border-b border-border px-5 py-4",
                    s.id === "bride" && "bg-rose-pale/30",
                    s.id === "groom" && "bg-sage-pale/40",
                    s.id === "mutual" && "bg-gold-pale/30",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-[20px] text-ink">{s.label}</h2>
                    <span className="font-mono text-[12px] text-ink-muted tabular-nums">
                      {sideGuests.length}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                    {branches.length} branch{branches.length === 1 ? "" : "es"}
                  </div>
                </header>

                <div className="max-h-[600px] overflow-y-auto">
                  {branches.map((branch) => {
                    const members = sideGuests.filter(
                      (g) => g.familyBranch === branch,
                    );
                    return (
                      <div key={branch} className="border-b border-border/60 last:border-b-0">
                        <div className="bg-ivory/40 px-5 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted">
                          {branch} · {members.length}
                        </div>
                        {members.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => onSelectGuest(m.id)}
                            className="flex w-full items-center gap-3 border-b border-border/30 px-5 py-2 text-left text-[12.5px] last:border-b-0 hover:bg-ivory/40"
                          >
                            <GuestAvatar guest={m} size={24} />
                            <div className="flex-1 truncate">
                              <div className="truncate text-ink">
                                {m.firstName} {m.lastName}
                              </div>
                              <div className="font-mono text-[10px] text-ink-faint">
                                {m.relationship}
                              </div>
                            </div>
                            <VipBadge tier={m.vipTier} />
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   By Event view — RSVP matrix (guests × events)
// ═══════════════════════════════════════════════════════════════════════════

type MatrixGroupMode = "household" | "side" | "flat";
type MatrixSortKey = "household" | "name" | "side" | "confirmed_events";
type MatrixFilterableStatus = Exclude<RsvpStatus, "waitlist">;

const MATRIX_STATUS_META: Record<
  RsvpStatus,
  { label: string; symbol: string; bg: string; border: string; fg: string; swatch: string }
> = {
  confirmed: {
    label: "Confirmed",
    symbol: "●",
    bg: "bg-sage-pale/70",
    border: "border-sage/40",
    fg: "text-sage",
    swatch: "bg-sage",
  },
  tentative: {
    label: "Tentative",
    symbol: "◐",
    bg: "bg-teal-pale/70",
    border: "border-teal/35",
    fg: "text-teal",
    swatch: "bg-teal",
  },
  pending: {
    label: "Pending",
    symbol: "○",
    bg: "bg-gold-pale/60",
    border: "border-gold/40",
    fg: "text-saffron",
    swatch: "bg-saffron",
  },
  declined: {
    label: "Declined",
    symbol: "✕",
    bg: "bg-rose-pale/60",
    border: "border-rose/30",
    fg: "text-rose",
    swatch: "bg-rose",
  },
  no_response: {
    label: "No response",
    symbol: "–",
    bg: "bg-ivory-deep/60",
    border: "border-ink/10",
    fg: "text-ink-faint",
    swatch: "bg-ink-faint",
  },
  waitlist: {
    label: "Waitlist",
    symbol: "~",
    bg: "bg-ivory/60",
    border: "border-dashed border-ink/20",
    fg: "text-ink-muted",
    swatch: "bg-ink-faint",
  },
};

const MATRIX_FILTERABLE_STATUSES: MatrixFilterableStatus[] = [
  "confirmed",
  "tentative",
  "pending",
  "declined",
  "no_response",
];

function shortEventLabel(name: string): string {
  return name
    .replace("Welcome Dinner", "Welcome")
    .replace("Farewell Brunch", "Brunch");
}

function countConfirmed(guest: Guest): number {
  return Object.values(guest.rsvp).filter((s) => s === "confirmed").length;
}

function aggregateEventStatus(guests: Guest[], eventId: string) {
  let invited = 0;
  let confirmed = 0;
  for (const g of guests) {
    if (g.rsvp[eventId] != null) {
      invited++;
      if (g.rsvp[eventId] === "confirmed") confirmed++;
    }
  }
  return { invited, confirmed };
}

function ByEventView({
  guests,
  households,
  onUpdateRsvp,
  onSelectGuest,
  hideSummary,
}: {
  guests: Guest[];
  households: Household[];
  onUpdateRsvp: (guestId: string, eventId: string, status: RsvpStatus) => void;
  onSelectGuest: (id: string) => void;
  hideSummary?: boolean;
}) {
  const [sideFilter, setSideFilter] = useState<Side | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Set<MatrixFilterableStatus>>(
    () => new Set(MATRIX_FILTERABLE_STATUSES),
  );
  const [dietaryFilter, setDietaryFilter] = useState<Set<Dietary>>(() => new Set());
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<MatrixSortKey>("household");
  const [groupMode, setGroupMode] = useState<MatrixGroupMode>("household");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [openCell, setOpenCell] = useState<{ guestId: string; eventId: string } | null>(
    null,
  );

  const eventStats = useMemo(
    () => EVENTS.map((e) => ({ event: e, ...aggregateEventStatus(guests, e.id) })),
    [guests],
  );

  const overallStats = useMemo(() => {
    let invited = 0;
    let confirmed = 0;
    for (const g of guests) {
      for (const s of Object.values(g.rsvp)) {
        invited++;
        if (s === "confirmed") confirmed++;
      }
    }
    return {
      households: new Set(guests.map((g) => g.householdId)).size,
      guests: guests.length,
      invited,
      confirmed,
      rate: invited ? Math.round((confirmed / invited) * 100) : 0,
    };
  }, [guests]);

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();
    const statusAll = statusFilter.size === MATRIX_FILTERABLE_STATUSES.length;
    const filtered = guests.filter((g) => {
      if (sideFilter !== "all" && g.side !== sideFilter) return false;
      if (!statusAll) {
        const hit = Object.values(g.rsvp).some((s) =>
          statusFilter.has(s as MatrixFilterableStatus),
        );
        if (!hit) return false;
      }
      if (dietaryFilter.size > 0 && !g.dietary.some((d) => dietaryFilter.has(d))) {
        return false;
      }
      if (query && !`${g.firstName} ${g.lastName}`.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortKey === "name") {
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        );
      }
      if (sortKey === "side") {
        return a.side.localeCompare(b.side) || a.lastName.localeCompare(b.lastName);
      }
      if (sortKey === "confirmed_events") {
        return countConfirmed(b) - countConfirmed(a);
      }
      return (
        a.householdId.localeCompare(b.householdId) ||
        a.lastName.localeCompare(b.lastName)
      );
    });
    return sorted;
  }, [guests, sideFilter, statusFilter, dietaryFilter, search, sortKey]);

  type MatrixGroup = {
    key: string;
    label: string;
    side?: Side;
    guests: Guest[];
  };

  const groups = useMemo<MatrixGroup[]>(() => {
    if (groupMode === "flat") {
      return [{ key: "__all", label: "All guests", guests: filteredGuests }];
    }
    if (groupMode === "side") {
      const sides: Side[] = ["bride", "groom", "mutual"];
      return sides
        .map((s) => ({
          key: `side:${s}`,
          label: SIDE_LABEL[s],
          side: s,
          guests: filteredGuests.filter((g) => g.side === s),
        }))
        .filter((g) => g.guests.length > 0);
    }
    const byHh = new Map<string, Guest[]>();
    for (const g of filteredGuests) {
      const arr = byHh.get(g.householdId) ?? [];
      arr.push(g);
      byHh.set(g.householdId, arr);
    }
    return households
      .filter((h) => byHh.has(h.id))
      .map((h) => ({
        key: h.id,
        label: h.displayName,
        side: h.side,
        guests: byHh.get(h.id) ?? [],
      }));
  }, [filteredGuests, groupMode, households]);

  const toggleGroupCollapsed = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleGroupSelect = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const bulkUpdate = useCallback(
    (eventId: string, status: RsvpStatus) => {
      selectedIds.forEach((id) => {
        const g = guests.find((x) => x.id === id);
        if (g && g.rsvp[eventId] != null) onUpdateRsvp(id, eventId, status);
      });
    },
    [selectedIds, guests, onUpdateRsvp],
  );

  return (
    <div>
      {!hideSummary && <SummaryStrip guests={guests} />}

      <div className="px-8 py-6">
        {/* Summary bar */}
        <div className="mb-4 rounded-lg border border-border bg-white px-6 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
                Cross-event RSVP matrix
              </div>
              <h2 className="mt-1 font-serif text-[22px] text-ink">
                {overallStats.households} households · {overallStats.guests} guests
              </h2>
              <div className="mt-1 font-mono text-[11px] tabular-nums text-ink-muted">
                {overallStats.confirmed}/{overallStats.invited} invitations confirmed
                <span className="mx-1.5 text-ink-faint">·</span>
                {overallStats.rate}% overall
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted hover:border-ink/20 hover:text-ink">
                <Download size={12} strokeWidth={1.6} />
                Export for caterer
              </button>
              <button className="flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold-pale/30 px-3 py-1.5 text-[11.5px] text-saffron hover:bg-gold-pale/50">
                <Send size={12} strokeWidth={1.6} />
                Send reminder
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-x-6 gap-y-3 md:grid-cols-5 lg:grid-cols-9">
            {eventStats.map(({ event, invited, confirmed }) => {
              const pct = invited ? (confirmed / invited) * 100 : 0;
              return (
                <div key={event.id} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="truncate text-[11px] text-ink">{event.label}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="flex h-1 flex-1 overflow-hidden rounded-full bg-ivory-deep/80">
                      <div className="bg-sage" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono text-[10px] tabular-nums text-ink-faint">
                      {confirmed}/{invited}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters toolbar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={12}
              strokeWidth={1.6}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guests…"
              className="w-56 rounded-md border border-border bg-white py-1.5 pl-7 pr-2.5 text-[11.5px] outline-none focus:border-gold"
            />
          </div>

          <MatrixSegControl
            value={sideFilter}
            onChange={setSideFilter}
            options={[
              { value: "all", label: "All sides" },
              { value: "bride", label: "Bride" },
              { value: "groom", label: "Groom" },
            ]}
          />

          <MatrixStatusFilterMenu value={statusFilter} onChange={setStatusFilter} />
          <MatrixDietaryFilterMenu value={dietaryFilter} onChange={setDietaryFilter} />

          <div className="ml-auto flex items-center gap-3 font-mono text-[10.5px] text-ink-muted">
            <label className="flex items-center gap-1.5">
              <span className="uppercase tracking-[0.12em] text-ink-faint">Group</span>
              <select
                value={groupMode}
                onChange={(e) => setGroupMode(e.target.value as MatrixGroupMode)}
                className="rounded-md border border-border bg-white px-2 py-1 text-[10.5px] outline-none focus:border-gold"
              >
                <option value="household">Household</option>
                <option value="side">Side</option>
                <option value="flat">None</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              <span className="uppercase tracking-[0.12em] text-ink-faint">Sort</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as MatrixSortKey)}
                className="rounded-md border border-border bg-white px-2 py-1 text-[10.5px] outline-none focus:border-gold"
              >
                <option value="household">Household</option>
                <option value="name">Name A–Z</option>
                <option value="side">Side</option>
                <option value="confirmed_events">Events confirmed</option>
              </select>
            </label>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <MatrixBulkActionsBar
            count={selectedIds.size}
            onBulkUpdate={bulkUpdate}
            onClear={clearSelection}
          />
        )}

        {/* Matrix grid */}
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <div className="max-h-[calc(100vh-280px)] overflow-auto">
            <table className="w-full border-separate border-spacing-0 text-[12px]">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-30 min-w-[280px] border-b border-r border-border bg-ivory/70 px-4 py-3 text-left align-bottom">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                      Guest / Household
                    </div>
                    <div className="mt-0.5 font-mono text-[10.5px] tabular-nums text-ink-muted">
                      {filteredGuests.length} of {guests.length} shown
                    </div>
                  </th>
                  {EVENTS.map((e) => {
                    const s = eventStats.find((x) => x.event.id === e.id)!;
                    return (
                      <th
                        key={e.id}
                        className="sticky top-0 z-20 min-w-[96px] border-b border-border bg-ivory/70 px-2 py-3 align-bottom"
                        title={`${e.label} · ${e.date}`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[14px] leading-none">{e.icon}</span>
                          <span className="truncate font-serif text-[12px] text-ink">
                            {shortEventLabel(e.label)}
                          </span>
                          <span className="font-mono text-[9.5px] tabular-nums text-ink-faint">
                            {e.date}
                          </span>
                          <span className="font-mono text-[10px] tabular-nums text-sage">
                            {s.confirmed}/{s.invited}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {groups.map((grp) => {
                  const isFlat = grp.key === "__all";
                  const collapsed = !isFlat && collapsedGroups.has(grp.key);
                  const groupIds = grp.guests.map((g) => g.id);
                  const allSelected =
                    groupIds.length > 0 && groupIds.every((id) => selectedIds.has(id));
                  const someSelected =
                    !allSelected && groupIds.some((id) => selectedIds.has(id));

                  return (
                    <Fragment key={grp.key}>
                      {!isFlat && (
                        <tr>
                          <td className="sticky left-0 z-10 border-b border-r border-border bg-ivory/60 px-4 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleGroupCollapsed(grp.key)}
                                className="shrink-0 text-ink-muted hover:text-ink"
                                aria-label={collapsed ? "Expand" : "Collapse"}
                              >
                                {collapsed ? (
                                  <ChevronRight size={14} strokeWidth={1.6} />
                                ) : (
                                  <ChevronDown size={14} strokeWidth={1.6} />
                                )}
                              </button>
                              <MatrixCheckbox
                                state={
                                  allSelected
                                    ? "checked"
                                    : someSelected
                                      ? "indeterminate"
                                      : "unchecked"
                                }
                                onToggle={() => toggleGroupSelect(groupIds)}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate font-serif text-[13.5px] text-ink">
                                    {grp.label}
                                  </span>
                                  <span className="font-mono text-[10px] tabular-nums text-ink-faint">
                                    {grp.guests.length}
                                  </span>
                                </div>
                                {grp.side && (
                                  <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-ink-muted">
                                    <span
                                      className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        SIDE_DOT[grp.side],
                                      )}
                                    />
                                    {SIDE_LABEL[grp.side]}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          {EVENTS.map((e) => {
                            const agg = aggregateEventStatus(grp.guests, e.id);
                            return (
                              <td
                                key={e.id}
                                className="border-b border-border/60 bg-ivory/45 px-1.5 py-2 text-center font-mono text-[10px] tabular-nums text-ink-muted"
                              >
                                {agg.invited === 0 ? (
                                  <span className="text-ink-faint">—</span>
                                ) : (
                                  <span>
                                    <span className="text-sage">{agg.confirmed}</span>
                                    <span className="text-ink-faint">/{agg.invited}</span>
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      )}
                      {!collapsed &&
                        grp.guests.map((g, idx) => {
                          const selected = selectedIds.has(g.id);
                          const zebra = idx % 2 === 0 ? "bg-white" : "bg-ivory/25";
                          const rowBg = selected ? "bg-gold-pale/25" : zebra;
                          return (
                            <tr key={g.id}>
                              <td
                                className={cn(
                                  "sticky left-0 z-10 border-b border-r border-border/70 px-4 py-2",
                                  !isFlat && "pl-10",
                                  rowBg,
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <MatrixCheckbox
                                    state={selected ? "checked" : "unchecked"}
                                    onToggle={() => toggleSelect(g.id)}
                                  />
                                  <GuestAvatar guest={g} size={26} />
                                  <button
                                    type="button"
                                    onClick={() => onSelectGuest(g.id)}
                                    className="min-w-0 flex-1 truncate text-left"
                                  >
                                    <div className="truncate text-[12.5px] text-ink hover:underline">
                                      {g.salutation ? `${g.salutation}. ` : ""}
                                      {g.firstName} {g.lastName}
                                    </div>
                                    <div className="truncate font-mono text-[10px] text-ink-faint">
                                      {g.relationship}
                                    </div>
                                  </button>
                                  <DietaryBadges dietary={g.dietary} />
                                </div>
                              </td>
                              {EVENTS.map((e) => {
                                const status = g.rsvp[e.id];
                                const isOpen =
                                  openCell?.guestId === g.id && openCell?.eventId === e.id;
                                return (
                                  <td
                                    key={e.id}
                                    className={cn(
                                      "relative border-b border-border/50 px-1 py-1.5 text-center",
                                      rowBg,
                                    )}
                                  >
                                    <MatrixStatusCell
                                      status={status}
                                      onClick={() =>
                                        setOpenCell(
                                          isOpen
                                            ? null
                                            : { guestId: g.id, eventId: e.id },
                                        )
                                      }
                                      tooltip={`${g.firstName} ${g.lastName} · ${e.label}`}
                                    />
                                    {isOpen && (
                                      <MatrixStatusPopover
                                        current={status}
                                        invited={status != null}
                                        onSelect={(next) => {
                                          if (next) onUpdateRsvp(g.id, e.id, next);
                                          setOpenCell(null);
                                        }}
                                        onClose={() => setOpenCell(null)}
                                      />
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                    </Fragment>
                  );
                })}
                {groups.length === 0 && (
                  <tr>
                    <td
                      colSpan={EVENTS.length + 1}
                      className="px-4 py-12 text-center font-mono text-[11px] text-ink-faint"
                    >
                      No guests match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10.5px] text-ink-muted">
          <span className="uppercase tracking-[0.12em] text-ink-faint">Legend</span>
          {MATRIX_FILTERABLE_STATUSES.map((s) => {
            const meta = MATRIX_STATUS_META[s];
            return (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] leading-none",
                    meta.bg,
                    meta.border,
                    meta.fg,
                  )}
                >
                  {meta.symbol}
                </span>
                {meta.label}
              </span>
            );
          })}
          <span className="inline-flex items-center gap-1.5 text-ink-faint">
            <span className="inline-block h-4 w-4 rounded-full border border-dashed border-ink/15" />
            Not invited
          </span>
        </div>
      </div>
    </div>
  );
}

function MatrixStatusCell({
  status,
  onClick,
  tooltip,
}: {
  status: RsvpStatus | undefined;
  onClick: () => void;
  tooltip: string;
}) {
  if (status == null) {
    return (
      <span
        title={`${tooltip} · Not invited`}
        className="inline-block h-5 w-5 rounded-full border border-dashed border-ink/10"
      >
        <span className="sr-only">Not invited</span>
      </span>
    );
  }
  const meta = MATRIX_STATUS_META[status];
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${tooltip} · ${meta.label}`}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] leading-none transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-gold/50",
        meta.bg,
        meta.border,
        meta.fg,
      )}
      aria-label={`${tooltip} · ${meta.label}`}
    >
      {meta.symbol}
    </button>
  );
}

function MatrixStatusPopover({
  current,
  invited,
  onSelect,
  onClose,
}: {
  current: RsvpStatus | undefined;
  invited: boolean;
  onSelect: (s: RsvpStatus | null) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-1/2 top-full z-40 mt-1 w-44 -translate-x-1/2 rounded-md border border-border bg-white p-1 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      {!invited ? (
        <div className="px-2 py-2 font-mono text-[10.5px] text-ink-faint">
          Not invited to this event.
        </div>
      ) : (
        MATRIX_FILTERABLE_STATUSES.map((s) => {
          const meta = MATRIX_STATUS_META[s];
          const isCurrent = s === current;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onSelect(s)}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11.5px] hover:bg-ivory/60",
                isCurrent && "bg-ivory",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", meta.swatch)} />
              <span className="flex-1 text-ink">{meta.label}</span>
              {isCurrent && <Check size={11} strokeWidth={2} className="text-sage" />}
            </button>
          );
        })
      )}
    </div>
  );
}

function MatrixCheckbox({
  state,
  onToggle,
}: {
  state: "checked" | "unchecked" | "indeterminate";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="shrink-0 text-ink-muted hover:text-ink"
      aria-label={state === "checked" ? "Deselect" : "Select"}
    >
      {state === "checked" ? (
        <CheckSquare size={14} strokeWidth={1.8} className="text-saffron" />
      ) : state === "indeterminate" ? (
        <MinusSquare size={14} strokeWidth={1.8} className="text-saffron" />
      ) : (
        <Square size={14} strokeWidth={1.6} />
      )}
    </button>
  );
}

function MatrixSegControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-border bg-white text-[11.5px]">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 transition-colors",
            i > 0 && "border-l border-border",
            value === opt.value
              ? "bg-gold-pale/50 text-saffron"
              : "text-ink-muted hover:bg-ivory/60",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function MatrixStatusFilterMenu({
  value,
  onChange,
}: {
  value: Set<MatrixFilterableStatus>;
  onChange: (v: Set<MatrixFilterableStatus>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function cb(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", cb);
    return () => document.removeEventListener("mousedown", cb);
  }, []);

  const label =
    value.size === MATRIX_FILTERABLE_STATUSES.length
      ? "All statuses"
      : `${value.size} status${value.size === 1 ? "" : "es"}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted hover:border-ink/20"
      >
        <SlidersHorizontal size={11} strokeWidth={1.6} />
        {label}
        <ChevronDown size={11} strokeWidth={1.6} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-52 rounded-md border border-border bg-white p-1 shadow-lg">
          {MATRIX_FILTERABLE_STATUSES.map((s) => {
            const meta = MATRIX_STATUS_META[s];
            const checked = value.has(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  const next = new Set(value);
                  if (checked) next.delete(s);
                  else next.add(s);
                  onChange(next);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11.5px] hover:bg-ivory/60"
              >
                {checked ? (
                  <CheckSquare size={12} strokeWidth={1.8} className="text-saffron" />
                ) : (
                  <Square size={12} strokeWidth={1.6} className="text-ink-muted" />
                )}
                <span className={cn("h-2 w-2 rounded-full", meta.swatch)} />
                <span className="flex-1 text-ink">{meta.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MatrixDietaryFilterMenu({
  value,
  onChange,
}: {
  value: Set<Dietary>;
  onChange: (v: Set<Dietary>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function cb(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", cb);
    return () => document.removeEventListener("mousedown", cb);
  }, []);

  const opts = Object.keys(DIETARY_LABEL) as Dietary[];
  const label = value.size === 0 ? "Dietary" : `Dietary · ${value.size}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted hover:border-ink/20"
      >
        <Leaf size={11} strokeWidth={1.6} />
        {label}
        <ChevronDown size={11} strokeWidth={1.6} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-52 rounded-md border border-border bg-white p-1 shadow-lg">
          {opts.map((d) => {
            const checked = value.has(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  const next = new Set(value);
                  if (checked) next.delete(d);
                  else next.add(d);
                  onChange(next);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11.5px] hover:bg-ivory/60"
              >
                {checked ? (
                  <CheckSquare size={12} strokeWidth={1.8} className="text-saffron" />
                ) : (
                  <Square size={12} strokeWidth={1.6} className="text-ink-muted" />
                )}
                <span className="flex-1 text-ink">{DIETARY_LABEL[d]}</span>
              </button>
            );
          })}
          {value.size > 0 && (
            <button
              type="button"
              onClick={() => onChange(new Set())}
              className="mt-0.5 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] text-ink-muted hover:bg-ivory/60"
            >
              <X size={11} strokeWidth={1.6} />
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MatrixBulkActionsBar({
  count,
  onBulkUpdate,
  onClear,
}: {
  count: number;
  onBulkUpdate: (eventId: string, status: RsvpStatus) => void;
  onClear: () => void;
}) {
  const [evId, setEvId] = useState<string>(EVENTS[0].id);
  const [status, setStatus] = useState<RsvpStatus>("confirmed");
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-gold/30 bg-gold-pale/20 px-3 py-2">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-saffron">
        {count} selected
      </span>
      <div className="mx-1 h-4 w-px bg-gold/30" />
      <span className="text-[11.5px] text-ink-muted">Set</span>
      <select
        value={evId}
        onChange={(e) => setEvId(e.target.value)}
        className="rounded-md border border-border bg-white px-2 py-1 text-[11px] outline-none focus:border-gold"
      >
        {EVENTS.map((e) => (
          <option key={e.id} value={e.id}>
            {e.label}
          </option>
        ))}
      </select>
      <span className="text-[11.5px] text-ink-muted">to</span>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as RsvpStatus)}
        className="rounded-md border border-border bg-white px-2 py-1 text-[11px] outline-none focus:border-gold"
      >
        {MATRIX_FILTERABLE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {MATRIX_STATUS_META[s].label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onBulkUpdate(evId, status)}
        className="rounded-md border border-gold/30 bg-white px-3 py-1 text-[11px] text-saffron hover:bg-gold-pale/40"
      >
        Apply
      </button>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-muted hover:bg-ivory/60"
      >
        <X size={11} strokeWidth={1.6} />
        Clear selection
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   RSVP Tracker — funnel style
// ═══════════════════════════════════════════════════════════════════════════

type RsvpColumnConfig = {
  key: RsvpStatus;
  label: string;
  headerBg: string;
  headerBorder: string;
  countBg: string;
  accent: string;
};

const RSVP_COLUMNS: RsvpColumnConfig[] = [
  {
    key: "pending",
    label: "Pending",
    headerBg: "bg-gold-pale/50",
    headerBorder: "border-gold/25",
    countBg: "bg-gold/15 text-saffron",
    accent: "bg-saffron",
  },
  {
    key: "tentative",
    label: "Tentative",
    headerBg: "bg-teal-pale/60",
    headerBorder: "border-teal/25",
    countBg: "bg-teal/15 text-teal",
    accent: "bg-teal",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    headerBg: "bg-sage-pale/70",
    headerBorder: "border-sage/30",
    countBg: "bg-sage/20 text-sage",
    accent: "bg-sage",
  },
  {
    key: "declined",
    label: "Declined",
    headerBg: "bg-rose-pale/60",
    headerBorder: "border-rose/25",
    countBg: "bg-rose/15 text-rose",
    accent: "bg-rose",
  },
  {
    key: "no_response",
    label: "No Response",
    headerBg: "bg-ivory-deep/70",
    headerBorder: "border-ink/10",
    countBg: "bg-ink/5 text-ink-muted",
    accent: "bg-ink-faint",
  },
  {
    key: "waitlist",
    label: "Waitlist",
    headerBg: "bg-ink/[0.03]",
    headerBorder: "border-dashed border-ink/20",
    countBg: "bg-ink/5 text-ink-muted",
    accent: "bg-ink-faint",
  },
];

function RsvpArcProgress({
  coming,
  total,
  size = 148,
  stroke = 12,
}: {
  coming: number;
  total: number;
  size?: number;
  stroke?: number;
}) {
  const pct = total ? Math.min(1, coming / total) : 0;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  // Half-circle arc from left (180°) sweeping over the top to right (0°)
  const arcLength = Math.PI * radius;
  const dashOffset = arcLength * (1 - pct);
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;
  return (
    <div
      className="relative flex items-end justify-center"
      style={{ width: size, height: size / 2 + 8 }}
    >
      <svg
        width={size}
        height={size / 2 + 8}
        viewBox={`0 0 ${size} ${size / 2 + 8}`}
        aria-hidden
      >
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
          fill="none"
          stroke="var(--color-gold-pale)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
          fill="none"
          stroke="var(--color-saffron)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <div
        className="absolute inset-x-0 flex flex-col items-center"
        style={{ bottom: 4 }}
      >
        <span
          className="font-serif text-[30px] leading-none text-ink"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {coming}
        </span>
        <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-muted">
          of {total} coming
        </span>
      </div>
    </div>
  );
}

function RsvpGuestCard({
  guest,
  onSelect,
}: {
  guest: Guest;
  onSelect?: () => void;
}) {
  const rsvpValues = Object.values(guest.rsvp);
  const invited = rsvpValues.length;
  const confirmed = rsvpValues.filter((v) => v === "confirmed").length;
  const pct = invited ? (confirmed / invited) * 100 : 0;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="mb-2 w-full rounded-md border border-border/60 bg-white px-3 py-2 text-left transition-colors hover:border-gold/40 hover:bg-gold-pale/20 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
    >
      <div className="flex items-center gap-2">
        <GuestAvatar guest={guest} size={22} />
        <div className="flex-1 truncate text-[11.5px] text-ink">
          {guest.firstName} {guest.lastName}
        </div>
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", SIDE_DOT[guest.side])}
          aria-label={SIDE_LABEL[guest.side]}
          title={SIDE_LABEL[guest.side]}
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-ivory-deep">
          <div
            className="h-full rounded-full bg-sage transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-[9.5px] tabular-nums text-ink-faint">
          {confirmed}/{invited}
        </span>
      </div>
    </button>
  );
}

function WaitlistGuestCard({
  guest,
  onSelect,
  onPromote,
}: {
  guest: Guest;
  onSelect: () => void;
  onPromote: () => void;
}) {
  return (
    <div className="group relative mb-2 w-full rounded-md border border-dashed border-ink/20 bg-white px-3 py-2 transition-colors hover:border-ink/30 hover:bg-ivory/40">
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-2 text-left"
      >
        <GuestAvatar guest={guest} size={22} />
        <div className="flex-1 truncate text-[11.5px] text-ink">
          {guest.firstName} {guest.lastName}
        </div>
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", SIDE_DOT[guest.side])}
          aria-label={SIDE_LABEL[guest.side]}
          title={SIDE_LABEL[guest.side]}
        />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPromote();
        }}
        className="mt-2 inline-flex items-center gap-1 rounded border border-border/60 bg-white px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-gold/30 hover:text-saffron"
        title="Invite this guest — moves them to Pending across all events"
      >
        <ArrowRight size={10} strokeWidth={1.7} />
        Move to Pending
      </button>
    </div>
  );
}

function WaitlistQuickAdd({
  households,
  onAdd,
  onPromoteHousehold,
  waitlistHouseholds,
}: {
  households: Household[];
  onAdd: (input: { firstName: string; lastName: string; householdId?: string }) => void;
  onPromoteHousehold?: (householdId: string) => void;
  waitlistHouseholds: Household[];
}) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [householdId, setHouseholdId] = useState<string>("");

  function submit() {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn && !ln) return;
    onAdd({
      firstName: fn || "Guest",
      lastName: ln,
      householdId: householdId || undefined,
    });
    setFirstName("");
    setLastName("");
    setHouseholdId("");
    setOpen(false);
  }

  if (!open) {
    return (
      <div className="border-b border-dashed border-ink/15 bg-white/40 p-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-ink/20 bg-white/60 px-2 py-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-ink/35 hover:text-ink"
        >
          <Plus size={11} strokeWidth={1.8} />
          Add
        </button>
        {onPromoteHousehold && waitlistHouseholds.length > 0 && (
          <div className="mt-2">
            <label className="mb-1 block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
              Promote household
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) onPromoteHousehold(e.target.value);
              }}
              className="w-full rounded border border-border/60 bg-white px-1.5 py-1 text-[11px] text-ink-muted focus:border-gold focus:outline-none"
            >
              <option value="">Pick household…</option>
              {waitlistHouseholds.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.displayName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-dashed border-ink/15 bg-white/70 p-2">
      <div className="flex flex-col gap-1.5">
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          autoFocus
          className="rounded border border-border/60 bg-white px-2 py-1 text-[11.5px] text-ink focus:border-gold focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setOpen(false);
          }}
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name"
          className="rounded border border-border/60 bg-white px-2 py-1 text-[11.5px] text-ink focus:border-gold focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setOpen(false);
          }}
        />
        <select
          value={householdId}
          onChange={(e) => setHouseholdId(e.target.value)}
          className="rounded border border-border/60 bg-white px-1.5 py-1 text-[11px] text-ink-muted focus:border-gold focus:outline-none"
        >
          <option value="">New household</option>
          {households.map((h) => (
            <option key={h.id} value={h.id}>
              {h.displayName}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={submit}
            className="flex-1 rounded bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ivory transition-opacity hover:opacity-90"
          >
            Add to waitlist
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded border border-border/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-ivory-warm/60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function RsvpTrackerView({
  guests,
  allGuests,
  households,
  selectedSide,
  onSelectSide,
  onSelectGuest,
  onUpdateGuest,
  onAddWaitlistGuest,
  onPromoteWaitlistHousehold,
}: {
  guests: Guest[];
  allGuests: Guest[];
  households: Household[];
  selectedSide: "all" | Side;
  onSelectSide: (s: "all" | Side) => void;
  onSelectGuest: (id: string) => void;
  onUpdateGuest: (
    guestId: string,
    patch: Partial<Guest>,
    activityNote?: string,
  ) => void;
  onAddWaitlistGuest: (input: {
    firstName: string;
    lastName: string;
    householdId?: string;
  }) => void;
  onPromoteWaitlistHousehold: (householdId: string) => void;
}) {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [filters, setFilters] = useState<AllFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const performances = usePerformancesStore((s) => s.performances);
  const performingGuestIds = useMemo(() => {
    const all = new Set<string>();
    const byEvent = new Map<string, Set<string>>();
    for (const p of performances) {
      let bucket = byEvent.get(p.eventId);
      if (!bucket) {
        bucket = new Set<string>();
        byEvent.set(p.eventId, bucket);
      }
      for (const pt of p.participants) {
        all.add(pt.guestId);
        bucket.add(pt.guestId);
      }
    }
    return { all, byEvent };
  }, [performances]);

  const filteredGuests = useMemo(
    () => applyGuestFilters(guests, filters, performingGuestIds),
    [guests, filters, performingGuestIds],
  );

  const sideCounts = useMemo(
    () => ({
      all: allGuests.length,
      bride: allGuests.filter((g) => g.side === "bride").length,
      groom: allGuests.filter((g) => g.side === "groom").length,
      mutual: allGuests.filter((g) => g.side === "mutual").length,
    }),
    [allGuests],
  );

  const categoryOptions = useMemo(() => {
    const s = new Set<string>();
    for (const g of guests) g.categories.forEach((c) => s.add(c));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [guests]);

  const cityOptions = useMemo(() => {
    const s = new Set<string>();
    for (const g of guests) if (g.city) s.add(g.city);
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [guests]);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  // Bucketize by "dominant" status across events. Waitlisted guests are
  // segregated up front so their empty rsvp record doesn't masquerade as
  // "confirmed" via the `values.every` short-circuit on empty arrays.
  const dominantBucket = (g: Guest): RsvpStatus => {
    if (g.onWaitlist) return "waitlist";
    const values = Object.values(g.rsvp);
    if (values.every((v) => v === "confirmed")) return "confirmed";
    if (values.every((v) => v === "declined")) return "declined";
    if (values.some((v) => v === "tentative")) return "tentative";
    if (values.every((v) => v === "no_response")) return "no_response";
    return "pending";
  };

  const buckets = useMemo(() => {
    const m: Record<RsvpStatus, Guest[]> = {
      pending: [], tentative: [], confirmed: [], declined: [], no_response: [], waitlist: [],
    };
    for (const g of filteredGuests) {
      m[dominantBucket(g)].push(g);
    }
    return m;
  }, [filteredGuests]);

  const headerStats = useMemo(() => {
    // Waitlisted guests are a separate pool — not yet invited — so they
    // don't count toward the "coming of N" headline.
    const invited = filteredGuests.filter((g) => !g.onWaitlist);
    const total = invited.length;
    const coming = buckets.confirmed.length + buckets.tentative.length;
    const waitlistCount = buckets.waitlist.length;

    const today = new Date("2026-04-17");
    const deadline = new Date("2026-05-15");
    const daysToDeadline = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    const dietaryCounts: Record<string, number> = {};
    let outOfTown = 0;
    let travelPending = 0;
    for (const g of invited) {
      if (g.outOfTown) {
        outOfTown++;
        if (!g.hotelId) travelPending++;
      }
      for (const d of g.dietary) {
        dietaryCounts[d] = (dietaryCounts[d] ?? 0) + 1;
      }
    }
    const veg =
      (dietaryCounts["vegetarian"] ?? 0) +
      (dietaryCounts["jain"] ?? 0) +
      (dietaryCounts["swaminarayan"] ?? 0) +
      (dietaryCounts["vegan"] ?? 0);
    const nonveg = dietaryCounts["non_vegetarian"] ?? 0;
    const jain = dietaryCounts["jain"] ?? 0;
    const allergy =
      (dietaryCounts["nut_allergy"] ?? 0) +
      (dietaryCounts["gluten_free"] ?? 0) +
      (dietaryCounts["dairy_free"] ?? 0);

    return {
      total,
      coming,
      waitlistCount,
      daysToDeadline,
      outOfTown,
      travelPending,
      veg,
      nonveg,
      jain,
      allergy,
    };
  }, [filteredGuests, buckets]);

  const deadlineLabel =
    headerStats.daysToDeadline > 0
      ? `${headerStats.daysToDeadline} days left`
      : headerStats.daysToDeadline === 0
        ? "Due today"
        : `${Math.abs(headerStats.daysToDeadline)} days past`;
  const deadlineIsTight = headerStats.daysToDeadline <= 14;

  const nudge = () => {
    // Existing functionality preserved — wiring is handled upstream via
    // the RSVP drafts modal.
  };

  return (
    <div>
      <header className="border-b border-gold/15 bg-white px-8 pb-8 pt-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-7">
            <RsvpArcProgress coming={headerStats.coming} total={headerStats.total} />
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron">
                  RSVP Tracker
                </p>
                <h2
                  className="mt-1 font-serif text-[26px] leading-tight text-ink"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Who's coming?
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] tracking-[0.04em]",
                    deadlineIsTight
                      ? "border-rose/30 bg-rose-pale/50 text-rose"
                      : "border-gold/25 bg-gold-pale/40 text-saffron",
                  )}
                >
                  <Clock size={11} strokeWidth={1.6} />
                  {deadlineLabel}
                </span>
                <span className="font-mono text-[10.5px] text-ink-faint">
                  May 15, 2026
                </span>
                {headerStats.waitlistCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-ink/20 bg-ink/[0.03] px-2.5 py-1 font-mono text-[10.5px] tracking-[0.04em] text-ink-muted"
                    title="Candidates not yet invited"
                  >
                    {headerStats.waitlistCount} on waitlist
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setInsightsOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-border bg-ivory/40 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:bg-ivory/70 md:self-auto"
            aria-expanded={insightsOpen}
          >
            Insights
            <ChevronDown
              size={12}
              strokeWidth={1.6}
              className={cn(
                "transition-transform duration-300",
                insightsOpen && "rotate-180",
              )}
            />
          </button>
        </div>

        <div
          className="overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out"
          style={{
            maxHeight: insightsOpen ? 260 : 0,
            opacity: insightsOpen ? 1 : 0,
            marginTop: insightsOpen ? 24 : 0,
          }}
        >
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-border/60 bg-ivory/40 p-5 md:grid-cols-2">
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">
                Out of town
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className="font-serif text-[22px] leading-none text-ink"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {headerStats.outOfTown}
                </span>
                <span className="text-[11px] text-ink-muted">
                  {headerStats.travelPending} need lodging
                </span>
              </div>
            </div>
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">
                Dietary mix
              </p>
              <div className="mt-2 flex h-[10px] w-full overflow-hidden rounded-full bg-gold/10">
                <div
                  className="bg-sage-light"
                  style={{
                    width: `${(headerStats.veg / Math.max(1, headerStats.total)) * 100}%`,
                  }}
                  title={`Vegetarian: ${headerStats.veg}`}
                />
                <div
                  className="bg-rose-light"
                  style={{
                    width: `${(headerStats.nonveg / Math.max(1, headerStats.total)) * 100}%`,
                  }}
                  title={`Non-veg: ${headerStats.nonveg}`}
                />
                <div
                  className="bg-saffron"
                  style={{
                    width: `${(headerStats.jain / Math.max(1, headerStats.total)) * 100}%`,
                  }}
                  title={`Jain/Swaminarayan: ${headerStats.jain}`}
                />
              </div>
              <p className="mt-2 text-[11px] text-ink-muted">
                {headerStats.veg} veg · {headerStats.nonveg} non-veg ·{" "}
                {headerStats.allergy} allergies
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <SidePills value={selectedSide} onChange={onSelectSide} counts={sideCounts} />
          <button
            onClick={() => setShowFilters(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
              activeFilterCount > 0
                ? "border-gold/40 bg-gold-pale/40 text-gold"
                : "border-border text-ink-muted hover:border-ink/20 hover:text-ink",
            )}
          >
            <SlidersHorizontal size={12} strokeWidth={1.7} />
            Filter
            {activeFilterCount > 0 && (
              <span className="font-mono text-[10px] tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {RSVP_COLUMNS.map((col) => {
            const showNudge = col.key === "no_response" || col.key === "pending";
            const isWaitlist = col.key === "waitlist";
            const waitlistHouseholdIds = isWaitlist
              ? Array.from(
                  new Set(buckets.waitlist.map((g) => g.householdId)),
                )
              : [];
            return (
              <div
                key={col.key}
                className={cn(
                  "flex min-h-[500px] flex-col rounded-lg border bg-white",
                  col.headerBorder,
                  isWaitlist && "bg-ivory/30",
                )}
              >
                <div
                  className={cn(
                    "rounded-t-lg border-b px-4 py-3",
                    col.headerBg,
                    col.headerBorder,
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-medium text-ink">{col.label}</h3>
                    <span
                      className={cn(
                        "min-w-[22px] rounded-full px-1.5 py-0.5 text-center font-mono text-[10.5px] tabular-nums",
                        col.countBg,
                      )}
                    >
                      {buckets[col.key].length}
                    </span>
                  </div>
                  {showNudge && buckets[col.key].length > 0 && (
                    <button
                      onClick={nudge}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-white/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-gold/30 hover:text-saffron"
                    >
                      <Send size={10} strokeWidth={1.6} />
                      Send nudge
                    </button>
                  )}
                  {isWaitlist && (
                    <p className="mt-1.5 text-[10.5px] italic text-ink-faint">
                      Candidates not yet invited
                    </p>
                  )}
                </div>
                {isWaitlist && (
                  <WaitlistQuickAdd
                    households={households}
                    onAdd={onAddWaitlistGuest}
                    onPromoteHousehold={
                      waitlistHouseholdIds.length > 0
                        ? onPromoteWaitlistHousehold
                        : undefined
                    }
                    waitlistHouseholds={households.filter((h) =>
                      waitlistHouseholdIds.includes(h.id),
                    )}
                  />
                )}
                <div className="flex-1 overflow-y-auto p-2">
                  {buckets[col.key].map((g) =>
                    isWaitlist ? (
                      <WaitlistGuestCard
                        key={g.id}
                        guest={g}
                        onSelect={() => onSelectGuest(g.id)}
                        onPromote={() =>
                          onUpdateGuest(
                            g.id,
                            {
                              onWaitlist: false,
                              rsvp: EVENTS.reduce(
                                (acc, ev) => ({ ...acc, [ev.id]: "pending" as RsvpStatus }),
                                {} as Record<string, RsvpStatus>,
                              ),
                            },
                            "Moved from waitlist to pending",
                          )
                        }
                      />
                    ) : (
                      <RsvpGuestCard
                        key={g.id}
                        guest={g}
                        onSelect={() => onSelectGuest(g.id)}
                      />
                    ),
                  )}
                  {buckets[col.key].length === 0 && (
                    <div className="px-2 py-8 text-center text-[11px] italic text-ink-faint">
                      None
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showFilters && (
        <FilterDrawer
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
          onClear={() => setFilters(EMPTY_FILTERS)}
          categoryOptions={categoryOptions}
          cityOptions={cityOptions}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Travel & Lodging
// ═══════════════════════════════════════════════════════════════════════════

type TravelTab = "hotels" | "flights" | "pickups";

function TravelView({
  guests,
  households,
  onUpdateGuest,
  onSelectGuest,
}: {
  guests: Guest[];
  households: Household[];
  onUpdateGuest: (guestId: string, patch: Partial<Guest>, activityNote?: string) => void;
  onSelectGuest: (id: string) => void;
}) {
  const [tab, setTab] = useState<TravelTab>("hotels");

  const outOfTown = useMemo(() => guests.filter((g) => g.outOfTown), [guests]);
  const unassigned = useMemo(() => outOfTown.filter((g) => !g.hotelId), [outOfTown]);
  const allFlights = useMemo(() => {
    const rows: Array<{ guest: Guest; flight: GuestFlight }> = [];
    for (const g of guests) for (const f of g.flights ?? []) rows.push({ guest: g, flight: f });
    return rows;
  }, [guests]);

  const arrivingCount = allFlights.filter((r) => r.flight.direction === "arrival").length;
  const departingCount = allFlights.filter((r) => r.flight.direction === "departure").length;
  const needsPickupCount = outOfTown.filter(
    (g) => (g.flights?.some((f) => f.direction === "arrival") ?? false) && !g.ground?.pickupAssigned,
  ).length;

  return (
    <div>
      <SummaryStrip guests={guests} />
      <div className="px-8 py-6">
        <div className="mb-5 flex items-baseline justify-between">
          <div>
            <h2 className="font-serif text-[22px] text-ink">Travel & Lodging</h2>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              Coordinate hotels, flights, and airport pickups for{" "}
              {outOfTown.length} out-of-town guests.
            </p>
          </div>
        </div>

        {unassigned.length > 0 && (
          <UnassignedHotelBanner
            unassigned={unassigned}
            onUpdateGuest={onUpdateGuest}
            onGoToHotels={() => setTab("hotels")}
          />
        )}

        {/* Tab strip */}
        <div className="mb-6 flex items-center gap-1 border-b border-gold/15">
          {(
            [
              { id: "hotels", label: "Hotels", icon: Hotel, count: HOTELS.length },
              { id: "flights", label: "Flights", icon: Plane, count: allFlights.length },
              { id: "pickups", label: "Pickups", icon: Car, count: needsPickupCount },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] transition-colors",
                  active
                    ? "border-gold text-ink"
                    : "border-transparent text-ink-muted hover:text-ink",
                )}
              >
                <Icon size={13} strokeWidth={1.8} />
                <span className="font-medium">{t.label}</span>
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
                    active ? "bg-gold-pale/60 text-saffron" : "bg-ivory-deep/60 text-ink-faint",
                  )}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {tab === "hotels" && <HotelsSubView guests={guests} onSelectGuest={onSelectGuest} />}
        {tab === "flights" && (
          <FlightsSubView
            guests={guests}
            arrivingCount={arrivingCount}
            departingCount={departingCount}
            needsPickupCount={needsPickupCount}
            onUpdateGuest={onUpdateGuest}
            onSelectGuest={onSelectGuest}
          />
        )}
        {tab === "pickups" && (
          <PickupsSubView
            guests={guests}
            onUpdateGuest={onUpdateGuest}
            onSelectGuest={onSelectGuest}
          />
        )}
      </div>
    </div>
  );
}

// Parse cutoff strings like "May 20" against today. If the parsed date is
// in the past, assume the next year. Returns days-from-today, or null if
// unparseable.
function daysUntilCutoff(cutoff: string): number | null {
  if (!cutoff) return null;
  const now = new Date();
  const candidate = new Date(`${cutoff}, ${now.getFullYear()}`);
  if (Number.isNaN(candidate.getTime())) return null;
  if (candidate.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
    candidate.setFullYear(now.getFullYear() + 1);
  }
  const diffMs = candidate.getTime() - now.getTime();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

function UnassignedHotelBanner({
  unassigned,
  onUpdateGuest,
  onGoToHotels,
}: {
  unassigned: Guest[];
  onUpdateGuest: (guestId: string, patch: Partial<Guest>, activityNote?: string) => void;
  onGoToHotels: () => void;
}) {
  const [open, setOpen] = useState(false);

  function assign(guestId: string, hotelId: HotelBlockId) {
    const hotel = HOTELS.find((h) => h.id === hotelId);
    onUpdateGuest(guestId, { hotelId }, hotel ? `Assigned to ${hotel.name}` : undefined);
  }

  return (
    <div className="mb-5 rounded-md border border-gold/30 bg-gold-pale/20 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertCircle size={15} strokeWidth={1.9} className="text-saffron" />
          <div className="text-[13px] text-ink">
            <span className="font-medium">{unassigned.length}</span>{" "}
            {unassigned.length === 1 ? "guest is" : "guests are"} without a hotel assignment.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setOpen((v) => !v);
              onGoToHotels();
            }}
            className="flex items-center gap-1.5 rounded-md bg-saffron px-3 py-1.5 text-[12px] text-ivory hover:opacity-90"
          >
            {open ? "Close" : "Assign now"}
            <ChevronDown
              size={12}
              strokeWidth={1.9}
              className={cn("transition-transform", open && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 grid gap-2 border-t border-gold/20 pt-3 md:grid-cols-2">
          {unassigned.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 rounded border border-border bg-white px-3 py-2"
            >
              <GuestAvatar guest={g} size={24} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] text-ink">
                  {g.firstName} {g.lastName}
                </div>
                <div className="font-mono text-[10px] text-ink-faint">
                  From {g.arrivingFrom}
                </div>
              </div>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) assign(g.id, e.target.value as HotelBlockId);
                }}
                className="rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink focus:border-gold focus:outline-none"
              >
                <option value="" disabled>
                  Assign hotel…
                </option>
                {HOTELS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HotelsSubView({
  guests,
  onSelectGuest,
}: {
  guests: Guest[];
  onSelectGuest: (id: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<HotelBlockId | null>(null);

  const outOfTown = useMemo(() => guests.filter((g) => g.outOfTown), [guests]);

  const byHotel = useMemo(() => {
    const m = new Map<string, Guest[]>();
    for (const h of HOTELS) m.set(h.id, []);
    for (const g of outOfTown) {
      if (g.hotelId) m.get(g.hotelId)?.push(g);
    }
    return m;
  }, [outOfTown]);

  return (
    <div>
      <div className="mb-5 flex items-baseline justify-between">
        <p className="text-[12.5px] text-ink-muted">
          {outOfTown.length} out-of-town guests across {HOTELS.length} hotel blocks.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink/20 hover:text-ink"
          >
            <Download size={12} strokeWidth={1.6} />
            Export all rooming lists
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:opacity-90"
          >
            <Plus size={12} strokeWidth={1.6} />
            Add hotel block
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {HOTELS.map((h) => {
          const occupants = byHotel.get(h.id) ?? [];
          const isExpanded = expandedId === h.id;
          const days = daysUntilCutoff(h.bookingCutoff);
          const cutoffUrgent = days !== null && days >= 0 && days <= 7;
          const pct = Math.min(100, Math.round((occupants.length / h.rooms) * 100));
          return (
            <article
              key={h.id}
              className={cn(
                "rounded-lg border bg-white transition-shadow",
                isExpanded ? "border-gold/40 shadow-sm" : "border-border hover:border-gold/25",
              )}
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : h.id)}
                className="w-full px-5 py-3.5 text-left"
                aria-expanded={isExpanded}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-serif text-[16px] text-ink">{h.name}</h3>
                  <span className="font-mono text-[11px] text-ink-muted tabular-nums">
                    {occupants.length}/{h.rooms}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded bg-ivory-deep">
                  <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-ink">{h.rate}</span>
                  <span
                    className={cn(
                      "font-mono uppercase tracking-[0.08em]",
                      cutoffUrgent ? "text-saffron" : "text-ink-faint",
                    )}
                  >
                    {cutoffUrgent && (
                      <AlertCircle size={10} strokeWidth={1.9} className="mr-1 inline" />
                    )}
                    cut-off {h.bookingCutoff}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-ink-faint">{h.distance}</span>
                  <span className="flex items-center gap-0.5 text-[10.5px] text-ink-muted">
                    {isExpanded ? "Hide roster" : "View roster"}
                    <ChevronDown
                      size={11}
                      strokeWidth={1.8}
                      className={cn("transition-transform", isExpanded && "rotate-180")}
                    />
                  </span>
                </div>
              </button>

              {isExpanded && (
                <HotelDetailPanel
                  hotel={h}
                  occupants={occupants}
                  onSelectGuest={onSelectGuest}
                />
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function HotelDetailPanel({
  hotel,
  occupants,
  onSelectGuest,
}: {
  hotel: HotelBlock;
  occupants: Guest[];
  onSelectGuest: (id: string) => void;
}) {
  return (
    <div className="border-t border-gold/20 bg-ivory-warm/30">
      <div className="flex items-center justify-between px-5 py-2.5 text-[11px] text-ink-muted">
        <span className="font-mono uppercase tracking-[0.1em]">
          {occupants.length} guest{occupants.length === 1 ? "" : "s"} · {hotel.distance}
        </span>
        <button
          type="button"
          className="flex items-center gap-1 rounded border border-border bg-white px-2 py-1 text-[11px] hover:border-ink/20 hover:text-ink"
        >
          <Download size={11} strokeWidth={1.7} />
          Export rooming list
        </button>
      </div>

      {occupants.length === 0 ? (
        <div className="px-5 py-8 text-center text-[12px] text-ink-faint">
          No guests assigned to this block yet.
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-5 py-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint">
            <span>Guest</span>
            <span>Room</span>
            <span className="text-center">Pickup</span>
          </div>
          {occupants.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelectGuest(g.id)}
              className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-x-4 border-t border-border/40 px-5 py-2 text-left hover:bg-white"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <GuestAvatar guest={g} size={24} />
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] text-ink">
                    {g.firstName} {g.lastName}
                  </div>
                  <div className="font-mono text-[10px] text-ink-faint">
                    from {g.arrivingFrom}
                  </div>
                </div>
              </div>
              <div className="font-mono text-[10.5px] text-ink-muted">
                {g.roomType ?? "—"}
              </div>
              <div className="flex w-10 items-center justify-center">
                {g.needsPickup ? (
                  <Check size={13} strokeWidth={2} className="text-sage" />
                ) : (
                  <span className="text-[11px] text-ink-faint">—</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Flights sub-view — arrivals board + add-flight form
// ═══════════════════════════════════════════════════════════════════════════

const FLIGHT_STATUS_META: Record<
  FlightStatus,
  { label: string; className: string }
> = {
  scheduled: {
    label: "Scheduled",
    className: "border-sage/30 bg-sage-pale/50 text-sage",
  },
  on_time: {
    label: "On time",
    className: "border-sage/30 bg-sage-pale/50 text-sage",
  },
  delayed: {
    label: "Delayed",
    className: "border-gold/35 bg-gold-pale/60 text-saffron",
  },
  landed: {
    label: "Landed",
    className: "border-ink/15 bg-ivory-deep/60 text-ink",
  },
  departed: {
    label: "Departed",
    className: "border-ink/15 bg-ivory-deep/60 text-ink",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-rose/30 bg-rose-pale/40 text-rose",
  },
};

function formatFlightTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDayKey(iso: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function FlightsSubView({
  guests,
  arrivingCount,
  departingCount,
  needsPickupCount,
  onUpdateGuest,
  onSelectGuest,
}: {
  guests: Guest[];
  arrivingCount: number;
  departingCount: number;
  needsPickupCount: number;
  onUpdateGuest: (guestId: string, patch: Partial<Guest>, activityNote?: string) => void;
  onSelectGuest: (id: string) => void;
}) {
  const [direction, setDirection] = useState<"arrival" | "departure">("arrival");
  const [dayFilter, setDayFilter] = useState<string>("all"); // "all" | YYYY-MM-DD
  const [sortBy, setSortBy] = useState<"time" | "name" | "status">("time");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const rows = useMemo(() => {
    const flat: Array<{ guest: Guest; flight: GuestFlight }> = [];
    for (const g of guests) for (const f of g.flights ?? []) flat.push({ guest: g, flight: f });
    let filtered = flat.filter((r) => r.flight.direction === direction);
    if (dayFilter !== "all") {
      filtered = filtered.filter((r) => formatDayKey(r.flight.scheduledDatetime) === dayFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((r) => {
        const name = `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase();
        return (
          name.includes(q) ||
          r.flight.flightNumber.toLowerCase().includes(q) ||
          r.flight.airline.toLowerCase().includes(q) ||
          r.flight.origin.toLowerCase().includes(q) ||
          r.flight.destination.toLowerCase().includes(q)
        );
      });
    }
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return `${a.guest.lastName} ${a.guest.firstName}`.localeCompare(
          `${b.guest.lastName} ${b.guest.firstName}`,
        );
      }
      if (sortBy === "status") return a.flight.status.localeCompare(b.flight.status);
      // time
      const at = a.flight.scheduledDatetime || "";
      const bt = b.flight.scheduledDatetime || "";
      return at.localeCompare(bt);
    });
    return filtered;
  }, [guests, direction, dayFilter, sortBy, query]);

  const allDays = useMemo(() => {
    const set = new Set<string>();
    for (const g of guests) {
      for (const f of g.flights ?? []) {
        const key = formatDayKey(f.scheduledDatetime);
        if (key) set.add(key);
      }
    }
    return Array.from(set).sort();
  }, [guests]);

  async function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const payload = {
        flights: rows.map((r) => ({
          flightNumber: r.flight.flightNumber,
          date: formatDayKey(r.flight.scheduledDatetime),
          guestId: r.guest.id,
          flightId: r.flight.id,
        })),
      };
      const res = await fetch("/api/flights/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("refresh failed");
      const data: {
        updates: Array<{
          flightId: string;
          guestId: string;
          status: FlightStatus;
          delayMinutes?: number;
          gate?: string;
        }>;
      } = await res.json();
      // Apply updates per guest.
      const perGuest = new Map<string, typeof data.updates>();
      for (const u of data.updates) {
        const arr = perGuest.get(u.guestId) ?? [];
        arr.push(u);
        perGuest.set(u.guestId, arr);
      }
      for (const [guestId, updates] of perGuest) {
        const guest = guests.find((g) => g.id === guestId);
        if (!guest?.flights) continue;
        const nextFlights = guest.flights.map((f) => {
          const match = updates.find((u) => u.flightId === f.id);
          if (!match) return f;
          return {
            ...f,
            status: match.status,
            delayMinutes: match.delayMinutes,
            gate: match.gate ?? f.gate,
            lastCheckedAt: new Date().toISOString(),
          };
        });
        onUpdateGuest(guestId, { flights: nextFlights });
      }
      setLastRefreshedAt(new Date());
    } catch {
      // Swallow — user can retry. In production, surface a toast.
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div>
      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <FlightStat
          label="Arriving"
          value={arrivingCount}
          icon={PlaneLanding}
          tone="sage"
        />
        <FlightStat
          label="Departing"
          value={departingCount}
          icon={PlaneTakeoff}
          tone="gold"
        />
        <FlightStat label="Flights total" value={arrivingCount + departingCount} icon={Plane} />
        <FlightStat
          label="Need pickup"
          value={needsPickupCount}
          icon={Car}
          tone={needsPickupCount > 0 ? "rose" : "ink"}
        />
      </div>

      {/* Controls */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-border bg-white p-0.5">
          {(["arrival", "departure"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={cn(
                "rounded px-3 py-1 text-[12px] transition-colors",
                direction === d
                  ? "bg-ink text-ivory"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {d === "arrival" ? "Arriving" : "Departing"}
            </button>
          ))}
        </div>

        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          className="rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-gold focus:outline-none"
        >
          <option value="all">All dates</option>
          {allDays.map((d) => (
            <option key={d} value={d}>
              {new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-gold focus:outline-none"
        >
          <option value="time">Sort by time</option>
          <option value="name">Sort by name</option>
          <option value="status">Sort by status</option>
        </select>

        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={12}
            strokeWidth={2}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guest, flight, route…"
            className="w-full rounded-md border border-border bg-white py-1.5 pl-7 pr-2.5 text-[12px] focus:border-gold focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || rows.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-gold/40 hover:text-ink disabled:opacity-50"
          title="Fetch latest status from flight API"
        >
          <RefreshCw
            size={12}
            strokeWidth={1.8}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing…" : "Refresh status"}
        </button>

        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:opacity-90"
        >
          <Plus size={12} strokeWidth={1.8} />
          Add flight
        </button>
      </div>

      {lastRefreshedAt && (
        <div className="mb-3 font-mono text-[10.5px] text-ink-faint">
          Last refreshed: {formatRelativeTime(lastRefreshedAt)}
        </div>
      )}

      {showAdd && (
        <AddFlightForm
          guests={guests}
          defaultDirection={direction}
          onCancel={() => setShowAdd(false)}
          onSave={(guestId, flight) => {
            const guest = guests.find((g) => g.id === guestId);
            const next = [...(guest?.flights ?? []), flight];
            onUpdateGuest(guestId, { flights: next }, `Flight ${flight.flightNumber} added`);
            setShowAdd(false);
          }}
        />
      )}

      {/* Arrivals board */}
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {rows.length === 0 ? (
          <div className="px-6 py-10 text-center text-[12.5px] italic text-ink-faint">
            {direction === "arrival"
              ? "No arrivals match your filters. Add a flight to get started."
              : "No departures match your filters."}
          </div>
        ) : (
          <table className="min-w-full text-[12.5px]">
            <thead className="border-b border-border bg-ivory-warm/30">
              <tr className="text-left font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                <th className="px-4 py-2.5 font-normal">Guest</th>
                <th className="px-4 py-2.5 font-normal">Flight #</th>
                <th className="px-4 py-2.5 font-normal">Route</th>
                <th className="px-4 py-2.5 font-normal">Airline</th>
                <th className="px-4 py-2.5 font-normal">Scheduled</th>
                <th className="px-4 py-2.5 font-normal">Status</th>
                <th className="px-4 py-2.5 font-normal">Pickup</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ guest, flight }) => {
                const meta = FLIGHT_STATUS_META[flight.status];
                return (
                  <tr
                    key={flight.id}
                    className="cursor-pointer border-b border-border/40 last:border-b-0 hover:bg-ivory-warm/30"
                    onClick={() => onSelectGuest(guest.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GuestAvatar guest={guest} size={24} />
                        <span className="text-ink">
                          {guest.firstName} {guest.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11.5px] tabular-nums text-ink">
                      {flight.flightNumber}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      <span className="font-mono text-[11px]">{flight.origin || "—"}</span>
                      <ArrowRight
                        size={11}
                        strokeWidth={1.6}
                        className="mx-1.5 inline-block text-ink-faint"
                      />
                      <span className="font-mono text-[11px]">{flight.destination || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{flight.airline || "—"}</td>
                    <td className="px-4 py-3 font-mono text-[11px] tabular-nums text-ink">
                      {formatFlightTime(flight.scheduledDatetime)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px]",
                          meta.className,
                        )}
                      >
                        {meta.label}
                        {flight.status === "delayed" && flight.delayMinutes
                          ? ` · +${flight.delayMinutes}m`
                          : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {flight.direction === "arrival" ? (
                        guest.ground?.pickupAssigned ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-sage">
                            <Check size={10} strokeWidth={2} />
                            {guest.ground.driverName ?? "Assigned"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-saffron">
                            <AlertCircle size={10} strokeWidth={1.8} />
                            Needs pickup
                          </span>
                        )
                      ) : (
                        <span className="font-mono text-[10.5px] text-ink-faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function FlightStat({
  label,
  value,
  icon: Icon,
  tone = "ink",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone?: "ink" | "sage" | "rose" | "gold";
}) {
  const toneClass = {
    ink: "text-ink",
    sage: "text-sage",
    rose: "text-rose",
    gold: "text-saffron",
  }[tone];
  return (
    <div className="rounded-md border border-border bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </div>
        <Icon size={13} strokeWidth={1.8} className={toneClass} />
      </div>
      <div className={cn("mt-1.5 font-serif text-[26px]", toneClass)}>{value}</div>
    </div>
  );
}

function formatRelativeTime(d: Date): string {
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 45) return "just now";
  if (diffSec < 90) return "1 min ago";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 7200) return "1 hr ago";
  return `${Math.floor(diffSec / 3600)} hr ago`;
}

function AddFlightForm({
  guests,
  defaultDirection,
  onCancel,
  onSave,
}: {
  guests: Guest[];
  defaultDirection: "arrival" | "departure";
  onCancel: () => void;
  onSave: (guestId: string, flight: GuestFlight) => void;
}) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [guestId, setGuestId] = useState(guests[0]?.id ?? "");
  const [direction, setDirection] = useState<FlightDirection>(defaultDirection);
  const [flightNumber, setFlightNumber] = useState("");
  const [airline, setAirline] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState(
    defaultDirection === "arrival" ? "BOM" : "",
  );
  const [date, setDate] = useState("2026-06-07");
  const [time, setTime] = useState("14:00");
  const [terminal, setTerminal] = useState("");
  const [notes, setNotes] = useState("");
  const [bulkText, setBulkText] = useState("");

  const detected = useMemo(() => detectAirline(flightNumber), [flightNumber]);
  const effectiveAirline = airline || detected;

  function handleSingleSave() {
    if (!guestId || !flightNumber.trim() || !date) return;
    const flight: GuestFlight = {
      id: randomId("fl"),
      flightNumber: flightNumber.trim().toUpperCase(),
      direction,
      airline: effectiveAirline,
      origin: origin.trim(),
      destination: destination.trim(),
      scheduledDatetime: `${date}T${time.length === 5 ? time : "12:00"}:00+05:30`,
      terminal: terminal.trim() || undefined,
      status: "scheduled",
      notes: notes.trim(),
    };
    onSave(guestId, flight);
  }

  function handleBulkSave() {
    // Paste format: one row per line, columns separated by tabs or commas.
    // Columns: guest name, flight number, date (YYYY-MM-DD or Jun 7)
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      const parts = line.split(/\t|,\s*/).map((p) => p.trim());
      if (parts.length < 3) continue;
      const [name, fn, rawDate] = parts;
      const match = guests.find((g) =>
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(name.toLowerCase()),
      );
      if (!match) continue;
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
        ? rawDate
        : FLIGHT_ARRIVAL_DATES_2026[rawDate];
      if (!iso) continue;
      const flight: GuestFlight = {
        id: randomId("fl"),
        flightNumber: fn.toUpperCase(),
        direction,
        airline: detectAirline(fn),
        origin: "",
        destination: direction === "arrival" ? "BOM" : "",
        scheduledDatetime: `${iso}T12:00:00+05:30`,
        status: "scheduled",
      };
      onSave(match.id, flight);
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-gold/25 bg-gold-pale/10 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-[15px] text-ink">Add flight</h3>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            Record an arrival or departure for a guest. Airline is auto-detected from the flight number.
          </p>
        </div>
        <div className="inline-flex rounded-md border border-border bg-white p-0.5">
          {(["single", "bulk"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded px-3 py-1 text-[11.5px] transition-colors",
                mode === m ? "bg-ink text-ivory" : "text-ink-muted hover:text-ink",
              )}
            >
              {m === "single" ? "Single" : "Bulk paste"}
            </button>
          ))}
        </div>
      </div>

      {mode === "single" ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Guest">
              <select
                value={guestId}
                onChange={(e) => setGuestId(e.target.value)}
                className="w-full rounded border border-border bg-white px-2 py-1.5 text-[12px] focus:border-gold focus:outline-none"
              >
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.firstName} {g.lastName}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Direction">
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as FlightDirection)}
                className="w-full rounded border border-border bg-white px-2 py-1.5 text-[12px] focus:border-gold focus:outline-none"
              >
                <option value="arrival">Arriving</option>
                <option value="departure">Departing</option>
              </select>
            </FormField>
            <FormField label="Flight #">
              <input
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="e.g. AI 101"
                className="w-full rounded border border-border bg-white px-2 py-1.5 font-mono text-[12px] focus:border-gold focus:outline-none"
              />
              {detected && !airline && (
                <span className="mt-1 block font-mono text-[10px] text-ink-faint">
                  Detected: {detected}
                </span>
              )}
            </FormField>
            <FormField label="Airline">
              <input
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                placeholder={detected || "Override name"}
                className="w-full rounded border border-border bg-white px-2 py-1.5 text-[12px] focus:border-gold focus:outline-none"
              />
            </FormField>
            <FormField label="Origin">
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. LHR or London"
                className="w-full rounded border border-border bg-white px-2 py-1.5 text-[12px] focus:border-gold focus:outline-none"
              />
            </FormField>
            <FormField label="Destination">
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. BOM"
                className="w-full rounded border border-border bg-white px-2 py-1.5 text-[12px] focus:border-gold focus:outline-none"
              />
            </FormField>
            <FormField label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded border border-border bg-white px-2 py-1.5 font-mono text-[12px] focus:border-gold focus:outline-none"
              />
            </FormField>
            <FormField label="Time">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded border border-border bg-white px-2 py-1.5 font-mono text-[12px] focus:border-gold focus:outline-none"
              />
            </FormField>
            <FormField label="Terminal">
              <input
                value={terminal}
                onChange={(e) => setTerminal(e.target.value)}
                placeholder="e.g. T2"
                className="w-full rounded border border-border bg-white px-2 py-1.5 text-[12px] focus:border-gold focus:outline-none"
              />
            </FormField>
            <FormField label="Notes">
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
                className="w-full rounded border border-border bg-white px-2 py-1.5 text-[12px] focus:border-gold focus:outline-none"
              />
            </FormField>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSingleSave}
              disabled={!guestId || !flightNumber.trim() || !date}
              className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:opacity-90 disabled:opacity-50"
            >
              <Plus size={12} strokeWidth={1.8} /> Save flight
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-2 text-[11.5px] text-ink-muted">
            Paste one row per flight — columns separated by tab or comma:{" "}
            <span className="font-mono text-[10.5px]">guest name, flight #, date</span>.
            Date can be YYYY-MM-DD or Jun 7 style.
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            placeholder="Priya Mehta, AI 101, 2026-06-07&#10;Daniel Chen, UA 867, Jun 7"
            className="w-full rounded border border-border bg-white px-3 py-2 font-mono text-[11.5px] focus:border-gold focus:outline-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <FormField label="Direction">
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as FlightDirection)}
                className="rounded border border-border bg-white px-2 py-1.5 text-[12px] focus:border-gold focus:outline-none"
              >
                <option value="arrival">Arriving</option>
                <option value="departure">Departing</option>
              </select>
            </FormField>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkSave}
                disabled={!bulkText.trim()}
                className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:opacity-90 disabled:opacity-50"
              >
                <Plus size={12} strokeWidth={1.8} /> Import flights
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      {children}
    </label>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Pickups sub-view — arrival windows + driver assignment
// ═══════════════════════════════════════════════════════════════════════════

interface PickupGroup {
  key: string;
  label: string;
  airport: string;
  windowStart: string;
  windowEnd: string;
  guests: Array<{ guest: Guest; flight: GuestFlight }>;
  suggested: boolean; // true when >= 2 guests at same airport within 1 hr
}

function buildPickupGroups(guests: Guest[]): PickupGroup[] {
  const arrivals: Array<{ guest: Guest; flight: GuestFlight }> = [];
  for (const g of guests) {
    for (const f of g.flights ?? []) {
      if (f.direction === "arrival" && f.scheduledDatetime) {
        arrivals.push({ guest: g, flight: f });
      }
    }
  }
  arrivals.sort((a, b) => a.flight.scheduledDatetime.localeCompare(b.flight.scheduledDatetime));

  const groups: PickupGroup[] = [];
  for (const row of arrivals) {
    const airport = extractAirportCode(row.flight.destination);
    const t = new Date(row.flight.scheduledDatetime).getTime();
    const existing = groups.find(
      (g) =>
        g.airport === airport &&
        Math.abs(new Date(g.windowStart).getTime() - t) <= 60 * 60 * 1000,
    );
    if (existing) {
      existing.guests.push(row);
      const startT = Math.min(new Date(existing.windowStart).getTime(), t);
      const endT = Math.max(new Date(existing.windowEnd).getTime(), t);
      existing.windowStart = new Date(startT).toISOString();
      existing.windowEnd = new Date(endT).toISOString();
    } else {
      groups.push({
        key: randomId("grp"),
        label: "",
        airport,
        windowStart: row.flight.scheduledDatetime,
        windowEnd: row.flight.scheduledDatetime,
        guests: [row],
        suggested: false,
      });
    }
  }

  for (const g of groups) {
    g.suggested = g.guests.length >= 2;
    g.label = buildPickupWindowLabel(g.windowStart, g.windowEnd);
  }
  return groups;
}

function extractAirportCode(input: string): string {
  if (!input) return "—";
  const match = input.toUpperCase().match(/\b([A-Z]{3})\b/);
  return match ? match[1] : input.slice(0, 3).toUpperCase();
}

function buildPickupWindowLabel(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const date = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const startT = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (start.getTime() === end.getTime()) return `${date}, ${startT}`;
  const endT = end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date}, ${startT} – ${endT}`;
}

function PickupsSubView({
  guests,
  onUpdateGuest,
  onSelectGuest,
}: {
  guests: Guest[];
  onUpdateGuest: (guestId: string, patch: Partial<Guest>, activityNote?: string) => void;
  onSelectGuest: (id: string) => void;
}) {
  const groups = useMemo(() => buildPickupGroups(guests), [guests]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  function handleExport() {
    const lines: string[] = ["Date,Window,Airport,Guest,Flight,Driver,Vehicle,Phone"];
    for (const g of groups) {
      for (const { guest, flight } of g.guests) {
        lines.push(
          [
            g.label,
            `${g.airport}`,
            `${guest.firstName} ${guest.lastName}`,
            flight.flightNumber,
            guest.ground?.driverName ?? "",
            guest.ground?.vehicleInfo ?? "",
            guest.ground?.driverPhone ?? "",
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(","),
        );
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pickup-schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-[12.5px] text-ink-muted">
          {groups.length} arrival window{groups.length === 1 ? "" : "s"}.
          Guests arriving within an hour of each other at the same airport are
          suggested for a shared pickup.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={groups.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-gold/40 hover:text-ink disabled:opacity-50"
        >
          <Download size={12} strokeWidth={1.6} />
          Export pickup schedule
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-5 py-10 text-center text-[12.5px] italic text-ink-muted">
          No arrivals tracked yet. Add flights from the Flights tab to see pickup groups.
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const pickupCount = group.guests.filter(
              (r) => r.guest.ground?.pickupAssigned,
            ).length;
            const headcount = group.guests.length;
            return (
              <article
                key={group.key}
                className="rounded-lg border border-border bg-white"
              >
                <header className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-pale/60 text-saffron">
                      <PlaneLanding size={14} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-[15.5px] text-ink">
                          {group.label}
                        </h3>
                        <span className="rounded border border-border bg-ivory-warm/40 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
                          {group.airport}
                        </span>
                        {group.suggested && (
                          <span className="rounded border border-sage/30 bg-sage-pale/40 px-1.5 py-0.5 font-mono text-[10px] text-sage">
                            Shared pickup suggested
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 font-mono text-[10.5px] text-ink-faint">
                        {headcount} guest{headcount === 1 ? "" : "s"} · {pickupCount}/
                        {headcount} pickup assigned
                      </p>
                    </div>
                  </div>
                </header>

                <ul className="divide-y divide-border/40">
                  {group.guests.map(({ guest, flight }) => {
                    const assigned = guest.ground?.pickupAssigned;
                    const expanded = expandedKey === `${group.key}:${guest.id}`;
                    return (
                      <li key={flight.id} className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onSelectGuest(guest.id)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <GuestAvatar guest={guest} size={28} />
                            <div className="min-w-0">
                              <div className="truncate text-[12.5px] text-ink">
                                {guest.firstName} {guest.lastName}
                              </div>
                              <div className="font-mono text-[10px] text-ink-faint">
                                {flight.flightNumber} · {formatFlightTime(flight.scheduledDatetime)}
                                {flight.origin ? ` · from ${flight.origin}` : ""}
                              </div>
                            </div>
                          </button>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px]",
                              assigned
                                ? "border-sage/30 bg-sage-pale/50 text-sage"
                                : "border-gold/30 bg-gold-pale/50 text-saffron",
                            )}
                          >
                            {assigned ? (
                              <>
                                <Check size={10} strokeWidth={2} />
                                {guest.ground?.driverName ?? "Driver assigned"}
                              </>
                            ) : (
                              <>
                                <AlertCircle size={10} strokeWidth={1.8} />
                                Needs pickup
                              </>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedKey(expanded ? null : `${group.key}:${guest.id}`)
                            }
                            className="rounded border border-border bg-white px-2 py-1 text-[11px] text-ink-muted hover:border-gold/40 hover:text-ink"
                          >
                            {expanded ? "Close" : assigned ? "Edit" : "Assign driver"}
                          </button>
                        </div>

                        {expanded && (
                          <DriverAssignForm
                            guest={guest}
                            defaultPickupLocation={`${group.airport} arrivals`}
                            defaultPickupTime={flight.scheduledDatetime}
                            onCancel={() => setExpandedKey(null)}
                            onSave={(ground) => {
                              onUpdateGuest(
                                guest.id,
                                { ground },
                                `Pickup assigned: ${ground.driverName ?? "driver"}`,
                              );
                              setExpandedKey(null);
                            }}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DriverAssignForm({
  guest,
  defaultPickupLocation,
  defaultPickupTime,
  onCancel,
  onSave,
}: {
  guest: Guest;
  defaultPickupLocation: string;
  defaultPickupTime: string;
  onCancel: () => void;
  onSave: (ground: GroundTransport) => void;
}) {
  const existing = guest.ground;
  const [driverName, setDriverName] = useState(existing?.driverName ?? "");
  const [driverPhone, setDriverPhone] = useState(existing?.driverPhone ?? "");
  const [vehicleInfo, setVehicleInfo] = useState(existing?.vehicleInfo ?? "");
  const [pickupLocation, setPickupLocation] = useState(
    existing?.pickupLocation ?? defaultPickupLocation,
  );
  const [pickupTime, setPickupTime] = useState(existing?.pickupTime ?? defaultPickupTime);

  return (
    <div className="mt-3 rounded-md border border-gold/20 bg-gold-pale/10 p-3">
      <div className="grid gap-3 md:grid-cols-3">
        <FormField label="Driver name">
          <input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="e.g. Venkat"
            className="w-full rounded border border-border bg-white px-2 py-1 text-[12px] focus:border-gold focus:outline-none"
          />
        </FormField>
        <FormField label="Phone">
          <input
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            placeholder="+91 98…"
            className="w-full rounded border border-border bg-white px-2 py-1 font-mono text-[12px] focus:border-gold focus:outline-none"
          />
        </FormField>
        <FormField label="Vehicle">
          <input
            value={vehicleInfo}
            onChange={(e) => setVehicleInfo(e.target.value)}
            placeholder="e.g. Innova Crysta MH 01 AB 1234"
            className="w-full rounded border border-border bg-white px-2 py-1 text-[12px] focus:border-gold focus:outline-none"
          />
        </FormField>
        <FormField label="Pickup location">
          <input
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            className="w-full rounded border border-border bg-white px-2 py-1 text-[12px] focus:border-gold focus:outline-none"
          />
        </FormField>
        <FormField label="Pickup time">
          <input
            type="datetime-local"
            value={pickupTime ? pickupTime.slice(0, 16) : ""}
            onChange={(e) =>
              setPickupTime(e.target.value ? `${e.target.value}:00+05:30` : "")
            }
            className="w-full rounded border border-border bg-white px-2 py-1 font-mono text-[12px] focus:border-gold focus:outline-none"
          />
        </FormField>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border bg-white px-3 py-1 text-[11.5px] text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() =>
            onSave({
              pickupAssigned: true,
              driverName: driverName.trim() || undefined,
              driverPhone: driverPhone.trim() || undefined,
              vehicleInfo: vehicleInfo.trim() || undefined,
              pickupLocation: pickupLocation.trim() || undefined,
              pickupTime: pickupTime || undefined,
            })
          }
          className="rounded-md bg-ink px-3 py-1 text-[11.5px] text-ivory hover:opacity-90"
        >
          Save pickup
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Seating view — scaffold with table layout preview
// ═══════════════════════════════════════════════════════════════════════════

function SeatingView({ guests }: { guests: Guest[] }) {
  const confirmed = guests.filter((g) =>
    Object.values(g.rsvp).some((s) => s === "confirmed"),
  ).length;

  // Strip the full Guest into the subset SeatingBuilder consumes. Keeps
  // the seating module decoupled from the guest page's heavier model.
  const seatingGuests = guests.map((g) => ({
    id: g.id,
    firstName: g.firstName,
    lastName: g.lastName,
    householdId: g.householdId,
    side: g.side,
    ageCategory: g.ageCategory,
    vipTier: g.vipTier,
    categories: g.categories ?? [],
    dietary: g.dietary ?? [],
    preferredLanguage: g.preferredLanguage,
    needsAssistance: g.needsAssistance,
    relationship: g.relationship,
    plusOneOf: g.plusOneOf,
    outOfTown: g.outOfTown,
    rsvp: g.rsvp as Record<string, string>,
  }));

  const seatingEvents = EVENTS.map((e) => ({
    id: e.id,
    label: e.label,
    date: e.date,
  }));

  return (
    <div>
      <SummaryStrip guests={guests} />
      <div className="px-8 py-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="font-serif text-[22px] text-ink">Floor Plan</h2>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              Design your venue layout — tables, stations, experiences, and flow. Drag
              elements onto the canvas, assign guests to tables, and plan the full event
              experience. {confirmed} confirmed guests so far.
            </p>
          </div>
        </div>

        <SeatingBuilder guests={seatingGuests} events={seatingEvents} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Gifts & Thank Yous
// ═══════════════════════════════════════════════════════════════════════════

function GiftsView({ guests }: { guests: Guest[] }) {
  const received = guests.filter((g) => g.giftReceived);
  const thanked = guests.filter((g) => g.thankYouSent);
  const pending = received.filter((g) => !g.thankYouSent);

  return (
    <div>
      <SummaryStrip guests={guests} />
      <div className="px-8 py-6">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h2 className="font-serif text-[22px] text-ink">Gifts & Thank Yous</h2>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              Track gifts received and thank-you note status.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <MetricCard label="Gifts received" value={received.length} tone="gold" />
          <MetricCard label="Thank-yous pending" value={pending.length} tone="rose" />
          <MetricCard label="Thank-yous sent" value={thanked.length} tone="sage" />
        </div>

        <div className="rounded-md border border-border bg-white">
          <div className="border-b border-border px-5 py-3">
            <h3 className="font-serif text-[15px] text-ink">Pending thank-you notes</h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {pending.length === 0 && (
              <div className="px-5 py-10 text-center text-[12px] italic text-ink-faint">
                No pending thank-you notes — you're all caught up.
              </div>
            )}
            {pending.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 border-b border-border/40 px-5 py-2.5 last:border-b-0"
              >
                <GuestAvatar guest={g} size={26} />
                <div className="flex-1">
                  <div className="text-[12.5px] text-ink">
                    {g.firstName} {g.lastName}
                  </div>
                  <div className="font-mono text-[10px] text-ink-faint">
                    {g.relationship}
                  </div>
                </div>
                <button className="flex items-center gap-1.5 rounded border border-border bg-white px-2 py-1 text-[11px] text-ink-muted hover:border-ink/20 hover:text-ink">
                  <Edit3 size={11} strokeWidth={1.6} />
                  Mark sent
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: "gold" | "sage" | "rose" }) {
  const tones = {
    gold: "border-gold/25 bg-gold-pale/30",
    sage: "border-sage/25 bg-sage-pale/40",
    rose: "border-rose/20 bg-rose-pale/30",
  };
  return (
    <div className={cn("rounded-md border px-5 py-4", tones[tone])}>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </div>
      <div className="mt-1 font-serif text-[28px] text-ink">{value}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Communications
// ═══════════════════════════════════════════════════════════════════════════

function CommunicationsView({ guests }: { guests: Guest[] }) {
  const invitationsSent = guests.filter((g) => g.invitationSent).length;

  const templates = [
    { id: "save-date", label: "Save-the-date", sent: guests.length, opened: Math.floor(guests.length * 0.82) },
    { id: "formal-invite", label: "Formal invitation", sent: invitationsSent, opened: Math.floor(invitationsSent * 0.74) },
    { id: "hotel-details", label: "Hotel & travel details", sent: 68, opened: 51 },
    { id: "dress-code", label: "Dress code reminder", sent: 0, opened: 0 },
    { id: "thank-you", label: "Post-wedding thank-you", sent: 0, opened: 0 },
  ];

  return (
    <div>
      <SummaryStrip guests={guests} />
      <div className="px-8 py-6">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h2 className="font-serif text-[22px] text-ink">Communications</h2>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              Invitation history, reminders, and broadcast announcements.
            </p>
          </div>
          <button className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:opacity-90">
            <Send size={12} strokeWidth={1.6} />
            New broadcast
          </button>
        </div>

        <div className="rounded-md border border-border bg-white">
          <div className="border-b border-border px-5 py-3 font-serif text-[15px] text-ink">
            Message templates
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border bg-ivory/50 text-left font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
                <th className="px-5 py-2.5 font-normal">Template</th>
                <th className="px-5 py-2.5 font-normal">Sent</th>
                <th className="px-5 py-2.5 font-normal">Opened</th>
                <th className="px-5 py-2.5 font-normal">Open rate</th>
                <th className="px-5 py-2.5 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => {
                const pct = t.sent > 0 ? Math.round((t.opened / t.sent) * 100) : 0;
                return (
                  <tr key={t.id} className="border-b border-border/40 last:border-b-0 hover:bg-ivory/30">
                    <td className="px-5 py-3 text-ink">{t.label}</td>
                    <td className="px-5 py-3 font-mono text-ink-muted tabular-nums">{t.sent}</td>
                    <td className="px-5 py-3 font-mono text-ink-muted tabular-nums">{t.opened}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ivory-deep">
                          <div className="h-full bg-sage" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono text-[10px] tabular-nums text-ink-muted">
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="text-[11.5px] text-saffron hover:underline">
                        Open →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-md border border-dashed border-gold/30 bg-gold-pale/10 px-5 py-4 text-[12.5px] text-ink-muted">
          <strong className="text-ink">Pro features:</strong> WhatsApp broadcast integration,
          delivery and open tracking per guest, automated RSVP nudges, and per-guest
          communication history timeline.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Imports & Tools
// ═══════════════════════════════════════════════════════════════════════════

function ImportsView({ guests }: { guests: Guest[] }) {
  return (
    <div>
      <SummaryStrip guests={guests} />
      <div className="px-8 py-6">
        <div className="mb-6">
          <h2 className="font-serif text-[22px] text-ink">Imports & Tools</h2>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Bulk import, deduplication, and export utilities.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ToolCard
            icon={Upload}
            title="Import from CSV"
            description="Upload a spreadsheet and map columns — salutation, first/last name, email, phone, address, side, relationship."
            action="Choose file"
          />
          <ToolCard
            icon={Users}
            title="Smart deduplication"
            description="Detect possible duplicates across the bride's and groom's lists by name, email, or phone similarity. Review and merge."
            action="Run scan"
            badge="AI"
          />
          <ToolCard
            icon={HomeIcon}
            title="Auto-group into households"
            description="Cluster guests by last name and address to suggest household groupings. Review and accept."
            action="Suggest households"
            badge="AI"
          />
          <ToolCard
            icon={MapPin}
            title="Parse addresses"
            description="Paste unstructured addresses and auto-parse into street, city, state, postal code, country."
            action="Open parser"
            badge="AI"
          />
          <ToolCard
            icon={Edit3}
            title="Invitation copy generator"
            description="Generate formal and casual addressing (envelope, inner card) per household. Export to label sheet."
            action="Generate"
            badge="AI"
          />
          <ToolCard
            icon={Download}
            title="Export everything"
            description="CSV, Excel, or PDF exports — rooming list, dietary rollup per vendor, seating chart, address labels."
            action="Open export"
          />
        </div>
      </div>
    </div>
  );
}

function ToolCard({
  icon: Icon,
  title,
  description,
  action,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  badge?: string;
}) {
  return (
    <article className="rounded-lg border border-border bg-white p-5 transition-colors hover:border-gold/30">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-pale/50 text-saffron">
          <Icon size={18} strokeWidth={1.6} />
        </div>
        {badge && (
          <span className="rounded-full border border-gold/30 bg-gold-pale/40 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-saffron">
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-serif text-[16px] text-ink">{title}</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">{description}</p>
      <button className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-saffron hover:underline">
        {action} <ArrowRight size={12} strokeWidth={1.8} />
      </button>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Categories — Manager & By-Category views
// ═══════════════════════════════════════════════════════════════════════════

function orderedCategories(list: GuestCategory[]): GuestCategory[] {
  return [...list].sort((a, b) => a.order - b.order);
}

function countGuestsInCategory(guests: Guest[], name: string): number {
  let n = 0;
  for (const g of guests) if (g.categories.includes(name)) n++;
  return n;
}

function CategoryPill({
  name,
  color,
  size = "sm",
}: {
  name: string;
  color?: GuestCategoryColor;
  size?: "xs" | "sm";
}) {
  const sw = swatchFor(color);
  const pad = size === "xs" ? "px-1.5 py-[1px] text-[10px]" : "px-2 py-0.5 text-[10.5px]";
  const dot = size === "xs" ? "h-1.5 w-1.5" : "h-2 w-2";
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full border", pad)}
      style={{
        backgroundColor: sw.pillBg,
        borderColor: sw.pillBorder,
        color: sw.pillText,
      }}
    >
      <span
        className={cn("shrink-0 rounded-full", dot)}
        style={{ backgroundColor: sw.dot }}
      />
      <span className="whitespace-nowrap">{name}</span>
    </span>
  );
}

// ── Category Manager view ──────────────────────────────────────────────────

function CategoryManagerView({
  guests,
  onSelectGuest,
  onRenameMigrate,
  onDeleteMigrate,
  onMergeMigrate,
  onSplitMigrate,
  onRestoreGuests,
  onUpdateGuest,
}: {
  guests: Guest[];
  onSelectGuest: (id: string) => void;
  onRenameMigrate: (oldName: string, newName: string) => void;
  onDeleteMigrate: (removedName: string) => void;
  onMergeMigrate: (absorbedNames: string[], survivingName: string) => void;
  onSplitMigrate: (
    oldName: string,
    assignments: Record<string, string>,
  ) => void;
  onRestoreGuests: (snapshot: Guest[]) => void;
  onUpdateGuest: (guestId: string, patch: Partial<Guest>, activityNote?: string) => void;
}) {
  const rawCategories = useGuestCategoriesStore((s) => s.categories);
  const categories = useMemo(
    () => orderedCategories(rawCategories),
    [rawCategories],
  );
  const addCategory = useGuestCategoriesStore((s) => s.addCategory);
  const updateCategory = useGuestCategoriesStore((s) => s.updateCategory);
  const deleteCategoryFromStore = useGuestCategoriesStore(
    (s) => s.deleteCategory,
  );
  const reorder = useGuestCategoriesStore((s) => s.reorderCategories);
  const mergeInStore = useGuestCategoriesStore((s) => s.mergeCategories);
  const splitInStore = useGuestCategoriesStore((s) => s.splitCategory);
  const restoreCategoriesInStore = useGuestCategoriesStore(
    (s) => s.restoreCategories,
  );

  const [mode, setMode] = useState<"cards" | "assign">("cards");
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [splittingId, setSplittingId] = useState<string | null>(null);

  // Undo infrastructure. A merge/split captures a full snapshot of both
  // `guests` (the array prop, owned by the parent page) and `categories`
  // (from the Zustand store) before mutating. Clicking Undo in the toast
  // restores both. The toast auto-dismisses after 10s via `timerRef`.
  const [undo, setUndo] = useState<{
    message: string;
    guestsSnapshot: Guest[];
    categoriesSnapshot: GuestCategory[];
  } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearUndo = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndo(null);
  }, []);

  const armUndo = useCallback(
    (message: string, guestsSnapshot: Guest[], categoriesSnapshot: GuestCategory[]) => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setUndo({ message, guestsSnapshot, categoriesSnapshot });
      undoTimerRef.current = setTimeout(() => {
        setUndo(null);
        undoTimerRef.current = null;
      }, 10000);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const handleUndo = useCallback(() => {
    if (!undo) return;
    restoreCategoriesInStore(undo.categoriesSnapshot);
    onRestoreGuests(undo.guestsSnapshot);
    clearUndo();
  }, [undo, restoreCategoriesInStore, onRestoreGuests, clearUndo]);

  const categorizedCount = useMemo(
    () => guests.filter((g) => g.categories.length > 0).length,
    [guests],
  );
  const hasAnyCategorized = categorizedCount > 0;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(categories, oldIndex, newIndex).map((c) => c.id);
    reorder(next);
  }

  function handleDelete(id: string) {
    const result = deleteCategoryFromStore(id);
    if (result) onDeleteMigrate(result.removedName);
    setConfirmDeleteId(null);
    if (expandedId === id) setExpandedId(null);
  }

  const confirmCat = confirmDeleteId
    ? categories.find((c) => c.id === confirmDeleteId)
    : null;
  const confirmCount = confirmCat
    ? countGuestsInCategory(guests, confirmCat.name)
    : 0;

  return (
    <div>
      <div className="mx-auto max-w-[1200px] px-8 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
              Guest list · tagging
            </p>
            <div className="flex items-baseline gap-3">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-ink">
                Circles
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                {categories.length} circles · {categorizedCount}/{guests.length} assigned
              </span>
            </div>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-muted">
              Group guests for seating, messaging, and logistics. Drag to reorder; click a card to see who's in it.
            </p>
            <div className="mt-5 h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center rounded-md border border-border bg-white p-0.5">
              <button
                type="button"
                onClick={() => setMode("cards")}
                className={cn(
                  "rounded px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                  mode === "cards"
                    ? "bg-ink text-ivory"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setMode("assign")}
                className={cn(
                  "rounded px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                  mode === "assign"
                    ? "bg-ink text-ivory"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                Assign
              </button>
            </div>
            <Link
              href="/guests/seating-chart"
              title={
                hasAnyCategorized
                  ? "Open the seating chart builder"
                  : "Assign guests to circles first for best results"
              }
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                hasAnyCategorized
                  ? "bg-gold text-ink hover:opacity-90"
                  : "border border-border bg-white text-ink-muted hover:text-ink",
              )}
            >
              <Armchair size={13} strokeWidth={1.7} />
              Build Seating Chart
              <ArrowRight size={13} strokeWidth={1.7} />
            </Link>
            {categories.length >= 2 && (
              <button
                onClick={() => setMergeOpen(true)}
                className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
                title="Merge two or more circles into one"
              >
                <Combine size={13} strokeWidth={1.7} />
                Merge Circles
              </button>
            )}
            <button
              onClick={() => setCreating((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                creating
                  ? "border border-border bg-white text-ink-muted hover:text-ink"
                  : "bg-ink text-ivory hover:opacity-90",
              )}
            >
              {creating ? (
                <>
                  <X size={13} strokeWidth={1.7} />
                  Cancel
                </>
              ) : (
                <>
                  <Plus size={13} strokeWidth={1.8} />
                  Create Circle
                </>
              )}
            </button>
          </div>
        </div>

        {creating && (
          <div className="mb-5">
            <CategoryCreateForm
              onCancel={() => setCreating(false)}
              onCreate={(name, color) => {
                const created = addCategory(name, color);
                if (created) setCreating(false);
              }}
            />
          </div>
        )}

        {mode === "assign" ? (
          <CategoryAssignPanel
            guests={guests}
            categories={categories}
            onSelectGuest={onSelectGuest}
            onUpdateGuest={onUpdateGuest}
          />
        ) : categories.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-white py-16 text-center text-[13px] text-ink-faint">
            No circles yet. Create one to start tagging guests.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => {
                  const cnt = countGuestsInCategory(guests, cat.name);
                  const expanded = expandedId === cat.id;
                  const editing = editingId === cat.id;
                  return (
                    <SortableCategoryCard
                      key={cat.id}
                      cat={cat}
                      count={cnt}
                      expanded={expanded}
                      editing={editing}
                      guests={guests}
                      onSelectGuest={onSelectGuest}
                      onToggleExpand={() =>
                        setExpandedId(expanded ? null : cat.id)
                      }
                      onStartEdit={() => setEditingId(cat.id)}
                      onCancelEdit={() => setEditingId(null)}
                      onSaveEdit={(patch) => {
                        const res = updateCategory(cat.id, patch);
                        if (res) onRenameMigrate(res.oldName, res.newName);
                        setEditingId(null);
                      }}
                      onRequestDelete={() => setConfirmDeleteId(cat.id)}
                      onRequestSplit={() => setSplittingId(cat.id)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {confirmCat && (
        <CategoryDeleteDialog
          name={confirmCat.name}
          count={confirmCount}
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmCat.id)}
        />
      )}

      {mergeOpen && (
        <CategoryMergeDialog
          categories={categories}
          guests={guests}
          onCancel={() => setMergeOpen(false)}
          onConfirm={({ sourceIds, targetName, targetColor }) => {
            const guestsSnapshot = guests.map((g) => ({
              ...g,
              categories: [...g.categories],
              activityLog: [...g.activityLog],
            }));
            const categoriesSnapshot = rawCategories.map((c) => ({ ...c }));
            const result = mergeInStore(sourceIds, targetName, targetColor);
            if (!result) return;
            onMergeMigrate(result.absorbedNames, result.survivingName);
            const mergedCount = guests.filter((g) =>
              g.categories.some(
                (c) =>
                  result.absorbedNames.includes(c) ||
                  c === result.survivingName,
              ),
            ).length;
            const absorbedLabel = result.absorbedNames
              .map((n) => `"${n}"`)
              .join(" and ");
            armUndo(
              `Merged ${absorbedLabel} into "${result.survivingName}" (${mergedCount} guest${mergedCount === 1 ? "" : "s"})`,
              guestsSnapshot,
              categoriesSnapshot,
            );
            setMergeOpen(false);
            if (expandedId && result.absorbedNames.length) {
              // Collapse if the expanded card was absorbed
              const stillExists = categories.some(
                (c) => c.id === expandedId && !sourceIds.includes(c.id),
              );
              if (!stillExists) setExpandedId(null);
            }
          }}
        />
      )}

      {splittingId &&
        (() => {
          const src = categories.find((c) => c.id === splittingId);
          if (!src) return null;
          const members = guests
            .filter((g) => g.categories.includes(src.name))
            .sort((a, b) =>
              (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
            );
          return (
            <CategorySplitDialog
              source={src}
              members={members}
              existingNames={categories
                .filter((c) => c.id !== src.id)
                .map((c) => c.name.toLowerCase())}
              onCancel={() => setSplittingId(null)}
              onConfirm={({ buckets, assignments }) => {
                const guestsSnapshot = guests.map((g) => ({
                  ...g,
                  categories: [...g.categories],
                  activityLog: [...g.activityLog],
                }));
                const categoriesSnapshot = rawCategories.map((c) => ({ ...c }));
                const result = splitInStore(src.id, buckets);
                if (!result) return;
                // Map bucket-index assignments → guestId → new bucket name
                const nameByIndex = result.created.map((c) => c.name);
                const guestToName: Record<string, string> = {};
                for (const [gid, bucketIdx] of Object.entries(assignments)) {
                  const nm = nameByIndex[bucketIdx];
                  if (nm) guestToName[gid] = nm;
                }
                onSplitMigrate(result.removedName, guestToName);
                const counts = result.created.map((c) => {
                  const n = Object.values(guestToName).filter(
                    (nm) => nm === c.name,
                  ).length;
                  return `"${c.name}" (${n})`;
                });
                armUndo(
                  `Split "${result.removedName}" into ${counts.join(" and ")}`,
                  guestsSnapshot,
                  categoriesSnapshot,
                );
                setSplittingId(null);
                if (expandedId === src.id) setExpandedId(null);
              }}
            />
          );
        })()}

      {undo && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-full border border-ink/10 bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ivory shadow-[0_20px_50px_rgba(26,26,26,0.30)]"
        >
          <span className="normal-case tracking-normal">{undo.message}</span>
          <button
            type="button"
            onClick={handleUndo}
            className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[10.5px] font-semibold text-ink transition-opacity hover:opacity-90"
          >
            <Undo2 size={12} strokeWidth={2} />
            Undo
          </button>
          <button
            type="button"
            onClick={clearUndo}
            className="text-ivory/70 hover:text-ivory"
            aria-label="Dismiss"
          >
            <X size={12} strokeWidth={1.8} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Drag-and-drop "Assign" panel ──────────────────────────────────────────
// Split-panel view: all guests on the left as draggable chips, categories
// on the right as drop zones. A guest belongs to at most one category; dropping
// into a new category removes the old one. Multi-select is supported by
// ticking checkboxes and dragging any selected guest — the whole group moves.

function CategoryAssignPanel({
  guests,
  categories,
  onSelectGuest,
  onUpdateGuest,
}: {
  guests: Guest[];
  categories: GuestCategory[];
  onSelectGuest: (id: string) => void;
  onUpdateGuest: (
    guestId: string,
    patch: Partial<Guest>,
    activityNote?: string,
  ) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "uncategorized" | "categorized">(
    "all",
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [flashCategoryId, setFlashCategoryId] = useState<string | null>(null);

  const categoryByName = useMemo(() => {
    const m = new Map<string, GuestCategory>();
    categories.forEach((c) => m.set(c.name, c));
    return m;
  }, [categories]);

  const visibleGuests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests
      .filter((g) => {
        const hasCat = g.categories.length > 0;
        if (filter === "uncategorized" && hasCat) return false;
        if (filter === "categorized" && !hasCat) return false;
        if (!q) return true;
        const hay =
          `${g.firstName} ${g.lastName} ${g.categories.join(" ")}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) =>
        (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
      );
  }, [guests, query, filter]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 5 },
    }),
  );

  function toggleSelected(id: string, shift: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (shift && next.size > 0) {
        // Range-select on shift-click
        const ids = visibleGuests.map((g) => g.id);
        const lastId = Array.from(prev).pop();
        const from = lastId ? ids.indexOf(lastId) : -1;
        const to = ids.indexOf(id);
        if (from !== -1 && to !== -1) {
          const [a, b] = from < to ? [from, to] : [to, from];
          for (let i = a; i <= b; i++) next.add(ids[i]);
          return next;
        }
      }
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function assignGuestsToCategory(guestIds: string[], cat: GuestCategory) {
    guestIds.forEach((gid) => {
      const g = guests.find((x) => x.id === gid);
      if (!g) return;
      if (g.categories.length === 1 && g.categories[0] === cat.name) return;
      const previous = g.categories[0];
      const note = previous
        ? `Circle changed: ${previous} → ${cat.name}`
        : `Circle assigned: ${cat.name}`;
      onUpdateGuest(gid, { categories: [cat.name] }, note);
    });
    setFlashCategoryId(cat.id);
    setTimeout(() => setFlashCategoryId(null), 900);
  }

  function unassignGuest(guestId: string) {
    const g = guests.find((x) => x.id === guestId);
    if (!g || g.categories.length === 0) return;
    const previous = g.categories[0];
    onUpdateGuest(
      guestId,
      { categories: [] },
      `Circle removed: ${previous}`,
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setActiveDragId(id);
    // If the dragged guest isn't in the selection, switch selection to just them
    if (!selectedIds.has(id)) {
      setSelectedIds(new Set([id]));
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith("cat:")) return;
    const catId = overId.slice(4);
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    const draggedId = String(active.id);
    const group = selectedIds.has(draggedId)
      ? Array.from(selectedIds)
      : [draggedId];
    assignGuestsToCategory(group, cat);
    setSelectedIds(new Set());
  }

  const activeGuest = activeDragId
    ? guests.find((g) => g.id === activeDragId)
    : null;
  const dragGroupSize =
    activeDragId && selectedIds.has(activeDragId) ? selectedIds.size : 1;

  if (categories.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white py-16 text-center text-[13px] text-ink-faint">
        Create at least one circle before assigning guests.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="rounded-md border border-border bg-white">
          <div className="border-b border-border px-3 py-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Guests · {visibleGuests.length}
              </div>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-[11px] text-ink-muted hover:text-ink"
                >
                  Clear ({selectedIds.size})
                </button>
              )}
            </div>
            <div className="relative mb-2">
              <Search
                size={12}
                strokeWidth={1.6}
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guests..."
                className="w-full rounded-md border border-border bg-white py-1.5 pl-7 pr-2 text-[12.5px] text-ink focus:border-gold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1 text-[10.5px]">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "uncategorized", label: "Unassigned" },
                  { id: "categorized", label: "Assigned" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "rounded-full px-2 py-0.5 transition-colors",
                    filter === f.id
                      ? "bg-ink text-ivory"
                      : "text-ink-muted hover:bg-ivory-warm",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <ul className="max-h-[560px] overflow-y-auto py-1">
            {visibleGuests.length === 0 ? (
              <li className="px-3 py-6 text-center text-[12px] italic text-ink-faint">
                No guests match the current filter.
              </li>
            ) : (
              visibleGuests.map((g) => (
                <DraggableGuestRow
                  key={g.id}
                  guest={g}
                  selected={selectedIds.has(g.id)}
                  categorySwatch={
                    g.categories[0]
                      ? categoryByName.get(g.categories[0])?.color
                      : undefined
                  }
                  onToggleSelect={(shift) => toggleSelected(g.id, shift)}
                  onOpen={() => onSelectGuest(g.id)}
                  onClearCategory={() => unassignGuest(g.id)}
                />
              ))
            )}
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat) => (
            <CategoryDropZone
              key={cat.id}
              cat={cat}
              guests={guests}
              flash={flashCategoryId === cat.id}
              onSelectGuest={onSelectGuest}
              onUnassign={unassignGuest}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeGuest ? (
          <div className="pointer-events-none rounded-md border border-gold/50 bg-white px-2.5 py-1.5 text-[12.5px] text-ink shadow-[0_10px_24px_rgba(26,26,26,0.18)]">
            {activeGuest.firstName} {activeGuest.lastName}
            {dragGroupSize > 1 && (
              <span className="ml-1.5 rounded-full bg-gold/20 px-1.5 py-0.5 font-mono text-[9.5px] text-ink-muted">
                +{dragGroupSize - 1}
              </span>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DraggableGuestRow({
  guest,
  selected,
  categorySwatch,
  onToggleSelect,
  onOpen,
  onClearCategory,
}: {
  guest: Guest;
  selected: boolean;
  categorySwatch?: GuestCategoryColor;
  onToggleSelect: (shift: boolean) => void;
  onOpen: () => void;
  onClearCategory: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: guest.id,
  });
  const currentCategory = guest.categories[0];
  const dim = Boolean(currentCategory);

  return (
    <li
      ref={setNodeRef}
      className={cn(
        "group/row flex items-center gap-2 px-2 py-1.5 transition-colors",
        selected ? "bg-gold-pale/30" : "hover:bg-ivory-warm/40",
        isDragging && "opacity-30",
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) =>
          onToggleSelect((e.nativeEvent as MouseEvent).shiftKey ?? false)
        }
        onClick={(e) => e.stopPropagation()}
        className="h-3.5 w-3.5 cursor-pointer accent-gold"
        aria-label={`Select ${guest.firstName} ${guest.lastName}`}
      />
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={cn(
          "flex min-w-0 flex-1 cursor-grab items-center gap-2 rounded px-1.5 py-0.5 text-left active:cursor-grabbing",
          dim && "text-ink-muted",
        )}
      >
        <GripVertical
          size={11}
          strokeWidth={1.6}
          className="shrink-0 text-ink-faint opacity-0 group-hover/row:opacity-100"
        />
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            SIDE_DOT[guest.side],
          )}
          title={SIDE_LABEL[guest.side]}
        />
        <span className="min-w-0 flex-1 truncate text-[12.5px]">
          {guest.firstName} {guest.lastName}
        </span>
        {currentCategory ? (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-[1px] text-[9.5px]"
            style={{
              backgroundColor: swatchFor(categorySwatch).pillBg,
              borderColor: swatchFor(categorySwatch).pillBorder,
              color: swatchFor(categorySwatch).pillText,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: swatchFor(categorySwatch).dot }}
            />
            <span className="max-w-[90px] truncate">{currentCategory}</span>
          </span>
        ) : (
          <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-wider text-ink-faint">
            Unassigned
          </span>
        )}
      </button>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100">
        {currentCategory && (
          <button
            type="button"
            onClick={onClearCategory}
            title="Remove from circle"
            className="rounded p-1 text-ink-faint hover:bg-rose-pale/40 hover:text-rose"
          >
            <X size={11} strokeWidth={1.7} />
          </button>
        )}
        <button
          type="button"
          onClick={onOpen}
          title="Open guest"
          className="rounded p-1 text-ink-faint hover:bg-ivory-warm/60 hover:text-ink"
        >
          <ChevronRight size={11} strokeWidth={1.7} />
        </button>
      </div>
    </li>
  );
}

function CategoryDropZone({
  cat,
  guests,
  flash,
  onSelectGuest,
  onUnassign,
}: {
  cat: GuestCategory;
  guests: Guest[];
  flash: boolean;
  onSelectGuest: (id: string) => void;
  onUnassign: (guestId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `cat:${cat.id}` });
  const sw = swatchFor(cat.color);

  const members = useMemo(
    () =>
      guests
        .filter((g) => g.categories.includes(cat.name))
        .sort((a, b) =>
          (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
        ),
    [guests, cat.name],
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[140px] flex-col rounded-md border bg-white transition-all",
        isOver
          ? "border-gold ring-2 ring-gold/30"
          : flash
            ? "border-gold/60 ring-1 ring-gold/40"
            : "border-border",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: sw.dot }}
        />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
          {cat.name}
        </span>
        <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-muted">
          {members.length}
        </span>
      </div>
      {members.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-3 py-6 text-center text-[11.5px] italic text-ink-faint">
          Drop guests here
        </div>
      ) : (
        <ul className="max-h-48 divide-y divide-border/70 overflow-y-auto">
          {members.map((g) => (
            <li
              key={g.id}
              className="group/m flex items-center gap-2 px-3 py-1.5"
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  SIDE_DOT[g.side],
                )}
              />
              <button
                type="button"
                onClick={() => onSelectGuest(g.id)}
                className="min-w-0 flex-1 truncate text-left text-[12px] text-ink hover:text-saffron"
              >
                {g.firstName} {g.lastName}
              </button>
              <button
                type="button"
                onClick={() => onUnassign(g.id)}
                title="Remove from circle"
                className="rounded p-0.5 text-ink-faint opacity-0 transition-opacity hover:bg-rose-pale/40 hover:text-rose group-hover/m:opacity-100"
              >
                <X size={10} strokeWidth={1.7} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryCreateForm({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string, color: GuestCategoryColor) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<GuestCategoryColor>(
    GUEST_CATEGORY_COLORS[0].id,
  );
  const clean = name.trim();

  return (
    <div className="rounded-md border border-gold/25 bg-gold-pale/15 p-4">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
        New circle
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && clean) onCreate(clean, color);
              if (e.key === "Escape") onCancel();
            }}
            placeholder="e.g. Neighbours"
            className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[13px] text-ink focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Color
          </label>
          <ColorPalette value={color} onChange={setColor} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="text-[12px] text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
        <button
          disabled={!clean}
          onClick={() => clean && onCreate(clean, color)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[12px] font-medium",
            clean
              ? "bg-ink text-ivory hover:opacity-90"
              : "bg-ivory-deep text-ink-faint",
          )}
        >
          Create
        </button>
      </div>
    </div>
  );
}

function ColorPalette({
  value,
  onChange,
}: {
  value: GuestCategoryColor;
  onChange: (c: GuestCategoryColor) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {GUEST_CATEGORY_COLORS.map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            title={c.label}
            aria-label={c.label}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
              active
                ? "scale-110 border-ink shadow-[0_0_0_2px_rgba(184,134,11,0.25)]"
                : "border-border hover:scale-105",
            )}
            style={{ backgroundColor: c.dot }}
          >
            {active && <Check size={11} strokeWidth={2.4} className="text-white" />}
          </button>
        );
      })}
    </div>
  );
}

function SortableCategoryCard({
  cat,
  count,
  expanded,
  editing,
  guests,
  onSelectGuest,
  onToggleExpand,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRequestDelete,
  onRequestSplit,
}: {
  cat: GuestCategory;
  count: number;
  expanded: boolean;
  editing: boolean;
  guests: Guest[];
  onSelectGuest: (id: string) => void;
  onToggleExpand: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (patch: { name?: string; color?: GuestCategoryColor }) => void;
  onRequestDelete: () => void;
  onRequestSplit: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  const sw = swatchFor(cat.color);

  const [draftName, setDraftName] = useState(cat.name);
  const [draftColor, setDraftColor] = useState<GuestCategoryColor>(cat.color);
  useEffect(() => {
    if (editing) {
      setDraftName(cat.name);
      setDraftColor(cat.color);
    }
  }, [editing, cat.name, cat.color]);

  const matched = useMemo(
    () =>
      expanded
        ? guests
            .filter((g) => g.categories.includes(cat.name))
            .sort((a, b) =>
              (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
            )
        : [],
    [expanded, guests, cat.name],
  );

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/card relative rounded-md border bg-white transition-shadow",
        isDragging
          ? "border-gold/40 shadow-[0_16px_36px_rgba(26,26,26,0.16)]"
          : "border-border hover:border-gold/30",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          type="button"
          aria-label={`Reorder ${cat.name}`}
          className={cn(
            "shrink-0 cursor-grab touch-none rounded p-0.5 text-[#C5C0B8] transition-opacity hover:text-ink-muted active:cursor-grabbing",
            isDragging
              ? "opacity-100"
              : "opacity-0 group-hover/card:opacity-100 [@media(hover:none)]:opacity-60",
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} strokeWidth={1.6} />
        </button>

        {editing ? (
          <>
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: swatchFor(draftColor).dot }}
            />
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draftName.trim())
                  onSaveEdit({ name: draftName.trim(), color: draftColor });
                if (e.key === "Escape") onCancelEdit();
              }}
              className="min-w-0 flex-1 rounded border border-border bg-white px-1.5 py-1 text-[13px] text-ink focus:border-gold focus:outline-none"
            />
          </>
        ) : (
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: sw.dot }}
            />
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink">
              {cat.name}
            </span>
            <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-muted">
              {count}
            </span>
            <ChevronRight
              size={13}
              strokeWidth={1.7}
              className={cn(
                "shrink-0 text-ink-faint transition-transform",
                expanded && "rotate-90",
              )}
            />
          </button>
        )}

        {!editing && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/card:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={onStartEdit}
              className="rounded p-1 text-ink-faint hover:bg-ivory-warm/60 hover:text-ink"
              aria-label="Edit circle"
              title="Edit"
            >
              <Pencil size={12} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              onClick={onRequestSplit}
              disabled={count < 2}
              className={cn(
                "rounded p-1",
                count < 2
                  ? "cursor-not-allowed text-ink-faint/40"
                  : "text-ink-faint hover:bg-ivory-warm/60 hover:text-ink",
              )}
              aria-label="Split circle"
              title={
                count < 2
                  ? "Need at least 2 guests to split"
                  : "Split circle"
              }
            >
              <Scissors size={12} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              onClick={onRequestDelete}
              className="rounded p-1 text-ink-faint hover:bg-rose-pale/40 hover:text-rose"
              aria-label="Delete circle"
              title="Delete"
            >
              <Trash2 size={12} strokeWidth={1.7} />
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="border-t border-border px-3 py-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Color
          </div>
          <ColorPalette value={draftColor} onChange={setDraftColor} />
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-[12px] text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!draftName.trim()}
              onClick={() =>
                draftName.trim() &&
                onSaveEdit({ name: draftName.trim(), color: draftColor })
              }
              className={cn(
                "rounded-md px-2.5 py-1 text-[12px] font-medium",
                draftName.trim()
                  ? "bg-ink text-ivory hover:opacity-90"
                  : "bg-ivory-deep text-ink-faint",
              )}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {expanded && !editing && (
        <div className="border-t border-border">
          {matched.length === 0 ? (
            <div className="px-4 py-4 text-[12px] italic text-ink-faint">
              No guests yet. Tag guests from the All Guests list or Guest detail.
            </div>
          ) : (
            <ul className="max-h-64 divide-y divide-border/70 overflow-y-auto">
              {matched.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => onSelectGuest(g.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-ivory-warm/30"
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        SIDE_DOT[g.side],
                      )}
                      title={SIDE_LABEL[g.side]}
                    />
                    <span className="flex-1 truncate text-[12.5px] text-ink">
                      {g.firstName} {g.lastName}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-ink-faint">
                      {g.city || "—"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}

function CategoryDeleteDialog({
  name,
  count,
  onCancel,
  onConfirm,
}: {
  name: string;
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-5 shadow-[0_20px_60px_rgba(26,26,26,0.18)]">
        <h3 className="font-serif text-[18px] text-ink">Delete circle?</h3>
        <p className="mt-2 text-[13px] text-ink-muted">
          Delete <strong className="text-ink">{name}</strong>?
          {count > 0 ? (
            <>
              {" "}
              This will remove the tag from{" "}
              <strong className="text-ink">{count}</strong>{" "}
              {count === 1 ? "guest" : "guests"}. Guest records are not deleted.
            </>
          ) : (
            " No guests are in this circle."
          )}
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-[12.5px] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-rose px-3 py-1.5 text-[12.5px] font-medium text-ivory hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Merge Circles dialog ──────────────────────────────────────────────────
// Two-step modal. Step 1 is a checkbox list of all categories (user picks
// 2+ to merge). Step 2 lets the user choose the merged circle's name and
// color and shows a deduped preview of the combined guest list so they
// can confirm before committing.

function CategoryMergeDialog({
  categories,
  guests,
  onCancel,
  onConfirm,
}: {
  categories: GuestCategory[];
  guests: Guest[];
  onCancel: () => void;
  onConfirm: (args: {
    sourceIds: string[];
    targetName: string;
    targetColor: GuestCategoryColor;
  }) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<"pick" | "config">("pick");
  const [name, setName] = useState("");
  const [color, setColor] = useState<GuestCategoryColor>(
    GUEST_CATEGORY_COLORS[0].id,
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const selectedCats = useMemo(
    () => categories.filter((c) => selected.has(c.id)),
    [categories, selected],
  );

  const previewGuests = useMemo(() => {
    if (selectedCats.length === 0) return [] as Guest[];
    const names = new Set(selectedCats.map((c) => c.name));
    const seen = new Set<string>();
    const list: Guest[] = [];
    for (const g of guests) {
      if (seen.has(g.id)) continue;
      if (g.categories.some((c) => names.has(c))) {
        seen.add(g.id);
        list.push(g);
      }
    }
    list.sort((a, b) =>
      (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
    );
    return list;
  }, [selectedCats, guests]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function proceed() {
    if (selectedCats.length < 2) return;
    // Seed step-2 defaults from the first selected circle (preserves the
    // order the user clicked in since Sets keep insertion order).
    const first = selectedCats[0];
    setName(first.name);
    setColor(first.color);
    setStep("config");
  }

  const clean = name.trim();
  const otherCategoryNames = useMemo(
    () =>
      new Set(
        categories
          .filter((c) => !selected.has(c.id))
          .map((c) => c.name.toLowerCase()),
      ),
    [categories, selected],
  );
  const nameCollides = clean
    ? otherCategoryNames.has(clean.toLowerCase())
    : false;
  const canConfirm = clean.length > 0 && !nameCollides;

  function confirm() {
    if (!canConfirm) return;
    // Preserve the order the user clicked in: iterate categories in original
    // order and pick those that are in `selected`. This makes the first
    // clicked circle the "surviving" record.
    const orderedIds: string[] = [];
    for (const c of categories) {
      if (selected.has(c.id)) orderedIds.push(c.id);
    }
    onConfirm({
      sourceIds: orderedIds,
      targetName: clean,
      targetColor: color,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 px-4 backdrop-blur-[2px]">
      <div className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-lg border border-border bg-white shadow-[0_20px_60px_rgba(26,26,26,0.18)]">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              {step === "pick" ? "Step 1 of 2" : "Step 2 of 2"}
            </p>
            <h3 className="font-serif text-[18px] text-ink">
              {step === "pick" ? "Merge circles" : "Name the merged circle"}
            </h3>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              {step === "pick"
                ? "Pick 2 or more circles. Guests from each will move into one combined circle."
                : `Combining ${selectedCats.length} circles · ${previewGuests.length} guest${previewGuests.length === 1 ? "" : "s"} total.`}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 text-ink-faint hover:text-ink"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.7} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "pick" ? (
            <ul className="divide-y divide-border/70">
              {categories.map((c) => {
                const sw = swatchFor(c.color);
                const count = countGuestsInCategory(guests, c.name);
                const checked = selected.has(c.id);
                return (
                  <li key={c.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-1 py-2 transition-colors hover:bg-ivory-warm/30",
                        checked && "bg-gold-pale/20",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(c.id)}
                        className="h-3.5 w-3.5 accent-gold"
                      />
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: sw.dot }}
                      />
                      <span className="flex-1 text-[13px] text-ink">
                        {c.name}
                      </span>
                      <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
                        {count}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                  Merging
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCats.map((c) => (
                    <CategoryPill key={c.id} name={c.name} color={c.color} />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                  Merged name
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canConfirm) confirm();
                  }}
                  className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[13px] text-ink focus:border-gold focus:outline-none"
                />
                {nameCollides && (
                  <p className="mt-1 text-[11.5px] text-rose">
                    Another circle already uses this name.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                  Color
                </label>
                <ColorPalette value={color} onChange={setColor} />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                  Preview · {previewGuests.length} guest{previewGuests.length === 1 ? "" : "s"}
                </label>
                {previewGuests.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-[12px] italic text-ink-faint">
                    No guests in these circles yet. Empty circles will simply be removed.
                  </div>
                ) : (
                  <ul className="max-h-40 divide-y divide-border/70 overflow-y-auto rounded-md border border-border">
                    {previewGuests.map((g) => (
                      <li
                        key={g.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-ink"
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            SIDE_DOT[g.side],
                          )}
                        />
                        <span className="flex-1 truncate">
                          {g.firstName} {g.lastName}
                        </span>
                        <span className="font-mono text-[10px] text-ink-faint">
                          {g.city || "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <button
            onClick={step === "pick" ? onCancel : () => setStep("pick")}
            className="rounded-md px-3 py-1.5 text-[12.5px] text-ink-muted hover:text-ink"
          >
            {step === "pick" ? "Cancel" : "← Back"}
          </button>
          {step === "pick" ? (
            <button
              disabled={selectedCats.length < 2}
              onClick={proceed}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12.5px] font-medium",
                selectedCats.length >= 2
                  ? "bg-ink text-ivory hover:opacity-90"
                  : "bg-ivory-deep text-ink-faint",
              )}
            >
              Next · {selectedCats.length} selected
            </button>
          ) : (
            <button
              disabled={!canConfirm}
              onClick={confirm}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12.5px] font-medium",
                canConfirm
                  ? "bg-ink text-ivory hover:opacity-90"
                  : "bg-ivory-deep text-ink-faint",
              )}
            >
              Merge circles
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Split Circle dialog ───────────────────────────────────────────────────
// User defines 2+ destination buckets (name + color) and assigns each
// guest to exactly one. We use per-guest bucket buttons (radio-style)
// rather than drag-and-drop — it's faster for the common case of 2 buckets
// and keeps the dialog keyboard-friendly.

function CategorySplitDialog({
  source,
  members,
  existingNames,
  onCancel,
  onConfirm,
}: {
  source: GuestCategory;
  members: Guest[];
  existingNames: string[]; // lowercase names of OTHER categories
  onCancel: () => void;
  onConfirm: (args: {
    buckets: Array<{ name: string; color: GuestCategoryColor }>;
    assignments: Record<string, number>; // guestId → bucket index
  }) => void;
}) {
  // Pick 2 distinct default colors for the starter buckets, skipping the
  // source's color so the split reads as a visual change at a glance.
  const initialBuckets = useMemo(() => {
    const avail = GUEST_CATEGORY_COLORS.filter((c) => c.id !== source.color);
    const a = avail[0]?.id ?? GUEST_CATEGORY_COLORS[0].id;
    const b = avail[1]?.id ?? GUEST_CATEGORY_COLORS[1].id;
    return [
      { name: `${source.name} — A`, color: a as GuestCategoryColor },
      { name: `${source.name} — B`, color: b as GuestCategoryColor },
    ];
  }, [source.name, source.color]);

  const [buckets, setBuckets] =
    useState<Array<{ name: string; color: GuestCategoryColor }>>(initialBuckets);
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  function renameBucket(idx: number, name: string) {
    setBuckets((prev) => prev.map((b, i) => (i === idx ? { ...b, name } : b)));
  }
  function recolorBucket(idx: number, color: GuestCategoryColor) {
    setBuckets((prev) => prev.map((b, i) => (i === idx ? { ...b, color } : b)));
  }
  function addBucket() {
    const taken = new Set(buckets.map((b) => b.color));
    const nextColor =
      GUEST_CATEGORY_COLORS.find((c) => !taken.has(c.id))?.id ??
      GUEST_CATEGORY_COLORS[0].id;
    setBuckets((prev) => [
      ...prev,
      { name: "", color: nextColor as GuestCategoryColor },
    ]);
  }
  function removeBucket(idx: number) {
    if (buckets.length <= 1) return;
    setBuckets((prev) => prev.filter((_, i) => i !== idx));
    // Any guest assigned to the removed bucket becomes unassigned; any
    // guest assigned to a bucket past idx shifts down by one.
    setAssignments((prev) => {
      const next: Record<string, number> = {};
      for (const [gid, bIdx] of Object.entries(prev)) {
        if (bIdx === idx) continue;
        next[gid] = bIdx > idx ? bIdx - 1 : bIdx;
      }
      return next;
    });
  }
  function assign(gid: string, bIdx: number) {
    setAssignments((prev) => ({ ...prev, [gid]: bIdx }));
  }
  function assignAllRemainingTo(bIdx: number) {
    setAssignments((prev) => {
      const next = { ...prev };
      for (const g of members) {
        if (next[g.id] == null) next[g.id] = bIdx;
      }
      return next;
    });
  }

  const names = buckets.map((b) => b.name.trim());
  const emptyName = names.some((n) => !n);
  const duplicateName = (() => {
    const seen = new Set<string>();
    for (const n of names) {
      const k = n.toLowerCase();
      if (seen.has(k)) return true;
      seen.add(k);
    }
    return false;
  })();
  const externalCollision = names.some((n) =>
    existingNames.includes(n.toLowerCase()),
  );
  const unassignedCount = members.filter(
    (g) => assignments[g.id] == null,
  ).length;
  const canConfirm =
    buckets.length >= 1 &&
    !emptyName &&
    !duplicateName &&
    !externalCollision &&
    unassignedCount === 0;

  const counts = buckets.map(
    (_, idx) =>
      Object.values(assignments).filter((v) => v === idx).length,
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 px-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg border border-border bg-white shadow-[0_20px_60px_rgba(26,26,26,0.18)]">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Split circle
            </p>
            <h3 className="font-serif text-[18px] text-ink">
              Split &ldquo;{source.name}&rdquo;
            </h3>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              Choose destination circles for each of the {members.length} guests. Every guest must land in one bucket.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 text-ink-faint hover:text-ink"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.7} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                New circles
              </label>
              <button
                type="button"
                onClick={addBucket}
                className="flex items-center gap-1 text-[11.5px] text-ink-muted hover:text-ink"
              >
                <Plus size={11} strokeWidth={1.8} />
                Add another
              </button>
            </div>
            <div className="space-y-2">
              {buckets.map((b, idx) => {
                const sw = swatchFor(b.color);
                const isEditingColor = editingColorIdx === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-md border border-border bg-white"
                  >
                    <div className="flex items-center gap-2 px-2.5 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingColorIdx(isEditingColor ? null : idx)
                        }
                        className="h-4 w-4 shrink-0 rounded-full border border-border transition-transform hover:scale-110"
                        style={{ backgroundColor: sw.dot }}
                        aria-label="Change color"
                        title="Change color"
                      />
                      <input
                        value={b.name}
                        onChange={(e) => renameBucket(idx, e.target.value)}
                        placeholder={`Sub-circle ${idx + 1}`}
                        className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-1 text-[13px] text-ink focus:border-gold focus:bg-white focus:outline-none"
                      />
                      <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-muted">
                        {counts[idx]}
                      </span>
                      <button
                        type="button"
                        onClick={() => assignAllRemainingTo(idx)}
                        disabled={unassignedCount === 0}
                        className={cn(
                          "shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]",
                          unassignedCount === 0
                            ? "cursor-not-allowed text-ink-faint/40"
                            : "text-ink-muted hover:bg-ivory-warm/60 hover:text-ink",
                        )}
                        title="Assign all remaining guests to this circle"
                      >
                        Fill
                      </button>
                      {buckets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBucket(idx)}
                          className="shrink-0 rounded p-1 text-ink-faint hover:bg-rose-pale/40 hover:text-rose"
                          aria-label="Remove bucket"
                          title="Remove"
                        >
                          <X size={12} strokeWidth={1.7} />
                        </button>
                      )}
                    </div>
                    {isEditingColor && (
                      <div className="border-t border-border px-2.5 py-2">
                        <ColorPalette
                          value={b.color}
                          onChange={(c) => {
                            recolorBucket(idx, c);
                            setEditingColorIdx(null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {(emptyName || duplicateName || externalCollision) && (
              <p className="mt-2 text-[11.5px] text-rose">
                {emptyName
                  ? "Every new circle needs a name."
                  : duplicateName
                    ? "New circle names must be unique."
                    : "A name collides with an existing circle. Pick something different."}
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                Assign guests · {unassignedCount} left
              </label>
              {unassignedCount === 0 && (
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-teal">
                  <Check size={11} strokeWidth={2} /> Ready
                </span>
              )}
            </div>
            <ul className="divide-y divide-border/70 rounded-md border border-border">
              {members.map((g) => {
                const assigned = assignments[g.id];
                return (
                  <li
                    key={g.id}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-2",
                      assigned == null && "bg-rose-pale/20",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        SIDE_DOT[g.side],
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">
                      {g.firstName} {g.lastName}
                    </span>
                    <div className="flex shrink-0 flex-wrap items-center gap-1">
                      {buckets.map((b, idx) => {
                        const sw = swatchFor(b.color);
                        const active = assigned === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => assign(g.id, idx)}
                            className={cn(
                              "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-all",
                              active
                                ? "border-ink text-ink shadow-[0_0_0_2px_rgba(184,134,11,0.25)]"
                                : "border-border text-ink-muted hover:border-ink/30 hover:text-ink",
                            )}
                            style={
                              active
                                ? {
                                    backgroundColor: sw.pillBg,
                                    borderColor: sw.pillBorder,
                                    color: sw.pillText,
                                  }
                                : undefined
                            }
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: sw.dot }}
                            />
                            {b.name.trim() || `Sub-circle ${idx + 1}`}
                          </button>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <button
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-[12.5px] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            disabled={!canConfirm}
            onClick={() =>
              canConfirm && onConfirm({ buckets, assignments })
            }
            className={cn(
              "rounded-md px-3 py-1.5 text-[12.5px] font-medium",
              canConfirm
                ? "bg-ink text-ivory hover:opacity-90"
                : "bg-ivory-deep text-ink-faint",
            )}
            title={
              unassignedCount > 0
                ? `${unassignedCount} guest${unassignedCount === 1 ? "" : "s"} still need a circle`
                : undefined
            }
          >
            Split circle
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Guest Drawer — click-through detail view
// ═══════════════════════════════════════════════════════════════════════════

function GuestDrawer({
  guest,
  household,
  allGuests,
  onClose,
  onUpdateRsvp,
  onToggleInvitation,
  onUpdateGuest,
}: {
  guest: Guest;
  household: Household | undefined;
  allGuests: Guest[];
  onClose: () => void;
  onUpdateRsvp: (guestId: string, eventId: string, status: RsvpStatus) => void;
  onToggleInvitation: (guestId: string, eventId: string) => void;
  onUpdateGuest: (guestId: string, patch: Partial<Guest>, activityNote?: string) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const plusOneHost = guest.plusOneOf
    ? allGuests.find((g) => g.id === guest.plusOneOf)
    : undefined;
  const hotelName = guest.hotelId
    ? HOTELS.find((h) => h.id === guest.hotelId)?.name
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        className="flex-1 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close guest detail"
      />
      <aside
        className="panel-scroll flex w-[480px] flex-col overflow-y-auto border-l border-gold/15 bg-ivory"
        style={{ boxShadow: "-8px 0 32px -16px rgba(26,26,26,0.12)" }}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gold/15 bg-ivory/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="relative">
              <GuestAvatar guest={guest} size={56} />
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ivory",
                  SIDE_DOT[guest.side],
                )}
                title={SIDE_LABEL[guest.side]}
              />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                Guest detail
              </div>
              <h2 className="mt-0.5 font-serif text-[20px] leading-tight text-ink">
                {guest.salutation ? `${guest.salutation}. ` : ""}
                {guest.firstName} {guest.lastName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <VipBadge tier={guest.vipTier} />
                {guest.plusOne && plusOneHost && (
                  <span className="rounded border border-ink/10 bg-ivory-deep/50 px-1.5 py-0.5 font-mono text-[10px] italic text-ink-muted">
                    +1 of {plusOneHost.firstName}
                  </span>
                )}
                {guest.needsAssistance && (
                  <span className="inline-flex items-center gap-1 rounded border border-rose-light/40 bg-rose-pale/40 px-1.5 py-0.5 font-mono text-[10px] text-rose">
                    <Accessibility size={9} strokeWidth={1.8} />
                    Assistance
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-ink-muted hover:bg-ivory-deep/50 hover:text-ink"
            title="Close (Esc)"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </header>

        <div className="flex-1">
          <CollapsibleSection title="Contact info" icon={Phone} defaultOpen>
            <InlineField
              icon={Phone}
              label="Phone"
              value={guest.phone}
              placeholder="Add phone"
              type="tel"
              onSave={(v) =>
                onUpdateGuest(
                  guest.id,
                  { phone: v || undefined },
                  v ? "Phone updated" : "Phone cleared",
                )
              }
            />
            <InlineField
              icon={Mail}
              label="Email"
              value={guest.email}
              placeholder="Add email"
              type="email"
              onSave={(v) =>
                onUpdateGuest(
                  guest.id,
                  { email: v || undefined },
                  v ? "Email updated" : "Email cleared",
                )
              }
            />
            <AddressEditor guest={guest} onUpdateGuest={onUpdateGuest} />
            <InlineField
              label="Language"
              value={guest.preferredLanguage}
              placeholder="Add language preference"
              onSave={(v) =>
                onUpdateGuest(guest.id, { preferredLanguage: v || undefined })
              }
            />
          </CollapsibleSection>

          <CollapsibleSection title="Relationship" icon={Users}>
            <FieldRow label="Side">
              <select
                value={guest.side}
                onChange={(e) =>
                  onUpdateGuest(
                    guest.id,
                    { side: e.target.value as Side },
                    `Side changed to ${SIDE_LABEL[e.target.value as Side]}`,
                  )
                }
                className="rounded border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-gold focus:outline-none"
              >
                <option value="bride">Bride&apos;s side</option>
                <option value="groom">Groom&apos;s side</option>
                <option value="mutual">Mutual</option>
              </select>
            </FieldRow>
            <InlineField
              label="To bride"
              value={guest.relationshipToBride}
              placeholder="e.g. Childhood friend"
              onSave={(v) =>
                onUpdateGuest(guest.id, { relationshipToBride: v || undefined })
              }
            />
            <InlineField
              label="To groom"
              value={guest.relationshipToGroom}
              placeholder="e.g. College classmate"
              onSave={(v) =>
                onUpdateGuest(guest.id, { relationshipToGroom: v || undefined })
              }
            />
            <FieldRow label="Household">
              <button
                className="text-left text-[12.5px] text-saffron hover:underline"
                onClick={() => {
                  /* household link — future: open household drawer */
                }}
              >
                {household?.displayName ?? "—"}
              </button>
            </FieldRow>
            <div className="pt-1.5">
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                Circles
              </div>
              <CategoriesEditor
                categories={guest.categories}
                onChange={(next) => onUpdateGuest(guest.id, { categories: next })}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Events & RSVP" icon={CalendarDays} defaultOpen>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {guest.dietary.length === 0 ? (
                <span className="font-mono text-[10.5px] italic text-ink-faint">
                  No dietary tags
                </span>
              ) : (
                guest.dietary.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 rounded border border-sage/30 bg-sage-pale/40 px-2 py-0.5 font-mono text-[10px] text-sage"
                  >
                    <Leaf size={9} strokeWidth={1.6} />
                    {DIETARY_LABEL[d]}
                  </span>
                ))
              )}
              {guest.allergyNotes && (
                <span className="inline-flex items-center gap-1 rounded border border-rose/25 bg-rose-pale/40 px-2 py-0.5 font-mono text-[10px] text-rose">
                  <AlertCircle size={9} strokeWidth={1.8} />
                  {guest.allergyNotes}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {EVENTS.map((e) => {
                const invited = guest.rsvp[e.id] != null;
                const status = guest.rsvp[e.id];
                return (
                  <div
                    key={e.id}
                    className={cn(
                      "flex items-center justify-between rounded border px-2.5 py-2 transition-colors",
                      invited
                        ? "border-gold/20 bg-white"
                        : "border-border bg-ivory-deep/30",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-[13px]">{e.icon}</span>
                      <div className="min-w-0">
                        <div
                          className={cn(
                            "truncate text-[12.5px]",
                            invited ? "text-ink" : "text-ink-muted",
                          )}
                        >
                          {e.label}
                        </div>
                        <div className="font-mono text-[9.5px] text-ink-faint">
                          {e.date} · {e.host}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <InvitedToggle
                        invited={invited}
                        onToggle={() => onToggleInvitation(guest.id, e.id)}
                      />
                      {invited && (
                        <RsvpDropdown
                          status={status ?? "pending"}
                          onChange={(s) => onUpdateRsvp(guest.id, e.id, s)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Performances" icon={Music}>
            <GuestPerformancesSection
              guestId={guest.id}
              events={EVENTS.map(
                (e): PerformancesEvent => ({
                  id: e.id,
                  label: e.label,
                  date: e.date,
                  icon: e.icon,
                }),
              )}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Travel" icon={Plane}>
            {hotelName && (
              <FieldRow label="Hotel">
                <span className="text-[12.5px] text-ink">{hotelName}</span>
              </FieldRow>
            )}
            {guest.roomNumber && (
              <FieldRow label="Room">
                <span className="text-[12.5px] text-ink">
                  {guest.roomNumber}
                  {guest.roomType ? ` · ${guest.roomType}` : ""}
                </span>
              </FieldRow>
            )}
            {guest.outOfTown && (
              <FieldRow label="Origin">
                <span className="text-[12.5px] text-ink">
                  {guest.arrivingFrom ?? `${guest.city}, ${guest.country}`}
                </span>
              </FieldRow>
            )}

            <GuestDrawerFlights guest={guest} onUpdateGuest={onUpdateGuest} />
            <GuestDrawerPickup guest={guest} onUpdateGuest={onUpdateGuest} />
          </CollapsibleSection>

          <CollapsibleSection title="Gifts" icon={Gift}>
            <FieldRow label="Gift">
              <span className="text-[12.5px] text-ink">
                {guest.giftReceived ? (
                  <span className="inline-flex items-center gap-1 text-sage">
                    <Check size={12} strokeWidth={2} /> Received
                  </span>
                ) : (
                  <span className="italic text-ink-faint">Not logged</span>
                )}
              </span>
            </FieldRow>
            <FieldRow label="Thank-you">
              <span className="text-[12.5px] text-ink">
                {guest.thankYouSent ? (
                  <span className="inline-flex items-center gap-1 text-sage">
                    <Check size={12} strokeWidth={2} /> Sent
                  </span>
                ) : (
                  <span className="italic text-ink-faint">Not sent</span>
                )}
              </span>
            </FieldRow>
            <a
              href="/guests?view=gifts"
              className="mt-2 inline-flex items-center gap-1 font-mono text-[10.5px] text-saffron hover:underline"
            >
              Open Gifts & Thank Yous
              <ArrowRight size={11} strokeWidth={1.8} />
            </a>
          </CollapsibleSection>

          <CollapsibleSection title="Notes" icon={MessageSquare}>
            <NotesEditor
              value={guest.notes ?? ""}
              onSave={(v) =>
                onUpdateGuest(
                  guest.id,
                  { notes: v || undefined },
                  v && v !== guest.notes ? "Notes updated" : undefined,
                )
              }
            />
          </CollapsibleSection>

          <CollapsibleSection title="Activity log" icon={Activity}>
            {guest.activityLog.length === 0 ? (
              <div className="font-mono text-[10.5px] italic text-ink-faint">
                No activity yet
              </div>
            ) : (
              <ol className="flex flex-col gap-2">
                {[...guest.activityLog]
                  .slice()
                  .reverse()
                  .map((entry, idx) => (
                    <li
                      key={`${entry.timestamp}-${idx}`}
                      className="flex items-baseline gap-2 text-[12px] text-ink"
                    >
                      <span className="inline-block h-1 w-1 shrink-0 translate-y-[-2px] rounded-full bg-gold-light" />
                      <span className="flex-1">{entry.action}</span>
                      <span className="shrink-0 font-mono text-[10px] text-ink-faint">
                        {entry.timestamp}
                      </span>
                    </li>
                  ))}
              </ol>
            )}
          </CollapsibleSection>
        </div>
      </aside>
    </div>
  );
}

// ── Travel drawer: structured flights ─────────────────────────────────────
// Renders the `flights[]` array in the guest drawer's Travel section and
// lets the planner add a flight inline. Mirrors the Flights tab's data
// model so drawer edits round-trip correctly.
function GuestDrawerFlights({
  guest,
  onUpdateGuest,
}: {
  guest: Guest;
  onUpdateGuest: (guestId: string, patch: Partial<Guest>, activityNote?: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const flights = guest.flights ?? [];

  function handleAdd(_guestId: string, flight: GuestFlight) {
    onUpdateGuest(
      guest.id,
      { flights: [...flights, flight] },
      `Flight ${flight.flightNumber} added`,
    );
    setAdding(false);
  }

  function handleDelete(flightId: string) {
    onUpdateGuest(
      guest.id,
      { flights: flights.filter((f) => f.id !== flightId) },
      "Flight removed",
    );
  }

  return (
    <div className="pt-1.5">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          Flights
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1 font-mono text-[10.5px] text-saffron hover:underline"
        >
          <Plus size={10} strokeWidth={2} /> {adding ? "Close" : "Add flight"}
        </button>
      </div>

      {flights.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-ivory-deep/30 px-3 py-2.5 font-mono text-[11px] italic text-ink-faint">
          No flights on file
        </div>
      ) : (
        <ul className="space-y-1.5">
          {flights.map((f) => {
            const meta = FLIGHT_STATUS_META[f.status];
            const Dir = f.direction === "arrival" ? PlaneLanding : PlaneTakeoff;
            return (
              <li
                key={f.id}
                className="flex items-start gap-2 rounded border border-gold/15 bg-white px-3 py-2 text-[12px] text-ink"
              >
                <Dir
                  size={13}
                  strokeWidth={1.8}
                  className={
                    f.direction === "arrival" ? "mt-0.5 text-sage" : "mt-0.5 text-saffron"
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-saffron">
                      {f.airline} {f.flightNumber}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-1.5 py-0.5 font-mono text-[9.5px]",
                        meta.className,
                      )}
                    >
                      {meta.label}
                      {f.status === "delayed" && f.delayMinutes
                        ? ` · +${f.delayMinutes}m`
                        : ""}
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-[10.5px] text-ink-muted">
                    {formatFlightTime(f.scheduledDatetime)}
                    {f.origin ? ` · ${f.origin}` : ""}
                    {f.destination ? ` → ${f.destination}` : ""}
                    {f.terminal ? ` · ${f.terminal}` : ""}
                    {f.gate ? ` · Gate ${f.gate}` : ""}
                  </div>
                  {f.notes && (
                    <div className="mt-0.5 text-[11px] italic text-ink-faint">
                      {f.notes}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Remove flight"
                  onClick={() => handleDelete(f.id)}
                  className="shrink-0 rounded p-0.5 text-ink-faint hover:bg-ivory-deep/50 hover:text-rose"
                >
                  <Trash2 size={11} strokeWidth={1.8} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {adding && (
        <div className="mt-2">
          <AddFlightForm
            guests={[guest]}
            defaultDirection="arrival"
            onCancel={() => setAdding(false)}
            onSave={handleAdd}
          />
        </div>
      )}
    </div>
  );
}

function GuestDrawerPickup({
  guest,
  onUpdateGuest,
}: {
  guest: Guest;
  onUpdateGuest: (guestId: string, patch: Partial<Guest>, activityNote?: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const g = guest.ground;
  const firstArrival = (guest.flights ?? []).find((f) => f.direction === "arrival");
  const defaultLoc = firstArrival?.destination
    ? `${firstArrival.destination} arrivals`
    : "Airport arrivals";
  const defaultTime = firstArrival?.scheduledDatetime ?? "";

  return (
    <div className="pt-3">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          Ground transport
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="inline-flex items-center gap-1 font-mono text-[10.5px] text-saffron hover:underline"
        >
          {editing ? "Close" : g?.pickupAssigned ? "Edit" : "Assign"}
        </button>
      </div>
      {g?.pickupAssigned ? (
        <div className="rounded border border-gold/15 bg-white px-3 py-2 text-[12px] text-ink">
          <div className="flex items-center gap-2">
            <Car size={12} strokeWidth={1.8} className="text-saffron" />
            <span>{g.driverName ?? "Driver assigned"}</span>
            {g.driverPhone && (
              <span className="font-mono text-[10.5px] text-ink-muted">
                · {g.driverPhone}
              </span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[10.5px] text-ink-muted">
            {g.vehicleInfo ? `${g.vehicleInfo} · ` : ""}
            {g.pickupLocation ?? "—"}
            {g.pickupTime ? ` · ${formatFlightTime(g.pickupTime)}` : ""}
          </div>
        </div>
      ) : (
        <div className="rounded border border-dashed border-border bg-ivory-deep/30 px-3 py-2 font-mono text-[11px] italic text-ink-faint">
          No pickup assigned
        </div>
      )}
      {editing && (
        <div className="mt-2">
          <DriverAssignForm
            guest={guest}
            defaultPickupLocation={defaultLoc}
            defaultPickupTime={defaultTime}
            onCancel={() => setEditing(false)}
            onSave={(ground) => {
              onUpdateGuest(
                guest.id,
                { ground },
                `Pickup assigned: ${ground.driverName ?? "driver"}`,
              );
              setEditing(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <section className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-3.5 text-left transition-colors hover:bg-ivory-deep/30"
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon size={13} strokeWidth={1.8} className="text-ink-muted" />
          )}
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronDown size={14} strokeWidth={1.6} className="text-ink-faint" />
        ) : (
          <ChevronRight size={14} strokeWidth={1.6} className="text-ink-faint" />
        )}
      </button>
      {open && <div className="flex flex-col gap-2 px-6 pb-5 pt-1">{children}</div>}
    </section>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <div className="w-20 shrink-0 pt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function InlineField({
  icon: Icon,
  label,
  value,
  placeholder,
  type = "text",
  onSave,
}: {
  icon?: React.ElementType;
  label: string;
  value: string | undefined;
  placeholder: string;
  type?: "text" | "email" | "tel";
  onSave: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  function commit() {
    const next = draft.trim();
    if (next !== (value ?? "")) onSave(next);
    setEditing(false);
  }

  return (
    <div className="flex items-start gap-3 py-1">
      <div className="flex w-20 shrink-0 items-center gap-1 pt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
        {Icon && <Icon size={10} strokeWidth={1.6} />}
        {label}
      </div>
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              } else if (e.key === "Escape") {
                setDraft(value ?? "");
                setEditing(false);
              }
            }}
            placeholder={placeholder}
            className="w-full rounded border border-gold/40 bg-white px-2 py-1 text-[12.5px] text-ink focus:border-gold focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className={cn(
              "w-full truncate rounded border border-transparent px-2 py-1 text-left text-[12.5px] transition-colors hover:border-border hover:bg-white",
              value ? "text-ink" : "italic text-ink-faint",
            )}
          >
            {value || placeholder}
          </button>
        )}
      </div>
    </div>
  );
}

function AddressEditor({
  guest,
  onUpdateGuest,
}: {
  guest: Guest;
  onUpdateGuest: (guestId: string, patch: Partial<Guest>, activityNote?: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <div className="flex w-20 shrink-0 items-center gap-1 pt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
        <MapPin size={10} strokeWidth={1.6} />
        Address
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <InlineInputBare
          value={guest.street1}
          placeholder="Street"
          onSave={(v) => onUpdateGuest(guest.id, { street1: v || undefined })}
        />
        <div className="flex gap-1">
          <InlineInputBare
            value={guest.city}
            placeholder="City"
            className="flex-1"
            onSave={(v) =>
              onUpdateGuest(guest.id, { city: v || guest.city }, "Address updated")
            }
          />
          <InlineInputBare
            value={guest.state}
            placeholder="State"
            className="w-20"
            onSave={(v) => onUpdateGuest(guest.id, { state: v || undefined })}
          />
        </div>
        <div className="flex gap-1">
          <InlineInputBare
            value={guest.postalCode}
            placeholder="Postal"
            className="w-24"
            onSave={(v) => onUpdateGuest(guest.id, { postalCode: v || undefined })}
          />
          <InlineInputBare
            value={guest.country}
            placeholder="Country"
            className="flex-1"
            onSave={(v) =>
              onUpdateGuest(guest.id, { country: v || guest.country })
            }
          />
        </div>
      </div>
    </div>
  );
}

function InlineInputBare({
  value,
  placeholder,
  className,
  onSave,
}: {
  value: string | undefined;
  placeholder: string;
  className?: string;
  onSave: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  function commit() {
    const next = draft.trim();
    if (next !== (value ?? "")) onSave(next);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            setDraft(value ?? "");
            setEditing(false);
          }
        }}
        placeholder={placeholder}
        className={cn(
          "rounded border border-gold/40 bg-white px-2 py-0.5 text-[12px] text-ink focus:border-gold focus:outline-none",
          className,
        )}
      />
    );
  }
  return (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        "truncate rounded border border-transparent px-2 py-0.5 text-left text-[12px] transition-colors hover:border-border hover:bg-white",
        value ? "text-ink" : "italic text-ink-faint",
        className,
      )}
    >
      {value || placeholder}
    </button>
  );
}

function CategoriesEditor({
  categories,
  onChange,
}: {
  categories: string[];
  onChange: (next: string[]) => void;
}) {
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");

  const rawStoreCategories = useGuestCategoriesStore((s) => s.categories);
  const storeCategories = useMemo(
    () => orderedCategories(rawStoreCategories),
    [rawStoreCategories],
  );
  const categoryByName = useMemo(() => {
    const m = new Map<string, GuestCategory>();
    for (const c of storeCategories) m.set(c.name.toLowerCase(), c);
    return m;
  }, [storeCategories]);

  function add(name: string) {
    const clean = name.trim();
    if (!clean || categories.includes(clean)) return;
    onChange([...categories, clean]);
  }

  function remove(name: string) {
    onChange(categories.filter((c) => c !== name));
  }

  const available = storeCategories.filter((c) => !categories.includes(c.name));
  const filtered = query.trim()
    ? available.filter((c) =>
        c.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : available;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((c) => {
          const known = categoryByName.get(c.toLowerCase());
          const sw = swatchFor(known?.color);
          return (
            <span
              key={c}
              className="group inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px]"
              style={{
                backgroundColor: sw.pillBg,
                borderColor: sw.pillBorder,
                color: sw.pillText,
              }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: sw.dot }}
              />
              {c}
              <button
                onClick={() => remove(c)}
                className="rounded-full opacity-60 transition-opacity hover:opacity-100"
                title={`Remove ${c}`}
              >
                <X size={9} strokeWidth={2} />
              </button>
            </span>
          );
        })}
        <button
          onClick={() => setPicking((p) => !p)}
          className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-ink/20 px-2 py-0.5 text-[10.5px] text-ink-muted transition-colors hover:border-gold hover:text-saffron"
          aria-label="Add to circle"
        >
          <Plus size={10} strokeWidth={2} />
          Add
        </button>
      </div>
      {picking && (
        <div className="rounded border border-gold/20 bg-white p-2">
          <div className="relative mb-1.5">
            <Search
              size={10}
              strokeWidth={1.8}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setPicking(false);
                  setQuery("");
                }
              }}
              placeholder="Search circles…"
              className="w-full rounded border border-border bg-ivory/50 py-0.5 pl-6 pr-2 text-[11px] text-ink focus:border-gold focus:outline-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-1 py-1.5 text-[10.5px] italic text-ink-faint">
                {storeCategories.length === 0
                  ? "No circles exist yet. Create some in the Circles tab."
                  : available.length === 0
                  ? "All circles already applied."
                  : "No matches."}
              </div>
            ) : (
              <div className="flex flex-col">
                {filtered.map((c) => {
                  const sw = swatchFor(c.color);
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        add(c.name);
                        setQuery("");
                        setPicking(false);
                      }}
                      className="flex items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11px] hover:bg-ivory-warm/50"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: sw.dot }}
                      />
                      <span className="min-w-0 flex-1 truncate text-ink">
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InvitedToggle({
  invited,
  onToggle,
}: {
  invited: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "inline-flex h-5 w-9 items-center rounded-full border transition-colors",
        invited
          ? "border-sage/40 bg-sage-pale justify-end"
          : "border-border bg-ivory-deep justify-start",
      )}
      title={invited ? "Invited — click to remove" : "Not invited — click to add"}
    >
      <span
        className={cn(
          "mx-0.5 h-3.5 w-3.5 rounded-full shadow-sm transition-transform",
          invited ? "bg-sage" : "bg-ink-faint/60",
        )}
      />
    </button>
  );
}

function RsvpDropdown({
  status,
  onChange,
}: {
  status: RsvpStatus;
  onChange: (s: RsvpStatus) => void;
}) {
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as RsvpStatus)}
      className={cn(
        "rounded border px-1.5 py-0.5 text-[10.5px] focus:outline-none",
        RSVP_TONE[status],
        "border-gold/20",
      )}
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="tentative">Tentative</option>
      <option value="declined">Declined</option>
      <option value="no_response">No response</option>
    </select>
  );
}

function NotesEditor({
  value,
  onSave,
}: {
  value: string;
  onSave: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setDraft(value);
  }, [value]);

  function commit() {
    if (draft !== value) {
      onSave(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    }
  }

  return (
    <div className="relative">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        placeholder="Private planner notes about this guest…"
        rows={4}
        className="w-full resize-y rounded border border-gold/20 bg-white px-3 py-2 text-[12.5px] text-ink placeholder:italic placeholder:text-ink-faint focus:border-gold focus:outline-none"
      />
      {saved && (
        <span className="saved-indicator pointer-events-none absolute right-2 top-2 rounded bg-sage-pale px-1.5 py-0.5 font-mono text-[9.5px] text-sage">
          Saved
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Add Guest Modal
// ═══════════════════════════════════════════════════════════════════════════

type AddHouseholdInput = Extract<GuestCommandAction, { kind: "add_household" }>["household"];

function AddGuestModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (input: AddHouseholdInput) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [side, setSide] = useState<Side>("mutual");
  const [relationship, setRelationship] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [outOfTown, setOutOfTown] = useState(false);
  const [inviteAll, setInviteAll] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) return;
    const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
    onAdd({
      displayName,
      addressing: displayName,
      side,
      branch: "",
      city: city.trim(),
      country: country.trim() || "India",
      outOfTown,
      invitedEvents: inviteAll ? EVENTS.map((ev) => ev.id) : ["ceremony", "reception"],
      members: [
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: "primary",
          relationship: relationship.trim() || "Guest",
        },
      ],
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-ink-faint hover:text-ink"
        >
          <X size={16} />
        </button>

        <h2 className="mb-5 font-serif text-[17px] text-ink">Add Guest</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                First Name *
              </label>
              <input
                autoFocus
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded border border-border px-3 py-1.5 text-[13px] text-ink focus:border-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded border border-border px-3 py-1.5 text-[13px] text-ink focus:border-ink focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
              Side
            </label>
            <div className="flex gap-2">
              {(["bride", "groom", "mutual"] as Side[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={`flex-1 rounded border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors ${
                    side === s
                      ? "border-ink bg-ink text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
              Relationship
            </label>
            <input
              placeholder="e.g. Cousin, Family Friend"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full rounded border border-border px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                City
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded border border-border px-3 py-1.5 text-[13px] text-ink focus:border-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                Country
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded border border-border px-3 py-1.5 text-[13px] text-ink focus:border-ink focus:outline-none"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-muted">
            <input
              type="checkbox"
              checked={outOfTown}
              onChange={(e) => setOutOfTown(e.target.checked)}
              className="accent-ink"
            />
            Out of town — needs accommodation
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-muted">
            <input
              type="checkbox"
              checked={inviteAll}
              onChange={(e) => setInviteAll(e.target.checked)}
              className="accent-ink"
            />
            Invite to all events (uncheck for ceremony + reception only)
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-1.5 text-[12px] font-medium text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
            disabled={!firstName.trim()}
          >
            Add Guest
          </button>
        </div>
      </form>
    </div>
  );
}
