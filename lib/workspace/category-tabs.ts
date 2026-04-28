// ── Per-category tab configuration ────────────────────────────────────────
// Each vendor category owns its own tab layout. Photography was the first
// purpose-built category; the rest followed with tab sets tuned to how
// couples and planners actually think about that vendor.
//
// Shared tabs (shortlist_contract, day_of, deliverables) mean the same thing
// everywhere; category-specific ids are category-local. Filtering always
// happens inside a category scope, so ids never collide.

import type { ElementType } from "react";
import {
  Armchair,
  BookOpen,
  Boxes,
  Building2,
  BusFront,
  Cake,
  CakeSlice,
  Camera,
  Car,
  ChefHat,
  ClipboardList,
  Clock,
  Crown,
  FileSignature,
  Film,
  Flower2,
  Footprints,
  Gem,
  Gift,
  HandHeart,
  HandCoins,
  Handshake,
  Hash,
  Heart,
  IceCreamBowl,
  Leaf,
  Lightbulb,
  ListChecks,
  Mail,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Mic2,
  MoveRight,
  Music,
  Music2,
  Package,
  PackageOpen,
  Palette,
  PenTool,
  Plane,
  Printer,
  Radio,
  Route,
  Scale,
  Scissors,
  Send,
  ShieldCheck,
  Shirt,
  Soup,
  Sparkles,
  Star,
  StickyNote,
  Table2,
  Ticket,
  Users,
  UserCircle,
  UtensilsCrossed,
  Wand2,
  Wheat,
  Wine,
} from "lucide-react";
import type { WorkspaceCategorySlug, WorkspaceTab } from "@/types/workspace";

// ── Per-category tab id unions ──────────────────────────────────────────────

export type PhotoTabId =
  | "vision"
  | "shortlist_contract"
  | "shot_list"
  | "vips"
  | "rituals"
  | "day_of"
  | "crew"
  | "deliverables";

export type VideoTabId =
  | "vision"
  | "shortlist_contract"
  | "film_vision"
  | "audio_coverage"
  | "deliverables"
  | "day_of";

export type CateringTabId =
  | "food_story"
  | "menu_studio"
  | "tastings"
  | "mood_board";

export type DecorTabId =
  | "vision"                 // Vision & Mood — Aesthetic Studio, palette, moodboard
  | "shortlist_contract"     // Shortlist & Contract (décor-house, florist, etc.)
  | "scenes"                 // Spaces — per-event spatial design cards
  | "florals"                // Floral Plan — personal + event flowers, stem math
  | "load_in"                // Install Timeline — T-3 → T+1 day-by-day
  | "budget";                // Budget & Rentals — money transparency + rental inventory

export type EntertainmentTabId =
  | "vision"
  | "shortlist_contract"
  | "soundscapes"
  | "sangeet_planner"
  | "equipment_tech"
  | "day_of";

export type GuestExperiencesTabId =
  | "guest_discover"
  | "guest_shortlist"
  | "guest_inspiration";

export type HmuaTabId =
  | "vision"
  | "shortlist_contract"
  | "trial_notes"
  | "bride_looks"
  | "bridal_party"
  | "touch_up";

export type VenueTabId =
  | "dream_discover"
  | "venue_shortlist"
  | "spaces_flow"
  | "logistics_rules"
  | "site_visits"
  | "documents";

export type MehndiTabId =
  | "vision"
  | "guest_mehndi"
  | "shortlist_contract"
  | "day_of";

export type TransportationTabId =
  | "plan_logistics"
  | "baraat"
  | "shuttle_transport"
  | "shortlist_contract"
  | "day_of"
  | "documents";

export type StationeryTabId =
  | "vision"
  | "suite_builder"
  | "samples_shortlist"
  | "inspiration";

export type PanditTabId =
  | "vision"
  | "shortlist_contract"
  | "ceremony_script"
  | "family_roles"
  | "samagri"
  | "ceremony_logistics";

export type WardrobeTabId =
  | "vision"
  | "shortlist_contract"
  | "fittings"
  | "wardrobe_looks"
  | "bridal_party_attire"
  | "delivery";

export type JewelryTabId =
  | "vision"
  | "shortlist_contract"
  | "bridal_jewelry"
  | "groom_jewelry"
  | "family_heirlooms"
  | "fittings_coordination";

export type CakeSweetsTabId =
  | "vision"
  | "shortlist_contract"
  | "wedding_cake"
  | "mithai"
  | "dessert_tables"
  | "tasting_approval"
  | "service_plan";

