import type {
  Creator,
  CreatorCollection,
  CreatorPick,
} from "@/types/creator";

const iso = (d: string) => new Date(d).toISOString();

// ── Creators ──────────────────────────────────────────────────────────────

export const SEED_CREATORS: Creator[] = [
  {
    id: "cr-priya-patel",
    displayName: "Priya Patel",
    handle: "@priyapatel",
    bio: "South Asian bridal stylist & fashion editor. Featured in Vogue India, Elle, and Bride Magazine.",
    avatarUrl: null,
    avatarGradient:
      "linear-gradient(135deg, #C97B63 0%, #D4A843 60%, #F0E4C8 100%)",
    coverGradient:
      "linear-gradient(135deg, #8B2E2A 0%, #C97B63 40%, #F0E4C8 80%, #D4A843 100%)",
    isVerified: true,
    followerCount: 183_400,
    tier: "top_creator",
    commissionRate: 0.08,
    specialties: ["Bridal stylist", "Fashion editor", "Couture"],
    totalEarnings: 42_870,
    pendingPayout: 3_240,
    createdAt: iso("2024-06-12T10:00:00Z"),
    tierUpdatedAt: iso("2025-09-10T10:00:00Z"),
    tierGracePeriodEnds: null,
    targetBudgetRanges: ["100k_250k", "250k_500k", "500k_plus"],
    consultationRating: 4.9,
    totalConsultations: 42,
    moduleExpertise: ["phase-3", "phase-0"],
    styleTags: ["grand", "traditional", "couture", "heirloom", "maximalist"],
    traditionTags: ["hindu", "sikh"],
  },
  {
    id: "cr-meera-shah",
    displayName: "Meera Shah",
    handle: "@meera.shah",
    bio: "Luxury wedding planner & décor curator. Building weddings that feel like heirlooms.",
    avatarUrl: null,
    avatarGradient:
      "linear-gradient(135deg, #5B8E8A 0%, #85AEAB 60%, #DCE9E7 100%)",
    coverGradient:
      "linear-gradient(135deg, #2A4F4D 0%, #5B8E8A 45%, #B8C9A8 85%, #E8F0E0 100%)",
    isVerified: true,
    followerCount: 96_820,
    tier: "rising",
    commissionRate: 0.06,
    specialties: ["Wedding planner", "Décor", "Mandap design"],
    totalEarnings: 12_450,
    pendingPayout: 980,
    createdAt: iso("2024-11-03T10:00:00Z"),
    tierUpdatedAt: iso("2025-12-02T10:00:00Z"),
    tierGracePeriodEnds: null,
    targetBudgetRanges: ["50k_100k", "100k_250k", "250k_500k"],
    consultationRating: 4.6,
    totalConsultations: 14,
    moduleExpertise: ["phase-0", "phase-1"],
    styleTags: ["grand", "traditional", "heirloom", "minimalist"],
    traditionTags: ["hindu", "sikh", "secular"],
  },
  {
    id: "cr-anika-desai",
    displayName: "Anika Desai",
    handle: "@anika.letters",
    bio: "Stationery designer & calligraphy artist. Hand-lettered invitations for slow, intentional weddings.",
    avatarUrl: null,
    avatarGradient:
      "linear-gradient(135deg, #9CAF88 0%, #CDD7B6 60%, #F5F0DF 100%)",
    coverGradient:
      "linear-gradient(135deg, #6B8E4E 0%, #9CAF88 45%, #E8F0E0 100%)",
    isVerified: false,
    followerCount: 44_730,
    tier: "standard",
    commissionRate: 0.05,
    specialties: ["Stationery", "Calligraphy", "Letterpress"],
    totalEarnings: 3_120,
    pendingPayout: 420,
    createdAt: iso("2025-03-21T10:00:00Z"),
    tierUpdatedAt: iso("2025-03-21T10:00:00Z"),
    tierGracePeriodEnds: null,
    targetBudgetRanges: ["under_50k", "50k_100k", "100k_250k"],
    consultationRating: 0,
    totalConsultations: 0,
    moduleExpertise: ["phase-5"],
    styleTags: ["minimalist", "intentional", "considered"],
    traditionTags: ["secular", "hindu", "christian"],
  },
];

// ── Collections ───────────────────────────────────────────────────────────

