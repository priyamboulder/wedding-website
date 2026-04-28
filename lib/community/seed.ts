// ── Community seed data ─────────────────────────────────────────────────────
// Interest tags, blog categories, fun-fact prompts, sample brides, and sample
// meetups. Seed profiles and meetups hydrate on first load so the Discover
// and Meetups views read as a real community, not an empty state.

import type {
  BlogCategory,
  CommunityProfile,
  Discussion,
  DiscussionCategory,
  DiscussionReply,
  FeaturedGuest,
  Huddle,
  HuddleMessage,
  HuddleParticipant,
  InterestTag,
  LiveEvent,
  LiveEventChatMessage,
  LiveEventQuestion,
  LiveEventRsvp,
  Meetup,
  ProfilePhoto,
  ProfilePrompt,
  WeddingEvent,
  ColorSwatch,
} from "@/types/community";

export const INTEREST_TAGS: InterestTag[] = [
  { slug: "venue-hunting", label: "Venue Hunting", emoji: "🏰", sort_order: 1 },
  { slug: "vendor-recs", label: "Vendor Recommendations", emoji: "⭐", sort_order: 2 },
  { slug: "outfit-ideas", label: "Outfit Ideas", emoji: "👗", sort_order: 3 },
  { slug: "decor-inspo", label: "Décor Inspiration", emoji: "🌸", sort_order: 4 },
  { slug: "budget-talk", label: "Budget Talk", emoji: "💰", sort_order: 5 },
  { slug: "emotional-support", label: "Emotional Support", emoji: "💛", sort_order: 6 },
  { slug: "destination-wedding", label: "Destination Wedding Tips", emoji: "✈️", sort_order: 7 },
  { slug: "cultural-traditions", label: "Cultural Traditions", emoji: "🪔", sort_order: 8 },
  { slug: "bridal-party", label: "Bridal Party Help", emoji: "👯", sort_order: 9 },
  { slug: "mehendi-sangeet", label: "Mehendi & Sangeet Ideas", emoji: "🎶", sort_order: 10 },
  { slug: "honeymoon-planning", label: "Honeymoon Planning", emoji: "🌴", sort_order: 11 },
];

export const BLOG_CATEGORIES: BlogCategory[] = [
  { slug: "planning-tips", label: "Planning Tips", sort_order: 1, tags: ["Planning"] },
  { slug: "real-weddings", label: "Real Weddings", sort_order: 2, tags: ["Real Weddings"] },
  { slug: "style-inspiration", label: "Style & Inspiration", sort_order: 3, tags: ["Style"] },
  { slug: "culture-traditions", label: "Culture & Traditions", sort_order: 4, tags: ["Traditions"] },
  { slug: "vendor-spotlights", label: "Vendor Spotlights", sort_order: 5, tags: ["Vendors"] },
];

// ── Fun-fact prompts ───────────────────────────────────────────────────────
export const PROFILE_PROMPTS: ProfilePrompt[] = [
  {
    slug: "how_we_met",
    prompt_text: "How did you two meet?",
    placeholder: "The short version of your love story…",
    sort_order: 1,
  },
  {
    slug: "planning_vibe",
    prompt_text: "What's your planning vibe?",
    placeholder: "e.g. spreadsheet queen 📊, organized chaos, winging it…",
    sort_order: 2,
  },
  {
    slug: "biggest_win",
    prompt_text: "Biggest planning win so far?",
    placeholder: "e.g. found my dream lehenga on the first try",
    sort_order: 3,
  },
  {
    slug: "current_panic",
    prompt_text: "Current planning panic?",
    placeholder: "e.g. seating chart. always the seating chart.",
    sort_order: 4,
  },
  {
    slug: "unpopular_opinion",
    prompt_text: "Your unpopular wedding opinion?",
    placeholder: "e.g. chair covers are never worth it",
    sort_order: 5,
  },
  {
    slug: "best_vendor_find",
    prompt_text: "Best vendor find so far?",
    placeholder: "e.g. our photographer was a friend-of-a-friend miracle",
    sort_order: 6,
  },
];

// ── Sample brides ──────────────────────────────────────────────────────────
// Rich profiles so Discover reads as real on first load. Each bride gets a
// cover gradient (since we can't ship real photos without bloating the
// localStorage quota) plus a 3-photo mini strip for the story card.

type SeedBrideInput = {
  id: string;
  display_name: string;
  quote: string;
  wedding_vibe?: string;
  hometown: string;
  wedding_city: string;
  wedding_date: string;
  partner_name: string;
  guest_count_range: CommunityProfile["guest_count_range"];
  looking_for: string[];
  wedding_events: WeddingEvent[];
  color_palette: ColorSwatch[];
  wedding_song?: string;
  fun_facts: Record<string, string>;
  cover_gradient: [string, string];
  cover_label: string;
  cover_photo_url?: string;
  photo_strip: {
    gradient: [string, string];
    label: string;
    type: ProfilePhoto["photo_type"];
    photo_url?: string;
  }[];
  is_experienced?: boolean;
  expertise_tags?: string[];
  here_to_help?: string;
};

function buildSeed(s: SeedBrideInput): {
  profile: CommunityProfile;
  photos: ProfilePhoto[];
} {
  const now = new Date().toISOString();
  const profile: CommunityProfile = {
    id: s.id,
    user_id: s.id,
    display_name: s.display_name,
    quote: s.quote,
    wedding_vibe: s.wedding_vibe,
    cover_seed_gradient: s.cover_gradient,
    cover_seed_label: s.cover_label,
    cover_photo_data_url: s.cover_photo_url,
    hometown: s.hometown,
    wedding_city: s.wedding_city,
    wedding_date: s.wedding_date,
    partner_name: s.partner_name,
    guest_count_range: s.guest_count_range,
    wedding_events: s.wedding_events,
    color_palette: s.color_palette,
    wedding_song: s.wedding_song,
    fun_facts: s.fun_facts,
    looking_for: s.looking_for,
    open_to_connect: true,
    is_experienced: s.is_experienced,
    expertise_tags: s.expertise_tags,
    here_to_help: s.here_to_help,
    is_seed: true,
    created_at: now,
    updated_at: now,
  };
  const photos: ProfilePhoto[] = s.photo_strip.map((p, idx) => ({
    id: `${s.id}-photo-${idx}`,
    seed_gradient: p.gradient,
    seed_label: p.label,
    sort_order: idx,
    photo_type: p.type,
    ...(p.photo_url ? { data_url: p.photo_url } : {}),
    created_at: now,
  }));
  return { profile, photos };
}

