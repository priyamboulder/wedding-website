"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────────

export type TemplateStyle =
  | "Editorial"
  | "Romantic"
  | "Modern"
  | "Traditional Indian"
  | "Minimalist"
  | "Fusion"
  | "Destination"
  | "Photo Art";

export type StyleFilter = "All" | TemplateStyle;

export type TemplatePage =
  | "Hero"
  | "Our Story"
  | "Events"
  | "Travel"
  | "RSVP"
  | "Gallery"
  | "Registry";

export interface WebsiteTemplate {
  id: string;
  name: string;
  style: TemplateStyle;
  tagline: string;
  description: string;
  palette: [string, string, string, string, string];
  heroGradient: string;
  /** Used by HtmlIframeTemplate — path under /marigold-templates/ */
  htmlFile?: string;
  /** Used by PhotoArtTemplate — slug of the category folder under /marigold-photos/ */
  photoCategory?: string;
  pagePreviews: [string, string, string, string];
  pages: TemplatePage[];
  bestFor: string[];
  typography: {
    display: string;
    body: string;
    displayClass?: string;
    bodyClass?: string;
  };
  heroLayout: "centered" | "left-aligned" | "split" | "editorial-stack";
  isNew?: boolean;
  isPopular?: boolean;
  popularity: number;
}

// ─── Filter chips ───────────────────────────────────────────────────────────────────

export const STYLE_FILTERS: StyleFilter[] = [
  "All",
  "Editorial",
  "Romantic",
  "Traditional Indian",
  "Minimalist",
  "Destination",
  "Fusion",
  "Modern",
  "Photo Art",
];

// ─── Catalog — 9 real HTML templates + 8 Marigold photo-art templates ──────────────

