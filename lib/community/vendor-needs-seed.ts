// ── Vendor needs + interests seed ───────────────────────────────────────────
// Pre-populated checklists for the seeded brides (Priya, Meera, Tara, Aisha,
// Sneha, Isha) plus a handful of vendor interests addressed to the demo
// portal vendor (Aurora Studios, photography). Lets the bride-side inbox and
// vendor-side feed render meaningful state on first load.

import type {
  CommunityVendorInterest,
  CommunityVendorNeed,
} from "@/types/vendor-needs";

// Helper: backdated ISO string so seed rows look "aged" in the UI without
// needing a real cron. days=0 means now.
const ago = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const SEED_VENDOR_NEEDS: CommunityVendorNeed[] = [
  // ── Priya (seed-priya) — Udaipur palace wedding, Nov 2026 ────────────────
  {
    id: "seed-need-priya-venue",
    profile_id: "seed-priya",
    category_slug: "venue",
    status: "booked",
    urgency: "flexible",
    is_visible_to_vendors: false,
    booked_vendor_name: "Udaipur Palace",
    is_seed: true,
    created_at: ago(60),
    updated_at: ago(60),
  },
  {
    id: "seed-need-priya-photographer",
    profile_id: "seed-priya",
    category_slug: "photographer",
    status: "looking",
    budget_range: "5k_10k",
    preferred_style: "editorial, candid",
    notes:
      "Need someone who does both Indian and Western ceremonies. Engagement shoot included.",
    urgency: "soon",
    is_visible_to_vendors: true,
    is_seed: true,
    created_at: ago(20),
    updated_at: ago(2),
  },
  {
    id: "seed-need-priya-videographer",
    profile_id: "seed-priya",
    category_slug: "videographer",
    status: "looking",
    budget_range: "3k_5k",
    preferred_style: "cinematic",
    urgency: "flexible",
    is_visible_to_vendors: true,
    is_seed: true,
    created_at: ago(18),
    updated_at: ago(18),
  },
  {
    id: "seed-need-priya-planner",
    profile_id: "seed-priya",
    category_slug: "wedding_planner",
    status: "booked",
    urgency: "flexible",
    is_visible_to_vendors: false,
    booked_vendor_name: "Urvashi Events",
    is_seed: true,
    created_at: ago(45),
    updated_at: ago(45),
  },
  {
    id: "seed-need-priya-decorator",
    profile_id: "seed-priya",
    category_slug: "decorator",
    status: "looking",
    budget_range: "10k_20k",
    notes:
      "Grand mandap setup, lots of florals, modern but traditional. Udaipur venue.",
    urgency: "urgent",
    is_visible_to_vendors: true,
    is_seed: true,
    created_at: ago(10),
    updated_at: ago(1),
  },
  {
    id: "seed-need-priya-caterer",
    profile_id: "seed-priya",
    category_slug: "caterer",
    status: "not_needed",
    urgency: "flexible",
    is_visible_to_vendors: false,
    is_seed: true,
    created_at: ago(40),
    updated_at: ago(40),
  },
  {
    id: "seed-need-priya-dj",
    profile_id: "seed-priya",
    category_slug: "dj_music",
    status: "looking",
    budget_range: "flexible",
    urgency: "flexible",
    is_visible_to_vendors: true,
    is_seed: true,
    created_at: ago(15),
    updated_at: ago(15),
  },

  // ── Meera (seed-meera) — Kochi wedding, Sep 2026 ─────────────────────────
  {
    id: "seed-need-meera-photographer",
    profile_id: "seed-meera",
    category_slug: "photographer",
    status: "looking",
    budget_range: "3k_5k",
    preferred_style: "candid, documentary",
    notes:
      "Barefoot mandap, banana-leaf sadhya — I want it to feel like a family dinner that accidentally became a wedding.",
    urgency: "flexible",
    is_visible_to_vendors: true,
    is_seed: true,
    created_at: ago(30),
    updated_at: ago(5),
  },
  {
    id: "seed-need-meera-videographer",
    profile_id: "seed-meera",
    category_slug: "videographer",
    status: "looking",
    budget_range: "1k_3k",
    preferred_style: "documentary",
    urgency: "soon",
    is_visible_to_vendors: true,
    is_seed: true,
    created_at: ago(25),
    updated_at: ago(25),
  },
  {
    id: "seed-need-meera-decorator",
    profile_id: "seed-meera",
    category_slug: "decorator",
    status: "looking",
    budget_range: "3k_5k",
    notes: "Banana leaves, jasmine, terracotta. No mandap. Keep it grounded.",
    urgency: "soon",
    is_visible_to_vendors: true,
    is_seed: true,
    created_at: ago(22),
    updated_at: ago(22),
  },

  // ── Tara (seed-tara) — Mumbai destination wedding ────────────────────────
  {
    id: "seed-need-tara-photographer",
    profile_id: "seed-tara",
    category_slug: "photographer",
    status: "looking",
    budget_range: "10k_20k",
    preferred_style: "editorial, fine art",
    notes: "Looking for someone who travels — destination experience a plus.",
    urgency: "soon",
    is_visible_to_vendors: true,
    is_seed: true,
    created_at: ago(12),
    updated_at: ago(12),
  },
  {
    id: "seed-need-tara-makeup",
    profile_id: "seed-tara",
    category_slug: "makeup_artist",
    status: "looking",
    budget_range: "3k_5k",
    preferred_style: "soft glam, natural",
    urgency: "flexible",
    is_visible_to_vendors: true,
    is_seed: true,
    created_at: ago(8),
    updated_at: ago(8),
  },

  // ── Aisha (seed-aisha) — Delhi wedding, Feb 2027 ─────────────────────────
  {
    id: "seed-need-aisha-photographer",
    profile_id: "seed-aisha",
    category_slug: "photographer",
    status: "looking",
    budget_range: "5k_10k",
    preferred_style: "candid",
    urgency: "flexible",
    is_visible_to_vendors: true,
    is_seed: true,
    created_at: ago(6),
    updated_at: ago(6),
  },

  // ── Sneha (seed-sneha) — Bangalore wedding ───────────────────────────────
  {
    id: "seed-need-sneha-photographer",
    profile_id: "seed-sneha",
    category_slug: "photographer",
    status: "looking",
    budget_range: "1k_3k",
    preferred_style: "candid",
    urgency: "urgent",
    notes: "Wedding in 8 weeks. Shortlisting now.",
    is_visible_to_vendors: true,
    is_seed: true,
    created_at: ago(3),
    updated_at: ago(1),
  },
];

