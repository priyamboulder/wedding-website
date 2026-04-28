"use client";

// ═══════════════════════════════════════════════════════════════════════════════════
//   STUDIO — Ananya's unified creative hub for wedding brand & public surfaces
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Couples design their wedding's visual identity here and see it cascade into
//   every public-facing surface: website, invitations, print & signage. The Brand
//   Kit is the source of truth; every other sub-section pulls from it by default,
//   with the ability to override per-design.
//
//   ───────────────────────────────────────────────────────────────────────────
//   Supabase-ready schema sketch (all tables scoped by wedding_id)
//   ───────────────────────────────────────────────────────────────────────────
//
//   brand_systems (
//     id uuid pk, wedding_id uuid fk, name text,
//     monogram jsonb,              -- { initials, style, glyph, svg_url }
//     palette jsonb,               -- { primary, secondary, accent, ink, ivory, gold }
//     typography jsonb,            -- { display_font, body_font, mono_font, pairing }
//     motifs jsonb,                -- [{ id, name, svg, category }]
//     completion_pct int,
//     updated_at, created_at
//   )
//
//   studio_designs (
//     id uuid pk, wedding_id uuid fk, kind text,                -- website | invitation | print
//     sub_kind text,                                            -- hero | save-the-date | menu | ...
//     event_id uuid null,                                       -- engagement | sangeet | ...
//     template_id text,                                         -- references template catalogue
//     brand_system_id uuid fk,                                  -- source of truth
//     overrides jsonb,                                          -- per-design brand overrides
//     content jsonb,                                            -- design-specific copy/content
//     status text,                                              -- draft | review | finalized
//     current_version_id uuid fk null,
//     created_at, updated_at
//   )
//
//   design_versions (
//     id uuid pk, design_id uuid fk, snapshot jsonb,
//     author text, note text, created_at
//   )
//
//   design_collaborators (
//     id uuid pk, design_id uuid fk, actor_name text,
//     role text,                                                -- partner | family | planner
//     access text,                                              -- view | comment | edit
//     invited_at
//   )
//
//   design_comments (
//     id uuid pk, design_id uuid fk, version_id uuid fk null,
//     author text, body text, resolved bool, created_at
//   )
//
//   studio_assets (
//     id uuid pk, wedding_id uuid fk, kind text,                -- photo | graphic | ai_image
//     url text, prompt text null, tags text[], created_at
//   )
//
//   Persistence: while Ananya has no backend, everything below lives in
//   localStorage keyed by wedding_id (matching the checklist + vendors modules).
//   Keys used: ananya:studio:<weddingId>:brand, :designs, :assets, :versions.
// ═══════════════════════════════════════════════════════════════════════════════════

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import NextLink from "next/link";
import { TopNav } from "@/components/shell/TopNav";
import {
  Sparkles,
  Palette,
  Type as TypeIcon,
  Globe,
  Mail,
  Printer,
  Home,
  Image as ImageIcon,
  Upload,
  Download,
  Share2,
  History,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Plus,
  Eye,
  Edit3,
  Copy,
  Wand2,
  Crown,
  Flower2,
  Settings,
  Circle,
  CircleDot,
  ArrowRight,
  FileText,
  MapPin,
  Heart,
  BookOpen,
  Newspaper,
  MousePointer2,
  Layers,
  Paintbrush,
  Languages,
  Save,
  SlidersHorizontal,
  Lock,
  Unlock,
  ShoppingBag,
  ListChecks,
  Users,
  UserPlus,
  LayoutGrid,
  FileCheck2,
  Share as ShareIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChecklistStore } from "@/stores/checklist-store";
import { useAuthStore } from "@/stores/auth-store";
import { deriveCoupleIdentity } from "@/lib/couple-identity";
import { MonogramGallery } from "@/components/monograms/MonogramGallery";
import { MONOGRAM_COMPONENTS, MONOGRAM_TEMPLATES } from "@/components/monograms/templates";
import { LogoGallery } from "@/components/logos/LogoGallery";
import { LOGO_TEMPLATES } from "@/components/logos/templates";
import type { MonogramProps } from "@/types/monogram";
import { useMonogramRenderData } from "@/lib/useBrandRenderData";
import TemplateGallery from "@/components/studio/TemplateGallery";
import { TEMPLATES as WEBSITE_CATALOG } from "@/components/studio/template-catalog";
import type { WebsiteTemplate as CatalogTemplate } from "@/components/studio/template-catalog";

// ═══════════════════════════════════════════════════════════════════════════════════
//   Types
// ═══════════════════════════════════════════════════════════════════════════════════

type StudioSection = "home" | "monogram" | "logo" | "style" | "website" | "invitations" | "print" | "style-guide";

// Derived snapshot of the couple's monogram — initials come from the wedding
// profile, accent color is the palette's gold. Templates are chosen in the
// Monogram surface; the piece-by-piece configurator is gone.
type Monogram = {
  initials: string;           // "P&A"
  accent: string;             // hex
};

type ColorPalette = {
  id: string;
  name: string;
  swatches: { label: string; hex: string; role: "primary" | "secondary" | "accent" | "ink" | "ivory" | "gold" }[];
};

type TypographyPair = {
  id: string;
  name: string;
  display: string;            // CSS font-family for headings
  body: string;               // CSS font-family for body
  mood: string;
};

type Motif = {
  id: string;
  name: string;
  category: "paisley" | "floral" | "mandala" | "geometric" | "peacock";
  emoji: string;              // stand-in glyph for demo
  selected: boolean;
};

type BrandSystem = {
  monogram: Monogram;                         // derived snapshot (initials + accent)
  monogramTemplateId: string | null;          // FK into monogram_templates
  logoTemplateId: string | null;              // FK into logo_templates
  brandAutoApplied: boolean;                  // cascades across website/invitations/print
  palette: ColorPalette;
  typography: TypographyPair;
  motifs: Motif[];
};

type DesignStatus = "not_started" | "draft" | "in_review" | "finalized";

type WebsiteTemplate = {
  id: string;
  name: string;
  aesthetic: string;          // "Royal Rajasthani"
  description: string;
  coverHue: string;           // CSS gradient hint
  accentHex: string;
  sections: string[];
  pairing: "serif-script" | "serif-sans" | "display-sans" | "devanagari";
};

type InvitationEventKind =
  | "save-the-date"
  | "engagement"
  | "mehndi"
  | "sangeet"
  | "wedding"
  | "reception";

type InvitationTemplate = {
  id: string;
  name: string;
  event: InvitationEventKind;
  format: "digital" | "print" | "whatsapp" | "all";
  style: string;
  accentHex: string;
  thumbHue: string;
  languages: ("English" | "Hindi" | "Gujarati" | "Sanskrit" | "Tamil")[];
};

type PrintKind =
  | "menu"
  | "welcome-sign"
  | "seating-chart"
  | "table-number"
  | "ceremony-program"
  | "thank-you";

type PrintTemplate = {
  id: string;
  name: string;
  kind: PrintKind;
  orientation: "portrait" | "landscape" | "square";
  description: string;
  accentHex: string;
};

type StudioDesign = {
  id: string;
  kind: "website" | "invitation" | "print" | "style-guide";
  title: string;
  templateId: string;
  status: DesignStatus;
  updatedAt: string;           // ISO
  author: string;
  brandApplied: boolean;
  versionCount: number;
  collaborators: string[];
  event?: InvitationEventKind;
  // Style Guide specifics — only populated when kind === "style-guide"
  guide?: StyleGuide;
};

// ───── Style Guide (Outfit) types ─────
type StyleGuideEvent =
  | "mehendi"
  | "sangeet"
  | "haldi"
  | "ceremony"
  | "reception"
  | "welcome-dinner";

type StyleGuideGuestGroup = "women" | "men" | "kids";

type StyleGuideOutfit = {
  group: StyleGuideGuestGroup;
  mode: "palette" | "garment" | "dress-code";
  garmentHint?: string;   // e.g. "Lehenga or Anarkali"
  dressCode?: string;     // e.g. "Festive Indian"
  note?: string;          // free-form guidance
};

type StyleGuideTheme = {
  id: string;
  name: string;
  vibe: string[];
  fabrics: string[];
  avoid: string[];
  inspiration: string;
};

type StyleGuideEntry = {
  event: StyleGuideEvent;
  themeId: string | null;
  outfits: StyleGuideOutfit[];
};

type StyleGuide = {
  entries: StyleGuideEntry[];
};

type Version = {
  id: string;
  designId: string;
  label: string;
  author: string;
  note: string;
  createdAt: string;
};

type Comment = {
  id: string;
  designId: string;
  author: string;
  body: string;
  createdAt: string;
  resolved: boolean;
};

type Asset = {
  id: string;
  name: string;
  kind: "photo" | "graphic" | "ai_image";
  tags: string[];
  hue: string;                 // placeholder visual
};

// ═══════════════════════════════════════════════════════════════════════════════════
//   Couple + sample data
// ═══════════════════════════════════════════════════════════════════════════════════

// Couple identity (person1/person2) is resolved from auth-store at access
// time so the logged-in couple's names flow into every surface. Non-identity
// fields (hashtag, date, venue) remain demo defaults for now.
function liveCoupleIdentity() {
  const u = useAuthStore.getState().user;
  return deriveCoupleIdentity(u?.name, u?.wedding?.partnerName);
}

const COUPLE = {
  hashtag: "#PriyaMeetsArjun",
  weddingDate: "2026-11-14",
  venuePrimary: "Umaid Bhawan Palace, Jodhpur",
  get person1() {
    return liveCoupleIdentity().person1;
  },
  get person2() {
    return liveCoupleIdentity().person2;
  },
};

const PALETTES: ColorPalette[] = [
  {
    id: "rajwara-rose",
    name: "Rajwara Rose",
    swatches: [
      { label: "Deep Obsidian",   hex: "#1A1A1A", role: "ink" },
      { label: "Temple Ivory",    hex: "#FBF9F4", role: "ivory" },
      { label: "Royal Marigold",  hex: "#D4A24C", role: "primary" },
      { label: "Dusk Rose",       hex: "#C97B63", role: "secondary" },
      { label: "Burnished Gold",  hex: "#B8860B", role: "gold" },
      { label: "Peacock Jade",    hex: "#2F5D50", role: "accent" },
    ],
  },
  {
    id: "jasmine-dawn",
    name: "Jasmine Dawn",
    swatches: [
      { label: "Charcoal",        hex: "#2E2E2E", role: "ink" },
      { label: "Jasmine White",   hex: "#FFFCF5", role: "ivory" },
      { label: "Soft Saffron",    hex: "#E8B860", role: "primary" },
      { label: "Petal Blush",     hex: "#E8C4B8", role: "secondary" },
      { label: "Antique Gold",    hex: "#C9A24A", role: "gold" },
      { label: "Sage Verdure",    hex: "#9CAF88", role: "accent" },
    ],
  },
  {
    id: "midnight-mehndi",
    name: "Midnight Mehndi",
    swatches: [
      { label: "Ink Noir",        hex: "#0E0E14", role: "ink" },
      { label: "Champagne Mist",  hex: "#F4EFE4", role: "ivory" },
      { label: "Mehndi Copper",   hex: "#B96A3F", role: "primary" },
      { label: "Kumkum Red",      hex: "#9E2B25", role: "secondary" },
      { label: "Hammered Gold",   hex: "#A37A2E", role: "gold" },
      { label: "Neelam Blue",     hex: "#2B3A67", role: "accent" },
    ],
  },
  {
    id: "monsoon-emerald",
    name: "Monsoon Emerald",
    swatches: [
      { label: "Deep Ink",        hex: "#141414", role: "ink" },
      { label: "Pearl Ivory",     hex: "#F9F6EE", role: "ivory" },
      { label: "Emerald Forest",  hex: "#1F5E4B", role: "primary" },
      { label: "Lotus Pink",      hex: "#D49ABF", role: "secondary" },
      { label: "Champagne Gold",  hex: "#C9A659", role: "gold" },
      { label: "Moonstone Cream", hex: "#EADDC5", role: "accent" },
    ],
  },
];

const TYPOGRAPHY_PAIRS: TypographyPair[] = [
  {
    id: "fraunces-inter",
    name: "Editorial House",
    display: "'Fraunces', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    mood: "The Ananya signature — confident editorial serif with a precise sans.",
  },
  {
    id: "playfair-dmsans",
    name: "Playfair Reverie",
    display: "'Playfair Display', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
    mood: "High-contrast didone with a modern geometric companion.",
  },
  {
    id: "cormorant-josefin",
    name: "Cormorant Bloom",
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Josefin Sans', system-ui, sans-serif",
    mood: "Delicate, romantic, old-world type for intimate ceremonies.",
  },
  {
    id: "cinzel-libre",
    name: "Cinzel Monument",
    display: "'Cinzel', 'Trajan Pro', serif",
    body: "'Libre Baskerville', Georgia, serif",
    mood: "Carved-in-stone grandeur — palace weddings and Rajasthani forts.",
  },
  {
    id: "greatvibes-inter",
    name: "Script & Steel",
    display: "'Great Vibes', 'Brush Script MT', cursive",
    body: "'Inter', system-ui, sans-serif",
    mood: "Flowing calligraphy paired with restrained sans — save-the-dates.",
  },
  {
    id: "devanagari-fraunces",
    name: "Devanagari Heritage",
    display: "'Noto Serif Devanagari', 'Fraunces', serif",
    body: "'Inter', system-ui, sans-serif",
    mood: "Bilingual type for couples weaving Hindi into their branding.",
  },
];

const DEFAULT_MOTIFS: Motif[] = [
  { id: "paisley-classic",   name: "Classic Paisley",     category: "paisley",   emoji: "🪷", selected: true  },
  { id: "mandala-lotus",     name: "Lotus Mandala",       category: "mandala",   emoji: "❋",  selected: true  },
  { id: "floral-marigold",   name: "Marigold Garland",    category: "floral",    emoji: "✿",  selected: false },
  { id: "peacock-plume",     name: "Peacock Plume",       category: "peacock",   emoji: "❦",  selected: true  },
  { id: "geometric-jaali",   name: "Jaali Lattice",       category: "geometric", emoji: "❖",  selected: false },
  { id: "paisley-buta",      name: "Buta Motif",          category: "paisley",   emoji: "☙",  selected: false },
  { id: "mandala-sun",       name: "Suryamukhi Mandala",  category: "mandala",   emoji: "❉",  selected: false },
  { id: "floral-jasmine",    name: "Jasmine Vine",        category: "floral",    emoji: "❀",  selected: true  },
];

function makeInitialBrand(): BrandSystem {
  const couple = liveCoupleIdentity();
  return {
    monogram: {
      initials: `${couple.person1[0]}&${couple.person2[0]}`,
      accent: "#B8860B",
    },
    monogramTemplateId: null,
    logoTemplateId: null,
    brandAutoApplied: true,
    palette: PALETTES[0],
    typography: TYPOGRAPHY_PAIRS[0],
    motifs: DEFAULT_MOTIFS,
  };
}

const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    id: "royal-rajasthani",
    name: "Royal Rajasthani",
    aesthetic: "Palace",
    description: "Jharokha arches, hand-painted motifs, deep ink backdrops with marigold accents.",
    coverHue: "linear-gradient(135deg, #2E1810 0%, #B8860B 100%)",
    accentHex: "#B8860B",
    sections: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    pairing: "serif-script",
  },
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    aesthetic: "Editorial",
    description: "Generous whitespace, a single serif title, functional density. Restraint as luxury.",
    coverHue: "linear-gradient(135deg, #FBF9F4 0%, #EDE7D9 100%)",
    accentHex: "#1A1A1A",
    sections: ["Hero", "Story", "Events", "RSVP", "Registry"],
    pairing: "serif-sans",
  },
  {
    id: "tropical-goa",
    name: "Tropical Goa",
    aesthetic: "Coastal",
    description: "Palm shadows, turquoise washes, sunset gradients. Beachside mandap energy.",
    coverHue: "linear-gradient(135deg, #1F5E4B 0%, #E8C4B8 100%)",
    accentHex: "#1F5E4B",
    sections: ["Hero", "Story", "Events", "Stay", "Travel", "RSVP", "Gallery"],
    pairing: "display-sans",
  },
  {
    id: "classic-ivory",
    name: "Classic Ivory",
    aesthetic: "Heirloom",
    description: "Cream, gold foil, copperplate script. A timeless wedding invitation in web form.",
    coverHue: "linear-gradient(135deg, #F5F1E8 0%, #C9A659 100%)",
    accentHex: "#C9A659",
    sections: ["Hero", "Story", "Events", "Travel", "RSVP", "Registry", "Gallery"],
    pairing: "serif-script",
  },
  {
    id: "sabyasachi-noir",
    name: "Sabyasachi Noir",
    aesthetic: "Couture",
    description: "Onyx, emerald and antique gold. Heavy serif display, portrait-first layouts.",
    coverHue: "linear-gradient(135deg, #0E0E14 0%, #1F5E4B 100%)",
    accentHex: "#C9A659",
    sections: ["Portrait", "Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    pairing: "serif-sans",
  },
  {
    id: "monsoon-garden",
    name: "Monsoon Garden",
    aesthetic: "Botanical",
    description: "Rain-fresh greens, jasmine whites, pressed-flower illustrations.",
    coverHue: "linear-gradient(135deg, #2F5D50 0%, #E8F0E0 100%)",
    accentHex: "#2F5D50",
    sections: ["Hero", "Story", "Events", "Travel", "RSVP", "Gallery"],
    pairing: "serif-sans",
  },
  {
    id: "devanagari-heritage",
    name: "Devanagari Heritage",
    aesthetic: "Bilingual",
    description: "English and Devanagari typography in conversation. Temple-ink palette.",
    coverHue: "linear-gradient(135deg, #9E2B25 0%, #F4EFE4 100%)",
    accentHex: "#9E2B25",
    sections: ["Hero", "Kathā", "Events", "Travel", "RSVP", "Gallery"],
    pairing: "devanagari",
  },
  {
    id: "champagne-script",
    name: "Champagne Script",
    aesthetic: "Romance",
    description: "Flowing script first letter, champagne washes, soft-focus photography.",
    coverHue: "linear-gradient(135deg, #EADDC5 0%, #F0E4C8 100%)",
    accentHex: "#B8860B",
    sections: ["Hero", "Love Story", "Events", "Travel", "RSVP", "Gallery"],
    pairing: "serif-script",
  },
  {
    id: "mehndi-midnight",
    name: "Mehndi Midnight",
    aesthetic: "Artisanal",
    description: "Henna linework illustrations on midnight paper. Hand-drawn feel.",
    coverHue: "linear-gradient(135deg, #2B3A67 0%, #B96A3F 100%)",
    accentHex: "#B96A3F",
    sections: ["Hero", "Story", "Events", "Travel", "RSVP", "Gallery"],
    pairing: "serif-script",
  },
  {
    id: "dune-amber",
    name: "Dune Amber",
    aesthetic: "Desert",
    description: "Sand tones, amber accents, wide landscape photography. Destination-first storytelling.",
    coverHue: "linear-gradient(135deg, #C9A659 0%, #2E1810 100%)",
    accentHex: "#C9A659",
    sections: ["Hero", "Destination", "Events", "Travel", "Stay", "RSVP", "Gallery"],
    pairing: "serif-sans",
  },
];