const SEEDS: SeedBrideInput[] = [
  {
    id: "seed-priya",
    display_name: "Priya",
    quote:
      "palace at dusk, marigolds everywhere, and my nani's recipes on the menu. three days of chaos and I'm here for all of it.",
    wedding_vibe: "palace at dusk, marigolds everywhere",
    hometown: "Dallas, TX",
    wedding_city: "Udaipur, India",
    wedding_date: "2026-11-14",
    partner_name: "Aarav",
    guest_count_range: "300-500",
    looking_for: [
      "destination-wedding",
      "decor-inspo",
      "mehendi-sangeet",
      "outfit-ideas",
    ],
    wedding_events: ["mehendi", "sangeet", "wedding", "reception"],
    color_palette: [
      { name: "dusty rose", hex: "#DCAE96" },
      { name: "marigold gold", hex: "#C9A227" },
      { name: "ivory", hex: "#F4ECDC" },
    ],
    wedding_song: "Kesariya — it's been ours since the second date",
    fun_facts: {
      how_we_met:
        "Bumped into each other at a coffee shop in Bishop Arts. Literally. He spilled my oat milk latte.",
      planning_vibe: "Spreadsheet queen 📊 and proud of it.",
      biggest_win: "Found my dream lehenga on the first try — Sabyasachi Mumbai.",
      current_panic: "Seating chart. Always the seating chart.",
    },
    cover_gradient: ["#F2D9B8", "#B8755D"],
    cover_label: "priya & aarav",
    cover_photo_url: "/images/portfolio/best/best-01.jpg",
    photo_strip: [
      {
        gradient: ["#EFD4B0", "#A37355"],
        label: "engagement",
        type: "engagement",
        photo_url: "/images/portfolio/pre-wedding/pre-01.jpg",
      },
      { gradient: ["#E8BC80", "#8B5A2B"], label: "udaipur", type: "venue", photo_url: "/images/portfolio/wedding/wedding-04.jpg" },
      { gradient: ["#F5D7C4", "#C88A68"], label: "lehenga", type: "outfit", photo_url: "/images/portfolio/portrait/portrait-01.jpg" },
    ],
  },
  {
    id: "seed-meera",
    display_name: "Meera",
    quote:
      "barefoot mandap, banana-leaf sadhya, and my mom's courtyard strung with jasmine. I want it to feel like a family dinner that accidentally became a wedding.",
    wedding_vibe: "backyard sadhya, barefoot mandap",
    hometown: "San Francisco, CA",
    wedding_city: "Kochi, India",
    wedding_date: "2026-09-02",
    partner_name: "Rohan",
    guest_count_range: "under-50",
    looking_for: ["cultural-traditions", "emotional-support", "budget-talk"],
    wedding_events: ["mehendi", "wedding", "reception"],
    color_palette: [
      { name: "jasmine white", hex: "#F6F1E3" },
      { name: "temple gold", hex: "#A9762B" },
      { name: "banana leaf", hex: "#4A5D3F" },
    ],
    wedding_song: "Vaathi Coming — it's a vibe, I don't make the rules",
    fun_facts: {
      how_we_met:
        "Grad school at Berkeley. He was in the Econ library for a month straight before he said hi.",
      planning_vibe: "Minimalist. If it doesn't fit on one whiteboard, it's out.",
      biggest_win:
        "Convinced both families that 40 people is not rude, it's intentional.",
      current_panic: "The monsoon. We're counting on it to be dramatic, not disastrous.",
    },
    cover_gradient: ["#E8DDBE", "#4A5D3F"],
    cover_label: "meera & rohan",
    cover_photo_url: "/images/portfolio/wedding/wedding-02.jpg",
    photo_strip: [
      { gradient: ["#D9E3C6", "#4A5D3F"], label: "venue", type: "venue", photo_url: "/images/portfolio/wedding/wedding-05.jpg" },
      { gradient: ["#F3E9CC", "#A9762B"], label: "sadhya", type: "decor", photo_url: "/images/portfolio/haldi/haldi-02.jpg" },
      { gradient: ["#ECE0B8", "#7A5A2B"], label: "mehendi", type: "mehendi", photo_url: "/images/portfolio/mehendi/mehendi-01.jpg" },
    ],
  },
  {
    id: "seed-tara",
    display_name: "Tara",
    quote:
      "two ceremonies in one long weekend — a punjabi morning and a tamil sunset. I've never been more tired or more excited in my life.",
    wedding_vibe: "two traditions, one weekend",
    hometown: "Toronto, ON",
    wedding_city: "Mumbai, India",
    wedding_date: "2027-02-20",
    partner_name: "Karthik",
    guest_count_range: "200-300",
    looking_for: ["outfit-ideas", "vendor-recs", "cultural-traditions"],
    wedding_events: ["mehendi", "sangeet", "wedding", "reception"],
    color_palette: [
      { name: "temple red", hex: "#A8321F" },
      { name: "kanjivaram gold", hex: "#B8860B" },
      { name: "sandalwood", hex: "#C9A581" },
    ],
    wedding_song: "Tum Hi Ho — classic, sorry not sorry",
    fun_facts: {
      how_we_met:
        "Same consulting firm, different floors. Small talk in the elevator became four years of small talk.",
      planning_vibe: "Organized chaos. Pinterest board is 400 pins deep.",
      biggest_win: "Pandit for BOTH ceremonies locked down before the venue.",
      current_panic: "Outfit fittings in two cities. My tailor hates me.",
      unpopular_opinion: "Chair covers are never worth it. Hills will be died on.",
    },
    cover_gradient: ["#F2D5C4", "#A8321F"],
    cover_label: "tara & karthik",
    cover_photo_url: "/images/portfolio/best/best-05.jpg",
    photo_strip: [
      { gradient: ["#F4DCC6", "#B8860B"], label: "outfits", type: "outfit", photo_url: "/images/portfolio/portrait/portrait-02.jpg" },
      { gradient: ["#EDD3BA", "#A8321F"], label: "mumbai", type: "venue", photo_url: "/images/portfolio/wedding/wedding-03.jpg" },
      {
        gradient: ["#E8C9A8", "#8B5A3D"],
        label: "bridal party",
        type: "bridal_party",
        photo_url: "/images/portfolio/sangeet/sangeet-02.jpg",
      },
    ],
  },
  {
    id: "seed-aisha",
    display_name: "Aisha",
    quote:
      "warm garden nikah at golden hour, lanterns for the walima, and enough biryani to feed the neighborhood. that's the whole plan.",
    wedding_vibe: "warm garden nikah, lantern-lit walima",
    hometown: "Houston, TX",
    wedding_city: "Houston, TX",
    wedding_date: "2026-09-19",
    partner_name: "Zain",
    guest_count_range: "100-200",
    looking_for: ["vendor-recs", "mehendi-sangeet", "outfit-ideas"],
    wedding_events: ["mehendi", "wedding", "reception"],
    color_palette: [
      { name: "sage", hex: "#9AAE8A" },
      { name: "terracotta", hex: "#B8755D" },
      { name: "lantern gold", hex: "#D6A85C" },
    ],
    wedding_song: "Pehla Nasha — we had our first dance to it already, don't tell anyone",
    fun_facts: {
      how_we_met:
        "Our moms set us up. Reluctantly on both sides. It's been two years and we're still a little smug about it.",
      planning_vibe: "List in my Notes app. Updated at 2am. Chaotic good.",
      biggest_win: "Booked our mehendi artist a full year out. Worth the deposit.",
      current_panic: "80 hands to henna in one afternoon. We need more artists.",
    },
    cover_gradient: ["#DFEAD0", "#B8755D"],
    cover_label: "aisha & zain",
    cover_photo_url: "/images/portfolio/mehendi/mehendi-02.jpg",
    photo_strip: [
      { gradient: ["#E8DCC0", "#B8755D"], label: "garden", type: "venue", photo_url: "/images/portfolio/best/best-08.jpg" },
      { gradient: ["#F0D9B6", "#8A5444"], label: "mehendi", type: "mehendi", photo_url: "/images/portfolio/mehendi/mehendi-03.jpg" },
      { gradient: ["#D8C4AE", "#9AAE8A"], label: "lanterns", type: "decor", photo_url: "/images/portfolio/haldi/haldi-03.jpg" },
    ],
  },
  {
    id: "seed-sneha",
    display_name: "Sneha",
    quote:
      "four days, two pandits, three venues. a telugu-malayali mash-up that made both families cry (in a good way, mostly).",
    wedding_vibe: "two families, one long weekend",
    hometown: "Plano, TX",
    wedding_city: "Plano, TX",
    wedding_date: "2026-06-05",
    partner_name: "Arjun",
    guest_count_range: "300-500",
    looking_for: [
      "cultural-traditions",
      "vendor-recs",
      "emotional-support",
      "bridal-party",
    ],
    wedding_events: ["mehendi", "haldi", "sangeet", "wedding", "reception"],
    color_palette: [
      { name: "turmeric", hex: "#D6A23A" },
      { name: "forest", hex: "#4A5D3F" },
      { name: "champagne", hex: "#EFD8B4" },
    ],
    wedding_song: "Rasiya — from the college days",
    fun_facts: {
      how_we_met: "Same grad program at UT Austin. He borrowed my notes and never gave them back.",
      planning_vibe: "Type-A Gantt chart energy. Sorry, I'm the difficult bride.",
      biggest_win: "Got both pandits on a WhatsApp group. They've exchanged recipes.",
      current_panic: "The sangeet choreography. My cousin is a drill sergeant.",
    },
    cover_gradient: ["#F3E3B7", "#4A5D3F"],
    cover_label: "sneha & arjun",
    cover_photo_url: "/images/portfolio/sangeet/sangeet-03.jpg",
    photo_strip: [
      { gradient: ["#EDD8A4", "#D6A23A"], label: "haldi", type: "decor", photo_url: "/images/portfolio/haldi/haldi-01.jpg" },
      {
        gradient: ["#DEE4C8", "#4A5D3F"],
        label: "mandap",
        type: "venue",
        photo_url: "/images/portfolio/wedding/wedding-01.jpg",
      },
      { gradient: ["#F1DCB2", "#A07E43"], label: "family", type: "bridal_party", photo_url: "/images/portfolio/portrait/portrait-03.jpg" },
    ],
  },
  {
    id: "seed-isha",
    display_name: "Isha",
    quote:
      "mandap going up between the oak trees in my parents' backyard, autumn leaves turning for the ceremony. sattvic menu and everyone in their socks on the deck.",
    wedding_vibe: "backyard mandap, oak leaves turning",
    hometown: "Edison, NJ",
    wedding_city: "Princeton, NJ",
    wedding_date: "2026-10-10",
    partner_name: "Dev",
    guest_count_range: "100-200",
    looking_for: ["vendor-recs", "decor-inspo", "budget-talk"],
    wedding_events: ["haldi", "wedding", "reception"],
    color_palette: [
      { name: "rust", hex: "#B8612A" },
      { name: "oak", hex: "#6F5A45" },
      { name: "bone", hex: "#EEE3D2" },
    ],
    wedding_song: "Agar Tum Saath Ho — still the softest one we have",
    fun_facts: {
      how_we_met: "Mutual friend's rooftop party in Jersey City. He made me laugh at a bad joke.",
      planning_vibe: "Whiteboard + index cards. I'm 34 going on 64.",
      biggest_win: "Found a sattvic caterer who GETS it. Took six calls.",
      current_panic: "An early frost. October in Jersey is a gamble.",
      best_vendor_find: "Our florist does foraged arrangements. Pine branches and all.",
    },
    cover_gradient: ["#F2E0C4", "#6F5A45"],
    cover_label: "isha & dev",
    cover_photo_url: "/images/portfolio/best/best-09.jpg",
    photo_strip: [
      { gradient: ["#E5CFA9", "#B8612A"], label: "backyard", type: "venue", photo_url: "/images/portfolio/pre-wedding/pre-03.jpg" },
      { gradient: ["#E8D9BB", "#6F5A45"], label: "tablescape", type: "decor", photo_url: "/images/portfolio/best/best-11.jpg" },
      { gradient: ["#D7BE95", "#A08058"], label: "haldi", type: "decor", photo_url: "/images/portfolio/haldi/haldi-04.jpg" },
    ],
  },
  // ── Experienced brides ────────────────────────────────────────────────────
  // Women who've already had their weddings and stick around to mentor the
  // next wave. Wedding dates are in the past; `is_experienced` flips the
  // story card into circle-guide mode. `here_to_help` is the short pitch.
  {
    id: "seed-nisha",
    display_name: "Nisha",
    quote:
      "got married in a tiny farmhouse wedding during a thunderstorm. it was chaotic and perfect and cost less than our honeymoon. happy to talk budgets and how to let go of the plan.",
    wedding_vibe: "farmhouse wedding, thunderstorm-tested",
    hometown: "Austin, TX",
    wedding_city: "Austin, TX",
    wedding_date: "2025-06-14",
    partner_name: "Vikram",
    guest_count_range: "50-100",
    looking_for: ["budget-talk", "emotional-support", "vendor-recs"],
    wedding_events: ["mehendi", "wedding", "reception"],
    color_palette: [
      { name: "sage", hex: "#9AAE8A" },
      { name: "terracotta", hex: "#B8755D" },
      { name: "cream", hex: "#F4ECDC" },
    ],
    fun_facts: {
      biggest_win:
        "Cut 40% off the floral budget by doing two big installations instead of 14 centerpieces. Nobody noticed. Everyone complimented the mandap.",
      unpopular_opinion:
        "Your wedding website does NOT need a countdown timer. It stresses you out more than your guests.",
    },
    cover_gradient: ["#E8DDBE", "#7A8B6B"],
    cover_label: "nisha & vikram",
    cover_photo_url: "/images/portfolio/best/best-03.jpg",
    photo_strip: [
      { gradient: ["#DFEAD0", "#7A8B6B"], label: "mandap", type: "venue", photo_url: "/images/portfolio/wedding/wedding-06.jpg" },
      { gradient: ["#F0D9B8", "#B8755D"], label: "mehendi", type: "mehendi", photo_url: "/images/portfolio/mehendi/mehendi-01.jpg" },
      { gradient: ["#E8D9BB", "#9AAE8A"], label: "reception", type: "decor", photo_url: "/images/portfolio/wedding/wedding-07.jpg" },
    ],
    is_experienced: true,
    expertise_tags: ["budget planning", "small weddings", "rain plans"],
    here_to_help:
      "small weddings that don't feel small, and how to make peace with the budget spreadsheet.",
  },
  {
    id: "seed-divya",
    display_name: "Divya",
    quote:
      "had a 500-person punjabi wedding in delhi with guests flying in from three continents. it's doable. it's also the reason i drink coffee with two shots now. ask me anything.",
    wedding_vibe: "big fat destination, three-continent logistics",
    hometown: "Chicago, IL",
    wedding_city: "New Delhi, India",
    wedding_date: "2024-12-08",
    partner_name: "Ravi",
    guest_count_range: "500-plus",
    looking_for: ["destination-wedding", "cultural-traditions", "vendor-recs"],
    wedding_events: ["mehendi", "sangeet", "haldi", "baraat", "wedding", "reception"],
    color_palette: [
      { name: "maroon", hex: "#7A2C2C" },
      { name: "burnt gold", hex: "#B8860B" },
      { name: "ivory", hex: "#F4ECDC" },
    ],
    wedding_song: "Mehndi Laga Ke Rakhna — the only correct answer",
    fun_facts: {
      biggest_win:
        "Got a single WhatsApp broadcast list of 500 guests and used it like an air traffic controller. Saved my sanity.",
      current_panic: "None anymore. The panic died with me. I'm a ghost now.",
    },
    cover_gradient: ["#F2D5C4", "#7A2C2C"],
    cover_label: "divya & ravi",
    cover_photo_url: "/images/portfolio/baraat/baraat-01.jpg",
    photo_strip: [
      { gradient: ["#F4DCC6", "#B8860B"], label: "baraat", type: "outfit", photo_url: "/images/portfolio/baraat/baraat-02.jpg" },
      { gradient: ["#EDD3BA", "#7A2C2C"], label: "delhi", type: "venue", photo_url: "/images/portfolio/wedding/wedding-04.jpg" },
      {
        gradient: ["#E8C9A8", "#8B5A3D"],
        label: "sangeet",
        type: "bridal_party",
        photo_url: "/images/portfolio/sangeet/sangeet-01.jpg",
      },
    ],
    is_experienced: true,
    expertise_tags: ["destination weddings", "indian weddings", "big guest counts"],
    here_to_help:
      "destination logistics, hotel blocks, and how to survive a five-day wedding without losing your voice.",
  },
  {
    id: "seed-kavita",
    display_name: "Kavita",
    quote:
      "intercaste tamil–gujarati wedding with two pandits, two menus, and two moms who learned to love each other by year three. family dynamics? my specialty now.",
    wedding_vibe: "two-pandit, two-menu, two-family diplomacy",
    hometown: "New York, NY",
    wedding_city: "Jersey City, NJ",
    wedding_date: "2023-10-21",
    partner_name: "Aniket",
    guest_count_range: "200-300",
    looking_for: ["cultural-traditions", "emotional-support"],
    wedding_events: ["mehendi", "sangeet", "wedding", "reception"],
    color_palette: [
      { name: "dusty rose", hex: "#DCAE96" },
      { name: "kanjivaram green", hex: "#4A5D3F" },
      { name: "gold", hex: "#C9A227" },
    ],
    fun_facts: {
      biggest_win:
        "Wrote a one-page 'what to expect' doc for both sides of the family before the mehendi. Defused so many potential arguments.",
      unpopular_opinion:
        "Skip the welcome dinner. Your guests just flew in. Order food to the hotel rooms and start fresh the next morning.",
    },
    cover_gradient: ["#F3E3B7", "#4A5D3F"],
    cover_label: "kavita & aniket",
    cover_photo_url: "/images/portfolio/best/best-12.jpg",
    photo_strip: [
      { gradient: ["#EDD8A4", "#C9A227"], label: "ceremony", type: "venue", photo_url: "/images/portfolio/wedding/wedding-03.jpg" },
      {
        gradient: ["#DEE4C8", "#4A5D3F"],
        label: "families",
        type: "bridal_party",
        photo_url: "/images/portfolio/portrait/portrait-04.jpg",
      },
      { gradient: ["#F1DCB2", "#A07E43"], label: "sangeet", type: "decor", photo_url: "/images/portfolio/sangeet/sangeet-04.jpg" },
    ],
    is_experienced: true,
    expertise_tags: ["intercultural weddings", "family dynamics", "multi-ceremony"],
    here_to_help:
      "blending two families, two traditions, and the in-law diplomacy that nobody warns you about.",
  },
  {
    id: "seed-laila",
    display_name: "Laila",
    quote:
      "pakistani-american wedding spread over four events and two cities. by the walima i had fully lost the ability to form sentences. 10/10, would do it again. ask me about vendors.",
    wedding_vibe: "four-event pakistani wedding marathon",
    hometown: "Los Angeles, CA",
    wedding_city: "Los Angeles, CA",
    wedding_date: "2024-04-27",
    partner_name: "Bilal",
    guest_count_range: "300-500",
    looking_for: ["vendor-recs", "outfit-ideas", "mehendi-sangeet"],
    wedding_events: ["mehendi", "sangeet", "wedding", "reception"],
    color_palette: [
      { name: "rose pink", hex: "#D9A0A5" },
      { name: "deep emerald", hex: "#2F5D4F" },
      { name: "pearl", hex: "#EFE8DC" },
    ],
    wedding_song: "Tere Bina — walima entrance. I still cry.",
    fun_facts: {
      biggest_win:
        "Hired a day-of coordinator on top of our planner. Best money I spent. She handled 40 aunties asking for receipts while i was getting photos.",
      best_vendor_find:
        "My mehendi artist did 60 hands in 4 hours with two assistants and didn't miss a detail. I still recommend her weekly.",
    },
    cover_gradient: ["#F3D5D8", "#2F5D4F"],
    cover_label: "laila & bilal",
    cover_photo_url: "/images/portfolio/portrait/portrait-05.jpg",
    photo_strip: [
      { gradient: ["#E8C0C3", "#D9A0A5"], label: "nikah", type: "venue", photo_url: "/images/portfolio/wedding/wedding-02.jpg" },
      { gradient: ["#D8E4D0", "#2F5D4F"], label: "walima", type: "decor", photo_url: "/images/portfolio/wedding/wedding-05.jpg" },
      { gradient: ["#F0DFB8", "#B8955D"], label: "mehendi", type: "mehendi", photo_url: "/images/portfolio/mehendi/mehendi-04.jpg" },
    ],
    is_experienced: true,
    expertise_tags: ["pakistani weddings", "multi-event planning", "mehendi"],
    here_to_help:
      "vendor vetting for long multi-day weddings and how to actually enjoy your own events.",
  },
];