export type GiftingTabId =
  | "vision"
  | "shortlist_contract"
  | "welcome_bags"
  | "trousseau_packaging"
  | "return_favors"
  | "family_exchanges"
  | "thank_you";

export type TravelAccommodationsTabId =
  | "hotel_strategy"
  | "room_blocks"
  | "guest_travel"
  | "shortlist_contract"
  | "welcome_experience"
  | "documents";

// Every tab id across every category. Used by generic canvases to index
// into filter predicates.
export type AnyTabId =
  | PhotoTabId
  | VideoTabId
  | CateringTabId
  | DecorTabId
  | EntertainmentTabId
  | GuestExperiencesTabId
  | HmuaTabId
  | VenueTabId
  | MehndiTabId
  | TransportationTabId
  | StationeryTabId
  | PanditTabId
  | WardrobeTabId
  | JewelryTabId
  | CakeSweetsTabId
  | GiftingTabId
  | TravelAccommodationsTabId;

// ── Tab def shape ───────────────────────────────────────────────────────────

export interface CategoryTabDef<Id extends string = string> {
  id: Id;
  label: string;
  icon: ElementType;
  // Tabs hidden when the user is previewing as vendor (pricing, private
  // couple conversations, etc.).
  hideFromVendor?: boolean;
}

// ── Photography ─────────────────────────────────────────────────────────────

export const PHOTOGRAPHY_TABS: CategoryTabDef<PhotoTabId>[] = [
  { id: "vision", label: "Vision & Mood", icon: Palette },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "shot_list", label: "Shot List", icon: Camera },
  { id: "vips", label: "VIPs & Family", icon: UserCircle },
  { id: "rituals", label: "Ritual Moments", icon: Sparkles },
  { id: "day_of", label: "Day-of Schedule", icon: Clock },
  { id: "crew", label: "Crew", icon: Users },
  { id: "deliverables", label: "Deliverables", icon: Gift },
];

// ── Videography ─────────────────────────────────────────────────────────────

export const VIDEOGRAPHY_TABS: CategoryTabDef<VideoTabId>[] = [
  { id: "vision", label: "Vision & Mood", icon: Palette },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "film_vision", label: "Film Vision", icon: Film },
  { id: "audio_coverage", label: "Audio & Coverage", icon: Mic2 },
  { id: "deliverables", label: "Deliverables", icon: Gift },
  { id: "day_of", label: "Day-of Coverage", icon: Clock },
];

// ── Catering ────────────────────────────────────────────────────────────────

export const CATERING_TABS: CategoryTabDef<CateringTabId>[] = [
  { id: "food_story", label: "Food Story", icon: Sparkles },
  { id: "menu_studio", label: "Menu Studio", icon: ChefHat },
  { id: "tastings", label: "Tastings", icon: UtensilsCrossed },
  { id: "mood_board", label: "Mood Board", icon: Palette },
];

// ── Décor & Florals ─────────────────────────────────────────────────────────

export const DECOR_TABS: CategoryTabDef<DecorTabId>[] = [
  { id: "vision", label: "Vision & Mood", icon: Palette },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "scenes", label: "Spaces", icon: Sparkles },
  { id: "florals", label: "Floral Plan", icon: Flower2 },
  { id: "load_in", label: "Install Timeline", icon: Clock },
  { id: "budget", label: "Budget & Rentals", icon: Scale, hideFromVendor: true },
];

// ── Music & Entertainment ───────────────────────────────────────────────────

export const ENTERTAINMENT_TABS: CategoryTabDef<EntertainmentTabId>[] = [
  { id: "vision", label: "Vision & Mood", icon: Palette },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "soundscapes", label: "Event Soundscapes", icon: Music2 },
  { id: "sangeet_planner", label: "Sangeet Planner", icon: Sparkles },
  { id: "equipment_tech", label: "Equipment & Technical", icon: Radio },
  { id: "day_of", label: "Day-of Schedule", icon: Clock },
];

// ── Guest Experiences ───────────────────────────────────────────────────────

export const GUEST_EXPERIENCES_TABS: CategoryTabDef<GuestExperiencesTabId>[] = [
  { id: "guest_discover", label: "Discover & Dream", icon: Sparkles },
  { id: "guest_shortlist", label: "Shortlist & Plan", icon: Heart },
  { id: "guest_inspiration", label: "Inspiration", icon: Palette },
];

// ── Hair & Makeup ───────────────────────────────────────────────────────────

