// Venue profile data — what the venue edits, and how couples see it on Ananya.
// Separate from the dashboard seed (lib/venue/seed.ts) so the two screens can evolve independently.

export type VenueType =
  | "Hotel"
  | "Banquet Hall"
  | "Estate"
  | "Resort"
  | "Country Club"
  | "Restaurant"
  | "Outdoor Venue"
  | "Other";

export type SpaceType = "Indoor" | "Outdoor" | "Indoor + Outdoor";

export type EventSpace = {
  id: string;
  name: string;
  type: SpaceType;
  floor: string;
  sqft: number;
  capacity: {
    ceremony: number;
    reception: number;
    cocktail: number;
  };
  features: string[];
  photoUrls: string[];
};

export type AmenityAnswer = "yes" | "no" | "ask";

export type Amenity = {
  id: string;
  label: string;
  answer: AmenityAnswer;
  detail?: string; // e.g. "120 rooms" on accommodation
  note?: string; // e.g. "Fire ceremony allowed in Grand Ballroom with advance notice."
};

export type AmenityGroup = {
  id: string;
  title: string;
  items: Amenity[];
};

export type GalleryPhoto = {
  id: string;
  url: string;
  caption?: string;
  spaceId?: string;
  source: "marketing" | "instagram";
  featured?: boolean;
  hidden?: boolean;
  instagramHandle?: string;
};

export type PricingTier = {
  id: string;
  name: string;
  priceLow: number;
  priceHigh: number;
  fbMinimum?: number;
  includes: string;
};

export type CalendarStatus = "available" | "booked" | "hold" | "blocked";

export type CalendarDay = {
  date: string; // YYYY-MM-DD
  status: CalendarStatus;
  coupleNames?: string;
  eventType?: string;
};

export type VenueProfile = {
  basics: {
    name: string;
    tagline: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    description: string;
    email: string;
    phone: string;
    website: string;
    instagram: string;
    type: VenueType;
  };
  spaces: EventSpace[];
  amenityGroups: AmenityGroup[];
  seasonalNotes: {
    peak: string;
    offPeak: string;
    holiday: string;
  };
  pricingTiers: PricingTier[];
  gallery: GalleryPhoto[];
  virtualTourUrl: string;
  floorPlans: { id: string; label: string; url: string }[];
  calendar: CalendarDay[];
};

// -------------------- Seed: The Legacy Castle ------------------------------