export const SEED_COLLECTIONS: CreatorCollection[] = [
  // Priya — exhibition-hosted edit (live)
  {
    id: "col-priya-bridal-edit-summer-2026",
    creatorId: "cr-priya-patel",
    title: "Priya's Bridal Edit · Summer 2026",
    description:
      "Twelve heirloom-worthy pieces I'd pick for my own wedding this season. Benarasi, zardozi, and the kundan I can't stop thinking about.",
    coverGradient:
      "linear-gradient(135deg, #8B2E2A 0%, #C97B63 40%, #F0E4C8 80%, #D4A843 100%)",
    module: "phase-3",
    isExhibition: true,
    exhibitionStart: iso("2026-04-18T00:00:00+05:30"),
    exhibitionEnd: iso("2026-05-02T23:59:59+05:30"),
    status: "active",
    sortOrder: 0,
    createdAt: iso("2026-04-10T10:00:00Z"),
  },
  // Priya — standard styled-by row (active)
  {
    id: "col-priya-styled-attire",
    creatorId: "cr-priya-patel",
    title: "Styled by Priya · Attire Essentials",
    description:
      "The pieces I keep coming back to when I'm styling brides. Timeless, wearable, and quietly dramatic.",
    coverGradient:
      "linear-gradient(135deg, #D4A843 0%, #F0E4C8 100%)",
    module: "phase-3",
    isExhibition: false,
    exhibitionStart: null,
    exhibitionEnd: null,
    status: "active",
    sortOrder: 1,
    createdAt: iso("2026-01-08T10:00:00Z"),
  },
  // Meera — décor collection for Foundation & Vision
  {
    id: "col-meera-ceremony-foundations",
    creatorId: "cr-meera-shah",
    title: "Styled by Meera · Ceremony Foundations",
    description:
      "Start with the setting. Mandap, marigold, and the small brass rituals that make a ceremony feel ancestral.",
    coverGradient:
      "linear-gradient(135deg, #5B8E8A 0%, #B8C9A8 60%, #E8F0E0 100%)",
    module: "phase-0",
    isExhibition: false,
    exhibitionStart: null,
    exhibitionEnd: null,
    status: "active",
    sortOrder: 0,
    createdAt: iso("2026-02-14T10:00:00Z"),
  },
  // Anika — stationery collection
  {
    id: "col-anika-paper-suite",
    creatorId: "cr-anika-desai",
    title: "Styled by Anika · The Paper Suite",
    description:
      "The invitations I'd send, the RSVPs I'd want back. Slow paper for considered weddings.",
    coverGradient:
      "linear-gradient(135deg, #9CAF88 0%, #E8F0E0 100%)",
    module: "phase-5",
    isExhibition: false,
    exhibitionStart: null,
    exhibitionEnd: null,
    status: "active",
    sortOrder: 0,
    createdAt: iso("2026-03-02T10:00:00Z"),
  },
];

// ── Picks (map to existing StoreProduct ids) ──────────────────────────────

const pickId = (collection: string, product: string) =>
  `pick-${collection.replace("col-", "")}-${product.replace("p-", "")}`;

function pick(
  collectionId: string,
  productId: string,
  sortOrder: number,
  note: string,
  addedAtIso: string,
): CreatorPick {
  return {
    id: pickId(collectionId, productId),
    collectionId,
    productId,
    creatorNote: note,
    sortOrder,
    addedAt: iso(addedAtIso),
  };
}

