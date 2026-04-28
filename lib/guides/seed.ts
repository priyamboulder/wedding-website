import type { Guide, GuideCategory } from "@/types/guide";

const iso = (d: string) => new Date(d).toISOString();

// Cover image bank (Unsplash, same source as store-seed for visual coherence).
const COVER = {
  lehenga: "https://images.unsplash.com/photo-1610030469668-8e45b5c2f8d6?w=1600&q=80",
  bride: "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=1600&q=80",
  decor: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
  paper: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80",
};

const INLINE = {
  lehengaCloseup:
    "https://images.unsplash.com/photo-1610189019831-58baaaa6b4a1?w=1200&q=80",
  bridalDetails:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80",
  mandapWide:
    "https://images.unsplash.com/photo-1604322611922-b4c0b44e3d70?w=1200&q=80",
  centerpieceShot:
    "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1200&q=80",
  paperFlatlay:
    "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
  paperRsvp:
    "https://images.unsplash.com/photo-1495224814653-94f36c0a31ea?w=1200&q=80",
};

// ── Guides ────────────────────────────────────────────────────────────────

export const SEED_GUIDES: Guide[] = [
  // 1. Priya — Bridal Lehenga Guide (Styling)
  {
    id: "g-priya-lehenga-guide",
    slug: "complete-bridal-lehenga-guide",
    creatorId: "cr-priya-patel",
    title:
      "The Complete Bridal Lehenga Guide: Fabrics, Fits & What to Look For",
    subtitle:
      "Everything I wish brides knew before their first appointment — from weave families to the silhouettes that actually photograph well.",
    coverImageUrl: COVER.lehenga,
    category: "styling",
    readTimeMinutes: 8,
    status: "published",
    publishedAt: iso("2026-04-02T10:00:00Z"),
    createdAt: iso("2026-03-28T10:00:00Z"),
    updatedAt: iso("2026-04-02T10:00:00Z"),
    baseSaveCount: 1284,
    baseViewCount: 14820,
    body: [
      {
        type: "rich_text",
        html: "<p>Walk into any bridal atelier and you'll be handed a hundred lehengas inside the first ten minutes. The fabric blurs. The mirrors don't help. Most brides I work with leave their first appointment more confused than when they arrived — and the second appointment isn't much better.</p><p>This is the guide I wrote for myself, years ago, when I started styling. Save it, screenshot it, send it to your mother. The bridal-buying decision is too big to make on instinct alone.</p>",
      },
      {
        type: "rich_text",
        html: "<p><strong>Start with the weave, not the embellishment.</strong> Embroidery can be added to any base — but a poor base will sink even the best zardozi. Look for tight raw silks, structured Banarasi, or a heavy crepe with weight that holds the skirt's flare. If the lehenga collapses inward when you twirl, the silhouette won't survive a long day.</p>",
      },
      {
        type: "product_embed",
        productId: "p-lehenga-anarkali",
        context:
          "The Anarkali I'd send every bride to try first — the cut elongates, and the zardozi sits flat instead of crumpling at the waist.",
      },
      {
        type: "pull_quote",
        text: "Embroidery can be added to any base — but a poor base will sink even the best zardozi.",
      },
      {
        type: "rich_text",
        html: "<p><strong>Then the silhouette.</strong> The four families I work in are: A-line (forgiving, walks well), Mermaid (dramatic, requires a long aisle), Anarkali (modern, photographs cleanly), and Lehenga-saree (the easiest to dance in, contrary to what you've been told).</p><p>If you're under 5'4\", the Anarkali will be kinder to your frame than a heavy ghagra. If you're 5'8\" or taller, the mermaid is finally yours — most brides at that height have been told to avoid it for years, and it isn't true.</p>",
      },
      {
        type: "image",
        images: [
          {
            url: INLINE.lehengaCloseup,
            alt: "Close-up of zardozi embroidery on a saffron dupatta",
            caption: "Hand-zardozi takes 180+ hours per panel. Worth it.",
          },
          {
            url: INLINE.bridalDetails,
            alt: "Polki bridal jewelry on red velvet",
          },
        ],
      },
      {
        type: "rich_text",
        html: "<p><strong>The dupatta is the lehenga.</strong> A flat tulle dupatta on a heavy ghagra reads as an afterthought. Match the weight — if your lehenga is structured, the dupatta needs presence too. Gota patti is having a real moment for a reason: it adds visual weight without the heat of a fully embroidered second piece.</p>",
      },
      {
        type: "product_embed",
        productId: "p-dupatta-gota",
        context:
          "My most-recommended dupatta this season. The gota border catches light without overwhelming the base.",
      },
      {
        type: "rich_text",
        html: "<p><strong>For a saree-leaning bride.</strong> If the lehenga aesthetic feels too heavy or too modern, a heritage Banarasi is the older, quieter choice — and it never goes out of fashion. The crimson Benarasi I'm linking below is the one I keep coming back to in my own closet.</p>",
      },
      {
        type: "product_embed",
        productId: "p-saree-benares-red",
        context: "If you want something your mother will cry over, this is it.",
      },
      {
        type: "rich_text",
        html: "<p>One last thing. <strong>Wear the outfit for thirty minutes before you say yes.</strong> Sit. Stand. Lift your arms. Most brides try the lehenga on for ninety seconds and base the whole decision on a mirror. The wedding day is eight hours.</p>",
      },
    ],
  },

  // 2. Priya — Top 5 Under $30K (Budget)
  {
    id: "g-priya-under-30k",
    slug: "top-5-under-30k-bridal-looks",
    creatorId: "cr-priya-patel",
    title: "My Top 5 Under-$30K Bridal Accessory Looks for 2026",
    subtitle:
      "Where to spend, where to skip — and the five accessory pieces that punch above their price this season.",
    coverImageUrl: COVER.bride,
    category: "budget",
    readTimeMinutes: 5,
    status: "published",
    publishedAt: iso("2026-03-25T10:00:00Z"),
    createdAt: iso("2026-03-20T10:00:00Z"),
    updatedAt: iso("2026-03-25T10:00:00Z"),
    baseSaveCount: 942,
    baseViewCount: 9120,
    body: [
      {
        type: "rich_text",
        html: "<p>Most of my budget conversations with brides start the same way: <em>can I do this without compromising on what I see in my head?</em> Usually, yes. The trick is knowing which pieces deserve the spend and which ones disappear in photos no matter how much you put into them.</p><p>Here are the five accessory pieces I'd build a bridal look around this year — none over $15K, all of them carrying their weight on camera.</p>",
      },
      {
        type: "list",
        variant: "numbered",
        title: "How I'd allocate the budget",
        items: [
          "Spend on jewelry that touches the face — chokers, maang tikka, earrings. These read in every photo.",
          "Save on shoes — most go unseen, and comfort matters more than embellishment.",
          "Mid-range your dupatta — it's a hero piece but doesn't need couture pricing.",
          "Splurge on a statement chudi stack. Hands are in 80% of bridal portraits.",
          "Skip novelty add-ons (kalgi pins for the bride, etc.) unless they're family heirlooms.",
        ],
      },
      {
        type: "product_embed",
        productId: "p-pagdi-crystal",
        context:
          "For grooms — this pagdi is the grown-up version of everything you've been pinned on Pinterest.",
      },
      {
        type: "product_embed",
        productId: "p-maang-tikka",
        context:
          "The piece I recommend most. Sits beautifully even with a low center part.",
      },
      {
        type: "image",
        images: [
          {
            url: INLINE.bridalDetails,
            alt: "Polki bridal jewelry detail",
            caption: "Where to spend: anything that touches the face.",
          },
        ],
      },
      {
        type: "pull_quote",
        text: "Spend on what touches the face. Skip what disappears in photos.",
        attribution: "My one rule for budget bridal styling.",
      },
      {
        type: "product_embed",
        productId: "p-chudi-set",
        context:
          "Stack them. A thin solo chudi looks lonely in photos — always go heavier than you think.",
      },
      {
        type: "product_embed",
        productId: "p-mojari-gold",
        context:
          "The pair I'd actually wear for eight hours. Comfort is non-negotiable.",
      },
      {
        type: "product_embed",
        productId: "p-dupatta-gota",
        context:
          "A mid-range dupatta done well. Reads couture in photos without the couture price.",
      },
      {
        type: "rich_text",
        html: "<p>If you've got room in the budget for one splurge — make it the chudi stack. Hands hold mehndi, the ring exchange, the first feed at the reception. They're everywhere. Don't skimp.</p>",
      },
    ],
  },

  // 3. Meera — Decor Trends (Trend Report)
  {
    id: "g-meera-decor-trends-2026",
    slug: "decor-trends-wedding-season-2026",
    creatorId: "cr-meera-shah",
    title: "Decor Trends We're Seeing This Wedding Season",
    subtitle:
      "What's tired, what's earned its stay, and the three décor moves that will define 2026 weddings.",
    coverImageUrl: COVER.decor,
    category: "trend_report",
    readTimeMinutes: 6,
    status: "published",
    publishedAt: iso("2026-04-08T10:00:00Z"),
    createdAt: iso("2026-04-03T10:00:00Z"),
    updatedAt: iso("2026-04-08T10:00:00Z"),
    baseSaveCount: 671,
    baseViewCount: 6840,
    body: [
      {
        type: "rich_text",
        html: "<p>Three years ago, every mandap looked like an explosion of marigold in pastel watercolors. The pendulum has swung. The ceremonies I'm designing this season are quieter — heavier on architecture, lighter on florals, with a deliberate return to the brass and copper that grounded our grandmothers' weddings.</p><p>Here's what we're seeing.</p>",
      },
      {
        type: "rich_text",
        html: "<p><strong>1. Architectural mandaps over floral mandaps.</strong> The mandap is the anchor of the ceremony. When it's swallowed in florals, the photos lose dimension. Clean rose-gold, brushed brass, or ivory wood frames let the couple be the focal point — and the florals become accent rather than wallpaper.</p>",
      },
      {
        type: "product_embed",
        productId: "p-mandap-rose-gold",
        context:
          "The clean rose-gold frame I'm specifying for almost every ceremony this year.",
      },
      {
        type: "image",
        images: [
          {
            url: INLINE.mandapWide,
            alt: "Wide shot of a marigold-covered ceremony space",
            caption: "Density still matters — but in the garlands, not the mandap.",
          },
          {
            url: INLINE.centerpieceShot,
            alt: "Soft centerpiece detail with rose petals",
          },
        ],
      },
      {
        type: "rich_text",
        html: "<p><strong>2. Brass everywhere.</strong> Brass diyas at the entrance, brass thalis at the haldi, brass urlis on the centerpieces. The metal carries an ancestral weight that resin and glass can't replicate. We're seeing planners specify it earlier in the ceremony brief — not as a finishing touch but as the second design language alongside the florals.</p>",
      },
      {
        type: "product_embed",
        productId: "p-diya-brass-set",
        context:
          "Brass diyas at the mandap entrance change the whole energy of the walk-in. Non-negotiable for me.",
      },
      {
        type: "pull_quote",
        text: "The mandap is the anchor. The centerpieces are the echo. Keep them quieter than you think they should be.",
      },
      {
        type: "rich_text",
        html: "<p><strong>3. Restraint at the table.</strong> Tall, lush centerpieces are out — guests can't see across them, and they crowd the food. We're moving to lower, more sculptural arrangements that let conversation happen.</p>",
      },
      {
        type: "product_embed",
        productId: "p-centerpiece-rose",
        context:
          "Low, sculptural, restrained. Lets the table breathe and the conversation flow.",
      },
      {
        type: "list",
        variant: "checklist",
        title: "Quick decor audit",
        items: [
          "Is the mandap visible in profile, or swallowed by florals?",
          "Have you specified brass at three or more ceremony moments?",
          "Can guests see across every centerpiece?",
          "Is at least one element heirloom or family-sourced?",
        ],
      },
    ],
  },

  // 4. Anika — Stationery Guide (Planning)
  {
    id: "g-anika-stationery-guide",
    slug: "wedding-stationery-that-tells-your-story",
    creatorId: "cr-anika-desai",
    title: "How to Choose Wedding Stationery That Tells Your Story",
    subtitle:
      "The paper a guest holds is the first physical thing they touch from your wedding. Make it count.",
    coverImageUrl: COVER.paper,
    category: "planning",
    readTimeMinutes: 7,
    status: "published",
    publishedAt: iso("2026-04-15T10:00:00Z"),
    createdAt: iso("2026-04-10T10:00:00Z"),
    updatedAt: iso("2026-04-15T10:00:00Z"),
    baseSaveCount: 538,
    baseViewCount: 4720,
    body: [
      {
        type: "rich_text",
        html: "<p>Couples spend months on the venue, the food, the playlist — and then order their invitations from a vendor portal in fifteen minutes. The paper is the first physical thing your guest holds. It sets the tone before anyone reads a single word.</p><p>Here's how I think about a stationery suite when a couple comes to me.</p>",
      },
      {
        type: "rich_text",
        html: "<p><strong>Pick a paper, not a template.</strong> The single biggest decision is the substrate. Cotton has weight and tooth. Hand-deckled edges feel intimate. Foiled card stock photographs beautifully but feels uniform in hand. Letterpress on a heavy cotton is the most-asked-for finish in my studio for a reason — guests literally pin those invitations to their fridges.</p>",
      },
      {
        type: "product_embed",
        productId: "p-invite-suite-letterpress",
        context:
          "Letterpress on hand-deckled cotton. The finish I recommend most for couples who want something tactile.",
      },
      {
        type: "image",
        images: [
          {
            url: INLINE.paperFlatlay,
            alt: "Flatlay of letterpress invitation suite with envelopes",
            caption: "A complete suite — invitation, RSVP, details card, envelope.",
          },
        ],
      },
      {
        type: "pull_quote",
        text: "The paper a guest holds is the first physical thing they touch from your wedding. Make it count.",
      },
      {
        type: "rich_text",
        html: "<p><strong>Pair the invitation with a matching RSVP.</strong> Most digital RSVP forms feel cold. A pre-stamped, hand-lettered RSVP card that comes back to you is a tiny gift — and you'll find yourself saving every single one. Don't skip this piece for a QR code.</p>",
      },
      {
        type: "product_embed",
        productId: "p-rsvp-cards",
        context:
          "When the RSVPs come back, they feel like little gifts. I always pair them with the invitation suite.",
      },
      {
        type: "image",
        images: [
          {
            url: INLINE.paperRsvp,
            alt: "Hand-lettered RSVP card on a wooden surface",
          },
        ],
      },
      {
        type: "rich_text",
        html: "<p><strong>Build the suite as a system, not a sequence.</strong> The invitation, RSVP, details card, save-the-date, and day-of menus should all share a single design language. When a guest sees a place card at their seat that matches the envelope they received eight weeks earlier, that's when the whole event starts to feel considered.</p>",
      },
      {
        type: "list",
        variant: "bullets",
        title: "What to ask your stationer",
        items: [
          "What weight of paper do you specify (in gsm)?",
          "Do you offer hand-deckled edges or just guillotine cuts?",
          "Can you proof on the actual stock before final run?",
          "What's your turnaround for a full suite — and a partial reorder?",
        ],
      },
      {
        type: "rich_text",
        html: "<p>Lastly — order extras. Twenty more than you think you need. Guests will lose them, you'll want to keep one in your scrapbook, and the printer's setup cost makes a small reorder almost as expensive as the original run.</p>",
      },
    ],
  },
];