const BUILT_SEEDS = SEEDS.map(buildSeed);
export const SEED_BRIDES: CommunityProfile[] = BUILT_SEEDS.map((b) => b.profile);
export const SEED_BRIDE_PHOTOS: ProfilePhoto[] = BUILT_SEEDS.flatMap((b) =>
  b.photos.map((p, i) => ({ ...p, _profile_id: b.profile.id } as ProfilePhoto & { _profile_id: string })),
);

// Associating seed photos with their profile id at a top-level so the store
// can ingest them together.
export const SEED_BRIDE_PHOTOS_BY_PROFILE: Record<string, ProfilePhoto[]> =
  BUILT_SEEDS.reduce(
    (acc, b) => {
      acc[b.profile.id] = b.photos;
      return acc;
    },
    {} as Record<string, ProfilePhoto[]>,
  );

// ── Sample meetups ─────────────────────────────────────────────────────────
// Two Ananya-organized meetups so Discover's meetups banner and the Meetups
// sub-tab have something real-feeling on first load. One is local, one is
// virtual, and one is an external bridal market.

function seedMeetup(m: Omit<Meetup, "is_seed" | "created_at" | "updated_at">): Meetup {
  const now = new Date().toISOString();
  return { ...m, is_seed: true, created_at: now, updated_at: now };
}