const INVITATION_TEMPLATES: InvitationTemplate[] = [
  { id: "std-01", name: "Marigold Announcement",   event: "save-the-date", format: "digital",  style: "Floral",     accentHex: "#D4A24C", thumbHue: "linear-gradient(135deg,#FBF9F4,#F0E4C8)", languages: ["English"] },
  { id: "std-02", name: "Script & Seal",            event: "save-the-date", format: "digital",  style: "Script",     accentHex: "#B8860B", thumbHue: "linear-gradient(135deg,#F5F1E8,#C9A659)", languages: ["English"] },
  { id: "std-03", name: "Devanagari Dawn",          event: "save-the-date", format: "whatsapp", style: "Bilingual",  accentHex: "#9E2B25", thumbHue: "linear-gradient(135deg,#F4EFE4,#DDA08A)", languages: ["English","Hindi"] },

  { id: "eng-01", name: "Ring Ceremony Obsidian",   event: "engagement",    format: "print",    style: "Editorial",  accentHex: "#1A1A1A", thumbHue: "linear-gradient(135deg,#1A1A1A,#B8860B)", languages: ["English","Hindi"] },
  { id: "eng-02", name: "Rose Gold Roka",           event: "engagement",    format: "all",      style: "Floral",     accentHex: "#C97B63", thumbHue: "linear-gradient(135deg,#F5E0D6,#DDA08A)", languages: ["English","Gujarati"] },

  { id: "meh-01", name: "Henna Vines",              event: "mehndi",        format: "print",    style: "Illustrative", accentHex: "#B96A3F", thumbHue: "linear-gradient(135deg,#F0E4C8,#B96A3F)", languages: ["English","Hindi"] },
  { id: "meh-02", name: "Turmeric & Marigold",      event: "mehndi",        format: "digital",  style: "Floral",       accentHex: "#D4A24C", thumbHue: "linear-gradient(135deg,#F5E6C8,#D4A24C)", languages: ["English"] },

  { id: "sng-01", name: "Sangeet Neon Noir",        event: "sangeet",       format: "digital",  style: "Modern",     accentHex: "#2B3A67", thumbHue: "linear-gradient(135deg,#0E0E14,#D49ABF)", languages: ["English","Hindi"] },
  { id: "sng-02", name: "Dholki Night",             event: "sangeet",       format: "whatsapp", style: "Playful",    accentHex: "#D49ABF", thumbHue: "linear-gradient(135deg,#F5E6C8,#D49ABF)", languages: ["English"] },

  { id: "wed-01", name: "Palace Ivory",             event: "wedding",       format: "print",    style: "Heirloom",   accentHex: "#C9A659", thumbHue: "linear-gradient(135deg,#F5F1E8,#C9A659)", languages: ["English","Hindi","Sanskrit"] },
  { id: "wed-02", name: "Sabyasachi Noir",          event: "wedding",       format: "print",    style: "Couture",    accentHex: "#1F5E4B", thumbHue: "linear-gradient(135deg,#0E0E14,#1F5E4B)", languages: ["English","Hindi"] },
  { id: "wed-03", name: "Temple Script",            event: "wedding",       format: "all",      style: "Script",     accentHex: "#9E2B25", thumbHue: "linear-gradient(135deg,#F4EFE4,#9E2B25)", languages: ["English","Hindi","Tamil"] },

  { id: "rec-01", name: "Champagne Reception",      event: "reception",     format: "digital",  style: "Modern",     accentHex: "#B8860B", thumbHue: "linear-gradient(135deg,#EADDC5,#B8860B)", languages: ["English"] },
  { id: "rec-02", name: "Midnight Gala",            event: "reception",     format: "print",    style: "Editorial",  accentHex: "#0E0E14", thumbHue: "linear-gradient(135deg,#0E0E14,#C9A659)", languages: ["English"] },
];

const PRINT_TEMPLATES: PrintTemplate[] = [
  { id: "menu-01",  name: "Tasting Card",          kind: "menu",             orientation: "portrait",  description: "Single-column menu, serif display, illustrated divider.",  accentHex: "#B8860B" },
  { id: "menu-02",  name: "Thali Menu",            kind: "menu",             orientation: "square",    description: "Course-by-course with small motif per course.",           accentHex: "#D4A24C" },
  { id: "wel-01",   name: "Welcome Arch",          kind: "welcome-sign",     orientation: "portrait",  description: "Monogram top, couple's names large serif, event + date below.", accentHex: "#1A1A1A" },
  { id: "wel-02",   name: "Svagatam Mirror",       kind: "welcome-sign",     orientation: "portrait",  description: "Bilingual Hindi + English welcome on mirror-style card.",   accentHex: "#9E2B25" },
  { id: "seat-01",  name: "Grand Seating Board",   kind: "seating-chart",    orientation: "landscape", description: "Alphabetical by guest, grouped by table, monogram header.", accentHex: "#C9A659" },
  { id: "seat-02",  name: "Garden Seating",        kind: "seating-chart",    orientation: "landscape", description: "By-table layout with botanical motifs around each block.",  accentHex: "#2F5D50" },
  { id: "tab-01",   name: "Table No. Classic",     kind: "table-number",     orientation: "portrait",  description: "Roman numerals, serif display, small motif beneath.",       accentHex: "#B8860B" },
  { id: "tab-02",   name: "Table No. Botanical",   kind: "table-number",     orientation: "portrait",  description: "Pressed-flower illustrations with number in script.",       accentHex: "#9CAF88" },
  { id: "prog-01",  name: "Ceremony Order",        kind: "ceremony-program", orientation: "portrait",  description: "Ritual by ritual with Sanskrit + English explanation.",     accentHex: "#9E2B25" },
  { id: "prog-02",  name: "Phere Guide",           kind: "ceremony-program", orientation: "portrait",  description: "Illustrated walk-through of the seven vows for guests.",    accentHex: "#B8860B" },
  { id: "thx-01",   name: "Dhanyavaad Card",       kind: "thank-you",        orientation: "square",    description: "Bilingual thank-you, monogram back, photo front.",          accentHex: "#D4A24C" },
  { id: "thx-02",   name: "Gratitude Fold",        kind: "thank-you",        orientation: "portrait",  description: "Folded card, monogram seal, hand-written space.",           accentHex: "#1A1A1A" },
];

const SAMPLE_DESIGNS: StudioDesign[] = [
  {
    id: "des-web-01",
    kind: "website",
    title: "priyaandarjun.com",
    templateId: "royal-rajasthani",
    status: "draft",
    updatedAt: "2026-04-14T10:12:00Z",
    author: "Priya",
    brandApplied: true,
    versionCount: 7,
    collaborators: ["Arjun", "Neha (planner)"],
  },
  {
    id: "des-inv-01",
    kind: "invitation",
    title: "Save-the-Date — Marigold Announcement",
    templateId: "std-01",
    status: "finalized",
    updatedAt: "2026-02-28T16:40:00Z",
    author: "Priya",
    brandApplied: true,
    versionCount: 4,
    collaborators: ["Arjun"],
    event: "save-the-date",
  },
  {
    id: "des-inv-02",
    kind: "invitation",
    title: "Wedding Invitation — Palace Ivory",
    templateId: "wed-01",
    status: "in_review",
    updatedAt: "2026-04-11T09:22:00Z",
    author: "Arjun",
    brandApplied: true,
    versionCount: 12,
    collaborators: ["Priya", "Meera Aunty", "Neha (planner)"],
    event: "wedding",
  },
  {
    id: "des-inv-03",
    kind: "invitation",
    title: "Sangeet Invite — Dholki Night",
    templateId: "sng-02",
    status: "draft",
    updatedAt: "2026-04-05T20:15:00Z",
    author: "Priya",
    brandApplied: false,
    versionCount: 2,
    collaborators: ["Arjun"],
    event: "sangeet",
  },
  {
    id: "des-pr-01",
    kind: "print",
    title: "Welcome Sign — Jodhpur Arrival",
    templateId: "wel-01",
    status: "draft",
    updatedAt: "2026-04-09T12:04:00Z",
    author: "Arjun",
    brandApplied: true,
    versionCount: 3,
    collaborators: ["Neha (planner)"],
  },
  {
    id: "des-pr-02",
    kind: "print",
    title: "Thali Menu — Reception",
    templateId: "menu-02",
    status: "draft",
    updatedAt: "2026-04-01T18:00:00Z",
    author: "Priya",
    brandApplied: true,
    versionCount: 5,
    collaborators: ["Chef Rakesh"],
  },
];

const SAMPLE_VERSIONS: Version[] = [
  { id: "v7", designId: "des-web-01", label: "v7 — Refined hero copy",      author: "Priya", note: "Softened the opening line, swapped hero photo.", createdAt: "2026-04-14T10:12:00Z" },
  { id: "v6", designId: "des-web-01", label: "v6 — Added travel section",    author: "Arjun", note: "Added Jodhpur & Udaipur guide pages.",           createdAt: "2026-04-10T08:02:00Z" },
  { id: "v5", designId: "des-web-01", label: "v5 — Applied brand",           author: "Priya", note: "Rajwara Rose palette applied across pages.",     createdAt: "2026-04-02T15:44:00Z" },
  { id: "v4", designId: "des-inv-02", label: "v4 — Meera Aunty edits",       author: "Priya", note: "Incorporated grandmother-approved phrasing.",    createdAt: "2026-04-09T21:12:00Z" },
  { id: "v3", designId: "des-inv-02", label: "v3 — Sanskrit blessing added", author: "Arjun", note: "Opening Sanskrit invocation.",                   createdAt: "2026-04-07T14:02:00Z" },
];

const SAMPLE_COMMENTS: Comment[] = [
  { id: "c1", designId: "des-inv-02", author: "Meera Aunty",       body: "Please use 'शुभ विवाह' above the names.",        createdAt: "2026-04-10T09:12:00Z", resolved: false },
  { id: "c2", designId: "des-inv-02", author: "Neha (planner)",    body: "Print vendor wants bleed added to the PDF export.", createdAt: "2026-04-11T08:22:00Z", resolved: false },
  { id: "c3", designId: "des-web-01", author: "Arjun",             body: "Swap the second hero for the Jag Mandir photo.",     createdAt: "2026-04-13T20:00:00Z", resolved: true  },
];

const SAMPLE_ASSETS: Asset[] = [
  { id: "a1", name: "Jag Mandir — golden hour", kind: "photo",    tags: ["hero", "udaipur"],       hue: "linear-gradient(135deg,#D4A24C,#9E2B25)" },
  { id: "a2", name: "Engagement — rooftop",     kind: "photo",    tags: ["engagement", "portrait"], hue: "linear-gradient(135deg,#C97B63,#F5E0D6)" },
  { id: "a3", name: "Mehndi illustration pack", kind: "graphic",  tags: ["motif", "mehndi"],       hue: "linear-gradient(135deg,#B96A3F,#F0E4C8)" },
  { id: "a4", name: "Marigold border v2",       kind: "graphic",  tags: ["border", "floral"],      hue: "linear-gradient(135deg,#D4A24C,#FBF9F4)" },
  { id: "a5", name: "AI — Palace at dusk",      kind: "ai_image", tags: ["ai", "hero"],            hue: "linear-gradient(135deg,#2E1810,#B8860B)" },
  { id: "a6", name: "AI — Floral monogram ref", kind: "ai_image", tags: ["ai", "monogram"],        hue: "linear-gradient(135deg,#F5F1E8,#C9A659)" },
  { id: "a7", name: "Family portrait — Diwali", kind: "photo",    tags: ["family"],                hue: "linear-gradient(135deg,#9E2B25,#F4EFE4)" },
  { id: "a8", name: "Peacock pattern tile",     kind: "graphic",  tags: ["motif", "peacock"],      hue: "linear-gradient(135deg,#1F5E4B,#C9A659)" },
];

// ═══════════════════════════════════════════════════════════════════════════════════
//   Helpers
// ═══════════════════════════════════════════════════════════════════════════════════

const STATUS_META: Record<DesignStatus, { label: string; dot: string; text: string }> = {
  not_started: { label: "Not started", dot: "bg-ink-faint",             text: "text-ink-muted" },
  draft:       { label: "Draft",       dot: "bg-saffron",               text: "text-ink-soft" },
  in_review:   { label: "In review",   dot: "bg-rose",                  text: "text-ink-soft" },
  finalized:   { label: "Finalized",   dot: "bg-sage",                  text: "text-ink-soft" },
};

const EVENT_META: Record<InvitationEventKind, { label: string; emoji: string }> = {
  "save-the-date": { label: "Save the Date", emoji: "✦" },
  engagement:      { label: "Engagement",     emoji: "❁" },
  mehndi:          { label: "Mehndi",         emoji: "❋" },
  sangeet:         { label: "Sangeet",        emoji: "❉" },
  wedding:         { label: "Wedding",        emoji: "❦" },
  reception:       { label: "Reception",      emoji: "✶" },
};

// Sidebar surface key → design_templates.surface_type for the Browse-library
// icon rendered on each sidebar row. Returns null for surfaces that have an
// inline picker (Monogram / Wedding Logo) or that aren't template-driven
// (Style / Website / Outfit Style Guide).
function sidebarKeyToMarketplaceSurface(key: StudioSection): string | null {
  if (key === "invitations") return "invitation";
  if (key === "print")       return "menu";
  return null;
}

// PrintKind → design_templates.surface_type mapping, used to deep-link from
// the Print & Signage view into the per-surface marketplace at /studio/[surface]/templates.
function printKindToSurface(kind: PrintKind | "all"): string {
  if (kind === "all") return "menu";
  if (kind === "welcome-sign")     return "welcome_sign";
  if (kind === "seating-chart")    return "seating_chart";
  if (kind === "table-number")     return "table_number";
  if (kind === "ceremony-program") return "ceremony_program";
  if (kind === "thank-you")        return "thank_you";
  return kind; // "menu"
}

