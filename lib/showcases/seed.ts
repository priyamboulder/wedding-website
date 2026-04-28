import type { RealWeddingShowcase } from "@/types/showcase";

const iso = (d: string) => new Date(d).toISOString();

// Image bank — Unsplash, consistent with store-seed and guides seed.
const IMG = {
  // Ananya & Rohan (Mumbai, Grand, Hindu)
  ananyaCover:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80",
  ananyaLehenga:
    "https://images.unsplash.com/photo-1610030469668-8e45b5c2f8d6?w=1200&q=80",
  ananyaBride:
    "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=1200&q=80",
  ananyaGroom:
    "https://images.unsplash.com/photo-1617096199277-ad93d8b3dd29?w=1200&q=80",
  ananyaMandap:
    "https://images.unsplash.com/photo-1604322611922-b4c0b44e3d70?w=1200&q=80",
  ananyaCenterpiece:
    "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1200&q=80",
  ananyaDetails:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80",

  // Sara & Kabir (Toronto, Fusion, Interfaith)
  saraCover:
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
  saraCeremony:
    "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=1200&q=80",
  saraBride:
    "https://images.unsplash.com/photo-1594552072238-b8a33785cee2?w=1200&q=80",
  saraStationery:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
  saraTable:
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",

  // Nisha & Dev (Goa, Minimalist, Intimate)
  nishaCover:
    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1600&q=80",
  nishaBeach:
    "https://images.unsplash.com/photo-1537907690542-f40b8e0d0092?w=1200&q=80",
  nishaPaper:
    "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
  nishaTable:
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&q=80",
};

// ── Showcases ─────────────────────────────────────────────────────────────

