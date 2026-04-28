"use client";

// ─────────────────────────────────────────────────────────────────────────
// Ananya Jewelry Workspace — couple-facing creative exploration for
// bridal and groom jewelry, with a dedicated surface for heirloom and
// borrowed family pieces. Single-file React component, localStorage-backed.
// Mirrors the Photography workspace's design language and component rhythm.
// ─────────────────────────────────────────────────────────────────────────

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ContractChecklistBlock } from "@/components/workspace/shared/ContractChecklistBlock";
import type { WorkspaceCategory } from "@/types/workspace";

// ─── Palette ─────────────────────────────────────────────────────────────
const C = {
  ivory: "#FBF9F4",
  ivorySoft: "#FAF7F2",
  overlay: "#FBFAF7",
  paper: "#FFFFFF",
  champagne: "#F2EDE3",
  champagnePale: "#FBFAF7",
  gold: "#B8860B",
  goldDeep: "#8B6508",
  goldSoft: "#F0E4C8",
  ink: "#1A1A1A",
  inkSoft: "#2E2E2E",
  muted: "#6B6B6B",
  faint: "#A3A3A3",
  line: "rgba(26, 26, 26, 0.08)",
  lineSoft: "rgba(26, 26, 26, 0.04)",
  accent: "#C97B63",
  leaf: "#9CAF88",
};

const FONT_SERIF = `"Cormorant Garamond", "Playfair Display", Georgia, serif`;
const FONT_SANS = `Inter, system-ui, sans-serif`;
const FONT_MONO = `"JetBrains Mono", "Fira Code", monospace`;

// ─── Types ───────────────────────────────────────────────────────────────
type Reaction = "love" | "skip" | null;

type JewelryTag =
  | "necklace"
  | "earrings"
  | "maang_tikka"
  | "haath_phool"
  | "nath"
  | "bangles"
  | "rings"
  | "groom";

type JewelryEventKey =
  | "mehendi"
  | "sangeet"
  | "haldi"
  | "wedding"
  | "reception";

type EventAudience = "bride" | "groom" | "both";

type MetalTone = "warm_gold" | "rose_gold" | "cool_platinum" | "oxidized";

type BaseMetal = "gold" | "silver" | "diamond" | "platinum";

type JewelryStyleId =
  | "kundan"
  | "polki"
  | "temple_gold"
  | "jadau"
  | "meenakari"
  | "antique_gold"
  | "chandanhar"
  | "oxidized_tribal"
  | "temple_silver"
  | "filigree_silver"
  | "polki_diamond"
  | "uncut_diamond"
  | "solitaire_modern"
  | "pave_diamond"
  | "platinum_modern"
  | "white_gold_contemporary";

type JewelryVibe =
  | "simple_delicate"
  | "heavy_statement"
  | "modern_twist"
  | "fully_traditional";

type CelebrityReaction = "love" | "skip" | null;

type HeirloomStatus = "confirmed" | "pending" | "declined";

type PieceType =
  | "necklace"
  | "earrings"
  | "bangles"
  | "maang_tikka"
  | "nath"
  | "ring"
  | "anklet"
  | "brooch_pin"
  | "other";

interface MoodImage {
  id: string;
  url: string;
  tag: JewelryTag;
  note: string;
}

interface OutfitLook {
  id: string;
  eventKey: JewelryEventKey;
  side: "bride" | "groom";
  photoUrl: string;
  caption: string;
  pairedRefIds: string[];
}

interface EventRef {
  id: string;
  url: string;
  note: string;
  reaction: Reaction;
  source: "ai" | "user";
  audience: EventAudience;
}

interface EventBlock {
  key: JewelryEventKey;
  label: string;
  refs: EventRef[];
  desires: string[];
  audienceFilter: EventAudience;
}

interface Heirloom {
  id: string;
  photoUrl: string;
  fromWhom: string;
  pieceType: PieceType;
  events: JewelryEventKey[];
  notes: string;
  careNotes: string;
  status: HeirloomStatus;
}

interface Note {
  id: string;
  body: string;
  at: number;
}

export interface JewelryState {
  quizDone: boolean;
  brief: string;
  styleKeywords: string[];
  metalTone: MetalTone;
  metalHexes: string[];
  baseMetals: BaseMetal[];
  jewelryStyles: JewelryStyleId[];
  vibes: JewelryVibe[];
  celebrityReactions: Record<string, CelebrityReaction>;
  moodboard: MoodImage[];
  activeMoodTag: JewelryTag | "all";
  looks: OutfitLook[];
  events: EventBlock[];
  moments: string[];
  heirlooms: Heirloom[];
  notes: Note[];
}

// ─── Seeds ───────────────────────────────────────────────────────────────
const EVENT_KEYS: Array<{ key: JewelryEventKey; label: string }> = [
  { key: "mehendi", label: "Mehendi" },
  { key: "sangeet", label: "Sangeet" },
  { key: "haldi", label: "Haldi" },
  { key: "wedding", label: "Wedding" },
  { key: "reception", label: "Reception" },
];

const SUGGESTED_KEYWORDS = [
  "kundan",
  "polki",
  "temple",
  "jadau",
  "diamond",
  "minimalist",
  "statement",
  "vintage",
  "layered",
  "delicate",
  "uncut diamond",
  "pearl",
  "meenakari",
  "antique gold",
  "rose gold",
  "platinum",
  "fusion",
  "contemporary",
  "rani haar",
  "choker-forward",
];

const MOMENT_SUGGESTIONS = [
  "I want everyone to gasp when I walk out for the pheras",
  "My rani haar catching the light during the varmala",
  "Mom clasping the mangalsutra for the first time",
  "The kalgi on his safa during the baraat entrance",
  "Grandmother's bangles stacked with the new set",
  "A single tikka glinting during the joota chupai",
  "My maang tikka resting just right during the saat phere",
  "The nath coming off before the vidaai",
];

