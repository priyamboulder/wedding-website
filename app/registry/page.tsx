"use client";

// ═══════════════════════════════════════════════════════════════════════════════════
//   REGISTRY — Ananya's dual-audience gift registry
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Serves two distinct audiences:
//     MANAGE (couple)  — dashboard, builder, item management, gift tracking, analytics
//     PREVIEW (guest)  — a public-facing registry page that inherits the Studio brand
//
//   Blends traditional Indian gift customs (shagun, gold, auspicious amounts) with
//   modern registries (home goods, honeymoon fund, charitable giving). Cultural
//   copy replaces big-box framing — "Blessings" over "Cash Gifts", "Shagun" as
//   its own first-class fund type.
//
//   ───────────────────────────────────────────────────────────────────────────
//   Supabase-ready schema sketch (all tables scoped by wedding_id)
//   ───────────────────────────────────────────────────────────────────────────
//
//   registries (
//     id uuid pk, wedding_id uuid fk,
//     slug text unique,                       -- public URL segment, e.g. "priya-arjun"
//     cover_photo_url text null,
//     welcome_note text,                      -- personal message shown on hero
//     brand_system_id uuid fk null,           -- pulls from Studio
//     events text[],                          -- ['engagement','sangeet','wedding','reception']
//     is_public bool,
//     created_at, updated_at
//   )
//
//   registry_types (
//     id uuid pk, registry_id uuid fk,
//     kind text,                              -- traditional | shagun | honeymoon |
//                                             -- home_fund | charitable | gold_jewelry
//     label text,                             -- couple-overridable display name
//     description text null,
//     suggested_amounts int[] null,           -- shagun / honeymoon defaults
//     target_amount_cents int null,           -- for goal-based funds
//     sort_order int,
//     is_enabled bool
//   )
//
//   registry_items (
//     id uuid pk, registry_type_id uuid fk,
//     title text, description text null,
//     image_url text null, retailer_url text null, retailer_name text null,
//     price_cents int null,                   -- null for funds
//     quantity_desired int default 1,
//     quantity_claimed int default 0,
//     allows_group_gifting bool default false,
//     priority text,                          -- high | normal | low
//     category text null,                     -- kitchen | decor | experience | jewelry | ...
//     event_tag text null,                    -- engagement | wedding | reception
//     couple_note text null,                  -- "reminds us of our first trip together…"
//     source text,                            -- marketplace | imported | custom
//     sort_order int,
//     created_at
//   )
//
//   gift_received (
//     id uuid pk, registry_item_id uuid fk null,
//     registry_type_id uuid fk,               -- for cash/fund gifts without a specific item
//     guest_id uuid fk null,                  -- links to guests module
//     guest_name_cached text,                 -- in case guest not in system
//     amount_cents int,                       -- for funds, or captured value for items
//     quantity int default 1,
//     event_tag text,                         -- which event it was given at
//     blessing_message text null,             -- personal note from guest
//     received_at timestamp,
//     delivery_method text,                   -- shipped | in_person | pending
//     status text                             -- pending | arrived | exchanged
//   )
//
//   thank_you_notes (
//     id uuid pk, gift_received_id uuid fk,
//     status text,                            -- drafted | sent | skipped
//     channel text,                           -- handwritten | email | both
//     sent_at timestamp null,
//     draft_body text null,
//     assignee text                           -- 'bride' | 'groom' | 'both'
//   )
//
//   Persistence: no backend. All data lives in localStorage keyed by wedding_id.
//   Keys: ananya:registry:<weddingId>:types, :items, :gifts, :notes, :meta.
// ═══════════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { X, Trash2 } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { cn } from "@/lib/utils";
import {
  Gift,
  Sparkles,
  Heart,
  Plane,
  Home as HomeIcon,
  HandHeart,
  Gem,
  Coins,
  Eye,
  Settings2,
  LayoutDashboard,
  Package,
  MailOpen,
  BarChart3,
  Plus,
  ExternalLink,
  Check,
  Clock,
  TrendingUp,
  Users as UsersIcon,
  Flame,
  ArrowUpRight,
  ChevronRight,
  Share2,
  Copy,
  ArrowRight,
  Filter,
  Star,
  ShoppingBag,
  MapPin,
  Utensils,
  Wine,
  Palmtree,
  Camera,
  BookHeart,
  Leaf,
  Droplets,
  Sprout,
  type LucideIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
//   Types
// ═══════════════════════════════════════════════════════════════════════════

type RegistryKind =
  | "traditional"
  | "shagun"
  | "honeymoon"
  | "home_fund"
  | "charitable"
  | "gold_jewelry";

type Priority = "high" | "normal" | "low";
type EventTag = "engagement" | "sangeet" | "wedding" | "reception";

type RegistryType = {
  id: string;
  kind: RegistryKind;
  label: string;
  tagline: string;
  description: string;
  suggestedAmounts?: number[];
  targetAmount?: number;
  enabled: boolean;
};

type RegistryItem = {
  id: string;
  typeId: RegistryKind;
  title: string;
  subtitle?: string;
  description?: string;
  retailer?: string;
  price?: number;
  quantityDesired: number;
  quantityClaimed: number;
  groupGifting?: boolean;
  contributionSoFar?: number;
  priority: Priority;
  category?: string;
  eventTag?: EventTag;
  coupleNote?: string;
  imageTheme: ImageTheme;
};

type ImageTheme =
  | "silk"
  | "copper"
  | "marble"
  | "kitchen"
  | "crystal"
  | "ceramic"
  | "gold"
  | "pearl"
  | "beach"
  | "sunset"
  | "spa"
  | "wine"
  | "villa"
  | "education"
  | "water"
  | "trees"
  | "home";

type GiftReceived = {
  id: string;
  itemId?: string;
  typeId: RegistryKind;
  guestName: string;
  side: "bride" | "groom" | "mutual";
  amount: number;
  eventTag: EventTag;
  blessingMessage?: string;
  receivedAt: string;
  status: "pending" | "arrived" | "exchanged";
  thankYouStatus: "pending" | "drafted" | "sent";
};

// ═══════════════════════════════════════════════════════════════════════════
//   Currency / formatting helpers
// ═══════════════════════════════════════════════════════════════════════════

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtUSDShort = (n: number) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n}`;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

// ═══════════════════════════════════════════════════════════════════════════
//   Sample data — Priya & Arjun
// ═══════════════════════════════════════════════════════════════════════════

const REGISTRY_META = {
  couple: { bride: "Priya", groom: "Arjun" },
  weddingDate: "November 14, 2026",
  monogram: "P&A",
  welcomeNote:
    "Your presence is our greatest gift. If you wish to mark the occasion with something tangible, we've gathered a few things — small and meaningful — below. Each one carries our gratitude.",
  shareUrl: "ananya.wed/priya-arjun",
};

const REGISTRY_TYPES: RegistryType[] = [
  {
    id: "traditional",
    kind: "traditional",
    label: "The Home",
    tagline: "Objects for a shared life",
    description:
      "Hand-picked pieces for the home we're building together — heirloom-quality and chosen with care.",
    enabled: true,
  },
  {
    id: "shagun",
    kind: "shagun",
    label: "Shagun",
    tagline: "Your blessing, in auspicious numbers",
    description:
      "A traditional offering of good fortune. Contributions ending in one — $51, $101, $501 — carry the wish for continuation.",
    suggestedAmounts: [51, 101, 251, 501, 1001],
    enabled: true,
  },
  {
    id: "honeymoon",
    kind: "honeymoon",
    label: "Santorini Honeymoon",
    tagline: "Moments in the caldera",
    description:
      "We're spending two weeks on the Greek islands after the wedding. Help us make a memory.",
    targetAmount: 12000,
    enabled: true,
  },
  {
    id: "gold_jewelry",
    kind: "gold_jewelry",
    label: "Gold & Heirlooms",
    tagline: "Pieces to pass down",
    description:
      "Traditional jewelry, curated with Tanishq and our family jeweler in Jaipur.",
    enabled: true,
  },
  {
    id: "charitable",
    kind: "charitable",
    label: "In Lieu of Gifts",
    tagline: "Causes close to our hearts",
    description:
      "Three organizations we've supported for years. A contribution in our names means the world.",
    enabled: true,
  },
  {
    id: "home_fund",
    kind: "home_fund",
    label: "Home Fund",
    tagline: "The apartment in Bangalore",
    description:
      "We're closing on our first place in January. Every contribution helps.",
    targetAmount: 25000,
    enabled: false,
  },
];

const ITEMS: RegistryItem[] = [
  // ── Traditional / home ────────────────────────────────────────────
  {
    id: "i1",
    typeId: "traditional",
    title: "Hand-embroidered silk throw",
    subtitle: "Jaipur atelier · aari work · 60×90",
    retailer: "Good Earth",
    price: 285,
    quantityDesired: 1,
    quantityClaimed: 0,
    priority: "high",
    category: "decor",
    coupleNote:
      "We saw one exactly like this at Priya's grandmother's house growing up.",
    imageTheme: "silk",
  },
  {
    id: "i2",
    typeId: "traditional",
    title: "Copper tea service",
    subtitle: "Hand-hammered · 6-piece · with tray",
    retailer: "P. Orr & Sons",
    price: 450,
    quantityDesired: 1,
    quantityClaimed: 1,
    priority: "high",
    category: "kitchen",
    imageTheme: "copper",
  },
  {
    id: "i3",
    typeId: "traditional",
    title: "Marble cheese & charcuterie board",
    subtitle: "Carrara with brass inlay",
    retailer: "Nicobar",
    price: 165,
    quantityDesired: 1,
    quantityClaimed: 0,
    priority: "normal",
    category: "kitchen",
    imageTheme: "marble",
  },
  {
    id: "i4",
    typeId: "traditional",
    title: "KitchenAid Artisan stand mixer",
    subtitle: "Empire red · 5-qt",
    retailer: "Williams Sonoma",
    price: 449,
    quantityDesired: 1,
    quantityClaimed: 0,
    priority: "normal",
    category: "kitchen",
    imageTheme: "kitchen",
  },
  {
    id: "i5",
    typeId: "traditional",
    title: "Crystal decanter pair",
    subtitle: "Hand-blown Bohemian crystal",
    retailer: "Moser",
    price: 320,
    quantityDesired: 2,
    quantityClaimed: 0,
    priority: "normal",
    category: "bar",
    imageTheme: "crystal",
  },
  {
    id: "i6",
    typeId: "traditional",
    title: "Le Creuset Dutch oven",
    subtitle: "7.25-qt · saffron",
    retailer: "Le Creuset",
    price: 380,
    quantityDesired: 1,
    quantityClaimed: 0,
    priority: "normal",
    category: "kitchen",
    imageTheme: "kitchen",
  },
  {
    id: "i7",
    typeId: "traditional",
    title: "Bone china dinner service",
    subtitle: "12-piece · Wedgwood Renaissance Gold",
    retailer: "Wedgwood",
    price: 1250,
    quantityDesired: 1,
    quantityClaimed: 0,
    groupGifting: true,
    contributionSoFar: 480,
    priority: "high",
    category: "tabletop",
    coupleNote: "Our forever dinner set. For big family meals and beyond.",
    imageTheme: "ceramic",
  },

  // ── Gold & Jewelry ────────────────────────────────────────────────
  {
    id: "i8",
    typeId: "gold_jewelry",
    title: "22K gold ceremonial kada",
    subtitle: "Pair · temple-style engraving",
    retailer: "Tanishq",
    price: 2800,
    quantityDesired: 1,
    quantityClaimed: 0,
    groupGifting: true,
    contributionSoFar: 1250,
    priority: "normal",
    category: "jewelry",
    eventTag: "wedding",
    imageTheme: "gold",
  },
  {
    id: "i9",
    typeId: "gold_jewelry",
    title: "South Sea pearl strand",
    subtitle: "18-inch · 8mm · heirloom clasp",
    retailer: "Amrapali Jaipur",
    price: 1650,
    quantityDesired: 1,
    quantityClaimed: 0,
    priority: "normal",
    category: "jewelry",
    imageTheme: "pearl",
  },

  // ── Honeymoon ─────────────────────────────────────────────────────
  {
    id: "i10",
    typeId: "honeymoon",
    title: "Flight upgrade · Mumbai → Santorini",
    subtitle: "One seat · business class · one way",
    price: 1600,
    quantityDesired: 2,
    quantityClaimed: 1,
    priority: "high",
    category: "flight",
    imageTheme: "sunset",
  },
  {
    id: "i11",
    typeId: "honeymoon",
    title: "Cave villa · Oia",
    subtitle: "Per night · private plunge pool",
    price: 850,
    quantityDesired: 5,
    quantityClaimed: 2,
    priority: "high",
    category: "lodging",
    imageTheme: "villa",
  },
  {
    id: "i12",
    typeId: "honeymoon",
    title: "Sunset catamaran · the caldera",
    subtitle: "Half-day private sail",
    price: 420,
    quantityDesired: 1,
    quantityClaimed: 0,
    priority: "normal",
    category: "experience",
    coupleNote:
      "Arjun's been planning this since our second date. Please.",
    imageTheme: "beach",
  },
  {
    id: "i13",
    typeId: "honeymoon",
    title: "Couples massage · Santo volcanic spa",
    subtitle: "90 minutes · with cave hammam",
    price: 340,
    quantityDesired: 1,
    quantityClaimed: 0,
    priority: "normal",
    category: "experience",
    imageTheme: "spa",
  },
  {
    id: "i14",
    typeId: "honeymoon",
    title: "Private assyrtiko tasting · Santo Wines",
    subtitle: "Six pours · sommelier · caldera view",
    price: 220,
    quantityDesired: 1,
    quantityClaimed: 0,
    priority: "low",
    category: "experience",
    imageTheme: "wine",
  },
  {
    id: "i15",
    typeId: "honeymoon",
    title: "Dinner at Selene · Pyrgos",
    subtitle: "Tasting menu for two · wine pairing",
    price: 280,
    quantityDesired: 1,
    quantityClaimed: 0,
    priority: "normal",
    category: "experience",
    imageTheme: "wine",
  },

  // ── Charitable ────────────────────────────────────────────────────
  {
    id: "i16",
    typeId: "charitable",
    title: "Pratham · a girl's education",
    subtitle: "One year of schooling in rural Rajasthan",
    retailer: "Pratham Education Foundation",
    price: 120,
    quantityDesired: 50,
    quantityClaimed: 11,
    priority: "high",
    category: "cause",
    coupleNote:
      "Priya has taught with Pratham every summer since college. This one is close.",
    imageTheme: "education",
  },
  {
    id: "i17",
    typeId: "charitable",
    title: "Water.org · a clean water well",
    subtitle: "Funds a well serving ~200 in Gujarat",
    retailer: "Water.org",
    price: 250,
    quantityDesired: 10,
    quantityClaimed: 3,
    priority: "normal",
    category: "cause",
    imageTheme: "water",
  },
  {
    id: "i18",
    typeId: "charitable",
    title: "SayTrees · a tree in honor",
    subtitle: "Planted with a dedication card",
    retailer: "SayTrees India",
    price: 40,
    quantityDesired: 100,
    quantityClaimed: 24,
    priority: "normal",
    category: "cause",
    coupleNote: "One for every guest. We'll send the dedication cards after.",
    imageTheme: "trees",
  },
];

const GIFTS_RECEIVED: GiftReceived[] = [
  {
    id: "g1",
    itemId: "i2",
    typeId: "traditional",
    guestName: "Meera & Vikram Shah",
    side: "bride",
    amount: 450,
    eventTag: "engagement",
    receivedAt: "2026-03-22",
    status: "arrived",
    thankYouStatus: "sent",
    blessingMessage: "May your home always smell like cardamom and chai.",
  },
  {
    id: "g2",
    typeId: "shagun",
    guestName: "Sanjay Uncle & Rekha Aunty",
    side: "groom",
    amount: 501,
    eventTag: "engagement",
    receivedAt: "2026-03-22",
    status: "arrived",
    thankYouStatus: "sent",
    blessingMessage: "Ashirwad, beta. From both of us.",
  },
  {
    id: "g3",
    typeId: "shagun",
    guestName: "The Mehta family",
    side: "mutual",
    amount: 251,
    eventTag: "engagement",
    receivedAt: "2026-03-22",
    status: "arrived",
    thankYouStatus: "sent",
  },
  {
    id: "g4",
    typeId: "shagun",
    guestName: "Nisha Patel",
    side: "bride",
    amount: 101,
    eventTag: "engagement",
    receivedAt: "2026-03-24",
    status: "arrived",
    thankYouStatus: "drafted",
  },
  {
    id: "g5",
    itemId: "i10",
    typeId: "honeymoon",
    guestName: "Ravi Chacha",
    side: "groom",
    amount: 1600,
    eventTag: "wedding",
    receivedAt: "2026-04-02",
    status: "arrived",
    thankYouStatus: "pending",
    blessingMessage: "Fly well. See the sunset for us.",
  },
  {
    id: "g6",
    itemId: "i11",
    typeId: "honeymoon",
    guestName: "Anjali & Dev",
    side: "bride",
    amount: 1700,
    eventTag: "wedding",
    receivedAt: "2026-04-05",
    status: "arrived",
    thankYouStatus: "pending",
  },
  {
    id: "g7",
    itemId: "i8",
    typeId: "gold_jewelry",
    guestName: "Papa & Mama",
    side: "bride",
    amount: 1250,
    eventTag: "wedding",
    receivedAt: "2026-04-08",
    status: "arrived",
    thankYouStatus: "pending",
    blessingMessage: "For our daughter. Wear it at every important day.",
  },
  {
    id: "g8",
    itemId: "i16",
    typeId: "charitable",
    guestName: "Rohan & Sneha",
    side: "mutual",
    amount: 240,
    eventTag: "wedding",
    receivedAt: "2026-04-10",
    status: "arrived",
    thankYouStatus: "drafted",
  },
  {
    id: "g9",
    itemId: "i17",
    typeId: "charitable",
    guestName: "Dr. Kapoor",
    side: "groom",
    amount: 750,
    eventTag: "engagement",
    receivedAt: "2026-03-28",
    status: "arrived",
    thankYouStatus: "sent",
  },
  {
    id: "g10",
    typeId: "shagun",
    guestName: "Priya's Bua",
    side: "bride",
    amount: 1001,
    eventTag: "engagement",
    receivedAt: "2026-04-11",
    status: "arrived",
    thankYouStatus: "pending",
    blessingMessage:
      "Our eldest niece. You were always going to be radiant. Blessings.",
  },
  {
    id: "g11",
    itemId: "i18",
    typeId: "charitable",
    guestName: "College friends (pooled)",
    side: "bride",
    amount: 400,
    eventTag: "wedding",
    receivedAt: "2026-04-12",
    status: "arrived",
    thankYouStatus: "pending",
    blessingMessage: "10 trees. One per semester we survived together.",
  },
  {
    id: "g12",
    itemId: "i7",
    typeId: "traditional",
    guestName: "The Iyer cousins",
    side: "groom",
    amount: 480,
    eventTag: "wedding",
    receivedAt: "2026-04-14",
    status: "pending",
    thankYouStatus: "pending",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//   Derived data / helpers
// ═══════════════════════════════════════════════════════════════════════════

const KIND_ICON: Record<RegistryKind, LucideIcon> = {
  traditional: HomeIcon,
  shagun: Sparkles,
  honeymoon: Plane,
  home_fund: HomeIcon,
  charitable: HandHeart,
  gold_jewelry: Gem,
};

const CATEGORY_ICON: Record<string, LucideIcon> = {
  decor: Sparkles,
  kitchen: Utensils,
  bar: Wine,
  tabletop: Utensils,
  jewelry: Gem,
  flight: Plane,
  lodging: HomeIcon,
  experience: Camera,
  cause: HandHeart,
};

const IMAGE_THEME_STYLE: Record<ImageTheme, { gradient: string; icon: LucideIcon }> = {
  silk:      { gradient: "from-rose-pale via-rose-light/50 to-rose/40", icon: Sparkles },
  copper:    { gradient: "from-[#EFC9A6] via-[#C9845A] to-[#7A4A32]", icon: Flame },
  marble:    { gradient: "from-ivory-warm via-ivory-deep to-ink-faint/30", icon: Gem },
  kitchen:   { gradient: "from-saffron-pale via-saffron/60 to-rose/40", icon: Utensils },
  crystal:   { gradient: "from-sage-pale via-sage-light/60 to-sage/50", icon: Wine },
  ceramic:   { gradient: "from-gold-pale via-gold-light/50 to-gold/40", icon: Gem },
  gold:      { gradient: "from-gold-pale via-gold-light to-gold", icon: Gem },
  pearl:     { gradient: "from-ivory via-ivory-warm to-sage-pale", icon: Sparkles },
  beach:     { gradient: "from-sage-pale via-sage-light/60 to-sage/70", icon: Palmtree },
  sunset:    { gradient: "from-saffron-pale via-saffron to-rose", icon: Plane },
  spa:       { gradient: "from-sage-pale via-sage/40 to-ink-soft/40", icon: Leaf },
  wine:      { gradient: "from-rose-pale via-rose/60 to-ink-soft/60", icon: Wine },
  villa:     { gradient: "from-ivory-warm via-sage-pale to-sage-light/60", icon: HomeIcon },
  education: { gradient: "from-gold-pale via-saffron-pale to-rose-pale", icon: BookHeart },
  water:     { gradient: "from-sage-pale via-sage-light to-sage", icon: Droplets },
  trees:     { gradient: "from-sage-pale via-sage to-sage-light", icon: Sprout },
  home:      { gradient: "from-ivory-warm via-gold-pale to-saffron-pale", icon: HomeIcon },
};

function fundTotals(kind: RegistryKind): { received: number; count: number } {
  const rows = GIFTS_RECEIVED.filter((g) => g.typeId === kind);
  return {
    received: rows.reduce((s, g) => s + g.amount, 0),
    count: rows.length,
  };
}

function itemContribution(itemId: string): number {
  return GIFTS_RECEIVED
    .filter((g) => g.itemId === itemId)
    .reduce((s, g) => s + g.amount, 0);
}

// ═══════════════════════════════════════════════════════════════════════════
//   Page
// ═══════════════════════════════════════════════════════════════════════════

type ViewMode = "manage" | "preview";

export default function RegistryPage() {
  const [view, setView] = useState<ViewMode>("manage");

  return (
    <div className="min-h-screen bg-ivory">
      <TopNav>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={setView} />
        </div>
      </TopNav>

      {view === "manage" ? <ManageView /> : <PreviewView />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Top-right view toggle
// ═══════════════════════════════════════════════════════════════════════════

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border border-ink/10 bg-white p-1">
        <button
          type="button"
          onClick={() => onChange("manage")}
          className={cn(
            "flex items-center gap-1.5 rounded-sm px-3 py-1 text-[12.5px] font-medium transition-colors",
            view === "manage"
              ? "bg-ink text-ivory"
              : "text-ink-muted hover:text-ink",
          )}
        >
          <Settings2 size={13} strokeWidth={1.8} />
          Manage
        </button>
        <button
          type="button"
          onClick={() => onChange("preview")}
          className={cn(
            "flex items-center gap-1.5 rounded-sm px-3 py-1 text-[12.5px] font-medium transition-colors",
            view === "preview"
              ? "bg-ink text-ivory"
              : "text-ink-muted hover:text-ink",
          )}
        >
          <Eye size={13} strokeWidth={1.8} />
          Preview public page
        </button>
      </div>
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold-pale/40 px-3 py-1.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-gold-pale"
      >
        <Share2 size={13} strokeWidth={1.8} />
        Share
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   MANAGE VIEW
// ═══════════════════════════════════════════════════════════════════════════

type ManageTab = "dashboard" | "builder" | "items" | "gifts" | "analytics";

const MANAGE_TABS: { id: ManageTab; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "builder", label: "Builder", icon: Settings2 },
  { id: "items", label: "Items", icon: Package },
  { id: "gifts", label: "Gifts & Thank-yous", icon: MailOpen },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

function ManageView() {
  const [tab, setTab] = useState<ManageTab>("dashboard");

  return (
    <div>
      {/* Sub-nav */}
      <div className="flex items-center gap-1 border-b border-ink/5 bg-white px-8 py-2">
        {MANAGE_TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                active
                  ? "bg-ivory-warm text-ink"
                  : "text-ink-muted hover:bg-ivory-warm/60 hover:text-ink",
              )}
            >
              <Icon size={13} strokeWidth={1.8} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="editorial-padding">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "builder" && <BuilderTab />}
        {tab === "items" && <ItemsTab />}
        {tab === "gifts" && <GiftsTab />}
        {tab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────

function DashboardTab() {
  const totalValue = useMemo(
    () =>
      ITEMS.reduce((s, i) => s + (i.price ?? 0) * i.quantityDesired, 0) +
      (REGISTRY_TYPES.find((t) => t.kind === "honeymoon")?.targetAmount ?? 0),
    [],
  );

  const totalReceived = GIFTS_RECEIVED.reduce((s, g) => s + g.amount, 0);
  const giftCount = GIFTS_RECEIVED.length;
  const thankYousSent = GIFTS_RECEIVED.filter(
    (g) => g.thankYouStatus === "sent",
  ).length;
  const thankYousPending = GIFTS_RECEIVED.filter(
    (g) => g.thankYouStatus !== "sent",
  ).length;

  const shagunTotal = fundTotals("shagun");
  const honeymoonTotal = fundTotals("honeymoon");
  const charitableTotal = fundTotals("charitable");

  // Top contributors
  const contributors = useMemo(() => {
    const byName = new Map<string, { total: number; side: GiftReceived["side"] }>();
    for (const g of GIFTS_RECEIVED) {
      const existing = byName.get(g.guestName);
      if (existing) existing.total += g.amount;
      else byName.set(g.guestName, { total: g.amount, side: g.side });
    }
    return [...byName.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);
  }, []);

  const recent = [...GIFTS_RECEIVED]
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
    .slice(0, 6);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
            Registry · Overview
          </p>
          <h2 className="mt-1.5 font-serif text-3xl font-bold tracking-tight">
            Gifts so far
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Received across engagement and pre-wedding events —{" "}
            {REGISTRY_META.weddingDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="flex items-center gap-1.5 rounded-md border border-ink/10 bg-white px-3 py-1.5 text-[12.5px] text-ink-muted hover:text-ink"
          >
            <Copy size={13} strokeWidth={1.8} />
            <span className="font-mono text-[11px]">{REGISTRY_META.shareUrl}</span>
          </a>
        </div>
      </div>

      {/* Metric row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Total received"
          value={fmtUSD(totalReceived)}
          sub={`of ${fmtUSD(totalValue)} registry value`}
          icon={TrendingUp}
          accent="gold"
        />
        <MetricCard
          label="Gifts received"
          value={giftCount.toString()}
          sub={`${GIFTS_RECEIVED.filter((g) => g.status === "arrived").length} arrived · ${GIFTS_RECEIVED.filter((g) => g.status === "pending").length} in transit`}
          icon={Gift}
        />
        <MetricCard
          label="Thank-yous sent"
          value={`${thankYousSent} / ${giftCount}`}
          sub={`${thankYousPending} pending`}
          icon={MailOpen}
          accent={thankYousPending > 5 ? "rose" : undefined}
        />
        <MetricCard
          label="Shagun pool"
          value={fmtUSD(shagunTotal.received)}
          sub={`${shagunTotal.count} blessings received`}
          icon={Sparkles}
          accent="saffron"
        />
      </div>

      {/* Fund progress row */}
      <div className="grid grid-cols-3 gap-4">
        <FundProgressCard
          label="Honeymoon fund"
          kind="honeymoon"
          received={honeymoonTotal.received}
          goal={
            REGISTRY_TYPES.find((t) => t.kind === "honeymoon")?.targetAmount ?? 0
          }
          contributors={honeymoonTotal.count}
        />
        <FundProgressCard
          label="Shagun pool"
          kind="shagun"
          received={shagunTotal.received}
          goal={null}
          contributors={shagunTotal.count}
        />
        <FundProgressCard
          label="Charitable giving"
          kind="charitable"
          received={charitableTotal.received}
          goal={null}
          contributors={charitableTotal.count}
        />
      </div>

      {/* Contributors + activity */}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 rounded-lg border border-ink/5 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold">Top contributors</h3>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              to date
            </span>
          </div>
          <div className="mt-4 divide-y divide-ink/5">
            {contributors.map(([name, { total, side }], idx) => (
              <div
                key={name}
                className="flex items-center justify-between py-3 first:pt-0"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-ink-faint">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-ink">{name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                      {side === "mutual" ? "shared" : `${side} side`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-medium text-ink">
                    {fmtUSD(total)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 rounded-lg border border-ink/5 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold">Recent activity</h3>
            <button className="flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink">
              See all <ChevronRight size={12} strokeWidth={1.8} />
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {recent.map((g) => {
              const type = REGISTRY_TYPES.find((t) => t.kind === g.typeId);
              const item = g.itemId
                ? ITEMS.find((i) => i.id === g.itemId)
                : null;
              const Icon = KIND_ICON[g.typeId];
              return (
                <div
                  key={g.id}
                  className="flex items-start gap-3 rounded-md border border-ink/5 bg-ivory/40 px-3 py-3"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gold-pale/60 text-gold">
                    <Icon size={14} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-sm font-medium text-ink">
                        {g.guestName}
                      </div>
                      <div className="font-mono text-[10.5px] text-ink-faint">
                        {fmtDate(g.receivedAt)}
                      </div>
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-ink-muted">
                      Sent {fmtUSD(g.amount)} ·{" "}
                      {item ? item.title : type?.label ?? "—"}
                    </div>
                    {g.blessingMessage && (
                      <div className="mt-1.5 border-l-2 border-gold/30 pl-2 font-serif text-[12.5px] italic text-ink-soft">
                        "{g.blessingMessage}"
                      </div>
                    )}
                  </div>
                  <ThankYouPill status={g.thankYouStatus} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: "gold" | "saffron" | "rose";
}) {
  const accentClass =
    accent === "gold"
      ? "text-gold"
      : accent === "saffron"
      ? "text-saffron"
      : accent === "rose"
      ? "text-rose"
      : "text-ink-muted";

  return (
    <div className="rounded-lg border border-ink/5 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          {label}
        </p>
        <Icon size={14} strokeWidth={1.6} className={accentClass} />
      </div>
      <p className="mt-3 font-serif text-3xl font-medium tracking-tight text-ink">
        {value}
      </p>
      {sub && <p className="mt-1 text-[12px] text-ink-muted">{sub}</p>}
    </div>
  );
}

function FundProgressCard({
  label,
  kind,
  received,
  goal,
  contributors,
}: {
  label: string;
  kind: RegistryKind;
  received: number;
  goal: number | null;
  contributors: number;
}) {
  const Icon = KIND_ICON[kind];
  const pct = goal ? Math.min(100, Math.round((received / goal) * 100)) : null;

  return (
    <div className="rounded-lg border border-ink/5 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} strokeWidth={1.8} className="text-gold" />
          <p className="text-sm font-medium text-ink">{label}</p>
        </div>
        <span className="font-mono text-[10.5px] text-ink-faint">
          {contributors} {contributors === 1 ? "gift" : "gifts"}
        </span>
      </div>
      <p className="mt-4 font-serif text-2xl font-medium tracking-tight text-ink">
        {fmtUSD(received)}
        {goal && (
          <span className="ml-2 font-mono text-[12px] font-normal text-ink-faint">
            / {fmtUSD(goal)}
          </span>
        )}
      </p>
      {pct !== null && (
        <div className="mt-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-ivory-deep">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-light to-gold"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              {pct}% funded
            </span>
            <span className="font-mono text-[10px] text-ink-faint">
              {fmtUSD(Math.max(0, goal! - received))} remaining
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ThankYouPill({ status }: { status: GiftReceived["thankYouStatus"] }) {
  if (status === "sent") {
    return (
      <span className="flex items-center gap-1 rounded-full border border-sage/40 bg-sage-pale/60 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-sage">
        <Check size={10} strokeWidth={2} /> sent
      </span>
    );
  }
  if (status === "drafted") {
    return (
      <span className="flex items-center gap-1 rounded-full border border-gold/40 bg-gold-pale/60 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-gold">
        <Clock size={10} strokeWidth={2} /> drafted
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full border border-rose/40 bg-rose-pale/50 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-rose">
      pending
    </span>
  );
}

// ── Builder ──────────────────────────────────────────────────────────────

function BuilderTab() {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
          Registry · Builder
        </p>
        <h2 className="mt-1.5 font-serif text-3xl font-bold tracking-tight">
          Types of gifts you welcome
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Turn on the categories that feel right. You can mix traditional
          Indian customs with modern funds — guests will see only what's
          enabled.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {REGISTRY_TYPES.map((t) => (
          <RegistryTypeCard key={t.id} type={t} />
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-gold/30 bg-gold-pale/30 p-6 text-center">
        <p className="font-serif text-lg text-ink">
          Want to add a custom fund?
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Education for future children, a vintage car, a recording studio —
          your registry, your rules.
        </p>
        <button className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white px-4 py-2 text-[13px] font-medium hover:bg-ivory-warm">
          <Plus size={13} strokeWidth={1.8} />
          Create a custom fund
        </button>
      </div>
    </div>
  );
}

function RegistryTypeCard({ type }: { type: RegistryType }) {
  const Icon = KIND_ICON[type.kind];
  const itemCount = ITEMS.filter((i) => i.typeId === type.kind).length;
  const totals = fundTotals(type.kind);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border p-5 transition-colors",
        type.enabled
          ? "border-ink/10 bg-white"
          : "border-dashed border-ink/10 bg-ivory/40",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md",
              type.enabled
                ? "bg-gold-pale text-gold"
                : "bg-ivory-deep text-ink-faint",
            )}
          >
            <Icon size={16} strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-medium tracking-tight text-ink">
              {type.label}
            </h3>
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
              {type.tagline}
            </p>
          </div>
        </div>
        <Toggle enabled={type.enabled} />
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
        {type.description}
      </p>

      {type.suggestedAmounts && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            Suggested amounts
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {type.suggestedAmounts.map((a) => (
              <span
                key={a}
                className="rounded-md border border-gold/30 bg-gold-pale/40 px-2.5 py-1 font-mono text-[11px] text-ink"
              >
                ${a}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-3 font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
        <span>
          {type.kind === "shagun" || type.kind === "home_fund"
            ? `${totals.count} ${totals.count === 1 ? "contribution" : "contributions"}`
            : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        </span>
        <span>{fmtUSD(totals.received)} received</span>
      </div>
    </div>
  );
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "relative h-5 w-9 flex-shrink-0 rounded-full transition-colors",
        enabled ? "bg-ink" : "bg-ivory-deep",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          enabled ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

// ── Items tab ────────────────────────────────────────────────────────────

const REGISTRY_ITEMS_KEY = "ananya:registry:items";

function ItemsTab() {
  const [items, setItems] = useState<RegistryItem[]>(() => {
    if (typeof window === "undefined") return ITEMS;
    try {
      const saved = localStorage.getItem(REGISTRY_ITEMS_KEY);
      return saved ? (JSON.parse(saved) as RegistryItem[]) : ITEMS;
    } catch {
      return ITEMS;
    }
  });
  const [filter, setFilter] = useState<RegistryKind | "all">("all");
  const [showAddItem, setShowAddItem] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(REGISTRY_ITEMS_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.typeId === filter)),
    [filter, items],
  );

  const handleAddItem = (item: RegistryItem) => {
    setItems((prev) => [item, ...prev]);
    setShowAddItem(false);
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
            Registry · Items
          </p>
          <h2 className="mt-1.5 font-serif text-3xl font-bold tracking-tight">
            {items.length} items across {REGISTRY_TYPES.filter((t) => t.enabled).length} categories
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-ink/10 bg-white px-3 py-1.5 text-[12.5px] font-medium hover:bg-ivory-warm">
            <ExternalLink size={13} strokeWidth={1.8} />
            Import from Zola
          </button>
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add item
          </button>
        </div>
      </div>

      {/* Filter rail */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`All · ${items.length}`}
        />
        {REGISTRY_TYPES.filter((t) => t.enabled).map((t) => {
          const count = items.filter((i) => i.typeId === t.kind).length;
          if (count === 0) return null;
          return (
            <FilterChip
              key={t.id}
              active={filter === t.kind}
              onClick={() => setFilter(t.kind)}
              label={`${t.label} · ${count}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map((item) => (
          <ItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
        ))}
      </div>

      {showAddItem && (
        <AddItemModal
          onClose={() => setShowAddItem(false)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-ink/10 bg-white text-ink-muted hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

function ItemCard({ item, onDelete }: { item: RegistryItem; onDelete?: (id: string) => void }) {
  const theme = IMAGE_THEME_STYLE[item.imageTheme];
  const ThemeIcon = theme.icon;
  const contribSoFar = item.contributionSoFar ?? itemContribution(item.id);
  const fullyFunded =
    item.price && item.groupGifting
      ? contribSoFar >= item.price
      : item.quantityClaimed >= item.quantityDesired;

  return (
    <div className="group overflow-hidden rounded-lg border border-ink/5 bg-white">
      <div
        className={cn(
          "relative aspect-[4/3] w-full bg-gradient-to-br",
          theme.gradient,
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <ThemeIcon
            size={40}
            strokeWidth={1}
            className="text-white/70"
            aria-hidden
          />
        </div>
        {item.priority === "high" && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-ink">
            <Star size={10} strokeWidth={2} className="text-saffron" />
            priority
          </div>
        )}
        {fullyFunded && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-ink/90 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-ivory">
            <Check size={10} strokeWidth={2} />
            claimed
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-[16px] font-medium tracking-tight text-ink">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="mt-0.5 truncate text-[12px] text-ink-muted">
                {item.subtitle}
              </p>
            )}
          </div>
          {item.price !== undefined && (
            <p className="flex-shrink-0 font-mono text-[13px] font-medium text-ink">
              {fmtUSD(item.price)}
            </p>
          )}
        </div>

        {item.retailer && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
            {item.retailer}
          </p>
        )}

        {item.groupGifting && item.price && (
          <div className="mt-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-ivory-deep">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-light to-gold"
                style={{
                  width: `${Math.min(100, (contribSoFar / item.price) * 100)}%`,
                }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              <span>{fmtUSD(contribSoFar)} contributed</span>
              <span>group gifting</span>
            </div>
          </div>
        )}

        {!item.groupGifting && item.quantityDesired > 1 && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            {item.quantityClaimed} of {item.quantityDesired} claimed
          </p>
        )}

        {onDelete && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500"
            >
              <Trash2 size={11} strokeWidth={1.8} />
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Item Modal ────────────────────────────────────────────────────────

const IMAGE_THEMES = [
  "silk", "copper", "marble", "kitchen", "crystal", "ceramic",
  "gold", "pearl", "beach", "sunset", "spa", "wine", "villa",
  "education", "water", "trees", "home",
] as const;

function AddItemModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (item: RegistryItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [retailer, setRetailer] = useState("");
  const [price, setPrice] = useState("");
  const [typeId, setTypeId] = useState<RegistryKind>("traditional");
  const [priority, setPriority] = useState<Priority>("normal");
  const [quantityDesired, setQuantityDesired] = useState("1");
  const [coupleNote, setCoupleNote] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const item: RegistryItem = {
      id: `i-${Date.now().toString(36)}`,
      typeId,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      retailer: retailer.trim() || undefined,
      price: price ? Number(price) : undefined,
      quantityDesired: Math.max(1, parseInt(quantityDesired, 10) || 1),
      quantityClaimed: 0,
      priority,
      coupleNote: coupleNote.trim() || undefined,
      imageTheme: "silk",
    };
    onAdd(item);
  }

  const enabledTypes = REGISTRY_TYPES.filter((t) => t.enabled);

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

        <h2 className="mb-5 font-serif text-[17px] text-ink">Add Registry Item</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
              Title *
            </label>
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hand-embroidered silk throw"
              className="w-full rounded border border-border px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
              Subtitle / Details
            </label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. 60×90 · aari work"
              className="w-full rounded border border-border px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                Retailer
              </label>
              <input
                value={retailer}
                onChange={(e) => setRetailer(e.target.value)}
                placeholder="e.g. Good Earth"
                className="w-full rounded border border-border px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                Price (USD)
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded border border-border px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
              Category
            </label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value as RegistryKind)}
              className="w-full rounded border border-border px-3 py-1.5 text-[13px] text-ink focus:border-ink focus:outline-none"
            >
              {enabledTypes.map((t) => (
                <option key={t.id} value={t.kind}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                Priority
              </label>
              <div className="flex gap-1.5">
                {(["high", "normal", "low"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded border px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors ${
                      priority === p
                        ? "border-ink bg-ink text-ivory"
                        : "border-border bg-white text-ink-muted hover:border-ink hover:text-ink"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantityDesired}
                onChange={(e) => setQuantityDesired(e.target.value)}
                className="w-full rounded border border-border px-3 py-1.5 text-[13px] text-ink focus:border-ink focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
              Your note to guests
            </label>
            <textarea
              value={coupleNote}
              onChange={(e) => setCoupleNote(e.target.value)}
              rows={2}
              placeholder="Why this item is meaningful to you…"
              className="w-full resize-none rounded border border-border px-3 py-1.5 text-[13px] text-ink placeholder:italic placeholder:text-ink-faint focus:border-ink focus:outline-none"
            />
          </div>
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
            disabled={!title.trim()}
            className="rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Add to Registry
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Gifts & thank-yous ────────────────────────────────────────────────────

function GiftsTab() {
  const [scope, setScope] = useState<"all" | "pending">("pending");
  const rows = useMemo(
    () =>
      scope === "pending"
        ? GIFTS_RECEIVED.filter((g) => g.thankYouStatus !== "sent")
        : GIFTS_RECEIVED,
    [scope],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
            Registry · Gifts & thank-yous
          </p>
          <h2 className="mt-1.5 font-serif text-3xl font-bold tracking-tight">
            Every gift, every guest
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Linked to the Guest module — drafts auto-populate with names,
            salutations, and side.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FilterChip
            active={scope === "pending"}
            onClick={() => setScope("pending")}
            label={`Pending · ${GIFTS_RECEIVED.filter((g) => g.thankYouStatus !== "sent").length}`}
          />
          <FilterChip
            active={scope === "all"}
            onClick={() => setScope("all")}
            label={`All gifts · ${GIFTS_RECEIVED.length}`}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-ink/5 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/5 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Gift</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Thank-you</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {rows.map((g) => {
              const item = g.itemId
                ? ITEMS.find((i) => i.id === g.itemId)
                : null;
              const type = REGISTRY_TYPES.find((t) => t.kind === g.typeId);
              return (
                <tr
                  key={g.id}
                  className="transition-colors hover:bg-ivory/40"
                >
                  <td className="px-4 py-3">
                    <div className="text-[13.5px] font-medium text-ink">
                      {g.guestName}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                      {g.side === "mutual" ? "shared" : `${g.side} side`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] text-ink">
                      {item ? item.title : type?.label ?? "—"}
                    </div>
                    {g.blessingMessage && (
                      <div className="mt-0.5 max-w-xs truncate font-serif text-[11.5px] italic text-ink-muted">
                        "{g.blessingMessage}"
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-ink/10 bg-ivory px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                      {g.eventTag}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[13px] font-medium text-ink">
                    {fmtUSD(g.amount)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11.5px] text-ink-muted">
                    {fmtDate(g.receivedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ThankYouPill status={g.thankYouStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {g.thankYouStatus !== "sent" && (
                      <button className="text-[12px] font-medium text-gold hover:text-ink">
                        {g.thankYouStatus === "drafted" ? "Review" : "Draft"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────

function AnalyticsTab() {
  const typeBreakdown = REGISTRY_TYPES.filter((t) => t.enabled).map((t) => {
    const totals = fundTotals(t.kind);
    const itemsCount = ITEMS.filter((i) => i.typeId === t.kind).length;
    return { type: t, ...totals, itemsCount };
  });
  const grandTotal = typeBreakdown.reduce((s, r) => s + r.received, 0);

  const topItems = [...ITEMS]
    .map((item) => ({ item, gifts: GIFTS_RECEIVED.filter((g) => g.itemId === item.id).length }))
    .sort((a, b) => b.gifts - a.gifts)
    .slice(0, 5);

  const viewsByItem = ITEMS.map((item, idx) => ({
    item,
    views: 180 - idx * 7 + (item.priority === "high" ? 60 : 0),
  })).sort((a, b) => b.views - a.views);

  const maxViews = viewsByItem[0].views;

  return (
    <div className="space-y-10">
      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
          Registry · Analytics
        </p>
        <h2 className="mt-1.5 font-serif text-3xl font-bold tracking-tight">
          What's resonating
        </h2>
      </div>

      {/* Type breakdown horizontal stacked bar */}
      <div className="rounded-lg border border-ink/5 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold">
            Contributions by category
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            total · {fmtUSD(grandTotal)}
          </span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-ivory-deep">
          {typeBreakdown.map((row, idx) => {
            const pct = grandTotal > 0 ? (row.received / grandTotal) * 100 : 0;
            const colors = ["bg-gold", "bg-saffron", "bg-rose", "bg-sage", "bg-ink"];
            if (pct === 0) return null;
            return (
              <div
                key={row.type.id}
                className={cn("h-full", colors[idx % colors.length])}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {typeBreakdown.map((row, idx) => {
            const colors = ["bg-gold", "bg-saffron", "bg-rose", "bg-sage", "bg-ink"];
            return (
              <div
                key={row.type.id}
                className="flex items-start gap-2 border-l border-ink/10 pl-3"
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
                    colors[idx % colors.length],
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {row.type.label}
                  </p>
                  <p className="font-mono text-[11px] text-ink-muted">
                    {fmtUSD(row.received)} · {row.count} gifts
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 rounded-lg border border-ink/5 bg-white p-6">
          <h3 className="font-serif text-lg font-bold">Views this week</h3>
          <p className="mt-0.5 text-[12.5px] text-ink-muted">
            Items guests are spending the most time with.
          </p>
          <div className="mt-5 space-y-3">
            {viewsByItem.slice(0, 6).map((row) => (
              <div key={row.item.id}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="truncate pr-3 text-ink">
                    {row.item.title}
                  </span>
                  <span className="font-mono text-[11px] text-ink-faint">
                    {row.views}
                  </span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-ivory-deep">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-saffron/70 to-gold"
                    style={{ width: `${(row.views / maxViews) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 rounded-lg border border-ink/5 bg-white p-6">
          <h3 className="font-serif text-lg font-bold">
            Highest-converting items
          </h3>
          <p className="mt-0.5 text-[12.5px] text-ink-muted">
            Claimed or contributed to.
          </p>
          <div className="mt-4 space-y-3">
            {topItems.map(({ item, gifts }) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-ink/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {item.title}
                  </p>
                  <p className="font-mono text-[10.5px] text-ink-faint">
                    {REGISTRY_TYPES.find((t) => t.kind === item.typeId)?.label}
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-full border border-gold/30 bg-gold-pale/40 px-2 py-0.5 font-mono text-[10.5px] text-ink">
                  {gifts} {gifts === 1 ? "gift" : "gifts"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   PREVIEW VIEW (guest-facing)
// ═══════════════════════════════════════════════════════════════════════════

type GuestTab = "all" | RegistryKind;

function PreviewView() {
  const enabledTypes = REGISTRY_TYPES.filter((t) => t.enabled);
  const [tab, setTab] = useState<GuestTab>("all");

  return (
    <div className="bg-ivory">
      {/* Preview banner */}
      <div className="flex items-center justify-center gap-2 bg-ink py-2 text-center font-mono text-[10.5px] uppercase tracking-[0.2em] text-ivory/80">
        <Eye size={11} strokeWidth={1.8} />
        Preview · this is how guests will see your registry
      </div>

      <GuestHero />

      {/* Tab rail */}
      <div className="sticky top-0 z-10 border-y border-ink/5 bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-8 py-3">
          <GuestTabChip
            active={tab === "all"}
            onClick={() => setTab("all")}
            label="All"
          />
          {enabledTypes.map((t) => (
            <GuestTabChip
              key={t.id}
              active={tab === t.kind}
              onClick={() => setTab(t.kind)}
              label={t.label}
              icon={KIND_ICON[t.kind]}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 py-12">
        {(tab === "all" || tab === "shagun") && (
          <ShagunSection visible={tab === "all" || tab === "shagun"} standalone={tab === "shagun"} />
        )}

        {(tab === "all" || tab === "honeymoon") && (
          <HoneymoonSection standalone={tab === "honeymoon"} />
        )}

        {(tab === "all" || tab === "traditional" || tab === "gold_jewelry") && (
          <TraditionalSection tab={tab} />
        )}

        {(tab === "all" || tab === "charitable") && (
          <CharitableSection standalone={tab === "charitable"} />
        )}
      </div>

      <GuestFooter />
    </div>
  );
}

function GuestHero() {
  return (
    <section className="relative overflow-hidden border-b border-ink/5 bg-gradient-to-br from-ivory via-ivory-warm to-gold-pale/60 px-8 py-20">
      {/* Ornamental top flourish */}
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.4em] text-ink-muted">
          The Registry of
        </p>
        <h1 className="mt-4 font-serif text-6xl font-light leading-tight tracking-tight text-ink">
          {REGISTRY_META.couple.bride}
          <span className="mx-6 font-thin text-gold">&</span>
          {REGISTRY_META.couple.groom}
        </h1>
        <div className="mx-auto mt-5 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-gold" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-muted">
            {REGISTRY_META.weddingDate}
          </span>
          <span className="h-px w-12 bg-gold" />
        </div>

        {/* Monogram */}
        <div className="mx-auto mt-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-white shadow-[0_0_0_6px_rgba(184,134,11,0.05)]">
          <span className="font-serif text-2xl font-medium italic text-ink">
            {REGISTRY_META.monogram}
          </span>
        </div>

        <p className="mx-auto mt-10 max-w-2xl font-serif text-[17px] italic leading-relaxed text-ink-soft">
          "{REGISTRY_META.welcomeNote}"
        </p>
        <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.25em] text-ink-faint">
          — {REGISTRY_META.couple.bride} & {REGISTRY_META.couple.groom}
        </p>
      </div>
    </section>
  );
}

function GuestTabChip({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-ink/10 bg-white text-ink-muted hover:text-ink",
      )}
    >
      {Icon && <Icon size={13} strokeWidth={1.8} />}
      {label}
    </button>
  );
}

// ── Shagun (cash gift / blessing) ─────────────────────────────────────────

function ShagunSection({ standalone }: { visible: boolean; standalone: boolean }) {
  const type = REGISTRY_TYPES.find((t) => t.kind === "shagun")!;
  const [selected, setSelected] = useState<number | "custom" | null>(101);

  return (
    <section className="mb-16">
      <SectionHeader
        eyebrow="Blessings"
        title={type.label}
        description={type.description}
      />

      <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-white via-ivory to-gold-pale/30 p-8 shadow-[0_1px_0_rgba(184,134,11,0.15)_inset]">
        <div className="mx-auto max-w-2xl">
          <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.25em] text-ink-muted">
            Choose an auspicious amount
          </p>
          <div className="mt-5 grid grid-cols-5 gap-3">
            {type.suggestedAmounts!.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setSelected(a)}
                className={cn(
                  "group relative flex flex-col items-center justify-center rounded-lg border px-4 py-5 transition-all",
                  selected === a
                    ? "border-gold bg-gold-pale/60 ring-2 ring-gold/30"
                    : "border-ink/10 bg-white hover:border-gold/40 hover:bg-gold-pale/30",
                )}
              >
                <span className="font-serif text-2xl font-medium tracking-tight text-ink">
                  ${a}
                </span>
                <span className="mt-1 font-mono text-[9.5px] uppercase tracking-wider text-ink-faint">
                  {a === 51 && "love"}
                  {a === 101 && "continuity"}
                  {a === 251 && "prosperity"}
                  {a === 501 && "abundance"}
                  {a === 1001 && "legacy"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => setSelected("custom")}
              className={cn(
                "rounded-lg border px-4 py-3 text-left transition-colors",
                selected === "custom"
                  ? "border-gold bg-gold-pale/40"
                  : "border-dashed border-ink/15 bg-white/50 hover:bg-gold-pale/30",
              )}
            >
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
                Or choose your own
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">
                Any amount, with or without a message.
              </p>
            </button>
            <label className="block">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
                A blessing to accompany your gift
              </span>
              <textarea
                rows={standalone ? 4 : 3}
                placeholder="Optional — a line, a memory, a wish for the couple."
                className="mt-2 w-full rounded-lg border border-ink/10 bg-white px-4 py-3 font-serif text-[14px] italic text-ink placeholder:text-ink-faint/70 focus:border-gold focus:outline-none"
              />
            </label>
          </div>

          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3.5 font-medium text-ivory transition-colors hover:bg-ink-soft"
          >
            Offer this shagun
            <ArrowRight size={15} strokeWidth={1.8} />
          </button>

          <p className="mt-3 text-center font-mono text-[10.5px] text-ink-faint">
            Secure payment · goes directly to the couple
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Honeymoon section ─────────────────────────────────────────────────────

function HoneymoonSection({ standalone }: { standalone: boolean }) {
  const type = REGISTRY_TYPES.find((t) => t.kind === "honeymoon")!;
  const items = ITEMS.filter((i) => i.typeId === "honeymoon");
  const totals = fundTotals("honeymoon");
  const pct = type.targetAmount
    ? Math.min(100, Math.round((totals.received / type.targetAmount) * 100))
    : 0;

  return (
    <section className="mb-16">
      <SectionHeader
        eyebrow="The Honeymoon"
        title={type.label}
        description={type.description}
      />

      <div className="mb-6 rounded-lg border border-ink/5 bg-white p-5">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
            Fund so far
          </p>
          <p className="font-mono text-[11px] text-ink-muted">
            {pct}% of {fmtUSD(type.targetAmount!)}
          </p>
        </div>
        <p className="mt-1 font-serif text-2xl font-medium tracking-tight text-ink">
          {fmtUSD(totals.received)}
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ivory-deep">
          <div
            className="h-full rounded-full bg-gradient-to-r from-saffron via-gold-light to-gold"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className={cn("grid gap-4", standalone ? "grid-cols-2" : "grid-cols-3")}>
        {items.map((item) => (
          <HoneymoonCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function HoneymoonCard({ item }: { item: RegistryItem }) {
  const theme = IMAGE_THEME_STYLE[item.imageTheme];
  const ThemeIcon = theme.icon;
  const CategoryIcon = item.category ? CATEGORY_ICON[item.category] : MapPin;
  const remaining = item.quantityDesired - item.quantityClaimed;

  return (
    <article className="group overflow-hidden rounded-lg border border-ink/5 bg-white transition-shadow hover:shadow-md">
      <div
        className={cn("relative aspect-[5/3] bg-gradient-to-br", theme.gradient)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <ThemeIcon
            size={42}
            strokeWidth={1}
            className="text-white/80"
            aria-hidden
          />
        </div>
        {item.category && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-ink-muted">
            <CategoryIcon size={10} strokeWidth={1.8} />
            {item.category}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-[17px] font-medium tracking-tight text-ink">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="mt-0.5 text-[12.5px] text-ink-muted">{item.subtitle}</p>
        )}
        {item.coupleNote && (
          <p className="mt-3 border-l-2 border-gold/40 pl-3 font-serif text-[13px] italic leading-relaxed text-ink-soft">
            {item.coupleNote}
          </p>
        )}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="font-serif text-2xl font-medium text-ink">
              {fmtUSD(item.price!)}
            </p>
            {item.quantityDesired > 1 && (
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
                {remaining} of {item.quantityDesired} left
              </p>
            )}
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft disabled:bg-ink-faint"
            disabled={remaining <= 0}
          >
            {remaining <= 0 ? "Fully gifted" : "Gift this"}
            {remaining > 0 && <ArrowRight size={13} strokeWidth={1.8} />}
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Traditional + gold section ────────────────────────────────────────────

function TraditionalSection({ tab }: { tab: GuestTab }) {
  const showTraditional = tab === "all" || tab === "traditional";
  const showGold = tab === "all" || tab === "gold_jewelry";

  return (
    <>
      {showTraditional && (
        <section className="mb-16">
          <SectionHeader
            eyebrow="The Home"
            title="For the home we're building"
            description="A small, hand-picked collection. You can purchase directly through the retailer, or have it delivered to us — we've listed the option on each."
          />
          <div className="grid grid-cols-3 gap-4">
            {ITEMS.filter((i) => i.typeId === "traditional").map((item) => (
              <TraditionalCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {showGold && (
        <section className="mb-16">
          <SectionHeader
            eyebrow="Gold & Heirlooms"
            title="Traditional pieces, passed down"
            description="Curated with our family jeweler in Jaipur. Each piece has been chosen together — worn at the wedding and well beyond."
          />
          <div className="grid grid-cols-2 gap-4">
            {ITEMS.filter((i) => i.typeId === "gold_jewelry").map((item) => (
              <GoldCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function TraditionalCard({ item }: { item: RegistryItem }) {
  const theme = IMAGE_THEME_STYLE[item.imageTheme];
  const ThemeIcon = theme.icon;
  const contribSoFar = item.contributionSoFar ?? 0;
  const pctFunded = item.groupGifting && item.price
    ? Math.min(100, (contribSoFar / item.price) * 100)
    : 0;

  return (
    <article className="group overflow-hidden rounded-lg border border-ink/5 bg-white transition-shadow hover:shadow-md">
      <div
        className={cn("relative aspect-square bg-gradient-to-br", theme.gradient)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <ThemeIcon size={48} strokeWidth={1} className="text-white/75" />
        </div>
      </div>
      <div className="p-5">
        {item.retailer && (
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
            {item.retailer}
          </p>
        )}
        <h3 className="mt-1 font-serif text-[16px] font-medium tracking-tight text-ink">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="mt-0.5 text-[12px] text-ink-muted">{item.subtitle}</p>
        )}
        {item.coupleNote && (
          <p className="mt-3 border-l-2 border-gold/40 pl-3 font-serif text-[12.5px] italic leading-relaxed text-ink-soft">
            {item.coupleNote}
          </p>
        )}

        {item.groupGifting && item.price && (
          <div className="mt-4 rounded-md border border-gold/20 bg-gold-pale/30 p-3">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              <span className="flex items-center gap-1 text-gold">
                <UsersIcon size={10} strokeWidth={2} />
                Group gift
              </span>
              <span>{Math.round(pctFunded)}%</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-light to-gold"
                style={{ width: `${pctFunded}%` }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[10.5px] text-ink-muted">
              {fmtUSD(contribSoFar)} of {fmtUSD(item.price)} · join in
            </p>
          </div>
        )}

        <div className="mt-4 flex items-end justify-between">
          <p className="font-serif text-xl font-medium text-ink">
            {item.price && fmtUSD(item.price)}
          </p>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-ink/10 bg-ivory-warm px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:bg-ink hover:text-ivory"
          >
            Purchase
            <ArrowUpRight size={12} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </article>
  );
}

function GoldCard({ item }: { item: RegistryItem }) {
  const theme = IMAGE_THEME_STYLE[item.imageTheme];
  const ThemeIcon = theme.icon;
  const contribSoFar = item.contributionSoFar ?? 0;
  const pctFunded = item.groupGifting && item.price
    ? Math.min(100, (contribSoFar / item.price) * 100)
    : 0;

  return (
    <article className="flex overflow-hidden rounded-lg border border-gold/20 bg-gradient-to-br from-white via-ivory to-gold-pale/30">
      <div
        className={cn(
          "relative aspect-square w-56 flex-shrink-0 bg-gradient-to-br",
          theme.gradient,
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <ThemeIcon size={52} strokeWidth={0.75} className="text-white/80" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/20 py-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white">
          <Gem size={10} strokeWidth={1.8} />
          Gold & Heirloom
        </div>
      </div>
      <div className="flex-1 p-6">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
          {item.retailer}
        </p>
        <h3 className="mt-2 font-serif text-xl font-medium tracking-tight text-ink">
          {item.title}
        </h3>
        <p className="mt-0.5 text-[13px] text-ink-muted">{item.subtitle}</p>

        <p className="mt-4 font-serif text-2xl font-medium text-ink">
          {fmtUSD(item.price!)}
        </p>

        {item.groupGifting && (
          <div className="mt-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-ivory-deep">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-light to-gold"
                style={{ width: `${pctFunded}%` }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
              {Math.round(pctFunded)}% pooled · group gifting welcome
            </p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            Contribute
            <ArrowRight size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-ink/10 bg-white px-4 py-2 text-[12.5px] font-medium text-ink hover:bg-ivory-warm"
          >
            View at {item.retailer}
            <ExternalLink size={12} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Charitable section ────────────────────────────────────────────────────

function CharitableSection({ standalone }: { standalone: boolean }) {
  const items = ITEMS.filter((i) => i.typeId === "charitable");
  return (
    <section className="mb-16">
      <SectionHeader
        eyebrow="In Lieu of Gifts"
        title="Causes close to our hearts"
        description="Three organizations we've supported for years. A gift in our names means more than you know."
      />
      <div className={cn("grid gap-4", standalone ? "grid-cols-1" : "grid-cols-3")}>
        {items.map((item) => (
          <CharitableCard key={item.id} item={item} full={standalone} />
        ))}
      </div>
    </section>
  );
}

function CharitableCard({ item, full }: { item: RegistryItem; full: boolean }) {
  const theme = IMAGE_THEME_STYLE[item.imageTheme];
  const ThemeIcon = theme.icon;
  const pct = item.quantityDesired
    ? Math.min(100, (item.quantityClaimed / item.quantityDesired) * 100)
    : 0;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-lg border border-ink/5 bg-white",
        full && "flex",
      )}
    >
      <div
        className={cn(
          "relative bg-gradient-to-br",
          theme.gradient,
          full ? "aspect-square w-64 flex-shrink-0" : "aspect-[5/3]",
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <ThemeIcon size={44} strokeWidth={1} className="text-white/80" />
        </div>
      </div>
      <div className={cn("p-5", full && "flex-1 p-6")}>
        {item.retailer && (
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
            {item.retailer}
          </p>
        )}
        <h3 className="mt-1.5 font-serif text-[17px] font-medium tracking-tight text-ink">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            {item.subtitle}
          </p>
        )}
        {item.coupleNote && (
          <p className="mt-3 border-l-2 border-sage/50 pl-3 font-serif text-[12.5px] italic leading-relaxed text-ink-soft">
            {item.coupleNote}
          </p>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            <span>{item.quantityClaimed} funded</span>
            <span>goal · {item.quantityDesired}</span>
          </div>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-ivory-deep">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sage-light to-sage"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <p className="font-serif text-lg font-medium text-ink">
            {fmtUSD(item.price!)}
            <span className="ml-1.5 font-mono text-[10.5px] font-normal text-ink-faint">
              / contribution
            </span>
          </p>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-sage px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-sage-light"
          >
            Contribute
            <HandHeart size={12} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Section header (guest side) ───────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.3em] text-gold">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-4xl font-light tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">
        {description}
      </p>
      <div className="mt-5 h-px w-16 bg-gold/60" />
    </div>
  );
}

// ── Guest footer ──────────────────────────────────────────────────────────

function GuestFooter() {
  return (
    <footer className="border-t border-ink/5 bg-ivory-warm px-8 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-white">
          <span className="font-serif text-base font-medium italic text-ink">
            {REGISTRY_META.monogram}
          </span>
        </div>
        <p className="mt-5 font-serif text-lg italic text-ink-soft">
          With love and gratitude,
        </p>
        <p className="mt-1 font-serif text-xl font-medium text-ink">
          {REGISTRY_META.couple.bride} & {REGISTRY_META.couple.groom}
        </p>
        <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.25em] text-ink-faint">
          Questions? hello@ananya.wed · {REGISTRY_META.shareUrl}
        </p>
      </div>
    </footer>
  );
}
