"use client";

// ═══════════════════════════════════════════════════════════════════════════════════
//   TEMPLATE CATALOG — 24 curated wedding-site templates
//
//   Drop-in data + helpers for TemplateGallery. Extends the original TemplateStyle
//   union with "Fusion" and "Destination" and adds heroGradient to the template
//   shape. The array stays compatible with the existing WebsiteTemplate interface
//   in TemplateGallery.tsx — heroGradient mirrors pagePreviews[0] so legacy code
//   that reads pagePreviews keeps working.
// ═══════════════════════════════════════════════════════════════════════════════════

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
  | "Destination";

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

// ─── Filter chips (segmented control) ──────────────────────────────────────────────

export const STYLE_FILTERS: StyleFilter[] = [
  "All",
  "Editorial",
  "Romantic",
  "Modern",
  "Traditional Indian",
  "Minimalist",
  "Fusion",
  "Destination",
];

// ─── Catalog ───────────────────────────────────────────────────────────────────────

export const TEMPLATES: WebsiteTemplate[] = [
  // ═══════════ Original 9 ═══════════
  {
    id: "jodhpur",
    name: "Jodhpur",
    style: "Editorial",
    tagline: "Indigo walls, marble courtyards",
    description:
      "Named for the Blue City. An editorial take with deep indigo hero, oversized serif display, and a single photograph that does the talking. Quiet confidence — a magazine cover for your wedding.",
    palette: ["#1E3A5F", "#2D5380", "#C9A961", "#F5E6C8", "#FAF7F2"],
    heroGradient: "linear-gradient(135deg, #1E3A5F 0%, #2D5380 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #1E3A5F 0%, #2D5380 100%)",
      "linear-gradient(160deg, #F5E6C8 0%, #FAF7F2 100%)",
      "linear-gradient(180deg, #1E3A5F 0%, #1E3A5F 55%, #C9A961 55%, #C9A961 100%)",
      "linear-gradient(135deg, #FAF7F2 0%, #F5E6C8 55%, #C9A961 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Destination weddings", "Multi-day celebrations", "Editorial storytelling"],
    typography: { display: "Fraunces", body: "Inter", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "editorial-stack",
    isPopular: true,
    popularity: 97,
  },
  {
    id: "udaipur",
    name: "Udaipur",
    style: "Romantic",
    tagline: "Lake palace, peach horizon",
    description:
      "Soft peach washes, floral botanical texture, and flowing script accents. Built for the sunset-on-the-lake kind of wedding. Romance without cliché.",
    palette: ["#E8C4B8", "#F5E0D6", "#C97B63", "#B8860B", "#FAF7F2"],
    heroGradient: "linear-gradient(135deg, #E8C4B8 0%, #F5E0D6 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #E8C4B8 0%, #F5E0D6 100%)",
      "linear-gradient(165deg, #FAF7F2 0%, #F5E0D6 100%)",
      "linear-gradient(180deg, #F5E0D6 0%, #E8C4B8 100%)",
      "linear-gradient(135deg, #C97B63 0%, #E8C4B8 70%, #F5E0D6 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Sunset ceremonies", "Floral-heavy decor", "Intimate ceremonies"],
    typography: { display: "Fraunces", body: "Inter", displayClass: "font-serif italic", bodyClass: "font-sans" },
    heroLayout: "centered",
    isPopular: true,
    popularity: 92,
  },
  {
    id: "chettinad",
    name: "Chettinad",
    style: "Traditional Indian",
    tagline: "Mansion red, temple gold",
    description:
      "Rich maroon backdrop with gold motifs inspired by Chettinad mansion tilework. Weighted serifs, layered textures, and room for Sanskrit or Tamil alongside English.",
    palette: ["#7B1E22", "#9E2B25", "#C9A659", "#D4A843", "#F5F1E8"],
    heroGradient: "linear-gradient(135deg, #7B1E22 0%, #9E2B25 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #7B1E22 0%, #9E2B25 100%)",
      "linear-gradient(160deg, #F5F1E8 0%, #C9A659 100%)",
      "linear-gradient(180deg, #9E2B25 0%, #7B1E22 100%)",
      "linear-gradient(135deg, #C9A659 0%, #9E2B25 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Temple ceremonies", "Heritage celebrations", "Bilingual invitations"],
    typography: { display: "Fraunces", body: "Inter", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "centered",
    popularity: 81,
  },
  {
    id: "kerala",
    name: "Kerala",
    style: "Minimalist",
    tagline: "Backwaters, palm-leaf hush",
    description:
      "Ivory canvas with sage palm-leaf accents. Breathing space over ornament. For couples who want their content and photos to lead, with the template receding politely.",
    palette: ["#FAF7F2", "#E8F0E0", "#9CAF88", "#2F5D50", "#1A1A1A"],
    heroGradient: "linear-gradient(135deg, #FAF7F2 0%, #E8F0E0 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #FAF7F2 0%, #E8F0E0 100%)",
      "linear-gradient(180deg, #FAF7F2 0%, #FAF7F2 70%, #E8F0E0 100%)",
      "linear-gradient(135deg, #E8F0E0 0%, #9CAF88 100%)",
      "linear-gradient(165deg, #FAF7F2 0%, #E8F0E0 60%, #9CAF88 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Intimate ceremonies", "Nature venues", "Photo-forward sites"],
    typography: { display: "Fraunces", body: "Inter", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "left-aligned",
    isPopular: true,
    popularity: 88,
  },
  {
    id: "jaipur",
    name: "Jaipur",
    style: "Traditional Indian",
    tagline: "Saffron sun, rose stone",
    description:
      "Bold saffron paired with dusty rose. Arched frames, marigold motifs, and room for confident color blocks. A Rajasthani maximalism that stays editorial.",
    palette: ["#D4A24C", "#C97B63", "#9E2B25", "#F0E4C8", "#FAF7F2"],
    heroGradient: "linear-gradient(135deg, #D4A24C 0%, #C97B63 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #D4A24C 0%, #C97B63 100%)",
      "linear-gradient(160deg, #F0E4C8 0%, #D4A24C 100%)",
      "linear-gradient(180deg, #C97B63 0%, #9E2B25 100%)",
      "linear-gradient(135deg, #F0E4C8 0%, #C97B63 60%, #9E2B25 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Palace venues", "Vibrant decor", "Multi-day celebrations"],
    typography: { display: "Fraunces", body: "Inter", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "split",
    popularity: 84,
  },
  {
    id: "goa",
    name: "Goa",
    style: "Editorial",
    tagline: "Coastline, washed sand",
    description:
      "Airy, coastal, unhurried. Washed sand tones, a single deep-green accent, and oversized photography. For beach-side mandaps and week-long celebrations by the sea.",
    palette: ["#F5E0D6", "#DDA08A", "#1F5E4B", "#C9A961", "#FBF9F4"],
    heroGradient: "linear-gradient(135deg, #F5E0D6 0%, #DDA08A 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #F5E0D6 0%, #DDA08A 100%)",
      "linear-gradient(180deg, #FBF9F4 0%, #F5E0D6 100%)",
      "linear-gradient(135deg, #1F5E4B 0%, #9CAF88 100%)",
      "linear-gradient(165deg, #FBF9F4 0%, #DDA08A 60%, #1F5E4B 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Beach weddings", "Destination celebrations", "Long-stay guests"],
    typography: { display: "Fraunces", body: "Inter", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "left-aligned",
    isNew: true,
    popularity: 76,
  },
  {
    id: "banaras",
    name: "Banaras",
    style: "Traditional Indian",
    tagline: "Ghats at dawn, ivory silk",
    description:
      "Classical. Ivory background, deep maroon and gold accents, and Devanagari-inspired display lettering paired with English. Devotional without being heavy.",
    palette: ["#F4EFE4", "#9E2B25", "#B8860B", "#EDE7D9", "#1A1A1A"],
    heroGradient: "linear-gradient(135deg, #F4EFE4 0%, #EDE7D9 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #F4EFE4 0%, #EDE7D9 100%)",
      "linear-gradient(160deg, #F4EFE4 0%, #B8860B 100%)",
      "linear-gradient(180deg, #F4EFE4 0%, #F4EFE4 60%, #9E2B25 60%, #9E2B25 100%)",
      "linear-gradient(135deg, #EDE7D9 0%, #B8860B 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Temple ceremonies", "Bilingual invitations", "Traditional families"],
    typography: { display: "Fraunces", body: "Inter", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "centered",
    popularity: 73,
  },
  {
    id: "kashmir",
    name: "Kashmir",
    style: "Romantic",
    tagline: "Pale sky, chinar leaves",
    description:
      "Serene pale blues with botanical illustration accents. A soft, unhurried tone that makes room for poetry and long-form story. For couples who want their words to lead.",
    palette: ["#DCE7EF", "#A8C0D0", "#3E6382", "#C9A659", "#FAF7F2"],
    heroGradient: "linear-gradient(135deg, #DCE7EF 0%, #A8C0D0 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #DCE7EF 0%, #A8C0D0 100%)",
      "linear-gradient(165deg, #FAF7F2 0%, #DCE7EF 100%)",
      "linear-gradient(180deg, #DCE7EF 0%, #3E6382 100%)",
      "linear-gradient(135deg, #FAF7F2 0%, #DCE7EF 60%, #A8C0D0 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Mountain venues", "Long-form stories", "Soft aesthetics"],
    typography: { display: "Fraunces", body: "Inter", displayClass: "font-serif italic", bodyClass: "font-sans" },
    heroLayout: "centered",
    popularity: 70,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    style: "Modern",
    tagline: "Art-deco ink, ivory geometry",
    description:
      "High-contrast ink and ivory with sharp deco geometry. Uncompromising sans pairings, generous negative space, and a gold accent that earns every appearance.",
    palette: ["#1A1A1A", "#FAF7F2", "#C9A961", "#6B6B6B", "#EDE7D9"],
    heroGradient: "linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #1A1A1A 0%, #2E2E2E 100%)",
      "linear-gradient(180deg, #FAF7F2 0%, #EDE7D9 100%)",
      "linear-gradient(135deg, #FAF7F2 0%, #FAF7F2 50%, #1A1A1A 50%, #1A1A1A 100%)",
      "linear-gradient(165deg, #1A1A1A 0%, #C9A961 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["City weddings", "Modernist couples", "Black-tie receptions"],
    typography: { display: "Fraunces", body: "Inter", displayClass: "font-serif", bodyClass: "font-sans" },
    heroLayout: "split",
    isNew: true,
    popularity: 79,
  },

  // ═══════════ Romantic (3 new) ═══════════
  {
    id: "pondicherry",
    name: "Pondicherry",
    style: "Romantic",
    tagline: "Candlelight, colonial shutters",
    description:
      "Warm taupe, terracotta, and a whisper of sepia — the unhurried romance of a French-quarter courtyard at dusk. Built for candlelit ceremonies and long handwritten vows.",
    palette: ["#EFE5D6", "#D9A9A0", "#A05742", "#6B4423", "#FBF6EC"],
    heroGradient:
      "radial-gradient(ellipse at 30% 40%, #F5D9B8 0%, #D9A9A0 40%, #A05742 85%, #6B4423 100%)",
    pagePreviews: [
      "radial-gradient(ellipse at 30% 40%, #F5D9B8 0%, #D9A9A0 40%, #A05742 85%, #6B4423 100%)",
      "linear-gradient(170deg, #FBF6EC 0%, #EFE5D6 65%, #D9A9A0 100%)",
      "linear-gradient(180deg, #EFE5D6 0%, #D9A9A0 55%, #A05742 100%)",
      "radial-gradient(circle at 75% 80%, #F5D9B8 0%, #A05742 70%, #6B4423 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Candlelit ceremonies", "Intimate nikah or sangam", "Courtyard weddings"],
    typography: {
      display: "Cormorant Garamond",
      body: "Nunito Sans",
      displayClass: "font-serif italic",
      bodyClass: "font-sans",
    },
    heroLayout: "centered",
    isNew: true,
    isPopular: true,
    popularity: 85,
  },
  {
    id: "coorg",
    name: "Coorg",
    style: "Romantic",
    tagline: "Coffee blossom, morning mist",
    description:
      "Misty sage and blush rose against ivory. The softness of a plantation garden after rain — made for couples who want botanical warmth without the usual floral clichés.",
    palette: ["#B8C8B0", "#E4B4B8", "#4A5D3E", "#A89662", "#F5F2EA"],
    heroGradient:
      "linear-gradient(135deg, #F5F2EA 0%, #B8C8B0 35%, #E4B4B8 70%, #4A5D3E 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #F5F2EA 0%, #B8C8B0 35%, #E4B4B8 70%, #4A5D3E 100%)",
      "linear-gradient(175deg, #F5F2EA 0%, #E4B4B8 100%)",
      "radial-gradient(ellipse at 60% 30%, #E4B4B8 0%, #B8C8B0 60%, #4A5D3E 100%)",
      "linear-gradient(165deg, #F5F2EA 0%, #B8C8B0 55%, #A89662 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Garden weddings", "Plantation venues", "Monsoon-season intimacy"],
    typography: {
      display: "Playfair Display",
      body: "Lato",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "left-aligned",
    isNew: true,
    popularity: 72,
  },
  {
    id: "munnar",
    name: "Munnar",
    style: "Romantic",
    tagline: "Monsoon rain, tea-hill silver",
    description:
      "Rainy slate, mossy green, and pearl-grey cloud. A monsoon-tinged romance for the couple whose story unfolds in gentle weather — quieter, cooler, more contemplative.",
    palette: ["#5C6E7A", "#4A6B4E", "#B5B9BC", "#D9B5B0", "#EFEFE9"],
    heroGradient:
      "linear-gradient(180deg, #B5B9BC 0%, #5C6E7A 45%, #4A6B4E 100%)",
    pagePreviews: [
      "linear-gradient(180deg, #B5B9BC 0%, #5C6E7A 45%, #4A6B4E 100%)",
      "linear-gradient(170deg, #EFEFE9 0%, #B5B9BC 80%, #5C6E7A 100%)",
      "radial-gradient(ellipse at 50% 20%, #D9B5B0 0%, #B5B9BC 50%, #5C6E7A 100%)",
      "linear-gradient(135deg, #4A6B4E 0%, #5C6E7A 55%, #B5B9BC 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Monsoon weddings", "Hill-station venues", "Poetry-forward storytelling"],
    typography: {
      display: "Italiana",
      body: "Montserrat",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "editorial-stack",
    isNew: true,
    popularity: 68,
  },

  // ═══════════ Traditional Indian (2 new) ═══════════
  {
    id: "madurai",
    name: "Madurai",
    style: "Traditional Indian",
    tagline: "Temple gopuram, kanjivaram gold",
    description:
      "Temple red and kanjivaram green framed in heirloom gold. An unapologetically South Indian template for four-day ceremonies with nadaswaram, silk, and saffron on every surface.",
    palette: ["#9A2A2A", "#2F5D50", "#E0B74C", "#D98F3E", "#F8F2E5"],
    heroGradient:
      "radial-gradient(circle at 50% 100%, #E0B74C 0%, #D98F3E 30%, #9A2A2A 70%, #2F5D50 100%)",
    pagePreviews: [
      "radial-gradient(circle at 50% 100%, #E0B74C 0%, #D98F3E 30%, #9A2A2A 70%, #2F5D50 100%)",
      "linear-gradient(165deg, #F8F2E5 0%, #E0B74C 100%)",
      "linear-gradient(180deg, #9A2A2A 0%, #9A2A2A 55%, #E0B74C 55%, #E0B74C 100%)",
      "conic-gradient(from 180deg at 50% 50%, #E0B74C 0deg, #9A2A2A 120deg, #2F5D50 240deg, #E0B74C 360deg)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["South Indian weddings", "Temple ceremonies", "Kanjivaram & silk themes"],
    typography: {
      display: "Cinzel",
      body: "Raleway",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "centered",
    isNew: true,
    popularity: 75,
  },
  {
    id: "amritsar",
    name: "Amritsar",
    style: "Traditional Indian",
    tagline: "Golden Temple dawn, gurdwara calm",
    description:
      "Saffron, warm gold, and deep crimson anchored in ivory — the devotional tone of a Sikh ceremony without the heaviness. Quiet room for Gurmukhi alongside English, for Anand Karaj and langar alike.",
    palette: ["#E8912F", "#D4A24C", "#8B1E2D", "#F4EEDF", "#1E2A4F"],
    heroGradient:
      "radial-gradient(ellipse at 50% 50%, #F4EEDF 0%, #D4A24C 40%, #E8912F 75%, #8B1E2D 100%)",
    pagePreviews: [
      "radial-gradient(ellipse at 50% 50%, #F4EEDF 0%, #D4A24C 40%, #E8912F 75%, #8B1E2D 100%)",
      "linear-gradient(170deg, #F4EEDF 0%, #D4A24C 100%)",
      "linear-gradient(180deg, #1E2A4F 0%, #8B1E2D 55%, #D4A24C 100%)",
      "linear-gradient(135deg, #F4EEDF 0%, #E8912F 50%, #8B1E2D 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Anand Karaj ceremonies", "Punjabi weddings", "Gurdwara and langar"],
    typography: {
      display: "Prata",
      body: "DM Sans",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "split",
    isNew: true,
    isPopular: true,
    popularity: 82,
  },

  // ═══════════ Editorial (2 new) ═══════════
  {
    id: "kolkata",
    name: "Kolkata",
    style: "Editorial",
    tagline: "Bengali literary, fashion-week ink",
    description:
      "Inky black against vintage cream with bursts of deep wine and antique brass. A Vogue India cover applied to a wedding site — for couples who want their invitation to feel like a masthead.",
    palette: ["#121212", "#E8DFCE", "#5E1B2B", "#A58147", "#D7B2A6"],
    heroGradient:
      "linear-gradient(110deg, #121212 0%, #121212 42%, #E8DFCE 42%, #E8DFCE 78%, #D7B2A6 100%)",
    pagePreviews: [
      "linear-gradient(110deg, #121212 0%, #121212 42%, #E8DFCE 42%, #E8DFCE 78%, #D7B2A6 100%)",
      "linear-gradient(180deg, #E8DFCE 0%, #D7B2A6 100%)",
      "radial-gradient(ellipse at 30% 70%, #5E1B2B 0%, #121212 70%)",
      "linear-gradient(135deg, #A58147 0%, #5E1B2B 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Fashion-forward couples", "Heritage Bengali weddings", "Editorial storytelling"],
    typography: {
      display: "Bodoni Moda",
      body: "Work Sans",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "editorial-stack",
    isNew: true,
    isPopular: true,
    popularity: 89,
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    style: "Editorial",
    tagline: "Nizami emerald, pearl & gold",
    description:
      "Deep emerald washed with burnished gold — the jewelled interior of a Nizami durbar, reframed as magazine minimalism. For couples whose aesthetic is quiet opulence.",
    palette: ["#0F4A42", "#083230", "#D4A24C", "#E8DDCA", "#1A1A1A"],
    heroGradient:
      "radial-gradient(circle at 20% 20%, #D4A24C 0%, #0F4A42 50%, #083230 100%)",
    pagePreviews: [
      "radial-gradient(circle at 20% 20%, #D4A24C 0%, #0F4A42 50%, #083230 100%)",
      "linear-gradient(165deg, #E8DDCA 0%, #D4A24C 100%)",
      "linear-gradient(180deg, #083230 0%, #0F4A42 55%, #D4A24C 100%)",
      "linear-gradient(135deg, #E8DDCA 0%, #0F4A42 70%, #083230 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Nikah ceremonies", "Biryani feast receptions", "Jewel-tone decor"],
    typography: {
      display: "Libre Caslon Display",
      body: "Manrope",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "split",
    isNew: true,
    popularity: 78,
  },

  // ═══════════ Minimalist (2 new) ═══════════
  {
    id: "auroville",
    name: "Auroville",
    style: "Minimalist",
    tagline: "Sumi-ink restraint, ochre breath",
    description:
      "A Japanese-inflected minimalism — off-white paper, warm sand, a single ochre brushstroke. For couples who believe a wedding site can hold silence as well as celebration.",
    palette: ["#EFEAE0", "#D8CEBD", "#2A2A2A", "#8B8578", "#B89466"],
    heroGradient:
      "linear-gradient(180deg, #EFEAE0 0%, #EFEAE0 70%, #D8CEBD 100%)",
    pagePreviews: [
      "linear-gradient(180deg, #EFEAE0 0%, #EFEAE0 70%, #D8CEBD 100%)",
      "linear-gradient(165deg, #EFEAE0 0%, #D8CEBD 100%)",
      "linear-gradient(135deg, #EFEAE0 0%, #EFEAE0 78%, #B89466 78%, #B89466 100%)",
      "radial-gradient(ellipse at 80% 80%, #B89466 0%, #D8CEBD 70%, #EFEAE0 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Intimate civil ceremonies", "Photo-led storytelling", "Japanese-Indian fusion"],
    typography: {
      display: "Cormorant",
      body: "IBM Plex Sans",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "left-aligned",
    isNew: true,
    popularity: 71,
  },
  {
    id: "shillong",
    name: "Shillong",
    style: "Minimalist",
    tagline: "Pine fog, Scandi calm",
    description:
      "Foggy whites, pine greens, and muted red — a Scandinavian restraint that makes space for Northeast India's quieter weddings. Built for small guest lists and large photo essays.",
    palette: ["#F2F0EB", "#3F4A52", "#4A6053", "#A0564E", "#DDC5B8"],
    heroGradient:
      "linear-gradient(180deg, #F2F0EB 0%, #DDC5B8 50%, #3F4A52 100%)",
    pagePreviews: [
      "linear-gradient(180deg, #F2F0EB 0%, #DDC5B8 50%, #3F4A52 100%)",
      "linear-gradient(165deg, #F2F0EB 0%, #DDC5B8 100%)",
      "linear-gradient(135deg, #4A6053 0%, #3F4A52 100%)",
      "linear-gradient(165deg, #F2F0EB 0%, #4A6053 60%, #A0564E 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "RSVP", "Gallery"],
    bestFor: ["Small guest lists", "Northeastern ceremonies", "Photo-led storytelling"],
    typography: {
      display: "EB Garamond",
      body: "Source Sans 3",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "left-aligned",
    isNew: true,
    popularity: 66,
  },

  // ═══════════ Fusion (3 new) ═══════════
  {
    id: "bangalore",
    name: "Bangalore",
    style: "Fusion",
    tagline: "Courthouse linens, coral dusk",
    description:
      "Ink and warm ivory with a spark of electric coral and denim blue. A contemporary Indo-Western template for civil-plus-ceremony weekends and multi-faith celebrations.",
    palette: ["#1A1A1A", "#F7F3EC", "#E86250", "#3D5A80", "#D9D5CC"],
    heroGradient:
      "linear-gradient(110deg, #F7F3EC 0%, #F7F3EC 55%, #E86250 55%, #E86250 78%, #3D5A80 100%)",
    pagePreviews: [
      "linear-gradient(110deg, #F7F3EC 0%, #F7F3EC 55%, #E86250 55%, #E86250 78%, #3D5A80 100%)",
      "linear-gradient(180deg, #F7F3EC 0%, #D9D5CC 100%)",
      "linear-gradient(135deg, #3D5A80 0%, #1A1A1A 100%)",
      "conic-gradient(from 45deg at 50% 50%, #E86250 0deg, #F7F3EC 120deg, #3D5A80 240deg, #E86250 360deg)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Indo-Western weddings", "Civil + ceremony weekends", "Multi-faith celebrations"],
    typography: {
      display: "Syne",
      body: "Inter",
      displayClass: "font-sans",
      bodyClass: "font-sans",
    },
    heroLayout: "split",
    isNew: true,
    isPopular: true,
    popularity: 80,
  },
  {
    id: "delhi",
    name: "Delhi",
    style: "Fusion",
    tagline: "Metropolitan lilac, mustard ink",
    description:
      "Dusty lilac, mustard, and blush on a cream canvas. Built for the big-city Delhi wedding that blends half-a-dozen traditions in a single weekend — and wants the website to hold them all without apology.",
    palette: ["#B8A7C7", "#C8A64C", "#2A2A2A", "#E8C6C0", "#F6F1E6"],
    heroGradient:
      "linear-gradient(135deg, #F6F1E6 0%, #B8A7C7 35%, #E8C6C0 65%, #C8A64C 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #F6F1E6 0%, #B8A7C7 35%, #E8C6C0 65%, #C8A64C 100%)",
      "linear-gradient(180deg, #F6F1E6 0%, #E8C6C0 100%)",
      "linear-gradient(165deg, #B8A7C7 0%, #2A2A2A 100%)",
      "radial-gradient(ellipse at 70% 30%, #C8A64C 0%, #B8A7C7 55%, #2A2A2A 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Multi-cultural celebrations", "Big-city weddings", "Five-hundred-guest receptions"],
    typography: {
      display: "Frank Ruhl Libre",
      body: "Karla",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "editorial-stack",
    isNew: true,
    popularity: 74,
  },
  {
    id: "chandigarh",
    name: "Chandigarh",
    style: "Fusion",
    tagline: "Corbusier concrete, terracotta block",
    description:
      "Concrete grey, terracotta, and mustard in Corbusier proportion — a modernist Indo-Western template for couples whose taste lives somewhere between a Punjabi baraat and a design studio.",
    palette: ["#9E9892", "#C77B4A", "#D4A149", "#3E4A7A", "#F1ECE0"],
    heroGradient:
      "linear-gradient(110deg, #9E9892 0%, #9E9892 50%, #C77B4A 50%, #C77B4A 75%, #D4A149 100%)",
    pagePreviews: [
      "linear-gradient(110deg, #9E9892 0%, #9E9892 50%, #C77B4A 50%, #C77B4A 75%, #D4A149 100%)",
      "linear-gradient(180deg, #F1ECE0 0%, #9E9892 100%)",
      "linear-gradient(135deg, #3E4A7A 0%, #9E9892 100%)",
      "linear-gradient(135deg, #F1ECE0 0%, #D4A149 50%, #C77B4A 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Modernist couples", "Punjabi-Western fusion", "Architecture-forward decor"],
    typography: {
      display: "Archivo",
      body: "Space Grotesk",
      displayClass: "font-sans",
      bodyClass: "font-sans",
    },
    heroLayout: "left-aligned",
    isNew: true,
    popularity: 69,
  },

  // ═══════════ Destination (3 new) ═══════════
  {
    id: "jaisalmer",
    name: "Jaisalmer",
    style: "Destination",
    tagline: "Sandstone palace, desert dusk",
    description:
      "Sandstone gold fading to cobalt twilight — the golden hour of a desert palace wedding. Built for hilltop havelis, camel processions, and the long goodbye of a Thar sunset.",
    palette: ["#D4A95E", "#C17A4A", "#8B5A2B", "#F5E8CC", "#2E3A5C"],
    heroGradient:
      "linear-gradient(180deg, #D4A95E 0%, #C17A4A 35%, #8B5A2B 65%, #2E3A5C 100%)",
    pagePreviews: [
      "linear-gradient(180deg, #D4A95E 0%, #C17A4A 35%, #8B5A2B 65%, #2E3A5C 100%)",
      "linear-gradient(165deg, #F5E8CC 0%, #D4A95E 100%)",
      "radial-gradient(ellipse at 50% 100%, #D4A95E 0%, #8B5A2B 55%, #2E3A5C 100%)",
      "linear-gradient(135deg, #F5E8CC 0%, #C17A4A 60%, #2E3A5C 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Palace weddings", "Desert destinations", "Week-long celebrations"],
    typography: {
      display: "DM Serif Display",
      body: "Outfit",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "editorial-stack",
    isNew: true,
    isPopular: true,
    popularity: 86,
  },
  {
    id: "alibaug",
    name: "Alibaug",
    style: "Destination",
    tagline: "Sea-glass horizon, driftwood calm",
    description:
      "Sea-glass blue, driftwood, and a blush of coral. An unhurried coastal destination template for ferry-in guests, toes-in-sand ceremonies, and long evenings of surmai curry.",
    palette: ["#A8C8C0", "#C8B299", "#E69A7E", "#F5F0E8", "#2C3E50"],
    heroGradient:
      "radial-gradient(ellipse at 50% 40%, #F5F0E8 0%, #A8C8C0 50%, #2C3E50 100%)",
    pagePreviews: [
      "radial-gradient(ellipse at 50% 40%, #F5F0E8 0%, #A8C8C0 50%, #2C3E50 100%)",
      "linear-gradient(180deg, #F5F0E8 0%, #C8B299 100%)",
      "linear-gradient(135deg, #E69A7E 0%, #A8C8C0 100%)",
      "linear-gradient(165deg, #F5F0E8 0%, #A8C8C0 60%, #2C3E50 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery"],
    bestFor: ["Beach weddings", "Coastal destinations", "Ferry-in guest logistics"],
    typography: {
      display: "Josefin Slab",
      body: "Poppins",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "centered",
    isNew: true,
    popularity: 73,
  },
  {
    id: "nashik",
    name: "Nashik",
    style: "Destination",
    tagline: "Vineyard dusk, Sula evenings",
    description:
      "Wine-red, olive, and terracotta on lavender twilight — India's wine country as a destination template. For vineyard ceremonies, long-table dinners, and a European pace with Indian warmth.",
    palette: ["#6B2036", "#8B9554", "#C47A5A", "#F3EDE0", "#A891B0"],
    heroGradient:
      "linear-gradient(135deg, #F3EDE0 0%, #C47A5A 35%, #6B2036 75%, #A891B0 100%)",
    pagePreviews: [
      "linear-gradient(135deg, #F3EDE0 0%, #C47A5A 35%, #6B2036 75%, #A891B0 100%)",
      "linear-gradient(180deg, #F3EDE0 0%, #8B9554 100%)",
      "linear-gradient(165deg, #6B2036 0%, #A891B0 100%)",
      "radial-gradient(ellipse at 70% 70%, #C47A5A 0%, #6B2036 70%, #A891B0 100%)",
    ],
    pages: ["Hero", "Our Story", "Events", "Travel", "RSVP", "Gallery", "Registry"],
    bestFor: ["Vineyard weddings", "European-style destinations", "Long-table receptions"],
    typography: {
      display: "Della Respira",
      body: "Alegreya Sans",
      displayClass: "font-serif",
      bodyClass: "font-sans",
    },
    heroLayout: "left-aligned",
    isNew: true,
    popularity: 67,
  },
];

// ─── Staff picks ───────────────────────────────────────────────────────────────────

export const STAFF_PICK_IDS: readonly string[] = [
  "jodhpur",
  "pondicherry",
  "kolkata",
  "jaisalmer",
  "udaipur",
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
          A mix of old favorites and new arrivals — the ones we&apos;d hand a couple first.
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
        <div
          className="aspect-[16/10] w-full"
          style={{ background: template.heroGradient }}
        />
        <div className="pointer-events-none absolute bottom-3 right-3 flex gap-1.5">
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
