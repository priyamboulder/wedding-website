// ── Celebration seed data ───────────────────────────────────────────────────
// Static copy + mock rows for Bachelorette, Bachelor, and Welcome Events. All
// three slot into the same CelebrationCanvas — the component reads nothing
// from any store, so these presets are the entire data layer for the prototype.

import { GlassWater, Martini, PartyPopper } from "lucide-react";
import type { CelebrationConfig } from "./CelebrationCanvas";

export const BACHELORETTE_CONFIG: CelebrationConfig = {
  type: "bachelorette",
  eyebrow: "WORKSPACE · CELEBRATIONS",
  icon: Martini,
  title: "Bachelorette",
  subtitle: "Planning — Scottsdale weekend, 14 guests",
  honoree: "Priya",
  organizerRole: "Maid of Honor",
  partyRole: "Bridesmaid",
  partnerName: "Arjun",
  headlineQuestion: "What's the weekend looking like?",
  headlineParagraph:
    "Three days in Scottsdale with Priya's closest friends. The house is booked, the spa is on hold, and RSVPs are almost all in.",
  statusLine:
    "Bachelorette is coming together — venue locked, 11 of 14 RSVPs in.",
  metrics: {
    guestsConfirmed: 11,
    guestsInvited: 14,
    nights: 3,
    activities: 5,
    budgetTotal: 8400,
    budgetCollected: 0,
  },
  vibeOptions: [
    { id: "spa", label: "Spa & slow mornings" },
    { id: "beach", label: "Beach or pool" },
    { id: "city", label: "City nightlife" },
    { id: "outdoor", label: "Outdoor adventure" },
    { id: "destination", label: "Destination trip" },
    { id: "lowkey", label: "Low-key — dinner and drinks" },
    { id: "custom", label: "Custom" },
  ],
  selectedVibeId: "spa",
  themeNote: "Desert spa weekend · soft neutrals, marigold accents",
  dressCode: [
    { label: "Arrivals", detail: "Cream & linen · easy travel" },
    { label: "Spa day", detail: "Robes or soft loungewear" },
    { label: "Sunset dinner", detail: "Blush, gold, or champagne tones" },
    { label: "Farewell brunch", detail: "Floral · garden-party" },
  ],
  preferences: {
    loves: [
      "Sunrise hike the first morning",
      "Spa day — nothing rushed",
      "Matching pajamas for the group photo",
      "Paloma bar, long dinner, everyone together",
    ],
    avoids: [
      "No surprise strippers — not her thing",
      "Nothing too wild the night before the flight home",
      "Please keep social posts tasteful (she's in HR leadership)",
    ],
  },
  guests: [
    { name: "Priya Rao", status: "confirmed", note: "Bride" },
    { name: "Anika Shah", status: "confirmed", note: "Maid of honor · planning lead" },
    { name: "Meera Iyer", status: "confirmed" },
    { name: "Divya Patel", status: "confirmed" },
    { name: "Tara Menon", status: "confirmed" },
    { name: "Kavya Joshi", status: "confirmed" },
    { name: "Nisha Banerjee", status: "confirmed", note: "Flying in from NYC" },
    { name: "Sanjana Krishnan", status: "confirmed" },
    { name: "Pooja Reddy", status: "confirmed" },
    { name: "Riya Kapoor", status: "confirmed" },
    { name: "Shreya Malhotra", status: "confirmed" },
    { name: "Aarti Desai", status: "invited", note: "Awaiting reply" },
    { name: "Ishani Gupta", status: "invited" },
    { name: "Leena Varma", status: "invited", note: "Childcare TBD" },
  ],
  itinerary: [
    {
      day: "Fri · Jun 14",
      label: "Arrivals & welcome",
      items: [
        {
          time: "3:00 PM",
          title: "House check-in",
          note: "Mountainside villa, 6 bedrooms",
        },
        {
          time: "7:30 PM",
          title: "Welcome dinner on the terrace",
          note: "Catered small-plates, paloma bar",
        },
      ],
    },
    {
      day: "Sat · Jun 15",
      label: "Spa & sunset",
      items: [
        { time: "10:00 AM", title: "Yoga on the deck" },
        {
          time: "12:30 PM",
          title: "Spa day",
          note: "Four Seasons, private cabana",
        },
        {
          time: "7:00 PM",
          title: "Desert sunset dinner",
          note: "Private chef, long table setup",
        },
      ],
    },
    {
      day: "Sun · Jun 16",
      label: "Slow morning",
      items: [
        {
          time: "10:00 AM",
          title: "Brunch & goodbyes",
          note: "Floral brunch at the villa",
        },
      ],
    },
  ],
  inspiration: [
    { id: "1", label: "Desert tablescape", tag: "Decor" },
    { id: "2", label: "Paloma bar setup", tag: "Bar" },
    { id: "3", label: "Sunset dress code", tag: "Looks" },
    { id: "4", label: "Villa courtyard", tag: "Venue" },
    { id: "5", label: "Welcome bag ideas", tag: "Favors" },
    { id: "6", label: "Floral brunch", tag: "Food" },
  ],
  documents: [
    {
      id: "bette-house",
      title: "Mountainside Villa — reservation",
      kind: "Contract",
      status: "signed",
      note: "Three nights · $4,200 · deposit paid",
    },
    {
      id: "bette-spa",
      title: "Four Seasons Spa — booking confirmation",
      kind: "Confirmation",
      status: "held",
      note: "Private cabana, 10 treatments",
    },
    {
      id: "bette-chef",
      title: "Private chef — menu proposal",
      kind: "Proposal",
      status: "review",
      note: "Needs final headcount by May 30",
    },
    {
      id: "bette-roster",
      title: "Flight roster · group spreadsheet",
      kind: "Sheet",
      status: "draft",
    },
  ],
};