const PRINT_META: Record<PrintKind, { label: string; icon: typeof FileText }> = {
  menu:               { label: "Menus",             icon: FileText },
  "welcome-sign":     { label: "Welcome signs",     icon: MapPin },
  "seating-chart":    { label: "Seating charts",    icon: Layers },
  "table-number":     { label: "Table numbers",     icon: Circle },
  "ceremony-program": { label: "Ceremony programs", icon: BookOpen },
  "thank-you":        { label: "Thank-you cards",   icon: Heart },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk ago`;
  return formatDate(iso);
}

function sectionCompletion(designs: StudioDesign[], kind: StudioDesign["kind"]): number {
  const subset = designs.filter((d) => d.kind === kind);
  if (subset.length === 0) return 0;
  const score = subset.reduce((acc, d) => {
    if (d.status === "finalized") return acc + 1;
    if (d.status === "in_review") return acc + 0.7;
    if (d.status === "draft")     return acc + 0.35;
    return acc;
  }, 0);
  return Math.round((score / Math.max(subset.length, kind === "invitation" ? 5 : kind === "print" ? 6 : 1)) * 100);
}

function monogramCompletion(brand: BrandSystem): number {
  return brand.monogramTemplateId ? 100 : 0;
}

function logoCompletion(brand: BrandSystem): number {
  return brand.logoTemplateId ? 100 : 0;
}

function styleCompletion(brand: BrandSystem): number {
  let score = 0;
  if (brand.palette) score += 34;
  if (brand.typography) score += 33;
  if (brand.motifs.filter((m) => m.selected).length >= 2) score += 33;
  return score;
}

function styleGuideCompletion(designs: StudioDesign[]): number {
  const guides = designs.filter((d) => d.kind === "style-guide");
  if (guides.length === 0) return 0;
  let score = 25; // at least one created
  if (guides.some((g) => g.guide?.entries.some((e) => e.themeId))) score += 25;
  if (guides.some((g) => g.guide?.entries.some((e) => e.outfits.length >= 3))) score += 25;
  if (guides.some((g) => g.status === "finalized")) score += 25;
  return score;
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Main page
// ═══════════════════════════════════════════════════════════════════════════════════

const STUDIO_BRAND_KEY = "ananya:studio:brand";
const STUDIO_DESIGNS_KEY = "ananya:studio:designs";

export default function StudioPage() {
  const [section, setSection] = useState<StudioSection>("home");
  const [brand, setBrand] = useState<BrandSystem>(() => {
    if (typeof window === "undefined") return makeInitialBrand();
    try {
      const saved = localStorage.getItem(STUDIO_BRAND_KEY);
      return saved ? (JSON.parse(saved) as BrandSystem) : makeInitialBrand();
    } catch {
      return makeInitialBrand();
    }
  });
  const [designs, setDesigns] = useState<StudioDesign[]>(() => {
    if (typeof window === "undefined") return SAMPLE_DESIGNS;
    try {
      const saved = localStorage.getItem(STUDIO_DESIGNS_KEY);
      return saved ? (JSON.parse(saved) as StudioDesign[]) : SAMPLE_DESIGNS;
    } catch {
      return SAMPLE_DESIGNS;
    }
  });
  const [studioView, setStudioView] = useState<StudioView>("surfaces");
  const [brandKitOpen, setBrandKitOpen] = useState(false);
  const [assetDrawerOpen, setAssetDrawerOpen] = useState(false);
  const [historyDesignId, setHistoryDesignId] = useState<string | null>(null);
  const [shareDesignId, setShareDesignId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STUDIO_BRAND_KEY, JSON.stringify(brand)); } catch {}
  }, [brand]);

  useEffect(() => {
    try { localStorage.setItem(STUDIO_DESIGNS_KEY, JSON.stringify(designs)); } catch {}
  }, [designs]);

  // Couple-level signal comes from the same store checklist uses — keeps the
  // countdown, wedding date and "N/M tasks" identical across every surface.
  const items = useChecklistStore((s) => s.items);
  const weddingDate = useChecklistStore((s) => s.weddingDate);
  const totalItems = items.length;
  const completedItems = items.filter((i) => i.status === "done").length;

  const completion = useMemo(() => ({
    monogram: monogramCompletion(brand),
    logo: logoCompletion(brand),
    style: styleCompletion(brand),
    website: sectionCompletion(designs, "website") || (designs.some((d) => d.kind === "website") ? 35 : 0),
    invitations: sectionCompletion(designs, "invitation"),
    print: sectionCompletion(designs, "print"),
    styleGuide: styleGuideCompletion(designs),
  }), [brand, designs]);

  const overall = Math.round(
    (completion.monogram * 0.10) +
    (completion.logo * 0.07) +
    (completion.style * 0.13) +
    (completion.website * 0.18) +
    (completion.invitations * 0.27) +
    (completion.print * 0.13) +
    (completion.styleGuide * 0.12)
  );

  const onSurfaceSelect = (s: StudioSection) => {
    setStudioView("surfaces");
    setSection(s);
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <TopNav>
        <StudioTopBarActions
          totalItems={totalItems}
          completedItems={completedItems}
          onInviteClick={() => setInviteOpen(true)}
          onNewTaskClick={() => { /* routed on Checklist — no-op here to preserve chrome identity */ }}
        />
      </TopNav>

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          studioView={studioView}
          onStudioViewChange={setStudioView}
          activeSection={section}
          onSurfaceSelect={onSurfaceSelect}
          designs={designs}
          completion={completion}
        />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex flex-1 flex-col overflow-y-auto">
            {section === "home" && (
              <HomeView
                brand={brand}
                designs={designs}
                completion={completion}
                overall={overall}
                onJump={setSection}
                onOpenBrandKit={() => setBrandKitOpen(true)}
                onOpenAssets={() => setAssetDrawerOpen(true)}
              />
            )}
            {section === "monogram" && (
              <MonogramView brand={brand} onChange={setBrand} />
            )}
            {section === "logo" && (
              <LogoView brand={brand} onChange={setBrand} />
            )}
            {section === "style" && (
              <StyleView brand={brand} onChange={setBrand} />
            )}
            {section === "website" && (
              <WebsiteView
                brand={brand}
                designs={designs}
                onDesignsChange={setDesigns}
                onHistory={(id) => setHistoryDesignId(id)}
                onShare={(id) => setShareDesignId(id)}
              />
            )}
            {section === "invitations" && (
              <InvitationsView
                brand={brand}
                designs={designs}
                onDesignsChange={setDesigns}
                onHistory={(id) => setHistoryDesignId(id)}
                onShare={(id) => setShareDesignId(id)}
              />
            )}
            {section === "print" && (
              <PrintView
                brand={brand}
                designs={designs}
                onDesignsChange={setDesigns}
                onHistory={(id) => setHistoryDesignId(id)}
                onShare={(id) => setShareDesignId(id)}
              />
            )}
            {section === "style-guide" && (
              <StyleGuideView
                brand={brand}
                designs={designs}
                onDesignsChange={setDesigns}
                onHistory={(id) => setHistoryDesignId(id)}
                onShare={(id) => setShareDesignId(id)}
              />
            )}
          </main>
        </div>
      </div>

      {brandKitOpen && (
        <BrandKitPanel
          brand={brand}
          onClose={() => setBrandKitOpen(false)}
          onEditBrand={() => { setBrandKitOpen(false); setSection("monogram"); }}
        />
      )}
      {assetDrawerOpen && (
        <AssetLibraryDrawer onClose={() => setAssetDrawerOpen(false)} />
      )}
      {historyDesignId && (
        <VersionHistoryModal
          designId={historyDesignId}
          design={designs.find((d) => d.id === historyDesignId)!}
          versions={SAMPLE_VERSIONS.filter((v) => v.designId === historyDesignId)}
          onClose={() => setHistoryDesignId(null)}
        />
      )}
      {shareDesignId && (
        <ShareModal
          designId={shareDesignId}
          design={designs.find((d) => d.id === shareDesignId)!}
          onClose={() => setShareDesignId(null)}
        />
      )}
      {inviteOpen && (
        <StudioInviteModal onClose={() => setInviteOpen(false)} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Chrome: top bar + sidebar + progress ring
//   These mirror the Checklist page 1:1 so the app shell feels identical across
//   every route. Only the main content area and the sidebar's list of items
//   change between pages.
// ═══════════════════════════════════════════════════════════════════════════════════

function daysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function isWeddingInPast(date: Date | null): boolean {
  if (!date) return false;
  return date.getTime() < Date.now();
}

function ProgressRing({
  percent,
  size = 44,
  strokeWidth = 3.5,
  onClick,
  interactive = false,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const ring = (
    <svg width={size} height={size} className="shrink-0" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-border" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="progress-ring-circle text-gold"
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-ink text-[10px] font-mono font-medium">
        {percent}%
      </text>
    </svg>
  );

  if (interactive && onClick) {
    return (
      <button onClick={onClick} className="rounded-full transition-transform hover:scale-105 active:scale-95">
        {ring}
      </button>
    );
  }
  return ring;
}

function StudioTopBarActions({
  totalItems,
  completedItems,
  onInviteClick,
  onNewTaskClick,
}: {
  totalItems: number;
  completedItems: number;
  onInviteClick: () => void;
  onNewTaskClick: () => void;
}) {
  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-[12px] text-ink-muted sm:block">
        {completedItems}/{totalItems} tasks
      </span>
      <ProgressRing percent={percent} size={28} strokeWidth={2.5} />
      <button
        onClick={onNewTaskClick}
        className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
        aria-label="New task"
      >
        <Plus size={13} strokeWidth={2} />
        <span>New Task</span>
      </button>
      <button
        onClick={onInviteClick}
        className="flex items-center gap-1.5 rounded-md border border-gold/25 bg-gold-pale/30 px-3 py-1.5 text-[12px] font-medium text-gold transition-colors hover:bg-gold-pale/50 hover:border-gold/40"
        aria-label="Invite to planning space"
      >
        <UserPlus size={13} strokeWidth={1.5} />
        <span>Invite</span>
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Sidebar — mirrors Checklist structure
//   Top: smart views (All Designs / In Review / Finalized / Shared)
//   Heading: "SURFACES"
//   List: the four surfaces with 2px gold progress bars, same row treatment as
//   Checklist planning phases.
// ═══════════════════════════════════════════════════════════════════════════════════

type StudioView = "surfaces" | "all-designs" | "in-review" | "finalized" | "shared";

type CompletionMap = { monogram: number; logo: number; style: number; website: number; invitations: number; print: number; styleGuide: number };

function Sidebar({
  studioView,
  onStudioViewChange,
  activeSection,
  onSurfaceSelect,
  designs,
  completion,
}: {
  studioView: StudioView;
  onStudioViewChange: (v: StudioView) => void;
  activeSection: StudioSection;
  onSurfaceSelect: (s: StudioSection) => void;
  designs: StudioDesign[];
  completion: CompletionMap;
}) {
  const allCount = designs.length;
  const reviewCount = designs.filter((d) => d.status === "in_review").length;
  const finalizedCount = designs.filter((d) => d.status === "finalized").length;
  const sharedCount = designs.filter((d) => d.collaborators.length > 0).length;

  const surfaces: {
    key: StudioSection;
    label: string;
    icon: typeof Sparkles;
    pct: number;
    count: string;
  }[] = [
    { key: "monogram",    label: "Monogram",          icon: Sparkles, pct: completion.monogram,    count: `${completion.monogram}%` },
    { key: "logo",        label: "Wedding Logo",      icon: Sparkles, pct: completion.logo,        count: `${completion.logo}%` },
    { key: "style",       label: "Style",             icon: Palette,  pct: completion.style,       count: `${completion.style}%` },
    { key: "website",     label: "Website",           icon: Globe,    pct: completion.website,     count: `${completion.website}%` },
    { key: "invitations", label: "Invitations",       icon: Mail,     pct: completion.invitations, count: `${completion.invitations}%` },
    { key: "print",       label: "Print & Signage",   icon: Printer,  pct: completion.print,       count: `${completion.print}%` },
    { key: "style-guide", label: "Outfit Style Guide",icon: Crown,    pct: completion.styleGuide,  count: `${completion.styleGuide}%` },
  ];

  return (
    <aside
      className="hidden w-72 shrink-0 border-r border-border lg:block"
      role="navigation"
      aria-label="Studio navigation"
    >
      <div className="flex h-full flex-col">
        {/* Smart views — same visual pattern as Checklist's All Tasks / This Week / At Risk / Members */}
        <div className="border-b border-border px-3 pb-3 pt-6">
          <SmartViewRow
            icon={LayoutGrid}
            label="All Designs"
            count={allCount}
            active={studioView === "all-designs"}
            onClick={() => { onStudioViewChange("all-designs"); onSurfaceSelect("home"); }}
            accent="gold"
          />
          <SmartViewRow
            icon={Eye}
            label="In Review"
            count={reviewCount}
            active={studioView === "in-review"}
            onClick={() => { onStudioViewChange("in-review"); onSurfaceSelect("home"); }}
            accent="gold"
          />
          <SmartViewRow
            icon={FileCheck2}
            label="Finalized"
            count={finalizedCount}
            active={studioView === "finalized"}
            onClick={() => { onStudioViewChange("finalized"); onSurfaceSelect("home"); }}
            accent="gold"
          />
          <SmartViewRow
            icon={ShareIcon}
            label="Shared"
            count={sharedCount}
            active={studioView === "shared"}
            onClick={() => { onStudioViewChange("shared"); onSurfaceSelect("home"); }}
            accent="gold"
          />
        </div>

        {/* Surfaces heading */}
        <div className="px-6 pb-4 pt-6">
          <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-ink-muted">
            Surfaces
          </h2>
        </div>

        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-8">
          <ul className="space-y-0.5" role="list">
            {surfaces.map((surface) => {
              const Icon = surface.icon;
              const isActive = studioView === "surfaces" && activeSection === surface.key;
              const marketplaceSurface = sidebarKeyToMarketplaceSurface(surface.key);

              return (
                <li
                  key={surface.key}
                  className={cn(
                    "group relative flex items-center rounded-lg border-l-2 transition-all duration-200",
                    isActive
                      ? "bg-gold-pale/20 border-gold"
                      : "border-transparent hover:bg-ivory-warm/50",
                  )}
                >
                  <button
                    onClick={() => { onStudioViewChange("surfaces"); onSurfaceSelect(surface.key); }}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-2.5 pr-1 text-left",
                      isActive ? "text-ink" : "text-ink-muted hover:text-ink-soft",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.5}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-gold" : "text-ink-faint group-hover:text-ink-muted",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium leading-tight">
                        {surface.label}
                      </span>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-[2px] flex-1 rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-gold transition-all duration-500"
                            style={{ width: `${surface.pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] tabular-nums text-ink-faint">
                          {surface.count}
                        </span>
                      </div>
                    </div>
                  </button>
                  {marketplaceSurface ? (
                    <NextLink
                      href={`/studio/${marketplaceSurface}/templates`}
                      title={`Browse ${surface.label} templates`}
                      aria-label={`Browse ${surface.label} template library`}
                      className={cn(
                        "mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all",
                        "text-ink-faint opacity-0 group-hover:opacity-100",
                        "hover:bg-gold-pale/60 hover:text-gold",
                        isActive && "opacity-100 text-gold/70",
                      )}
                    >
                      <LayoutGrid size={13} strokeWidth={1.7} />
                    </NextLink>
                  ) : (
                    <ChevronRight
                      size={14}
                      className={cn(
                        "mr-3 shrink-0 transition-opacity",
                        isActive ? "opacity-50" : "opacity-0 group-hover:opacity-30",
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* Keepsakes — external routes that live outside the single-page
              surface switcher. Photo Albums + Content Studio both ship as
              their own sub-routes so the editors can take over the full canvas. */}
          <div className="mt-6">
            <h2 className="px-3 font-serif text-sm font-medium uppercase tracking-widest text-ink-muted">
              Keepsakes
            </h2>
            <div className="mt-3 space-y-0.5">
              <NextLink
                href="/studio/photo-albums"
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-ink-muted transition-all duration-200 hover:bg-ivory-warm/50 hover:text-ink-soft border-l-2 border-transparent pl-2.5"
              >
                <BookOpen
                  size={18}
                  strokeWidth={1.5}
                  className="shrink-0 text-ink-faint transition-colors group-hover:text-ink-muted"
                />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium leading-tight">Photo Albums</span>
                  <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-wider text-ink-faint">
                    Design & order
                  </span>
                </div>
                <ChevronRight size={14} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-30" />
              </NextLink>
              <NextLink
                href="/studio/content"
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-ink-muted transition-all duration-200 hover:bg-ivory-warm/50 hover:text-ink-soft border-l-2 border-transparent pl-2.5"
              >
                <Share2
                  size={18}
                  strokeWidth={1.5}
                  className="shrink-0 text-ink-faint transition-colors group-hover:text-ink-muted"
                />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium leading-tight">Content Studio</span>
                  <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-wider text-ink-faint">
                    Share-ready social
                  </span>
                </div>
                <ChevronRight size={14} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-30" />
              </NextLink>
              <NextLink
                href="/community?tab=editorial&sub=magazine"
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-ink-muted transition-all duration-200 hover:bg-ivory-warm/50 hover:text-ink-soft border-l-2 border-transparent pl-2.5"
              >
                <Newspaper
                  size={18}
                  strokeWidth={1.5}
                  className="shrink-0 text-ink-faint transition-colors group-hover:text-ink-muted"
                />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium leading-tight">Magazine</span>
                  <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-wider text-ink-faint">
                    Real weddings
                  </span>
                </div>
                <ChevronRight size={14} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-30" />
              </NextLink>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}

function SmartViewRow({
  icon: Icon,
  label,
  count,
  active,
  onClick,
  accent,
}: {
  icon: typeof Sparkles;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent: "gold" | "rose";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg py-2.5 pr-3 text-left transition-all duration-200 border-l-2",
        active
          ? accent === "rose"
            ? "bg-rose-pale/40 text-ink border-rose pl-2.5"
            : "bg-gold-pale/20 text-ink border-gold pl-2.5"
          : "border-transparent pl-2.5 text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        size={18}
        strokeWidth={1.5}
        className={cn(
          "shrink-0 transition-colors",
          active
            ? accent === "rose"
              ? "text-rose"
              : "text-gold"
            : "text-ink-faint group-hover:text-ink-muted",
        )}
      />
      <span className="flex-1 text-[13px] font-medium">{label}</span>
      {count > 0 && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
            active
              ? accent === "rose"
                ? "bg-rose/10 text-rose"
                : "bg-gold/10 text-gold"
              : "bg-ivory-warm text-ink-faint",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function StudioInviteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border p-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
              Invite to planning
            </div>
            <h2 className="mt-1 font-serif text-2xl text-ink">
              {COUPLE.person1} & {COUPLE.person2}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-muted hover:bg-ivory-warm hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm leading-relaxed text-ink-muted">
            Add your partner, family, or wedding planner so they can comment, co-design, and see
            progress across every surface.
          </p>
          <input
            placeholder="name@family.com"
            className="mt-4 w-full rounded-md border border-border bg-ivory px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onClose} className="rounded-md border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted hover:bg-ivory-warm">
              Cancel
            </button>
            <button className="rounded-md bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ivory hover:opacity-90">
              Send invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Home / landing view
// ═══════════════════════════════════════════════════════════════════════════════════

function HomeView({
  brand,
  designs,
  completion,
  overall,
  onJump,
  onOpenBrandKit,
  onOpenAssets,
}: {
  brand: BrandSystem;
  designs: StudioDesign[];
  completion: CompletionMap;
  overall: number;
  onJump: (s: StudioSection) => void;
  onOpenBrandKit: () => void;
  onOpenAssets: () => void;
}) {
  const recent = [...designs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const rows: {
    key: StudioSection;
    eyebrow: string;
    title: string;
    description: string;
    completion: number;
    status: string;
  }[] = [
    {
      key: "monogram",
      eyebrow: "The signature",
      title: "Monogram",
      description: "Choose a pre-designed monogram. Your initials, date, and location are injected — then it cascades to every surface.",
      completion: completion.monogram,
      status: (() => {
        const chosen = MONOGRAM_TEMPLATES.find((t) => t.id === brand.monogramTemplateId);
        return chosen
          ? `100% complete · ${chosen.name}`
          : "Not started · pick a monogram";
      })(),
    },
    {
      key: "logo",
      eyebrow: "The wordmark",
      title: "Wedding Logo",
      description: "A full-names lockup that pairs with your monogram. Anchors your website header, email signatures, and save-the-dates.",
      completion: completion.logo,
      status: (() => {
        const chosen = LOGO_TEMPLATES.find((t) => t.id === brand.logoTemplateId);
        return chosen
          ? `100% complete · ${chosen.name}`
          : "Not started · pick a logo";
      })(),
    },
    {
      key: "style",
      eyebrow: "The palette & type",
      title: "Style",
      description: "Palette, typography, motifs, and the shareable brand board that ties them all together.",
      completion: completion.style,
      status: `${completion.style}% complete · ${brand.palette.name} · ${brand.typography.name}`,
    },
    {
      key: "website",
      eyebrow: "Your digital welcome",
      title: "Website",
      description: "A curated template that carries your brand across every page your guests see.",
      completion: completion.website,
      status: (() => {
        const site = designs.find((d) => d.kind === "website");
        return site
          ? `${completion.website}% complete · ${site.title}`
          : `Not started · no template chosen yet`;
      })(),
    },
    {
      key: "invitations",
      eyebrow: "Save-the-dates to wedding suites",
      title: "Invitations",
      description: "Digital, print-ready, and WhatsApp-optimized designs for every event.",
      completion: completion.invitations,
      status: `${completion.invitations}% complete · ${designs.filter((d) => d.kind === "invitation").length} designs in progress`,
    },
    {
      key: "print",
      eyebrow: "Day-of details",
      title: "Print & Signage",
      description: "Menus, welcome signs, seating charts, ceremony programs — auto-themed and print-ready.",
      completion: completion.print,
      status: `${completion.print}% complete · ${designs.filter((d) => d.kind === "print").length} designs started`,
    },
    {
      key: "style-guide",
      eyebrow: "For your guests",
      title: "Outfit Style Guide",
      description: "The dress code your guests will actually read — curated, on-brand, and shareable per event.",
      completion: completion.styleGuide,
      status: (() => {
        const count = designs.filter((d) => d.kind === "style-guide").length;
        return count
          ? `${completion.styleGuide}% complete · ${count} ${count === 1 ? "guide" : "guides"} started`
          : "Not started · design a guide per event";
      })(),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-10">
      {/* Page header — H1 is the largest type on the page, matching Checklist's phase-name sizing */}
      <div className="mb-10">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
          The Studio · {COUPLE.hashtag}
        </p>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight text-ink">
              Design every surface of your wedding.
            </h1>
            <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-muted">
              One brand system, four creative surfaces. Everything below pulls from your Brand Kit
              by default — and respects your edits wherever you make them.
            </p>
          </div>

          {/* Simplified completion widget — one %, one bar, one line of supporting text */}
          <div className="w-full max-w-[220px] shrink-0 rounded-lg border border-border bg-white p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                Creative completion
              </span>
            </div>
            <div className="mt-1 font-serif text-3xl font-medium tracking-tight text-ink">
              {overall}%
            </div>
            <div className="mt-3 h-[2px] w-full rounded-full bg-border">
              <div
                className="h-full rounded-full bg-gold transition-all duration-500"
                style={{ width: `${overall}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              across four surfaces
            </p>
          </div>
        </div>

        {/* Gold separator — same as Checklist phase header */}
        <div className="mt-5 h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />
      </div>

      {/* Editorial row list — no gradient tiles, matches Checklist task row rhythm */}
      <ul className="mb-12 divide-y divide-border border-y border-border" role="list">
        {rows.map((row) => {
          const isActive = false; // home view has no active surface yet; reserved for future "currently focused" state
          return (
            <li key={row.key}>
              <button
                onClick={() => onJump(row.key)}
                className={cn(
                  "group flex w-full items-start gap-5 px-2 py-5 text-left transition-colors hover:bg-ivory-warm/40",
                  isActive ? "border-l-2 border-gold pl-1.5" : "",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                    {row.eyebrow}
                  </p>
                  <h3 className="font-serif text-2xl font-medium tracking-tight text-ink">
                    {row.title}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-ink-muted">
                    {row.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-[2px] w-48 rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-gold transition-all duration-500"
                        style={{ width: `${row.completion}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10.5px] uppercase tracking-wide text-ink-muted">
                      {row.status}
                    </span>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 pt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint transition-colors group-hover:text-gold">
                  Open
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Recent designs + Brand Kit — kept as quiet secondary sections, no decorative gradients */}
      <section className="mb-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-ink-muted">
            Recent designs
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            Sorted by last edit
          </span>
        </div>
        <ul className="divide-y divide-border border-y border-border" role="list">
          {recent.map((d) => {
            const kindLabel =
              d.kind === "invitation"  ? "Invitation"
              : d.kind === "website"   ? "Website"
              : d.kind === "style-guide" ? "Style Guide"
                                         : "Print";
            const Icon =
              d.kind === "website"     ? Globe
              : d.kind === "invitation"? Mail
              : d.kind === "style-guide" ? Crown
                                         : Printer;
            return (
              <li key={d.id}>
                <div className="flex items-center gap-4 px-2 py-3.5">
                  <Icon size={16} strokeWidth={1.5} className="shrink-0 text-ink-faint" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                      <span>{kindLabel}</span>
                      {d.event && <span>· {EVENT_META[d.event].label}</span>}
                    </div>
                    <div className="mt-0.5 truncate font-serif text-[14.5px] font-medium leading-snug tracking-tight text-ink">
                      {d.title}
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-muted">
                      Edited {formatRelative(d.updatedAt)} by {d.author}
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                  <ChevronRight className="h-4 w-4 text-ink-faint" />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-ink-muted">
            Brand Kit
          </h2>
          <button
            onClick={() => onJump("monogram")}
            className="font-mono text-[10px] uppercase tracking-wide text-gold hover:text-ink"
          >
            Edit →
          </button>
        </div>
        <div className="rounded-lg border border-border bg-white p-6">
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                Monogram
              </div>
              <div
                className="mt-2 flex h-28 items-center justify-center overflow-hidden rounded-md border border-border"
                style={{ background: "#F5F1EA" }}
              >
                <HomeMonogramPreview brand={brand} />
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                {brand.palette.name}
              </div>
              <div className="mt-2 flex gap-1">
                {brand.palette.swatches.map((s) => (
                  <div key={s.hex} className="h-8 flex-1 rounded-sm ring-1 ring-border" style={{ background: s.hex }} />
                ))}
              </div>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                {brand.typography.name}
              </div>
              <div className="mt-2" style={{ fontFamily: brand.typography.display }}>
                <span className="text-2xl text-ink">Aa</span>
                <span className="ml-2 text-sm text-ink-muted" style={{ fontFamily: brand.typography.body }}>
                  {brand.typography.mood}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5 flex gap-2 border-t border-border pt-4">
            <button
              onClick={onOpenBrandKit}
              className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-ink/20 hover:text-ink"
            >
              <Palette size={13} strokeWidth={1.6} />
              Open Brand Kit
            </button>
            <button
              onClick={onOpenAssets}
              className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-ink/20 hover:text-ink"
            >
              <ImageIcon size={13} strokeWidth={1.6} />
              Asset library
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   MONOGRAM view — curated gallery selection
// ═══════════════════════════════════════════════════════════════════════════════════

function weddingProfileFor(brand: BrandSystem): MonogramProps {
  return {
    initials: [COUPLE.person1[0], COUPLE.person2[0]],
    names: [COUPLE.person1, COUPLE.person2],
    date: new Date(COUPLE.weddingDate),
    location: COUPLE.venuePrimary.split(",").slice(-1)[0]?.trim() || COUPLE.venuePrimary,
    color: "#1a1a1a",
  };
}

function MonogramView({
  brand,
  onChange,
}: {
  brand: BrandSystem;
  onChange: (b: BrandSystem) => void;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profile = weddingProfileFor(brand);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  };

  const apply = (templateId: string) => {
    onChange({ ...brand, monogramTemplateId: templateId, brandAutoApplied: true });
  };

  const unapply = () => {
    onChange({ ...brand, monogramTemplateId: null });
  };

  const coupleSlug = `${COUPLE.person1}-${COUPLE.person2}`.toLowerCase();

  return (
    <div className="mx-auto max-w-[1200px] px-10 py-10">
      <SectionHeader
        eyebrow="Monogram"
        title="Your wedding monogram"
        lede="Choose a monogram. It cascades to your website, invitations, and print — with per-design overrides wherever you need them."
        right={<ApplyBrandPill muted />}
      />

      <div className="mt-10">
        <MonogramGallery
          profile={profile}
          selectedTemplateId={brand.monogramTemplateId}
          onSelect={apply}
          onUnselect={unapply}
          coupleSlug={coupleSlug}
          onToast={showToast}
        />
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 rounded-full border border-ink/10 bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ivory shadow-xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   LOGO view — wordmark gallery selection (sibling of Monogram)
// ═══════════════════════════════════════════════════════════════════════════════════

function LogoView({
  brand,
  onChange,
}: {
  brand: BrandSystem;
  onChange: (b: BrandSystem) => void;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profile = weddingProfileFor(brand);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  };

  const apply = (templateId: string) => {
    onChange({ ...brand, logoTemplateId: templateId, brandAutoApplied: true });
  };

  const unapply = () => {
    onChange({ ...brand, logoTemplateId: null });
  };

  const coupleSlug = `${COUPLE.person1}-${COUPLE.person2}`.toLowerCase();

  return (
    <div className="mx-auto max-w-[1200px] px-10 py-10">
      <SectionHeader
        eyebrow="Wedding Logo"
        title="Your wedding logo"
        lede="Choose a wordmark that pairs with your monogram. It anchors your website header, email signatures, and save-the-dates — with per-design overrides wherever you need them."
        right={<LogoAutoAppliedPill />}
      />

      <div className="mt-10">
        <LogoGallery
          profile={profile}
          selectedTemplateId={brand.logoTemplateId}
          onSelect={apply}
          onUnselect={unapply}
          coupleSlug={coupleSlug}
          onToast={showToast}
        />
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 rounded-full border border-ink/10 bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ivory shadow-xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function LogoAutoAppliedPill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold-pale/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
      <Paintbrush className="h-3.5 w-3.5" />
      Logo auto-applied
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   STYLE view — palette / typography / motifs / brand board
// ═══════════════════════════════════════════════════════════════════════════════════

function StyleView({
  brand,
  onChange,
}: {
  brand: BrandSystem;
  onChange: (b: BrandSystem) => void;
}) {
  const [subtab, setSubtab] = useState<"palette" | "typography" | "motifs" | "board">("palette");

  return (
    <div className="mx-auto max-w-[1200px] px-10 py-10">
      <SectionHeader
        eyebrow="Style"
        title="Palette, typography & motifs"
        lede="The supporting style system behind your monogram — palette, typography, motifs, and a shareable brand board."
        right={<ApplyBrandPill muted />}
      />

      <div className="mt-8 flex items-center gap-1 border-b border-ink/5">
        {([
          ["palette",    "Palette",    Palette],
          ["typography", "Typography", TypeIcon],
          ["motifs",     "Motifs",     Flower2],
          ["board",      "Brand board",Layers],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setSubtab(key)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
              subtab === key
                ? "border-gold text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {subtab === "palette"    && <PaletteSubview    brand={brand} onChange={onChange} />}
        {subtab === "typography" && <TypographySubview brand={brand} onChange={onChange} />}
        {subtab === "motifs"     && <MotifsSubview     brand={brand} onChange={onChange} />}
        {subtab === "board"      && <BrandBoardSubview brand={brand} />}
      </div>
    </div>
  );
}

function HomeMonogramPreview({ brand }: { brand: BrandSystem }) {
  const rendered = useMonogramRenderData(weddingProfileFor(brand));
  const template = MONOGRAM_TEMPLATES.find((t) => t.id === brand.monogramTemplateId);
  if (template) {
    const Component = MONOGRAM_COMPONENTS[template.componentKey];
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <Component {...rendered} />
      </div>
    );
  }
  return (
    <span
      className="font-serif text-6xl leading-none"
      style={{ color: brand.monogram.accent, fontFamily: brand.typography.display }}
    >
      {brand.monogram.initials}
    </span>
  );
}

function PaletteSubview({ brand, onChange }: { brand: BrandSystem; onChange: (b: BrandSystem) => void }) {
  const [custom, setCustom] = useState<ColorPalette | null>(null);

  const active = custom ?? brand.palette;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Curated palettes
        </div>
        <div className="mt-3 grid gap-3">
          {PALETTES.map((p) => {
            const chosen = brand.palette.id === p.id && !custom;
            return (
              <button
                key={p.id}
                onClick={() => { setCustom(null); onChange({ ...brand, palette: p }); }}
                className={cn(
                  "group flex items-center gap-4 rounded-lg border p-4 text-left transition-all",
                  chosen ? "border-gold bg-gold-pale/25" : "border-ink/10 bg-card hover:border-ink/20"
                )}
              >
                <div className="flex h-12 w-24 overflow-hidden rounded-md ring-1 ring-ink/5">
                  {p.swatches.map((s) => (
                    <div key={s.hex} className="flex-1" style={{ background: s.hex }} />
                  ))}
                </div>
                <div className="flex-1">
                  <div className="font-serif text-base text-ink">{p.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    {p.swatches.length} hues
                  </div>
                </div>
                {chosen && <Check className="h-4 w-4 text-gold" />}
              </button>
            );
          })}
        </div>
        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink/20 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-ink/40 hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5" />
          Custom palette
        </button>
      </div>

      <div className="rounded-xl border border-ink/10 bg-card p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Palette detail
            </div>
            <div className="mt-1 font-serif text-2xl text-ink">{active.name}</div>
          </div>
          <button className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold hover:text-ink">
            Copy hex list
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {active.swatches.map((s) => (
            <div
              key={s.hex}
              className="flex items-center gap-4 rounded-md border border-ink/5 bg-ivory p-3"
            >
              <div
                className="h-14 w-14 rounded-md ring-1 ring-ink/5"
                style={{ background: s.hex }}
              />
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-base text-ink">{s.label}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    {s.role}
                  </span>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                  {s.hex}
                </span>
              </div>
              <button className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold hover:text-ink">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-ink/5 p-5" style={{ background: active.swatches.find((s) => s.role === "ivory")?.hex }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: active.swatches.find((s) => s.role === "gold")?.hex }}>
            Preview
          </div>
          <div className="mt-1 font-serif text-3xl" style={{ color: active.swatches.find((s) => s.role === "ink")?.hex, fontFamily: brand.typography.display }}>
            {COUPLE.person1} <span style={{ color: active.swatches.find((s) => s.role === "primary")?.hex }}>&</span> {COUPLE.person2}
          </div>
          <p className="mt-2 text-sm" style={{ color: active.swatches.find((s) => s.role === "ink")?.hex, opacity: 0.7, fontFamily: brand.typography.body }}>
            Request the pleasure of your company at their wedding, {formatDate(COUPLE.weddingDate)} ·{" "}
            {COUPLE.venuePrimary}.
          </p>
        </div>
      </div>
    </div>
  );
}

function TypographySubview({ brand, onChange }: { brand: BrandSystem; onChange: (b: BrandSystem) => void }) {
  return (
    <div className="space-y-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
        Typography pairings
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {TYPOGRAPHY_PAIRS.map((pair) => {
          const chosen = brand.typography.id === pair.id;
          return (
            <button
              key={pair.id}
              onClick={() => onChange({ ...brand, typography: pair })}
              className={cn(
                "group rounded-xl border p-6 text-left transition-all",
                chosen
                  ? "border-gold bg-gold-pale/20"
                  : "border-ink/10 bg-card hover:border-ink/20"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                    {pair.name}
                  </div>
                  <div className="mt-3 text-5xl leading-none text-ink" style={{ fontFamily: pair.display }}>
                    Priya & Arjun
                  </div>
                  <div className="mt-3 text-sm text-ink-muted" style={{ fontFamily: pair.body }}>
                    {pair.mood}
                  </div>
                </div>
                {chosen && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-ivory">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-center gap-4 border-t border-ink/5 pt-4">
                <div className="flex-1">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
                    Display
                  </div>
                  <div className="truncate text-xs text-ink" style={{ fontFamily: pair.display }}>
                    {pair.display.split(",")[0].replace(/['"]/g, "")}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
                    Body
                  </div>
                  <div className="truncate text-xs text-ink" style={{ fontFamily: pair.body }}>
                    {pair.body.split(",")[0].replace(/['"]/g, "")}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MotifsSubview({ brand, onChange }: { brand: BrandSystem; onChange: (b: BrandSystem) => void }) {
  const [filter, setFilter] = useState<Motif["category"] | "all">("all");

  const categories: { key: Motif["category"] | "all"; label: string }[] = [
    { key: "all",       label: "All" },
    { key: "paisley",   label: "Paisley" },
    { key: "floral",    label: "Floral" },
    { key: "mandala",   label: "Mandala" },
    { key: "peacock",   label: "Peacock" },
    { key: "geometric", label: "Geometric" },
  ];

  const visible = brand.motifs.filter((m) => filter === "all" || m.category === filter);
  const selectedCount = brand.motifs.filter((m) => m.selected).length;

  const toggle = (id: string) =>
    onChange({
      ...brand,
      motifs: brand.motifs.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m)),
    });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={cn(
                "rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all",
                filter === c.key
                  ? "border-ink bg-ink text-ivory"
                  : "border-ink/10 bg-card text-ink-muted hover:border-ink/30"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          {selectedCount} selected
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((m) => (
          <button
            key={m.id}
            onClick={() => toggle(m.id)}
            className={cn(
              "group relative aspect-[4/5] overflow-hidden rounded-lg border p-5 transition-all",
              m.selected
                ? "border-gold bg-gold-pale/20"
                : "border-ink/10 bg-card hover:border-ink/20"
            )}
          >
            <div
              className="flex h-full items-center justify-center text-8xl"
              style={{ color: brand.monogram.accent, fontFamily: brand.typography.display }}
            >
              {m.emoji}
            </div>
            <div className="absolute inset-x-0 bottom-0 border-t border-ink/5 bg-ivory/85 p-3 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-serif text-sm text-ink">{m.name}</div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint capitalize">
                    {m.category}
                  </div>
                </div>
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                    m.selected
                      ? "border-gold bg-gold text-ivory"
                      : "border-ink/20 text-transparent"
                  )}
                >
                  <Check className="h-3 w-3" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BrandBoardSubview({ brand }: { brand: BrandSystem }) {
  const ivory = brand.palette.swatches.find((s) => s.role === "ivory")?.hex ?? "#FBF9F4";
  const ink   = brand.palette.swatches.find((s) => s.role === "ink")?.hex ?? "#1A1A1A";
  const gold  = brand.palette.swatches.find((s) => s.role === "gold")?.hex ?? brand.monogram.accent;
  const primary = brand.palette.swatches.find((s) => s.role === "primary")?.hex ?? "#D4A24C";

  const selected = brand.motifs.filter((m) => m.selected);

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-card">
      <div className="flex items-center justify-between border-b border-ink/10 bg-ivory-warm/50 px-6 py-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Brand board — ready for the family
          </div>
          <div className="font-serif text-lg italic text-ink">One page, everything at a glance.</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:bg-ivory-deep">
            <Download className="h-3.5 w-3.5" /> Export PDF
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:bg-ivory-deep">
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]" style={{ background: ivory }}>
        <div className="flex flex-col items-center justify-center gap-6 border-r border-ink/5 p-14">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: gold }}>
            {COUPLE.hashtag}
          </div>
          <div
            className="text-center text-[96px] leading-none"
            style={{ color: brand.monogram.accent, fontFamily: brand.typography.display }}
          >
            {brand.monogram.initials}
          </div>
          <div className="text-center" style={{ color: ink, fontFamily: brand.typography.display }}>
            <div className="text-4xl">{COUPLE.person1} &amp; {COUPLE.person2}</div>
          </div>
          <div className="text-sm italic" style={{ color: ink, opacity: 0.6, fontFamily: brand.typography.body }}>
            {formatDate(COUPLE.weddingDate)} · {COUPLE.venuePrimary}
          </div>
        </div>

        <div className="p-8">
          <BoardBlock title="Palette">
            <div className="grid grid-cols-6 gap-2">
              {brand.palette.swatches.map((s) => (
                <div key={s.hex} className="space-y-1">
                  <div className="h-14 rounded-sm ring-1 ring-ink/5" style={{ background: s.hex }} />
                  <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: ink, opacity: 0.65 }}>
                    {s.hex}
                  </div>
                </div>
              ))}
            </div>
          </BoardBlock>

          <BoardBlock title="Typography">
            <div className="text-3xl" style={{ color: ink, fontFamily: brand.typography.display }}>
              Aa — Display
            </div>
            <div className="mt-1 text-sm" style={{ color: ink, opacity: 0.7, fontFamily: brand.typography.body }}>
              Aa — Body lorem ipsum dolor sit amet
            </div>
          </BoardBlock>

          <BoardBlock title="Motifs">
            <div className="flex flex-wrap gap-3">
              {selected.length === 0 && (
                <span className="text-xs italic" style={{ color: ink, opacity: 0.5 }}>
                  Select motifs in the Motifs tab to populate your board.
                </span>
              )}
              {selected.map((m) => (
                <div key={m.id} className="flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: `${primary}33`, background: `${primary}10` }}>
                  <span className="text-lg" style={{ color: primary }}>{m.emoji}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: ink }}>{m.name}</span>
                </div>
              ))}
            </div>
          </BoardBlock>

          <BoardBlock title="Voice">
            <div className="text-sm italic" style={{ color: ink, opacity: 0.78, fontFamily: brand.typography.body }}>
              Warm, confident, heirloom. We speak as if hand-writing a note: precise words, generous feeling, no
              exclamation marks. We use Hindi for feeling (<em>shubh</em>, <em>kathā</em>), English for logistics.
            </div>
          </BoardBlock>
        </div>
      </div>
    </div>
  );
}

function BoardBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
        {title}
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   WEBSITE view
// ═══════════════════════════════════════════════════════════════════════════════════

function catalogToStudioTemplate(c: CatalogTemplate): WebsiteTemplate {
  const pairing: WebsiteTemplate["pairing"] =
    c.style === "Traditional Indian"
      ? "devanagari"
      : c.style === "Romantic"
        ? "serif-script"
        : c.style === "Modern" || c.style === "Fusion"
          ? "display-sans"
          : "serif-sans";

  return {
    id: c.id,
    name: c.name,
    aesthetic: c.style,
    description: c.description,
    coverHue: c.heroGradient,
    accentHex: c.palette[2],
    sections: c.pages,
    pairing,
  };
}

function resolveWebsiteTemplate(id: string | null): WebsiteTemplate | undefined {
  if (!id) return undefined;
  const legacy = WEBSITE_TEMPLATES.find((t) => t.id === id);
  if (legacy) return legacy;
  const fromCatalog = WEBSITE_CATALOG.find((t) => t.id === id);
  return fromCatalog ? catalogToStudioTemplate(fromCatalog) : undefined;
}

function WebsiteView({
  brand,
  designs,
  onDesignsChange,
  onHistory,
  onShare,
}: {
  brand: BrandSystem;
  designs: StudioDesign[];
  onDesignsChange: (d: StudioDesign[]) => void;
  onHistory: (id: string) => void;
  onShare: (id: string) => void;
}) {
  const siteDesign = designs.find((d) => d.kind === "website");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(siteDesign?.templateId ?? null);
  const [mode, setMode] = useState<"gallery" | "customize">(siteDesign ? "customize" : "gallery");

  function applyTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    const existing = designs.find((d) => d.kind === "website");
    if (existing) {
      onDesignsChange(
        designs.map((d) =>
          d.id === existing.id ? { ...d, templateId, updatedAt: new Date().toISOString() } : d,
        ),
      );
    } else {
      onDesignsChange([
        ...designs,
        {
          id: `des-web-${Date.now()}`,
          kind: "website",
          title: `${COUPLE.person1.toLowerCase()}and${COUPLE.person2.toLowerCase()}.com`,
          templateId,
          status: "draft",
          author: "Priya",
          brandApplied: true,
          versionCount: 1,
          collaborators: ["Arjun"],
          updatedAt: new Date().toISOString(),
        },
      ]);
    }
    setMode("customize");
  }

  if (mode === "gallery") {
    return (
      <TemplateGallery
        appliedTemplateId={selectedTemplateId}
        onApplyTemplate={applyTemplate}
        onBack={selectedTemplateId ? () => setMode("customize") : undefined}
        coupleName={{ first: COUPLE.person1, second: COUPLE.person2 }}
        weddingDate={COUPLE.weddingDate}
        hashtag={COUPLE.hashtag}
        venue={COUPLE.venuePrimary}
      />
    );
  }

  const resolvedTemplate = resolveWebsiteTemplate(selectedTemplateId);

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <SectionHeader
        eyebrow="Website"
        title="Your public wedding site"
        lede="Choose a template, then customize. Your Brand Kit auto-applies; override per-page where it makes sense."
        right={
          <div className="flex gap-2">
            <button
              onClick={() => setMode("gallery")}
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-all",
                "border-ink/10 bg-card text-ink-muted",
              )}
            >
              Templates
            </button>
            <button
              onClick={() => setMode("customize")}
              disabled={!selectedTemplateId}
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-all disabled:opacity-40",
                "border-ink bg-ink text-ivory",
              )}
            >
              Customize
            </button>
          </div>
        }
      />

      {resolvedTemplate && (
        <WebsiteCustomize
          template={resolvedTemplate}
          design={siteDesign}
          brand={brand}
          onHistory={onHistory}
          onShare={onShare}
        />
      )}
    </div>
  );
}

function WebsiteTemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: WebsiteTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className={cn(
      "group overflow-hidden rounded-xl border transition-all",
      selected ? "border-gold shadow-lg" : "border-ink/10 hover:border-ink/20"
    )}>
      <div className="relative h-52 overflow-hidden" style={{ background: template.coverHue }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-ivory">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-75">
            {template.aesthetic}
          </div>
          <div className="mt-2 font-serif text-3xl tracking-tight">
            {COUPLE.person1} & {COUPLE.person2}
          </div>
          <div className="mt-1 text-[11px] opacity-80">{formatDate(COUPLE.weddingDate)}</div>
        </div>
        {selected && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-ivory px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink">
            <Check className="h-3 w-3 text-gold" />
            Chosen
          </div>
        )}
      </div>
      <div className="bg-card p-5">
        <div className="flex items-baseline justify-between">
          <div className="font-serif text-lg text-ink">{template.name}</div>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: template.accentHex }} />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{template.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.sections.map((s) => (
            <span key={s} className="rounded-sm bg-ivory-warm px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-muted">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-ink/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:bg-ivory-warm">
            <Eye className="h-3.5 w-3.5" /> Live preview
          </button>
          <button
            onClick={onSelect}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory hover:bg-ink-soft"
          >
            {selected ? "Keep" : "Choose"}
          </button>
        </div>
      </div>
    </div>
  );
}

function WebsiteCustomize({
  template,
  design,
  brand,
  onHistory,
  onShare,
}: {
  template: WebsiteTemplate;
  design: StudioDesign | undefined;
  brand: BrandSystem;
  onHistory: (id: string) => void;
  onShare: (id: string) => void;
}) {
  const [sectionKey, setSectionKey] = useState<string>(template.sections[0]);
  const [brandOverride, setBrandOverride] = useState(true);
  const [heroImage, setHeroImage] = useState<{ url: string; name: string } | null>(null);
  const [heroError, setHeroError] = useState<string | null>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (heroImage) URL.revokeObjectURL(heroImage.url);
    };
  }, [heroImage]);

  function handleHeroFile(file: File | null | undefined) {
    setHeroError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setHeroError("Please pick an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setHeroError("Image is larger than 10 MB.");
      return;
    }
    if (heroImage) URL.revokeObjectURL(heroImage.url);
    setHeroImage({ url: URL.createObjectURL(file), name: file.name });
  }

  function removeHeroImage() {
    if (heroImage) URL.revokeObjectURL(heroImage.url);
    setHeroImage(null);
    setHeroError(null);
    if (heroInputRef.current) heroInputRef.current.value = "";
  }

  const ivory = brand.palette.swatches.find((s) => s.role === "ivory")?.hex ?? "#FBF9F4";
  const ink   = brand.palette.swatches.find((s) => s.role === "ink")?.hex ?? "#1A1A1A";
  const accent = brandOverride ? brand.monogram.accent : template.accentHex;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr_300px]">
      {/* Section nav */}
      <aside className="rounded-xl border border-ink/10 bg-card p-4">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Pages
        </div>
        <div className="flex flex-col gap-1">
          {template.sections.map((s) => (
            <button
              key={s}
              onClick={() => setSectionKey(s)}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                sectionKey === s ? "bg-ivory-warm text-ink" : "text-ink-muted hover:bg-ivory-warm/60"
              )}
            >
              <span>{s}</span>
              <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />
            </button>
          ))}
        </div>
        <div className="mt-5 border-t border-ink/5 pt-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Global
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <NavRow icon={SlidersHorizontal} label="Domain & URL" />
            <NavRow icon={Settings}           label="Privacy / password" />
            <NavRow icon={Languages}          label="Language toggle" />
          </div>
        </div>
      </aside>

      {/* Live preview */}
      <section className="overflow-hidden rounded-xl border border-ink/10 bg-card">
        <div className="flex items-center justify-between border-b border-ink/10 bg-ivory-warm/40 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              {design?.title ?? `${COUPLE.person1.toLowerCase()}and${COUPLE.person2.toLowerCase()}.com`}/{sectionKey.toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:bg-ivory-warm">
              <MousePointer2 className="h-3 w-3" /> Edit
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:bg-ivory-warm">
              <Eye className="h-3 w-3" /> Preview
            </button>
          </div>
        </div>

        <div className="p-10" style={{ background: ivory }}>
          <WebsiteHeroPreview
            template={template}
            brand={brand}
            brandApplied={brandOverride}
            section={sectionKey}
            ink={ink}
            accent={accent}
            heroImage={heroImage?.url ?? null}
          />
        </div>
      </section>

      {/* Inspector */}
      <aside className="space-y-4">
        <div className="rounded-xl border border-ink/10 bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Brand link
            </div>
            <button
              onClick={() => setBrandOverride((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
                brandOverride
                  ? "border-gold bg-gold-pale/40 text-ink"
                  : "border-ink/10 text-ink-muted"
              )}
            >
              {brandOverride ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              {brandOverride ? "Applied" : "Overridden"}
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            {brandOverride
              ? "Colors, typography, and monogram are inherited from your Brand Kit."
              : "This design is using template defaults, not your Brand Kit."}
          </p>
          <button
            onClick={() => setBrandOverride(true)}
            disabled={brandOverride}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory transition-all hover:bg-ink-soft disabled:opacity-50"
          >
            <Paintbrush className="h-3.5 w-3.5" /> Apply brand
          </button>
        </div>

        <div className="rounded-xl border border-ink/10 bg-card p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Page copy
          </div>
          {sectionKey === "Hero" || sectionKey === "Portrait" ? (
            <>
              <Field label="Opening line" small>
                <input
                  defaultValue={`Together with their families, ${COUPLE.person1} & ${COUPLE.person2} invite you.`}
                  className="w-full rounded-md border border-ink/10 bg-ivory px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                />
              </Field>
              <Field label="Hero image" small>
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleHeroFile(e.target.files?.[0])}
                />
                {heroImage ? (
                  <div className="flex items-stretch gap-3 rounded-md border border-ink/10 bg-ivory p-2">
                    <img
                      src={heroImage.url}
                      alt={heroImage.name}
                      className="h-14 w-20 flex-shrink-0 rounded-sm object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="truncate text-xs text-ink">{heroImage.name}</div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => heroInputRef.current?.click()}
                          className="inline-flex items-center gap-1 rounded-sm border border-ink/10 bg-card px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft hover:bg-ivory-warm"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={removeHeroImage}
                          className="inline-flex items-center gap-1 rounded-sm border border-ink/10 bg-card px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft hover:bg-ivory-warm"
                        >
                          <X className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => heroInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleHeroFile(e.dataTransfer.files?.[0]);
                    }}
                    className="flex w-full items-center gap-3 rounded-md border border-dashed border-ink/15 px-3 py-3 text-left text-xs text-ink-muted transition-colors hover:border-ink/30 hover:bg-ivory-warm/40"
                  >
                    <ImageIcon className="h-4 w-4 text-gold" />
                    <span className="flex-1">Upload or drop a photo</span>
                    <Upload className="h-3.5 w-3.5 text-ink-faint" />
                  </button>
                )}
                {heroError && (
                  <div className="mt-2 text-[11px] text-red-600">{heroError}</div>
                )}
              </Field>
            </>
          ) : sectionKey.toLowerCase().includes("story") || sectionKey === "Kathā" ? (
            <Field label="How we met" small>
              <textarea
                rows={4}
                defaultValue="A monsoon afternoon in Bandra, 2019 — a chai stand, a borrowed umbrella, and the first of many shared laughs."
                className="w-full rounded-md border border-ink/10 bg-ivory px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
            </Field>
          ) : sectionKey === "Events" ? (
            <div className="mt-3 space-y-2">
              {["Mehndi", "Sangeet", "Wedding", "Reception"].map((ev) => (
                <div key={ev} className="flex items-center justify-between rounded-md border border-ink/5 bg-ivory-warm/40 px-3 py-2 text-sm">
                  <span className="font-serif text-ink">{ev}</span>
                  <ChevronRight className="h-4 w-4 text-ink-faint" />
                </div>
              ))}
            </div>
          ) : sectionKey === "RSVP" ? (
            <div className="mt-3 space-y-3">
              <Row label="Deadline"   value="October 10, 2026" />
              <Row label="Plus-ones"  value="On request" />
              <Row label="Dietary"    value="Collected at RSVP" />
            </div>
          ) : sectionKey === "Gallery" ? (
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {SAMPLE_ASSETS.filter((a) => a.kind === "photo").slice(0, 6).map((a) => (
                <div key={a.id} className="aspect-square rounded-sm" style={{ background: a.hue }} />
              ))}
            </div>
          ) : (
            <div className="mt-3 text-xs italic text-ink-muted">
              Default content applied from your Brand Kit. Edit inline on the preview.
            </div>
          )}
        </div>

        {design && (
          <div className="rounded-xl border border-ink/10 bg-card p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Design actions
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <ActionRow icon={History}  label={`Version history (${design.versionCount})`} onClick={() => onHistory(design.id)} />
              <ActionRow icon={Share2}   label="Share for feedback"        onClick={() => onShare(design.id)} />
              <ActionRow icon={Save}     label="Save draft" />
              <ActionRow icon={Download} label="Publish" emphasis />
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function WebsiteHeroPreview({
  template,
  brand,
  brandApplied,
  section,
  ink,
  accent,
  heroImage,
}: {
  template: WebsiteTemplate;
  brand: BrandSystem;
  brandApplied: boolean;
  section: string;
  ink: string;
  accent: string;
  heroImage: string | null;
}) {
  const showHeroImage = heroImage && (section === "Hero" || section === "Portrait");

  return (
    <div className="mx-auto max-w-2xl text-center">
      {showHeroImage && (
        <div
          className="relative mb-8 overflow-hidden rounded-sm"
          style={{ aspectRatio: "16 / 9", border: `1px solid ${accent}30` }}
        >
          <img src={heroImage} alt="Hero" className="h-full w-full object-cover" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)",
            }}
          />
        </div>
      )}
      <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>
        {COUPLE.hashtag} · {section.toUpperCase()}
      </div>
      <div
        className="mt-4 text-6xl leading-[1.05]"
        style={{ color: ink, fontFamily: brandApplied ? brand.typography.display : undefined }}
      >
        {COUPLE.person1} <span style={{ color: accent }}>&</span> {COUPLE.person2}
      </div>
      <div
        className="mt-2 text-sm italic"
        style={{ color: ink, opacity: 0.6, fontFamily: brandApplied ? brand.typography.body : undefined }}
      >
        {formatDate(COUPLE.weddingDate)} · {COUPLE.venuePrimary}
      </div>
      <div
        className="mt-10 rounded-sm p-6 text-left"
        style={{ background: `${accent}10`, border: `1px solid ${accent}25` }}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: accent }}>
          {section}
        </div>
        {section === "Hero" || section === "Portrait" ? (
          <p className="mt-2 text-base leading-relaxed" style={{ color: ink, opacity: 0.8, fontFamily: brandApplied ? brand.typography.body : undefined }}>
            Together with their families, {COUPLE.person1} and {COUPLE.person2} joyfully invite you to witness their
            wedding — four days of celebration in Jodhpur, rooted in love, ritual, and every song we&apos;ve danced to
            along the way.
          </p>
        ) : section === "Events" ? (
          <ul className="mt-3 space-y-3" style={{ color: ink, fontFamily: brandApplied ? brand.typography.body : undefined }}>
            {[
              ["Mehndi",     "Nov 12 · 4pm · Haveli Courtyard"],
              ["Sangeet",    "Nov 13 · 7pm · Durbar Hall"],
              ["Wedding",    "Nov 14 · 9am · Zenana Mahal"],
              ["Reception",  "Nov 14 · 8pm · Marble Terrace"],
            ].map(([name, meta]) => (
              <li key={name} className="flex items-baseline justify-between border-b border-dashed pb-2" style={{ borderColor: `${accent}30` }}>
                <span className="text-lg" style={{ fontFamily: brandApplied ? brand.typography.display : undefined }}>{name}</span>
                <span className="text-xs" style={{ opacity: 0.65 }}>{meta}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm" style={{ color: ink, opacity: 0.7, fontFamily: brandApplied ? brand.typography.body : undefined }}>
            Preview of the {section} page. Brand system: <strong>{brand.palette.name}</strong>,
            typography <strong>{brand.typography.name}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   INVITATIONS view
// ═══════════════════════════════════════════════════════════════════════════════════

function InvitationsView({
  brand,
  designs,
  onDesignsChange,
  onHistory,
  onShare,
}: {
  brand: BrandSystem;
  designs: StudioDesign[];
  onDesignsChange: (d: StudioDesign[]) => void;
  onHistory: (id: string) => void;
  onShare: (id: string) => void;
}) {
  const [event, setEvent] = useState<InvitationEventKind | "all">("all");
  const [format, setFormat] = useState<"all" | "digital" | "print" | "whatsapp">("all");
  const [openDesignId, setOpenDesignId] = useState<string | null>(null);

  const filtered = INVITATION_TEMPLATES.filter((t) =>
    (event === "all" || t.event === event) &&
    (format === "all" || t.format === format || t.format === "all")
  );

  const inviteDesigns = designs.filter((d) => d.kind === "invitation");
  const openDesign = inviteDesigns.find((d) => d.id === openDesignId);
  const openTemplate = openDesign ? INVITATION_TEMPLATES.find((t) => t.id === openDesign.templateId) : undefined;

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <SectionHeader
        eyebrow="Invitations"
        title="Save-the-dates to wedding suites"
        lede="Templates for every event. Digital, print-ready, and WhatsApp-optimized. AI helps you draft traditional wording in multiple languages."
        right={
          <button className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-pale/30 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink hover:bg-gold-pale/60">
            <Wand2 className="h-3.5 w-3.5" /> Copywriter
          </button>
        }
      />

      {/* Active designs */}
      {inviteDesigns.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-serif text-xl text-ink">In progress</h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              {inviteDesigns.length} active
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inviteDesigns.map((d) => {
              const t = INVITATION_TEMPLATES.find((tpl) => tpl.id === d.templateId);
              return (
                <DesignCard
                  key={d.id}
                  design={d}
                  thumbHue={t?.thumbHue}
                  eventLabel={d.event ? EVENT_META[d.event].label : undefined}
                  onOpen={() => setOpenDesignId(d.id)}
                  onHistory={() => onHistory(d.id)}
                  onShare={() => onShare(d.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mt-12 flex flex-col gap-4 border-t border-ink/5 pt-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-xl text-ink">Template library</h3>
            <NextLink
              href="/studio/invitation/templates"
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-gold hover:text-ink"
            >
              Browse full library <ArrowRight size={11} />
            </NextLink>
          </div>
          <p className="mt-1 text-sm text-ink-muted">Organized by event type. Each pulls your brand by default.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <FilterChipGroup
            label="Event"
            options={[
              { key: "all",           label: "All" },
              { key: "save-the-date", label: "Save the Date" },
              { key: "engagement",    label: "Engagement" },
              { key: "mehndi",        label: "Mehndi" },
              { key: "sangeet",       label: "Sangeet" },
              { key: "wedding",       label: "Wedding" },
              { key: "reception",     label: "Reception" },
            ]}
            value={event}
            onChange={(v) => setEvent(v as InvitationEventKind | "all")}
          />
          <FilterChipGroup
            label="Format"
            options={[
              { key: "all",      label: "All" },
              { key: "digital",  label: "Digital" },
              { key: "print",    label: "Print" },
              { key: "whatsapp", label: "WhatsApp" },
            ]}
            value={format}
            onChange={(v) => setFormat(v as typeof format)}
          />
        </div>
      </div>

      {/* Template grid */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => (
          <InvitationTemplateCard
            key={t.id}
            template={t}
            brand={brand}
            onUse={() => {
              const id = `des-inv-${Date.now()}`;
              onDesignsChange([
                ...designs,
                {
                  id,
                  kind: "invitation",
                  title: `${EVENT_META[t.event].label} — ${t.name}`,
                  templateId: t.id,
                  status: "draft",
                  author: "Priya",
                  brandApplied: true,
                  versionCount: 1,
                  collaborators: [],
                  updatedAt: new Date().toISOString(),
                  event: t.event,
                },
              ]);
              setOpenDesignId(id);
            }}
          />
        ))}
      </div>

      {openDesign && openTemplate && (
        <InvitationEditorModal
          design={openDesign}
          template={openTemplate}
          brand={brand}
          onClose={() => setOpenDesignId(null)}
          onHistory={() => { onHistory(openDesign.id); }}
          onShare={() => { onShare(openDesign.id); }}
          onFinalize={() => {
            onDesignsChange(
              designs.map((d) => (d.id === openDesign.id ? { ...d, status: "finalized" as DesignStatus } : d))
            );
          }}
        />
      )}
    </div>
  );
}

function InvitationTemplateCard({
  template,
  brand,
  onUse,
}: {
  template: InvitationTemplate;
  brand: BrandSystem;
  onUse: () => void;
}) {
  return (
    <div className="group overflow-hidden rounded-xl border border-ink/10 bg-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/5]" style={{ background: template.thumbHue }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        <div className="absolute inset-6 flex flex-col items-center justify-center text-center text-ivory">
          <div
            className="text-5xl"
            style={{ color: template.accentHex === "#1A1A1A" || template.accentHex === "#0E0E14" ? "#FBF9F4" : template.accentHex, fontFamily: brand.typography.display }}
          >
            {brand.monogram.initials}
          </div>
          <div className="mt-4 font-mono text-[9px] uppercase tracking-[0.25em] opacity-90">
            {EVENT_META[template.event].emoji} {EVENT_META[template.event].label}
          </div>
          <div className="mt-2 font-serif text-xl">
            {COUPLE.person1} & {COUPLE.person2}
          </div>
          <div className="mt-1 text-[10px] opacity-80">{formatDate(COUPLE.weddingDate)}</div>
        </div>
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {template.languages.map((lang) => (
            <span key={lang} className="rounded-sm bg-ivory/90 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-ink">
              {lang}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between">
          <div className="font-serif text-base text-ink">{template.name}</div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">{template.style}</span>
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted capitalize">
          {template.format === "all" ? "Digital · Print · WhatsApp" : template.format}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ink/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:bg-ivory-warm">
            <Eye className="h-3 w-3" /> Preview
          </button>
          <button
            onClick={onUse}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory hover:bg-ink-soft"
          >
            Use
          </button>
        </div>
      </div>
    </div>
  );
}

function InvitationEditorModal({
  design,
  template,
  brand,
  onClose,
  onHistory,
  onShare,
  onFinalize,
}: {
  design: StudioDesign;
  template: InvitationTemplate;
  brand: BrandSystem;
  onClose: () => void;
  onHistory: () => void;
  onShare: () => void;
  onFinalize: () => void;
}) {
  const [language, setLanguage] = useState<"English" | "Hindi" | "Gujarati" | "Sanskrit" | "Tamil">(template.languages[0]);
  const [copy, setCopy] = useState<string>(defaultInviteCopy(template, language));
  const [aiBusy, setAiBusy] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<"digital" | "print" | "whatsapp">(
    template.format === "whatsapp" ? "whatsapp" : template.format === "print" ? "print" : "digital"
  );

  const ivory = brand.palette.swatches.find((s) => s.role === "ivory")?.hex ?? "#FBF9F4";
  const ink = brand.palette.swatches.find((s) => s.role === "ink")?.hex ?? "#1A1A1A";

  const generate = () => {
    setAiBusy(true);
    setTimeout(() => {
      setCopy(aiSuggestedCopy(template, language));
      setAiBusy(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left rail */}
        <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-r border-ink/10 bg-ivory-warm/40 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                Editor
              </div>
              <h2 className="mt-1 font-serif text-xl text-ink">{design.title}</h2>
            </div>
            <button onClick={onClose} className="rounded-md p-1.5 text-ink-muted hover:bg-ivory-deep hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>

          <Field label="Language" small>
            <div className="flex flex-wrap gap-1.5">
              {template.languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setCopy(defaultInviteCopy(template, lang)); }}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
                    language === lang
                      ? "border-ink bg-ink text-ivory"
                      : "border-ink/10 bg-card text-ink-muted hover:border-ink/30"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Copy" small>
            <textarea
              value={copy}
              onChange={(e) => setCopy(e.target.value)}
              rows={10}
              className="w-full resize-none rounded-md border border-ink/10 bg-card px-3 py-2 font-serif text-sm italic leading-relaxed text-ink outline-none focus:border-gold"
            />
            <button
              onClick={generate}
              disabled={aiBusy}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gold/40 bg-gold-pale/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink transition-all hover:bg-gold-pale/60 disabled:opacity-60"
            >
              <Wand2 className="h-3.5 w-3.5" />
              {aiBusy ? "Drafting…" : "Ananya Muse · draft for me"}
            </button>
          </Field>

          <Field label="Preview as" small>
            <div className="grid grid-cols-3 gap-1">
              {(["digital", "print", "whatsapp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setPreviewFormat(fmt)}
                  className={cn(
                    "rounded-md border px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] capitalize transition-all",
                    previewFormat === fmt
                      ? "border-ink bg-ink text-ivory"
                      : "border-ink/10 bg-card text-ink-muted"
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </Field>

          <div className="mt-auto space-y-1 border-t border-ink/10 pt-4">
            <ActionRow icon={History}  label={`Versions (${design.versionCount})`} onClick={onHistory} />
            <ActionRow icon={Share2}   label="Share for feedback"          onClick={onShare} />
            <ActionRow icon={Download} label="Export PDF" />
            <ActionRow icon={ShoppingBag} label="Hand off to Stationery"  />
            <ActionRow icon={Check} label="Finalize" emphasis onClick={onFinalize} />
          </div>
        </aside>

        {/* Preview stage */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto p-10" style={{ background: "#1a1a1a" }}>
          <InvitationPreviewSurface
            template={template}
            brand={brand}
            copy={copy}
            language={language}
            format={previewFormat}
          />
        </div>
      </div>
    </div>
  );
}

function InvitationPreviewSurface({
  template,
  brand,
  copy,
  language,
  format,
}: {
  template: InvitationTemplate;
  brand: BrandSystem;
  copy: string;
  language: string;
  format: "digital" | "print" | "whatsapp";
}) {
  const ivory = brand.palette.swatches.find((s) => s.role === "ivory")?.hex ?? "#FBF9F4";
  const ink = brand.palette.swatches.find((s) => s.role === "ink")?.hex ?? "#1A1A1A";
  const accent = template.accentHex;
  const displayFont = language === "Hindi" || language === "Sanskrit" ? "'Noto Serif Devanagari', serif" : brand.typography.display;

  const dims =
    format === "whatsapp" ? { w: 280, h: 500 } :
    format === "print"    ? { w: 420, h: 580 } :
                            { w: 420, h: 580 };

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-sm px-8 py-10 text-center shadow-2xl"
      style={{ width: dims.w, minHeight: dims.h, background: ivory, border: `8px double ${accent}44` }}
    >
      <div className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: accent }}>
        {EVENT_META[template.event].emoji} {EVENT_META[template.event].label}
      </div>
      <div
        className="mt-6 text-5xl leading-none"
        style={{ color: accent, fontFamily: displayFont }}
      >
        {brand.monogram.initials}
      </div>
      <div
        className="mt-6 whitespace-pre-line text-sm leading-relaxed"
        style={{ color: ink, fontFamily: displayFont, opacity: 0.85 }}
      >
        {copy}
      </div>
      <div className="mt-6 h-px w-10" style={{ background: accent }} />
      <div
        className="mt-3 text-xs italic"
        style={{ color: ink, opacity: 0.6, fontFamily: brand.typography.body }}
      >
        {formatDate(COUPLE.weddingDate)} · {COUPLE.venuePrimary}
      </div>
      {format === "whatsapp" && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-sage px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-ivory">
          WhatsApp-optimized
        </div>
      )}
      {format === "print" && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-ivory">
          Print-ready · CMYK · 3mm bleed
        </div>
      )}
    </div>
  );
}

function defaultInviteCopy(template: InvitationTemplate, language: string): string {
  if (language === "Hindi") {
    return "शुभ विवाह\n\nहमारे परिवार आपको सादर आमंत्रित करते हैं\nप्रिया एवं अर्जुन के\nविवाह समारोह में सम्मिलित होने हेतु।";
  }
  if (language === "Sanskrit") {
    return "॥ श्री गणेशाय नमः ॥\n\nशुभ विवाह महोत्सवे\nसादरं आमन्त्र्यन्ते।";
  }
  if (language === "Gujarati") {
    return "શુભ લગ્ન\n\nપ્રિયા અને અર્જુનના\nલગ્ન પ્રસંગે આપનું હાર્દિક સ્વાગત છે.";
  }
  return (
    `Together with their families\n` +
    `${COUPLE.person1} & ${COUPLE.person2}\n` +
    `request the pleasure of your company\n` +
    `at the celebration of their ${EVENT_META[template.event].label.toLowerCase()}.`
  );
}

function aiSuggestedCopy(template: InvitationTemplate, language: string): string {
  if (language === "Hindi") {
    return "॥ शुभमस्तु ॥\n\nहम सादर आमंत्रण प्रेषित कर रहे हैं\nआपकी उपस्थिति से ही\nयह क्षण पूर्ण होगा।\n\nप्रिया एवं अर्जुन";
  }
  return (
    `With joy in our hearts and blessings from our elders,\n` +
    `we — ${COUPLE.person1} and ${COUPLE.person2} —\n` +
    `invite you to walk with us\n` +
    `into a new beginning.\n\n` +
    `Please join us for our ${EVENT_META[template.event].label.toLowerCase()}.`
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   PRINT & SIGNAGE view
// ═══════════════════════════════════════════════════════════════════════════════════

function PrintView({
  brand,
  designs,
  onDesignsChange,
  onHistory,
  onShare,
}: {
  brand: BrandSystem;
  designs: StudioDesign[];
  onDesignsChange: (d: StudioDesign[]) => void;
  onHistory: (id: string) => void;
  onShare: (id: string) => void;
}) {
  const [kindFilter, setKindFilter] = useState<PrintKind | "all">("all");
  const filtered = PRINT_TEMPLATES.filter((t) => kindFilter === "all" || t.kind === kindFilter);
  const printDesigns = designs.filter((d) => d.kind === "print");

  const kinds: { key: PrintKind | "all"; label: string; count: number }[] = [
    { key: "all", label: "All", count: PRINT_TEMPLATES.length },
    ...(Object.keys(PRINT_META) as PrintKind[]).map((k) => ({
      key: k,
      label: PRINT_META[k].label,
      count: PRINT_TEMPLATES.filter((t) => t.kind === k).length,
    })),
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <SectionHeader
        eyebrow="Print & Signage"
        title="Day-of details"
        lede="Menus, welcome signs, seating charts, ceremony programs — auto-themed from your Brand Kit and exported print-ready."
        right={<ApplyBrandPill muted />}
      />

      {printDesigns.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-serif text-xl text-ink">In progress</h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              {printDesigns.length} active
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {printDesigns.map((d) => {
              const t = PRINT_TEMPLATES.find((tpl) => tpl.id === d.templateId);
              return (
                <DesignCard
                  key={d.id}
                  design={d}
                  thumbHue={`linear-gradient(135deg, #F5F1E8, ${t?.accentHex ?? "#C9A659"})`}
                  eventLabel={t ? PRINT_META[t.kind].label : undefined}
                  onHistory={() => onHistory(d.id)}
                  onShare={() => onShare(d.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-12 flex flex-col gap-4 border-t border-ink/5 pt-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-xl text-ink">Template library</h3>
            <NextLink
              href={`/studio/${printKindToSurface(kindFilter)}/templates`}
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-gold hover:text-ink"
            >
              Browse full library <ArrowRight size={11} />
            </NextLink>
          </div>
          <p className="mt-1 text-sm text-ink-muted">All auto-theme from your Brand Kit and export CMYK-ready PDFs with bleed.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {kinds.map((k) => (
            <button
              key={k.key}
              onClick={() => setKindFilter(k.key)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
                kindFilter === k.key
                  ? "border-ink bg-ink text-ivory"
                  : "border-ink/10 bg-card text-ink-muted hover:border-ink/30"
              )}
            >
              {k.label}
              <span className={cn("text-[9px]", kindFilter === k.key ? "opacity-60" : "opacity-50")}>
                {k.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => (
          <PrintTemplateCard
            key={t.id}
            template={t}
            brand={brand}
            onUse={() => {
              onDesignsChange([
                ...designs,
                {
                  id: `des-pr-${Date.now()}`,
                  kind: "print",
                  title: `${PRINT_META[t.kind].label.replace(/s$/, "")} — ${t.name}`,
                  templateId: t.id,
                  status: "draft",
                  author: "Priya",
                  brandApplied: true,
                  versionCount: 1,
                  collaborators: [],
                  updatedAt: new Date().toISOString(),
                },
              ]);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PrintTemplateCard({
  template,
  brand,
  onUse,
}: {
  template: PrintTemplate;
  brand: BrandSystem;
  onUse: () => void;
}) {
  const Icon = PRINT_META[template.kind].icon;
  const aspect =
    template.orientation === "landscape" ? "aspect-[4/3]" :
    template.orientation === "square" ? "aspect-square" : "aspect-[3/4]";

  return (
    <div className="group overflow-hidden rounded-xl border border-ink/10 bg-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn("relative", aspect)} style={{ background: `linear-gradient(135deg, #F5F1E8 0%, ${template.accentHex}20 100%)` }}>
        <div className="absolute inset-5 flex flex-col items-center justify-center rounded-sm border text-center" style={{ borderColor: `${template.accentHex}55`, background: "#FFFCF5" }}>
          <Icon className="h-5 w-5" style={{ color: template.accentHex }} />
          <div className="mt-3 font-mono text-[8px] uppercase tracking-[0.25em]" style={{ color: template.accentHex }}>
            {PRINT_META[template.kind].label}
          </div>
          <div className="mt-3 text-2xl" style={{ color: template.accentHex, fontFamily: brand.typography.display }}>
            {brand.monogram.initials}
          </div>
          <div className="mt-2 font-serif text-xs italic text-ink-muted">
            {COUPLE.person1} & {COUPLE.person2}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between">
          <div className="font-serif text-base text-ink">{template.name}</div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint capitalize">
            {template.orientation}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{template.description}</p>
        <div className="mt-3 flex gap-2">
          <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ink/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:bg-ivory-warm">
            <Eye className="h-3 w-3" /> Preview
          </button>
          <button
            onClick={onUse}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory hover:bg-ink-soft"
          >
            Use
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   OUTFIT STYLE GUIDE view
// ═══════════════════════════════════════════════════════════════════════════════════

const STYLE_GUIDE_EVENT_META: Record<StyleGuideEvent, {
  label: string;
  tagline: string;
  paletteRoles: Array<"primary" | "secondary" | "accent" | "ink" | "ivory" | "gold">;
}> = {
  mehendi:           { label: "Mehendi",         tagline: "Garden, henna, afternoon light",        paletteRoles: ["gold", "secondary", "ivory"] },
  sangeet:           { label: "Sangeet",         tagline: "Dance floor, shimmer, dusk",            paletteRoles: ["primary", "accent", "gold"] },
  haldi:             { label: "Haldi",           tagline: "Turmeric, marigold, morning",           paletteRoles: ["gold", "accent", "ivory"] },
  ceremony:          { label: "Ceremony",        tagline: "Sacred, formal, richly colored",        paletteRoles: ["primary", "gold", "secondary"] },
  reception:         { label: "Reception",       tagline: "Cocktails, jewel tones, evening",       paletteRoles: ["ink", "accent", "gold"] },
  "welcome-dinner":  { label: "Welcome Dinner",  tagline: "Festive but relaxed, warm-lit",         paletteRoles: ["secondary", "gold", "ivory"] },
};

const STYLE_GUIDE_THEME_LIBRARY: Record<StyleGuideEvent, StyleGuideTheme[]> = {
  mehendi: [
    { id: "meh-marigold-dusk",   name: "Marigold at Dusk",   vibe: ["earthy", "festive", "sun-kissed"],      fabrics: ["cotton", "georgette", "bandhani"], avoid: ["white", "black"], inspiration: "A courtyard, henna cones, strings of marigold overhead." },
    { id: "meh-garden-pastel",   name: "Garden Pastel",      vibe: ["soft", "botanical", "romantic"],        fabrics: ["chanderi", "organza", "linen"],    avoid: ["heavy sequins"], inspiration: "Watercolor florals, breezy lawns, champagne afternoons." },
  ],
  sangeet: [
    { id: "san-obsidian-rose",   name: "Obsidian & Rose",    vibe: ["glamorous", "cinematic", "modern"],     fabrics: ["velvet", "satin", "silk"],         avoid: ["pastel"], inspiration: "A dance floor at night, mirror work catching spotlights." },
    { id: "san-jewel-box",       name: "Jewel Box",          vibe: ["saturated", "bold", "regal"],           fabrics: ["silk", "brocade", "chiffon"],      avoid: ["nude tones"], inspiration: "Sapphire, emerald, ruby — stacked in a single frame." },
  ],
  haldi: [
    { id: "hal-saffron-sun",     name: "Saffron Sunrise",    vibe: ["warm", "joyful", "luminous"],           fabrics: ["cotton", "chanderi", "mulmul"],    avoid: ["white"], inspiration: "Marigold petals, turmeric stains, morning sun." },
  ],
  ceremony: [
    { id: "cer-temple-red",      name: "Temple Crimson",     vibe: ["sacred", "formal", "traditional"],      fabrics: ["kanjeevaram", "banarasi", "silk"], avoid: ["white", "red"], inspiration: "Deep reds, gold thread, incense smoke." },
    { id: "cer-ivory-gold",      name: "Ivory & Gold",       vibe: ["timeless", "refined", "architectural"], fabrics: ["raw silk", "tissue", "organza"],   avoid: ["neon", "denim"], inspiration: "Marble courtyards, brass diyas, long verandas." },
  ],
  reception: [
    { id: "rec-black-tie-indian",name: "Black-Tie Indian",   vibe: ["polished", "dressy", "evening"],        fabrics: ["velvet", "silk", "satin"],         avoid: ["casual cotton"], inspiration: "Bandhgala + long dresses. Crystal. Candlelight." },
    { id: "rec-midnight-garden", name: "Midnight Garden",    vibe: ["moody", "lush", "romantic"],            fabrics: ["silk", "tulle", "velvet"],         avoid: ["bright white"], inspiration: "Inky florals on dark ground, low light, slow music." },
  ],
  "welcome-dinner": [
    { id: "wel-rooftop-dusk",    name: "Rooftop Dusk",       vibe: ["relaxed", "festive", "warm"],           fabrics: ["silk", "cotton-silk", "chiffon"],  avoid: ["formal gowns"], inspiration: "String lights, open sky, a long table." },
  ],
};

function StyleGuideView({
  brand,
  designs,
  onDesignsChange,
  onHistory,
  onShare,
}: {
  brand: BrandSystem;
  designs: StudioDesign[];
  onDesignsChange: (d: StudioDesign[]) => void;
  onHistory: (id: string) => void;
  onShare: (id: string) => void;
}) {
  const guides = designs.filter((d) => d.kind === "style-guide");
  const [openGuideId, setOpenGuideId] = useState<string | null>(null);
  const openGuide = guides.find((g) => g.id === openGuideId) ?? null;

  const eventEntries = (Object.keys(STYLE_GUIDE_EVENT_META) as StyleGuideEvent[]).map((key) => ({
    key,
    ...STYLE_GUIDE_EVENT_META[key],
  }));

  const createGuide = (event: StyleGuideEvent) => {
    const meta = STYLE_GUIDE_EVENT_META[event];
    const newDesign: StudioDesign = {
      id: `des-sg-${Date.now()}`,
      kind: "style-guide",
      title: `${meta.label} Style Guide`,
      templateId: `style-guide-${event}`,
      status: "draft",
      author: "Priya",
      brandApplied: true,
      versionCount: 1,
      collaborators: [],
      updatedAt: new Date().toISOString(),
      guide: {
        entries: [{ event, themeId: null, outfits: [] }],
      },
    };
    onDesignsChange([...designs, newDesign]);
    setOpenGuideId(newDesign.id);
  };

  const updateGuide = (id: string, mutate: (g: StudioDesign) => StudioDesign) => {
    onDesignsChange(
      designs.map((d) => (d.id === id ? mutate(d) : d))
    );
  };

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <SectionHeader
        eyebrow="Outfit Style Guide"
        title="What your guests should wear"
        lede="The dress code your guests will actually read. Auto-themed from your Brand Kit, curated per event — shareable as a live link or a printed PDF."
        right={<ApplyBrandPill muted />}
      />

      {guides.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-serif text-xl text-ink">In progress</h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              {guides.length} {guides.length === 1 ? "guide" : "guides"}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((d) => {
              const firstEvent = d.guide?.entries[0]?.event;
              const meta = firstEvent ? STYLE_GUIDE_EVENT_META[firstEvent] : null;
              const accentRole = meta?.paletteRoles[0] ?? "gold";
              const accentHex = brand.palette.swatches.find((s) => s.role === accentRole)?.hex ?? "#C9A659";
              return (
                <DesignCard
                  key={d.id}
                  design={d}
                  thumbHue={`linear-gradient(135deg, #F5F1E8, ${accentHex})`}
                  eventLabel={meta?.label}
                  onOpen={() => setOpenGuideId(d.id)}
                  onHistory={() => onHistory(d.id)}
                  onShare={() => onShare(d.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {openGuide && (
        <StyleGuideBuilder
          brand={brand}
          design={openGuide}
          onClose={() => setOpenGuideId(null)}
          onUpdate={(mutate) => updateGuide(openGuide.id, mutate)}
        />
      )}

      <div className="mt-12 flex flex-col gap-4 border-t border-ink/5 pt-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-serif text-xl text-ink">Start a new guide</h3>
          <p className="mt-1 text-sm text-ink-muted">Pick an event. We'll seed theme directions from your Brand Kit — you stay in control.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {eventEntries.map((evt) => {
          const accentHex =
            brand.palette.swatches.find((s) => s.role === evt.paletteRoles[0])?.hex ?? "#C9A659";
          return (
            <button
              key={evt.key}
              onClick={() => createGuide(evt.key)}
              className="group overflow-hidden rounded-xl border border-ink/10 bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="relative aspect-[4/3]"
                style={{ background: `linear-gradient(135deg, #F5F1E8 0%, ${accentHex}30 100%)` }}
              >
                <div
                  className="absolute inset-5 flex flex-col items-center justify-center rounded-sm border text-center"
                  style={{ borderColor: `${accentHex}55`, background: "#FFFCF5" }}
                >
                  <Crown className="h-5 w-5" style={{ color: accentHex }} />
                  <div className="mt-3 font-mono text-[8px] uppercase tracking-[0.25em]" style={{ color: accentHex }}>
                    {evt.label}
                  </div>
                  <div
                    className="mt-3 font-serif text-xl"
                    style={{ color: accentHex, fontFamily: brand.typography.display }}
                  >
                    Dress Code
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between">
                  <div className="font-serif text-base text-ink">{evt.label}</div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
                    {STYLE_GUIDE_THEME_LIBRARY[evt.key].length} themes
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">{evt.tagline}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory group-hover:bg-ink-soft">
                  <Plus className="h-3 w-3" /> Start guide
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StyleGuideBuilder({
  brand,
  design,
  onClose,
  onUpdate,
}: {
  brand: BrandSystem;
  design: StudioDesign;
  onClose: () => void;
  onUpdate: (mutate: (g: StudioDesign) => StudioDesign) => void;
}) {
  const entry = design.guide?.entries[0];
  if (!entry) return null;

  const eventMeta = STYLE_GUIDE_EVENT_META[entry.event];
  const themes = STYLE_GUIDE_THEME_LIBRARY[entry.event];
  const activeTheme = themes.find((t) => t.id === entry.themeId) ?? null;

  const paletteSwatches = eventMeta.paletteRoles
    .map((role) => brand.palette.swatches.find((s) => s.role === role))
    .filter((s): s is NonNullable<typeof s> => !!s);

  const setTheme = (themeId: string) => {
    onUpdate((d) => ({
      ...d,
      updatedAt: new Date().toISOString(),
      guide: {
        entries: d.guide!.entries.map((e) =>
          e.event === entry.event ? { ...e, themeId } : e
        ),
      },
    }));
  };

  const addOutfit = (group: StyleGuideGuestGroup) => {
    onUpdate((d) => ({
      ...d,
      updatedAt: new Date().toISOString(),
      guide: {
        entries: d.guide!.entries.map((e) =>
          e.event === entry.event
            ? {
                ...e,
                outfits: [
                  ...e.outfits,
                  {
                    group,
                    mode: "garment",
                    garmentHint:
                      group === "women" ? "Lehenga, saree, or Indo-western" :
                      group === "men"   ? "Kurta or bandhgala" :
                                          "Festive Indian, comfortable",
                    dressCode: "Festive Indian",
                    note: "",
                  },
                ],
              }
            : e
        ),
      },
    }));
  };

  const removeOutfit = (idx: number) => {
    onUpdate((d) => ({
      ...d,
      updatedAt: new Date().toISOString(),
      guide: {
        entries: d.guide!.entries.map((e) =>
          e.event === entry.event
            ? { ...e, outfits: e.outfits.filter((_, i) => i !== idx) }
            : e
        ),
      },
    }));
  };

  const markStatus = (status: DesignStatus) => {
    onUpdate((d) => ({ ...d, status, updatedAt: new Date().toISOString() }));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-[640px] flex-col overflow-y-auto bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-ink/10 p-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
              {eventMeta.label} · Style Guide
            </div>
            <h2 className="mt-1 font-serif text-2xl text-ink" style={{ fontFamily: brand.typography.display }}>
              {design.title}
            </h2>
            <p className="mt-1 text-xs italic text-ink-muted">{eventMeta.tagline}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-8 p-6">
          {/* Palette preview — lifted from brand */}
          <section>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Palette for this event
            </div>
            <div className="flex gap-2">
              {paletteSwatches.map((s) => (
                <div
                  key={s.role}
                  className="flex h-14 w-14 flex-col items-center justify-end rounded-md border border-ink/10 pb-1.5 text-center"
                  style={{ background: s.hex }}
                >
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.2em]"
                    style={{ color: isLight(s.hex) ? "#1A1816" : "#FBF9F4" }}
                  >
                    {s.role}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Theme picker */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  Step 1 · Theme direction
                </div>
                <h3 className="mt-1 font-serif text-lg text-ink">Pick a mood</h3>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                Seeded · {themes.length} options
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {themes.map((t) => {
                const isActive = entry.themeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-all",
                      isActive
                        ? "border-gold bg-gold-pale/30"
                        : "border-ink/10 bg-card hover:border-ink/30"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <div className="font-serif text-base text-ink" style={{ fontFamily: brand.typography.display }}>
                        {t.name}
                      </div>
                      {isActive && <Check className="h-3.5 w-3.5 text-gold" />}
                    </div>
                    <p className="mt-1 text-xs italic leading-relaxed text-ink-muted">{t.inspiration}</p>
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {t.vibe.map((v) => (
                        <span
                          key={v}
                          className="rounded-full border border-ink/10 bg-ivory-warm px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-muted"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            {activeTheme && (
              <div className="mt-3 rounded-md border border-ink/10 bg-ivory-warm/60 p-3 text-[11px] leading-relaxed text-ink-muted">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">Fabrics:</span>{" "}
                {activeTheme.fabrics.join(", ")}
                <span className="mx-2 text-ink-faint">·</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">Avoid:</span>{" "}
                {activeTheme.avoid.join(", ")}
              </div>
            )}
          </section>

          {/* Outfit cards per group */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  Step 2 · Outfit guidance
                </div>
                <h3 className="mt-1 font-serif text-lg text-ink">Guide your guests</h3>
              </div>
              <div className="flex gap-1.5">
                {(["women", "men", "kids"] as StyleGuideGuestGroup[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => addOutfit(g)}
                    className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-card px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-muted hover:border-ink/30 hover:text-ink"
                  >
                    <Plus className="h-2.5 w-2.5" /> {g}
                  </button>
                ))}
              </div>
            </div>
            {entry.outfits.length === 0 ? (
              <div className="rounded-lg border border-dashed border-ink/15 bg-card/60 p-6 text-center text-xs text-ink-muted">
                Add a card for each guest group — women, men, kids.
              </div>
            ) : (
              <div className="space-y-2">
                {entry.outfits.map((o, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-ink/10 bg-card p-4"
                  >
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <Users className="h-3.5 w-3.5 text-gold" />
                        <span className="font-serif text-sm text-ink capitalize">{o.group}</span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                          {o.dressCode}
                        </span>
                      </div>
                      <button
                        onClick={() => removeOutfit(idx)}
                        className="rounded-md p-1 text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    {o.garmentHint && (
                      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">Wear:</span>{" "}
                        {o.garmentHint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Status controls */}
          <section className="border-t border-ink/5 pt-6">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Step 3 · Status
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["draft", "in_review", "finalized"] as DesignStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => markStatus(s)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
                    design.status === s
                      ? "border-ink bg-ink text-ivory"
                      : "border-ink/10 bg-card text-ink-muted hover:border-ink/30"
                  )}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 bg-card px-6 py-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Auto-saved · localStorage
          </span>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory hover:bg-ink-soft"
          >
            <Check className="h-3 w-3" /> Done
          </button>
        </div>
      </div>
    </div>
  );
}

function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Shared bits
// ═══════════════════════════════════════════════════════════════════════════════════

function SectionHeader({
  eyebrow,
  title,
  lede,
  right,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink/5 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
          {eyebrow}
        </div>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{lede}</p>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: DesignStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-ivory-warm px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]", meta.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

function Field({
  label,
  hint,
  small,
  children,
}: {
  label: string;
  hint?: string;
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={small ? "mt-3" : "mt-0"}>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">{label}</div>
      {hint && <div className="mt-0.5 text-xs italic text-ink-muted">{hint}</div>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function NavRow({ icon: Icon, label }: { icon: typeof Home; label: string }) {
  return (
    <button className="flex items-center justify-between rounded-md px-3 py-2 text-left text-sm text-ink-muted hover:bg-ivory-warm/60 hover:text-ink">
      <span className="flex items-center gap-2.5">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />
    </button>
  );
}

function ActionRow({
  icon: Icon,
  label,
  emphasis,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  emphasis?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
        emphasis
          ? "bg-ink text-ivory hover:bg-ink-soft"
          : "text-ink-soft hover:bg-ivory-warm/60"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      {!emphasis && <ChevronRight className="ml-auto h-3.5 w-3.5 text-ink-faint" />}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-dashed border-ink/10 pb-2 last:border-0 last:pb-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">{label}</span>
      <span className="font-serif text-sm text-ink">{value}</span>
    </div>
  );
}

function FilterChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
              value === o.key
                ? "border-ink bg-ink text-ivory"
                : "border-ink/10 bg-card text-ink-muted hover:border-ink/30"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ApplyBrandPill({ muted }: { muted?: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em]",
        muted
          ? "border-gold/30 bg-gold-pale/20 text-ink"
          : "border-gold bg-gold text-ivory"
      )}
    >
      <Paintbrush className="h-3.5 w-3.5" />
      Brand auto-applied
    </div>
  );
}

function MonogramPreviewBlock({
  brand,
  size,
  showOrnament,
}: {
  brand: BrandSystem;
  size: "lg" | "xl";
  showOrnament?: boolean;
}) {
  const ivory = brand.palette.swatches.find((s) => s.role === "ivory")?.hex ?? "#FBF9F4";
  const h = size === "xl" ? "h-60" : "h-40";
  const textSize = size === "xl" ? "text-9xl" : "text-6xl";
  const rendered = useMonogramRenderData(weddingProfileFor(brand));

  return (
    <div
      className={cn("relative flex items-center justify-center border-b border-ink/5", h)}
      style={{ background: ivory }}
    >
      {(() => {
        const template = MONOGRAM_TEMPLATES.find((t) => t.id === brand.monogramTemplateId);
        if (template) {
          const Component = MONOGRAM_COMPONENTS[template.componentKey];
          return (
            <div className="h-full w-full px-8 py-4">
              <Component {...rendered} />
            </div>
          );
        }
        return (
          <span
            className={cn("leading-none", textSize)}
            style={{ color: brand.monogram.accent, fontFamily: brand.typography.display }}
          >
            {brand.monogram.initials}
          </span>
        );
      })()}
    </div>
  );
}

function SizePreview({ brand, size, label }: { brand: BrandSystem; size: "sm" | "md" | "lg"; label: string }) {
  const dim = size === "lg" ? "h-20 text-4xl" : size === "md" ? "h-14 text-2xl" : "h-10 text-base";
  return (
    <div className="text-center">
      <div
        className={cn("flex items-center justify-center rounded-sm border border-ink/5 bg-ivory-warm", dim)}
        style={{ color: brand.monogram.accent, fontFamily: brand.typography.display }}
      >
        {brand.monogram.initials}
      </div>
      <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">{label}</div>
    </div>
  );
}

function DesignCard({
  design,
  thumbHue,
  eventLabel,
  onOpen,
  onHistory,
  onShare,
}: {
  design: StudioDesign;
  thumbHue?: string;
  eventLabel?: string;
  onOpen?: () => void;
  onHistory: () => void;
  onShare: () => void;
}) {
  return (
    <div className="group overflow-hidden rounded-xl border border-ink/10 bg-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <button onClick={onOpen} className="block w-full text-left">
        <div
          className="relative h-40 w-full"
          style={{ background: thumbHue ?? "linear-gradient(135deg,#F5F1E8,#D4A24C)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
          <div className="absolute inset-0 flex items-center justify-center text-ivory">
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-85">{eventLabel}</div>
              <div className="mt-1 font-serif text-2xl">{COUPLE.person1} & {COUPLE.person2}</div>
            </div>
          </div>
        </div>
      </button>
      <div className="flex items-start justify-between border-b border-ink/5 p-4">
        <div className="min-w-0">
          <div className="truncate font-serif text-base text-ink">{design.title}</div>
          <div className="mt-0.5 text-xs text-ink-muted">
            Edited {formatRelative(design.updatedAt)} · by {design.author}
          </div>
        </div>
        <StatusBadge status={design.status} />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex -space-x-1">
          {design.collaborators.slice(0, 3).map((c, i) => (
            <div
              key={c}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-ivory bg-ivory-warm font-mono text-[9px] uppercase tracking-wider text-ink-soft"
              title={c}
            >
              {c[0]}
            </div>
          ))}
          {design.collaborators.length > 3 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-ivory bg-ivory-warm font-mono text-[9px] text-ink-muted">
              +{design.collaborators.length - 3}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <IconBtn icon={History} title={`${design.versionCount} versions`} onClick={onHistory} />
          <IconBtn icon={Share2}  title="Share" onClick={onShare} />
          <IconBtn icon={Download} title="Export" />
        </div>
      </div>
    </div>
  );
}

function IconBtn({ icon: Icon, title, onClick }: { icon: typeof Home; title: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Brand Kit panel (slide-over)
// ═══════════════════════════════════════════════════════════════════════════════════

function BrandKitPanel({
  brand,
  onClose,
  onEditBrand,
}: {
  brand: BrandSystem;
  onClose: () => void;
  onEditBrand: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-[440px] flex-col overflow-y-auto bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-ink/10 p-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Brand Kit</div>
            <h2 className="mt-1 font-serif text-2xl text-ink">The source of truth</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-muted hover:bg-ivory-deep hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <MonogramPreviewBlock brand={brand} size="lg" showOrnament />

        <div className="space-y-6 p-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Palette</div>
            <div className="mt-2 font-serif text-base italic text-ink-soft">{brand.palette.name}</div>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {brand.palette.swatches.map((s) => (
                <div key={s.hex} className="space-y-1">
                  <div className="h-12 rounded-sm ring-1 ring-ink/5" style={{ background: s.hex }} />
                  <div className="font-mono text-[9px] uppercase tracking-wider text-ink-muted">{s.hex}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Typography</div>
            <div className="mt-2 font-serif text-base italic text-ink-soft">{brand.typography.name}</div>
            <div className="mt-3 rounded-lg bg-ivory-warm p-4">
              <div className="text-3xl text-ink" style={{ fontFamily: brand.typography.display }}>
                {COUPLE.person1} & {COUPLE.person2}
              </div>
              <div className="mt-1 text-sm text-ink-muted" style={{ fontFamily: brand.typography.body }}>
                {brand.typography.mood}
              </div>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Selected motifs</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {brand.motifs.filter((m) => m.selected).map((m) => (
                <div key={m.id} className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold-pale/20 px-3 py-1">
                  <span className="text-base" style={{ color: brand.monogram.accent }}>{m.emoji}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-ink/10 p-6">
          <button
            onClick={onEditBrand}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ivory hover:bg-ink-soft"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit Brand
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 bg-card px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft hover:bg-ivory-warm">
            <Download className="h-3.5 w-3.5" /> Export kit
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Asset library drawer
// ═══════════════════════════════════════════════════════════════════════════════════

function AssetLibraryDrawer({ onClose }: { onClose: () => void }) {
  const [filter, setFilter] = useState<"all" | Asset["kind"]>("all");
  const visible = SAMPLE_ASSETS.filter((a) => filter === "all" || a.kind === filter);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-[560px] flex-col overflow-y-auto bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-ink/10 p-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Asset library</div>
            <h2 className="mt-1 font-serif text-2xl text-ink">Your photos, graphics & AI imagery</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-muted hover:bg-ivory-deep hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-ink/10 bg-ivory-warm/30 p-4">
          <FilterChipGroup
            label=""
            options={[
              { key: "all",      label: "All" },
              { key: "photo",    label: "Photos" },
              { key: "graphic",  label: "Graphics" },
              { key: "ai_image", label: "AI-generated" },
            ]}
            value={filter}
            onChange={(v) => setFilter(v as typeof filter)}
          />
          <button className="ml-auto inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-pale/30 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink hover:bg-gold-pale/60">
            <Wand2 className="h-3 w-3" /> Generate with AI
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory hover:bg-ink-soft">
            <Upload className="h-3 w-3" /> Upload
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-6">
          {visible.map((a) => (
            <div key={a.id} className="group overflow-hidden rounded-lg border border-ink/10 bg-card">
              <div className="aspect-[4/3]" style={{ background: a.hue }} />
              <div className="p-3">
                <div className="truncate font-serif text-sm text-ink">{a.name}</div>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                  <span className="capitalize">{a.kind.replace("_", " ")}</span>
                  <span>·</span>
                  <span>{a.tags.slice(0, 2).join(" · ")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Version history modal
// ═══════════════════════════════════════════════════════════════════════════════════

function VersionHistoryModal({
  designId,
  design,
  versions,
  onClose,
}: {
  designId: string;
  design: StudioDesign;
  versions: Version[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-ink/10 p-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Version history</div>
            <h2 className="mt-1 font-serif text-2xl text-ink">{design.title}</h2>
            <p className="mt-1 text-xs text-ink-muted">
              {versions.length} tracked edits · current v{design.versionCount}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-muted hover:bg-ivory-deep hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {versions.length === 0 ? (
            <div className="p-10 text-center">
              <div className="font-serif text-xl italic text-ink-muted">
                No saved versions yet — future edits will start appearing here.
              </div>
            </div>
          ) : (
            <div className="relative px-6 py-6">
              <div className="absolute left-11 top-8 bottom-8 w-px bg-ink/10" />
              <div className="space-y-5">
                {versions.map((v, i) => (
                  <div key={v.id} className="relative flex gap-4">
                    <div
                      className={cn(
                        "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                        i === 0 ? "border-gold bg-gold text-ivory" : "border-ink/20 bg-ivory text-ink-muted"
                      )}
                    >
                      {i === 0 ? <CircleDot className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
                    </div>
                    <div className="flex-1 rounded-lg border border-ink/5 bg-card p-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="font-serif text-base text-ink">{v.label}</div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                          {formatRelative(v.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-ink-muted">
                        by {v.author} · {formatDate(v.createdAt)}
                      </div>
                      {v.note && (
                        <p className="mt-2 text-sm italic text-ink-soft">&ldquo;{v.note}&rdquo;</p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:bg-ivory-warm">
                          <Eye className="h-3 w-3" /> View
                        </button>
                        {i > 0 && (
                          <button className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:bg-ivory-warm">
                            <ChevronLeft className="h-3 w-3" /> Restore
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Share / collaboration modal
// ═══════════════════════════════════════════════════════════════════════════════════

function ShareModal({
  designId,
  design,
  onClose,
}: {
  designId: string;
  design: StudioDesign;
  onClose: () => void;
}) {
  const comments = SAMPLE_COMMENTS.filter((c) => c.designId === designId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"partner" | "family" | "planner">("family");
  const [access, setAccess] = useState<"view" | "comment" | "edit">("comment");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-ink/10 p-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Share & collaborate</div>
            <h2 className="mt-1 font-serif text-2xl text-ink">{design.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-muted hover:bg-ivory-deep hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="rounded-lg border border-ink/10 bg-card p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Invite</div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="auntie@family.com"
                className="flex-1 rounded-md border border-ink/10 bg-ivory px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="rounded-md border border-ink/10 bg-ivory px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink outline-none focus:border-gold"
              >
                <option value="partner">Partner</option>
                <option value="family">Family</option>
                <option value="planner">Planner</option>
              </select>
              <select
                value={access}
                onChange={(e) => setAccess(e.target.value as typeof access)}
                className="rounded-md border border-ink/10 bg-ivory px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink outline-none focus:border-gold"
              >
                <option value="view">Can view</option>
                <option value="comment">Can comment</option>
                <option value="edit">Can edit</option>
              </select>
              <button className="rounded-md bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ivory hover:bg-ink-soft">
                Invite
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-baseline justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Shared with</div>
              <span className="text-xs text-ink-muted">{design.collaborators.length} people</span>
            </div>
            <div className="flex flex-col divide-y divide-ink/5 rounded-lg border border-ink/10 bg-card">
              {design.collaborators.map((c) => (
                <div key={c} className="flex items-center gap-3 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ivory-warm font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                    {c[0]}
                  </div>
                  <div className="flex-1 text-sm text-ink">{c}</div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    Can comment
                  </span>
                </div>
              ))}
              {design.collaborators.length === 0 && (
                <div className="p-4 text-center text-xs italic text-ink-muted">
                  No collaborators yet. Invite someone above.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Comments ({comments.filter((c) => !c.resolved).length} open)
            </div>
            <div className="flex flex-col gap-3">
              {comments.length === 0 && (
                <div className="rounded-lg border border-dashed border-ink/15 p-4 text-center text-xs italic text-ink-muted">
                  No comments yet.
                </div>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "rounded-lg border p-3",
                    c.resolved ? "border-ink/5 bg-ivory-warm/40 opacity-70" : "border-ink/10 bg-card"
                  )}
                >
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-serif text-ink">{c.author}</span>
                      {c.resolved && (
                        <span className="rounded-full bg-sage/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-muted">
                          Resolved
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                      {formatRelative(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm italic text-ink-soft">&ldquo;{c.body}&rdquo;</p>
                  {!c.resolved && (
                    <div className="mt-2 flex gap-2">
                      <button className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold hover:text-ink">
                        Resolve
                      </button>
                      <button className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted hover:text-ink">
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