export const SEED_PICKS: CreatorPick[] = [
  // ── Priya's Bridal Edit (exhibition) ────────────────────────────────
  pick(
    "col-priya-bridal-edit-summer-2026",
    "p-lehenga-anarkali",
    0,
    "My top pick of the season. The Anarkali silhouette is having a real moment — and this one photographs like a dream.",
    "2026-04-10T10:00:00Z",
  ),
  pick(
    "col-priya-bridal-edit-summer-2026",
    "p-saree-benares-red",
    1,
    "If you want something your mother will cry over, this is it. The Benarasi weave is unmatched.",
    "2026-04-10T10:05:00Z",
  ),
  pick(
    "col-priya-bridal-edit-summer-2026",
    "p-polki-bridal",
    2,
    "Polki over kundan for a softer, more lived-in feel. Pair with a simple dupatta to let it do the talking.",
    "2026-04-10T10:10:00Z",
  ),
  pick(
    "col-priya-bridal-edit-summer-2026",
    "p-maang-tikka",
    3,
    "A maang tikka is the punctuation mark of a bridal look. This one sits beautifully even with a low center part.",
    "2026-04-10T10:15:00Z",
  ),
  pick(
    "col-priya-bridal-edit-summer-2026",
    "p-dupatta-gota",
    4,
    "Gota-patti is back, and this piece has just the right amount of shimmer — not a single sequin more.",
    "2026-04-10T10:20:00Z",
  ),
  pick(
    "col-priya-bridal-edit-summer-2026",
    "p-mojari-gold",
    5,
    "Comfort is non-negotiable on a wedding day. These mojaris are the pair I'd actually wear for eight hours.",
    "2026-04-10T10:25:00Z",
  ),

  // ── Priya's Styled Attire ────────────────────────────────────────────
  pick(
    "col-priya-styled-attire",
    "p-sherwani-ivory",
    0,
    "An ivory sherwani cut to elongate — the piece I recommend most to grooms who want to feel modern but rooted.",
    "2026-01-08T10:00:00Z",
  ),
  pick(
    "col-priya-styled-attire",
    "p-kundan-choker",
    1,
    "A kundan choker does 80% of the work for a sangeet look. Keep the rest minimal.",
    "2026-01-08T10:05:00Z",
  ),
  pick(
    "col-priya-styled-attire",
    "p-chudi-set",
    2,
    "Stack them. Always. A thin solo chudi looks lonely in photos.",
    "2026-01-08T10:10:00Z",
  ),
  pick(
    "col-priya-styled-attire",
    "p-pagdi-crystal",
    3,
    "This pagdi with the soft crystal line is the grown-up version of everything I see on Pinterest.",
    "2026-01-08T10:15:00Z",
  ),

  // ── Meera's Ceremony Foundations ─────────────────────────────────────
  pick(
    "col-meera-ceremony-foundations",
    "p-mandap-rose-gold",
    0,
    "The architecture of your ceremony matters more than the florals. Start with a clean, rose-gold mandap and build out.",
    "2026-02-14T10:00:00Z",
  ),
  pick(
    "col-meera-ceremony-foundations",
    "p-marigold-garland",
    1,
    "Order more than you think you need — garlands read as abundance, and thin strings look anxious.",
    "2026-02-14T10:05:00Z",
  ),
  pick(
    "col-meera-ceremony-foundations",
    "p-diya-brass-set",
    2,
    "Brass diyas at the mandap entrance change the whole energy of the walk-in. Non-negotiable for me.",
    "2026-02-14T10:10:00Z",
  ),
  pick(
    "col-meera-ceremony-foundations",
    "p-centerpiece-rose",
    3,
    "The mandap is the anchor, the centerpieces are the echo. Keep them quieter than you think they should be.",
    "2026-02-14T10:15:00Z",
  ),

  // ── Anika's Paper Suite ──────────────────────────────────────────────
  pick(
    "col-anika-paper-suite",
    "p-invite-suite-letterpress",
    0,
    "Letterpress has a weight to it that digital can't reproduce. Your guests will pin it on their fridge for months.",
    "2026-03-02T10:00:00Z",
  ),
  pick(
    "col-anika-paper-suite",
    "p-rsvp-cards",
    1,
    "I always pair the invitation with a matching RSVP — when they come back, they feel like tiny little gifts.",
    "2026-03-02T10:05:00Z",
  ),
];

// ── Lookups ───────────────────────────────────────────────────────────────

export function getCreator(creatorId: string): Creator | undefined {
  return SEED_CREATORS.find((c) => c.id === creatorId);
}

export function getCollection(
  collectionId: string,
): CreatorCollection | undefined {
  return SEED_COLLECTIONS.find((c) => c.id === collectionId);
}

export function getCollectionsByCreator(
  creatorId: string,
): CreatorCollection[] {
  return SEED_COLLECTIONS.filter((c) => c.creatorId === creatorId).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function getPicksByCollection(collectionId: string): CreatorPick[] {
  return SEED_PICKS.filter((p) => p.collectionId === collectionId).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function getCollectionsByModule(module: string): CreatorCollection[] {
  return SEED_COLLECTIONS.filter(
    (c) => c.module === module && c.status === "active",
  );
}

export function getActiveExhibitionCollections(): CreatorCollection[] {
  const now = Date.now();
  return SEED_COLLECTIONS.filter((c) => {
    if (!c.isExhibition || c.status !== "active") return false;
    const start = c.exhibitionStart ? new Date(c.exhibitionStart).getTime() : 0;
    const end = c.exhibitionEnd ? new Date(c.exhibitionEnd).getTime() : Infinity;
    return now >= start && now <= end;
  });
}