const AI_REFS: Record<JewelryEventKey, Array<{ url: string; audience: EventAudience }>> = {
  mehendi: [
    { url: "https://images.unsplash.com/photo-1610030006930-8b1b18b60b38?w=600", audience: "bride" },
    { url: "https://images.unsplash.com/photo-1604608672516-f1b9b1d1e9b5?w=600", audience: "bride" },
    { url: "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=600", audience: "bride" },
    { url: "https://images.unsplash.com/photo-1595940293613-19d8d97f7a4f?w=600", audience: "groom" },
  ],
  sangeet: [
    { url: "https://images.unsplash.com/photo-1583939411023-14783179e581?w=600", audience: "bride" },
    { url: "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=600", audience: "bride" },
    { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600", audience: "groom" },
    { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600", audience: "bride" },
  ],
  haldi: [
    { url: "https://images.unsplash.com/photo-1609042900109-2b04fae5a1b9?w=600", audience: "bride" },
    { url: "https://images.unsplash.com/photo-1600721391776-b5cd0e0048a9?w=600", audience: "bride" },
    { url: "https://images.unsplash.com/photo-1617183428445-0e1adf2c8b03?w=600", audience: "groom" },
    { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600", audience: "bride" },
  ],
  wedding: [
    { url: "https://images.unsplash.com/photo-1600122854034-16f0c0aaa79f?w=600", audience: "bride" },
    { url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600", audience: "bride" },
    { url: "https://images.unsplash.com/photo-1529519195486-16945f0fb37f?w=600", audience: "groom" },
    { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600", audience: "both" },
  ],
  reception: [
    { url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600", audience: "bride" },
    { url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600", audience: "bride" },
    { url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600", audience: "groom" },
    { url: "https://images.unsplash.com/photo-1600189261867-8e7c8f3a4a6d?w=600", audience: "both" },
  ],
};

const METAL_TONE_META: Record<
  MetalTone,
  { label: string; hint: string; swatches: string[] }
> = {
  warm_gold: {
    label: "Warm gold",
    hint: "Classic 22k warmth, antique finish, heritage-forward.",
    swatches: ["#C99A2C", "#E6C46B", "#F5E1A3", "#7A4E16", "#2B1E0E"],
  },
  rose_gold: {
    label: "Rose gold",
    hint: "Blush copper warmth — softer, more modern, reads romantic.",
    swatches: ["#C08478", "#E7B7A6", "#F4D6CC", "#8A4B3E", "#2A1612"],
  },
  cool_platinum: {
    label: "Cool platinum",
    hint: "White metals and diamonds — clean, silvery, contemporary.",
    swatches: ["#D7D9DE", "#EDEEF1", "#A8ADB5", "#4C5159", "#1E2226"],
  },
  oxidized: {
    label: "Oxidized silver",
    hint: "Darkened metal with antique patina — editorial, moody, quiet.",
    swatches: ["#6E6A63", "#A39E94", "#D2CCBE", "#302D27", "#16130F"],
  },
};

// ─── Jewelry type discovery seeds ───────────────────────────────────────
const BASE_METAL_META: Record<
  BaseMetal,
  { label: string; hint: string; image: string; accent: string }
> = {
  gold: {
    label: "Gold",
    hint: "Traditional, warm — the foundation of Indian bridal jewelry.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
    accent: "#C99A2C",
  },
  silver: {
    label: "Silver",
    hint: "Oxidized, temple-inspired, tribal — quieter and editorial.",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800",
    accent: "#8E8F92",
  },
  diamond: {
    label: "Diamond",
    hint: "Polki, uncut, modern solitaire — luminous and timeless.",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800",
    accent: "#BDC2CA",
  },
  platinum: {
    label: "Platinum / White gold",
    hint: "Modern, cool-toned, contemporary — clean and understated.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
    accent: "#A8ADB5",
  },
};

const BASE_METAL_ORDER: BaseMetal[] = ["gold", "silver", "diamond", "platinum"];

const JEWELRY_STYLE_META: Record<
  JewelryStyleId,
  {
    label: string;
    baseMetal: BaseMetal;
    description: string;
    image: string;
    keyword: string;
  }
> = {
  kundan: {
    label: "Kundan",
    baseMetal: "gold",
    description: "Glass and gemstones set in gold foil — Rajasthani heritage.",
    image: "https://images.unsplash.com/photo-1611107683227-e9060eccd846?w=600",
    keyword: "kundan",
  },
  polki: {
    label: "Polki",
    baseMetal: "gold",
    description: "Uncut diamonds set in gold — Mughal-era tradition.",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600",
    keyword: "polki",
  },
  temple_gold: {
    label: "Temple",
    baseMetal: "gold",
    description: "South Indian temple architecture rendered in gold.",
    image: "https://images.unsplash.com/photo-1603561596112-db542a03bff8?w=600",
    keyword: "temple",
  },
  jadau: {
    label: "Jadau",
    baseMetal: "gold",
    description: "Gemstones embedded into gold — elaborate Rajasthani craft.",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600",
    keyword: "jadau",
  },
  meenakari: {
    label: "Meenakari",
    baseMetal: "gold",
    description: "Enameled goldwork — colorful reverse-side detail.",
    image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600",
    keyword: "meenakari",
  },
  antique_gold: {
    label: "Antique gold",
    baseMetal: "gold",
    description: "Matte finish, vintage feel, heirloom patina.",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600",
    keyword: "antique gold",
  },
  chandanhar: {
    label: "Chandanhar",
    baseMetal: "gold",
    description: "Long, layered gold necklace — Maharashtrian & Gujarati tradition.",
    image: "https://images.unsplash.com/photo-1620656798932-902fd3f0f1b9?w=600",
    keyword: "layered",
  },
  oxidized_tribal: {
    label: "Oxidized tribal",
    baseMetal: "silver",
    description: "Darkened silver with tribal motifs — bold and editorial.",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600",
    keyword: "vintage",
  },
  temple_silver: {
    label: "Temple silver",
    baseMetal: "silver",
    description: "Temple motifs in silver — South Indian, quieter tone.",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600",
    keyword: "temple",
  },
  filigree_silver: {
    label: "Filigree silver",
    baseMetal: "silver",
    description: "Delicate wirework silver — Odisha & Karimnagar traditions.",
    image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600",
    keyword: "delicate",
  },
  polki_diamond: {
    label: "Polki",
    baseMetal: "diamond",
    description: "Uncut polki diamonds — flat, lustrous, heritage-forward.",
    image: "https://images.unsplash.com/photo-1535632066274-66c07c5b2a44?w=600",
    keyword: "polki",
  },
  uncut_diamond: {
    label: "Uncut diamond",
    baseMetal: "diamond",
    description: "Rose-cut and raw diamonds — natural, unfaceted light.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
    keyword: "uncut diamond",
  },
  solitaire_modern: {
    label: "Solitaire / modern",
    baseMetal: "diamond",
    description: "Single-stone focus — contemporary, minimal, brilliant.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
    keyword: "minimalist",
  },
  pave_diamond: {
    label: "Pavé",
    baseMetal: "diamond",
    description: "Micro-set diamond fields — shimmer-forward and delicate.",
    image: "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=600",
    keyword: "delicate",
  },
  platinum_modern: {
    label: "Platinum modern",
    baseMetal: "platinum",
    description: "Clean architectural platinum — contemporary Indian weddings.",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600",
    keyword: "platinum",
  },
  white_gold_contemporary: {
    label: "White gold contemporary",
    baseMetal: "platinum",
    description: "Cool-toned gold alloy — versatile, understated, modern.",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600",
    keyword: "contemporary",
  },
};

const VIBE_META: Record<
  JewelryVibe,
  { label: string; hint: string; glyph: string }
> = {
  simple_delicate: {
    label: "Simple & delicate",
    hint: "Light, layerable, a quieter register.",
    glyph: "◦",
  },
  heavy_statement: {
    label: "Heavy & statement",
    hint: "Heirloom-scale, full coverage, commanding.",
    glyph: "◆",
  },
  modern_twist: {
    label: "Traditional with a modern twist",
    hint: "Heritage silhouettes told through a modern lens.",
    glyph: "✦",
  },
  fully_traditional: {
    label: "Fully traditional / heritage",
    hint: "Rooted — kundan, polki, temple, antique gold.",
    glyph: "❦",
  },
};

// ─── Celebrity jewelry inspiration seeds ────────────────────────────────
interface CelebrityLook {
  id: string;
  name: string;
  event: string;
  highlights: string;
  image: string;
  tags: string[];
}

const CELEBRITY_LOOKS: CelebrityLook[] = [
  {
    id: "deepika-wedding",
    name: "Deepika Padukone",
    event: "Wedding — Konkani ceremony",
    highlights:
      "Custom Sabyasachi polki set with layered rani haar, mathapatti, and heavy jhumkas.",
    image: "https://images.unsplash.com/photo-1600122854034-16f0c0aaa79f?w=600",
    tags: ["polki", "layered", "rani haar", "statement"],
  },
  {
    id: "priyanka-reception",
    name: "Priyanka Chopra",
    event: "Reception",
    highlights:
      "Diamond-forward choker with a subtle maang tikka and emerald drops — restrained regal.",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
    tags: ["diamond", "choker-forward", "minimalist"],
  },
  {
    id: "anushka-wedding",
    name: "Anushka Sharma",
    event: "Wedding — Tuscany",
    highlights:
      "Sabyasachi antique-gold temple set with a delicate nath and understated kundan bangles.",
    image: "https://images.unsplash.com/photo-1529519195486-16945f0fb37f?w=600",
    tags: ["antique gold", "temple", "delicate"],
  },
  {
    id: "katrina-wedding",
    name: "Katrina Kaif",
    event: "Wedding — Rajasthan",
    highlights:
      "Sabyasachi heritage polki with a floor-skimming rani haar and layered chokers.",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
    tags: ["polki", "rani haar", "layered", "statement"],
  },
  {
    id: "alia-wedding",
    name: "Alia Bhatt",
    event: "Wedding — Mumbai",
    highlights:
      "Pearl-strung uncut polki choker with matha patti; pared-back, poetic register.",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600",
    tags: ["pearl", "polki", "minimalist"],
  },
  {
    id: "kiara-wedding",
    name: "Kiara Advani",
    event: "Wedding — Jaisalmer",
    highlights:
      "Manish Malhotra diamond polki set — multi-tier haar and chaandbalis, regal-scaled.",
    image: "https://images.unsplash.com/photo-1600189261867-8e7c8f3a4a6d?w=600",
    tags: ["polki", "diamond", "statement"],
  },
  {
    id: "isha-wedding",
    name: "Isha Ambani",
    event: "Wedding — Udaipur",
    highlights:
      "Heirloom kundan-polki set with emerald cabochons, mathapatti, and full haath phool.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
    tags: ["kundan", "polki", "statement"],
  },
  {
    id: "bipasha-sangeet",
    name: "Bipasha Basu",
    event: "Sangeet",
    highlights:
      "Contemporary jadau choker paired with chandelier earrings — heritage meets dancefloor.",
    image: "https://images.unsplash.com/photo-1583939411023-14783179e581?w=600",
    tags: ["jadau", "fusion", "contemporary"],
  },
  {
    id: "sonam-wedding",
    name: "Sonam Kapoor",
    event: "Wedding — Mumbai",
    highlights:
      "Family-heirloom polki sets across all events, anchored by a rani haar on the wedding day.",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600",
    tags: ["polki", "heritage", "rani haar"],
  },
  {
    id: "athiya-wedding",
    name: "Athiya Shetty",
    event: "Wedding",
    highlights:
      "Anamika Khanna uncut diamonds with a subtle choker and matching kundan kaleeras.",
    image: "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=600",
    tags: ["uncut diamond", "kundan", "delicate"],
  },
  {
    id: "parineeti-wedding",
    name: "Parineeti Chopra",
    event: "Wedding — Udaipur",
    highlights:
      "Manish Malhotra polki rani haar with emerald drops, layered over a kundan choker.",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600",
    tags: ["polki", "layered", "rani haar"],
  },
  {
    id: "rakulpreet-wedding",
    name: "Rakul Preet Singh",
    event: "Wedding — Goa",
    highlights:
      "Tarun Tahiliani temple-gold set with matha patti and chandbalis — South Indian lean.",
    image: "https://images.unsplash.com/photo-1603561596112-db542a03bff8?w=600",
    tags: ["temple", "antique gold", "statement"],
  },
  {
    id: "mira-wedding",
    name: "Mira Rajput",
    event: "Wedding",
    highlights:
      "Classic Sabyasachi polki choker and jhumkas, heirloom-quiet, understated scale.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600",
    tags: ["polki", "delicate", "heritage"],
  },
  {
    id: "yami-wedding",
    name: "Yami Gautam",
    event: "Wedding — Himachal",
    highlights:
      "Rouka pahadi gold nath and temple jhumkas — regional detail over a pared kundan choker.",
    image: "https://images.unsplash.com/photo-1611107683227-e9060eccd846?w=600",
    tags: ["temple", "kundan", "heritage"],
  },
  {
    id: "kriti-reception",
    name: "Kriti Kharbanda",
    event: "Reception",
    highlights:
      "Rose-gold diamond set — slim necklace and matching studs for a modern reception look.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
    tags: ["rose gold", "diamond", "minimalist"],
  },
  {
    id: "sidharth-sherwani",
    name: "Sidharth Malhotra",
    event: "Groom — Wedding",
    highlights:
      "Sabyasachi antique-gold kalgi, layered pearl mala, and a pavé diamond safa brooch.",
    image: "https://images.unsplash.com/photo-1617183428445-0e1adf2c8b03?w=600",
    tags: ["groom", "antique gold", "pearl"],
  },
  {
    id: "vicky-sherwani",
    name: "Vicky Kaushal",
    event: "Groom — Wedding",
    highlights:
      "Sabyasachi uncut-diamond kalgi with an emerald centerpiece; heirloom-weight safa brooch.",
    image: "https://images.unsplash.com/photo-1595940293613-19d8d97f7a4f?w=600",
    tags: ["groom", "uncut diamond", "statement"],
  },
  {
    id: "ranveer-wedding",
    name: "Ranveer Singh",
    event: "Groom — Wedding",
    highlights:
      "Heritage kundan kalgi and layered gold malas — maximalist, regal-scaled groom register.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
    tags: ["groom", "kundan", "statement"],
  },
];

// ─── Storage ─────────────────────────────────────────────────────────────
export const STORAGE_KEY = "ananya:jewelry-workspace:v1";

export function defaultState(): JewelryState {
  return {
    quizDone: false,
    brief: "",
    styleKeywords: [],
    metalTone: "warm_gold",
    metalHexes: METAL_TONE_META.warm_gold.swatches.slice(),
    baseMetals: [],
    jewelryStyles: [],
    vibes: [],
    celebrityReactions: {},
    moodboard: [],
    activeMoodTag: "all",
    looks: [],
    events: EVENT_KEYS.map((e) => ({
      key: e.key,
      label: e.label,
      refs: AI_REFS[e.key].map((r, i) => ({
        id: `${e.key}-ai-${i}`,
        url: r.url,
        note: "",
        reaction: null,
        source: "ai" as const,
        audience: r.audience,
      })),
      desires: [],
      audienceFilter: "both" as EventAudience,
    })),
    moments: [],
    heirlooms: [],
    notes: [],
  };
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (u: T | ((p: T) => T)) => void] {
  const [val, setVal] = useState<T>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setVal({ ...initial, ...JSON.parse(raw) } as T);
    } catch {}
    loaded.current = true;
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);

  return [val, setVal];
}

export type JewelryTabId =
  | "vision"
  | "shortlist_contract"
  | "bridal_jewelry"
  | "groom_jewelry"
  | "family_heirlooms"
  | "fittings_coordination";

// ─────────────────────────────────────────────────────────────────────────
// Vision & Mood Tab — the centrepiece of the workspace.
// ─────────────────────────────────────────────────────────────────────────
export function VisionTab({
  state,
  update,
  onOpenQuiz,
  onJumpToTab,
}: {
  state: JewelryState;
  update: (patch: Partial<JewelryState> | ((s: JewelryState) => Partial<JewelryState>)) => void;
  onOpenQuiz: () => void;
  onJumpToTab?: (tab: JewelryTabId) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
      {!state.quizDone && <QuizCard onStart={onOpenQuiz} />}

      <KeywordsSection
        selected={state.styleKeywords}
        onChange={(k) => update({ styleKeywords: k })}
      />

      <JewelryTypeDiscoverySection
        baseMetals={state.baseMetals}
        jewelryStyles={state.jewelryStyles}
        vibes={state.vibes}
        onChangeBaseMetals={(metals) => {
          const newMetalTone: MetalTone =
            metals[0] === "silver"
              ? "oxidized"
              : metals[0] === "platinum" || metals[0] === "diamond"
                ? "cool_platinum"
                : "warm_gold";
          update((s) => ({
            baseMetals: metals,
            metalTone: metals.length > 0 ? newMetalTone : s.metalTone,
            metalHexes:
              metals.length > 0
                ? METAL_TONE_META[newMetalTone].swatches.slice()
                : s.metalHexes,
            jewelryStyles: s.jewelryStyles.filter((id) =>
              metals.includes(JEWELRY_STYLE_META[id].baseMetal),
            ),
          }));
        }}
        onChangeStyles={(styles) => {
          const keywordsFromStyles = styles
            .map((id) => JEWELRY_STYLE_META[id].keyword)
            .filter((k): k is string => Boolean(k));
          update((s) => ({
            jewelryStyles: styles,
            styleKeywords: Array.from(
              new Set([...s.styleKeywords, ...keywordsFromStyles]),
            ),
          }));
        }}
        onChangeVibes={(vibes) => update({ vibes })}
      />

      <ShoppingCTASection
        baseMetals={state.baseMetals}
        jewelryStyles={state.jewelryStyles}
        onJumpToTab={onJumpToTab}
      />

      <TryItOnSection
        looks={state.looks}
        moodboard={state.moodboard}
        onAddLook={(look) =>
          update((s) => ({ looks: [...s.looks, look] }))
        }
        onUpdateLook={(id, patch) =>
          update((s) => ({
            looks: s.looks.map((l) => (l.id === id ? { ...l, ...patch } : l)),
          }))
        }
        onRemoveLook={(id) =>
          update((s) => ({ looks: s.looks.filter((l) => l.id !== id) }))
        }
      />

      <MoodboardSection
        images={state.moodboard}
        activeTag={state.activeMoodTag}
        setActiveTag={(t) => update({ activeMoodTag: t })}
        onAdd={(img) => update((s) => ({ moodboard: [...s.moodboard, img] }))}
        onUpdate={(id, p) =>
          update((s) => ({
            moodboard: s.moodboard.map((m) => (m.id === id ? { ...m, ...p } : m)),
          }))
        }
        onRemove={(id) =>
          update((s) => ({ moodboard: s.moodboard.filter((m) => m.id !== id) }))
        }
      />

      <EventGallerySection
        events={state.events}
        onUpdate={(events) => update({ events })}
      />

      <CelebrityInspirationSection
        reactions={state.celebrityReactions}
        onReact={(id, reaction) => {
          update((s) => {
            const next = { ...s.celebrityReactions };
            if (reaction === null) delete next[id];
            else next[id] = reaction;
            if (reaction === "love") {
              const look = CELEBRITY_LOOKS.find((l) => l.id === id);
              if (look) {
                const newKeywords = look.tags.filter(
                  (t) => !s.styleKeywords.includes(t),
                );
                if (newKeywords.length > 0) {
                  return {
                    celebrityReactions: next,
                    styleKeywords: [...s.styleKeywords, ...newKeywords],
                  };
                }
              }
            }
            return { celebrityReactions: next };
          });
        }}
      />

      <MomentsSection
        moments={state.moments}
        onChange={(m) => update({ moments: m })}
      />

      <HeirloomSection
        heirlooms={state.heirlooms}
        onAdd={(h) => update((s) => ({ heirlooms: [...s.heirlooms, h] }))}
        onUpdate={(id, patch) =>
          update((s) => ({
            heirlooms: s.heirlooms.map((h) => (h.id === id ? { ...h, ...patch } : h)),
          }))
        }
        onRemove={(id) =>
          update((s) => ({ heirlooms: s.heirlooms.filter((h) => h.id !== id) }))
        }
        onJumpToTab={onJumpToTab}
      />

      <BriefSection
        brief={state.brief}
        onChange={(v) => update({ brief: v })}
        onRefine={() =>
          update({
            brief: refineBrief(
              state.brief,
              state.styleKeywords,
              state.metalTone,
              state.heirlooms,
            ),
          })
        }
      />

      <NotesSection
        notes={state.notes}
        onAdd={(body) =>
          update((s) => ({
            notes: [...s.notes, { id: uid(), body, at: Date.now() }],
          }))
        }
        onRemove={(id) =>
          update((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
        }
      />
    </div>
  );
}

// ─── Quiz entry card ────────────────────────────────────────────────────
function QuizCard({ onStart }: { onStart: () => void }) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 8,
        border: `1px solid ${C.line}`,
        backgroundColor: C.paper,
        padding: 20,
        boxShadow: "0 1px 2px rgba(26, 26, 26, 0.03)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.gold,
              margin: 0,
            }}
          >
            ✨ Not sure where to start?
          </p>
          <h3
            style={{
              marginTop: 6,
              fontFamily: FONT_SERIF,
              fontSize: 20,
              fontWeight: 500,
              lineHeight: 1.15,
              color: C.ink,
            }}
          >
            Find your jewelry language in 5 questions
          </h3>
          <p
            style={{
              marginTop: 6,
              maxWidth: 560,
              fontSize: 13,
              lineHeight: 1.55,
              color: C.muted,
            }}
          >
            Heavy or delicate? Gold or diamond-forward? Heritage kundan or
            modern minimal? We'll build your starting moodboard and palette
            from your answers.
          </p>
          <p
            style={{
              marginTop: 10,
              fontFamily: FONT_MONO,
              fontSize: 10.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: C.faint,
            }}
          >
            5 questions · ~3 min
          </p>
        </div>

        <div style={{ display: "flex", flexShrink: 0, flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <button
            type="button"
            onClick={onStart}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 18px",
              border: `1px solid ${C.goldDeep}`,
              backgroundColor: C.gold,
              color: "#fff",
              borderRadius: 6,
              fontSize: 12.5,
              fontFamily: FONT_SANS,
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(184, 134, 11, 0.2)",
            }}
          >
            Start quiz →
          </button>
          <button
            type="button"
            style={{
              border: "none",
              background: "transparent",
              color: C.muted,
              fontSize: 11.5,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            Skip, I'll fill it in myself
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Style keywords ─────────────────────────────────────────────────────
function KeywordsSection({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (k: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const toggle = (k: string) =>
    onChange(selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k]);

  return (
    <SectionShell>
      <SectionHead
        title="Style keywords"
        hint="Tap the ones that feel right. Add your own."
      />
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {selected.map((k) => (
            <Pill key={k} filled onRemove={() => toggle(k)}>
              {k}
            </Pill>
          ))}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          paddingTop: selected.length > 0 ? 14 : 0,
          borderTop: selected.length > 0 ? `1px dashed ${C.lineSoft}` : "none",
        }}
      >
        {SUGGESTED_KEYWORDS.filter((k) => !selected.includes(k)).map((k) => (
          <Pill key={k} onClick={() => toggle(k)}>
            {k}
          </Pill>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = draft.trim();
            if (v && !selected.includes(v)) onChange([...selected, v]);
            setDraft("");
          }}
          style={{ display: "inline-flex" }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="+ add your own"
            style={{
              padding: "6px 12px",
              border: `1px dashed ${C.line}`,
              borderRadius: 999,
              backgroundColor: "transparent",
              fontSize: 12,
              color: C.inkSoft,
              outline: "none",
              minWidth: 140,
            }}
          />
        </form>
      </div>
    </SectionShell>
  );
}

// ─── Jewelry type discovery (Base Metal → Styles → Vibe) ────────────────
function JewelryTypeDiscoverySection({
  baseMetals,
  jewelryStyles,
  vibes,
  onChangeBaseMetals,
  onChangeStyles,
  onChangeVibes,
}: {
  baseMetals: BaseMetal[];
  jewelryStyles: JewelryStyleId[];
  vibes: JewelryVibe[];
  onChangeBaseMetals: (m: BaseMetal[]) => void;
  onChangeStyles: (s: JewelryStyleId[]) => void;
  onChangeVibes: (v: JewelryVibe[]) => void;
}) {
  const toggleMetal = (m: BaseMetal) =>
    onChangeBaseMetals(
      baseMetals.includes(m)
        ? baseMetals.filter((x) => x !== m)
        : [...baseMetals, m],
    );

  const toggleStyle = (id: JewelryStyleId) =>
    onChangeStyles(
      jewelryStyles.includes(id)
        ? jewelryStyles.filter((x) => x !== id)
        : [...jewelryStyles, id],
    );

  const toggleVibe = (v: JewelryVibe) =>
    onChangeVibes(
      vibes.includes(v) ? vibes.filter((x) => x !== v) : [...vibes, v],
    );

  const stylesForSelected = (Object.entries(JEWELRY_STYLE_META) as Array<
    [JewelryStyleId, (typeof JEWELRY_STYLE_META)[JewelryStyleId]]
  >).filter(([, meta]) => baseMetals.includes(meta.baseMetal));

  return (
    <SectionShell>
      <SectionHead
        title="Find your jewelry direction"
        hint="Start with the material. We'll show you the styles, then help you choose the vibe. Many brides mix — gold kundan for the wedding, diamond for the reception."
      />

      {/* Step 1 — base metal */}
      <div style={{ marginBottom: 28 }}>
        <SubsectionHead>
          Step 1 · Base metal & material (pick one or more)
        </SubsectionHead>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {BASE_METAL_ORDER.map((m) => {
            const meta = BASE_METAL_META[m];
            const active = baseMetals.includes(m);
            return (
              <button
                key={m}
                onClick={() => toggleMetal(m)}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  padding: 0,
                  border: `1.5px solid ${active ? C.goldDeep : C.line}`,
                  backgroundColor: C.paper,
                  borderRadius: 4,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "transform 0.15s, border 0.15s",
                  transform: active ? "translateY(-1px)" : "none",
                  boxShadow: active ? "0 4px 10px rgba(184, 134, 11, 0.15)" : "none",
                }}
              >
                <div
                  style={{
                    aspectRatio: "4 / 3",
                    backgroundColor: C.overlay,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={meta.image}
                    alt={meta.label}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      filter: active ? "none" : "saturate(0.85)",
                    }}
                  />
                  {active && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: C.goldDeep,
                        color: C.ivory,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
                <div style={{ padding: "10px 14px" }}>
                  <div
                    style={{
                      fontFamily: FONT_SERIF,
                      fontSize: 17,
                      color: C.ink,
                      marginBottom: 2,
                    }}
                  >
                    {meta.label}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
                    {meta.hint}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 — styles within selected metals */}
      {baseMetals.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SubsectionHead>
            Step 2 · Styles within{" "}
            {baseMetals.map((m) => BASE_METAL_META[m].label).join(" + ")}
          </SubsectionHead>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {stylesForSelected.map(([id, meta]) => {
              const active = jewelryStyles.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleStyle(id)}
                  style={{
                    padding: 0,
                    border: `1.5px solid ${active ? C.goldDeep : C.line}`,
                    borderRadius: 2,
                    overflow: "hidden",
                    backgroundColor: C.paper,
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: active ? "0 2px 6px rgba(184, 134, 11, 0.12)" : "none",
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "1 / 1",
                      backgroundColor: C.overlay,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={meta.image}
                      alt={meta.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {active && (
                      <div
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          backgroundColor: C.goldDeep,
                          color: C.ivory,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    <div
                      style={{
                        fontFamily: FONT_SERIF,
                        fontSize: 14,
                        color: C.ink,
                        marginBottom: 2,
                      }}
                    >
                      {meta.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        lineHeight: 1.35,
                      }}
                    >
                      {meta.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3 — vibe */}
      <div>
        <SubsectionHead>Step 3 · Weight & vibe</SubsectionHead>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          {(Object.keys(VIBE_META) as JewelryVibe[]).map((v) => {
            const meta = VIBE_META[v];
            const active = vibes.includes(v);
            return (
              <button
                key={v}
                onClick={() => toggleVibe(v)}
                style={{
                  padding: "14px 16px",
                  border: `1px solid ${active ? C.goldDeep : C.line}`,
                  borderRadius: 4,
                  backgroundColor: active ? C.goldSoft : C.paper,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    color: active ? C.goldDeep : C.muted,
                    lineHeight: 1,
                  }}
                >
                  {meta.glyph}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT_SERIF,
                      fontSize: 15,
                      color: C.ink,
                      marginBottom: 2,
                    }}
                  >
                    {meta.label}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
                    {meta.hint}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

// ─── Shopping & vendor CTA ──────────────────────────────────────────────
function ShoppingCTASection({
  baseMetals,
  jewelryStyles,
  onJumpToTab,
}: {
  baseMetals: BaseMetal[];
  jewelryStyles: JewelryStyleId[];
  onJumpToTab?: (tab: JewelryTabId) => void;
}) {
  const hasDirection = baseMetals.length > 0 || jewelryStyles.length > 0;
  const directionText = hasDirection
    ? jewelryStyles.length > 0
      ? `We'll surface ${jewelryStyles
          .slice(0, 3)
          .map((id) => JEWELRY_STYLE_META[id].label.toLowerCase())
          .join(", ")} vendors first.`
      : `We'll surface ${baseMetals
          .map((m) => BASE_METAL_META[m].label.toLowerCase())
          .join(" + ")} jewelers first.`
    : "Pick a direction above and we'll filter vendors to match.";

  return (
    <SectionShell>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          border: `1px solid ${C.line}`,
          borderLeft: `3px solid ${C.goldDeep}`,
          borderRadius: 4,
          backgroundColor: C.champagnePale,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: 4,
            }}
          >
            Ready to shop?
          </div>
          <h4
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 19,
              fontWeight: 500,
              color: C.ink,
              margin: 0,
              marginBottom: 4,
            }}
          >
            Explore jewelry vendors that match your style
          </h4>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: C.muted,
              margin: 0,
              maxWidth: 520,
            }}
          >
            {directionText}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a
            href="/marketplace/category/jewelry"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 18px",
              border: `1px solid ${C.goldDeep}`,
              backgroundColor: C.gold,
              color: "#fff",
              borderRadius: 4,
              fontSize: 12.5,
              fontFamily: FONT_SANS,
              fontWeight: 500,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Shop this style →
          </a>
          <a
            href="/vendors"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 18px",
              border: `1px solid ${C.line}`,
              backgroundColor: "transparent",
              color: C.inkSoft,
              borderRadius: 4,
              fontSize: 12.5,
              fontFamily: FONT_SANS,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Browse vendors
          </a>
          {onJumpToTab && (
            <button
              type="button"
              onClick={() => onJumpToTab("shortlist_contract")}
              style={textButtonStyle()}
            >
              Manage shortlist →
            </button>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

// ─── Celebrity jewelry inspiration ──────────────────────────────────────
function CelebrityInspirationSection({
  reactions,
  onReact,
}: {
  reactions: Record<string, CelebrityReaction>;
  onReact: (id: string, r: CelebrityReaction) => void;
}) {
  const lovedCount = CELEBRITY_LOOKS.filter(
    (l) => reactions[l.id] === "love",
  ).length;
  return (
    <SectionShell>
      <SectionHead
        eyebrow="What the stylists did"
        title="Celebrity jewelry inspiration"
        hint="Curated looks from recent Indian celebrity weddings. Love the ones that feel right — we'll add their tags to your style keywords."
        right={
          lovedCount > 0 ? (
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.goldDeep,
              }}
            >
              ♡ {lovedCount} loved
            </span>
          ) : undefined
        }
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        {CELEBRITY_LOOKS.map((look) => {
          const reaction = reactions[look.id] ?? null;
          const isLoved = reaction === "love";
          const isSkipped = reaction === "skip";
          return (
            <div
              key={look.id}
              style={{
                border: `1px solid ${isLoved ? C.goldDeep : C.line}`,
                backgroundColor: C.paper,
                borderRadius: 4,
                overflow: "hidden",
                opacity: isSkipped ? 0.45 : 1,
                transition: "opacity 0.15s",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4 / 5",
                  backgroundColor: C.ivorySoft,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={look.image}
                  alt={look.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    backgroundColor: "rgba(46, 36, 24, 0.75)",
                    color: C.ivory,
                    padding: "3px 9px",
                    borderRadius: 2,
                    fontSize: 9.5,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: FONT_MONO,
                  }}
                >
                  ✦ Celebrity
                </div>
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: 17,
                    color: C.ink,
                    lineHeight: 1.2,
                  }}
                >
                  {look.name}
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9.5,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: C.muted,
                  }}
                >
                  {look.event}
                </div>
                <p
                  style={{
                    fontFamily: FONT_SERIF,
                    fontStyle: "italic",
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: C.inkSoft,
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {look.highlights}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    marginTop: 2,
                  }}
                >
                  {look.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 999,
                        backgroundColor: C.ivorySoft,
                        color: C.muted,
                        fontFamily: FONT_SANS,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  borderTop: `1px solid ${C.lineSoft}`,
                }}
              >
                <button
                  onClick={() => onReact(look.id, isLoved ? null : "love")}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    fontSize: 11,
                    border: "none",
                    borderRight: `1px solid ${C.lineSoft}`,
                    backgroundColor: isLoved ? C.goldSoft : "transparent",
                    color: isLoved ? C.ink : C.muted,
                    cursor: "pointer",
                    fontFamily: FONT_SANS,
                  }}
                >
                  ♡ Love
                </button>
                <button
                  onClick={() => onReact(look.id, isSkipped ? null : "skip")}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    fontSize: 11,
                    border: "none",
                    backgroundColor: isSkipped ? C.ivorySoft : "transparent",
                    color: C.muted,
                    cursor: "pointer",
                    fontFamily: FONT_SANS,
                  }}
                >
                  Not for us
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ─── Your Looks — Try it on ────────────────────────────────────────────
function TryItOnSection({
  looks,
  moodboard,
  onAddLook,
  onUpdateLook,
  onRemoveLook,
}: {
  looks: OutfitLook[];
  moodboard: MoodImage[];
  onAddLook: (look: OutfitLook) => void;
  onUpdateLook: (id: string, patch: Partial<OutfitLook>) => void;
  onRemoveLook: (id: string) => void;
}) {
  const [draftEvent, setDraftEvent] = useState<JewelryEventKey>("wedding");
  const [draftSide, setDraftSide] = useState<"bride" | "groom">("bride");
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .forEach((f) => {
        const reader = new FileReader();
        reader.onload = () => {
          onAddLook({
            id: uid(),
            eventKey: draftEvent,
            side: draftSide,
            photoUrl: String(reader.result),
            caption: "",
            pairedRefIds: [],
          });
        };
        reader.readAsDataURL(f);
      });
  };

  return (
    <SectionShell>
      <SectionHead
        title="Your looks"
        hint="Upload your outfit photos or fitting shots. We'll pair them with jewelry references so you can see the full picture."
        right={
          <button style={textButtonStyle()}>
            ✦ Suggest pairings
          </button>
        }
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          New look:
        </span>
        <select
          value={draftSide}
          onChange={(e) => setDraftSide(e.target.value as "bride" | "groom")}
          style={selectPillStyle()}
        >
          <option value="bride">Bride</option>
          <option value="groom">Groom</option>
        </select>
        <select
          value={draftEvent}
          onChange={(e) => setDraftEvent(e.target.value as JewelryEventKey)}
          style={selectPillStyle()}
        >
          {EVENT_KEYS.map((e) => (
            <option key={e.key} value={e.key}>
              {e.label}
            </option>
          ))}
        </select>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => addFiles(e.target.files)}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={secondaryButtonStyle()}
        >
          ⬆ Upload outfit photos
        </button>
      </div>

      {looks.length === 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <EmptyState
            icon="👗"
            title="Drop your outfit photos here."
            body="Fittings, fabric shots, even screenshots from your designer's Instagram. Tag each photo by event so we can help you pair jewelry."
            dashed
            onDrop={addFiles}
          />
          <EmptyState
            icon="💎"
            title="Now drag jewelry references next to each look."
            body="See the full picture before you commit. Pair a rani haar to your wedding lehenga; try the kundan set with the sangeet fit."
          />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 14,
          }}
        >
          {looks.map((l) => (
            <LookCard
              key={l.id}
              look={l}
              moodboard={moodboard}
              onUpdate={(p) => onUpdateLook(l.id, p)}
              onRemove={() => onRemoveLook(l.id)}
            />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function LookCard({
  look,
  moodboard,
  onUpdate,
  onRemove,
}: {
  look: OutfitLook;
  moodboard: MoodImage[];
  onUpdate: (p: Partial<OutfitLook>) => void;
  onRemove: () => void;
}) {
  const paired = moodboard.filter((m) => look.pairedRefIds.includes(m.id));
  const eventLabel = EVENT_KEYS.find((e) => e.key === look.eventKey)?.label ?? "";
  const [isDragOver, setIsDragOver] = useState(false);
  const [loved, setLoved] = useState<boolean | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedUrl =
      e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (!droppedUrl) return;
    const match = moodboard.find((m) => m.url === droppedUrl.trim());
    if (match && !look.pairedRefIds.includes(match.id)) {
      onUpdate({ pairedRefIds: [...look.pairedRefIds, match.id] });
    }
  };

  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        backgroundColor: C.paper,
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "3 / 4", backgroundColor: C.overlay }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={look.photoUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "inline-flex",
            gap: 4,
          }}
        >
          <span style={tagChipStyle()}>
            {look.side === "bride" ? "Bride" : "Groom"}
          </span>
          <span style={tagChipStyle()}>{eventLabel}</span>
        </div>
        <button
          onClick={onRemove}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            border: "none",
            background: "rgba(46, 36, 24, 0.7)",
            color: C.ivory,
            borderRadius: "50%",
            width: 22,
            height: 22,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ×
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          padding: 12,
          borderTop: `1px solid ${C.lineSoft}`,
          backgroundColor: isDragOver ? C.goldSoft : C.paper,
          minHeight: 88,
          transition: "background 0.15s",
        }}
      >
        <SubsectionHead>Paired jewelry</SubsectionHead>
        {paired.length === 0 ? (
          <p
            style={{
              fontSize: 12,
              color: C.faint,
              fontStyle: "italic",
              margin: 0,
            }}
          >
            Drag references from the moodboard below into this card.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {paired.map((p) => (
              <div
                key={p.id}
                style={{
                  position: "relative",
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `1px solid ${C.line}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  onClick={() =>
                    onUpdate({
                      pairedRefIds: look.pairedRefIds.filter((id) => id !== p.id),
                    })
                  }
                  style={{
                    position: "absolute",
                    top: 1,
                    right: 1,
                    border: "none",
                    background: "rgba(26, 26, 26, 0.75)",
                    color: C.ivory,
                    borderRadius: "50%",
                    width: 14,
                    height: 14,
                    fontSize: 9,
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: "12px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", borderTop: `1px solid ${C.lineSoft}` }}>
        <button
          onClick={() => setLoved(loved === true ? null : true)}
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: 11,
            border: "none",
            borderRight: `1px solid ${C.lineSoft}`,
            backgroundColor: loved === true ? C.goldSoft : "transparent",
            color: loved === true ? C.ink : C.muted,
            cursor: "pointer",
            fontFamily: FONT_SANS,
          }}
        >
          ♡ Love this combo
        </button>
        <button
          onClick={() => setLoved(loved === false ? null : false)}
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: 11,
            border: "none",
            backgroundColor: loved === false ? C.ivorySoft : "transparent",
            color: C.muted,
            cursor: "pointer",
            fontFamily: FONT_SANS,
          }}
        >
          Not quite
        </button>
      </div>
    </div>
  );
}

// ─── Moodboard ──────────────────────────────────────────────────────────
const MOODBOARD_TAGS: Array<{ id: JewelryTag | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "necklace", label: "Necklace" },
  { id: "earrings", label: "Earrings" },
  { id: "maang_tikka", label: "Maang Tikka" },
  { id: "haath_phool", label: "Haath Phool" },
  { id: "nath", label: "Nath" },
  { id: "bangles", label: "Bangles" },
  { id: "rings", label: "Rings" },
  { id: "groom", label: "Groom" },
];

function MoodboardSection({
  images,
  activeTag,
  setActiveTag,
  onAdd,
  onUpdate,
  onRemove,
}: {
  images: MoodImage[];
  activeTag: JewelryTag | "all";
  setActiveTag: (t: JewelryTag | "all") => void;
  onAdd: (m: MoodImage) => void;
  onUpdate: (id: string, p: Partial<MoodImage>) => void;
  onRemove: (id: string) => void;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const filtered = activeTag === "all" ? images : images.filter((i) => i.tag === activeTag);

  const addUrl = (url: string) => {
    if (!url.trim()) return;
    onAdd({ id: uid(), url: url.trim(), tag: "necklace", note: "" });
    setUrlDraft("");
  };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () =>
        onAdd({ id: uid(), url: String(reader.result), tag: "necklace", note: "" });
      reader.readAsDataURL(f);
    });
  };

  return (
    <SectionShell>
      <SectionHead
        title="Moodboard"
        hint="Paste URLs, drop files, tag each pin so your jeweler knows what to study."
      />
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addUrl(urlDraft);
          }}
          style={{ display: "flex", gap: 6, flex: 1, minWidth: 260 }}
        >
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Paste an image URL…"
            style={inputStyle()}
          />
          <button type="submit" style={secondaryButtonStyle()}>
            Add
          </button>
        </form>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFiles(e.target.files)}
          style={{ display: "none" }}
        />
        <button onClick={() => fileRef.current?.click()} style={secondaryButtonStyle()}>
          ⬆ Upload
        </button>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {MOODBOARD_TAGS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTag(t.id)}
            style={{
              padding: "5px 12px",
              fontSize: 11.5,
              border: `1px solid ${activeTag === t.id ? C.goldDeep : C.line}`,
              backgroundColor: activeTag === t.id ? C.ink : "transparent",
              color: activeTag === t.id ? C.ivory : C.muted,
              borderRadius: 999,
              cursor: "pointer",
              fontFamily: FONT_SANS,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📷"
          title="Drop inspiration here."
          body="Tag each pin so your jeweler knows what to reference — necklace, earrings, maang tikka, or the full set."
          dashed
          onDrop={onFiles}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 14,
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFiles(e.dataTransfer.files);
          }}
        >
          {filtered.map((img) => (
            <MoodCard
              key={img.id}
              img={img}
              onChange={(p) => onUpdate(img.id, p)}
              onRemove={() => onRemove(img.id)}
            />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function MoodCard({
  img,
  onChange,
  onRemove,
}: {
  img: MoodImage;
  onChange: (p: Partial<MoodImage>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/uri-list", img.url);
        e.dataTransfer.setData("text/plain", img.url);
        e.dataTransfer.effectAllowed = "copy";
      }}
      style={{
        border: `1px solid ${C.line}`,
        backgroundColor: C.paper,
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4 / 5", backgroundColor: C.overlay }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.url}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <button
          onClick={onRemove}
          title="Remove"
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            border: "none",
            background: "rgba(46, 36, 24, 0.7)",
            color: C.ivory,
            borderRadius: "50%",
            width: 22,
            height: 22,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <select
          value={img.tag}
          onChange={(e) => onChange({ tag: e.target.value as JewelryTag })}
          style={{
            padding: "4px 8px",
            fontSize: 11,
            border: `1px solid ${C.line}`,
            borderRadius: 2,
            backgroundColor: C.ivorySoft,
            color: C.inkSoft,
            outline: "none",
            textTransform: "capitalize",
          }}
        >
          {MOODBOARD_TAGS.filter((t) => t.id !== "all").map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          value={img.note}
          onChange={(e) => onChange({ note: e.target.value })}
          placeholder="What I love about this…"
          style={{
            padding: "6px 8px",
            fontSize: 12,
            border: "none",
            borderBottom: `1px solid ${C.lineSoft}`,
            backgroundColor: "transparent",
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            color: C.inkSoft,
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

// ─── Event gallery ──────────────────────────────────────────────────────
function EventGallerySection({
  events,
  onUpdate,
}: {
  events: EventBlock[];
  onUpdate: (e: EventBlock[]) => void;
}) {
  const [openKey, setOpenKey] = useState<JewelryEventKey>(
    events[0]?.key ?? "wedding",
  );

  const updateEvent = (key: JewelryEventKey, patch: Partial<EventBlock>) =>
    onUpdate(events.map((e) => (e.key === key ? { ...e, ...patch } : e)));

  return (
    <SectionShell>
      <SectionHead
        title="Reference gallery by event"
        hint="Browse our suggestions, add your own, tell us what you love."
      />
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {events.map((e) => {
          const loved = e.refs.filter((r) => r.reaction === "love").length;
          const isOpen = openKey === e.key;
          return (
            <button
              key={e.key}
              onClick={() => setOpenKey(e.key)}
              style={{
                padding: "9px 16px",
                border: `1px solid ${isOpen ? C.goldDeep : C.line}`,
                backgroundColor: isOpen ? C.ink : C.paper,
                color: isOpen ? C.ivory : C.inkSoft,
                borderRadius: 2,
                cursor: "pointer",
                fontFamily: FONT_SERIF,
                fontSize: 15,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {e.label}
              {loved > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 999,
                    backgroundColor: isOpen ? C.goldSoft : C.champagnePale,
                    color: isOpen ? C.ink : C.goldDeep,
                    fontFamily: FONT_SANS,
                  }}
                >
                  ♡ {loved}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {events
        .filter((e) => e.key === openKey)
        .map((e) => (
          <EventBlockView
            key={e.key}
            event={e}
            onUpdate={(patch) => updateEvent(e.key, patch)}
          />
        ))}
    </SectionShell>
  );
}

function EventBlockView({
  event,
  onUpdate,
}: {
  event: EventBlock;
  onUpdate: (p: Partial<EventBlock>) => void;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const visibleRefs =
    event.audienceFilter === "both"
      ? event.refs
      : event.refs.filter(
          (r) => r.audience === event.audienceFilter || r.audience === "both",
        );

  const setReaction = (id: string, r: Reaction) =>
    onUpdate({
      refs: event.refs.map((ref) => (ref.id === id ? { ...ref, reaction: r } : ref)),
    });

  const addUserRef = (audience: EventAudience) => {
    if (!urlDraft.trim()) return;
    onUpdate({
      refs: [
        ...event.refs,
        {
          id: uid(),
          url: urlDraft.trim(),
          note: "",
          reaction: null,
          source: "user",
          audience,
        },
      ],
    });
    setUrlDraft("");
  };

  const handleFiles = (files: FileList | null, audience: EventAudience) => {
    if (!files) return;
    Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .forEach((f) => {
        const reader = new FileReader();
        reader.onload = () =>
          onUpdate({
            refs: [
              ...event.refs,
              {
                id: uid(),
                url: String(reader.result),
                note: "",
                reaction: null,
                source: "user",
                audience,
              },
            ],
          });
        reader.readAsDataURL(f);
      });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 16,
            color: C.muted,
          }}
        >
          What should your{" "}
          <strong style={{ color: C.ink }}>{event.label}</strong> jewelry feel like?
        </div>
        <div style={{ display: "inline-flex", gap: 4 }}>
          {(["bride", "groom", "both"] as EventAudience[]).map((a) => (
            <button
              key={a}
              onClick={() => onUpdate({ audienceFilter: a })}
              style={{
                padding: "4px 12px",
                fontSize: 10.5,
                border: `1px solid ${event.audienceFilter === a ? C.goldDeep : C.line}`,
                backgroundColor: event.audienceFilter === a ? C.ink : "transparent",
                color: event.audienceFilter === a ? C.ivory : C.muted,
                borderRadius: 999,
                cursor: "pointer",
                fontFamily: FONT_MONO,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {a === "both" ? "Both" : a === "bride" ? "Bride" : "Groom"}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {visibleRefs.map((ref) => (
          <EventRefCard
            key={ref.id}
            ref_={ref}
            onReact={setReaction}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 10,
          maxWidth: 560,
          flexWrap: "wrap",
        }}
      >
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder={`Paste an image URL for ${event.label}…`}
          style={inputStyle()}
        />
        <button
          onClick={() =>
            addUserRef(
              event.audienceFilter === "both" ? "bride" : event.audienceFilter,
            )
          }
          style={secondaryButtonStyle()}
        >
          Add
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            handleFiles(
              e.target.files,
              event.audienceFilter === "both" ? "bride" : event.audienceFilter,
            )
          }
          style={{ display: "none" }}
        />
        <button onClick={() => fileRef.current?.click()} style={secondaryButtonStyle()}>
          ⬆ Upload
        </button>
      </div>
      <p style={{ fontSize: 11.5, fontStyle: "italic", color: C.faint, margin: 0 }}>
        Toggle Bride / Groom / Both to scope the references. Uploads are tagged
        to the currently-open audience.
      </p>
    </div>
  );
}

function EventRefCard({
  ref_,
  onReact,
}: {
  ref_: EventRef;
  onReact: (id: string, r: Reaction) => void;
}) {
  const isLoved = ref_.reaction === "love";
  const isSkipped = ref_.reaction === "skip";
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/uri-list", ref_.url);
        e.dataTransfer.setData("text/plain", ref_.url);
        e.dataTransfer.effectAllowed = "copy";
      }}
      style={{
        border: `1px solid ${isLoved ? C.goldDeep : C.line}`,
        backgroundColor: C.paper,
        borderRadius: 2,
        overflow: "hidden",
        opacity: isSkipped ? 0.4 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4 / 5", backgroundColor: C.ivorySoft }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ref_.url}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {ref_.source === "ai" && (
          <span
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              backgroundColor: "rgba(46, 36, 24, 0.75)",
              color: C.ivory,
              padding: "2px 8px",
              borderRadius: 2,
              fontSize: 9.5,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            ✦ Suggested
          </span>
        )}
        <span
          style={{
            position: "absolute",
            bottom: 6,
            left: 6,
            backgroundColor: "rgba(251, 249, 244, 0.9)",
            color: C.inkSoft,
            padding: "2px 8px",
            borderRadius: 2,
            fontSize: 9.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: FONT_MONO,
          }}
        >
          {ref_.audience === "both" ? "Both" : ref_.audience}
        </span>
      </div>
      <div style={{ padding: "8px 10px", display: "flex", gap: 6 }}>
        <button
          onClick={() => onReact(ref_.id, isLoved ? null : "love")}
          style={{
            flex: 1,
            padding: "4px 0",
            fontSize: 11,
            border: `1px solid ${isLoved ? C.goldDeep : C.line}`,
            backgroundColor: isLoved ? C.goldSoft : "transparent",
            color: isLoved ? C.ink : C.muted,
            borderRadius: 2,
            cursor: "pointer",
          }}
        >
          ♡ Love
        </button>
        <button
          onClick={() => onReact(ref_.id, isSkipped ? null : "skip")}
          style={{
            flex: 1,
            padding: "4px 0",
            fontSize: 11,
            border: `1px solid ${C.line}`,
            backgroundColor: isSkipped ? C.ivorySoft : "transparent",
            color: C.muted,
            borderRadius: 2,
            cursor: "pointer",
          }}
        >
          Not for us
        </button>
      </div>
    </div>
  );
}

// ─── Moment wishlist ────────────────────────────────────────────────────
function MomentsSection({
  moments,
  onChange,
}: {
  moments: string[];
  onChange: (m: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = (v: string) => {
    const t = v.trim();
    if (!t) return;
    onChange([...moments, t]);
    setDraft("");
  };
  const suggest = () => {
    const fresh = MOMENT_SUGGESTIONS.filter((s) => !moments.includes(s)).slice(0, 3);
    onChange([...moments, ...fresh]);
  };
  return (
    <SectionShell>
      <SectionHead
        title="Expression & moment wishlist"
        hint="Not a jewelry list — your emotional input. The moments where jewelry tells the story."
        right={
          <button style={textButtonStyle()} onClick={suggest}>
            ✨ Suggest moments
          </button>
        }
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add(draft);
        }}
        style={{ display: "flex", gap: 6, marginBottom: 14 }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. I want everyone to gasp when I walk out for the pheras…"
          style={inputStyle()}
        />
        <button type="submit" style={secondaryButtonStyle()}>
          Add
        </button>
      </form>
      {moments.length === 0 ? (
        <EmptyState
          icon="✶"
          title="List the moments you can't miss."
          body="Your jeweler reads these first. Tell them the visual beats that, if missed, would break your heart."
        />
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {moments.map((m, i) => (
            <li
              key={i}
              style={{
                padding: "12px 16px",
                backgroundColor: C.paper,
                border: `1px solid ${C.line}`,
                borderLeft: `3px solid ${C.goldDeep}`,
                borderRadius: 2,
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: 16,
                color: C.ink,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              "{m}"
              <button
                onClick={() => onChange(moments.filter((_, idx) => idx !== i))}
                style={{
                  border: "none",
                  background: "transparent",
                  color: C.muted,
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}

// ─── Heirloom & borrowed pieces ─────────────────────────────────────────
const PIECE_TYPES: Array<{ v: PieceType; label: string }> = [
  { v: "necklace", label: "Necklace" },
  { v: "earrings", label: "Earrings" },
  { v: "bangles", label: "Bangles" },
  { v: "maang_tikka", label: "Maang Tikka" },
  { v: "nath", label: "Nath" },
  { v: "ring", label: "Ring" },
  { v: "anklet", label: "Anklet" },
  { v: "brooch_pin", label: "Brooch / Pin" },
  { v: "other", label: "Other" },
];

const HEIRLOOM_STATUS_META: Record<
  HeirloomStatus,
  { label: string; glyph: string; fg: string; bg: string }
> = {
  confirmed: { label: "Confirmed", glyph: "♡", fg: C.goldDeep, bg: C.goldSoft },
  pending: { label: "Pending", glyph: "⟳", fg: C.muted, bg: C.ivorySoft },
  declined: { label: "Declined", glyph: "✕", fg: C.accent, bg: C.overlay },
};

export function HeirloomSection({
  heirlooms,
  onAdd,
  onUpdate,
  onRemove,
  onJumpToTab,
}: {
  heirlooms: Heirloom[];
  onAdd: (h: Heirloom) => void;
  onUpdate: (id: string, patch: Partial<Heirloom>) => void;
  onRemove: (id: string) => void;
  onJumpToTab?: (tab: JewelryTabId) => void;
}) {
  return (
    <SectionShell>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: 8,
        }}
      >
        From the family
      </div>
      <SectionHead
        title="Heirloom & borrowed pieces"
        hint="If your mother-in-law, mother, or family is lending pieces, document them here. Your jeweler and stylist need to know what's already spoken for."
        right={
          onJumpToTab && (
            <button
              style={textButtonStyle()}
              onClick={() => onJumpToTab("family_heirlooms")}
            >
              See all →
            </button>
          )
        }
      />

      {heirlooms.length === 0 ? (
        <EmptyState
          icon="❦"
          title="Nothing here yet."
          body="If family is offering or lending jewelry, capture it here so everyone — your stylist, jeweler, and planner — can coordinate around it."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {heirlooms.map((h) => (
            <HeirloomCard
              key={h.id}
              heirloom={h}
              onChange={(p) => onUpdate(h.id, p)}
              onRemove={() => onRemove(h.id)}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          onClick={() =>
            onAdd({
              id: uid(),
              photoUrl: "",
              fromWhom: "",
              pieceType: "necklace",
              events: [],
              notes: "",
              careNotes: "",
              status: "pending",
            })
          }
          style={secondaryButtonStyle()}
        >
          + Add piece
        </button>
      </div>

      <p
        style={{
          marginTop: 14,
          fontSize: 11.5,
          fontStyle: "italic",
          color: C.faint,
        }}
      >
        This section is shared with your planner and stylist only. Vendor
        access is controlled in Shortlist & Contract.
      </p>
    </SectionShell>
  );
}

function HeirloomCard({
  heirloom,
  onChange,
  onRemove,
}: {
  heirloom: Heirloom;
  onChange: (p: Partial<Heirloom>) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const statusMeta = HEIRLOOM_STATUS_META[heirloom.status];

  const toggleEvent = (k: JewelryEventKey) => {
    onChange({
      events: heirloom.events.includes(k)
        ? heirloom.events.filter((e) => e !== k)
        : [...heirloom.events, k],
    });
  };

  const handleFile = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ photoUrl: String(reader.result) });
    reader.readAsDataURL(files[0]);
  };

  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        backgroundColor: C.paper,
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          backgroundColor: C.overlay,
          backgroundImage: heirloom.photoUrl ? `url(${heirloom.photoUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          cursor: "pointer",
        }}
        onClick={() => fileRef.current?.click()}
      >
        {!heirloom.photoUrl && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: C.faint,
              fontSize: 12,
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 28, color: C.goldDeep }}>❦</span>
            <span>Tap to upload photo</span>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files)}
          style={{ display: "none" }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            border: "none",
            background: "rgba(46, 36, 24, 0.7)",
            color: C.ivory,
            borderRadius: "50%",
            width: 22,
            height: 22,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          value={heirloom.fromWhom}
          onChange={(e) => onChange({ fromWhom: e.target.value })}
          placeholder="From whom — e.g. Groom's mother"
          style={{
            padding: "6px 8px",
            border: "none",
            borderBottom: `1px solid ${C.lineSoft}`,
            backgroundColor: "transparent",
            fontFamily: FONT_SERIF,
            fontSize: 14,
            color: C.ink,
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PIECE_TYPES.map((p) => (
            <button
              key={p.v}
              onClick={() => onChange({ pieceType: p.v })}
              style={{
                padding: "3px 10px",
                fontSize: 10.5,
                border: `1px solid ${heirloom.pieceType === p.v ? C.goldDeep : C.line}`,
                backgroundColor: heirloom.pieceType === p.v ? C.ink : "transparent",
                color: heirloom.pieceType === p.v ? C.ivory : C.muted,
                borderRadius: 999,
                cursor: "pointer",
                fontFamily: FONT_SANS,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div>
          <SubsectionHead>Events</SubsectionHead>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {EVENT_KEYS.map((e) => (
              <button
                key={e.key}
                onClick={() => toggleEvent(e.key)}
                style={{
                  padding: "3px 9px",
                  fontSize: 10,
                  border: `1px solid ${heirloom.events.includes(e.key) ? C.goldDeep : C.line}`,
                  backgroundColor: heirloom.events.includes(e.key) ? C.goldSoft : "transparent",
                  color: heirloom.events.includes(e.key) ? C.ink : C.muted,
                  borderRadius: 2,
                  cursor: "pointer",
                  fontFamily: FONT_MONO,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={heirloom.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Notes — e.g. Needs to be resized. Sentimental — was my mother-in-law's wedding set."
          rows={2}
          style={{
            padding: "6px 8px",
            border: `1px solid ${C.lineSoft}`,
            borderRadius: 2,
            backgroundColor: C.ivorySoft,
            fontFamily: FONT_SERIF,
            fontSize: 12.5,
            color: C.inkSoft,
            outline: "none",
            resize: "vertical",
          }}
        />

        <textarea
          value={heirloom.careNotes}
          onChange={(e) => onChange({ careNotes: e.target.value })}
          placeholder="Condition / care for the stylist — e.g. Antique, no polish. Missing one stone — intentional."
          rows={2}
          style={{
            padding: "6px 8px",
            border: `1px solid ${C.lineSoft}`,
            borderRadius: 2,
            backgroundColor: C.overlay,
            fontFamily: FONT_SERIF,
            fontSize: 12,
            color: C.muted,
            fontStyle: "italic",
            outline: "none",
            resize: "vertical",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 2,
            paddingTop: 8,
            borderTop: `1px solid ${C.lineSoft}`,
          }}
        >
          {(Object.keys(HEIRLOOM_STATUS_META) as HeirloomStatus[]).map((s) => {
            const m = HEIRLOOM_STATUS_META[s];
            const active = heirloom.status === s;
            return (
              <button
                key={s}
                onClick={() => onChange({ status: s })}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  fontSize: 10.5,
                  border: `1px solid ${active ? m.fg : C.line}`,
                  backgroundColor: active ? m.bg : "transparent",
                  color: active ? m.fg : C.muted,
                  borderRadius: 2,
                  cursor: "pointer",
                  fontFamily: FONT_SANS,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: "0.04em",
                }}
              >
                {m.glyph} {m.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 2,
              backgroundColor: statusMeta.bg,
              color: statusMeta.fg,
              fontFamily: FONT_MONO,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {statusMeta.glyph} {statusMeta.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Brief ──────────────────────────────────────────────────────────────
function BriefSection({
  brief,
  onChange,
  onRefine,
}: {
  brief: string;
  onChange: (v: string) => void;
  onRefine: () => void;
}) {
  return (
    <SectionShell>
      <SectionHead
        eyebrow="The document your jeweler reads first"
        title="Your Jewelry Brief"
        hint="Describe the feeling you want — not the karats. We'll polish the structure."
        right={
          <button style={textButtonStyle()} onClick={onRefine}>
            ✨ Refine with AI
          </button>
        }
      />
      <textarea
        value={brief}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Click to write a brief — a few sentences about what your wedding jewelry should feel like. Don't worry about structure; we'll help you polish it."
        style={{
          width: "100%",
          minHeight: 160,
          padding: "16px 18px",
          border: `1px solid ${C.line}`,
          borderRadius: 6,
          backgroundColor: C.paper,
          fontFamily: FONT_SERIF,
          fontSize: 15,
          lineHeight: 1.6,
          color: C.ink,
          resize: "vertical",
          outline: "none",
        }}
      />
    </SectionShell>
  );
}

function refineBrief(
  current: string,
  keywords: string[],
  tone: MetalTone,
  heirlooms: Heirloom[],
): string {
  const base = current.trim();
  const toneWord =
    tone === "warm_gold"
      ? "leans warm 22k gold — antique, heritage-forward"
      : tone === "rose_gold"
        ? "leans rose gold — romantic, soft copper warmth"
        : tone === "cool_platinum"
          ? "leans cool platinum and diamond-white — clean, contemporary"
          : "leans oxidized silver — antique, editorial, quieter";
  const kwPart = keywords.length ? `Key notes: ${keywords.slice(0, 6).join(", ")}.` : "";
  const confirmed = heirlooms.filter((h) => h.status === "confirmed");
  const heirPart =
    confirmed.length > 0
      ? ` ${confirmed.length === 1 ? "One piece is" : `${confirmed.length} pieces are`} already spoken for (family/heirloom) — the new set should complement without competing.`
      : "";
  const lead = base
    ? `${base}\n\n`
    : "We want jewelry that feels like us — worn, not performed. Pieces that could've been in the family for a generation already. ";
  return `${lead}The overall palette ${toneWord}.${heirPart} ${kwPart}`.trim();
}

// ─── Notes ──────────────────────────────────────────────────────────────
function NotesSection({
  notes,
  onAdd,
  onRemove,
}: {
  notes: Note[];
  onAdd: (body: string) => void;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const v = draft.trim();
    if (!v) return;
    onAdd(v);
    setDraft("");
  };

  return (
    <SectionShell>
      <SectionHead title="Notes" hint="Anything else the team should see." />
      {notes.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {notes.map((n) => (
            <li
              key={n.id}
              style={{
                padding: "10px 14px",
                backgroundColor: C.ivorySoft,
                border: `1px solid ${C.lineSoft}`,
                borderRadius: 2,
                fontFamily: FONT_SERIF,
                fontSize: 13.5,
                color: C.inkSoft,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <span>{n.body}</span>
              <button
                onClick={() => onRemove(n.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: C.muted,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        style={{ display: "flex", gap: 6 }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note…"
          style={inputStyle()}
        />
        <button type="submit" style={primaryButtonStyle()}>
          Save
        </button>
      </form>
    </SectionShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Non-Vision tabs — couple-facing planning surfaces. Light first passes
// that share the same design language so the workspace reads as one.
// ─────────────────────────────────────────────────────────────────────────

export function ShortlistContractTab({
  category,
}: {
  category?: WorkspaceCategory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionHead
        title="Shortlist & Contract"
        hint="Jewelers you're evaluating, quotes, and the signed contract for your chosen vendor."
      />
      <EmptyState
        icon="❦"
        title="No vendors shortlisted yet."
        body="Invite a jeweler to quote, or save vendors from the marketplace to start comparing."
      />
      {category && <ContractChecklistBlock category={category} />}
    </div>
  );
}

// ─── Shortlist-style jewelry tabs (Bridal / Groom) ─────────────────────
type PieceStatus = "wishlist" | "sourcing" | "ordered" | "received";

const PIECE_STATUS_META: Record<
  PieceStatus,
  { label: string; fg: string; bg: string }
> = {
  wishlist: { label: "Wishlist", fg: C.muted, bg: C.ivorySoft },
  sourcing: { label: "Sourcing", fg: C.goldDeep, bg: C.goldSoft },
  ordered: { label: "Ordered", fg: C.inkSoft, bg: C.champagne },
  received: { label: "Received", fg: C.leaf, bg: "#E8EDE3" },
};

interface PieceRow {
  id: string;
  name: string;
  pieceType: PieceType;
  event: JewelryEventKey | "any";
  status: PieceStatus;
  note: string;
  buyUrl: string;
}

interface PieceListState {
  pieces: PieceRow[];
}

const PIECE_LIST_DEFAULT: PieceListState = { pieces: [] };

function BridalOrGroomTab({
  storageKey,
  title,
  hint,
  seeds,
}: {
  storageKey: string;
  title: string;
  hint: string;
  seeds: Array<{ name: string; pieceType: PieceType; event: JewelryEventKey | "any" }>;
}) {
  const [state, setState] = usePersistentState<PieceListState>(
    storageKey,
    PIECE_LIST_DEFAULT,
  );

  const add = (seed?: { name: string; pieceType: PieceType; event: JewelryEventKey | "any" }) => {
    const row: PieceRow = {
      id: uid(),
      name: seed?.name ?? "",
      pieceType: seed?.pieceType ?? "necklace",
      event: seed?.event ?? "wedding",
      status: "wishlist",
      note: "",
      buyUrl: "",
    };
    setState((s) => ({ pieces: [...s.pieces, row] }));
  };

  const update = (id: string, patch: Partial<PieceRow>) =>
    setState((s) => ({
      pieces: s.pieces.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));

  const remove = (id: string) =>
    setState((s) => ({ pieces: s.pieces.filter((p) => p.id !== id) }));

  const unseeded = seeds.filter((s) => !state.pieces.some((p) => p.name === s.name));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SectionHead title={title} hint={hint} />

      {state.pieces.length === 0 && (
        <EmptyState
          icon="💎"
          title="Nothing tracked yet."
          body="Start from the suggested pieces below or add your own. Each piece tracks as you move from wishlist → sourcing → ordered → received."
        />
      )}

      {unseeded.length > 0 && (
        <div>
          <SubsectionHead>Suggested pieces</SubsectionHead>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {unseeded.map((s) => (
              <button
                key={s.name}
                onClick={() => add(s)}
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  border: `1px dashed ${C.line}`,
                  borderRadius: 999,
                  backgroundColor: "transparent",
                  color: C.inkSoft,
                  cursor: "pointer",
                  fontFamily: FONT_SANS,
                }}
              >
                + {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.pieces.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {state.pieces.map((p) => (
            <PieceRowCard
              key={p.id}
              piece={p}
              onChange={(patch) => update(p.id, patch)}
              onRemove={() => remove(p.id)}
            />
          ))}
        </div>
      )}

      <div>
        <button onClick={() => add()} style={secondaryButtonStyle()}>
          + Add a piece
        </button>
      </div>
    </div>
  );
}

function PieceRowCard({
  piece,
  onChange,
  onRemove,
}: {
  piece: PieceRow;
  onChange: (p: Partial<PieceRow>) => void;
  onRemove: () => void;
}) {
  const statusMeta = PIECE_STATUS_META[piece.status];
  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        borderLeft: `3px solid ${statusMeta.fg}`,
        backgroundColor: C.paper,
        borderRadius: 2,
        padding: 12,
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr 1fr auto",
        gap: 10,
        alignItems: "center",
      }}
    >
      <input
        value={piece.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Piece name — e.g. Rani haar"
        style={{
          padding: "6px 8px",
          border: "none",
          borderBottom: `1px solid ${C.lineSoft}`,
          backgroundColor: "transparent",
          fontFamily: FONT_SERIF,
          fontSize: 14,
          color: C.ink,
          outline: "none",
        }}
      />
      <select
        value={piece.pieceType}
        onChange={(e) => onChange({ pieceType: e.target.value as PieceType })}
        style={selectPillStyle()}
      >
        {PIECE_TYPES.map((p) => (
          <option key={p.v} value={p.v}>
            {p.label}
          </option>
        ))}
      </select>
      <select
        value={piece.event}
        onChange={(e) =>
          onChange({ event: e.target.value as JewelryEventKey | "any" })
        }
        style={selectPillStyle()}
      >
        <option value="any">Any event</option>
        {EVENT_KEYS.map((e) => (
          <option key={e.key} value={e.key}>
            {e.label}
          </option>
        ))}
      </select>
      <select
        value={piece.status}
        onChange={(e) => onChange({ status: e.target.value as PieceStatus })}
        style={{
          ...selectPillStyle(),
          backgroundColor: statusMeta.bg,
          color: statusMeta.fg,
          borderColor: statusMeta.fg,
        }}
      >
        {(Object.keys(PIECE_STATUS_META) as PieceStatus[]).map((s) => (
          <option key={s} value={s}>
            {PIECE_STATUS_META[s].label}
          </option>
        ))}
      </select>
      <button
        onClick={onRemove}
        style={{
          border: "none",
          background: "transparent",
          color: C.muted,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        ×
      </button>
      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          paddingTop: 8,
          borderTop: `1px dashed ${C.lineSoft}`,
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 9.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.gold,
          }}
        >
          Where to buy
        </span>
        <input
          value={piece.buyUrl}
          onChange={(e) => onChange({ buyUrl: e.target.value })}
          placeholder="Paste a product URL (optional)"
          style={{
            flex: 1,
            minWidth: 160,
            padding: "5px 8px",
            border: `1px solid ${C.lineSoft}`,
            borderRadius: 2,
            backgroundColor: C.ivorySoft,
            fontFamily: FONT_SANS,
            fontSize: 11.5,
            color: C.inkSoft,
            outline: "none",
          }}
        />
        {piece.buyUrl && (
          <a
            href={piece.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              padding: "4px 10px",
              border: `1px solid ${C.goldDeep}`,
              borderRadius: 2,
              color: C.goldDeep,
              textDecoration: "none",
              fontFamily: FONT_SANS,
            }}
          >
            Open link ↗
          </a>
        )}
        <a
          href="/marketplace/category/jewelry"
          style={{
            fontSize: 11,
            padding: "4px 10px",
            border: `1px solid ${C.line}`,
            borderRadius: 2,
            color: C.inkSoft,
            textDecoration: "none",
            fontFamily: FONT_SANS,
          }}
        >
          Browse vendors →
        </a>
      </div>
    </div>
  );
}

export function BridalJewelryTab() {
  return (
    <BridalOrGroomTab
      storageKey="ananya:jewelry-bridal:v1"
      title="Bridal Jewelry"
      hint="The pieces you're building for yourself — shopping list, sourcing status, delivery tracking. Group by event so pairings stay legible."
      seeds={[
        { name: "Rani haar", pieceType: "necklace", event: "wedding" },
        { name: "Choker", pieceType: "necklace", event: "wedding" },
        { name: "Jhumkas", pieceType: "earrings", event: "sangeet" },
        { name: "Maang tikka", pieceType: "maang_tikka", event: "wedding" },
        { name: "Nath", pieceType: "nath", event: "wedding" },
        { name: "Haath phool", pieceType: "earrings", event: "mehendi" },
        { name: "Kada set", pieceType: "bangles", event: "wedding" },
        { name: "Reception earrings", pieceType: "earrings", event: "reception" },
      ]}
    />
  );
}

export function GroomJewelryTab() {
  return (
    <BridalOrGroomTab
      storageKey="ananya:jewelry-groom:v1"
      title="Groom's Jewelry"
      hint="Sherwanis need their own jewelry language. Track the safa brooch, kalgi, mala, buttons, and cufflinks here with the same care as the bridal pieces."
      seeds={[
        { name: "Safa brooch", pieceType: "brooch_pin", event: "wedding" },
        { name: "Kalgi", pieceType: "brooch_pin", event: "wedding" },
        { name: "Mala (ceremonial)", pieceType: "necklace", event: "wedding" },
        { name: "Sherwani buttons", pieceType: "brooch_pin", event: "wedding" },
        { name: "Cufflinks", pieceType: "brooch_pin", event: "reception" },
        { name: "Ring", pieceType: "ring", event: "wedding" },
        { name: "Bracelet / kada", pieceType: "bangles", event: "sangeet" },
      ]}
    />
  );
}

// ─── Family Heirlooms tab — expanded view of the Vision section ────────
export function FamilyHeirloomsTab({
  heirlooms,
  onAdd,
  onUpdate,
  onRemove,
}: {
  heirlooms: Heirloom[];
  onAdd: (h: Heirloom) => void;
  onUpdate: (id: string, patch: Partial<Heirloom>) => void;
  onRemove: (id: string) => void;
}) {
  const groups = useMemo(() => {
    const buckets: Record<HeirloomStatus, Heirloom[]> = {
      confirmed: [],
      pending: [],
      declined: [],
    };
    for (const h of heirlooms) buckets[h.status].push(h);
    return buckets;
  }, [heirlooms]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <SectionHead
        eyebrow="From the family"
        title="Family Heirlooms & Borrowed Pieces"
        hint="A shared space for the pieces that came with stories. Handle with care — these conversations are often still in flux."
        right={
          <button
            onClick={() =>
              onAdd({
                id: uid(),
                photoUrl: "",
                fromWhom: "",
                pieceType: "necklace",
                events: [],
                notes: "",
                careNotes: "",
                status: "pending",
              })
            }
            style={secondaryButtonStyle()}
          >
            + Add piece
          </button>
        }
      />

      {heirlooms.length === 0 && (
        <EmptyState
          icon="❦"
          title="Nothing here yet."
          body="If family is offering or lending jewelry, capture it here so everyone — your stylist, jeweler, and planner — can coordinate around it."
        />
      )}

      {(Object.keys(HEIRLOOM_STATUS_META) as HeirloomStatus[]).map((s) =>
        groups[s].length > 0 ? (
          <div key={s}>
            <SubsectionHead>
              {HEIRLOOM_STATUS_META[s].glyph} {HEIRLOOM_STATUS_META[s].label} ·{" "}
              {groups[s].length}
            </SubsectionHead>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              {groups[s].map((h) => (
                <HeirloomCard
                  key={h.id}
                  heirloom={h}
                  onChange={(p) => onUpdate(h.id, p)}
                  onRemove={() => onRemove(h.id)}
                />
              ))}
            </div>
          </div>
        ) : null,
      )}

      <p style={{ fontSize: 11.5, fontStyle: "italic", color: C.faint, margin: 0 }}>
        This section is shared with your planner and stylist only. Vendor
        access is controlled in Shortlist & Contract.
      </p>
    </div>
  );
}

// ─── Fittings & Coordination ───────────────────────────────────────────
interface Appointment {
  id: string;
  label: string;
  vendor: string;
  date: string;
  attendees: string;
  notes: string;
}

interface FittingsState {
  appointments: Appointment[];
  dayOfNotes: string;
}

const FITTINGS_DEFAULT: FittingsState = {
  appointments: [],
  dayOfNotes: "",
};

export function FittingsCoordinationTab() {
  const [state, setState] = usePersistentState<FittingsState>(
    "ananya:jewelry-fittings:v1",
    FITTINGS_DEFAULT,
  );

  const addAppt = () =>
    setState((s) => ({
      ...s,
      appointments: [
        ...s.appointments,
        {
          id: uid(),
          label: "",
          vendor: "",
          date: "",
          attendees: "",
          notes: "",
        },
      ],
    }));

  const updateAppt = (id: string, patch: Partial<Appointment>) =>
    setState((s) => ({
      ...s,
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));

  const removeAppt = (id: string) =>
    setState((s) => ({
      ...s,
      appointments: s.appointments.filter((a) => a.id !== id),
    }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <SectionHead
        title="Fittings & Coordination"
        hint="Appointments, try-ons, and the day-of handoffs. Who picks up the pieces, who travels with them, where they live on the wedding morning."
        right={
          <button onClick={addAppt} style={secondaryButtonStyle()}>
            + Add appointment
          </button>
        }
      />

      {state.appointments.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No appointments yet."
          body="Add fittings, try-ons, cleanings, and pickup windows. Tag who needs to be there and where the pieces will live between events."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {state.appointments.map((a) => (
            <AppointmentCard
              key={a.id}
              appt={a}
              onChange={(patch) => updateAppt(a.id, patch)}
              onRemove={() => removeAppt(a.id)}
            />
          ))}
        </div>
      )}

      <div>
        <SectionHead
          title="Day-of custody & handoff notes"
          hint="Who carries what, and where it lives between the morning and the mandap."
        />
        <textarea
          value={state.dayOfNotes}
          onChange={(e) => setState((s) => ({ ...s, dayOfNotes: e.target.value }))}
          placeholder="e.g. Mom's safe holds the heirloom set until the baraat. Stylist brings the choker at 3pm. Kalgi lives in the groom's pocket between events."
          style={{
            width: "100%",
            minHeight: 120,
            padding: "14px 16px",
            border: `1px solid ${C.line}`,
            borderRadius: 4,
            backgroundColor: C.paper,
            fontFamily: FONT_SERIF,
            fontSize: 14,
            lineHeight: 1.55,
            color: C.ink,
            resize: "vertical",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

function AppointmentCard({
  appt,
  onChange,
  onRemove,
}: {
  appt: Appointment;
  onChange: (p: Partial<Appointment>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        borderLeft: `3px solid ${C.goldDeep}`,
        backgroundColor: C.paper,
        borderRadius: 2,
        padding: 14,
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr 1fr auto",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <input
        value={appt.label}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder="e.g. Choker fitting"
        style={{
          padding: "6px 8px",
          border: "none",
          borderBottom: `1px solid ${C.lineSoft}`,
          backgroundColor: "transparent",
          fontFamily: FONT_SERIF,
          fontSize: 14,
          color: C.ink,
          outline: "none",
        }}
      />
      <input
        value={appt.vendor}
        onChange={(e) => onChange({ vendor: e.target.value })}
        placeholder="Vendor"
        style={inputStyle()}
      />
      <input
        type="date"
        value={appt.date}
        onChange={(e) => onChange({ date: e.target.value })}
        style={inputStyle()}
      />
      <input
        value={appt.attendees}
        onChange={(e) => onChange({ attendees: e.target.value })}
        placeholder="Who's going"
        style={inputStyle()}
      />
      <button
        onClick={onRemove}
        style={{
          border: "none",
          background: "transparent",
          color: C.muted,
          cursor: "pointer",
          fontSize: 16,
          alignSelf: "center",
        }}
      >
        ×
      </button>
      <textarea
        value={appt.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        placeholder="Notes…"
        rows={1}
        style={{
          gridColumn: "1 / -1",
          padding: "6px 8px",
          border: `1px solid ${C.lineSoft}`,
          borderRadius: 2,
          backgroundColor: C.ivorySoft,
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 12.5,
          color: C.muted,
          outline: "none",
          resize: "vertical",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Quiz modal (5 questions → keywords, metal tone, draft brief)
// ─────────────────────────────────────────────────────────────────────────
interface QuizResult {
  keywords: string[];
  metalTone: MetalTone;
  brief: string;
}

interface QuizAnswer {
  heaviness: "delicate" | "balanced" | "statement";
  tradition: "heritage" | "fusion" | "modern";
  metal: MetalTone;
  piecesCount: "few" | "layered" | "maximalist";
  feeling: "romantic" | "regal" | "quiet";
}

const QUIZ_INITIAL: QuizAnswer = {
  heaviness: "balanced",
  tradition: "fusion",
  metal: "warm_gold",
  piecesCount: "layered",
  feeling: "regal",
};

export function QuizModal({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (result: QuizResult) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>(QUIZ_INITIAL);

  const questions: Array<{
    label: string;
    field: keyof QuizAnswer;
    options: Array<{ v: string; label: string; hint: string }>;
  }> = [
    {
      label: "How heavy do you want the pieces to feel?",
      field: "heaviness",
      options: [
        { v: "delicate", label: "Delicate", hint: "Light, layerable, everyday-adjacent" },
        { v: "balanced", label: "Balanced", hint: "Presence without weight" },
        { v: "statement", label: "Statement", hint: "Heirloom-scale, full coverage" },
      ],
    },
    {
      label: "Where does your taste live?",
      field: "tradition",
      options: [
        { v: "heritage", label: "Heritage", hint: "Kundan, polki, temple, antique" },
        { v: "fusion", label: "Fusion", hint: "Modern takes on traditional forms" },
        { v: "modern", label: "Modern minimal", hint: "Clean lines, diamond-forward" },
      ],
    },
    {
      label: "Which metal pulls you first?",
      field: "metal",
      options: [
        { v: "warm_gold", label: "Warm gold", hint: "22k richness" },
        { v: "rose_gold", label: "Rose gold", hint: "Soft, romantic copper" },
        { v: "cool_platinum", label: "Cool platinum", hint: "White metals and diamonds" },
        { v: "oxidized", label: "Oxidized silver", hint: "Antique patina, editorial" },
      ],
    },
    {
      label: "How many pieces at once?",
      field: "piecesCount",
      options: [
        { v: "few", label: "Just the essentials", hint: "Necklace + earrings + tikka" },
        { v: "layered", label: "Layered", hint: "Stacked chokers, multiple haars" },
        { v: "maximalist", label: "Every surface", hint: "Head to toe — nath, haath phool, anklets" },
      ],
    },
    {
      label: "What feeling do you want the jewelry to carry?",
      field: "feeling",
      options: [
        { v: "romantic", label: "Romantic", hint: "Soft, intimate, gentle" },
        { v: "regal", label: "Regal", hint: "Commanding, heritage, scene-stealing" },
        { v: "quiet", label: "Quiet", hint: "Refined, worn-forever, unshowy" },
      ],
    },
  ];

  const current = questions[step]!;
  const total = questions.length;

  const pick = (value: string) => {
    const next = { ...answers, [current.field]: value } as QuizAnswer;
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      onComplete(toResult(next));
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(26, 26, 26, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: C.paper,
          borderRadius: 8,
          padding: 28,
          maxWidth: 520,
          width: "100%",
          boxShadow: "0 20px 40px rgba(26, 26, 26, 0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.gold,
            }}
          >
            Question {step + 1} of {total}
          </span>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: C.muted,
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        <h3
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 22,
            lineHeight: 1.2,
            color: C.ink,
            margin: 0,
            marginBottom: 16,
          }}
        >
          {current.label}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {current.options.map((o) => (
            <button
              key={o.v}
              onClick={() => pick(o.v)}
              style={{
                padding: "14px 16px",
                textAlign: "left",
                border: `1px solid ${C.line}`,
                borderRadius: 4,
                backgroundColor: C.paper,
                cursor: "pointer",
                fontFamily: FONT_SANS,
                transition: "border 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = C.goldDeep)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = C.line)
              }
            >
              <div
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: 16,
                  color: C.ink,
                  marginBottom: 2,
                }}
              >
                {o.label}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>{o.hint}</div>
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: 18,
            height: 2,
            backgroundColor: C.lineSoft,
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((step + 1) / total) * 100}%`,
              backgroundColor: C.goldDeep,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function toResult(a: QuizAnswer): QuizResult {
  const keywords: string[] = [];
  if (a.heaviness === "delicate") keywords.push("delicate");
  if (a.heaviness === "statement") keywords.push("statement");
  if (a.tradition === "heritage") keywords.push("kundan", "polki");
  if (a.tradition === "modern") keywords.push("minimalist", "contemporary");
  if (a.tradition === "fusion") keywords.push("fusion");
  if (a.metal === "warm_gold") keywords.push("antique gold");
  if (a.metal === "rose_gold") keywords.push("rose gold");
  if (a.metal === "cool_platinum") keywords.push("platinum", "diamond");
  if (a.metal === "oxidized") keywords.push("vintage");
  if (a.piecesCount === "layered") keywords.push("layered", "rani haar");
  if (a.feeling === "romantic") keywords.push("pearl");
  if (a.feeling === "regal") keywords.push("temple");

  const heavinessText =
    a.heaviness === "delicate"
      ? "delicate and layerable"
      : a.heaviness === "statement"
        ? "statement-scaled, heirloom-weight"
        : "presence without heaviness";
  const traditionText =
    a.tradition === "heritage"
      ? "rooted in heritage forms — kundan, polki, and temple work"
      : a.tradition === "fusion"
        ? "fusion — traditional silhouettes told through a modern lens"
        : "modern and minimal, diamond-forward without the ornament";
  const feelingText =
    a.feeling === "romantic"
      ? "gentle and intimate"
      : a.feeling === "regal"
        ? "regal and scene-holding"
        : "quiet, worn-forever";

  const brief = `We want pieces that feel ${heavinessText}, ${traditionText}. The palette leans ${METAL_TONE_META[a.metal].label.toLowerCase()}. We want the overall register to read ${feelingText} — not performed. Pieces we'd pass down.`;

  return { keywords, metalTone: a.metal, brief };
}

// ─────────────────────────────────────────────────────────────────────────
// Shared shells and primitives (mirrors Photography workspace)
// ─────────────────────────────────────────────────────────────────────────
function SectionShell({ children }: { children: ReactNode }) {
  return <section>{children}</section>;
}

function SectionHead({
  title,
  hint,
  eyebrow,
  right,
}: {
  title: string;
  hint?: string;
  eyebrow?: string;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 18,
        borderBottom: `1px solid ${C.lineSoft}`,
        paddingBottom: 10,
      }}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: 6,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h3
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 22,
            margin: 0,
            color: C.ink,
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>
        {hint && (
          <p
            style={{
              color: C.muted,
              margin: "4px 0 0",
              fontSize: 13,
              lineHeight: 1.45,
            }}
          >
            {hint}
          </p>
        )}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function SubsectionHead({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Pill({
  children,
  filled,
  onClick,
  onRemove,
}: {
  children: ReactNode;
  filled?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: filled ? "5px 6px 5px 12px" : "5px 12px",
    border: `1px solid ${filled ? C.goldDeep : C.line}`,
    borderRadius: 999,
    backgroundColor: filled ? C.ink : "transparent",
    color: filled ? C.ivory : C.inkSoft,
    fontSize: 12,
    cursor: onClick ? "pointer" : "default",
    fontFamily: FONT_SANS,
    letterSpacing: "0.02em",
  };
  if (onClick) {
    return (
      <button onClick={onClick} style={{ ...base, border: `1px solid ${C.line}` }}>
        + {children}
      </button>
    );
  }
  return (
    <span style={base}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            border: "none",
            background: "transparent",
            color: filled ? C.goldSoft : C.muted,
            cursor: "pointer",
            padding: "0 4px",
            fontSize: 14,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  body,
  dashed,
  onDrop,
}: {
  icon: string;
  title: string;
  body: string;
  dashed?: boolean;
  onDrop?: (files: FileList | null) => void;
}) {
  return (
    <div
      onDragOver={(e) => {
        if (onDrop) e.preventDefault();
      }}
      onDrop={(e) => {
        if (onDrop) {
          e.preventDefault();
          onDrop(e.dataTransfer.files);
        }
      }}
      style={{
        border: `${dashed ? "1.5px dashed" : "1px solid"} ${C.lineSoft}`,
        backgroundColor: C.overlay,
        borderRadius: 2,
        padding: "44px 28px",
        textAlign: "center",
        color: C.muted,
      }}
    >
      <div style={{ fontSize: 30, marginBottom: 10, color: C.goldDeep }}>{icon}</div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 20,
          color: C.ink,
          fontStyle: "italic",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13.5, maxWidth: 440, margin: "0 auto", lineHeight: 1.55 }}>
        {body}
      </div>
    </div>
  );
}

function primaryButtonStyle(): CSSProperties {
  return {
    padding: "8px 18px",
    backgroundColor: C.ink,
    color: C.ivory,
    border: "none",
    borderRadius: 2,
    fontSize: 12.5,
    fontFamily: FONT_SANS,
    fontWeight: 500,
    letterSpacing: "0.04em",
    cursor: "pointer",
  };
}

function secondaryButtonStyle(): CSSProperties {
  return {
    padding: "8px 16px",
    backgroundColor: "transparent",
    color: C.inkSoft,
    border: `1px solid ${C.line}`,
    borderRadius: 2,
    fontSize: 12.5,
    fontFamily: FONT_SANS,
    cursor: "pointer",
  };
}

function textButtonStyle(): CSSProperties {
  return {
    padding: "6px 10px",
    backgroundColor: "transparent",
    color: C.goldDeep,
    border: "none",
    borderRadius: 2,
    fontSize: 12,
    fontFamily: FONT_SANS,
    fontWeight: 500,
    cursor: "pointer",
  };
}

function inputStyle(): CSSProperties {
  return {
    flex: 1,
    padding: "8px 12px",
    border: `1px solid ${C.line}`,
    borderRadius: 2,
    backgroundColor: C.paper,
    fontFamily: FONT_SANS,
    fontSize: 13,
    color: C.ink,
    outline: "none",
    minWidth: 0,
  };
}

function selectPillStyle(): CSSProperties {
  return {
    padding: "6px 10px",
    fontSize: 12,
    border: `1px solid ${C.line}`,
    borderRadius: 2,
    backgroundColor: C.paper,
    color: C.inkSoft,
    outline: "none",
    fontFamily: FONT_SANS,
    cursor: "pointer",
  };
}

function tagChipStyle(): CSSProperties {
  return {
    fontSize: 10,
    padding: "3px 8px",
    borderRadius: 2,
    backgroundColor: "rgba(251, 249, 244, 0.92)",
    color: C.inkSoft,
    fontFamily: FONT_MONO,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };
}

// ─── Exports for canvas wiring ─────────────────────────────────────────
export type { Heirloom, MoodImage, OutfitLook };
