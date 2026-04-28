// Mock content for the venue marketing module: spotlights, vendor co-marketing,
// testimonials, and upcoming open-house events.

import type { CeremonyType } from "@/lib/venue/seed";

export type SpotlightFormat =
  | "instagram-post"
  | "instagram-story"
  | "blog-post"
  | "email-newsletter"
  | "pinterest-pin";

export type WeddingSpotlight = {
  id: string;
  coupleNames: string;
  dateLabel: string; // "Oct 2025"
  ceremonyType: CeremonyType;
  duration: string;
  guestCount: number;
  space: string;
  headlineCopy: string; // body used by every format
  photoCollage: string[]; // 4 image urls
  vendorCredits: { role: string; name: string; handle: string }[];
  palette: string; // "gold and red"
};

export type VendorCoMarketing = {
  id: string;
  vendorName: string;
  vendorCategory: string;
  vendorHandle: string;
  weddingsAtVenue: number;
  tagline: string;
  body: string;
  photos: string[];
  sharedWith: string[]; // platforms
  status: "draft" | "ready";
};

export type Testimonial = {
  id: string;
  coupleNames: string;
  dateLabel: string; // "Married Oct 2025"
  ceremonyType: CeremonyType;
  rating: number; // 1-5
  quote: string;
  featured: boolean;
  source: "Ananya Review" | "Google" | "The Knot";
};

export type ReviewRequest = {
  id: string;
  coupleNames: string;
  daysSinceWedding: number;
  status: "unsent" | "sent" | "no-response";
  lastAction?: string;
};

export type OpenHouseEvent = {
  id: string;
  title: string;
  date: string; // "Nov 15, 2026"
  time: string; // "2pm – 5pm"
  daysAway: number;
  description: string;
  participatingVendors: { name: string; category: string }[];
  rsvp: {
    confirmed: number;
    interested: number;
    capacity: number;
  };
  status: "draft" | "live" | "past";
  audience: string; // "Ananya couples browsing NJ venues"
};

export const SPOTLIGHTS: WeddingSpotlight[] = [
  {
    id: "priya-arjun",
    coupleNames: "Priya & Arjun",
    dateLabel: "Oct 2025",
    ceremonyType: "Hindu",
    duration: "3-day",
    guestCount: 425,
    space: "Grand Ballroom",
    headlineCopy:
      "Priya & Arjun celebrated their love with a stunning 3-day Hindu wedding at The Legacy Castle. With 425 guests, the Grand Ballroom was transformed by Elegant Affairs into a breathtaking gold and red celebration. Photography by Stories by Joseph Radhik captured every moment.",
    photoCollage: [
      "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80",
    ],
    vendorCredits: [
      { role: "Photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjr" },
      { role: "Decor", name: "Elegant Affairs", handle: "@elegantaffairs" },
      { role: "Catering", name: "Mughal Mahal", handle: "@mughalmahaal" },
      { role: "DJ", name: "DJ Riz", handle: "@djriz" },
      { role: "HMUA", name: "Glam by Meena", handle: "@glambymeena" },
    ],
    palette: "gold and red",
  },
  {
    id: "rhea-anand",
    coupleNames: "Rhea & Anand",
    dateLabel: "Sep 2025",
    ceremonyType: "Hindu",
    duration: "2-day",
    guestCount: 400,
    space: "Garden Terrace",
    headlineCopy:
      "Rhea & Anand's garden wedding brought 400 guests into a soft mauve and ivory dreamscape. Design House transformed the Garden Terrace into a celebration of modern Hindu tradition.",
    photoCollage: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b3ce551?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80",
    ],
    vendorCredits: [
      { role: "Photography", name: "The Wedding Salad", handle: "@theweddingsalad" },
      { role: "Decor", name: "Design House", handle: "@designhousenj" },
      { role: "Catering", name: "Saffron Kitchen", handle: "@saffronkitchen" },
    ],
    palette: "mauve and ivory",
  },
  {
    id: "kiran-jaspreet",
    coupleNames: "Kiran & Jaspreet",
    dateLabel: "Jun 2025",
    ceremonyType: "Sikh",
    duration: "2-day",
    guestCount: 320,
    space: "Courtyard",
    headlineCopy:
      "Kiran & Jaspreet's Sikh wedding weekend opened in the Courtyard with 320 guests — a celebration rooted in tradition and set in motion by Elegant Affairs.",
    photoCollage: [
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b3ce551?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
    ],
    vendorCredits: [
      { role: "Photography", name: "Dot Dusk", handle: "@dotdusk" },
      { role: "Decor", name: "Elegant Affairs", handle: "@elegantaffairs" },
    ],
    palette: "saffron and white",
  },
];

