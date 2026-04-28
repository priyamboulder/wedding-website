// ── Suite kind → icon map ─────────────────────────────────────────────────
// Small ornamental glyph that anchors the panel hero. Matches the tone of
// the icon used on the suite card so the panel reads as a continuation of
// the card the user just clicked.

import {
  BedDouble,
  Calendar,
  FileText,
  Gift,
  Hash,
  Heart,
  Home,
  LayoutGrid,
  Mail,
  MapPin,
  Package,
  ScrollText,
  Sparkles,
  Stamp,
  Tag,
  UserCheck,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { StationerySuiteKind } from "@/types/stationery";

export const SUITE_KIND_ICON: Record<StationerySuiteKind, LucideIcon> = {
  save_the_date: Mail,
  main_invitation: Mail,
  rsvp_card: Mail,
  details_card: FileText,
  event_insert: Calendar,
  map_card: MapPin,
  accommodation_card: BedDouble,
  envelope_outer: Mail,
  envelope_inner: Mail,
  enclosure: Stamp,
  ceremony_program: ScrollText,
  menu_card: UtensilsCrossed,
  place_card: UserCheck,
  table_number: Hash,
  signage: LayoutGrid,
  favor_tag: Tag,
  welcome_bag_insert: Package,
  seating_chart: LayoutGrid,
  thank_you_card: Heart,
  at_home_card: Home,
  custom: Sparkles,
};

export function iconForSuiteKind(kind: StationerySuiteKind): LucideIcon {
  return SUITE_KIND_ICON[kind] ?? Gift;
}