export const BACHELOR_CONFIG: CelebrationConfig = {
  type: "bachelor",
  eyebrow: "WORKSPACE · CELEBRATIONS",
  icon: GlassWater,
  title: "Bachelor",
  subtitle: "Planning — Lake Tahoe, 10 guests",
  honoree: "Arjun",
  organizerRole: "Best Man",
  partyRole: "Groomsman",
  partnerName: "Priya",
  headlineQuestion: "How's the Tahoe trip shaping up?",
  headlineParagraph:
    "Long weekend on the lake with Arjun's brothers and close friends. House rental confirmed; the boat charter needs a call.",
  statusLine:
    "Bachelor is almost there — house booked, 7 of 10 RSVPs in, boat charter pending.",
  metrics: {
    guestsConfirmed: 7,
    guestsInvited: 10,
    nights: 3,
    activities: 4,
    budgetTotal: 6200,
    budgetCollected: 0,
  },
  vibeOptions: [
    { id: "notheme", label: "No theme — just a good time" },
    { id: "sports", label: "Sports weekend (golf, game, racing)" },
    { id: "outdoor", label: "Outdoor adventure (fishing, hiking, camping)" },
    { id: "city", label: "City nightlife" },
    { id: "destination", label: "Destination trip" },
    { id: "lowkey", label: "Low-key — dinner and drinks" },
    { id: "custom", label: "Custom" },
  ],
  selectedVibeId: "outdoor",
  themeNote: "Lake weekend · fishing, poker, slow mornings",
  dressCode: [
    { label: "Arrivals", detail: "Whatever you drove in — jeans are fine" },
    { label: "Boat day", detail: "Swim trunks · sun shirts · caps" },
    { label: "Poker night", detail: "Collared if you've got one" },
    { label: "Send-off brunch", detail: "Come as you are" },
  ],
  preferences: {
    loves: [
      "Good steak and a whiskey tasting",
      "Morning fishing — even if nothing bites",
      "Poker night with real chips",
      "Something active during the day",
    ],
    avoids: [
      "Nothing that would upset Priya",
      "No strip clubs",
      "Don't book anything before 10 AM",
      "No embarrassing social media posts",
    ],
  },
  guests: [
    { name: "Arjun Mehta", status: "confirmed", note: "Groom" },
    { name: "Vikram Mehta", status: "confirmed", note: "Best man · brother" },
    { name: "Karan Joshi", status: "confirmed" },
    { name: "Rohan Kapoor", status: "confirmed" },
    { name: "Devansh Rao", status: "confirmed" },
    { name: "Siddharth Banerjee", status: "confirmed" },
    { name: "Aditya Sharma", status: "confirmed" },
    { name: "Nikhil Iyer", status: "invited", note: "Flight TBD" },
    { name: "Varun Desai", status: "invited" },
    { name: "Raghav Malhotra", status: "invited" },
  ],
  itinerary: [
    {
      day: "Fri · Jul 12",
      label: "Roll in",
      items: [
        { time: "4:00 PM", title: "House check-in", note: "Lakefront, hot tub" },
        { time: "8:00 PM", title: "First-night BBQ", note: "Grilling on the deck" },
      ],
    },
    {
      day: "Sat · Jul 13",
      label: "Lake day",
      items: [
        {
          time: "10:00 AM",
          title: "Boat charter",
          note: "Need to confirm — 8 hour block",
        },
        {
          time: "6:00 PM",
          title: "Poker & dinner",
          note: "Catered by Truckee smokehouse",
        },
      ],
    },
    {
      day: "Sun · Jul 14",
      label: "Easy send-off",
      items: [
        { time: "10:00 AM", title: "Brunch at the house" },
        { time: "1:00 PM", title: "Check-out" },
      ],
    },
  ],
  inspiration: [
    { id: "1", label: "Lakefront deck setup", tag: "Venue" },
    { id: "2", label: "Bourbon tasting flight", tag: "Bar" },
    { id: "3", label: "Poker night kit", tag: "Games" },
    { id: "4", label: "Truckee smokehouse menu", tag: "Food" },
  ],
  documents: [
    {
      id: "bach-house",
      title: "Lakefront rental — booking receipt",
      kind: "Receipt",
      status: "signed",
      note: "Three nights · $2,800 · paid in full",
    },
    {
      id: "bach-boat",
      title: "Boat charter — quote",
      kind: "Quote",
      status: "review",
      note: "$1,200 · 8-hour block · deposit by Jun 1",
    },
    {
      id: "bach-smoke",
      title: "Truckee Smokehouse — catering order",
      kind: "Order",
      status: "held",
      note: "Sat dinner, 10 people",
    },
    {
      id: "bach-rideshare",
      title: "Rideshare / drop-off plan",
      kind: "Note",
      status: "draft",
    },
  ],
};