// Build dates relative to today so seeds never look expired.
function plusDays(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() + d);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

export const SEED_MEETUPS: Meetup[] = [
  seedMeetup({
    id: "seed-meetup-nov-brides",
    organizer_type: "ananya",
    title: "november brides coffee — dallas",
    description:
      "casual coffee for anyone getting married in oct / nov / dec 2026. drop in for 30 minutes or stay for two hours — whatever you've got. talk vendors, talk panic, talk lehengas.",
    cover_seed_gradient: ["#F0D9B8", "#8A5444"],
    cover_image_data_url: "/images/portfolio/wedding/wedding-04.jpg",
    meetup_type: "coffee_chat",
    city: "Dallas",
    state: "TX",
    venue_name: "Merit Coffee — Deep Ellum",
    venue_address: "2704 Main St, Dallas, TX 75226",
    is_virtual: false,
    starts_at: plusDays(7),
    ends_at: plusDays(7),
    max_attendees: 8,
    status: "upcoming",
    target_wedding_months: ["2026-10", "2026-11", "2026-12"],
    target_interests: [],
  }),
  seedMeetup({
    id: "seed-meetup-dec-brunch",
    organizer_type: "ananya",
    title: "december brides brunch — plano",
    description:
      "a larger group, longer table, more pancakes. december + january brides welcome. we'll put the reservation under ananya.",
    cover_seed_gradient: ["#F2E4CF", "#B8755D"],
    cover_image_data_url: "/images/portfolio/best/best-06.jpg",
    meetup_type: "brunch",
    city: "Plano",
    state: "TX",
    venue_name: "Maple Leaf Diner",
    venue_address: "4000 W 15th St, Plano, TX 75093",
    is_virtual: false,
    starts_at: plusDays(21),
    ends_at: plusDays(21),
    max_attendees: 16,
    status: "upcoming",
    target_wedding_months: ["2026-12", "2027-01", "2027-02"],
    target_interests: [],
  }),
  seedMeetup({
    id: "seed-meetup-dallas-bridal-show",
    organizer_type: "ananya",
    title: "dallas bridal show at gilley's",
    description:
      "the twice-a-year bridal show at gilley's — vendors, tastings, live demos. we'll cluster at the entrance at 11am saturday for anyone who wants to walk the floor together.",
    cover_seed_gradient: ["#EDE0C2", "#6E6354"],
    cover_image_data_url: "/images/portfolio/best/best-07.jpg",
    meetup_type: "wedding_market",
    city: "Dallas",
    state: "TX",
    venue_name: "Gilley's Dallas",
    venue_address: "1135 S Lamar St, Dallas, TX 75215",
    is_virtual: false,
    starts_at: plusDays(45),
    ends_at: plusDays(46),
    status: "upcoming",
    target_wedding_months: [],
    target_interests: ["vendor-recs", "venue-hunting"],
  }),
  seedMeetup({
    id: "seed-meetup-destination-virtual",
    organizer_type: "ananya",
    title: "destination wedding planning — virtual call",
    description:
      "open to anyone planning in india, mexico, italy, or anywhere else that requires airline logistics. we'll compare notes on visas, travel blocks, and the 'when do you actually book flights' question.",
    cover_seed_gradient: ["#E4C8A8", "#8B5A2B"],
    cover_image_data_url: "/images/portfolio/pre-wedding/pre-02.jpg",
    meetup_type: "virtual_hangout",
    city: "Virtual",
    is_virtual: true,
    virtual_link: "https://meet.example.com/ananya-destination",
    starts_at: plusDays(14),
    ends_at: plusDays(14),
    status: "upcoming",
    target_wedding_months: [],
    target_interests: ["destination-wedding"],
  }),
];

