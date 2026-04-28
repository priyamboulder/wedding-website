// Portfolio items for the vendor portfolio manager.
// An "item" is one piece of work a vendor wants to show: a single image, a
// full gallery from a wedding, or a video (YouTube/Vimeo). Cover media can be
// a gradient swatch (for seed rows that don't ship real files) or a data URL
// from an uploaded image.

export type PortfolioEventType =
  | "Haldi"
  | "Mehendi"
  | "Sangeet"
  | "Ceremony"
  | "Reception"
  | "Engagement"
  | "Portrait";

export const EVENT_TYPES: PortfolioEventType[] = [
  "Haldi",
  "Mehendi",
  "Sangeet",
  "Ceremony",
  "Reception",
  "Engagement",
  "Portrait",
];

export const STYLE_TAGS = [
  "Editorial",
  "Candid",
  "Destination",
  "Palace",
  "Intimate",
  "Traditional",
  "Contemporary",
  "Fine-art",
  "Film",
] as const;

export type PortfolioMedia =
  | { kind: "swatch"; from: string; to?: string }
  | { kind: "image"; src: string }; // data URL or remote

export type PortfolioItem = {
  id: string;
  kind: "image" | "gallery" | "video";
  title: string;
  description?: string;
  eventTypes: PortfolioEventType[];
  styleTags: string[];
  coupleLink?: string; // link to couple's Ananya workspace
  media: PortfolioMedia[]; // cover is media[0]; galleries have many
  videoUrl?: string; // YouTube/Vimeo
  takenAt?: string; // "May 2025"
  venue?: string;
};

export const FEATURED_COUNT = 4;

export const PORTFOLIO_SEED: PortfolioItem[] = [
  {
    id: "p1",
    kind: "gallery",
    title: "Sharma-Patel Wedding",
    description:
      "Three ceremonies over five days at the Taj Lake Palace — shot on medium format.",
    eventTypes: ["Mehendi", "Sangeet", "Ceremony", "Reception"],
    styleTags: ["Editorial", "Palace", "Destination"],
    coupleLink: "/app/sharma-patel",
    media: [
      { kind: "swatch", from: "#C97B63", to: "#5B3A2A" },
      { kind: "swatch", from: "#D4A24C" },
      { kind: "swatch", from: "#F0E4C8" },
      { kind: "swatch", from: "#9a4a30" },
      { kind: "swatch", from: "#B8860B" },
      { kind: "swatch", from: "#7a5a16" },
    ],
    takenAt: "May 2025",
    venue: "Taj Lake Palace, Udaipur",
  },
  {
    id: "p2",
    kind: "image",
    title: "The first look, bridal portrait",
    description: "Grand Hyatt Mumbai. Natural light, no flash.",
    eventTypes: ["Portrait", "Ceremony"],
    styleTags: ["Editorial", "Fine-art"],
    media: [{ kind: "swatch", from: "#D4A24C", to: "#1a1a1a" }],
    takenAt: "Mar 2026",
  },
  {
    id: "p3",
    kind: "gallery",
    title: "Anjali & Rahul — Sangeet",
    description: "Choreographed set pieces and the candid hour after.",
    eventTypes: ["Sangeet"],
    styleTags: ["Candid", "Contemporary"],
    coupleLink: "/app/anjali-rahul",
    media: [
      { kind: "swatch", from: "#5B8E8A", to: "#2a3a3a" },
      { kind: "swatch", from: "#9CAF88" },
      { kind: "swatch", from: "#DCE9E7" },
      { kind: "swatch", from: "#3a6b67" },
    ],
    takenAt: "Feb 2026",
    venue: "Grand Hyatt, Mumbai",
  },
  {
    id: "p4",
    kind: "video",
    title: "Devika & Sameer — highlight film",
    description: "90-second cut, shot on the Sony FX3.",
    eventTypes: ["Ceremony", "Reception"],
    styleTags: ["Film", "Editorial"],
    media: [{ kind: "swatch", from: "#1a1a1a", to: "#7a5a16" }],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    takenAt: "Feb 2026",
  },
  {
    id: "p5",
    kind: "gallery",
    title: "Nisha & Arman — Mehendi morning",
    description: "Poolside mehendi at ITC Grand Goa.",
    eventTypes: ["Mehendi"],
    styleTags: ["Candid", "Intimate", "Destination"],
    media: [
      { kind: "swatch", from: "#DDA08A", to: "#9a4a30" },
      { kind: "swatch", from: "#F5E0D6" },
      { kind: "swatch", from: "#C97B63" },
    ],
    takenAt: "Dec 2025",
    venue: "ITC Grand Goa",
  },
  {
    id: "p6",
    kind: "image",
    title: "Grandmother at the Haldi",
    eventTypes: ["Haldi", "Portrait"],
    styleTags: ["Candid", "Fine-art"],
    media: [{ kind: "swatch", from: "#F0E4C8", to: "#B8860B" }],
    takenAt: "Oct 2025",
  },
  {
    id: "p7",
    kind: "gallery",
    title: "Kavya & Neel — full wedding",
    description: "Two days, one photographer, 198 selects.",
    eventTypes: ["Ceremony", "Reception", "Sangeet"],
    styleTags: ["Editorial", "Traditional"],
    coupleLink: "/app/kavya-neel",
    media: [
      { kind: "swatch", from: "#5B8E8A", to: "#1a1a1a" },
      { kind: "swatch", from: "#B8860B" },
      { kind: "swatch", from: "#F5F1E8" },
      { kind: "swatch", from: "#4a6b3a" },
      { kind: "swatch", from: "#E8F0E0" },
    ],
    takenAt: "Nov 2025",
    venue: "Leela Palace, Bangalore",
  },
  {
    id: "p8",
    kind: "image",
    title: "Mandap, lit only by diyas",
    eventTypes: ["Ceremony"],
    styleTags: ["Fine-art", "Traditional"],
    media: [{ kind: "swatch", from: "#7a5a16", to: "#1a1a1a" }],
    takenAt: "Aug 2025",
  },
];