export const WELCOME_EVENTS_CONFIG: CelebrationConfig = {
  type: "welcome",
  eyebrow: "WORKSPACE · CELEBRATIONS",
  icon: PartyPopper,
  title: "Welcome Events",
  subtitle: "Planning — 2 gatherings for out-of-town guests",
  honoree: "Priya & Arjun",
  organizerRole: "Host",
  partyRole: "Host team",
  headlineQuestion: "How do we ease everyone into the week?",
  headlineParagraph:
    "A Thursday welcome dinner for out-of-town guests and a Friday morning brunch before the Mehendi. Both need venue confirmation.",
  statusLine:
    "Welcome Events need attention — 2 venues in review, guest list not yet locked.",
  metrics: {
    guestsConfirmed: 48,
    guestsInvited: 72,
    nights: 0,
    activities: 2,
    budgetTotal: 14000,
    budgetCollected: 0,
  },
  vibeOptions: [
    { id: "elegant", label: "Rooftop elegant · string lights" },
    { id: "garden", label: "Garden brunch · soft florals" },
    { id: "lounge", label: "Lounge & cocktails" },
    { id: "casual", label: "Casual dinner party" },
    { id: "custom", label: "Custom" },
  ],
  selectedVibeId: "elegant",
  themeNote: "Warm welcome · easy intros · nothing rigid",
  dressCode: [
    { label: "Welcome dinner", detail: "Smart casual · no formal required" },
    { label: "Pre-Mehendi brunch", detail: "Soft colors · florals encouraged" },
  ],
  preferences: {
    loves: [
      "Chai & coffee station early",
      "Name cards for the older relatives",
      "Short welcome toast from both families",
    ],
    avoids: [
      "No rigid seating chart — let people mix",
      "Nothing that runs past 11 PM (early wedding-week wake-ups)",
    ],
  },
  guests: [
    { name: "Mehta family (NYC)", status: "confirmed", note: "Party of 6" },
    { name: "Rao family (Bangalore)", status: "confirmed", note: "Party of 5" },
    { name: "Shah family (London)", status: "confirmed", note: "Party of 4" },
    { name: "Iyer family (SF)", status: "confirmed", note: "Party of 3" },
    { name: "Patel cousins (Houston)", status: "confirmed", note: "Party of 4" },
    { name: "Kapoor family (Delhi)", status: "confirmed", note: "Party of 5" },
    { name: "Desai family (Mumbai)", status: "invited", note: "Reply expected" },
    { name: "Joshi extended (Pune)", status: "invited", note: "Party of 8" },
  ],
  itinerary: [
    {
      day: "Thu · Sep 18",
      label: "Welcome dinner",
      items: [
        {
          time: "7:00 PM",
          title: "Rooftop dinner",
          note: "Venue: Kori or Saanjh — deciding",
        },
        {
          time: "10:00 PM",
          title: "Afterparty drinks",
          note: "Same venue, quieter corner",
        },
      ],
    },
    {
      day: "Fri · Sep 19",
      label: "Pre-Mehendi brunch",
      items: [
        {
          time: "10:30 AM",
          title: "Garden brunch",
          note: "Buffet-style, chai station",
        },
      ],
    },
  ],
  inspiration: [
    { id: "1", label: "Rooftop string lights", tag: "Decor" },
    { id: "2", label: "Chai station setup", tag: "Food" },
    { id: "3", label: "Welcome bag contents", tag: "Favors" },
    { id: "4", label: "Garden brunch tablescape", tag: "Decor" },
  ],
  documents: [
    {
      id: "welc-kori",
      title: "Kori rooftop — proposal",
      kind: "Proposal",
      status: "review",
      note: "$8,500 · 72 guests · awaiting revision",
    },
    {
      id: "welc-saanjh",
      title: "Saanjh — quote",
      kind: "Quote",
      status: "review",
      note: "$7,200 · smaller terrace",
    },
    {
      id: "welc-brunch",
      title: "Garden brunch — caterer list",
      kind: "Shortlist",
      status: "draft",
    },
  ],
};