export const TEMPLATES: WebsiteTemplate[] = [

  // ══════════════════════════════════════════════════════
  //  HTML TEMPLATES  (rendered live via iframe)
  // ══════════════════════════════════════════════════════

  {
    id: "baroque-dark-rose",
    name: "Baroque Dark Rose",
    style: "Romantic",
    tagline: "Wine, shadow, and velvet drama",
    description:
      "A dark, moody baroque template drenched in wine and rose. Deep black hero, gallery-style photography layout, scroll-reveal animations. For couples who want their wedding site to feel like an art exhibition.",
    palette: ["#0A0808", "#5A1A24", "#8A4048", "#C09898", "#F0E8E4"],
    heroGradient: "linear-gradient(135deg, #0A0808 0%, #5A1A24 60%, #8A4048 100%)",
    htmlFile: "baroque-dark-rose.html",
    pagePreviews: [
      "linear-gradient(135deg, #0A0808 0%, #5A1A24 60%, #8A4048 100%)",
      "linear-gradient(160deg, #0A0808 0%, #1E1818 100%)",
      "linear-gradient(180deg, #5A1A24 0%, #8A4048 100%)",
      "linear-gradient(135deg, #1E1818 0%, #5A1A24 55%, #C09898 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Dark aesthetic weddings", "Moody evening receptions", "Art-forward couples"],
    typography: { display: "Gilda Display", body: "Karla", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "centered",
    isNew: true,
    isPopular: true,
    popularity: 94,
  },

  {
    id: "botanica-peony-initials",
    name: "Botanica Peony",
    style: "Romantic",
    tagline: "Pressed petals, peony blush",
    description:
      "A lush botanical template featuring peony initials, pressed-flower motifs, and a soft blush-to-ivory palette. Delicate and feminine without being saccharine. Ideal for garden ceremonies and floral-heavy aesthetics.",
    palette: ["#F5EDE8", "#E8B4B8", "#C47A8A", "#8B4F5E", "#FAF5F0"],
    heroGradient: "linear-gradient(135deg, #FAF5F0 0%, #F5EDE8 40%, #E8B4B8 80%, #C47A8A 100%)",
    htmlFile: "botanica-peony-initials.html",
    pagePreviews: [
      "linear-gradient(135deg, #FAF5F0 0%, #F5EDE8 40%, #E8B4B8 80%, #C47A8A 100%)",
      "linear-gradient(180deg, #FAF5F0 0%, #F5EDE8 100%)",
      "linear-gradient(160deg, #E8B4B8 0%, #C47A8A 100%)",
      "linear-gradient(135deg, #F5EDE8 0%, #E8B4B8 60%, #8B4F5E 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Garden weddings", "Floral ceremonies", "Blush & peach palettes"],
    typography: { display: "Cormorant Garamond", body: "Lato", displayClass: "font-serif italic", bodyClass: "font-sans" },
    heroLayout: "centered",
    isNew: true,
    isPopular: true,
    popularity: 91,
  },

  {
    id: "celestial-midnight",
    name: "Celestial Midnight",
    style: "Editorial",
    tagline: "Stars, ink, and gold constellations",
    description:
      "Midnight navy with fine gold constellation illustrations. An astronomical editorial template for the couple whose love story is written in the stars — or who simply want something breathtaking and unexpected.",
    palette: ["#0D1B2A", "#1A3050", "#C9A961", "#E8DCC8", "#F4EFE4"],
    heroGradient: "radial-gradient(ellipse at 30% 40%, #1A3050 0%, #0D1B2A 60%, #000810 100%)",
    htmlFile: "celestial-midnight.html",
    pagePreviews: [
      "radial-gradient(ellipse at 30% 40%, #1A3050 0%, #0D1B2A 60%, #000810 100%)",
      "linear-gradient(180deg, #0D1B2A 0%, #1A3050 100%)",
      "linear-gradient(135deg, #0D1B2A 0%, #C9A961 100%)",
      "linear-gradient(165deg, #1A3050 0%, #C9A961 60%, #E8DCC8 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Night ceremonies", "Stargazing venues", "Celestial aesthetics"],
    typography: { display: "Cinzel", body: "Raleway", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "editorial-stack",
    isNew: true,
    isPopular: true,
    popularity: 96,
  },

  {
    id: "destination-vineyard-date",
    name: "Destination Vineyard",
    style: "Destination",
    tagline: "Golden hour, vine rows, dusk warmth",
    description:
      "Warm ochre and terracotta evoke golden-hour light across a vineyard. A destination template for long-table dinners, rolling hills, and the kind of wedding that doubles as a holiday for your guests.",
    palette: ["#C4813A", "#E8B97A", "#8B5E3C", "#F5E8D0", "#2A1F0F"],
    heroGradient: "linear-gradient(135deg, #2A1F0F 0%, #8B5E3C 40%, #C4813A 75%, #E8B97A 100%)",
    htmlFile: "destination-vineyard-date.html",
    pagePreviews: [
      "linear-gradient(135deg, #2A1F0F 0%, #8B5E3C 40%, #C4813A 75%, #E8B97A 100%)",
      "linear-gradient(180deg, #F5E8D0 0%, #E8B97A 100%)",
      "linear-gradient(165deg, #8B5E3C 0%, #C4813A 100%)",
      "linear-gradient(135deg, #F5E8D0 0%, #C4813A 60%, #2A1F0F 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Vineyard weddings", "European destinations", "Golden-hour aesthetics"],
    typography: { display: "Playfair Display", body: "Lato", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "left-aligned",
    isNew: true,
    popularity: 83,
  },

  {
    id: "editorial-citrus-grove",
    name: "Editorial Citrus Grove",
    style: "Editorial",
    tagline: "Ink-black type, citrus burst",
    description:
      "Sharp editorial black with vivid citrus yellow-orange pops — an unexpected pairing that photographs brilliantly and reads memorably. For bold couples who want their wedding site to look like a magazine cover.",
    palette: ["#0F0F0F", "#F0A500", "#E8640A", "#FAF5EC", "#1A1A1A"],
    heroGradient: "linear-gradient(110deg, #0F0F0F 0%, #0F0F0F 45%, #F0A500 45%, #F0A500 75%, #E8640A 100%)",
    htmlFile: "editorial-citrus-grove.html",
    pagePreviews: [
      "linear-gradient(110deg, #0F0F0F 0%, #0F0F0F 45%, #F0A500 45%, #F0A500 75%, #E8640A 100%)",
      "linear-gradient(180deg, #FAF5EC 0%, #F0A500 100%)",
      "linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)",
      "linear-gradient(165deg, #E8640A 0%, #F0A500 55%, #FAF5EC 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Bold editorial couples", "City weddings", "High-contrast aesthetics"],
    typography: { display: "Archivo Black", body: "Inter", displayClass: "font-sans", bodyClass: "font-sans" },
    heroLayout: "split",
    isNew: true,
    popularity: 88,
  },

  {
    id: "orchard-blood-orange",
    name: "Orchard Blood Orange",
    style: "Modern",
    tagline: "Blood orange, orchard cream, harvest dusk",
    description:
      "Rich blood orange and warm cream — a harvest palette that feels simultaneously modern and deeply warm. For couples who want color-forward without the drama of dark templates.",
    palette: ["#C0392B", "#E8673A", "#F5C5A0", "#FAF0E6", "#2C1810"],
    heroGradient: "linear-gradient(135deg, #2C1810 0%, #C0392B 40%, #E8673A 75%, #F5C5A0 100%)",
    htmlFile: "orchard-blood-orange.html",
    pagePreviews: [
      "linear-gradient(135deg, #2C1810 0%, #C0392B 40%, #E8673A 75%, #F5C5A0 100%)",
      "linear-gradient(180deg, #FAF0E6 0%, #F5C5A0 100%)",
      "linear-gradient(165deg, #C0392B 0%, #E8673A 100%)",
      "linear-gradient(135deg, #FAF0E6 0%, #E8673A 60%, #2C1810 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Autumn weddings", "Warm-palette ceremonies", "Color-forward couples"],
    typography: { display: "Fraunces", body: "Inter", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "centered",
    isNew: true,
    popularity: 80,
  },

  {
    id: "photo-classic",
    name: "Photo Classic",
    style: "Minimalist",
    tagline: "Photos first, everything else second",
    description:
      "A clean, photo-forward minimal template that lets your wedding photography do all the work. No competing flourishes — just generous white space, elegant serif type, and your images at full width.",
    palette: ["#FFFFFF", "#F5F5F5", "#1A1A1A", "#C9A961", "#8A8A8A"],
    heroGradient: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)",
    htmlFile: "photo-classic.html",
    pagePreviews: [
      "linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)",
      "linear-gradient(180deg, #F5F5F5 0%, #FFFFFF 100%)",
      "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 55%, #C9A961 100%)",
      "linear-gradient(165deg, #F5F5F5 0%, #FFFFFF 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Photo-forward couples", "Minimalist taste", "Clean modern aesthetics"],
    typography: { display: "Cormorant Garamond", body: "Inter", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "centered",
    isNew: true,
    popularity: 77,
  },

  {
    id: "pichwai-nandi",
    name: "Pichwai Nandi",
    style: "Traditional Indian",
    tagline: "Sacred blues, folk gold, Pichwai devotion",
    description:
      "Inspired by the Nathdwara Pichwai painting tradition — deep indigo and teal with gold lotus borders, folk motifs, and a devotional warmth. For couples who want their wedding site to feel like an heirloom.",
    palette: ["#1A3A5C", "#2E6B8A", "#C9A961", "#E8DCC8", "#F4EFE4"],
    heroGradient: "radial-gradient(ellipse at 50% 30%, #2E6B8A 0%, #1A3A5C 60%, #0D2640 100%)",
    htmlFile: "pichwai-nandi.html",
    pagePreviews: [
      "radial-gradient(ellipse at 50% 30%, #2E6B8A 0%, #1A3A5C 60%, #0D2640 100%)",
      "linear-gradient(180deg, #1A3A5C 0%, #2E6B8A 100%)",
      "linear-gradient(135deg, #1A3A5C 0%, #C9A961 100%)",
      "linear-gradient(165deg, #2E6B8A 0%, #C9A961 60%, #E8DCC8 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Traditional Hindu weddings", "Pichwai-inspired decor", "Heritage ceremonies"],
    typography: { display: "Cinzel", body: "Raleway", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "centered",
    isNew: true,
    isPopular: true,
    popularity: 89,
  },

  {
    id: "udaipur-v4",
    name: "Udaipur Royal",
    style: "Destination",
    tagline: "Lake Palace, champagne & rose gold",
    description:
      "Champagne, rose gold, and soft ivory — the refined palette of a lake palace wedding. Flowing script headings, generous photography sections, and a scroll experience that feels like turning through a luxury magazine.",
    palette: ["#E8D5B8", "#C9A980", "#8B6B4A", "#F5EFE8", "#1A1208"],
    heroGradient: "linear-gradient(135deg, #F5EFE8 0%, #E8D5B8 40%, #C9A980 75%, #8B6B4A 100%)",
    htmlFile: "udaipur-template-v4.html",
    pagePreviews: [
      "linear-gradient(135deg, #F5EFE8 0%, #E8D5B8 40%, #C9A980 75%, #8B6B4A 100%)",
      "linear-gradient(180deg, #F5EFE8 0%, #E8D5B8 100%)",
      "linear-gradient(165deg, #C9A980 0%, #8B6B4A 100%)",
      "linear-gradient(135deg, #F5EFE8 0%, #C9A980 60%, #1A1208 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Palace weddings", "Destination Rajasthan", "Luxury ceremonies"],
    typography: { display: "Cormorant Garamond", body: "Montserrat", displayClass: "font-serif italic", bodyClass: "font-sans" },
    heroLayout: "centered",
    isNew: true,
    isPopular: true,
    popularity: 92,
  },

  // ══════════════════════════════════════════════════════
  //  MARIGOLD PHOTO-ART TEMPLATES  (photo background + overlay)
  // ══════════════════════════════════════════════════════

  {
    id: "marigold-abstract",
    name: "Abstract Watercolor",
    style: "Photo Art",
    tagline: "Ink washes, saffron and indigo",
    description:
      "Your wedding details set against stunning AI-art watercolor washes — abstract saffron, burgundy, dusty mauve, and deep indigo bleeds on rice paper. Each page uses a different artwork as its hero background.",
    palette: ["#E8640A", "#5A1E4A", "#C0A8C0", "#F5E8D0", "#1A0808"],
    heroGradient: "url('/marigold-photos/abstract/Uma_Patel_Abstract_ink_wash_in_saffron_orange_and_burgundy_on_wet_rice_pape_08fe28a1-bfac-49a4-9401-803851ac77fe.jpg')",
    photoCategory: "abstract",
    pagePreviews: [
      "linear-gradient(135deg, #E8640A 0%, #5A1E4A 60%, #1A0808 100%)",
      "linear-gradient(160deg, #F5E8D0 0%, #C0A8C0 100%)",
      "linear-gradient(180deg, #5A1E4A 0%, #E8640A 100%)",
      "linear-gradient(135deg, #1A0808 0%, #5A1E4A 55%, #E8640A 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Artistic couples", "Abstract art lovers", "Colorful bohemian weddings"],
    typography: { display: "Cormorant Garamond", body: "Nunito Sans", displayClass: "font-serif italic", bodyClass: "font-sans" },
    heroLayout: "centered",
    isNew: true,
    popularity: 79,
  },

  {
    id: "marigold-celestial",
    name: "Celestial Gold",
    style: "Photo Art",
    tagline: "Constellation maps, gold ink on midnight",
    description:
      "Fine gold constellation and moon illustrations on deep charcoal grounds. A cosmic love story — wedding details float over hand-drawn star maps, crescent moons, and eclipsed suns in gold ink.",
    palette: ["#0D0D0D", "#2A2A2A", "#C9A961", "#E8DCC8", "#F4EFE4"],
    heroGradient: "url('/marigold-photos/celestial/02_Celestial_pattern.jpg')",
    photoCategory: "celestial",
    pagePreviews: [
      "radial-gradient(ellipse at 30% 40%, #2A2A2A 0%, #0D0D0D 70%)",
      "linear-gradient(180deg, #0D0D0D 0%, #2A2A2A 100%)",
      "linear-gradient(135deg, #0D0D0D 0%, #C9A961 100%)",
      "linear-gradient(165deg, #2A2A2A 0%, #C9A961 60%, #E8DCC8 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Night sky themes", "Gold accent decor", "Celestial motifs"],
    typography: { display: "Cinzel", body: "Raleway", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "editorial-stack",
    isNew: true,
    isPopular: true,
    popularity: 85,
  },

  {
    id: "marigold-fauna",
    name: "Fauna & Butterfly",
    style: "Photo Art",
    tagline: "Fine ink butterflies, watercolor wings",
    description:
      "Delicate watercolor butterflies and hand-drawn fauna in fine ink. Each section of your wedding site frames a different creature — butterflies, birds, insects — all in jewel-toned ink washes.",
    palette: ["#4A7CA0", "#A0C8D0", "#E8B8A0", "#F5EDE8", "#1A1A2A"],
    heroGradient: "url('/marigold-photos/fauna/Uma_Patel_Single_butterfly_with_wings_open_drawn_in_fine_ink_with_soft_wate_22644b25-8cbe-470a-a15e-e7d6f925d14d.jpg')",
    photoCategory: "fauna",
    pagePreviews: [
      "linear-gradient(135deg, #1A1A2A 0%, #4A7CA0 50%, #A0C8D0 100%)",
      "linear-gradient(180deg, #F5EDE8 0%, #E8B8A0 100%)",
      "linear-gradient(165deg, #4A7CA0 0%, #A0C8D0 100%)",
      "linear-gradient(135deg, #F5EDE8 0%, #A0C8D0 60%, #4A7CA0 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Nature-themed weddings", "Butterfly gardens", "Soft whimsical aesthetics"],
    typography: { display: "Playfair Display", body: "Lato", displayClass: "font-serif italic", bodyClass: "font-sans" },
    heroLayout: "centered",
    isNew: true,
    popularity: 72,
  },

  {
    id: "marigold-field",
    name: "Field & Harvest",
    style: "Photo Art",
    tagline: "Autumn leaves, pomegranates, wild botanicals",
    description:
      "Ink drawings of maple leaves, pomegranates, wildflowers, and harvest botanicals in warm autumnal tones. A grounded, earthy template that feels like stepping into a countryside afternoon.",
    palette: ["#8B4A1C", "#C97A3A", "#E8B870", "#F5EAD0", "#1A0808"],
    heroGradient: "url('/marigold-photos/field/Uma_Patel_Autumn_maple_leaves_in_various_stages_of_turning_drawn_in_fine_in_9a6e9c14-fb4d-4a26-9fcd-7e6d8af779bd.jpg')",
    photoCategory: "field",
    pagePreviews: [
      "linear-gradient(135deg, #1A0808 0%, #8B4A1C 45%, #C97A3A 80%, #E8B870 100%)",
      "linear-gradient(180deg, #F5EAD0 0%, #E8B870 100%)",
      "linear-gradient(165deg, #8B4A1C 0%, #C97A3A 100%)",
      "linear-gradient(135deg, #F5EAD0 0%, #C97A3A 60%, #1A0808 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Autumn weddings", "Rustic countryside", "Harvest & orchard venues"],
    typography: { display: "Fraunces", body: "Inter", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "left-aligned",
    isNew: true,
    popularity: 74,
  },

  {
    id: "marigold-flora",
    name: "Flora Botanica",
    style: "Photo Art",
    tagline: "Dark roses, dried jasmine, botanical gold",
    description:
      "Lush botanical illustrations — dark garden roses, dried jasmine garlands, gold-foil peony on navy, pressed eucalyptus. An opulent floral template where every section is a different artwork.",
    palette: ["#2C1A2A", "#6B1E3A", "#C9A961", "#E8D0B8", "#F5EFE8"],
    heroGradient: "url('/marigold-photos/flora/Uma_Patel_Dark_botanical_arrangement_of_dried_flowers_and_seed_pods_in_mute_b4c8a04f-8993-4dbb-9495-fccf58b6a760.jpg')",
    photoCategory: "flora",
    pagePreviews: [
      "linear-gradient(135deg, #2C1A2A 0%, #6B1E3A 50%, #C9A961 100%)",
      "linear-gradient(180deg, #F5EFE8 0%, #E8D0B8 100%)",
      "linear-gradient(165deg, #6B1E3A 0%, #2C1A2A 100%)",
      "linear-gradient(135deg, #F5EFE8 0%, #C9A961 60%, #2C1A2A 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Floral-first weddings", "Dark botanical aesthetics", "Luxury floral decor"],
    typography: { display: "Cormorant Garamond", body: "Nunito Sans", displayClass: "font-serif italic", bodyClass: "font-sans" },
    heroLayout: "centered",
    isNew: true,
    isPopular: true,
    popularity: 90,
  },

  {
    id: "marigold-folklore",
    name: "Folklore & Spice",
    style: "Traditional Indian",
    tagline: "Paisley, Ganesha, toile, and spice maps",
    description:
      "Rich Indian folk art patterns — paisley blocks, Ganesha line drawings, spice illustrations, toile prints. A playfully traditional template that draws from India's folk and textile heritage.",
    palette: ["#6B2020", "#C9802A", "#E8C878", "#F5EAD0", "#1A0A0A"],
    heroGradient: "url('/marigold-photos/folklore/05_Spices_pattern.jpg')",
    photoCategory: "folklore",
    pagePreviews: [
      "linear-gradient(135deg, #1A0A0A 0%, #6B2020 45%, #C9802A 80%, #E8C878 100%)",
      "linear-gradient(180deg, #F5EAD0 0%, #E8C878 100%)",
      "linear-gradient(165deg, #6B2020 0%, #C9802A 100%)",
      "radial-gradient(circle at 50% 50%, #E8C878 0%, #C9802A 50%, #6B2020 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Traditional Hindu weddings", "Folk art-inspired decor", "Heritage celebrations"],
    typography: { display: "Cinzel", body: "Raleway", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "centered",
    isNew: true,
    isPopular: true,
    popularity: 87,
  },

  {
    id: "marigold-skylines",
    name: "Skylines & Sepia",
    style: "Destination",
    tagline: "City ink, Amalfi cliffs, gold skylines",
    description:
      "Fine sepia and gold ink drawings of city skylines and coastal landscapes — Amalfi cliffs, global skylines, destination panoramas. For couples who met across cities or are marrying at a destination.",
    palette: ["#3A2A1A", "#8B6A42", "#C9A961", "#E8DCC8", "#F5F0E8"],
    heroGradient: "url('/marigold-photos/skylines-travel/Uma_Patel_Amalfi_Coast_cliffside_village_drawn_in_fine_sepia_ink_on_cream_p_ce4c2ee3-cc53-4c88-a923-f15fc6b00eff.jpg')",
    photoCategory: "skylines-travel",
    pagePreviews: [
      "linear-gradient(135deg, #3A2A1A 0%, #8B6A42 50%, #C9A961 100%)",
      "linear-gradient(180deg, #F5F0E8 0%, #E8DCC8 100%)",
      "linear-gradient(165deg, #8B6A42 0%, #C9A961 100%)",
      "linear-gradient(135deg, #F5F0E8 0%, #C9A961 60%, #3A2A1A 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Destination weddings", "City-hopping couples", "Travel-themed celebrations"],
    typography: { display: "Playfair Display", body: "Montserrat", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "editorial-stack",
    isNew: true,
    popularity: 76,
  },

  {
    id: "marigold-top-picks",
    name: "Marigold Curated",
    style: "Photo Art",
    tagline: "The very best: Paisley, Lotus, Butterflies",
    description:
      "Six hand-curated artworks — a Folklore Paisley, Diyas & Lanterns, Butterflies, Lotus, Woodland Mushrooms, and Pomegranates. The best of the Marigold collection in one elegant template.",
    palette: ["#6B2020", "#C9A961", "#4A7CA0", "#8B6B3A", "#F5EAD0"],
    heroGradient: "url('/marigold-photos/top-picks/A_Folklore_Paisley.jpg')",
    photoCategory: "top-picks",
    pagePreviews: [
      "linear-gradient(135deg, #6B2020 0%, #C9A961 50%, #4A7CA0 100%)",
      "linear-gradient(180deg, #F5EAD0 0%, #C9A961 100%)",
      "linear-gradient(165deg, #4A7CA0 0%, #6B2020 100%)",
      "radial-gradient(circle at 50% 50%, #C9A961 0%, #6B2020 50%, #4A7CA0 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Eclectic aesthetics", "Mixed-motif decor", "Curated art lovers"],
    typography: { display: "Cormorant Garamond", body: "Lato", displayClass: "font-serif italic", bodyClass: "font-sans" },
    heroLayout: "centered",
    isNew: true,
    isPopular: true,
    popularity: 93,
  },
];

// ─── Staff picks ───────────────────────────────────────────────────────────────────

export const STAFF_PICK_IDS: readonly string[] = [
  "celestial-midnight",
  "pichwai-nandi",
  "marigold-top-picks",
  "baroque-dark-rose",
  "marigold-flora",
];

export function getStaffPicks(): WebsiteTemplate[] {
  const byId = new Map(TEMPLATES.map((t) => [t.id, t]));
  return STAFF_PICK_IDS.map((id) => byId.get(id)).filter(
    (t): t is WebsiteTemplate => Boolean(t),
  );
}

// ─── Staff Picks row ───────────────────────────────────────────────────────────────

interface StaffPicksRowProps {
  appliedTemplateId?: string | null;
  onPreview: (templateId: string) => void;
  onDetails: (templateId: string) => void;
}

export function StaffPicksRow({
  appliedTemplateId,
  onPreview,
  onDetails,
}: StaffPicksRowProps) {
  const picks = getStaffPicks();

  return (
    <section aria-labelledby="staff-picks-heading" className="mb-12">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-gold">
            <span aria-hidden>✦</span>
            Staff Picks
          </div>
          <h2
            id="staff-picks-heading"
            className="mt-2 font-serif text-[22px] leading-tight text-ink"
          >
            Editor-curated, five to start with
          </h2>
        </div>
        <p className="hidden max-w-xs text-right text-[12.5px] leading-relaxed text-ink-muted md:block">
          A mix of our most striking templates — the ones we&apos;d hand a couple first.
        </p>
      </div>

      <div className="panel-scroll -mx-10 overflow-x-auto px-10 pb-2">
        <ul className="flex min-w-full gap-5">
          {picks.map((t) => (
            <li key={t.id} className="flex-shrink-0">
              <StaffPickCard
                template={t}
                isApplied={t.id === appliedTemplateId}
                onPreview={() => onPreview(t.id)}
                onDetails={() => onDetails(t.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StaffPickCard({
  template,
  isApplied,
  onPreview,
  onDetails,
}: {
  template: WebsiteTemplate;
  isApplied: boolean;
  onPreview: () => void;
  onDetails: () => void;
}) {
  const isPhotoArt = Boolean(template.photoCategory);
  const isHtmlTemplate = Boolean(template.htmlFile);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative w-[360px] overflow-hidden rounded-xl border bg-card p-4 transition-colors",
        isApplied
          ? "border-gold/70 shadow-[0_2px_0_0_rgba(184,134,11,0.15),0_14px_36px_-16px_rgba(26,26,26,0.22)]"
          : "border-ink/10 shadow-[0_2px_0_0_rgba(26,26,26,0.04),0_8px_20px_-10px_rgba(26,26,26,0.14)] hover:border-ink/25",
      )}
    >
      <span
        aria-hidden
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-gold/95 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-ivory shadow-sm"
      >
        ✦ Staff Pick
      </span>

      <button
        type="button"
        onClick={onPreview}
        aria-label={`Preview ${template.name}`}
        className="relative block w-full overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        {isPhotoArt && template.photoCategory ? (
          <div
            className="aspect-[16/10] w-full bg-cover bg-center"
            style={{
              backgroundImage: template.heroGradient,
              backgroundSize: "cover",
            }}
          />
        ) : (
          <div
            className="aspect-[16/10] w-full"
            style={{ background: template.heroGradient }}
          />
        )}
        <div className="pointer-events-none absolute bottom-3 right-3 flex gap-1.5">
          {isHtmlTemplate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory/95 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink">
              Live
            </span>
          )}
          {template.isNew && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory/95 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink">
              <Sparkles className="h-2.5 w-2.5" /> New
            </span>
          )}
          {template.isPopular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory/95 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink">
              <Heart className="h-2.5 w-2.5" /> Loved
            </span>
          )}
        </div>
      </button>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-serif italic text-[12.5px] text-ink/60">Wedding Website Template</div>
          <h3 className="mt-0.5 truncate font-serif text-[20px] leading-tight text-ink">
            {template.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-muted">
            {template.tagline}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          {template.style}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onDetails}
          className="group/det inline-flex items-center font-mono text-[10px] uppercase tracking-[0.24em] text-ink transition-colors"
        >
          <span className="border-b border-ink/40 pb-0.5 group-hover/det:border-ink">
            Details
          </span>
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          {template.typography.display}
        </span>
      </div>
    </motion.article>
  );
}