export const SEED_SHOWCASES: RealWeddingShowcase[] = [
  // 1. Ananya & Rohan — Hindu, Grand, Mumbai (Featured)
  {
    id: "show-ananya-rohan",
    slug: "ananya-and-rohan-mumbai-2026",
    coupleUserId: "user-ananya-demo",
    brideName: "Ananya",
    partnerName: "Rohan",
    title: "Ananya & Rohan's Wedding",
    weddingDate: "2026-02-14",
    locationCity: "Mumbai, India",
    venueName: "Taj Mahal Palace",
    coverImageUrl: IMG.ananyaCover,
    storyText:
      "<p>We met in a cramped rehearsal room at NYU five years ago — Rohan was conducting, I was first chair cello, and neither of us could agree on the tempo. By the end of the semester we'd compromised on a slower fourth movement and a standing Sunday-morning dosa habit.</p><p>The proposal happened on a Goa beach in October. The wedding, though, had to be in Mumbai. Three hundred and fifty people, four events, and my grandmother's insistence on every single ritual. We leaned in.</p><p>What follows is the wedding we planned together — the couture, the flowers, the vendors who held our hands. Save what you love. Tag what you need. These are all the people we'd book again without hesitation.</p>",
    styleTags: ["grand", "traditional", "multi_day"],
    traditionTags: ["hindu"],
    budgetRange: "100k_250k",
    guestCountRange: "300–400",
    budgetBreakdown: [
      { label: "Venue & Catering", percent: 38, note: "Four events, full buyout" },
      { label: "Attire & Jewelry", percent: 22 },
      { label: "Décor & Florals", percent: 18 },
      { label: "Photo & Video", percent: 9 },
      { label: "Music & Entertainment", percent: 7 },
      { label: "Stationery & Favors", percent: 4 },
      { label: "Other", percent: 2 },
    ],
    photos: [
      {
        id: "ph-ar-1",
        imageUrl: IMG.ananyaLehenga,
        caption: "The lehenga — 180 hours of zardozi, worth every one.",
        section: "looks",
        sortOrder: 0,
      },
      {
        id: "ph-ar-2",
        imageUrl: IMG.ananyaBride,
        caption: "Polki set from my nani, re-set for the ceremony.",
        section: "looks",
        sortOrder: 1,
      },
      {
        id: "ph-ar-3",
        imageUrl: IMG.ananyaGroom,
        caption: "Rohan in ivory — we went softer than most grooms pick.",
        section: "looks",
        sortOrder: 2,
      },
      {
        id: "ph-ar-4",
        imageUrl: IMG.ananyaMandap,
        caption: "Marigold carpet. Not subtle. No regrets.",
        section: "details",
        sortOrder: 0,
      },
      {
        id: "ph-ar-5",
        imageUrl: IMG.ananyaCenterpiece,
        caption: "Low centerpieces so guests could actually talk.",
        section: "details",
        sortOrder: 1,
      },
      {
        id: "ph-ar-6",
        imageUrl: IMG.ananyaDetails,
        section: "details",
        sortOrder: 2,
      },
    ],
    productTags: [
      {
        id: "pt-ar-1",
        photoId: "ph-ar-1",
        productId: "p-lehenga-anarkali",
        section: "looks",
        pinX: 0.52,
        pinY: 0.62,
        note: "This was THE dress.",
      },
      {
        id: "pt-ar-2",
        photoId: "ph-ar-1",
        productId: "p-dupatta-gota",
        section: "looks",
        pinX: 0.32,
        pinY: 0.32,
        note: "Paired with a second gota-patti dupatta for the pheras.",
      },
      {
        id: "pt-ar-3",
        photoId: "ph-ar-3",
        productId: "p-sherwani-ivory",
        section: "looks",
        pinX: 0.5,
        pinY: 0.5,
        note: "Tailored at Sabyavati in two fittings. Zero complaints.",
      },
      {
        id: "pt-ar-4",
        photoId: "ph-ar-4",
        productId: "p-mandap-rose-gold",
        section: "details",
        pinX: 0.5,
        pinY: 0.4,
        note: "Clean rose-gold frame — read beautifully in every photo.",
      },
    ],
    vendorReviews: [
      {
        id: "vr-ar-1",
        vendorId: "v-sabya-atelier",
        role: "Bridal Couture",
        rating: 5,
        reviewText:
          "Two fittings, exactly the vision, and every karigar they brought in was warm with us. The lehenga is the kind of thing you keep — not store.",
      },
      {
        id: "vr-ar-2",
        vendorId: "v-marigold-studio",
        role: "Florist & Décor",
        rating: 5,
        reviewText:
          "They took a three-sentence brief and designed a mandap that made my mother cry. Ordered 20% more garlands than we thought we needed. Right call.",
      },
    ],
    creatorShoutouts: [
      {
        id: "cs-ar-1",
        creatorId: "cr-priya-patel",
        shoutoutText:
          "Priya's lehenga guide literally saved me hours of atelier appointments. We walked in knowing exactly what weave to ask for.",
      },
    ],
    status: "published",
    publishedAt: iso("2026-03-10T10:00:00Z"),
    createdAt: iso("2026-02-28T10:00:00Z"),
    updatedAt: iso("2026-03-10T10:00:00Z"),
    baseSaveCount: 2142,
    baseViewCount: 18240,
    isFeatured: true,
  },

  // 2. Sara & Kabir — Interfaith (Hindu-Muslim), Fusion, Toronto
  {
    id: "show-sara-kabir",
    slug: "sara-and-kabir-toronto-2026",
    coupleUserId: "user-sara-demo",
    brideName: "Sara",
    partnerName: "Kabir",
    title: "Sara & Kabir's Wedding",
    weddingDate: "2026-01-18",
    locationCity: "Toronto, Canada",
    venueName: "The Fermenting Cellar",
    coverImageUrl: IMG.saraCover,
    storyText:
      "<p>We spent the first year of planning arguing — respectfully, but firmly — about which traditions got kept, which got blended, and which got quietly dropped. Sara wanted a nikah with her grandmother's Quran. Kabir wanted the saath pheras. We ended up doing both, twenty minutes apart, under the same canopy.</p><p>Our families, to their credit, showed up for all of it. The imam and the pandit sat together over chai beforehand and compared notes. The wedding ended up feeling less like compromise and more like invention.</p><p>Here's the wedding we made. It was smaller than we'd thought we wanted — and exactly as big as it needed to be.</p>",
    styleTags: ["fusion", "intimate"],
    traditionTags: ["interfaith", "hindu", "muslim"],
    budgetRange: "50k_100k",
    guestCountRange: "120–180",
    budgetBreakdown: [
      { label: "Venue & Catering", percent: 40 },
      { label: "Attire & Jewelry", percent: 18 },
      { label: "Décor & Florals", percent: 16 },
      { label: "Photo & Video", percent: 12 },
      { label: "Music & Entertainment", percent: 6 },
      { label: "Stationery & Favors", percent: 5 },
      { label: "Other", percent: 3 },
    ],
    photos: [
      {
        id: "ph-sk-1",
        imageUrl: IMG.saraCeremony,
        caption: "One canopy, two ceremonies, twenty minutes apart.",
        section: "general",
        sortOrder: 0,
      },
      {
        id: "ph-sk-2",
        imageUrl: IMG.saraBride,
        caption: "Kundan choker — the only heirloom I wore.",
        section: "looks",
        sortOrder: 0,
      },
      {
        id: "ph-sk-3",
        imageUrl: IMG.saraStationery,
        caption: "Letterpress suite in three languages.",
        section: "details",
        sortOrder: 0,
      },
      {
        id: "ph-sk-4",
        imageUrl: IMG.saraTable,
        section: "details",
        sortOrder: 1,
      },
    ],
    productTags: [
      {
        id: "pt-sk-1",
        photoId: "ph-sk-2",
        productId: "p-polki-bridal",
        section: "looks",
        pinX: 0.5,
        pinY: 0.45,
        note: "My grandmother's kundan choker, re-set. The only jewelry I wore.",
      },
      {
        id: "pt-sk-2",
        photoId: "ph-sk-3",
        productId: "p-invite-suite-letterpress",
        section: "details",
        pinX: 0.45,
        pinY: 0.5,
        note: "Trilingual suite — English, Hindi, Urdu. Letterpress Lane nailed it.",
      },
      {
        id: "pt-sk-3",
        productId: "p-centerpiece-rose",
        section: "details",
        note: "Kept the tables low so both sides of the family could talk across.",
      },
    ],
    vendorReviews: [
      {
        id: "vr-sk-1",
        vendorId: "v-letterpress-lane",
        role: "Stationery",
        rating: 5,
        reviewText:
          "Trilingual letterpress is not easy and they did three rounds of proofs without once making us feel like we were being difficult. Suite of the year.",
      },
      {
        id: "vr-sk-2",
        vendorId: "v-jaipur-heritage",
        role: "Jewelry Reset",
        rating: 5,
        reviewText:
          "They reset my grandmother's choker in 22k gold without losing a single original stone. Received it the week of the wedding. Flawless.",
      },
      {
        id: "vr-sk-3",
        vendorId: "v-marigold-studio",
        role: "Florist",
        rating: 4,
        reviewText:
          "Beautiful work. Would've loved one more round of revisions on the ceremony backdrop, but the final install was gorgeous.",
      },
    ],
    creatorShoutouts: [
      {
        id: "cs-sk-1",
        creatorId: "cr-meera-shah",
        shoutoutText:
          "Meera's trend report on architectural mandaps changed our entire ceremony plan. We went lighter on the florals and heavier on the structure — and the photos are better for it.",
      },
    ],
    status: "published",
    publishedAt: iso("2026-02-15T10:00:00Z"),
    createdAt: iso("2026-02-01T10:00:00Z"),
    updatedAt: iso("2026-02-15T10:00:00Z"),
    baseSaveCount: 1368,
    baseViewCount: 9820,
    isFeatured: false,
  },

  // 3. Nisha & Dev — Minimalist, Intimate, Goa
  {
    id: "show-nisha-dev",
    slug: "nisha-and-dev-goa-2026",
    coupleUserId: "user-nisha-demo",
    brideName: "Nisha",
    partnerName: "Dev",
    title: "Nisha & Dev's Wedding",
    weddingDate: "2025-12-20",
    locationCity: "Goa, India",
    venueName: "W Goa · Vagator Beach",
    coverImageUrl: IMG.nishaCover,
    storyText:
      "<p>We never wanted a big wedding. Both of us are youngest children — we'd watched our siblings do the three-hundred-guest thing and we were quietly certain we wanted the opposite.</p><p>Sixty people. Three days. A beach. An RSVP card that said, in Dev's handwriting, <em>please don't bring gifts, bring yourselves</em>. The whole thing cost less than half of what our parents spent on our siblings' weddings and felt twice as personal.</p><p>If you're quietly planning something smaller than your family expects — this is your permission slip.</p>",
    styleTags: ["minimalist", "intimate", "destination"],
    traditionTags: ["hindu"],
    budgetRange: "25k_50k",
    guestCountRange: "50–80",
    budgetBreakdown: [
      { label: "Venue & Catering", percent: 45 },
      { label: "Attire & Jewelry", percent: 14 },
      { label: "Décor & Florals", percent: 10 },
      { label: "Photo & Video", percent: 14 },
      { label: "Stationery & Favors", percent: 8 },
      { label: "Travel & Accommodation", percent: 6 },
      { label: "Other", percent: 3 },
    ],
    photos: [
      {
        id: "ph-nd-1",
        imageUrl: IMG.nishaBeach,
        caption: "Sixty people, sunset, no seating chart.",
        section: "general",
        sortOrder: 0,
      },
      {
        id: "ph-nd-2",
        imageUrl: IMG.nishaPaper,
        caption: "Hand-lettered suite on cotton paper.",
        section: "details",
        sortOrder: 0,
      },
      {
        id: "ph-nd-3",
        imageUrl: IMG.nishaTable,
        caption: "One long table. One shared meal.",
        section: "details",
        sortOrder: 1,
      },
    ],
    productTags: [
      {
        id: "pt-nd-1",
        photoId: "ph-nd-2",
        productId: "p-invite-suite-letterpress",
        section: "details",
        pinX: 0.5,
        pinY: 0.5,
        note: "Single-sheet suite on hand-deckled cotton. Quiet and beautiful.",
      },
      {
        id: "pt-nd-2",
        productId: "p-rsvp-cards",
        section: "details",
        note: "Hand-lettered RSVPs. Worth every rupee.",
      },
    ],
    vendorReviews: [
      {
        id: "vr-nd-1",
        vendorId: "v-letterpress-lane",
        role: "Stationery",
        rating: 5,
        reviewText:
          "They understood exactly what we meant by 'quiet paper.' No pressure to upsell, no last-minute add-ons. Just beautiful work.",
      },
      {
        id: "vr-nd-2",
        vendorId: "v-marigold-studio",
        role: "Florals",
        rating: 4,
        reviewText:
          "Sourced local Goan flowers for the entire install. The orchid-and-tuberose ceremony arch was the hero of the whole wedding.",
      },
    ],
    creatorShoutouts: [
      {
        id: "cs-nd-1",
        creatorId: "cr-anika-desai",
        shoutoutText:
          "Anika's stationery guide talked us out of three different add-ons that would have cluttered the suite. We kept it to one invitation, one RSVP, one menu card. Perfect.",
      },
    ],
    status: "published",
    publishedAt: iso("2026-01-20T10:00:00Z"),
    createdAt: iso("2026-01-05T10:00:00Z"),
    updatedAt: iso("2026-01-20T10:00:00Z"),
    baseSaveCount: 942,
    baseViewCount: 6120,
    isFeatured: false,
  },
];