// ── Vendor interests ─────────────────────────────────────────────────────────
// Aurora Studios (PORTAL_VENDOR_ID = "vendor-aurora-studios", photography)
// has reached out to a few brides + a few other vendors have reached out to
// Priya so her inbox renders multiple cards.

export const SEED_VENDOR_INTERESTS: CommunityVendorInterest[] = [
  // Aurora → Meera (sent, pending)
  {
    id: "seed-interest-aurora-meera",
    vendor_id: "vendor-aurora-studios",
    need_id: "seed-need-meera-photographer",
    bride_profile_id: "seed-meera",
    message:
      "Hi Meera — your line about 'a family dinner that accidentally became a wedding' is exactly the kind of energy I love shooting. I'd be honored to share my Kerala wedding work with you.",
    status: "pending",
    is_seed: true,
    created_at: ago(2),
    updated_at: ago(2),
  },
  // Aurora → Tara (accepted — bride shared contact)
  {
    id: "seed-interest-aurora-tara",
    vendor_id: "vendor-aurora-studios",
    need_id: "seed-need-tara-photographer",
    bride_profile_id: "seed-tara",
    message:
      "Hi Tara — I've shot 12 destination weddings in the last two years and travel for the right couple. Would love to send my portfolio.",
    status: "accepted",
    is_seed: true,
    created_at: ago(5),
    updated_at: ago(3),
  },
  // Aurora → Sneha (declined — soft-language in UI)
  {
    id: "seed-interest-aurora-sneha",
    vendor_id: "vendor-aurora-studios",
    need_id: "seed-need-sneha-photographer",
    bride_profile_id: "seed-sneha",
    message:
      "Hi Sneha — saw you're 8 weeks out. I have your weekend open and would love to talk.",
    status: "declined",
    is_seed: true,
    created_at: ago(8),
    updated_at: ago(6),
  },
  // Other vendors → Priya (so her inbox isn't empty when she's the user)
  {
    id: "seed-interest-josephradhik-priya",
    vendor_id: "vendor-joseph-radhik",
    need_id: "seed-need-priya-photographer",
    bride_profile_id: "seed-priya",
    message:
      "Hi Priya — I shoot a lot of palace weddings in Rajasthan and would love to hear more about your November date in Udaipur.",
    status: "pending",
    is_seed: true,
    created_at: ago(2),
    updated_at: ago(2),
  },
  {
    id: "seed-interest-aurora-priya",
    vendor_id: "vendor-aurora-studios",
    need_id: "seed-need-priya-photographer",
    bride_profile_id: "seed-priya",
    message:
      "Hi Priya — I specialize in editorial wedding photography and have shot 8 weddings at palace venues in Rajasthan. I'd love to share my portfolio with you.",
    status: "pending",
    is_seed: true,
    created_at: ago(1),
    updated_at: ago(1),
  },
  {
    id: "seed-interest-design-priya",
    vendor_id: "vendor-wedding-design-co",
    need_id: "seed-need-priya-decorator",
    bride_profile_id: "seed-priya",
    message:
      "Hi Priya — your brief reads like a love letter to Udaipur. Devika here — we'd love to mock up a mandap concept for you.",
    status: "pending",
    is_seed: true,
    created_at: ago(0),
    updated_at: ago(0),
  },
];