export const VENDOR_COMARKETING: VendorCoMarketing[] = [
  {
    id: "elegant-affairs",
    vendorName: "Elegant Affairs",
    vendorCategory: "Decor",
    vendorHandle: "@elegantaffairs",
    weddingsAtVenue: 14,
    tagline:
      "See how Elegant Affairs transformed The Legacy Castle's Grand Ballroom across 14 weddings — from traditional red and gold to modern minimalist white.",
    body:
      "Over the past two years, Elegant Affairs has reimagined our Grand Ballroom for fourteen couples — each celebration a distinct vision. From the richly saffron palette of Priya & Arjun's Hindu wedding to the restrained, ivory-forward modern aesthetic of Rhea & Anand's reception, their range is what makes them a trusted partner.",
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=800&q=80",
    ],
    sharedWith: ["Instagram", "Ananya"],
    status: "ready",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "priya-arjun",
    coupleNames: "Priya & Arjun",
    dateLabel: "Married Oct 2025",
    ceremonyType: "Hindu",
    rating: 5,
    quote:
      "The Legacy Castle team was extraordinary. Every one of our 425 guests felt the care — from the way they held the Sangeet in the Courtyard at golden hour to how seamlessly the Ballroom turned over for the reception.",
    featured: true,
    source: "Ananya Review",
  },
  {
    id: "kiran-jaspreet",
    coupleNames: "Kiran & Jaspreet",
    dateLabel: "Married Jun 2025",
    ceremonyType: "Sikh",
    rating: 5,
    quote:
      "We toured five venues. The Legacy Castle was the only one where the team understood what a Sikh ceremony actually requires. That made all the difference.",
    featured: true,
    source: "Ananya Review",
  },
  {
    id: "rhea-anand",
    coupleNames: "Rhea & Anand",
    dateLabel: "Married Sep 2025",
    ceremonyType: "Hindu",
    rating: 5,
    quote:
      "The garden ceremony was exactly the picture we had in our heads for two years. We didn't have to translate.",
    featured: false,
    source: "Google",
  },
  {
    id: "tara-omar",
    coupleNames: "Tara & Omar",
    dateLabel: "Married Aug 2025",
    ceremonyType: "Fusion",
    rating: 5,
    quote:
      "As an interfaith couple we had a very specific flow in mind — a nikkah into a reception that honored both families. The venue team mapped it with us from the first walkthrough.",
    featured: false,
    source: "Ananya Review",
  },
];

export const REVIEW_REQUESTS: ReviewRequest[] = [
  {
    id: "deepa-kunal",
    coupleNames: "Deepa & Kunal",
    daysSinceWedding: 18,
    status: "unsent",
  },
  {
    id: "fatima-ali",
    coupleNames: "Fatima & Ali",
    daysSinceWedding: 24,
    status: "sent",
    lastAction: "Requested Sep 27",
  },
  {
    id: "jasleen-harpreet",
    coupleNames: "Jasleen & Harpreet",
    daysSinceWedding: 44,
    status: "no-response",
    lastAction: "Reminder sent Sep 20",
  },
];

export const OPEN_HOUSE: OpenHouseEvent = {
  id: "oh-nov-2026",
  title: "South Asian Wedding Open House",
  date: "Nov 15, 2026",
  time: "2pm – 5pm",
  daysAway: 43,
  description:
    "Couples planning 2027 weddings are invited for a private walk-through of the Grand Ballroom, Garden Terrace, and Courtyard — set up for a Hindu ceremony and reception. Meet our preferred planners, decorators, and photographers in the space.",
  participatingVendors: [
    { name: "Radz Events", category: "Planning" },
    { name: "Elegant Affairs", category: "Decor" },
    { name: "Stories by Joseph Radhik", category: "Photography" },
    { name: "Mughal Mahal", category: "Catering" },
    { name: "DJ Riz", category: "Music" },
  ],
  rsvp: { confirmed: 28, interested: 47, capacity: 60 },
  status: "live",
  audience: "Ananya couples browsing NJ venues · 300+ guest count",
};

export const SPOTLIGHT_FORMATS: { key: SpotlightFormat; label: string; sub: string }[] = [
  { key: "instagram-post", label: "Instagram Post", sub: "Square · caption" },
  { key: "instagram-story", label: "Instagram Story", sub: "9:16 vertical" },
  { key: "blog-post", label: "Blog Post", sub: "Long-form + gallery" },
  { key: "email-newsletter", label: "Email Newsletter", sub: "Hero block" },
  { key: "pinterest-pin", label: "Pinterest Pin", sub: "2:3 vertical" },
];