// ── Huddles ────────────────────────────────────────────────────────────────
// One live huddle (so the Discover "live now" strip has something to render
// on first load) and one scheduled huddle (so the scheduled card state is
// also exercised). Participants + a handful of chat messages populate the
// room so a newcomer drops into an ongoing conversation.

function huddleNow(): string {
  return new Date().toISOString();
}

function huddleMinutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

function huddleInHours(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() + h, 0, 0, 0);
  return d.toISOString();
}

export const SEED_HUDDLES: Huddle[] = [
  {
    id: "seed-huddle-nov-vendor-chat",
    host_id: "seed-priya",
    title: "november brides — vendor chat",
    description:
      "anyone in the vendor-hunting phase — come swap notes. pollen floral, kismet events, whoever.",
    topic_tags: ["vendor-recs", "venue-hunting"],
    huddle_type: "instant",
    status: "live",
    started_at: huddleMinutesAgo(18),
    max_participants: 12,
    city: "Dallas",
    target_wedding_months: ["2026-10", "2026-11", "2026-12"],
    is_open: true,
    is_seed: true,
    created_at: huddleMinutesAgo(20),
    updated_at: huddleMinutesAgo(18),
  },
  {
    id: "seed-huddle-destination-planning",
    host_id: "seed-tara",
    title: "destination wedding planning — open call",
    description:
      "visas, travel blocks, when to actually lock flight dates. india/mexico/italy brides welcome.",
    topic_tags: ["destination-wedding"],
    huddle_type: "scheduled",
    scheduled_at: huddleInHours(28),
    status: "waiting",
    max_participants: 12,
    target_wedding_months: [],
    is_open: true,
    is_seed: true,
    created_at: huddleMinutesAgo(120),
    updated_at: huddleMinutesAgo(120),
  },
];

export const SEED_HUDDLE_PARTICIPANTS: HuddleParticipant[] = [
  {
    id: "seed-huddle-p1",
    huddle_id: "seed-huddle-nov-vendor-chat",
    profile_id: "seed-priya",
    status: "in_room",
    has_video: false,
    mic_on: true,
    joined_at: huddleMinutesAgo(18),
  },
  {
    id: "seed-huddle-p2",
    huddle_id: "seed-huddle-nov-vendor-chat",
    profile_id: "seed-meera",
    status: "in_room",
    has_video: false,
    mic_on: true,
    joined_at: huddleMinutesAgo(15),
  },
  {
    id: "seed-huddle-p3",
    huddle_id: "seed-huddle-nov-vendor-chat",
    profile_id: "seed-aisha",
    status: "in_room",
    has_video: false,
    mic_on: false,
    joined_at: huddleMinutesAgo(9),
  },
  {
    id: "seed-huddle-p4",
    huddle_id: "seed-huddle-destination-planning",
    profile_id: "seed-tara",
    status: "invited",
    has_video: false,
    mic_on: true,
    joined_at: huddleMinutesAgo(120),
  },
  {
    id: "seed-huddle-p5",
    huddle_id: "seed-huddle-destination-planning",
    profile_id: "seed-meera",
    status: "invited",
    has_video: false,
    mic_on: true,
    joined_at: huddleMinutesAgo(90),
  },
];

export const SEED_HUDDLE_MESSAGES: HuddleMessage[] = [
  {
    id: "seed-huddle-msg1",
    huddle_id: "seed-huddle-nov-vendor-chat",
    sender_id: "seed-priya",
    body: "has anyone actually used Pollen Floral for décor?",
    created_at: huddleMinutesAgo(14),
  },
  {
    id: "seed-huddle-msg2",
    huddle_id: "seed-huddle-nov-vendor-chat",
    sender_id: "seed-meera",
    body: "yes! they did our sangeet — really good with mandap designs. will share the planner's number.",
    created_at: huddleMinutesAgo(12),
  },
  {
    id: "seed-huddle-msg3",
    huddle_id: "seed-huddle-nov-vendor-chat",
    sender_id: "seed-aisha",
    body: "they were on my shortlist — how was pricing vs kismet?",
    created_at: huddleMinutesAgo(7),
  },
  {
    id: "seed-huddle-msg4",
    huddle_id: "seed-huddle-nov-vendor-chat",
    sender_id: "seed-meera",
    body: "pollen was ~20% less for us but kismet did more on-site day-of which mattered. depends on your setup.",
    created_at: huddleMinutesAgo(5),
  },
];