// ── Lookups ───────────────────────────────────────────────────────────────

export function listPublishedShowcases(): RealWeddingShowcase[] {
  return SEED_SHOWCASES.filter((s) => s.status === "published");
}

export function getShowcase(id: string): RealWeddingShowcase | undefined {
  return SEED_SHOWCASES.find((s) => s.id === id);
}

export function getShowcaseBySlug(slug: string): RealWeddingShowcase | undefined {
  return SEED_SHOWCASES.find((s) => s.slug === slug);
}

export function getFeaturedShowcase(): RealWeddingShowcase | undefined {
  return listPublishedShowcases().find((s) => s.isFeatured);
}

export function getShowcasesByVendor(vendorId: string): RealWeddingShowcase[] {
  return listPublishedShowcases().filter((s) =>
    s.vendorReviews.some((r) => r.vendorId === vendorId),
  );
}

export function getShowcasesByProduct(productId: string): RealWeddingShowcase[] {
  return listPublishedShowcases().filter((s) =>
    s.productTags.some((t) => t.productId === productId),
  );
}

export function getShowcasesByCreator(creatorId: string): RealWeddingShowcase[] {
  return listPublishedShowcases().filter((s) =>
    s.creatorShoutouts.some((c) => c.creatorId === creatorId),
  );
}

// ── Related / discovery ────────────────────────────────────────────────────

// Given a showcase, find up to `limit` others that share the most style or
// tradition tags. Used by the "More Real Weddings" footer.
export function getRelatedShowcases(
  showcase: RealWeddingShowcase,
  limit = 3,
): RealWeddingShowcase[] {
  const styleSet = new Set(showcase.styleTags);
  const tradSet = new Set(showcase.traditionTags);
  const others = listPublishedShowcases().filter((s) => s.id !== showcase.id);
  const scored = others.map((s) => ({
    showcase: s,
    score:
      s.styleTags.filter((t) => styleSet.has(t)).length * 2 +
      s.traditionTags.filter((t) => tradSet.has(t)).length,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.showcase);
}
