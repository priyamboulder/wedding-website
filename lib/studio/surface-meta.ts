// ──────────────────────────────────────────────────────────────────────────
// Surface metadata — labels, descriptions, sub-categories
//
// Drives the marketplace hero + sub-category pills. Keep in sync with the
// `surface_type` values in design_templates.
// ──────────────────────────────────────────────────────────────────────────

import type { SurfaceType } from "@/components/studio/canvas-editor/CanvasEditor";

export interface SurfaceMeta {
  title: string;
  subtitle: string;
  categories: string[];            // sub-category pills
  defaultWidth: number;
  defaultHeight: number;
}

export const SURFACE_META: Record<SurfaceType, SurfaceMeta> = {
  invitation: {
    title: "Wedding Invitations",
    subtitle: "Printed and digital suites for every event in your week — from haldi through reception.",
    categories: ["All", "Wedding", "Sangeet", "Mehndi", "Haldi", "Engagement", "Reception", "Walima"],
    defaultWidth: 1500,
    defaultHeight: 2100,
  },
  save_the_date: {
    title: "Save the Dates",
    subtitle: "Announce the when and where months ahead. Print or send digitally.",
    categories: ["All", "Digital", "Print", "WhatsApp-ready", "Bilingual"],
    defaultWidth: 1500,
    defaultHeight: 2100,
  },
  menu: {
    title: "Menu Cards",
    subtitle: "Course-by-course reception menus — matte cardstock to hand-lettered easels.",
    categories: ["All", "Reception", "Sangeet", "Welcome dinner", "Brunch", "Tasting"],
    defaultWidth: 1200,
    defaultHeight: 2700,
  },
  welcome_sign: {
    title: "Welcome Signs",
    subtitle: "Large-format doorway signs greeting guests as they arrive.",
    categories: ["All", "Ceremony", "Reception", "Mehndi", "Sangeet"],
    defaultWidth: 1200,
    defaultHeight: 1800,
  },
  seating_chart: {
    title: "Seating Charts",
    subtitle: "Guide guests to their table with heritage-framed or modern grid charts.",
    categories: ["All", "Reception", "Sangeet", "Intimate dinner"],
    defaultWidth: 1800,
    defaultHeight: 1200,
  },
  ceremony_program: {
    title: "Ceremony Programs",
    subtitle: "Walk guests through the ritual order — Sanskrit, Gurmukhi, or English.",
    categories: ["All", "Anand Karaj", "Hindu", "Christian", "Interfaith", "Nikah"],
    defaultWidth: 1500,
    defaultHeight: 2100,
  },
  thank_you: {
    title: "Thank You Cards",
    subtitle: "Send with love — bilingual dhanyavaad to minimalist two-word cards.",
    categories: ["All", "Post-wedding", "Vendor thank-you", "Bridal shower"],
    defaultWidth: 1240,
    defaultHeight: 1748,
  },
  table_number: {
    title: "Table Numbers",
    subtitle: "Numbered or named — heritage frames to Art Deco serifs.",
    categories: ["All", "Reception", "Sangeet", "Brunch"],
    defaultWidth: 1200,
    defaultHeight: 1800,
  },
  ig_story: {
    title: "Instagram Stories",
    subtitle: "9:16 announcements and countdowns, ready to drop into your story.",
    categories: ["All", "Save the Date", "Countdown", "RSVP reminder", "Thank you"],
    defaultWidth: 1080,
    defaultHeight: 1920,
  },
  ig_post: {
    title: "Instagram Posts",
    subtitle: "Square feed announcements — engagements, weddings, reception reveals.",
    categories: ["All", "Engagement", "Save the Date", "Wedding", "Reception"],
    defaultWidth: 1080,
    defaultHeight: 1080,
  },
  whatsapp_invite: {
    title: "WhatsApp Invites",
    subtitle: "Square-format e-invites optimised for WhatsApp broadcast lists.",
    categories: ["All", "Wedding", "Nikah", "Mehndi", "Sangeet"],
    defaultWidth: 800,
    defaultHeight: 800,
  },
  video_invite: {
    title: "Video Invites",
    subtitle: "Animated save-the-dates that open with a cinematic reveal.",
    categories: ["All", "Wedding", "Save the Date", "Reception"],
    defaultWidth: 1920,
    defaultHeight: 1080,
  },
  rsvp_card: {
    title: "RSVP Cards",
    subtitle: "Printed reply cards with meal preference and guest count.",
    categories: ["All", "Wedding", "Reception", "Rehearsal dinner"],
    defaultWidth: 1240,
    defaultHeight: 1748,
  },
  monogram: {
    title: "Monograms",
    subtitle: "Your initials, framed for print and digital use.",
    categories: ["All", "Classic", "Arched", "Framed", "Circular"],
    defaultWidth: 1500,
    defaultHeight: 1500,
  },
  wedding_logo: {
    title: "Wedding Logos",
    subtitle: "Full-names wordmarks — couture for websites, signage, and stationery.",
    categories: ["All", "Script", "Editorial", "Deco", "Display"],
    defaultWidth: 2400,
    defaultHeight: 1200,
  },
  outfit_guide: {
    title: "Outfit Style Guides",
    subtitle: "Share palette + dress code for each event with your wedding party.",
    categories: ["All", "Mehendi", "Sangeet", "Haldi", "Ceremony", "Reception"],
    defaultWidth: 2480,
    defaultHeight: 3508,
  },
};

export const CULTURAL_STYLES = [
  { id: "all",          label: "All cultures" },
  { id: "hindu_north",  label: "Hindu (North)" },
  { id: "hindu_south",  label: "Hindu (South)" },
  { id: "sikh",         label: "Sikh" },
  { id: "muslim",       label: "Muslim" },
  { id: "christian",    label: "Christian" },
  { id: "fusion",       label: "Fusion" },
];

export const REGIONAL_STYLES = [
  { id: "all",        label: "All regions" },
  { id: "gujarati",   label: "Gujarati" },
  { id: "punjabi",    label: "Punjabi" },
  { id: "bengali",    label: "Bengali" },
  { id: "tamil",      label: "Tamil" },
  { id: "rajasthani", label: "Rajasthani" },
  { id: "malayali",   label: "Malayali" },
  { id: "marathi",    label: "Marathi" },
  { id: "kashmiri",   label: "Kashmiri" },
];

export const SORT_OPTIONS = [
  { id: "trending",  label: "Trending" },
  { id: "newest",    label: "Newest" },
  { id: "popular",   label: "Most popular" },
  { id: "price_asc", label: "Price · Low to high" },
  { id: "price_desc",label: "Price · High to low" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["id"];

export const PRICE_FILTERS = [
  { id: "all",     label: "All" },
  { id: "free",    label: "Free" },
  { id: "under2",  label: "Under $2" },
  { id: "under3",  label: "Under $3" },
] as const;

export type PriceFilterId = (typeof PRICE_FILTERS)[number]["id"];

// All surfaces a marketplace page can route to — used for generateStaticParams.
export const ROUTABLE_SURFACES: SurfaceType[] = [
  "invitation",
  "save_the_date",
  "menu",
  "welcome_sign",
  "seating_chart",
  "ceremony_program",
  "thank_you",
  "table_number",
  "ig_story",
  "ig_post",
  "whatsapp_invite",
  "video_invite",
  "rsvp_card",
  "monogram",
  "wedding_logo",
  "outfit_guide",
];