export const PROFILE: VenueProfile = {
  basics: {
    name: "The Legacy Castle",
    tagline: "A Timeless Estate for Grand Celebrations",
    address: "299 Paterson Hamburg Turnpike",
    city: "Pompton Plains",
    state: "NJ",
    zip: "07444",
    description:
      "Set atop 20 manicured acres, The Legacy Castle is a stone-built estate reimagined for South Asian celebrations of every tradition. Sweeping ballrooms, a covered garden terrace, and a private courtyard let a single wedding weekend move seamlessly from baraat to mehndi to reception — without ever leaving the property.\n\nOur in-house team has hosted over 120 South Asian weddings, and we collaborate with the region's most trusted Indian caterers, florists, and priests. From mandap rigging and dhol processions to 48-hour sangeet-to-brunch packages, the property is engineered for the rhythm of a multi-day celebration.",
    email: "events@legacycastle.com",
    phone: "(973) 595-0006",
    website: "https://thelegacycastle.com",
    instagram: "@thelegacycastle",
    type: "Estate",
  },

  spaces: [
    {
      id: "grand-ballroom",
      name: "Grand Ballroom",
      type: "Indoor",
      floor: "1st",
      sqft: 8000,
      capacity: { ceremony: 500, reception: 450, cocktail: 600 },
      features: [
        "Built-in stage",
        "Chandeliers",
        "Dance floor",
        "AV system",
        "Adjustable lighting",
      ],
      photoUrls: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      id: "garden-terrace",
      name: "Garden Terrace",
      type: "Outdoor",
      floor: "Ground",
      sqft: 6000,
      capacity: { ceremony: 400, reception: 350, cocktail: 500 },
      features: [
        "Covered pavilion option",
        "String lights",
        "Water feature",
        "Sunset view",
      ],
      photoUrls: [
        "https://images.unsplash.com/photo-1470216639136-1cf2e63385ff?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      id: "courtyard",
      name: "Courtyard",
      type: "Outdoor",
      floor: "Ground",
      sqft: 3500,
      capacity: { ceremony: 250, reception: 180, cocktail: 300 },
      features: [
        "Fountain centerpiece",
        "Stone paving",
        "Mandap-ready anchor points",
        "Private gated entry",
      ],
      photoUrls: [
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522413452208-996ff3f3e740?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      id: "indoor-pavilion",
      name: "Indoor Pavilion",
      type: "Indoor",
      floor: "1st",
      sqft: 4200,
      capacity: { ceremony: 280, reception: 240, cocktail: 325 },
      features: [
        "Floor-to-ceiling windows",
        "Climate controlled",
        "Retractable partitions",
        "Prep kitchen adjacent",
      ],
      photoUrls: [
        "https://images.unsplash.com/photo-1549451378-9f3e6d1c2d37?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  ],

  amenityGroups: [
    {
      id: "ceremony",
      title: "Ceremony Accommodations",
      items: [
        {
          id: "baraat-route",
          label: "Baraat route available (horse/car path to entrance)",
          answer: "yes",
          note: "Main carriage drive accommodates horse, elephant, and vintage-car baraats.",
        },
        { id: "fire-indoor", label: "Fire ceremony (havan/homa) allowed indoors", answer: "yes", note: "Grand Ballroom with advance notice — venue provides protective flooring." },
        { id: "fire-outdoor", label: "Fire ceremony allowed outdoors only", answer: "no" },
        { id: "mandap-support", label: "Mandap setup area with structural support", answer: "yes" },
        { id: "anand-karaj", label: "Anand Karaj / Guru Granth Sahib accommodation space", answer: "yes", note: "Dedicated reading room + covered head requirement enforced by staff." },
        { id: "nikah", label: "Nikah / Muslim ceremony setup available", answer: "yes" },
        { id: "church", label: "Church / chapel on property for Christian ceremonies", answer: "no" },
        { id: "multi-setup", label: "Multiple ceremony setup options (indoor + outdoor)", answer: "yes" },
        { id: "parallel-events", label: "Separate spaces for simultaneous events", answer: "yes", note: "Mehndi can run in the Courtyard while ceremony setup happens in the Ballroom." },
      ],
    },
    {
      id: "dining",
      title: "Dining & Catering",
      items: [
        { id: "outside-catering", label: "Outside catering permitted", answer: "yes", note: "Preferred partner list available; outside caterers require kitchen walk-through." },
        { id: "in-house-only", label: "In-house catering only", answer: "no" },
        { id: "kosher-halal", label: "Kosher/Halal kitchen available", answer: "yes" },
        { id: "jain", label: "Vegetarian / Jain cooking capabilities (no onion/garlic)", answer: "yes", note: "Dedicated sattvik prep station with separate utensils." },
        { id: "food-stations", label: "Multiple food stations / buffet setup space", answer: "yes" },
        { id: "live-cooking", label: "Live cooking stations permitted", answer: "yes" },
        { id: "separate-bar", label: "Separate bar area", answer: "yes" },
      ],
    },
    {
      id: "logistics",
      title: "Logistics",
      items: [
        { id: "rooms", label: "On-site accommodation (room block available)", answer: "yes", detail: "120 rooms" },
        { id: "bridal-suite", label: "Bridal suite", answer: "yes" },
        { id: "groom-suite", label: "Groom's suite / Baraat staging room", answer: "yes" },
        { id: "vendor-rooms", label: "Vendor changing / prep rooms", answer: "yes" },
        { id: "loading-dock", label: "Loading dock for decor / rental delivery", answer: "yes" },
        { id: "parking", label: "Ample parking", answer: "yes", detail: "300 spaces" },
        { id: "valet", label: "Valet service available", answer: "yes" },
        { id: "helipad", label: "Helicopter landing pad", answer: "no" },
        { id: "ada", label: "ADA accessible", answer: "yes" },
      ],
    },
    {
      id: "sound",
      title: "Sound & Timing",
      items: [
        { id: "noise-cutoff", label: "Noise ordinance cutoff", answer: "yes", detail: "11:00 PM" },
        { id: "sound-system", label: "Sound system available for Sangeet / DJ", answer: "yes" },
        { id: "dhol", label: "Dhol / live drums permitted", answer: "yes", note: "Indoor amplification capped at noise ordinance; outdoor dhol permitted until 10 PM." },
        { id: "fireworks", label: "Fireworks / sparklers allowed outdoors", answer: "yes", note: "Cold sparks permitted indoors; open-flame fireworks require 60-day notice and licensed pyro." },
        { id: "early-muhurat", label: "Early morning ceremony start available (for muhurat timing)", answer: "yes" },
      ],
    },
    {
      id: "multiday",
      title: "Multi-Day",
      items: [
        { id: "multiday-package", label: "Multi-day event packages available", answer: "yes" },
        { id: "max-days", label: "Maximum consecutive days", answer: "yes", detail: "4 days" },
        { id: "multiday-discount", label: "Discounted room block for multi-day", answer: "yes" },
        { id: "holds", label: "Space holds between events (no tear-down required overnight)", answer: "yes" },
      ],
    },
  ],

  seasonalNotes: {
    peak: "May–June, Sept–Nov (+20%)",
    offPeak: "Jan–Mar, Jul–Aug (standard)",
    holiday: "Holiday weekends +30%",
  },

  pricingTiers: [
    {
      id: "weekend",
      name: "Weekend Package (Fri–Sun)",
      priceLow: 75000,
      priceHigh: 120000,
      fbMinimum: 45000,
      includes:
        "Grand Ballroom + Garden Terrace for 3 days, 100-room block, bridal + groom suites, valet, security",
    },
    {
      id: "saturday",
      name: "Saturday Only",
      priceLow: 35000,
      priceHigh: 65000,
      fbMinimum: 25000,
      includes: "Grand Ballroom OR Garden Terrace, 50-room block",
    },
    {
      id: "ceremony",
      name: "Ceremony Only",
      priceLow: 15000,
      priceHigh: 25000,
      includes: "Garden Terrace for 4 hours, chairs, basic AV",
    },
  ],

  gallery: [
    // Marketing photos — venue's own
    { id: "mk-1", source: "marketing", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80", caption: "Grand Ballroom at dusk", spaceId: "grand-ballroom", featured: true },
    { id: "mk-2", source: "marketing", url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80", caption: "Chandelier detail", spaceId: "grand-ballroom" },
    { id: "mk-3", source: "marketing", url: "https://images.unsplash.com/photo-1470216639136-1cf2e63385ff?auto=format&fit=crop&w=1600&q=80", caption: "Garden Terrace pavilion", spaceId: "garden-terrace", featured: true },
    { id: "mk-4", source: "marketing", url: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1600&q=80", caption: "String-lit garden at night", spaceId: "garden-terrace" },
    { id: "mk-5", source: "marketing", url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80", caption: "Courtyard fountain", spaceId: "courtyard" },
    { id: "mk-6", source: "marketing", url: "https://images.unsplash.com/photo-1522413452208-996ff3f3e740?auto=format&fit=crop&w=1600&q=80", caption: "Stone archway entrance", spaceId: "courtyard" },
    { id: "mk-7", source: "marketing", url: "https://images.unsplash.com/photo-1549451378-9f3e6d1c2d37?auto=format&fit=crop&w=1600&q=80", caption: "Indoor Pavilion daylight", spaceId: "indoor-pavilion" },
    { id: "mk-8", source: "marketing", url: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1600&q=80", caption: "Reception setup", spaceId: "grand-ballroom" },

    // Instagram-sourced wedding photos (auto-populated)
    { id: "ig-1", source: "instagram", instagramHandle: "@radzevents", url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80", caption: "Priya & Arjun mandap", spaceId: "grand-ballroom", featured: true },
    { id: "ig-2", source: "instagram", instagramHandle: "@radzevents", url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80", caption: "Baraat arrival" },
    { id: "ig-3", source: "instagram", instagramHandle: "@cgandcoevents", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=80", caption: "Mehndi in the courtyard", spaceId: "courtyard" },
    { id: "ig-4", source: "instagram", instagramHandle: "@cgandcoevents", url: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=1600&q=80", caption: "Sangeet stage lighting", spaceId: "grand-ballroom" },
    { id: "ig-5", source: "instagram", instagramHandle: "@studiostills", url: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1600&q=80", caption: "First look on the terrace", spaceId: "garden-terrace" },
    { id: "ig-6", source: "instagram", instagramHandle: "@studiostills", url: "https://images.unsplash.com/photo-1464207687429-7505649dae38?auto=format&fit=crop&w=1600&q=80", caption: "Couple portraits at the fountain", spaceId: "courtyard" },
    { id: "ig-7", source: "instagram", instagramHandle: "@wedmegood", url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1600&q=80", caption: "Jaimala exchange", spaceId: "grand-ballroom" },
    { id: "ig-8", source: "instagram", instagramHandle: "@wedmegood", url: "https://images.unsplash.com/photo-1519741347686-c1e331fcb4d5?auto=format&fit=crop&w=1600&q=80", caption: "Haldi ceremony", spaceId: "courtyard" },
    { id: "ig-9", source: "instagram", instagramHandle: "@radzevents", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80", caption: "Reception first dance", spaceId: "grand-ballroom" },
    { id: "ig-10", source: "instagram", instagramHandle: "@cgandcoevents", url: "https://images.unsplash.com/photo-1521490878406-521b9a2e9bc8?auto=format&fit=crop&w=1600&q=80", caption: "Sangeet performance", spaceId: "grand-ballroom" },
    { id: "ig-11", source: "instagram", instagramHandle: "@studiostills", url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1600&q=80", caption: "Dhol procession", hidden: true },
    { id: "ig-12", source: "instagram", instagramHandle: "@wedmegood", url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1600&q=80", caption: "Bride and bridesmaids", spaceId: "grand-ballroom" },
    { id: "ig-13", source: "instagram", instagramHandle: "@radzevents", url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80", caption: "Garden ceremony aisle", spaceId: "garden-terrace" },
    { id: "ig-14", source: "instagram", instagramHandle: "@cgandcoevents", url: "https://images.unsplash.com/photo-1525772764200-be829a350797?auto=format&fit=crop&w=1600&q=80", caption: "Vidai moment" },
    { id: "ig-15", source: "instagram", instagramHandle: "@studiostills", url: "https://images.unsplash.com/photo-1503516459261-40c66117780a?auto=format&fit=crop&w=1600&q=80", caption: "Cocktail hour on the terrace", spaceId: "garden-terrace" },
    { id: "ig-16", source: "instagram", instagramHandle: "@wedmegood", url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1600&q=80", caption: "Reception dance floor", spaceId: "grand-ballroom" },
  ],

  virtualTourUrl: "https://my.matterport.com/show/?m=legacycastle",
  floorPlans: [
    { id: "fp-1", label: "Grand Ballroom — reception layout", url: "#" },
    { id: "fp-2", label: "Garden Terrace — ceremony layout", url: "#" },
    { id: "fp-3", label: "Estate overview", url: "#" },
  ],

  calendar: buildCalendar(),
};

// Builds Oct 2026 – Mar 2027 (6 months) with booked/hold marks matching upcoming weddings.
function buildCalendar(): CalendarDay[] {
  const days: CalendarDay[] = [];
  const marks: Record<string, { status: CalendarStatus; couple?: string; event?: string }> = {
    // Booked (12)
    "2026-10-15": { status: "booked", couple: "Priya & Arjun", event: "Sangeet" },
    "2026-10-16": { status: "booked", couple: "Priya & Arjun", event: "Mehndi + Ceremony" },
    "2026-10-17": { status: "booked", couple: "Priya & Arjun", event: "Reception" },
    "2026-10-22": { status: "booked", couple: "Sarah & Mike", event: "Wedding" },
    "2026-11-08": { status: "booked", couple: "Neha & Vikram", event: "Sangeet + Haldi" },
    "2026-11-09": { status: "booked", couple: "Neha & Vikram", event: "Ceremony" },
    "2026-11-10": { status: "booked", couple: "Neha & Vikram", event: "Reception" },
    "2026-12-05": { status: "booked", couple: "Holiday Corporate" },
    "2026-12-31": { status: "booked", couple: "NYE Gala" },
    "2027-01-16": { status: "booked", couple: "Aditi & Ravi", event: "Wedding" },
    "2027-02-13": { status: "booked", couple: "Maya & James", event: "Wedding" },
    "2027-03-06": { status: "booked", couple: "Tara & Omar", event: "Wedding" },

    // Holds (3)
    "2026-10-29": { status: "hold", couple: "Leela & Kunal", event: "Tentative" },
    "2026-11-21": { status: "hold", couple: "Anika & Sam", event: "Tentative" },
    "2027-03-20": { status: "hold", couple: "Simran & Dev", event: "Tentative" },
  };

  // 6 months starting Oct 2026
  const months: Array<{ year: number; month: number }> = [
    { year: 2026, month: 9 },
    { year: 2026, month: 10 },
    { year: 2026, month: 11 },
    { year: 2027, month: 0 },
    { year: 2027, month: 1 },
    { year: 2027, month: 2 },
  ];

  for (const m of months) {
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${m.year}-${String(m.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const mark = marks[iso];
      if (mark) {
        days.push({
          date: iso,
          status: mark.status,
          coupleNames: mark.couple,
          eventType: mark.event,
        });
      } else {
        days.push({ date: iso, status: "available" });
      }
    }
  }
  return days;
}