export const HMUA_TABS: CategoryTabDef<HmuaTabId>[] = [
  { id: "vision", label: "Vision & Mood", icon: Palette },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "trial_notes", label: "Trial Notes", icon: Wand2 },
  { id: "bride_looks", label: "Bride Looks", icon: Sparkles },
  { id: "bridal_party", label: "Family & Bridal Party", icon: Users },
  { id: "touch_up", label: "Touch-up Kit", icon: HandHeart },
];

// ── Venue ───────────────────────────────────────────────────────────────────

export const VENUE_TABS: CategoryTabDef<VenueTabId>[] = [
  { id: "dream_discover", label: "Dream & Discover", icon: Sparkles },
  { id: "venue_shortlist", label: "Venue Shortlist", icon: Heart, hideFromVendor: true },
  { id: "spaces_flow", label: "Spaces & Flow", icon: MapIcon },
  { id: "logistics_rules", label: "Logistics & Rules", icon: ShieldCheck },
  { id: "site_visits", label: "Site Visits", icon: StickyNote },
  { id: "documents", label: "Documents", icon: FileSignature, hideFromVendor: true },
];

// ── Mehendi ─────────────────────────────────────────────────────────────────

export const MEHNDI_TABS: CategoryTabDef<MehndiTabId>[] = [
  { id: "vision", label: "Your Mehendi Story", icon: Heart },
  { id: "guest_mehndi", label: "Who Gets Mehendi", icon: Users },
  { id: "shortlist_contract", label: "Find Your Artist", icon: Sparkles, hideFromVendor: true },
  { id: "day_of", label: "Day-of Flow", icon: Clock },
];

// ── Transportation ──────────────────────────────────────────────────────────

export const TRANSPORTATION_TABS: CategoryTabDef<TransportationTabId>[] = [
  { id: "plan_logistics", label: "Plan & Logistics", icon: ClipboardList },
  { id: "baraat", label: "Baraat", icon: Footprints },
  { id: "shuttle_transport", label: "Shuttle & Guest Transport", icon: BusFront },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "day_of", label: "Day-of Route Plan", icon: Route },
  { id: "documents", label: "Documents", icon: Package },
];

// ── Stationery & Invitations ────────────────────────────────────────────────

export const STATIONERY_TABS: CategoryTabDef<StationeryTabId>[] = [
  { id: "vision", label: "Vision & Mood", icon: Palette },
  { id: "suite_builder", label: "Suite Builder", icon: Mail },
  {
    id: "samples_shortlist",
    label: "Samples & Shortlist",
    icon: FileSignature,
    hideFromVendor: true,
  },
  { id: "inspiration", label: "Inspiration", icon: Sparkles },
];

// ── Priest / Pandit ─────────────────────────────────────────────────────────

export const PANDIT_TABS: CategoryTabDef<PanditTabId>[] = [
  { id: "vision", label: "Vision & Ceremony Brief", icon: Palette },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "ceremony_script", label: "Ceremony Script", icon: BookOpen },
  { id: "family_roles", label: "Family Roles", icon: Users },
  { id: "samagri", label: "Samagri & Supplies", icon: Wheat },
  { id: "ceremony_logistics", label: "Ceremony Logistics", icon: Clock },
];

// ── Wardrobe & Styling ──────────────────────────────────────────────────────

export const WARDROBE_TABS: CategoryTabDef<WardrobeTabId>[] = [
  { id: "vision", label: "Style & Vision", icon: Palette },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "wardrobe_looks", label: "Event Looks", icon: Shirt },
  { id: "bridal_party_attire", label: "Family Coordination", icon: Users },
  { id: "fittings", label: "Fittings & Alterations", icon: Scissors },
  { id: "delivery", label: "Documents", icon: Package },
];

// ── Jewelry ─────────────────────────────────────────────────────────────────

export const JEWELRY_TABS: CategoryTabDef<JewelryTabId>[] = [
  { id: "vision", label: "Vision & Mood", icon: Palette },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "bridal_jewelry", label: "Bridal Jewelry", icon: Gem },
  { id: "groom_jewelry", label: "Groom's Jewelry", icon: Crown },
  { id: "family_heirlooms", label: "Family Heirlooms", icon: HandHeart },
  { id: "fittings_coordination", label: "Fittings & Coordination", icon: Scissors },
];

// ── Cake & Sweets ───────────────────────────────────────────────────────────

export const CAKE_SWEETS_TABS: CategoryTabDef<CakeSweetsTabId>[] = [
  { id: "vision", label: "Vision & Mood", icon: Palette },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "wedding_cake", label: "Cake Design", icon: Cake },
  { id: "mithai", label: "Mithai & Dessert Spread", icon: IceCreamBowl },
  { id: "dessert_tables", label: "Dessert Tables", icon: CakeSlice },
  { id: "service_plan", label: "Service Plan", icon: Clock },
  { id: "tasting_approval", label: "Tastings & Approval", icon: UtensilsCrossed },
];

