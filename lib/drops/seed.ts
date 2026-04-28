import type { CreatorDrop, DropItem } from "@/types/drop";

const iso = (d: string) => new Date(d).toISOString();

// Time anchors are relative to the assistant's "today" (2026-04-23) so the
// active/upcoming/expired statuses render accurately in the UI without
// requiring runtime backfill.
const NOW = new Date("2026-04-23T12:00:00Z");
const daysFromNow = (days: number) =>
  iso(
    new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
  );

export const SEED_DROPS: CreatorDrop[] = [
  // Active — Priya — coral accent
  {
    id: "drop-priya-summer-sangeet-2026",
    slug: "summer-sangeet-edit-2026",
    creatorId: "cr-priya-patel",
    title: "Summer Sangeet Edit 2026",
    description:
      "Six pieces I'd choose for a sunset sangeet — high-shine zardozi, warm metals, and the dupatta I keep coming back to.",
    themeTag: "summer",
    coverImageUrl:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=1600&q=80",
    accentColor: "#FF6B6B",
    startsAt: daysFromNow(-2),
    endsAt: daysFromNow(5),
    status: "active",
    module: "phase-3",
    viewCount: 2847,
    saveCount: 412,
    createdAt: iso("2026-04-18T09:00:00Z"),
    updatedAt: iso("2026-04-21T14:00:00Z"),
  },
  // Upcoming — Meera — teal accent
  {
    id: "drop-meera-monsoon-decor",
    slug: "monsoon-wedding-decor-essentials",
    creatorId: "cr-meera-shah",
    title: "Monsoon Wedding Decor Essentials",
    description:
      "Five pieces that hold up in humidity — rose-gold metals, brass diyas, and centerpieces that look right under cloud-soft light.",
    themeTag: "monsoon",
    coverImageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
    accentColor: "#2DD4BF",
    startsAt: daysFromNow(10),
    endsAt: daysFromNow(24),
    status: "scheduled",
    module: "phase-0",
    viewCount: 0,
    saveCount: 87,
    createdAt: iso("2026-04-20T11:00:00Z"),
    updatedAt: iso("2026-04-20T11:00:00Z"),
  },
  // Expired (recently) — Anika — sage accent
  {
    id: "drop-anika-minimalist-invites",
    slug: "minimalist-invitation-suite",
    creatorId: "cr-anika-desai",
    title: "Minimalist Invitation Suite",
    description:
      "Four restrained letterpress pieces. Quiet, paper-forward, made for slow weddings.",
    themeTag: "minimalist",
    coverImageUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80",
    accentColor: "#9CAF88",
    startsAt: daysFromNow(-28),
    endsAt: daysFromNow(-14),
    status: "expired",
    module: "phase-5",
    viewCount: 1923,
    saveCount: 218,
    createdAt: iso("2026-03-20T09:00:00Z"),
    updatedAt: iso("2026-04-09T17:00:00Z"),
  },
];