// Pre-populated RSVPs so the attendee counts in the UI don't all read zero.
export const SEED_MEETUP_RSVPS = [
  { meetup_id: "seed-meetup-nov-brides", profile_id: "seed-priya" },
  { meetup_id: "seed-meetup-nov-brides", profile_id: "seed-sneha" },
  { meetup_id: "seed-meetup-nov-brides", profile_id: "seed-aisha" },
  { meetup_id: "seed-meetup-dec-brunch", profile_id: "seed-aisha" },
  { meetup_id: "seed-meetup-dec-brunch", profile_id: "seed-priya" },
  { meetup_id: "seed-meetup-dec-brunch", profile_id: "seed-tara" },
  { meetup_id: "seed-meetup-dec-brunch", profile_id: "seed-isha" },
  { meetup_id: "seed-meetup-dec-brunch", profile_id: "seed-meera" },
  { meetup_id: "seed-meetup-dallas-bridal-show", profile_id: "seed-priya" },
  { meetup_id: "seed-meetup-dallas-bridal-show", profile_id: "seed-sneha" },
  { meetup_id: "seed-meetup-destination-virtual", profile_id: "seed-priya" },
  { meetup_id: "seed-meetup-destination-virtual", profile_id: "seed-tara" },
  { meetup_id: "seed-meetup-destination-virtual", profile_id: "seed-meera" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

export function getInterestTag(slug: string): InterestTag | undefined {
  return INTEREST_TAGS.find((t) => t.slug === slug);
}

export function getBlogCategory(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}

export function getProfilePrompt(slug: string): ProfilePrompt | undefined {
  return PROFILE_PROMPTS.find((p) => p.slug === slug);
}

// ── Discussion categories ──────────────────────────────────────────────────

export const DISCUSSION_CATEGORIES: DiscussionCategory[] = [
  {
    slug: "vendor_recs",
    label: "Vendor Recs",
    emoji: "⭐",
    description: "Recommendations & referrals",
    sort_order: 1,
  },
  {
    slug: "advice",
    label: "Advice",
    emoji: "💡",
    description: "General planning questions",
    sort_order: 2,
  },
  {
    slug: "budget",
    label: "Budget Talk",
    emoji: "💰",
    description: "Money, costs & budgeting",
    sort_order: 3,
  },
  {
    slug: "venues",
    label: "Venues",
    emoji: "🏰",
    description: "Venue questions & reviews",
    sort_order: 4,
  },
  {
    slug: "attire",
    label: "Attire & Style",
    emoji: "👗",
    description: "Outfits, jewelry, styling",
    sort_order: 5,
  },
  {
    slug: "decor_flowers",
    label: "Décor & Florals",
    emoji: "🌸",
    description: "Décor, flowers & design",
    sort_order: 6,
  },
  {
    slug: "food_catering",
    label: "Food & Catering",
    emoji: "🍽️",
    description: "Menus, catering & drinks",
    sort_order: 7,
  },
  {
    slug: "traditions",
    label: "Traditions",
    emoji: "🪔",
    description: "Cultural ceremonies & rituals",
    sort_order: 8,
  },
  {
    slug: "family",
    label: "Family & Guests",
    emoji: "👨‍👩‍👧‍👦",
    description: "Guest list, seating, family dynamics",
    sort_order: 9,
  },
  {
    slug: "destination",
    label: "Destination",
    emoji: "✈️",
    description: "Destination wedding logistics",
    sort_order: 10,
  },
  {
    slug: "diy",
    label: "DIY & Projects",
    emoji: "✂️",
    description: "DIY ideas & craft projects",
    sort_order: 11,
  },
  {
    slug: "emotional",
    label: "Support",
    emoji: "💛",
    description: "Emotional support & encouragement",
    sort_order: 12,
  },
  {
    slug: "meetup",
    label: "Meetups",
    emoji: "☕",
    description: "Organizing get-togethers",
    sort_order: 13,
  },
  {
    slug: "other",
    label: "Other",
    emoji: "💬",
    description: "Everything else",
    sort_order: 14,
  },
];

export function getDiscussionCategory(
  slug: string,
): DiscussionCategory | undefined {
  return DISCUSSION_CATEGORIES.find((c) => c.slug === slug);
}

// ── Seed discussions ───────────────────────────────────────────────────────

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

export const SEED_DISCUSSIONS: Omit<Discussion, "is_anonymous">[] = [
  {
    id: "seed-disc-mehendi-dfw",
    author_id: "seed-priya",
    title: "Does anyone have a great mehendi artist in the DFW area?",
    body: "I need someone who can do both traditional bridal and modern minimal designs. My wedding is in November and I need someone who can do ~15 guests at the mehendi event plus a full bridal session the day before. Budget is around $2,000–$3,000 for everything. Any leads would be gold.",
    category: "vendor_recs",
    city: "Dallas",
    state: "TX",
    reply_count: 2,
    last_reply_at: hoursAgo(1),
    is_pinned: false,
    is_locked: false,
    is_seed: true,
    created_at: hoursAgo(3),
    updated_at: hoursAgo(1),
  },
  {
    id: "seed-disc-plus-one",
    author_id: "seed-meera",
    title: "How do you handle the \u201cplus one\u201d conversation with family?",
    body: "My mom thinks every aunty's second cousin should get a plus one. I'm trying to keep it at 40 guests total. How are you all drawing this line without starting a war?",
    category: "family",
    reply_count: 3,
    last_reply_at: hoursAgo(6),
    is_pinned: false,
    is_locked: false,
    is_seed: true,
    created_at: daysAgo(1),
    updated_at: hoursAgo(6),
  },
  {
    id: "seed-disc-planning-alone",
    author_id: "seed-tara",
    title: "Anyone else feel like they're planning the wedding alone?",
    body: "My fiancé is wonderful but every time I ask him to pick between two shades of gold his eyes glaze over. I know it's normal but I just needed to say it out loud somewhere.",
    category: "emotional",
    reply_count: 2,
    last_reply_at: daysAgo(1),
    is_pinned: false,
    is_locked: false,
    is_seed: true,
    created_at: daysAgo(2),
    updated_at: daysAgo(1),
  },
  {
    id: "seed-disc-udaipur-logistics",
    author_id: "seed-priya",
    title: "Destination wedding in Udaipur — how did you handle out-of-town guests?",
    body: "We're planning 3 days in Udaipur, ~250 guests flying in from US/Canada. Looking for tips on hotel blocks, welcome bags, and transport between venues. Anyone been through this?",
    category: "destination",
    city: "Udaipur",
    reply_count: 1,
    last_reply_at: daysAgo(2),
    is_pinned: false,
    is_locked: false,
    is_seed: true,
    created_at: daysAgo(3),
    updated_at: daysAgo(2),
  },
  {
    id: "seed-disc-florals-budget",
    author_id: "seed-aisha",
    title: "What's a reasonable budget for florals for a 200-person wedding?",
    body: "Got a quote for $18k and I think that's wild but my mom thinks it's a steal. What did you all spend on flowers + décor?",
    category: "budget",
    reply_count: 0,
    is_pinned: false,
    is_locked: false,
    is_seed: true,
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
  },
];

export const SEED_DISCUSSION_REPLIES: Omit<DiscussionReply, "is_anonymous">[] = [
  {
    id: "seed-reply-mehendi-1",
    discussion_id: "seed-disc-mehendi-dfw",
    author_id: "seed-aisha",
    body: "I used **Henna by Nadia** for my wedding last year — she was incredible. She does both intricate bridal and the minimal style. @hennabynadia on Instagram. She was around $2,500 for 12 guests + bridal.",
    helpful_count: 8,
    is_seed: true,
    created_at: hoursAgo(2),
    updated_at: hoursAgo(2),
  },
  {
    id: "seed-reply-mehendi-2",
    discussion_id: "seed-disc-mehendi-dfw",
    author_id: "seed-meera",
    body: "Check out **Mehndi Magic**! They travel to DFW from Houston. A bit pricier but the quality is unreal.",
    helpful_count: 3,
    is_seed: true,
    created_at: hoursAgo(1),
    updated_at: hoursAgo(1),
  },
  {
    id: "seed-reply-plus-one-1",
    discussion_id: "seed-disc-plus-one",
    author_id: "seed-tara",
    body: "We set a rule: plus ones only for partners who've been dating our guests for 6+ months OR who are married/engaged. Wrote it on the website and pointed at it when family pushed back. Worked surprisingly well.",
    helpful_count: 14,
    is_seed: true,
    created_at: hoursAgo(20),
    updated_at: hoursAgo(20),
  },
  {
    id: "seed-reply-plus-one-2",
    discussion_id: "seed-disc-plus-one",
    author_id: "seed-aisha",
    body: "Honestly? I let my mom win on two of them and drew a hard line on the rest. Pick your battles. 💛",
    helpful_count: 6,
    is_seed: true,
    created_at: hoursAgo(14),
    updated_at: hoursAgo(14),
  },
  {
    id: "seed-reply-plus-one-3",
    discussion_id: "seed-disc-plus-one",
    author_id: "seed-priya",
    body: "Seating chart guilt is real. Solidarity.",
    helpful_count: 2,
    is_seed: true,
    created_at: hoursAgo(6),
    updated_at: hoursAgo(6),
  },
  {
    id: "seed-reply-alone-1",
    discussion_id: "seed-disc-planning-alone",
    author_id: "seed-meera",
    body: "Completely normal. Mine lights up for the food tasting and literally nothing else. I gave him the \"ceremony music\" track as his thing and suddenly he had opinions. Give them one lane.",
    helpful_count: 11,
    is_seed: true,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
  },
  {
    id: "seed-reply-alone-2",
    discussion_id: "seed-disc-planning-alone",
    author_id: "seed-aisha",
    body: "Sending you a huge hug. You're doing amazing. 💛",
    helpful_count: 5,
    is_seed: true,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  {
    id: "seed-reply-udaipur-1",
    discussion_id: "seed-disc-udaipur-logistics",
    author_id: "seed-tara",
    body: "Blocked rooms at two hotels (one luxe, one mid) so guests could pick. Charter buses between venues were a game-changer — don't rely on cabs. And welcome bags: bottled water + sunscreen + a small sweet. Simple wins.",
    helpful_count: 4,
    is_seed: true,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
  },
];

// ── Live events ────────────────────────────────────────────────────────────
// Scheduled sessions with featured wedding industry professionals. One is
// happening right now (so the "live now" state is exercised on first load),
// one is coming up in a few days (RSVPs + question board), and one is past
// (replay / recap state). Question votes are pre-populated so the question
// board reads as active.

function liveEventInHours(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() + h, 0, 0, 0);
  return d.toISOString();
}

function liveEventMinutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

function liveEventDaysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
}

export const SEED_FEATURED_GUESTS: FeaturedGuest[] = [
  {
    id: "seed-guest-marcy-blum",
    name: "Marcy Blum",
    title: "Celebrity Wedding Planner",
    bio: "Marcy has been planning weddings for over three decades — from $5K backyard ceremonies to seven-figure celebrity affairs. Her client list reads like a Vanity Fair index, but her approach is unpretentious: every wedding gets the same obsessive attention.",
    headshot_seed_gradient: ["#F0D9B8", "#8A5444"],
    headshot_initial: "M",
    cover_seed_gradient: ["#F5E6D0", "#B8755D"],
    cover_seed_label: "thirty years of weddings",
    credentials: [
      "500+ weddings planned",
      "Featured in Vogue, Martha Stewart Weddings",
      "Author of 'Wedding Planning for Dummies'",
    ],
    specialties: ["luxury weddings", "destination", "celebrity"],
    instagram_handle: "@marcyblum",
    website_url: "https://marcyblum.example.com",
    is_seed: true,
    created_at: liveEventDaysAgo(30),
  },
  {
    id: "seed-guest-sabyasachi-stylist",
    name: "Anisha Mehra",
    title: "Head Stylist · Sabyasachi Mukherjee Studio",
    bio: "Anisha has styled brides at Sabyasachi for seven years — from the shop floor consultations to the final fitting three days before the wedding. She's fluent in proportion, in silhouette, and in the quiet art of making a lehenga feel like yours.",
    headshot_seed_gradient: ["#E8C79B", "#6E4423"],
    headshot_initial: "A",
    cover_seed_gradient: ["#F1E0C6", "#8A5444"],
    cover_seed_label: "the cut, the drape, the moment",
    credentials: [
      "7 years at Sabyasachi",
      "Styled 200+ bridal lehengas",
      "Featured in Vogue India",
    ],
    specialties: ["bridal couture", "lehenga styling", "jewellery pairing"],
    instagram_handle: "@anisha.mehra",
    is_seed: true,
    created_at: liveEventDaysAgo(20),
  },
  {
    id: "seed-guest-jose-villa",
    name: "José Villa",
    title: "Wedding Photographer",
    bio: "José's photographs have shaped how a generation of brides imagine their own wedding — sun-drenched film frames that feel at once painterly and utterly true. He shoots weddings in Tuscany, Ojai, and Jaipur, and he's protective about the feeling more than the aesthetic.",
    headshot_seed_gradient: ["#DCC8A8", "#3A4452"],
    headshot_initial: "J",
    cover_seed_gradient: ["#EADBC2", "#5C463A"],
    cover_seed_label: "behind the lens",
    credentials: [
      "Martha Stewart Weddings cover",
      "Destination Weddings Hall of Fame",
      "Shoots exclusively on film",
    ],
    specialties: ["film photography", "destination", "editorial"],
    instagram_handle: "@josevillaphoto",
    is_seed: true,
    created_at: liveEventDaysAgo(15),
  },
  {
    id: "seed-guest-floral-designer",
    name: "Radhika Iyer",
    title: "Floral Designer · Pollen + Petal",
    bio: "Radhika runs a small floral studio out of a warehouse in Queens that somehow ends up doing mandaps in Udaipur and reception arches in the Hamptons. She's opinionated about proportion and allergic to tight budgets that pretend to be medium budgets.",
    headshot_seed_gradient: ["#F3D9C2", "#9C6F5D"],
    headshot_initial: "R",
    cover_seed_gradient: ["#F5E4CF", "#A0806B"],
    cover_seed_label: "on florals, honestly",
    credentials: [
      "Pollen + Petal founder",
      "Featured in The Knot, Brides Magazine",
      "200+ weddings in four countries",
    ],
    specialties: ["indian weddings", "mandap design", "reception installations"],
    instagram_handle: "@pollenandpetal",
    is_seed: true,
    created_at: liveEventDaysAgo(12),
  },
];

export const SEED_LIVE_EVENTS: LiveEvent[] = [
  {
    id: "seed-live-marcy-qa",
    title: "Ask Marcy Blum anything",
    subtitle: "thirty years of wedding planning wisdom",
    description:
      "Marcy has planned weddings for celebrities, royalty, and brides with $5K budgets alike — and she insists they all get the same amount of stress dreams the night before. Bring your toughest question. No topic is off limits: budget disasters, in-law diplomacy, that one vendor who's ghosting you.",
    cover_seed_gradient: ["#F0D9B8", "#8A5444"],
    cover_seed_label: "an evening with Marcy Blum",
    guest_id: "seed-guest-marcy-blum",
    moderator_name: "Ananya Studio",
    event_type: "qa",
    topics: ["vendor-recs", "budget-talk", "emotional-support"],
    starts_at: liveEventMinutesAgo(22),
    duration_minutes: 60,
    max_attendees: 150,
    is_free: true,
    status: "live",
    started_at: liveEventMinutesAgo(22),
    peak_attendees: 47,
    is_seed: true,
    created_at: liveEventDaysAgo(14),
    updated_at: liveEventMinutesAgo(22),
  },
  {
    id: "seed-live-lehenga-styling",
    title: "Lehenga styling with Sabyasachi's head stylist",
    subtitle: "a conversation on cut, proportion, and jewellery pairing",
    description:
      "Anisha has styled brides at Sabyasachi for seven years. She'll walk through how to read your own proportions, why the heaviness of a lehenga is more a feeling than a number, and how jewellery is a conversation with the fabric — not an afterthought. We'll show reference images and take live questions.",
    cover_seed_gradient: ["#F1E0C6", "#8A5444"],
    cover_seed_label: "bridal couture — live",
    guest_id: "seed-guest-sabyasachi-stylist",
    moderator_name: "Ananya Studio",
    event_type: "masterclass",
    topics: ["outfit-ideas", "cultural-traditions"],
    starts_at: liveEventInHours(52),
    duration_minutes: 75,
    max_attendees: 150,
    is_free: true,
    status: "upcoming",
    is_seed: true,
    created_at: liveEventDaysAgo(10),
    updated_at: liveEventDaysAgo(10),
  },
  {
    id: "seed-live-jose-photography",
    title: "Behind the lens — a conversation with José Villa",
    subtitle: "on shooting weddings, film, and the art of staying invisible",
    description:
      "Fireside-chat format: our founder sits down with José to talk about film photography, destination weddings, and why the best wedding photo is often the one you didn't know was being taken. Bring questions about your own shot list, your vendor timeline, or how to brief a photographer you haven't hired yet.",
    cover_seed_gradient: ["#EADBC2", "#5C463A"],
    cover_seed_label: "a fireside chat",
    guest_id: "seed-guest-jose-villa",
    moderator_name: "Ananya Studio",
    event_type: "conversation",
    topics: ["vendor-recs"],
    starts_at: liveEventInHours(8 * 24),
    duration_minutes: 60,
    max_attendees: 150,
    is_free: true,
    status: "upcoming",
    is_seed: true,
    created_at: liveEventDaysAgo(7),
    updated_at: liveEventDaysAgo(7),
  },
  {
    id: "seed-live-florals-past",
    title: "on florals, honestly — a live Q&A with Radhika Iyer",
    subtitle: "budget-friendly décor that doesn't look like budget décor",
    description:
      "Radhika walked through how to stretch a floral budget without it reading as 'we saved money here.' She covered seasonal substitutions, the real cost of an installation vs. standalone arrangements, and why she always pushes back on peony-heavy mandaps in August.",
    cover_seed_gradient: ["#F5E4CF", "#A0806B"],
    cover_seed_label: "décor, uncompromised",
    guest_id: "seed-guest-floral-designer",
    moderator_name: "Ananya Studio",
    event_type: "qa",
    topics: ["decor-inspo", "budget-talk"],
    starts_at: liveEventDaysAgo(12),
    duration_minutes: 60,
    max_attendees: 150,
    is_free: true,
    status: "ended",
    started_at: liveEventDaysAgo(12),
    ended_at: liveEventDaysAgo(12),
    peak_attendees: 62,
    recap_body:
      "Radhika spent 60 minutes on the honest mechanics of floral budgets — where the money actually goes, what brides think costs more than it does (single-stem centerpieces), and what's almost always under-budgeted (the mandap, installations above eye level, and anything that has to survive outdoors for more than two hours). Her single most-asked question: 'is it tacky to mix silk and real?' Her answer: only if it reads that way — which it won't, if your designer is good. 73 brides attended; 14 pre-submitted questions, 11 answered live.",
    is_seed: true,
    created_at: liveEventDaysAgo(25),
    updated_at: liveEventDaysAgo(12),
  },
];

export const SEED_LIVE_EVENT_RSVPS: LiveEventRsvp[] = [
  // Marcy Blum — live now — brides already in the room
  {
    id: "seed-live-rsvp-1",
    event_id: "seed-live-marcy-qa",
    profile_id: "seed-priya",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(8),
  },
  {
    id: "seed-live-rsvp-2",
    event_id: "seed-live-marcy-qa",
    profile_id: "seed-meera",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(6),
  },
  {
    id: "seed-live-rsvp-3",
    event_id: "seed-live-marcy-qa",
    profile_id: "seed-aisha",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(5),
  },
  {
    id: "seed-live-rsvp-4",
    event_id: "seed-live-marcy-qa",
    profile_id: "seed-tara",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(4),
  },
  {
    id: "seed-live-rsvp-5",
    event_id: "seed-live-marcy-qa",
    profile_id: "seed-sneha",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(4),
  },
  {
    id: "seed-live-rsvp-6",
    event_id: "seed-live-marcy-qa",
    profile_id: "seed-isha",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(3),
  },
  // Sabyasachi stylist — upcoming — strong RSVP list
  {
    id: "seed-live-rsvp-7",
    event_id: "seed-live-lehenga-styling",
    profile_id: "seed-priya",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(5),
  },
  {
    id: "seed-live-rsvp-8",
    event_id: "seed-live-lehenga-styling",
    profile_id: "seed-meera",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(5),
  },
  {
    id: "seed-live-rsvp-9",
    event_id: "seed-live-lehenga-styling",
    profile_id: "seed-aisha",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(4),
  },
  {
    id: "seed-live-rsvp-10",
    event_id: "seed-live-lehenga-styling",
    profile_id: "seed-sneha",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(3),
  },
  {
    id: "seed-live-rsvp-11",
    event_id: "seed-live-lehenga-styling",
    profile_id: "seed-isha",
    status: "maybe",
    remind_15min: false,
    created_at: liveEventDaysAgo(2),
  },
  // José Villa — upcoming — lighter RSVPs, farther out
  {
    id: "seed-live-rsvp-12",
    event_id: "seed-live-jose-photography",
    profile_id: "seed-priya",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(3),
  },
  {
    id: "seed-live-rsvp-13",
    event_id: "seed-live-jose-photography",
    profile_id: "seed-tara",
    status: "going",
    remind_15min: true,
    created_at: liveEventDaysAgo(2),
  },
];

export const SEED_LIVE_EVENT_QUESTIONS: LiveEventQuestion[] = [
  // Live — Marcy Blum
  {
    id: "seed-live-q-1",
    event_id: "seed-live-marcy-qa",
    asker_id: "seed-priya",
    body: "how do you handle it when the bride and her mother have completely different visions?",
    vote_count: 24,
    status: "selected",
    is_seed: true,
    created_at: liveEventDaysAgo(5),
  },
  {
    id: "seed-live-q-2",
    event_id: "seed-live-marcy-qa",
    asker_id: "seed-meera",
    body: "what's the single biggest mistake brides make with their budget?",
    vote_count: 18,
    status: "answered",
    is_seed: true,
    created_at: liveEventDaysAgo(4),
  },
  {
    id: "seed-live-q-3",
    event_id: "seed-live-marcy-qa",
    asker_id: "seed-tara",
    body: "is it worth hiring a day-of coordinator even if you already have a planner?",
    vote_count: 11,
    status: "pending",
    is_seed: true,
    created_at: liveEventDaysAgo(3),
  },
  {
    id: "seed-live-q-4",
    event_id: "seed-live-marcy-qa",
    asker_id: "seed-aisha",
    body: "how do you politely tell a family member no when they want to invite 40 more people two weeks out?",
    vote_count: 9,
    status: "pending",
    is_seed: true,
    created_at: liveEventDaysAgo(2),
  },
  {
    id: "seed-live-q-5",
    event_id: "seed-live-marcy-qa",
    asker_id: "seed-sneha",
    body: "what's one thing you always recommend brides skip?",
    vote_count: 7,
    status: "pending",
    is_seed: true,
    created_at: liveEventDaysAgo(1),
  },
  // Upcoming — Sabyasachi stylist
  {
    id: "seed-live-q-6",
    event_id: "seed-live-lehenga-styling",
    asker_id: "seed-priya",
    body: "how do i figure out what silhouette actually works on me without spending three afternoons in a shop?",
    vote_count: 15,
    status: "pending",
    is_seed: true,
    created_at: liveEventDaysAgo(4),
  },
  {
    id: "seed-live-q-7",
    event_id: "seed-live-lehenga-styling",
    asker_id: "seed-meera",
    body: "how do you think about jewellery when you've already picked the lehenga — do you match or contrast?",
    vote_count: 12,
    status: "pending",
    is_seed: true,
    created_at: liveEventDaysAgo(3),
  },
  {
    id: "seed-live-q-8",
    event_id: "seed-live-lehenga-styling",
    asker_id: "seed-aisha",
    body: "is it too much to wear a red lehenga for the reception too, or should i change?",
    vote_count: 8,
    status: "pending",
    is_seed: true,
    created_at: liveEventDaysAgo(2),
  },
  // Upcoming — José Villa
  {
    id: "seed-live-q-9",
    event_id: "seed-live-jose-photography",
    asker_id: "seed-tara",
    body: "what's the one shot that brides always forget to ask for?",
    vote_count: 6,
    status: "pending",
    is_seed: true,
    created_at: liveEventDaysAgo(2),
  },
  {
    id: "seed-live-q-10",
    event_id: "seed-live-jose-photography",
    asker_id: "seed-priya",
    body: "how early should we book a destination photographer?",
    vote_count: 4,
    status: "pending",
    is_seed: true,
    created_at: liveEventDaysAgo(1),
  },
];

export const SEED_LIVE_EVENT_CHAT: LiveEventChatMessage[] = [
  {
    id: "seed-live-chat-1",
    event_id: "seed-live-marcy-qa",
    profile_id: "seed-priya",
    body: "this is SO helpful, thank you Marcy 💛",
    kind: "message",
    created_at: liveEventMinutesAgo(14),
  },
  {
    id: "seed-live-chat-2",
    event_id: "seed-live-marcy-qa",
    profile_id: "seed-meera",
    body: "can you talk about timelines for a 300+ guest wedding?",
    kind: "message",
    created_at: liveEventMinutesAgo(11),
  },
  {
    id: "seed-live-chat-3",
    event_id: "seed-live-marcy-qa",
    profile_id: "seed-aisha",
    body: "taking notes like my life depends on it",
    kind: "message",
    created_at: liveEventMinutesAgo(8),
  },
  {
    id: "seed-live-chat-4",
    event_id: "seed-live-marcy-qa",
    profile_id: "seed-tara",
    body: "the part about day-of coordinator vs planner is changing my brain",
    kind: "message",
    created_at: liveEventMinutesAgo(5),
  },
  {
    id: "seed-live-chat-5",
    event_id: "seed-live-marcy-qa",
    profile_id: "seed-sneha",
    body: "❤️ ❤️ ❤️",
    kind: "reaction",
    created_at: liveEventMinutesAgo(2),
  },
];