// ── Lookups ───────────────────────────────────────────────────────────────

export function getGuide(id: string): Guide | undefined {
  return SEED_GUIDES.find((g) => g.id === id);
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return SEED_GUIDES.find((g) => g.slug === slug);
}

export function listPublishedGuides(): Guide[] {
  return SEED_GUIDES.filter((g) => g.status === "published");
}

export function getGuidesByCreator(creatorId: string): Guide[] {
  return listPublishedGuides()
    .filter((g) => g.creatorId === creatorId)
    .sort((a, b) =>
      (b.publishedAt ?? b.createdAt).localeCompare(
        a.publishedAt ?? a.createdAt,
      ),
    );
}

// Returns guides that contain a product_embed or comparison referencing the
// given productId. Used by the "Featured in" badge on product cards and by
// the related-products section on guide detail pages.
export function getGuidesFeaturingProduct(productId: string): Guide[] {
  return listPublishedGuides().filter((g) =>
    g.body.some((b) => {
      if (b.type === "product_embed") return b.productId === productId;
      if (b.type === "comparison")
        return b.items.some((i) => i.productId === productId);
      return false;
    }),
  );
}

export function getProductIdsInGuide(guideId: string): string[] {
  const g = getGuide(guideId);
  if (!g) return [];
  const ids = new Set<string>();
  for (const b of g.body) {
    if (b.type === "product_embed") ids.add(b.productId);
    if (b.type === "comparison") b.items.forEach((i) => ids.add(i.productId));
  }
  return Array.from(ids);
}

export function getVendorIdsInGuide(guideId: string): string[] {
  const g = getGuide(guideId);
  if (!g) return [];
  const ids = new Set<string>();
  for (const b of g.body) {
    if (b.type === "vendor_mention") ids.add(b.vendorId);
  }
  return Array.from(ids);
}

// ── Categories ────────────────────────────────────────────────────────────

export const GUIDE_CATEGORY_LABEL: Record<GuideCategory, string> = {
  styling: "Styling",
  planning: "Planning",
  budget: "Budget",
  decor: "Decor",
  vendor_review: "Vendor Review",
  real_wedding: "Real Wedding",
  trend_report: "Trend Report",
  cultural_traditions: "Cultural Traditions",
};

export function getCategoriesWithCounts(): {
  id: GuideCategory;
  label: string;
  count: number;
}[] {
  const guides = listPublishedGuides();
  return (Object.keys(GUIDE_CATEGORY_LABEL) as GuideCategory[]).map((id) => ({
    id,
    label: GUIDE_CATEGORY_LABEL[id],
    count: guides.filter((g) => g.category === id).length,
  }));
}