export const SEED_DROP_ITEMS: DropItem[] = [
  // Summer Sangeet — Priya
  {
    id: "di-1",
    dropId: "drop-priya-summer-sangeet-2026",
    productId: "p-lehenga-anarkali",
    creatorNote:
      "The crimson reads as warm, not loud — perfect for golden-hour entries.",
    sortOrder: 1,
  },
  {
    id: "di-2",
    dropId: "drop-priya-summer-sangeet-2026",
    productId: "p-sherwani-ivory",
    creatorNote: "Pair this with the kundan choker — it lifts the whole look.",
    sortOrder: 2,
  },
  {
    id: "di-3",
    dropId: "drop-priya-summer-sangeet-2026",
    productId: "p-dupatta-gota",
    creatorNote: null,
    sortOrder: 3,
  },
  {
    id: "di-4",
    dropId: "drop-priya-summer-sangeet-2026",
    productId: "p-kundan-choker",
    creatorNote: "Worn three times this season already — the hero piece.",
    sortOrder: 4,
  },
  {
    id: "di-5",
    dropId: "drop-priya-summer-sangeet-2026",
    productId: "p-maang-tikka",
    creatorNote: null,
    sortOrder: 5,
  },
  {
    id: "di-6",
    dropId: "drop-priya-summer-sangeet-2026",
    productId: "p-mojari-gold",
    creatorNote: "Quietly the most-clicked piece in my last edit.",
    sortOrder: 6,
  },

  // Monsoon Decor — Meera
  {
    id: "di-7",
    dropId: "drop-meera-monsoon-decor",
    productId: "p-mandap-rose-gold",
    creatorNote: "Reads warm under overcast light. Photographs beautifully.",
    sortOrder: 1,
  },
  {
    id: "di-8",
    dropId: "drop-meera-monsoon-decor",
    productId: "p-centerpiece-rose",
    creatorNote: null,
    sortOrder: 2,
  },
  {
    id: "di-9",
    dropId: "drop-meera-monsoon-decor",
    productId: "p-marigold-garland",
    creatorNote:
      "Real marigolds wilt in humidity — these don't, and read just as warm.",
    sortOrder: 3,
  },
  {
    id: "di-10",
    dropId: "drop-meera-monsoon-decor",
    productId: "p-diya-brass-set",
    creatorNote: null,
    sortOrder: 4,
  },
  {
    id: "di-11",
    dropId: "drop-meera-monsoon-decor",
    productId: "p-thali-brass",
    creatorNote: "Anchors the entry table. Shines in monsoon light.",
    sortOrder: 5,
  },

  // Minimalist Invites — Anika
  {
    id: "di-12",
    dropId: "drop-anika-minimalist-invites",
    productId: "p-invite-suite-letterpress",
    creatorNote: "The hero suite — single ink, single fold.",
    sortOrder: 1,
  },
  {
    id: "di-13",
    dropId: "drop-anika-minimalist-invites",
    productId: "p-rsvp-cards",
    creatorNote: "Pair with the suite. They feel like little gifts.",
    sortOrder: 2,
  },
  {
    id: "di-14",
    dropId: "drop-anika-minimalist-invites",
    productId: "p-tea-set",
    creatorNote: null,
    sortOrder: 3,
  },
  {
    id: "di-15",
    dropId: "drop-anika-minimalist-invites",
    productId: "p-glassware-gold",
    creatorNote: null,
    sortOrder: 4,
  },
];

// ── Lookups ───────────────────────────────────────────────────────────────

export function getDrop(id: string): CreatorDrop | undefined {
  return SEED_DROPS.find((d) => d.id === id);
}

export function getDropBySlug(slug: string): CreatorDrop | undefined {
  return SEED_DROPS.find((d) => d.slug === slug);
}

export function getDropItems(dropId: string): DropItem[] {
  return SEED_DROP_ITEMS.filter((i) => i.dropId === dropId).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function getDropsByCreator(creatorId: string): CreatorDrop[] {
  return SEED_DROPS.filter((d) => d.creatorId === creatorId);
}

export function getActiveDrops(): CreatorDrop[] {
  const now = Date.now();
  return SEED_DROPS.filter((d) => {
    const start = new Date(d.startsAt).getTime();
    const end = new Date(d.endsAt).getTime();
    return now >= start && now <= end && d.status !== "archived";
  });
}

export function getUpcomingDrops(): CreatorDrop[] {
  const now = Date.now();
  return SEED_DROPS.filter(
    (d) => new Date(d.startsAt).getTime() > now && d.status !== "archived",
  );
}

export function getExpiredDrops(): CreatorDrop[] {
  const now = Date.now();
  return SEED_DROPS.filter((d) => new Date(d.endsAt).getTime() < now);
}

// Returns the drop ID that contains a given product (active drops only),
// used for the "🔥 Part of [Drop]" badge on product cards.
export function getActiveDropForProduct(productId: string): CreatorDrop | null {
  const active = getActiveDrops();
  for (const drop of active) {
    if (SEED_DROP_ITEMS.some((i) => i.dropId === drop.id && i.productId === productId)) {
      return drop;
    }
  }
  return null;
}