// ── Gifting ─────────────────────────────────────────────────────────────────

export const GIFTING_TABS: CategoryTabDef<GiftingTabId>[] = [
  { id: "vision", label: "Vision & Mood", icon: Palette },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "welcome_bags", label: "Welcome Bags", icon: PackageOpen },
  { id: "trousseau_packaging", label: "Trousseau Packaging", icon: Package },
  { id: "return_favors", label: "Return Favors", icon: Gift },
  { id: "family_exchanges", label: "Family Exchanges", icon: Handshake },
  { id: "thank_you", label: "Thank-You Tracker", icon: HandHeart },
];

// ── Travel & Accommodations ─────────────────────────────────────────────────

export const TRAVEL_ACCOMMODATIONS_TABS: CategoryTabDef<TravelAccommodationsTabId>[] = [
  { id: "hotel_strategy", label: "Hotel Strategy", icon: ClipboardList },
  { id: "room_blocks", label: "Room Block Manager", icon: Building2 },
  { id: "guest_travel", label: "Guest Travel Hub", icon: Plane },
  { id: "shortlist_contract", label: "Shortlist & Contract", icon: FileSignature, hideFromVendor: true },
  { id: "welcome_experience", label: "Welcome Experience", icon: PackageOpen },
  { id: "documents", label: "Documents", icon: Package, hideFromVendor: true },
];

// ── Legacy fallback ─────────────────────────────────────────────────────────
// Only used for categories that don't yet have a purpose-built tab set.

export const LEGACY_TABS: CategoryTabDef[] = [
  { id: "vision", label: "Vision", icon: Palette },
  { id: "plan", label: "Plan", icon: Camera },
  { id: "shortlist", label: "Shortlist", icon: Heart },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "decisions", label: "Decisions & Notes", icon: FileSignature, hideFromVendor: true },
  { id: "journal", label: "Journal", icon: BookOpen },
];

// ── Registry ────────────────────────────────────────────────────────────────

export function getTabsForCategory(slug: WorkspaceCategorySlug): CategoryTabDef[] {
  switch (slug) {
    case "photography":
      return PHOTOGRAPHY_TABS;
    case "videography":
      return VIDEOGRAPHY_TABS;
    case "catering":
      return CATERING_TABS;
    case "decor_florals":
      return DECOR_TABS;
    case "entertainment":
      return ENTERTAINMENT_TABS;
    case "guest_experiences":
      return GUEST_EXPERIENCES_TABS;
    case "hmua":
      return HMUA_TABS;
    case "venue":
      return VENUE_TABS;
    case "mehndi":
      return MEHNDI_TABS;
    case "transportation":
      return TRANSPORTATION_TABS;
    case "stationery":
      return STATIONERY_TABS;
    case "pandit_ceremony":
      return PANDIT_TABS;
    case "wardrobe":
      return WARDROBE_TABS;
    case "jewelry":
      return JEWELRY_TABS;
    case "cake_sweets":
      return CAKE_SWEETS_TABS;
    case "gifting":
      return GIFTING_TABS;
    case "travel_accommodations":
      return TRAVEL_ACCOMMODATIONS_TABS;
    default:
      return LEGACY_TABS;
  }
}

// Convenience — every tab id that appears in at least one category tab def.
// Helpful for sanity checks and seed tooling.
export function allTabIds(): WorkspaceTab[] {
  const all = [
    ...PHOTOGRAPHY_TABS,
    ...VIDEOGRAPHY_TABS,
    ...CATERING_TABS,
    ...DECOR_TABS,
    ...ENTERTAINMENT_TABS,
    ...GUEST_EXPERIENCES_TABS,
    ...HMUA_TABS,
    ...VENUE_TABS,
    ...MEHNDI_TABS,
    ...TRANSPORTATION_TABS,
    ...STATIONERY_TABS,
    ...PANDIT_TABS,
    ...WARDROBE_TABS,
    ...JEWELRY_TABS,
    ...CAKE_SWEETS_TABS,
    ...GIFTING_TABS,
    ...TRAVEL_ACCOMMODATIONS_TABS,
    ...LEGACY_TABS,
  ];
  const set = new Set<string>();
  for (const t of all) set.add(t.id);
  return Array.from(set) as WorkspaceTab[];
}
